/**
 * One-shot S07 jewellery POS capture — mirrors the proven probe flow.
 */
import 'dotenv/config';
import {chromium} from 'playwright';
import {mkdir, rename, writeFile, copyFile} from 'node:fs/promises';
import path from 'node:path';

const BASE = (process.env.CAPTURE_BASE_URL || '').replace(/\/$/, '');
const USER = process.env.CAPTURE_USER || '';
const PASS = process.env.CAPTURE_PASS || '';
const BARCODE = '0340000001';
const SCREENS = path.join(process.cwd(), 'assets', 'screens', 'S07');
const VIDEO = path.join(process.cwd(), 'assets', 'video');
const ART = '/opt/cursor/artifacts';

async function main() {
  console.log('start', BASE);
  await mkdir(SCREENS, {recursive: true});
  await mkdir(path.join(VIDEO, '.tmp'), {recursive: true});

  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({
    viewport: {width: 1920, height: 1080},
    deviceScaleFactor: 2,
    locale: 'en',
    timezoneId: 'Asia/Dubai',
    recordVideo: {dir: path.join(VIDEO, '.tmp'), size: {width: 1920, height: 1080}},
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/login`, {waitUntil: 'domcontentloaded', timeout: 60_000});
  await page.waitForTimeout(1000);
  // Already logged in?
  if (!page.url().includes('/login')) {
    console.log('already logged in', page.url());
  } else {
    const email = page.locator('#login_email, input[name=usr], input[type=email]').first();
    await email.waitFor({state: 'visible', timeout: 30_000});
    await email.fill(USER);
    await page.locator('#login_password, input[name=pwd], input[type=password]').first().fill(PASS);
    await Promise.all([
      page.waitForNavigation({timeout: 60_000}).catch(() => undefined),
      page.click('button[type=submit], .btn-login, button:has-text("Login")'),
    ]);
  }
  console.log('logged in', page.url());

  await page.goto(`${BASE}/app/pos-jewellery`, {waitUntil: 'domcontentloaded', timeout: 60_000});
  await page.waitForTimeout(3000);

  // Company picker
  const company = page.locator(
    '.amarjm-desk-company-dialog.show, .modal.show:has-text("Select Company")',
  );
  if (await company.first().isVisible().catch(() => false)) {
    console.log('company dialog');
    await company.first().getByText(/Dubai/i).first().click({force: true}).catch(() => undefined);
    await company.first().locator('button:has-text("Continue")').first().click().catch(() => undefined);
    await page.waitForTimeout(1000);
    await page.goto(`${BASE}/app/pos-jewellery`);
    await page.waitForTimeout(2500);
  }

  await page.waitForFunction(
    `() => !!(window.frappe?.pages?.['pos-jewellery']?.jewellery_pos)`,
    {timeout: 30_000},
  );
  console.log('controller ready');

  // Profile — open dialog without awaiting (prompt resolves only after Continue)
  await page.evaluate(`(() => {
    const jp = frappe.pages['pos-jewellery'].jewellery_pos;
    // Fire-and-forget: awaiting would block until the cashier confirms.
    Promise.resolve(jp.prompt_pos_profile_selection()).catch(() => undefined);
  })()`);
  await page.waitForTimeout(1500);
  let dlg = page.locator('.jpos-profile-select-dialog.show');
  if (!(await dlg.isVisible().catch(() => false))) {
    await page.locator('.jpos-profile-chip').click({force: true}).catch(() => undefined);
    await page.waitForTimeout(1000);
    dlg = page.locator('.jpos-profile-select-dialog.show');
  }
  console.log('profile dialog', await dlg.isVisible().catch(() => false));
  if (await dlg.isVisible().catch(() => false)) {
    // Click the Dubai option card/row, not just any "Dubai" text
    const dubaiRow = dlg.locator('.jpos-profile-option, [class*="profile-option"], .list-item, .card').filter({hasText: /Dubai/i});
    if (await dubaiRow.count()) await dubaiRow.first().click({force: true});
    else await dlg.getByText(/Al Noor Jewellery - Dubai/i).first().click({force: true});
    await page.waitForTimeout(400);
    await dlg.locator('button:has-text("Continue"), button.btn-primary').first().click({force: true});
    await page.waitForTimeout(500);
    // Force-apply if dialog still open / profile unset
    await page.evaluate(`(async () => {
      const jp = frappe.pages['pos-jewellery'].jewellery_pos;
      if (typeof jp.apply_pos_profile_selection === 'function') {
        try { await jp.apply_pos_profile_selection(); } catch (e) {}
      }
    })()`);
    await dlg.waitFor({state: 'hidden', timeout: 20_000}).catch(() => undefined);
  }
  await page.waitForTimeout(2500);
  // Dismiss any leftover profile modal backdrop
  await page.evaluate(`(() => {
    document.querySelectorAll('.jpos-profile-select-dialog').forEach((el) => {
      el.classList.remove('show');
      el.style.display = 'none';
    });
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
  })()`);
  const profile = await page.evaluate(`(() => {
    const jp = frappe.pages['pos-jewellery'].jewellery_pos;
    return {
      pos_profile: jp.pos_profile,
      resolved: jp.resolved_pos_profile,
      body: (document.body.innerText || '').match(/POS PROFILE[\\s\\S]{0,80}/)?.[0],
    };
  })()`);
  console.log('profile', profile);
  await page.screenshot({path: `${ART}/s07-profile.png`});

  // Customer
  await page.evaluate(`(async () => {
    const jp = frappe.pages['pos-jewellery'].jewellery_pos;
    if (jp.handle_new_sale_click) jp.handle_new_sale_click();
    if (jp.customer_control?.set_value) await jp.customer_control.set_value('Cash Customer');
    if (jp.frm?.set_value) await jp.frm.set_value('customer', 'Cash Customer');
  })()`);
  await page.waitForTimeout(800);
  console.log(
    'customer',
    await page.evaluate(
      `(() => frappe.pages['pos-jewellery'].jewellery_pos.customer_control?.get_value?.() || frappe.pages['pos-jewellery'].jewellery_pos.frm?.doc?.customer)()`,
    ),
  );

  // Scan barcode
  const search = page.locator('input.jpos-search-input').first();
  console.log('search count', await search.count());
  await search.click({force: true});
  await search.fill('');
  await search.type(BARCODE, {delay: 40});
  await page.waitForTimeout(500);
  await page.evaluate(`(async () => {
    await frappe.pages['pos-jewellery'].jewellery_pos.handle_search_enter();
  })()`);
  await page.waitForTimeout(2000);
  await page.screenshot({path: `${ART}/s07-after-enter.png`});

  const detailVisible = await page.locator('.jpos-details-panel').isVisible().catch(() => false);
  console.log('detail visible', detailVisible);
  if (detailVisible) {
    const qty = page.locator('.jpos-details-panel input[data-fieldname="qty"]');
    if (await qty.count()) {
      const v = await qty.first().inputValue();
      console.log('qty', v);
      if (!v || Number(v) === 0) {
        await qty.first().fill('32.4');
        await qty.first().press('Tab');
        await page.waitForTimeout(1500);
      }
    }
    await page.evaluate(
      `(() => frappe.pages['pos-jewellery'].jewellery_pos.handle_add_to_cart_confirm())()`,
    );
    const add = page.locator('button:has-text("Add to Cart"), button.jpos-add-to-cart-btn');
    if (await add.first().isVisible().catch(() => false)) {
      await add.first().click({force: true});
    }
  } else {
    // Maybe enter already added? Or click catalog card
    const card = page.locator('.jpos-item-card').first();
    if (await card.count()) {
      await card.click({force: true});
      await page.waitForTimeout(1000);
      const qty = page.locator('.jpos-details-panel input[data-fieldname="qty"]');
      if (await qty.count()) {
        const v = await qty.first().inputValue();
        if (!v || Number(v) === 0) {
          await qty.first().fill('32.4');
          await qty.first().press('Tab');
          await page.waitForTimeout(1500);
        }
      }
      await page.evaluate(
        `(() => frappe.pages['pos-jewellery'].jewellery_pos.handle_add_to_cart_confirm())()`,
      );
      const add = page.locator('button:has-text("Add to Cart")');
      if (await add.first().isVisible().catch(() => false)) await add.first().click({force: true});
    }
  }

  await page.waitForTimeout(2500);
  const line = await page.evaluate(`(() => {
    const jp = frappe.pages['pos-jewellery'].jewellery_pos;
    const items = jp.frm?.doc?.items || [];
    return {
      count: items.length,
      items: items.map(it => ({
        item_code: it.item_code, qty: it.qty, karat: it.karat,
        metal_amount: it.metal_amount, making_amount: it.making_amount, amount: it.amount, barcode: it.barcode
      })),
      cart: document.querySelector('.jpos-cart-panel .jpos-cart-items')?.innerText?.replace(/\\s+/g,' ').trim().slice(0,300)
    };
  })()`);
  console.log('line', JSON.stringify(line, null, 2));
  await page.screenshot({path: path.join(SCREENS, 'pos-scan.png')});
  await page.screenshot({path: `${ART}/S07-pos-scan.png`});

  if (!(line as {count: number}).count) {
    throw new Error('No cart line');
  }

  // Payment — do not complete. Open dialog directly (checkout gates can no-op).
  await page.evaluate(`(() => {
    const jp = frappe.pages['pos-jewellery'].jewellery_pos;
    // Close profile dialogs if any still linger
    document.querySelectorAll('.jpos-profile-select-dialog').forEach((el) => {
      el.classList.remove('show');
      el.style.display = 'none';
    });
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    const d = jp.ensure_payment_dialog && jp.ensure_payment_dialog();
    if (d && d.show) d.show();
    if (jp.settings) {
      jp.settings.payments = jp.settings.payments || [];
      if (!jp.settings.payments.some((p) => /card/i.test(p.mode_of_payment || ''))) {
        jp.settings.payments.push({mode_of_payment: 'Credit Card', default: 0});
      }
    }
    const pays = (jp.frm && jp.frm.doc && jp.frm.doc.payments) || [];
    if (jp.frm && jp.frm.doc && !pays.some((p) => /card/i.test(String(p.mode_of_payment || '')))) {
      const row = frappe.model.add_child(jp.frm.doc, 'Sales Invoice Payment', 'payments');
      row.mode_of_payment = 'Credit Card';
      row.amount = 0;
      row.type = 'Bank';
    }
    if (typeof jp.render_inline_payments === 'function') jp.render_inline_payments();
  })()`);
  await page.waitForTimeout(1500);

  // Fallback: checkout click / button
  let pay = page.locator('.jpos-payment-modal.show, .modal.jpos-payment-modal.show');
  if (!(await pay.first().isVisible().catch(() => false))) {
    await page.evaluate(`(async () => {
      const jp = frappe.pages['pos-jewellery'].jewellery_pos;
      if (jp.handle_checkout_click) await jp.handle_checkout_click();
      else if (jp.go_to_payment_step) await jp.go_to_payment_step();
    })()`);
    await page.waitForTimeout(1500);
    if (!(await pay.first().isVisible().catch(() => false))) {
      await page.locator('button.jpos-checkout-btn').click({force: true}).catch(() => undefined);
      await page.waitForTimeout(1500);
    }
  }

  console.log('pay visible', await pay.first().isVisible().catch(() => false));
  const payText = await pay.first().innerText().catch(() => '');
  console.log('pay', payText.replace(/\s+/g, ' ').slice(0, 500));
  await page.screenshot({path: path.join(SCREENS, 'pos-payment-dialog.png')});
  await page.screenshot({path: `${ART}/S07-pos-payment-dialog.png`});

  const vid = await page.video()?.path();
  await context.close();
  if (vid) {
    const dest = path.join(VIDEO, 'S07-pos-scan.webm');
    await rename(vid, dest);
    console.log('video', dest);
  }

  await writeFile(
    `${ART}/s07-selectors.json`,
    JSON.stringify(
      {
        route: '/app/pos-jewellery',
        profile,
        barcode: BARCODE,
        line,
        payHasCash: /Cash/.test(payText),
        payHasCard: /Card/.test(payText),
        selectors: {
          profileDialog: '.jpos-profile-select-dialog.show',
          searchInput: 'input.jpos-search-input',
          detailsPanel: '.jpos-details-panel',
          qty: '.jpos-details-panel input[data-fieldname="qty"]',
          addToCart: 'button.jpos-add-to-cart-btn / handle_add_to_cart_confirm()',
          cartItems: '.jpos-cart-panel .jpos-cart-items',
          checkout: 'handle_checkout_click() / button.jpos-checkout-btn',
          paymentModal: '.jpos-payment-modal.show',
          customer: 'customer_control.set_value("Cash Customer")',
          methods: [
            'prompt_pos_profile_selection',
            'handle_search_enter',
            'handle_add_to_cart_confirm',
            'handle_checkout_click',
            'render_inline_payments',
          ],
        },
      },
      null,
      2,
    ),
  );

  await browser.close();
  console.log('complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
