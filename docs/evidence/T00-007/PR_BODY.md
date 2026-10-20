# T00-007 — Application Shell Hardening

## Ticket

[docs/tickets/T00-007-shell-hardening.md](../docs/tickets/T00-007-shell-hardening.md)
· Base: `master` · Branch: `work/T00-007-shell-hardening-codex`

**Objective:** clear the code, robustness, and evidence findings from the PR #2
review that were tracked rather than folded into T00-001.

## Rescoping note (read first)

The ticket is marked **PROPOSED — not scheduled**, and one of its five findings
was already obsolete before work started. Verified against merged `master`:

| # | Finding | Status on `master` before this branch |
|---|---|---|
| 1 | `devicePixelRatio` read once, never refreshed | **Already resolved — dropped** |
| 2 | No WebGL context-loss recovery | Still real — **fixed** |
| 3 | Browser without WebGL throws an uncaught error | Still real — **fixed** |
| 4 | Every resize renders twice | Still real — **fixed** |
| 5 | Evidence captures carry no provenance note | Still real — **fixed** |

**Finding 1 is moot.** T00-002 deliberately calls `renderer.setPixelRatio(1)`
because the low-resolution pipeline owns the pixel look; `devicePixelRatio` is no
longer read at all, so there is no stale ratio to refresh. Its acceptance
criterion ("or the item is explicitly reassigned to T00-002 and recorded there")
is satisfied by that T00-002 decision. The owner chose this rescoping; the
planning agent should record the split formally.

Findings 2 and 3 overlapped T00-002's robustness scope. T00-002 is now merged, so
this branch touches the resize and lifecycle path with no conflict.

## What changed

**New: `src/app/`** (per `docs/ARCHITECTURE.md` §2 shell responsibilities, §3 layout)

- `rendererGuard.ts` — WebGL capability probe, user-facing failure reporting, and
  a `ContextLiveness` state machine. No DOM or WebGL imports in the decision
  logic, so it is unit-testable.
- `resizeController.ts` — single owner of viewport-change rendering, with an
  injectable scheduler and per-frame coalescing.

**Changed**

- `src/main.ts` — guards renderer construction, wires context-loss handlers,
  routes all rendering through `ResizeController`, drops the redundant `window`
  resize listener, and calls `forceContextLoss()` on teardown.
- `src/render/pixelPipeline.ts` — adds `invalidateRenderTarget()`; the render
  target does not survive a context loss, so the next frame must rebuild it.
- `src/style.css` — styles the failure notice and hides the scene chrome and the
  now-inert resolution switcher while it is shown.
- `README.md` — documents `npm run smoke` and the failure/restore behaviour.

**Evidence and tooling**

- `scripts/smoke-shell.mjs` + `npm run smoke` — headless acceptance test.
- `docs/evidence/T00-001/README.md` — provenance for the older captures.
- `docs/evidence/T00-007/` — fallback screenshot, restore screenshot, report.

## Verification

Commands run on this branch with observed results:

| Command | Result |
|---|---|
| `npm test` | **43 passed / 43** (4 files) |
| `npm run typecheck` | **clean** |
| `npm run build` | **clean**, 498.51 kB JS / 128.01 kB gzip |
| `npm run smoke` | **16 / 16 checks passed** |
| `npm --prefix tools/assetforge run check` | **0** |
| `npm --prefix tools/assetforge test` | **7 passed / 7** |

New unit tests: `rendererGuard.test.ts` (13) and `resizeController.test.ts` (6).
Totals moved from 24 to 43.

### `npm run smoke` output

```
PASS  startup renders a canvas
PASS  startup shows no failure notice
PASS  startup reports an internal resolution — 427x240
PASS  startup logs no console errors
PASS  startup frame has real content — 1064 distinct colours
PASS  resize re-derives the internal target — 427x240 -> 401x255
PASS  resize logs no console errors
PASS  no-WebGL sets a failure state — no-webgl
PASS  no-WebGL shows a readable notice
PASS  no-WebGL does not append a canvas
PASS  no-WebGL throws no uncaught error
PASS  context loss is detected — true
PASS  context restore clears the lost flag
PASS  canvas survives the restore
PASS  restored frame re-renders actual pixels — 1064 distinct colours
PASS  loss/restore logs no console errors
```

The two "distinct colours" checks sample the drawn area of the frame, so a blank
or cleared canvas cannot pass the restore check — that was the specific failure
mode the ticket warned about.

### Manual reproduction

1. `npm install && npm run dev`
2. Normal: the valley renders at `http://localhost:5173/`.
3. No WebGL: open DevTools → Rendering → or block WebGL, then reload. Expect the
   "The valley could not be drawn" notice and **no** uncaught error in console.
4. Context loss: in the console, take the canvas's `WEBGL_lose_context` extension
   and call `loseContext()`, then `restoreContext()`. Expect a console warning,
   `#app[data-context-lost]` during the loss, and a redrawn scene after restore.
5. `npm run smoke` to reproduce all of the above automatically.

## Visual evidence

**No-WebGL fallback**, viewport 1280×720, device pixel ratio 1, Chromium headless:
[docs/evidence/T00-007/webgl-unavailable.png](../docs/evidence/T00-007/webgl-unavailable.png)

**Frame after context restore**, same viewport:
[docs/evidence/T00-007/context-restored.png](../docs/evidence/T00-007/context-restored.png)

Machine-readable: [smoke-report.json](../docs/evidence/T00-007/smoke-report.json)

No visual/art change is proposed, and no scene composition or palette file was
touched. The look-dev evidence for T00-002 is unaffected.

## Acceptance criteria

| Criterion | Status |
|---|---|
| DPR change leaves no stale buffer, **or** reassigned to T00-002 | **pass** — reassigned: T00-002 sets `pixelRatio(1)`, so DPR is not read |
| Lost and restored context re-renders, or surfaces the failure | **pass** — verified by the smoke test, 1064 colours after restore |
| Browser without WebGL gets a message, not an exception | **pass** — 0 uncaught errors, notice shown, no canvas appended |
| One resize trigger path, or duplication documented | **pass** — single `ResizeObserver`; coalescing unit-tested |
| Evidence captures state viewport, browser, commit | **pass** — `docs/evidence/T00-001/README.md` |
| `npm test`, `typecheck`, `build` pass; no console errors | **pass** |
| Each fix exercisable without WebGL has a unit test | **pass** — 19 new unit tests |

## Remaining work / known limits

- The smoke test needs a Playwright browser. If the cached revision does not
  match `playwright@1.64.0`, `npm run smoke` fails with a clear executable-path
  error rather than silently skipping; run `npx playwright install chromium`.
- Context-loss recovery is verified via `WEBGL_lose_context`, which is the
  standard way to simulate it. A real driver-level GPU reset is not reproducible
  in CI, so that path is exercised by construction rather than by a genuine hang.
- Finding 1 is closed by reasoning, not by a new test, because there is no
  remaining code path to test. The planning agent should confirm the reassignment.
- `scripts/` remains outside `tsconfig.json` (`include: ["src"]`), so the smoke
  script is checked by execution, consistent with the existing capture script.

## Scope and safety

- [x] No unrelated files or user changes included.
- [x] No secrets, cache files, or build output committed.
- [x] No scene composition, palette, or art-direction change.
- [x] Human-only visual/narrative gates remain pending.

## Handoff

- [x] Ticket acceptance criteria checked individually.
- [ ] Follow-up tickets filed — none needed; finding 1 needs only a status note
      from the planning agent.
