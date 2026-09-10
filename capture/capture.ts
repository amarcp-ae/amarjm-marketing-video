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
const TARGET_ITEM_CODE = 'gold-bangle-22k';
const TARGET_BARCODE = '0340000001';

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
let discoveredShiftNeeded: boolean = false;
let discoveredPosProbeNotes: string[] = [];

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

/** Dismiss multi-company selector shown after login / on desk. */
const dismissCompanyPicker = async (page: Page): Promise<void> => {
  const modal = page.locator(
    '.amarjm-desk-company-dialog.show, .modal.show:has-text("Select Company"), .modal.show:has-text("Choose Company")',
  );
  if (
    (await modal.count()) === 0 ||
    !(await modal
      .first()
      .isVisible()
      .catch(() => false))
  ) {
    return;
  }
  console.log('Company picker detected — selecting Al Noor Jewellery - Dubai');
  const dlg = modal.first();
  // Prefer the AmarJM company chip button; fall back to visible text in the dialog.
  const chip = dlg.locator(`button.amarjm-dcg-item:has-text("${COMPANY_DUBAI}")`);
  if ((await chip.count()) > 0) {
    await chip
      .first()
      .click({timeout: 5_000})
      .catch(() => undefined);
  } else {
    const dubai = dlg.getByText(COMPANY_DUBAI, {exact: false});
    if ((await dubai.count()) > 0) {
      await dubai
        .first()
        .click({timeout: 5_000, force: true})
        .catch(() => undefined);
    }
  }
  const cont = dlg.locator(
    'button:has-text("Continue"), button.btn-modal-primary, button:has-text("Select"), button.btn-primary',
  );
  if ((await cont.count()) > 0) {
    await cont
      .first()
      .click({timeout: 5_000})
      .catch(() => undefined);
  }
  await dlg.waitFor({state: 'hidden', timeout: 15_000}).catch(() => undefined);
  await page.waitForTimeout(500);
};

