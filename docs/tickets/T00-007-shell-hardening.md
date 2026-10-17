# T00-007 — Application Shell Hardening

**Status:** PROPOSED — not scheduled. The planning/review agent sets the real status, sprint, and points.  
**Sprint:** unscheduled  
**Points:** 2 (rough estimate)  
**Worker:** unassigned  
**Base branch:** master  
**Suggested implementation branch:** work/T00-007-shell-hardening-codex  
**PR target:** master  
**Depends on:** T00-001 (application shell)

## Objective

Address the code, robustness, and evidence findings raised by the adversarial review of PR #2 (T00-001). None of them blocked that ticket, and none should have been folded into it. This ticket exists so they are tracked rather than lost in a PR comment.

## Read first

- docs/tickets/T00-001-project-shell.md
- docs/ARCHITECTURE.md (§2 application shell and error reporting, §3 suggested layout)
- docs/TESTING.md (§3 first browser prototype smoke checklist, §4 visual evidence standard)
- docs/tickets/T00-002-pixel-lookdev.md (owns the high-DPI and pipeline work)

## Findings in scope

Each was confirmed against the code by two independent reviewers; severity reflects consensus.

### 1. `devicePixelRatio` is read once and never refreshed — minor

`renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))` runs at construction only. No resize path re-reads it, and the `Sizeable` seam in `src/viewport.ts` exposes only `setSize`, so it cannot. After a runtime DPR change — dragging the window to a HiDPI display, or browser zoom — the drawing buffer keeps the old ratio and the scene renders soft. `docs/TESTING.md` §3 names this exact item ("Resize and device pixel ratio changes do not leave a stale render target").

**Overlaps T00-002**, whose acceptance criteria already include "aspect ratio, high-DPI display, and resize behavior are handled intentionally". Decide the split before implementing, so the two tickets do not both edit the resize path.

### 2. No WebGL context-loss recovery — minor

There is no `webglcontextlost` / `webglcontextrestored` handling, and no animation loop. three.js sets `_isContextLost` on loss and early-returns from `render()`; its restore handler re-initialises GL state but never redraws, so with no loop the canvas stays blank until the user happens to resize. `dispose()` also does not call `forceContextLoss()`.

### 3. A browser without WebGL fails with an uncaught error — minor

`new THREE.WebGLRenderer({...})` runs at module top level with no guard, so a browser where WebGL is unavailable throws `Error creating WebGL context.`. The canvas is never appended and the user sees the styled shell with no explanation. The `<noscript>` fallback does not cover this case. `AGENTS.md` §7 and `docs/ARCHITECTURE.md` §2 both place error reporting in the application shell.

### 4. Every resize renders the scene twice — nit

`resizeRenderer` is registered both on the window `resize` event and through a `ResizeObserver` on the full-viewport host, so one window resize renders twice; startup renders twice as well. Harmless for a static scene, and T00-001's "no duplicate render loops" criterion is still satisfied, but one of the two trigger paths is redundant and the cost grows once a render loop exists.

### 5. Evidence captures carry no provenance note — documentation

`docs/evidence/T00-001/` holds two PNGs with no in-repo note stating the viewport, browser, or commit captured; that framing lives only in PR #2's description. `docs/TESTING.md` §4 asks for the viewport and internal render resolution alongside visual evidence.

## Out of scope

- Any change to scene composition, palette, or art direction.
- The pixel render pipeline (T00-002).
- Player movement, camera control, NPCs, dialogue, quests, combat, or persistence.

## Acceptance criteria

- [ ] A runtime device-pixel-ratio change no longer leaves a stale drawing buffer, **or** the item is explicitly reassigned to T00-002 and recorded there.
- [ ] A lost and restored WebGL context re-renders, or the canvas surfaces the failure.
- [ ] A browser without WebGL shows a comprehensible message instead of an uncaught exception.
- [ ] A single resize trigger path drives a render, or the duplication is documented as deliberate.
- [ ] Evidence captures state their viewport, browser, and source commit.
- [ ] `npm test`, `npm run typecheck`, and `npm run build` pass, with no console errors in a browser smoke test.
- [ ] Each fix that can be exercised without WebGL has a unit test, in the spirit of `src/viewport.test.ts`.

## Verification

Record exact commands and results for install, tests, typecheck, build, and a browser smoke test, plus a screenshot at a stated viewport showing the WebGL-unavailable message.

## Risks and open questions

- Items 1–3 overlap T00-002's high-DPI and robustness scope. Split them deliberately rather than letting both tickets touch resize handling.
- Item 2 (context-loss recovery) interacts with whatever render loop T00-002 introduces; sequencing it after T00-002 may be cheaper than doing it first.
- Item 4 is a taste call — if a render loop lands, the redundant listener disappears naturally and this item can be closed as moot.

## Provenance

Findings recovered from the adversarial verification run of PR #2 (four review dimensions, each finding refuted by two independent reviewers). Two other findings from that run were rejected by both reviewers and are recorded here for completeness so they are not re-raised:

- The commit message describing the `=== 0` → `<= 0` guard as "the same zero-size guard" — behaviour is unchanged for all reachable input, since `getBoundingClientRect()` never returns negatives and `NaN` was unguarded in both versions.
- The canvas `aria-label` without a `role`, and the absence of headings — `index.html` already gives the scene a labelled `<main>` landmark, so a text alternative exists.
