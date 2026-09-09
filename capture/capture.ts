/**
 * Playwright capture for AmarJM marketing scenes S01–S13.
 *
 * `npm run capture` logs into the Frappe desk and writes every visual asset.
 * Runtime network targets come only from CAPTURE_BASE_URL / STOREFRONT_URL in .env.
 *
 * Operator-run only — do not invoke against a live site from CI.
 */

import 'dotenv/config';
import {
  chromium,
  devices,
  type Browser,
  type BrowserContext,
  type Cookie,
  type Page,
} from 'playwright';
import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import path from 'node:path';

/* --------------------------------- Types --------------------------------- */

type Viewport = {width: number; height: number};

type CaptureKind = 'png' | 'webm' | 'note';

type CaptureRecord = {
  scene: string;
  file: string;
  sourceUrl: string;
  capturedAt: string;
  viewport: Viewport;
  kind: CaptureKind;
};

type FrappeListResponse<T = Record<string, unknown>> = {
  data?: T[];
};

type DocRef = {
  name: string;
  raw: Record<string, unknown>;
};

/* -------------------------------- Paths ---------------------------------- */

const MANIFEST_PATH = path.join(process.cwd(), 'assets', 'manifest.json');
const SCREENS_DIR = path.join(process.cwd(), 'assets', 'screens');
const VIDEO_DIR = path.join(process.cwd(), 'assets', 'video');
const HIDE_CSS_PATH = path.join(__dirname, 'hide.css');

const DESKTOP_VIEWPORT: Viewport = {width: 1920, height: 1080};
const VIDEO_SIZE: Viewport = {width: 1920, height: 1080};
const COMPANY_DUBAI = 'Al Noor Jewellery - Dubai';

const desktopContextOptions = {
  viewport: DESKTOP_VIEWPORT,
  deviceScaleFactor: 2,
  locale: 'en',
  timezoneId: 'Asia/Dubai',
} as const;

/** Filled during the run; printed in the summary. */
let discoveredPosRoute: string | null = null;
let discoveredVatReportName: string | null = null;
let discoveredBarcodeField: string | null = null;

/* ------------------------------ Utilities -------------------------------- */

const requireEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required env ${key}`);
  }
  return value;
};

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const daysAgoIso = (days: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
};

const lastQuarterRange = (): {from: string; to: string} => {
  const now = new Date();
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const currentQuarter = Math.floor(month / 3);
  const lastQuarter = (currentQuarter + 3) % 4;
  const lastQuarterYear = currentQuarter === 0 ? year - 1 : year;
  const fromMonth = lastQuarter * 3;
  const toMonth = fromMonth + 2;
  const pad = (n: number) => String(n).padStart(2, '0');
  const lastDay = new Date(Date.UTC(lastQuarterYear, toMonth + 1, 0)).getUTCDate();
  return {
    from: `${lastQuarterYear}-${pad(fromMonth + 1)}-01`,
    to: `${lastQuarterYear}-${pad(toMonth + 1)}-${pad(lastDay)}`,
  };
};

const readManifest = async (): Promise<CaptureRecord[]> => {
  try {
    const raw = await readFile(MANIFEST_PATH, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CaptureRecord[]) : [];
  } catch {
    return [];
  }
};

const appendManifest = async (record: CaptureRecord): Promise<void> => {
  const manifest = await readManifest();
  manifest.push(record);
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
};

const appendNote = async (scene: string, note: string, sourceUrl = ''): Promise<void> => {
  await appendManifest({
    scene,
    file: note,
    sourceUrl,
    capturedAt: new Date().toISOString(),
    viewport: DESKTOP_VIEWPORT,
    kind: 'note',
  });
  console.warn(`[${scene}] note: ${note}`);
};

/* --------------------------- Page preparation ---------------------------- */

const hideAmarcpEmailNodes = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    const pattern = /@amarcp\.ae/i;
    const hide: Element[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let node = walker.nextNode();
    while (node) {
      const el = node as Element;
      const text = (el.textContent ?? '').trim();
      if (text && pattern.test(text) && text.length < 200) {
        hide.push(el);
      }
      node = walker.nextNode();
    }
    for (const el of hide) {
      (el as HTMLElement).style.setProperty('display', 'none', 'important');
      (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
    }
  });
};

const prepareForShot = async (page: Page): Promise<void> => {
  await page.addStyleTag({path: HIDE_CSS_PATH});
  await hideAmarcpEmailNodes(page);
  try {
    await page.waitForLoadState('networkidle', {timeout: 30_000});
  } catch {
    // Desk keeps websockets open; fall through to the fixed settle wait.
  }
  await page.waitForTimeout(800);
};

const capturePng = async (
  page: Page,
  opts: {scene: string; relativeFile: string; sourceUrl?: string},
): Promise<void> => {
  await prepareForShot(page);
  const outPath = path.join(SCREENS_DIR, opts.relativeFile);
  await mkdir(path.dirname(outPath), {recursive: true});
  await page.screenshot({path: outPath, fullPage: false});
  const viewport = page.viewportSize() ?? DESKTOP_VIEWPORT;
  await appendManifest({
    scene: opts.scene,
    file: `screens/${opts.relativeFile}`,
    sourceUrl: opts.sourceUrl ?? page.url(),
    capturedAt: new Date().toISOString(),
    viewport,
    kind: 'png',
  });
  console.log(`[${opts.scene}] png -> screens/${opts.relativeFile}`);
};

const gotoApp = async (page: Page, baseUrl: string, appPath: string): Promise<void> => {
  const root = baseUrl.replace(/\/$/, '');
  const pathPart = appPath.startsWith('/') ? appPath : `/${appPath}`;
  await page.goto(`${root}${pathPart}`, {waitUntil: 'domcontentloaded', timeout: 60_000});
};

/* ------------------------------ Frappe API ------------------------------- */

const login = async (context: BrowserContext, baseUrl: string): Promise<void> => {
  const usr = requireEnv('CAPTURE_USER');
  const pwd = requireEnv('CAPTURE_PASS');
  const root = baseUrl.replace(/\/$/, '');
  const res = await context.request.post(`${root}/api/method/login`, {
    form: {usr, pwd},
  });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Login failed (${res.status()}): ${body}`);
  }
  console.log('Logged in via POST /api/method/login');
};

/**
 * firstDoc(doctype, filters) → GET /api/resource/<doctype>?filters=…&limit_page_length=1
 * Never hardcodes document names.
 */
const firstDoc = async (
  context: BrowserContext,
  baseUrl: string,
  doctype: string,
  filters: unknown[] = [],
  fields: string[] = ['name'],
): Promise<DocRef | null> => {
  const root = baseUrl.replace(/\/$/, '');
  const params = new URLSearchParams();
  params.set('limit_page_length', '1');
  if (filters.length) {
    params.set('filters', JSON.stringify(filters));
  }
  if (fields.length) {
    params.set('fields', JSON.stringify(fields));
  }
  const url = `${root}/api/resource/${encodeURIComponent(doctype)}?${params.toString()}`;
  const res = await context.request.get(url);
  if (!res.ok()) {
    console.warn(`firstDoc(${doctype}) HTTP ${res.status()}`);
    return null;
  }
  const json = (await res.json()) as FrappeListResponse;
  const row = json.data?.[0];
  if (!row || typeof row.name !== 'string') {
    return null;
  }
  return {name: row.name, raw: row};
};

const getDoc = async (
  context: BrowserContext,
  baseUrl: string,
  doctype: string,
  name: string,
): Promise<Record<string, unknown> | null> => {
  const root = baseUrl.replace(/\/$/, '');
  const url = `${root}/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`;
  const res = await context.request.get(url);
  if (!res.ok()) {
    return null;
  }
  const json = (await res.json()) as {data?: Record<string, unknown>};
  return json.data ?? null;
};

/* ------------------------------ Video helper ----------------------------- */

