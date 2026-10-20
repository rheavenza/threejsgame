# T00-002 — Pixel Resolution Look-Dev

## Ticket

[docs/tickets/T00-002-pixel-lookdev.md](../docs/tickets/T00-002-pixel-lookdev.md)
· Base: `master` · Branch: `work/T00-002-pixel-lookdev-codex`

**Objective:** create a small controlled experiment for the game's pixelated 3D
presentation — real 3D depth and faceted forms, with larger, deliberate pixel
clusters than the painterly reference.

## What changed

**Pipeline** (`src/render/`)

- `pixelConfig.ts` — pure sizing arithmetic, no THREE/DOM imports, unit-tested.
- `pixelPipeline.ts` — renders into a `WebGLRenderTarget` with nearest filtering,
  then presents through a full-screen quad. The upscale is on the GPU, not CSS or
  screenshot scaling (ART_BIBLE.md §5). Mipmaps off, `setPixelRatio(1)`.

**Scene** (`src/world/`)

- `valleyScene.ts` — the look-dev vista: near canopy frame, signpost and traveler,
  winding road to a bridge, village on a river, four staggered ridge planes, a
  castle on a distant crag, and a band of stepped clouds.
- `palette.ts` — the ART_BIBLE.md §3 swatches in one place.

**Tooling**

- `scripts/capture-lookdev.mjs` + `npm run capture` — headless Chromium capture at
  every preset; fails the run on any console error, so it doubles as the §3
  browser smoke check.
- `docs/LOOKDEV_NOTES.md` — approach, measured layout table, resolution
  trade-off, and known gaps.

**Shell**

- Preset switcher in `index.html`, plus `?res=` query parameter.
- `src/main.ts` wires the pipeline; `src/viewport.ts` still owns layout sizing.

## Testable stage

- [x] Opened at the first useful testable milestone.
- [x] Scope limited to T00-002.
- [ ] Later milestones listed below — none planned; the ticket is complete
      pending owner visual review.

## Verification

Commands run on this branch, with observed results:

| Command | Result |
|---|---|
| `npm install` | ok — lockfile-based install |
| `npm test` | **20 passed / 20** (2 files: `viewport.test.ts` 5, `pixelConfig.test.ts` 15) |
| `npm run build` | **ok** — typecheck clean, `dist/` built, 493.98 kB JS / 126.61 kB gzip |
| `npm run capture` | **ok** — 3 presets captured, `consoleErrors: []` |
| `npm run dev` | serves HTTP 200 on `/` and `/src/main.ts` |

Behavioural checks (headless Chromium, `deviceScaleFactor: 1`):

| Viewport | Preset | Internal target | Upscale | Canvas CSS |
|---|---|---|---|---|
| 1280×720 | 426×240 | 427×240 | ×2 | 1280×720 |
| 1280×720 | 320×180 | 320×180 | ×4 | 1280×720 |
| 1600×900 | 320×180 | 320×180 | ×5 | 1600×900 |
| 1024×768 | 320×180 | 277×208 | ×3 | 1024×768 |

Zero console errors and zero page exceptions across all of the above.

### Manual reproduction

1. `npm install && npm run dev`
2. Open `http://localhost:5173/?res=320x180`.
3. Click the 320×180 / 426×240 / 480×270 buttons — the CSS layout must not move,
   only the internal resolution and pixel size.
4. Resize the window — the internal target re-derives and the upscale stays a
   whole number.
5. `npm run capture` to regenerate the evidence.

## Visual evidence

Viewport **1280×720**, `deviceScaleFactor: 1`, captured through the app's own
pixel pipeline (not scaled screenshots).

| Preset | Internal | Upscale | File |
|---|---|---|---|
| 320×180 | 320×180 | ×4 | [valley-320x180.png](../docs/evidence/T00-002/valley-320x180.png) |
| 426×240 | 427×240 | ×2 | [valley-426x240.png](../docs/evidence/T00-002/valley-426x240.png) |
| 480×270 | 480×270 | ×2 | [valley-480x270.png](../docs/evidence/T00-002/valley-480x270.png) |

Reference-vs-output contact sheet:
[comparison-reference-vs-lookdev.png](../docs/evidence/T00-002/comparison-reference-vs-lookdev.png)

Machine-readable capture data:
[capture-report.json](../docs/evidence/T00-002/capture-report.json)

### Against the art checklist (ART_BIBLE.md §10)

| Item | Status |
|---|---|
| Reads as 3D with chunky pixel clusters | yes — depth is visible and clusters are clearly coarser than the reference |
| Luminous green/blue/ochre palette family | yes |
| Silhouette reads at game camera distance | mostly — traveler and fence rails weaken at 320×180 |
| Material/color groups intentional, not noisy | yes |
| Warm/cool lighting separation | yes — cast shadows confirmed present |
| Pixel scale consistent | yes |
| No unapproved effects or new style | yes — no CRT, dithering, or post stack |
| Tested in the actual scene | yes — these are pipeline captures, not beauty renders |
| Owner visually accepts | **NO — awaiting owner review** |

## Reference comparison — honest gaps

Frames read correctly: pixel treatment, palette family, atmospheric distance,
and the layered composition. **Weaker than the reference:**

- **less depth** — the reference stacks many hazy hill layers; this has four;
- **tree canopies are plain icosahedra** — good silhouette, no layered clumps;
- **clouds are boxes** — crisp steps as wanted, but blunter in silhouette;
- **no fine ground detail** — no flowers or grass tufts;
- **water is flat** — no village reflection.

These are scene-content gaps for T01-001, not pipeline defects.

## Remaining work / known limits

- **D-011 stays OPEN.** Recommendation: **426×240** (clean ×2 at 1280×720, detail
  holds, pixel identity still clear). The switcher ships either way.
- Upscale is integer-only; below ×2 the image does not fill the viewport
  edge-to-edge. The layout reports the display box so a later ticket can letterbox
  deliberately.
- 426×240 is 1.775, not exactly 1.778 — it is the art bible's value, and layout
  re-derives exact size from the live aspect, so nothing is stretched.
- `scripts/` is outside `tsconfig.json` `include`, so the capture script is `.mjs`
  checked by execution rather than by `tsc`.

## Scope and safety

- [x] No unrelated files or user changes included.
- [x] No secrets, cache files, or build output committed.
- [x] No design/architecture changes beyond what the ticket authorises.
- [x] Human-only visual gate remains **pending** until the owner accepts.

## Handoff

| Acceptance criterion | Status |
|---|---|
| Internal resolution changes without changing layout | **pass** — canvas stays 1280×720 |
| Nearest-neighbour upscaling visibly crisp, survives resize | **pass** — whole-number scale, re-derived on resize |
| Aspect ratio, high-DPI, resize handled intentionally | **pass** — aspect matched, `pixelRatio(1)`, verified at 4:3 |
| Composition follows the art bible | **pass** — §4.1–4.6 all present |
| Foliage, path, water, distances, UI readable | **pass at 426/480**, marginal at 320 |
| Captures show ≥2 candidate resolutions + viewport | **pass** — 3 presets at 1280×720 |
| Build and smoke tests pass | **pass** |
| Owner reviews before look direction is accepted | **pending owner** |

- [x] Ticket acceptance criteria checked individually.
- [ ] Follow-up tickets filed — none yet; the gaps above are T01-001 scope.

**Do not merge without the owner's visual acceptance.** D-011 is the owner's call.
