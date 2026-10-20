# T00-002 — Pixel Look-Dev Notes

Technical notes for the low-resolution look-dev scene. **D-011 (exact internal
resolution) remains OPEN.** Nothing here is a locked art decision; the owner
makes the visual acceptance call.

## 1. Approach

Three.js renders the scene into a `WebGLRenderTarget`, and that target is then
presented through a full-screen quad. Both the target texture and its sampling
use `NearestFilter`, and mipmaps are disabled, so the upscale is a true
nearest-neighbour pixel expansion rather than a blurred stretch.

The upscale happens on the GPU inside the render pipeline. It is **not** CSS
scaling and **not** screenshot scaling, which ART_BIBLE.md §5 rules out.
`renderer.setPixelRatio(1)` keeps high-DPI scaling from fighting the upscale.

Code:

- `src/render/pixelConfig.ts` — pure sizing arithmetic (unit-tested).
- `src/render/pixelPipeline.ts` — render target, nearest filtering, present pass.
- `src/world/valleyScene.ts` — scene content and palette.
- `scripts/capture-lookdev.mjs` — headless capture and smoke check.

### Internal size is derived, not fixed

A preset sets the pixel *budget* (its area), not a fixed buffer. The layout pass
preserves that budget while matching the live viewport aspect ratio, so the 3D
world is never stretched by the preset choice. The upscale factor is always a
whole number; a fractional factor would place source pixels across partial
destination pixels and produce uneven, shimmering clusters.

Measured behaviour (headless Chromium, `deviceScaleFactor: 1`):

| Viewport | Preset | Internal target | Upscale |
|---|---|---|---|
| 1280×720 | 426×240 | 427×240 | ×2 |
| 1280×720 | 320×180 | 320×180 | ×4 |
| 1600×900 | 320×180 | 320×180 | ×5 |
| 1024×768 (4:3) | 320×180 | 277×208 | ×3 |

Changing the preset leaves the CSS layout untouched (canvas stays 1280×720 in
all cases), satisfying "internal resolution can be changed without changing
layout dimensions".

## 2. Candidate resolutions captured

All at a **1280×720 viewport**, `deviceScaleFactor: 1`, captured through the
app's own pipeline. Evidence in `docs/evidence/T00-002/`.

| Preset | Internal | Upscale | File |
|---|---|---|---|
| 320×180 | 320×180 | ×4 | `valley-320x180.png` |
| 426×240 | 427×240 | ×2 | `valley-426x240.png` |
| 480×270 | 480×270 | ×2 | `valley-480x270.png` |

`comparison-reference-vs-lookdev.png` places the owner reference beside two of
these for direct comparison.

## 3. Composition against the art bible

ART_BIBLE.md §4 asks for five things; the scene provides one of each:

1. **Foreground frame** — a near canopy overhanging the upper-left + a signpost.
2. **Winding route inward** — a sandy road curving down to a bridge.
3. **Human-scale midground destination** — the village on the far riverbank.
4. **One distant landmark** — the castle on its crag.
5. **Layered ridges + sky room** — four staggered ridge planes and a cloud band.

## 4. Comparison with the reference

Honest assessment of the committed captures against
`docs/reference/valley-look-reference.png`:

**Reads correctly:**
- pixel clusters are chunky and deliberate, and clearly coarser than the
  reference's painterly surface — which is the direction the art bible asks for;
- the luminous green / cyan-blue / warm-ochre family is present, and the village
  reads as a warm anchor against the cool landscape;
- distant ridges lose contrast toward blue-gray and the castle stays a readable
  silhouette;
- layering (frame → route → village → ridges → sky) is legible.

**Weaker than the reference (known gaps):**
- **Less depth.** The reference stacks many overlapping hills with soft haze
  between them; this scene has four ridge planes and reads flatter.
- **Tree canopies are simple icosahedra.** They give a good silhouette but lack
  the reference's layered clumps and sun-facing color planes.
- **Clouds are boxes.** They step crisply, which is wanted, but they are blunter
  than the reference's soft, rounded masses.
- **No fine ground detail.** The reference has flowers, grass tufts, and rock
  texture; here the meadow is a flat color field.
- **Water is flat.** No reflections of the village, which the reference has.

These are scene-content gaps, not pipeline defects. They belong to later tickets
(T01-001 valley blockout), not to this look-dev experiment.

## 5. Resolution trade-off observation

At the captured gameplay distance:

- **320×180 (×4)** — strongest pixel identity; the traveler's limbs and the thin
  fence rails start to break up, and the windmill blades merge.
- **426×240 (×2)** — the middle ground; silhouettes hold and the pixel size is
  still clearly deliberate.
- **480×270 (×2)** — the most readable; detail is best but the pixel treatment
  is the least pronounced of the three.

**Recommendation to the owner:** 426×240 is the best current trade-off, and it
upscales by a clean ×2 at 1280×720. This is a recommendation only — D-011 is the
owner's decision, and the switcher remains in the build either way.

## 6. Known technical limitations

- Upscale is integer-only. At viewport sizes where the target fits fewer than two
  whole times, the image is upscaled ×1 and does not fill the viewport
  edge-to-edge. The `display` box is reported in the layout so a future ticket can
  letterbox deliberately instead.
- The 426×240 preset is 1.775 rather than exactly 1.778. This is the value the
  art bible names; the layout pass re-derives exact size from the live aspect, so
  the world is still unstretched.
- The capture script runs Vite in-process and launches headless Chromium with
  SwiftShader (software WebGL). It is a smoke/evidence tool, not a performance
  benchmark.
- `scripts/` is not covered by `tsconfig.json` (`include: ["src"]`), so the
  capture script is plain `.mjs` and checked by execution rather than by `tsc`.

## 7. Reproducing

```sh
npm install
npm test          # 20 tests
npm run build     # typecheck + production build
npm run capture   # writes docs/evidence/T00-002/
npm run dev       # then open http://localhost:5173
```

Use `?res=320x180`, `?res=426x240`, or `?res=480x270` to force a preset, or the
on-screen switcher.

## 8. Owner gate status

**Awaiting owner review.** The pipeline is implemented and verified; the look is
not accepted. D-011 stays OPEN and no visual direction is locked.
