/**
 * Playwright capture skeleton.
 *
 * Captures storefront/screenshots into assets/screens/ and appends every shot
 * to assets/manifest.json with {scene, file, sourceUrl, capturedAt, viewport}.
 *
 * No live network targets are hardcoded — configure via .env.
 */

import 'dotenv/config';
import {chromium, type Browser, type Page} from 'playwright';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

type CaptureRecord = {
  scene: string;
  file: string;
  sourceUrl: string;
  capturedAt: string;
  viewport: {width: number; height: number};
};

const MANIFEST_PATH = path.join(process.cwd(), 'assets', 'manifest.json');
const SCREENS_DIR = path.join(process.cwd(), 'assets', 'screens');

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

const captureShot = async (
  page: Page,
  opts: {scene: string; file: string; sourceUrl: string},
): Promise<void> => {
  const viewport = page.viewportSize() ?? {width: 1920, height: 1080};
  const outPath = path.join(SCREENS_DIR, opts.file);
  await page.screenshot({path: outPath, fullPage: false});
  await appendManifest({
    scene: opts.scene,
    file: `screens/${opts.file}`,
    sourceUrl: opts.sourceUrl,
    capturedAt: new Date().toISOString(),
    viewport,
  });
  console.log(`Captured ${opts.scene} -> ${opts.file}`);
};

async function main(): Promise<void> {
  const baseUrl = process.env.CAPTURE_BASE_URL ?? process.env.STOREFRONT_URL;
  if (!baseUrl) {
    console.warn('CAPTURE_BASE_URL / STOREFRONT_URL not set. Skeleton exits without capturing.');
    return;
  }

  await mkdir(SCREENS_DIR, {recursive: true});

  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({headless: true});
    const context = await browser.newContext({
      viewport: {width: 1920, height: 1080},
      locale: 'ar',
    });
    const page = await context.newPage();

    await page.goto(baseUrl, {waitUntil: 'domcontentloaded'});
    // Inject hide.css to strip chrome that should not appear in marketing frames.
    await page.addStyleTag({path: path.join(__dirname, 'hide.css')});

    // TODO: navigate per-scene and call captureShot for each frame.
    // Example placeholder (disabled until scene URLs are defined):
    // await captureShot(page, {scene: 'S01', file: 'S01-hero.png', sourceUrl: page.url()});

    void captureShot;
    console.log('Capture skeleton ready. Define scene URLs, then enable captureShot calls.');
  } finally {
    await browser?.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