const withVideoPage = async (
  browser: Browser,
  cookies: Cookie[],
  run: (page: Page) => Promise<void>,
  filename: string,
  scene: string,
): Promise<void> => {
  const tmpDir = path.join(VIDEO_DIR, '.tmp');
  await mkdir(tmpDir, {recursive: true});

  const context = await browser.newContext({
    ...desktopContextOptions,
    recordVideo: {dir: tmpDir, size: VIDEO_SIZE},
  });
  await context.addCookies(cookies);
  const page = await context.newPage();
  let sourceUrl = '';
  try {
    await run(page);
    sourceUrl = page.url();
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    if (video) {
      const tmpPath = await video.path();
      const dest = path.join(VIDEO_DIR, filename);
      await mkdir(path.dirname(dest), {recursive: true});
      await rename(tmpPath, dest);
      await appendManifest({
        scene,
        file: `video/${filename}`,
        sourceUrl,
        capturedAt: new Date().toISOString(),
        viewport: VIDEO_SIZE,
        kind: 'webm',
      });
      console.log(`[${scene}] webm -> video/${filename}`);
    }
  }
};

/* --------------------------- Report / POS helpers ------------------------ */

const setReportFilters = async (page: Page, filters: Record<string, string>): Promise<void> => {
  for (const [fieldname, value] of Object.entries(filters)) {
    // UNVERIFIED: Desk standard-filter / page-form field widgets
    const input = page.locator(
      `.page-form [data-fieldname="${fieldname}"] input, .standard-filter-section [data-fieldname="${fieldname}"] input, [data-fieldname="${fieldname}"] input`,
    );
    if ((await input.count()) === 0) {
      console.warn(`Report filter input not found for ${fieldname}`);
      continue;
    }
    await input
      .first()
      .click({timeout: 5_000})
      .catch(() => undefined);
    await input
      .first()
      .fill(value, {timeout: 5_000})
      .catch(async () => {
        await input
          .first()
          .pressSequentially(value, {delay: 20})
          .catch(() => undefined);
      });
    await page.keyboard.press('Enter').catch(() => undefined);
    await page.waitForTimeout(300);
  }

  // UNVERIFIED: Refresh / Show Report button labels
  const refresh = page.locator(
    'button:has-text("Refresh"), button:has-text("Show Report"), .btn-primary:has-text("Refresh")',
  );
  if ((await refresh.count()) > 0) {
    await refresh
      .first()
      .click()
      .catch(() => undefined);
  }
};

const waitForDatatable = async (page: Page): Promise<void> => {
  // UNVERIFIED: .datatable / .dt-scrollable — Frappe Query Report grid
  const grid = page.locator('.datatable, .dt-scrollable, .report-wrapper .dt-row');
  await grid
    .first()
    .waitFor({state: 'visible', timeout: 45_000})
    .catch(() => console.warn('Datatable did not become visible in time'));
  await page.waitForTimeout(500);
};

