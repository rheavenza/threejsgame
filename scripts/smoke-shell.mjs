/**
 * Application shell smoke test.
 *
 * Exercises the T00-007 acceptance paths in a real browser and fails on any
 * uncaught error:
 *
 *   1. normal startup renders a canvas with no console errors;
 *   2. a browser without WebGL shows a readable message instead of throwing;
 *   3. a lost and restored WebGL context re-renders actual pixels;
 *   4. a window resize re-derives the internal render target.
 *
 * Usage: node scripts/smoke-shell.mjs
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const evidenceDir = resolve(repoRoot, 'docs/evidence/T00-007');

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/** Counts distinct colours in a screenshot region; a blank frame has very few. */
async function countColours(page, base64, box) {
  return page.evaluate(
    async ({ data, region }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const seen = new Set();
      for (let y = region.y0; y < region.y1; y += 3) {
        for (let x = region.x0; x < region.x1; x += 3) {
          const i = (y * canvas.width + x) * 4;
          seen.add((px[i] << 16) | (px[i + 1] << 8) | px[i + 2]);
        }
      }
      return seen.size;
    },
    { data: base64, region: box },
  );
}

async function main() {
  await mkdir(evidenceDir, { recursive: true });
  const server = await createServer({
    root: repoRoot,
    server: { port: 0, strictPort: false },
    logLevel: 'error',
  });
  await server.listen();
  const baseUrl = server.resolvedUrls?.local?.[0];
  if (!baseUrl) throw new Error('Could not determine the dev server URL.');

  try {
    // 1. Normal startup -----------------------------------------------------
    {
      const browser = await chromium.launch();
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

      await page.goto(`${baseUrl}?res=426x240`, { waitUntil: 'load' });
      await page.waitForFunction(
        () => document.body.dataset.internalResolution !== undefined,
        null,
        { timeout: 30_000 },
      );
      await page.waitForTimeout(400);

      const state = await page.evaluate(() => ({
        internal: document.body.dataset.internalResolution,
        hasCanvas: Boolean(document.querySelector('canvas')),
        notice: Boolean(document.querySelector('.renderer-notice')),
      }));

      check('startup renders a canvas', state.hasCanvas);
      check('startup shows no failure notice', !state.notice);
      check('startup reports an internal resolution', /^\d+x\d+$/.test(state.internal), state.internal);
      check('startup logs no console errors', errors.length === 0, errors.join(' | '));

      const shot = await page.screenshot();
      const colours = await countColours(page, shot.toString('base64'), {
        x0: 250,
        y0: 150,
        x1: 1050,
        y1: 560,
      });
      check('startup frame has real content', colours > 50, `${colours} distinct colours`);

      // 4. Resize re-derives the target -------------------------------------
      const before = state.internal;
      await page.setViewportSize({ width: 1100, height: 700 });
      await page.waitForTimeout(500);
      const after = await page.evaluate(() => document.body.dataset.internalResolution);
      check('resize re-derives the internal target', after !== before, `${before} -> ${after}`);
      check('resize logs no console errors', errors.length === 0, errors.join(' | '));

      await browser.close();
    }

    // 2. No WebGL ------------------------------------------------------------
    {
      const browser = await chromium.launch();
      const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      // Deny every webgl context so the probe in the shell fails.
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
          if (String(kind).startsWith('webgl')) return null;
          return original.call(this, kind, ...rest);
        };
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));

      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(900);

      const state = await page.evaluate(() => ({
        failure: document.getElementById('app')?.dataset.rendererFailure ?? null,
        notice: Boolean(document.querySelector('.renderer-notice')),
        text: document.querySelector('.renderer-notice__body')?.textContent ?? '',
        canvas: Boolean(document.querySelector('canvas')),
      }));

      check('no-WebGL sets a failure state', state.failure === 'no-webgl', String(state.failure));
      check('no-WebGL shows a readable notice', state.notice && state.text.length > 40);
      check('no-WebGL does not append a canvas', !state.canvas);
      check('no-WebGL throws no uncaught error', pageErrors.length === 0, pageErrors.join(' | '));

      await page.screenshot({ path: resolve(evidenceDir, 'webgl-unavailable.png') });
      await browser.close();
    }

    // 2b. WebGL 1 only -------------------------------------------------------
    // three.js 0.180.0 needs WebGL 2 and has no WebGL 1 fallback, so a
    // WebGL-1-only browser must be caught by the preflight with the accurate
    // message rather than failing later during renderer construction.
    {
      const browser = await chromium.launch();
      const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
      await context.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
          if (kind === 'webgl2') return null;
          return original.call(this, kind, ...rest);
        };
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));

      await page.goto(baseUrl, { waitUntil: 'load' });
      await page.waitForTimeout(900);

      const state = await page.evaluate(() => ({
        failure: document.getElementById('app')?.dataset.rendererFailure ?? null,
        text: document.querySelector('.renderer-notice__body')?.textContent ?? '',
        canvas: Boolean(document.querySelector('canvas')),
      }));

      check('webgl1-only sets a failure state', state.failure === 'no-webgl', String(state.failure));
      check('webgl1-only names WebGL 2 in the message', /WebGL 2/i.test(state.text));
      check('webgl1-only does not append a canvas', !state.canvas);
      check('webgl1-only throws no uncaught error', pageErrors.length === 0, pageErrors.join(' | '));

      await browser.close();
    }

    // 3. Context loss and restore -------------------------------------------
    {
      const browser = await chromium.launch();
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

      await page.goto(`${baseUrl}?res=426x240`, { waitUntil: 'load' });
      await page.waitForFunction(
        () => document.body.dataset.internalResolution !== undefined,
        null,
        { timeout: 30_000 },
      );
      await page.waitForTimeout(400);

      const lossAvailable = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        const ext = gl?.getExtension('WEBGL_lose_context');
        if (!ext) return false;
        window.__loseExt = ext;
        ext.loseContext();
        return true;
      });

      if (!lossAvailable) {
        check('WEBGL_lose_context available for testing', false);
      } else {
        await page.waitForTimeout(600);
        const lostFlag = await page.evaluate(
          () => document.getElementById('app')?.dataset.contextLost ?? null,
        );
        check('context loss is detected', lostFlag === 'true', String(lostFlag));

        await page.evaluate(() => window.__loseExt.restoreContext());
        await page.waitForTimeout(1500);

        const restored = await page.evaluate(() => ({
          lostFlag: document.getElementById('app')?.dataset.contextLost ?? null,
          hasCanvas: Boolean(document.querySelector('canvas')),
        }));
        check('context restore clears the lost flag', restored.lostFlag === null);
        check('canvas survives the restore', restored.hasCanvas);

        const shot = await page.screenshot();
        const colours = await countColours(page, shot.toString('base64'), {
          x0: 250,
          y0: 150,
          x1: 1050,
          y1: 560,
        });
        check('restored frame re-renders actual pixels', colours > 50, `${colours} distinct colours`);
        check('loss/restore logs no console errors', errors.length === 0, errors.join(' | '));

        await writeFile(resolve(evidenceDir, 'context-restored.png'), shot);
      }

      await browser.close();
    }
  } finally {
    await server.close();
  }

  const report = {
    checkedAt: new Date().toISOString(),
    browser: 'chromium (playwright)',
    viewport: '1280x720',
    failures,
  };
  await writeFile(
    resolve(evidenceDir, 'smoke-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll shell smoke checks passed.');
}

main().catch((error) => {
  console.error('smoke test failed:', error.message);
  process.exit(1);
});
