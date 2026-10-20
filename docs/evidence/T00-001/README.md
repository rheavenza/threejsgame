# T00-001 — Application Shell Evidence

Screenshot evidence for [T00-001](../../tickets/T00-001-project-shell.md), the
minimal Three.js application shell.

## Provenance

Recorded by T00-007 (finding 5): these captures previously carried no in-repo
note, so the viewport and source revision lived only in PR #2's description. A
reviewer could not reproduce or date them from the repository alone.

| Field | Value |
|---|---|
| Ticket | T00-001 — Minimal Three.js application shell |
| Captured | 2026-10-16 |
| Source commit | `0f3dea0d6238b4aa1143f4ba823f9e527d8a8807` ("fix(app): preserve renderer through bfcache restores") |
| Branch | `work/T00-001-project-shell-codex`, merged to master in PR #2 |
| Browser | Chromium, headless |
| Device pixel ratio | 1 |
| Renderer | The T00-001 shell renderer — a direct `WebGLRenderer`, before the T00-002 pixel pipeline existed |
| Scene | The T00-001 blockout: ground plane, colored faceted primitives, hills, trees, cottages |

## Files

| File | Viewport | Image size | Bytes |
|---|---|---|---|
| [chromium-1280x720.png](chromium-1280x720.png) | 1280×720 | 1280×720 | 124,161 |
| [chromium-1024x768.png](chromium-1024x768.png) | 1024×768 | 1024×768 | 112,888 |

No internal render resolution applies: these predate the low-resolution pixel
pipeline (T00-002), so the drawing buffer matched the viewport at ratio 1.

## Reproducing

These captures show the T00-001 shell scene, which T00-002 later replaced in
`src/main.ts`. To reproduce the historical state:

```sh
git checkout 0f3dea0
npm install
npm run dev
```

Then capture at 1280×720 and 1024×768 in a headless Chromium at device pixel
ratio 1. Current `master` will instead render the T00-002 look-dev valley, whose
own evidence and provenance live in
[docs/evidence/T00-002/](../T00-002/) and
[docs/LOOKDEV_NOTES.md](../../LOOKDEV_NOTES.md).

## Known limits

- The captures were taken manually; no committed script drives them. A reusable
  headless capture path now exists at `scripts/capture-lookdev.mjs` (added by
  T00-002) and `scripts/smoke-shell.mjs` (added by T00-007).
- These record the shell stack only. They are not art-direction evidence and were
  never presented as an accepted visual direction.
