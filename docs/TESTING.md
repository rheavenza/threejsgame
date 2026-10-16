# Testing and Verification Strategy

This document describes the desired verification discipline. Commands should match the actual package scripts created by the first implementation ticket.

## 1. Layers of verification

### Static and build checks
- TypeScript typecheck if configured.
- Production build.
- Lint/format checks only after the project chooses and configures them; do not invent failing commands from a generic template.

### Unit tests
Use for pure logic such as:
- world clock math and day rollover;
- interaction eligibility;
- dialogue-condition evaluation;
- NPC schedule resolution;
- relationship changes;
- save serialization and migration;
- story-fact and evidence handling.

Keep most logic testable without starting WebGL.

### Integration tests
Use to verify connected systems, such as an interaction updating a story fact and changing an NPC response, or sleeping advancing the day and resolving schedules.

### Browser smoke tests
Once a runnable shell exists, verify the page loads, the renderer creates a scene, the canvas fits the viewport, no unhandled browser errors appear, and basic input still works after resize.

### Visual checks
A human should inspect captured scenes for pixel scale, readability, palette hierarchy, composition, clipping, camera behavior, and the player's sense of orientation. Automated image comparisons can catch gross regressions but do not replace owner approval.

## 2. Required evidence per ticket

The ticket must say exactly which commands or manual steps are required. A PR report must record:
- exact command and exit result;
- test names/counts when available;
- browser and viewport for runtime screenshots;
- relevant screenshot(s) or reproduction instructions;
- limitations and checks not run.

Do not write “all tests pass” unless the relevant suite was run on the current branch.

## 3. First browser prototype smoke checklist

- [ ] App starts using the documented local command.
- [ ] Production build succeeds.
- [ ] Canvas fills the expected viewport without stretching the 3D world incorrectly.
- [ ] Resize and device pixel ratio changes do not leave a stale render target.
- [ ] Pixel upscaling is visibly nearest-neighbor and stays crisp.
- [ ] No uncaught console errors during a short play session.
- [ ] Keyboard controls do not scroll the page unexpectedly.
- [ ] Player/camera movement remains responsive.
- [ ] Interaction prompts appear and disappear predictably.
- [ ] A reload starts in a known state or restores a save intentionally.

## 4. Visual evidence standard

For a visual PR, include a screenshot at a stated viewport and internal render resolution. Show enough of the surrounding scene to judge composition. If the change is about pixelation, include the target at normal gameplay size—not only a magnified crop. If lighting/palette changes, include a before/after pair where the baseline exists.

## 5. Test failure policy

If a required check fails:
1. Reproduce it on the ticket branch.
2. Decide whether it is caused by the current change.
3. Fix it if it is inside scope.
4. If it is unrelated or requires design authority, document the exact failure and stop rather than hiding it or expanding scope.