const prepareForShot = async (page: Page): Promise<void> => {
  await dismissCompanyPicker(page);
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

const setCompanyDefault = async (context: BrowserContext, baseUrl: string): Promise<void> => {
  const root = baseUrl.replace(/\/$/, '');
  const attempts: Array<{method: string; form: Record<string, string>}> = [
    {method: 'frappe.client.set_default', form: {key: 'company', value: COMPANY_DUBAI}},
    {method: 'frappe.defaults.set_user_default', form: {key: 'company', value: COMPANY_DUBAI}},
  ];
  for (const attempt of attempts) {
    const res = await context.request.post(`${root}/api/method/${attempt.method}`, {
      form: attempt.form,
    });
    if (res.ok()) {
      console.log(`Set default company via ${attempt.method} -> ${COMPANY_DUBAI}`);
      return;
    }
    console.warn(`${attempt.method} failed: ${res.status()} ${(await res.text()).slice(0, 160)}`);
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
  // Wait for actual data rows, not merely the grid container.
  try {
    await page.waitForFunction(() => document.querySelectorAll('.dt-row').length > 0, undefined, {
      timeout: 30_000,
    });
  } catch {
    console.warn('Datatable .dt-row count stayed 0 within 30s');
  }
  await page.waitForTimeout(400);
};

const waitForQueryReportFilters = async (page: Page): Promise<boolean> => {
  try {
    await page.waitForFunction(
      () => {
        const qr = (window as unknown as {frappe?: {query_report?: {filters?: unknown[]}}}).frappe
          ?.query_report;
        return Array.isArray(qr?.filters) && (qr?.filters?.length ?? 0) > 0;
      },
      undefined,
      {timeout: 30_000},
    );
    return true;
  } catch {
    console.warn('Query report filters did not load within 30s');
    return false;
  }
};

const setQueryReportFilter = async (
  page: Page,
  fieldname: string,
  value: string,
): Promise<void> => {
  await waitForQueryReportFilters(page);
  const result = await page.evaluate(
    ({fieldname, value}) => {
      const qr = (
        window as unknown as {
          frappe?: {
            query_report?: {
              filters?: Array<{df?: {fieldname?: string}}>;
              set_filter_value?: (f: string, v: string) => void;
            };
          };
        }
      ).frappe?.query_report;
      if (!qr || typeof qr.set_filter_value !== 'function') {
        return {ok: false, reason: 'no set_filter_value'};
      }
      const names = (qr.filters ?? []).map((f) => f.df?.fieldname).filter(Boolean);
      if (!names.includes(fieldname)) {
        return {ok: false, reason: `missing filter ${fieldname}`, names};
      }
      try {
        qr.set_filter_value(fieldname, value);
        return {ok: true, names};
      } catch (err) {
        return {ok: false, reason: String(err), names};
      }
    },
    {fieldname, value},
  );
  if (!result.ok) {
    console.warn(
      `frappe.query_report.set_filter_value(${fieldname}) failed: ${result.reason ?? 'unknown'}`,
    );
  }
  await page.waitForTimeout(400);
};

/** Select Dubai company/profile if prompted. Do NOT open a shift. Returns false if shift lock blocks. */
const preparePosDesk = async (page: Page): Promise<boolean> => {
  await dismissCompanyPicker(page);

  // UNVERIFIED: jpos profile select markup
  const profileDialog = page.locator(
    '.jpos-profile-select-dialog.show, .modal.show:has-text("Select POS Profile"), .modal.show:has-text("POS Profile")',
  );
  if (
    (await profileDialog.count()) > 0 &&
    (await profileDialog
      .first()
      .isVisible()
      .catch(() => false))
  ) {
    console.log('S07: POS profile dialog detected — preferring Dubai profile');
    const dubai = profileDialog.first().getByText(/Dubai/i);
    if ((await dubai.count()) > 0) {
      await dubai
        .first()
        .click({timeout: 5_000})
        .catch(() => undefined);
    } else {
      const choice = profileDialog
        .first()
        .locator(
          '.list-item, .pos-profile-item, .modal-body button, .modal-body .list-row, .modal-body [data-name], .modal-body .card',
        );
      if ((await choice.count()) > 0) {
        await choice
          .first()
          .click({timeout: 5_000})
          .catch(() => undefined);
      }
    }
    const confirm = profileDialog
      .first()
      .locator(
        'button:has-text("Continue"), button:has-text("Select"), button:has-text("OK"), button.btn-primary, button:has-text("Start")',
      );
    if ((await confirm.count()) > 0) {
      await confirm
        .first()
        .click({timeout: 5_000})
        .catch(() => undefined);
    }
    await profileDialog
      .first()
      .waitFor({state: 'hidden', timeout: 15_000})
      .catch(() => undefined);
    await page.waitForTimeout(800);
  }

  await page
    .locator('#freeze.modal-backdrop, .modal-backdrop.fade.in, .freeze-message-container')
    .first()
    .waitFor({state: 'hidden', timeout: 20_000})
    .catch(() => undefined);

  // "Create POS Opening Entry" means no open shift — do not submit/create one.
  const openingEntry = page.locator(
    '.modal.show:has-text("Create POS Opening Entry"), .modal.show:has-text("POS Opening Entry"), .modal.show:has-text("Opening Entry")',
  );
  if (
    (await openingEntry.count()) > 0 &&
    (await openingEntry
      .first()
      .isVisible()
      .catch(() => false))
  ) {
    discoveredShiftNeeded = true;
    console.warn('S07: POS requires an open shift (Opening Entry modal) — not creating one');
    return false;
  }

  const shiftLock = page.locator(
    '.jpos-shift-lock-overlay, .jpos-shift-lock-overlay.is-visible, [class*="shift-lock"]',
  );
  if (
    (await shiftLock.count()) > 0 &&
    (await shiftLock
      .first()
      .isVisible()
      .catch(() => false))
  ) {
    discoveredShiftNeeded = true;
    console.warn('S07: POS requires an open shift and none is open — not creating one');
    return false;
  }
  return true;
};

const pageHasBarcodeInput = async (page: Page): Promise<boolean> => {
  const barcodeInput = page.locator(
    'input.jpos-search-input, input[data-fieldname="barcode"], input[placeholder*="Barcode" i], input[placeholder*="barcode" i], input[placeholder*="Item code" i], input[placeholder*="serial" i], .pos-barcode input, input.barcode, #barcode, input[name="barcode"]',
  );
  return (await barcodeInput.count()) > 0;
};

const findPosRoute = async (
  page: Page,
  context: BrowserContext,
  baseUrl: string,
): Promise<string | null> => {
  const root = baseUrl.replace(/\/$/, '');
  discoveredPosProbeNotes = [];

  // 1) Page doctype search
  const filters = JSON.stringify([['name', 'like', '%pos%']]);
  const fields = JSON.stringify(['name', 'title', 'page_name']);
  const apiUrl = `${root}/api/resource/Page?filters=${encodeURIComponent(filters)}&limit_page_length=50&fields=${encodeURIComponent(fields)}`;
  const pageRes = await context.request.get(apiUrl);
  const candidates: string[] = ['/app/point-of-sale'];
  if (pageRes.ok()) {
    const json = (await pageRes.json()) as FrappeListResponse<{name?: string; page_name?: string}>;
    for (const row of json.data ?? []) {
      const slug = (row.page_name || row.name || '').toString().trim();
      if (!slug) continue;
      const route = `/app/${slug}`.replace(/\/app\/\/+/, '/app/');
      if (!candidates.includes(route)) candidates.push(route);
      discoveredPosProbeNotes.push(`Page:${slug}`);
    }
  } else {
    console.warn(`Page POS lookup HTTP ${pageRes.status()}`);
  }

  // Prefer jewellery-ish POS routes first
  candidates.sort((a, b) => {
    const score = (r: string) =>
      (/jewellery|jewelry|jpos/i.test(r) ? 0 : 1) + (/point-of-sale/i.test(r) ? 0 : 2);
    return score(a) - score(b);
  });

  const openingEntryLocator = (p: Page) =>
    p.locator(
      '.modal.show:has-text("Create POS Opening Entry"), .modal.show:has-text("POS Opening Entry"), .modal.show:has-text("Opening Entry")',
    );

  for (const probe of candidates) {
    try {
      let res = await page.goto(`${root}${probe}`, {
        waitUntil: 'domcontentloaded',
        timeout: 45_000,
      });
      let status = res?.status() ?? 0;
      await page.waitForTimeout(1_500);
      await dismissCompanyPicker(page);
      // Company Continue often lands on desk — re-open POS after dismiss.
      if (!page.url().includes(probe.replace(/^\//, ''))) {
        res = await page.goto(`${root}${probe}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45_000,
        });
        status = res?.status() ?? status;
        await page.waitForTimeout(1_500);
        await dismissCompanyPicker(page);
      }

      // Wait for barcode input OR Opening Entry modal (shift required).
      let hasBarcode = false;
      let openingEntryVisible = false;
      const deadline = Date.now() + 20_000;
      while (Date.now() < deadline) {
        hasBarcode = await pageHasBarcodeInput(page);
        openingEntryVisible = await openingEntryLocator(page)
          .first()
          .isVisible()
          .catch(() => false);
        const bodySnap = (
          (await page
            .locator('body')
            .innerText()
            .catch(() => '')) || ''
        ).slice(0, 500);
        if (hasBarcode || openingEntryVisible || /opening entry/i.test(bodySnap)) {
          if (!openingEntryVisible && /opening entry/i.test(bodySnap)) {
            openingEntryVisible = true;
          }
          break;
        }
        await page.waitForTimeout(1_000);
      }

      const body = (
        (await page
          .locator('body')
          .innerText()
          .catch(() => '')) || ''
      ).slice(0, 400);
      const openingEntryInBody = /opening entry/i.test(body);
      const note = `${probe} status=${status} barcodeInput=${hasBarcode} openingEntry=${openingEntryVisible || openingEntryInBody} body=${body.replace(/\s+/g, ' ').slice(0, 120)}`;
      discoveredPosProbeNotes.push(note);
      console.log(`POS probe: ${note}`);
      // Real POS: barcode input present, OR Opening Entry modal (shift required — still the POS page).
      if (
        status < 400 &&
        (hasBarcode || openingEntryVisible || openingEntryInBody) &&
        !/not permitted|no permission|login/i.test(body)
      ) {
        discoveredPosRoute = probe;
        if ((openingEntryVisible || openingEntryInBody) && !hasBarcode) {
          discoveredShiftNeeded = true;
          console.log(`POS route selected (Opening Entry / shift required): ${probe}`);
        } else {
          console.log(`POS route selected (barcode input present): ${probe}`);
        }
        return probe;
      }
    } catch (err) {
      discoveredPosProbeNotes.push(
        `${probe} error=${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.warn('POS route with barcode/scan input not found');
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
    'piece_barcode_display',
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
  await dismissCompanyPicker(page);
  await gotoApp(page, baseUrl, '/app/query-report/Jewellery Gross Profit');
  await dismissCompanyPicker(page);
  await prepareForShot(page);
  await setReportFilters(page, {
    // UNVERIFIED fieldnames for Jewellery Gross Profit
    company: COMPANY_DUBAI,
    from_date: daysAgoIso(90),
    to_date: todayIso(),
  });
  await setQueryReportFilter(page, 'company', COMPANY_DUBAI);
  await waitForDatatable(page);
  await dismissCompanyPicker(page);
  await capturePng(page, {
    scene: 'S04',
    relativeFile: 'S04/jewellery-gross-profit.png',
  });
};

const captureS05 = async (page: Page, baseUrl: string, context: BrowserContext): Promise<void> => {
  await dismissCompanyPicker(page);
  // Prefer the known metal SKU used for marketing stills.
  let item = await firstDoc(
    context,
    baseUrl,
    'Item',
    [
      ['item_division', '=', 'Metal'],
      ['item_code', '=', TARGET_ITEM_CODE],
    ],
    ['name', 'item_code', 'item_name'],
  );
  if (!item) {
    item = await firstDoc(
      context,
      baseUrl,
      'Item',
      [['name', '=', TARGET_ITEM_CODE]],
      ['name', 'item_code', 'item_name'],
    );
  }
  if (!item) {
    await appendNote('S05', `No Item ${TARGET_ITEM_CODE} with item_division=Metal`);
    return;
  }

  await gotoApp(page, baseUrl, `/app/item/${encodeURIComponent(item.name)}`);
  await dismissCompanyPicker(page);
  await capturePng(page, {scene: 'S05', relativeFile: 'S05/item-metal.png'});

  const itemCode = typeof item.raw.item_code === 'string' ? item.raw.item_code : item.name;
  // Standard Stock Balance is a prepared/background report without live filters.
  // Jewellery Stock Balance exposes item_code and returns datatable rows.
  await gotoApp(
    page,
    baseUrl,
    `/app/query-report/Jewellery Stock Balance?item_code=${encodeURIComponent(itemCode)}`,
  );
  await dismissCompanyPicker(page);
  await prepareForShot(page);
  await setQueryReportFilter(page, 'company', COMPANY_DUBAI);
  await setQueryReportFilter(page, 'division', 'Metal');
  await setQueryReportFilter(page, 'item_code', itemCode);
  await setReportFilters(page, {item_code: itemCode, company: COMPANY_DUBAI});
  const refresh = page.locator(
    'button:has-text("Refresh"), button:has-text("Show Report"), .btn-primary:has-text("Refresh")',
  );
  if ((await refresh.count()) > 0) {
    await refresh
      .first()
      .click()
      .catch(() => undefined);
  }
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
  await dismissCompanyPicker(page);
  const posRoute = await findPosRoute(page, context, baseUrl);
  if (!posRoute) {
    await appendNote(
      'S07',
      `POS route with barcode input not found. Probes: ${discoveredPosProbeNotes.join(' | ')}`,
    );
    return;
  }

  // Prefer the known piece barcode; fall back to Item doc resolution.
  let barcodeValue = TARGET_BARCODE;
  discoveredBarcodeField = 'barcodes[0].barcode';
  const itemDoc = await getDoc(context, baseUrl, 'Item', TARGET_ITEM_CODE);
  if (itemDoc) {
    const resolved = resolvePieceBarcode(itemDoc);
    if (resolved) {
      barcodeValue = resolved.value;
      discoveredBarcodeField = resolved.field;
    }
  }
  console.log(
    `S07 barcode field: ${discoveredBarcodeField} = ${barcodeValue} (item ${TARGET_ITEM_CODE})`,
  );

  await withVideoPage(
    browser,
    cookies,
    async (vp) => {
      await gotoApp(vp, baseUrl, posRoute);
      await prepareForShot(vp);
      const ready = await preparePosDesk(vp);
      if (!ready) {
        await appendNote('S07', 'POS requires an open shift and none is open — not creating one');
        await capturePng(vp, {scene: 'S07', relativeFile: 'S07/pos-shift-required.png'});
        return;
      }
      await vp.waitForTimeout(1_000);

      // UNVERIFIED: POS barcode / search input selectors
      const barcodeInput = vp.locator(
        'input.jpos-search-input, input[data-fieldname="barcode"], input[placeholder*="Barcode" i], input[placeholder*="barcode" i], input[placeholder*="Item code" i], input[placeholder*="serial" i], .pos-barcode input, input.barcode, #barcode, input[name="barcode"]',
      );
      if ((await barcodeInput.count()) === 0) {
        console.warn('S07: barcode input not found after POS route selection');
        await appendNote('S07', `Barcode input missing on ${posRoute}`);
        await capturePng(vp, {scene: 'S07', relativeFile: 'S07/pos-no-barcode-input.png'});
        return;
      }

      await barcodeInput.first().click({timeout: 10_000, force: true});
      await barcodeInput.first().fill('');
      await barcodeInput.first().pressSequentially(barcodeValue, {delay: 40});
      await vp.keyboard.press('Enter');

      const line = vp.locator(
        '.cart-items .cart-item, .pos-bill-item, .pos-item-row, .cart-container .item-row, tr.pos-bill-row, .jpos-cart-item, .jpos-item-row',
      );
      await line
        .first()
        .waitFor({state: 'visible', timeout: 15_000})
        .catch(() => console.warn('S07: cart line did not appear after Enter'));
      await vp.waitForTimeout(2_000);
      await capturePng(vp, {scene: 'S07', relativeFile: 'S07/pos-scan.png'});
    },
    'S07-pos-scan.webm',
    'S07',
  );

  // Payment dialog only if desk is ready (no shift lock)
  await gotoApp(page, baseUrl, posRoute);
  await prepareForShot(page);
  const ready = await preparePosDesk(page);
  if (!ready) {
    return;
  }

  const payBtn = page.locator(
    'button:has-text("Pay"), button:has-text("Payment"), .pos-pay-btn, button.pay-amount, [data-action="pay"]',
  );
  if ((await payBtn.count()) > 0) {
    await payBtn
      .first()
      .click()
      .catch(() => undefined);
    await page.waitForTimeout(800);
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
    // Expand collapsed KYC section, then scroll into view
    await dismissCompanyPicker(page);
    const kycTab = page.locator(
      '.form-tabs .nav-link:has-text("KYC"), .nav-link:has-text("Corporate KYC"), button:has-text("Corporate KYC")',
    );
    if ((await kycTab.count()) > 0) {
      await kycTab
        .first()
        .click()
        .catch(() => undefined);
      await page.waitForTimeout(400);
    }
    // Frappe collapsible section heads: click when collapsed so KYC fields are visible
    const kycHead = page.locator(
      '.form-section .section-head:has-text("KYC"), .section-head:has-text("KYC"), .collapsible-section .section-head:has-text("KYC")',
    );
    if ((await kycHead.count()) > 0) {
      const head = kycHead.first();
      // Always click the section head — expands if collapsed; harmless if already open
      await head.click({timeout: 5_000}).catch(() => undefined);
      await page.waitForTimeout(400);
      await head.scrollIntoViewIfNeeded().catch(() => undefined);
      // Also scroll a KYC field into view if present
      const kycField = page.locator(
        '[data-fieldname*="kyc"], [data-fieldname="custom_kyc_risk_rating"]',
      );
      if ((await kycField.count()) > 0) {
        await kycField
          .first()
          .scrollIntoViewIfNeeded()
          .catch(() => undefined);
      }
      await page.waitForTimeout(500);
    } else {
      const kycText = page.getByText(/KYC/i).first();
      if ((await kycText.count()) > 0) {
        await kycText.click().catch(() => undefined);
        await kycText.scrollIntoViewIfNeeded().catch(() => undefined);
      } else {
        console.warn('S09: KYC section not found — capturing customer form as-is');
      }
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
  await dismissCompanyPicker(page);
  await gotoApp(page, baseUrl, '/app/home');
  await dismissCompanyPicker(page);
  await prepareForShot(page);
  await capturePng(page, {scene: 'S12', relativeFile: 'S12/home.png'});
};

/* --------------------------------- Main ---------------------------------- */

async function main(): Promise<void> {
  const baseUrl = requireEnv('CAPTURE_BASE_URL').replace(/\/$/, '');
  const only = new Set(
    (process.env.CAPTURE_SCENES || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean),
  );
  const should = (scene: string) => only.size === 0 || only.has(scene);

  await mkdir(SCREENS_DIR, {recursive: true});
  await mkdir(VIDEO_DIR, {recursive: true});

  // Partial re-runs keep prior assets; replace only selected scene rows.
  let existing: CaptureRecord[] = [];
  if (only.size > 0) {
    try {
      existing = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as CaptureRecord[];
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }
    existing = existing.filter((e) => !only.has(e.scene));
    await writeFile(MANIFEST_PATH, `${JSON.stringify(existing, null, 2)}\n`, 'utf8');
  } else {
    await writeFile(MANIFEST_PATH, '[]\n', 'utf8');
  }

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({headless: true});
    const context = await browser.newContext({...desktopContextOptions});
    await login(context, baseUrl);
    await setCompanyDefault(context, baseUrl);
    const cookies = await context.cookies();
    const page = await context.newPage();
    await gotoApp(page, baseUrl, '/app');
    await dismissCompanyPicker(page);

    const run = async (scene: string, fn: () => Promise<void>) => {
      if (!should(scene)) return;
      try {
        await fn();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`capture${scene} failed:`, message);
        await appendNote(scene, `FAILED: ${message}`);
      }
    };

    await run('S02', () => captureS02(page, browser!, cookies, baseUrl, context));
    await run('S03', () => captureS03(browser!, cookies, baseUrl));
    await run('S04', () => captureS04(page, baseUrl));
    await run('S05', () => captureS05(page, baseUrl, context));
    await run('S06', () => captureS06(browser!, cookies));
    await run('S07', () => captureS07(page, browser!, cookies, baseUrl, context));
    await run('S08', () => captureS08(page, baseUrl, context));
    await run('S09', () => captureS09(page, baseUrl, context));
    await run('S10', () => captureS10(page, baseUrl));
    await run('S12', () => captureS12(page, baseUrl));

    console.log('--- capture summary ---');
    console.log(`POS route: ${discoveredPosRoute ?? '(not found)'}`);
    console.log(`VAT report: ${discoveredVatReportName ?? '(not found)'}`);
    console.log(`Barcode field: ${discoveredBarcodeField ?? '(not resolved)'}`);
    console.log(`Shift needed: ${discoveredShiftNeeded}`);
    if (discoveredPosProbeNotes.length) {
      console.log('POS probes:');
      for (const note of discoveredPosProbeNotes) console.log(`  - ${note}`);
    }
    console.log(`Manifest: ${MANIFEST_PATH}`);
  } finally {
    await browser?.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
