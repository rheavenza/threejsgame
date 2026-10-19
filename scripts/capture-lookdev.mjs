/**
 * Headless look-dev capture.
 *
 * Boots the built app in headless Chromium, waits for the WebGL scene to report
 * itself ready, then screenshots the page once per internal-resolution preset.
 * Also fails the run on any console error or page exception, so the capture
 * doubles as the browser smoke test required by docs/TESTING.md §3.
 *
 * Usage:
 *   node scripts/capture-lookdev.mjs [--out <dir>] [--width 1280] [--height 720]
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const PRESETS = ['320x180', '426x240', '480x270'];

function parseArgs(argv) {
  const args = { out: 'docs/evidence/T00-002', width: 1280, height: 720 };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--out' && value) args.out = value;
    if (key === '--width' && value) args.width = Number(value);
    if (key === '--height' && value) args.height = Number(value);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const outDir = resolve(repoRoot, args.out);

async function main() {
  await mkdir(outDir, { recursive: true });

  const server = await createServer({
    root: repoRoot,
    // Ask Vite to pick a free port and report it back through resolvedUrls,
    // which is authoritative once the server has actually bound.
    server: { port: 0, strictPort: false },
    logLevel: 'error',
  });
  await server.listen();
  const resolved = server.resolvedUrls?.local?.[0];
  const address = server.httpServer?.address();
  if (!resolved && (!address || typeof address === 'string')) {
    throw new Error('Could not determine the dev server URL.');
  }
  const baseUrl = resolved ?? `http://127.0.0.1:${address.port}/`;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

  const results = [];

  for (const preset of PRESETS) {
    await page.goto(`${baseUrl}?res=${preset}`, { waitUntil: 'load' });

    // The scene sets body dataset attributes once it has rendered a frame.
    await page.waitForFunction(
      () => document.body.dataset.internalResolution !== undefined,
      null,
      { timeout: 30_000 },
    );
    // Let the first frame settle before capturing.
    await page.waitForTimeout(400);

    const meta = await page.evaluate(() => ({
      preset: document.body.dataset.preset,
      internalResolution: document.body.dataset.internalResolution,
      upscale: Number(document.body.dataset.upscale),
    }));

    const file = resolve(outDir, `valley-${preset}.png`);
    await page.screenshot({ path: file });

    results.push({ ...meta, viewport: `${args.width}x${args.height}`, file });
    console.log(
      `captured ${preset}: internal ${meta.internalResolution} x${meta.upscale} -> ${file}`,
    );
  }

  await browser.close();
  await server.close();

  const report = {
    capturedAt: new Date().toISOString(),
    browser: 'chromium (playwright)',
    viewport: `${args.width}x${args.height}`,
    deviceScaleFactor: 1,
    consoleErrors,
    results,
  };
  await writeFile(
    resolve(outDir, 'capture-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  if (consoleErrors.length > 0) {
    console.error(`\nFAIL: ${consoleErrors.length} console error(s):`);
    consoleErrors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('\nOK: no console errors, no page exceptions.');
}

main().catch((error) => {
  console.error('capture failed:', error.message);
  process.exit(1);
});
