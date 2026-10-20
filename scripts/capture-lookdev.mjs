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
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
      displayResolution: document.body.dataset.displayResolution,
      upscale: Number(document.body.dataset.upscale),
      effectiveScale: Number(document.body.dataset.effectiveScale),
      letterbox: document.body.dataset.letterbox,
    }));

    const file = resolve(outDir, `valley-${preset}.png`);
    await page.screenshot({ path: file });

    // Independently measure the presented scale from the captured image rather
    // than trusting the computed value. Reading the WebGL canvas back in-page
    // returns transparent pixels (the drawing buffer is not preserved), so we
    // decode the screenshot we just wrote instead.
    const measured = await page.evaluate(
      async ({ pngBase64, inset }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${pngBase64}`;
        await img.decode();
        const off = document.createElement('canvas');
        off.width = img.width;
        off.height = img.height;
        const ctx = off.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, off.width, off.height);
        const at = (x, y) => {
          const i = (y * off.width + x) * 4;
          return (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
        };

        // Measure only inside the drawn image area: the letterbox bars are a
        // flat fill, and the HTML overlay labels sit in the upper-left, so both
        // are excluded to avoid stray 1px edges defeating the measurement.
        const x0 = inset.x;
        const x1 = off.width - inset.x;
        const y0 = Math.max(inset.y, Math.floor(off.height * 0.55));
        const y1 = Math.min(off.height - inset.y, Math.floor(off.height * 0.72));

        // A nearest-neighbour upscale by N makes every horizontal run an exact
        // multiple of N, so the greatest common divisor of the observed runs
        // recovers the true pixel size even where rows are flat.
        const runs = [];
        for (let y = y0; y < y1; y += 1) {
          let runStart = x0;
          let last = at(x0, y);
          for (let x = x0 + 1; x < x1; x += 1) {
            const c = at(x, y);
            if (c !== last) {
              runs.push(x - runStart);
              runStart = x;
              last = c;
            }
          }
          runs.push(x1 - runStart);
        }

        const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
        const usable = runs.filter((r) => r > 1 && r < x1 - x0);
        return {
          canvasWidth: off.width,
          canvasHeight: off.height,
          transitions: usable.length,
          measuredScale: usable.length ? usable.reduce((a, b) => gcd(a, b)) : 0,
        };
      },
      {
        pngBase64: (await readFile(file)).toString('base64'),
        inset: {
          x: Math.ceil(Number(meta.letterbox.split('x')[0]) / 2),
          y: Math.ceil(Number(meta.letterbox.split('x')[1]) / 2),
        },
      },
    );

    const measuredScale = measured.measuredScale;
    const scaleMatches = measuredScale === meta.effectiveScale;

    results.push({
      ...meta,
      viewport: `${args.width}x${args.height}`,
      measuredCanvas: `${measured.canvasWidth}x${measured.canvasHeight}`,
      measuredScale,
      scaleVerified: scaleMatches,
      file,
    });
    console.log(
      `captured ${preset}: internal ${meta.internalResolution} -> shown ${meta.displayResolution} ` +
        `(reported x${meta.effectiveScale}, letterbox ${meta.letterbox})` +
        ` measured x${measuredScale} ${scaleMatches ? 'OK' : 'MISMATCH'} -> ${file}`,
    );

    if (!scaleMatches) {
      console.error(
        `FAIL: ${preset} reported x${meta.effectiveScale} but the canvas presents x${measuredScale}.`,
      );
      process.exitCode = 1;
    }
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