const findPosRoute = async (page: Page, baseUrl: string): Promise<string | null> => {
  await gotoApp(page, baseUrl, '/app');
  await prepareForShot(page);

  // UNVERIFIED: workspace sidebar link markup
  const fromSidebar = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/app/"]'));
    const hit = anchors.find((a) => /\/app\/[^"'#]*pos/i.test(a.getAttribute('href') ?? ''));
    return hit?.getAttribute('href') ?? null;
  });
  if (fromSidebar) {
    const pathOnly = fromSidebar.replace(/^https?:\/\/[^/]+/i, '');
    discoveredPosRoute = pathOnly;
    console.log(`POS route from sidebar: ${pathOnly}`);
    return pathOnly;
  }

  const probes = ['/app/jewellery-pos', '/app/pos'];
  for (const probe of probes) {
    const res = await page.goto(`${baseUrl.replace(/\/$/, '')}${probe}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    const status = res?.status() ?? 0;
    const url = page.url();
    if (status < 400 && !/login|404|not.?found/i.test(url) && /pos/i.test(url)) {
      discoveredPosRoute = probe;
      console.log(`POS route from probe: ${probe}`);
      return probe;
    }
  }

  console.warn('POS route not found');
  return null;
};

const findVatReportName = async (
  context: BrowserContext,
  baseUrl: string,
): Promise<string | null> => {
  const root = baseUrl.replace(/\/$/, '');
  const filters = JSON.stringify([['name', 'like', '%VAT%']]);
  const fields = JSON.stringify(['name', 'report_type']);
  const url = `${root}/api/resource/Report?filters=${encodeURIComponent(filters)}&limit_page_length=20&fields=${encodeURIComponent(fields)}`;
  const res = await context.request.get(url);
  if (!res.ok()) {
    console.warn(`VAT Report lookup failed: ${res.status()}`);
    return null;
  }
  const json = (await res.json()) as FrappeListResponse<{name: string; report_type?: string}>;
  const rows = json.data ?? [];
  const preferred =
    rows.find((r) => /dubai/i.test(r.name)) ?? rows.find((r) => /vat/i.test(r.name)) ?? rows[0];
  if (!preferred?.name) {
    return null;
  }
  discoveredVatReportName = preferred.name;
  console.log(`VAT report name: ${preferred.name}`);
  return preferred.name;
};

/**
 * Prefer piece/item barcodes from the Item doc. Reports which field was used.
 */
const resolvePieceBarcode = (
  item: Record<string, unknown>,
): {value: string; field: string} | null => {
  const tryString = (field: string): {value: string; field: string} | null => {
    const v = item[field];
    if (typeof v === 'string' && v.trim()) {
      return {value: v.trim(), field};
    }
    return null;
  };

  for (const field of [
    'custom_piece_barcode',
    'piece_barcode',
    'barcode',
    'item_barcode',
    'custom_barcode',
  ]) {
    const hit = tryString(field);
    if (hit) {
      return hit;
    }
  }

  const barcodes = item.barcodes;
  if (Array.isArray(barcodes) && barcodes.length > 0) {
    const first = barcodes[0] as Record<string, unknown>;
    if (typeof first.barcode === 'string' && first.barcode.trim()) {
      return {value: first.barcode.trim(), field: 'barcodes[0].barcode'};
    }
  }

  return tryString('item_code');
};

/* ----------------------------- Scene runners ----------------------------- */

const captureS02 = async (
  page: Page,
  browser: Browser,
  cookies: Cookie[],
  baseUrl: string,
  context: BrowserContext,
): Promise<void> => {
  const doc = await firstDoc(context, baseUrl, 'Metal Rate', [['company', '=', COMPANY_DUBAI]]);
  if (!doc) {
    await appendNote('S02', 'No Metal Rate for Al Noor Jewellery - Dubai');
    return;
  }
  const route = `/app/metal-rate/${encodeURIComponent(doc.name)}`;
  await gotoApp(page, baseUrl, route);
  await capturePng(page, {scene: 'S02', relativeFile: 'S02/metal-rate.png'});

  await withVideoPage(
    browser,
    cookies,
    async (vp) => {
      await gotoApp(vp, baseUrl, route);
      await prepareForShot(vp);
      await vp.waitForTimeout(6_000);
    },
    'S02-metal-rate.webm',
    'S02',
  );
};

const captureS03 = async (browser: Browser, cookies: Cookie[], baseUrl: string): Promise<void> => {
  const iphone = devices['iPhone 15 Pro'];
  const context = await browser.newContext({
    ...iphone,
    locale: 'en',
    timezoneId: 'Asia/Dubai',
  });
  await context.addCookies(cookies);
  const page = await context.newPage();
  try {
    await gotoApp(page, baseUrl, '/app/sales-invoice/new');
    await capturePng(page, {scene: 'S03', relativeFile: 'S03/sales-invoice-new.png'});

    await gotoApp(page, baseUrl, '/app/payment-entry/new');
    await capturePng(page, {scene: 'S03', relativeFile: 'S03/payment-entry-new.png'});
  } finally {
    await context.close();
  }
};

const captureS04 = async (page: Page, baseUrl: string): Promise<void> => {
  await gotoApp(page, baseUrl, '/app/query-report/Jewellery Gross Profit');
  await prepareForShot(page);
  await setReportFilters(page, {
    // UNVERIFIED fieldnames for Jewellery Gross Profit
    company: '',
    from_date: daysAgoIso(90),
    to_date: todayIso(),
  });
  await waitForDatatable(page);
  await capturePng(page, {
    scene: 'S04',
    relativeFile: 'S04/jewellery-gross-profit.png',
  });
};

const captureS05 = async (page: Page, baseUrl: string, context: BrowserContext): Promise<void> => {
  const item = await firstDoc(
    context,
    baseUrl,
    'Item',
    [['item_division', '=', 'Metal']],
    ['name', 'item_code', 'item_name'],
  );
  if (!item) {
    await appendNote('S05', 'No Item with item_division=Metal');
    return;
  }

  await gotoApp(page, baseUrl, `/app/item/${encodeURIComponent(item.name)}`);
  await capturePng(page, {scene: 'S05', relativeFile: 'S05/item-metal.png'});

  await gotoApp(page, baseUrl, '/app/query-report/Stock Balance');
  await prepareForShot(page);
  await setReportFilters(page, {
    // UNVERIFIED fieldnames for Stock Balance
    item_code: item.name,
  });
  await waitForDatatable(page);
  await capturePng(page, {scene: 'S05', relativeFile: 'S05/stock-balance.png'});
};

const captureS06 = async (browser: Browser, cookies: Cookie[]): Promise<void> => {
  const storefront = process.env.STOREFRONT_URL?.trim();
  if (!storefront) {
    await appendNote('S06', 'STOREFRONT_URL empty — skipped storefront captures');
    return;
  }

  {
    const context = await browser.newContext({...desktopContextOptions});
    const page = await context.newPage();
    try {
      await page.goto(storefront, {waitUntil: 'domcontentloaded', timeout: 60_000});
      await capturePng(page, {scene: 'S06', relativeFile: 'S06/storefront-home-desktop.png'});

      // UNVERIFIED: storefront product link heuristics
      const productHref = await page.evaluate(() => {
        const a = document.querySelector<HTMLAnchorElement>(
          'a[href*="/product"], a[href*="/products/"], a[href*="/item"], a.product-card, .product a',
        );
        return a?.href ?? null;
      });
      if (productHref) {
        await page.goto(productHref, {waitUntil: 'domcontentloaded', timeout: 60_000});
        await capturePng(page, {
          scene: 'S06',
          relativeFile: 'S06/storefront-product-desktop.png',
        });
      } else {
        await appendNote('S06', 'No product link found on storefront home (desktop)', storefront);
      }
    } finally {
      await context.close();
    }
  }

  {
    const iphone = devices['iPhone 15 Pro'];
    const context = await browser.newContext({
      ...iphone,
      locale: 'en',
      timezoneId: 'Asia/Dubai',
    });
    await context.addCookies(cookies).catch(() => undefined);
    const page = await context.newPage();
    try {
      await page.goto(storefront, {waitUntil: 'domcontentloaded', timeout: 60_000});
      await capturePng(page, {scene: 'S06', relativeFile: 'S06/storefront-home-iphone.png'});

      const productHref = await page.evaluate(() => {
        const a = document.querySelector<HTMLAnchorElement>(
          'a[href*="/product"], a[href*="/products/"], a[href*="/item"], a.product-card, .product a',
        );
        return a?.href ?? null;
      });
      if (productHref) {
        await page.goto(productHref, {waitUntil: 'domcontentloaded', timeout: 60_000});
        await capturePng(page, {
          scene: 'S06',
          relativeFile: 'S06/storefront-product-iphone.png',
        });
      } else {
        await appendNote('S06', 'No product link found on storefront home (iphone)', storefront);
      }
    } finally {
      await context.close();
    }
  }
};

const captureS07 = async (
  page: Page,
  browser: Browser,
  cookies: Cookie[],
  baseUrl: string,
  context: BrowserContext,
): Promise<void> => {
  const posRoute = await findPosRoute(page, baseUrl);
  if (!posRoute) {
    await appendNote('S07', 'POS route not found (sidebar scan + probes failed)');
    return;
  }

  const itemList = await firstDoc(
    context,
    baseUrl,
    'Item',
    [],
    ['name', 'item_code', 'barcode', 'custom_piece_barcode', 'piece_barcode'],
  );
  if (!itemList) {
    await appendNote('S07', 'No Item available for barcode scan');
    return;
  }
  const full = (await getDoc(context, baseUrl, 'Item', itemList.name)) ?? itemList.raw;
  const barcode = resolvePieceBarcode(full);
  if (!barcode) {
    await appendNote('S07', `Item ${itemList.name} has no usable barcode field`);
    return;
  }
  discoveredBarcodeField = barcode.field;
  console.log(`S07 barcode field: ${barcode.field} = ${barcode.value}`);

  await withVideoPage(
    browser,
    cookies,
    async (vp) => {
      await gotoApp(vp, baseUrl, posRoute);
      await prepareForShot(vp);
      await vp.waitForTimeout(1_000);

      // UNVERIFIED: POS barcode input selectors
      const barcodeInput = vp.locator(
        'input[data-fieldname="barcode"], input[placeholder*="Barcode" i], input[placeholder*="barcode" i], .pos-barcode input, input.barcode, #barcode, input[name="barcode"]',
      );
      if ((await barcodeInput.count()) === 0) {
        console.warn('S07: barcode input not found — recording idle POS only');
        await vp.waitForTimeout(2_000);
        return;
      }

      await barcodeInput.first().click({timeout: 5_000});
      await barcodeInput.first().fill('');
      await barcodeInput.first().pressSequentially(barcode.value, {delay: 40});
      await vp.keyboard.press('Enter');

      // UNVERIFIED: cart / items line appearance
      const line = vp.locator(
        '.cart-items .cart-item, .pos-bill-item, .pos-item-row, .cart-container .item-row, tr.pos-bill-row',
      );
      await line
        .first()
        .waitFor({state: 'visible', timeout: 15_000})
        .catch(() => console.warn('S07: cart line did not appear after Enter'));
      await vp.waitForTimeout(2_000);
    },
    'S07-pos-scan.webm',
    'S07',
  );

  await gotoApp(page, baseUrl, posRoute);
  await prepareForShot(page);

  // UNVERIFIED: Pay / Payment buttons on jewellery POS
  const payBtn = page.locator(
    'button:has-text("Pay"), button:has-text("Payment"), .pos-pay-btn, button.pay-amount, [data-action="pay"]',
  );
  if ((await payBtn.count()) > 0) {
    await payBtn
      .first()
      .click()
      .catch(() => undefined);
    await page.waitForTimeout(800);
    // UNVERIFIED: payment modal
    const dialog = page.locator(
      '.modal.show, .payment-dialog, .pos-payment, [data-modal="payment"], .frappe-modal',
    );
    if (
      (await dialog.count()) > 0 &&
      (await dialog
        .first()
        .isVisible()
        .catch(() => false))
    ) {
      await capturePng(page, {scene: 'S07', relativeFile: 'S07/pos-payment-dialog.png'});
      await page.keyboard.press('Escape').catch(() => undefined);
      const close = page.locator(
        '.modal.show .btn-modal-close, .modal.show button:has-text("Close"), .modal.show .close',
      );
      if ((await close.count()) > 0) {
        await close
          .first()
          .click()
          .catch(() => undefined);
      }
    } else {
      await appendNote('S07', 'Payment dialog did not open (or not visible)');
    }
  } else {
    await appendNote('S07', 'Pay button not found — skipped payment dialog PNG');
  }
};

const captureS08 = async (page: Page, baseUrl: string, context: BrowserContext): Promise<void> => {
  const closing = await firstDoc(context, baseUrl, 'POS Closing Entry');
  if (closing) {
    await gotoApp(page, baseUrl, `/app/pos-closing-entry/${encodeURIComponent(closing.name)}`);
    await capturePng(page, {scene: 'S08', relativeFile: 'S08/pos-closing-entry.png'});
  } else {
    await appendNote('S08', 'No POS Closing Entry found');
  }

  const opening = await firstDoc(context, baseUrl, 'POS Opening Entry');
  if (opening) {
    await gotoApp(page, baseUrl, `/app/pos-opening-entry/${encodeURIComponent(opening.name)}`);
    await capturePng(page, {scene: 'S08', relativeFile: 'S08/pos-opening-entry.png'});
  } else {
    await appendNote('S08', 'No POS Opening Entry found');
  }
};

const captureS09 = async (page: Page, baseUrl: string, context: BrowserContext): Promise<void> => {
  const vatName = await findVatReportName(context, baseUrl);
  if (vatName) {
    const range = lastQuarterRange();
    await gotoApp(page, baseUrl, `/app/query-report/${encodeURIComponent(vatName)}`);
    await prepareForShot(page);
    await setReportFilters(page, {
      // UNVERIFIED fieldnames for VAT reports
      company: COMPANY_DUBAI,
      from_date: range.from,
      to_date: range.to,
    });
    await waitForDatatable(page);
    await capturePng(page, {scene: 'S09', relativeFile: 'S09/vat-report.png'});
  } else {
    await appendNote('S09', 'No Report matching %VAT%');
  }

  const tft = await firstDoc(context, baseUrl, 'Tax Free Transaction');
  if (tft) {
    await gotoApp(page, baseUrl, `/app/tax-free-transaction/${encodeURIComponent(tft.name)}`);
    await capturePng(page, {scene: 'S09', relativeFile: 'S09/tax-free-transaction.png'});
  } else {
    await appendNote('S09', 'No Tax Free Transaction found');
  }

  const customer = await firstDoc(context, baseUrl, 'Customer', [
    ['custom_kyc_risk_rating', '=', 'Medium'],
  ]);
  if (customer) {
    await gotoApp(page, baseUrl, `/app/customer/${encodeURIComponent(customer.name)}`);
    await prepareForShot(page);
    // UNVERIFIED: KYC section heading / tab
    const kyc = page.locator(
      'text=/KYC/i, .form-section:has-text("KYC"), [data-fieldname*="kyc" i], .section-head:has-text("KYC")',
    );
    if ((await kyc.count()) > 0) {
      await kyc
        .first()
        .scrollIntoViewIfNeeded()
        .catch(() => undefined);
      await page.waitForTimeout(400);
    } else {
      console.warn('S09: KYC section not found — capturing customer form as-is');
    }
    await capturePng(page, {scene: 'S09', relativeFile: 'S09/customer-kyc.png'});
  } else {
    await appendNote('S09', 'No Customer with custom_kyc_risk_rating=Medium');
  }
};

const captureS10 = async (page: Page, baseUrl: string): Promise<void> => {
  await gotoApp(page, baseUrl, '/app');
  await prepareForShot(page);
  await page.keyboard.press('Alt+Digit0');
  await page.waitForTimeout(1_000);

  // UNVERIFIED: Frappe support / help dialog triggered by Alt+0
  const dialog = page.locator(
    '.modal.show:has-text("Support"), .modal.show:has-text("Help"), .frappe-support, [data-support-dialog], .modal.show',
  );
  const visible =
    (await dialog.count()) > 0 &&
    (await dialog
      .first()
      .isVisible()
      .catch(() => false));
  if (!visible) {
    await appendNote('S10', 'Support dialog absent after Alt+0 — not faked');
    console.warn('S10: support dialog not found after Alt+0');
    return;
  }
  await capturePng(page, {scene: 'S10', relativeFile: 'S10/support-dialog.png'});
};

const captureS12 = async (page: Page, baseUrl: string): Promise<void> => {
  await gotoApp(page, baseUrl, '/app/home');
  await capturePng(page, {scene: 'S12', relativeFile: 'S12/home.png'});
};

/* --------------------------------- Main ---------------------------------- */

async function main(): Promise<void> {
  const baseUrl = requireEnv('CAPTURE_BASE_URL').replace(/\/$/, '');

  await mkdir(SCREENS_DIR, {recursive: true});
  await mkdir(VIDEO_DIR, {recursive: true});
  await writeFile(MANIFEST_PATH, '[]\n', 'utf8');

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({headless: true});
    const context = await browser.newContext({...desktopContextOptions});
    await login(context, baseUrl);
    const cookies = await context.cookies();
    const page = await context.newPage();

    // S01 — none (brand/VO only)
    // S11, S13 — none

    await captureS02(page, browser, cookies, baseUrl, context);
    await captureS03(browser, cookies, baseUrl);
    await captureS04(page, baseUrl);
    await captureS05(page, baseUrl, context);
    await captureS06(browser, cookies);
    await captureS07(page, browser, cookies, baseUrl, context);
    await captureS08(page, baseUrl, context);
    await captureS09(page, baseUrl, context);
    await captureS10(page, baseUrl);
    await captureS12(page, baseUrl);

    console.log('--- capture summary ---');
    console.log(`POS route: ${discoveredPosRoute ?? '(not found)'}`);
    console.log(`VAT report: ${discoveredVatReportName ?? '(not found)'}`);
    console.log(`Barcode field: ${discoveredBarcodeField ?? '(not resolved)'}`);
    console.log(`Manifest: ${MANIFEST_PATH}`);
  } finally {
    await browser?.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
