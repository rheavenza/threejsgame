# Task List

Status changes are maintained by the planning/review agent after checking GitHub. Implementation agents do not mark their own tickets DONE and do not close owner review gates.

## Current status

- **Current phase:** Phase 0 — technical and visual foundation.
- **Current next ticket:** T00-002 — Pixel-resolution look-dev controls and test scene. Now unblocked: T00-001 is merged and the owner supplied the reference image.
- **Current documentation branch:** none active.
- **Human visual gate:** open and ready for owner review. The reference image is committed at `docs/reference/valley-look-reference.png` (D-010 LOCKED), so look-dev output can now be compared against it.

## Phase 0 — Foundation

- [x] T00-001 — Minimal Three.js application shell (DONE; merged in PR #2; 3 points).
- [ ] T00-002 — Pixel-resolution look-dev controls and test scene (READY; 3 points). Was blocked on T00-001 and the reference image; both are resolved.
- [x] T00-003 — Assetforge skeleton (DONE; merged in PR #4; 3 points; independent infrastructure ticket).
- [ ] T00-004 — Asset pipeline scaffolding and provider readiness (PROPOSED; 2 points). Paths referenced by AGENTS.md §12.2/§12.7 now exist; no provider adapter is installed yet.
- [ ] T00-007 — Application shell hardening (PROPOSED; unscheduled, 2 points). Five non-blocking findings from the PR #2 review; not yet on master.
- [ ] Owner review — accept/revise pixel size, palette balance, lighting, and pixel pipeline.

## Phase 1 — Walkable valley and town approach

- [ ] T01-001 — Valley vista and walkable town blockout (BLOCKED on Phase 0 gate; 5 points).
- [ ] T01-002 — Player movement, camera, and first interaction (BLOCKED on T01-001; 5 points).

## Phase 2 — First town loop

- [ ] T02-001 — NPC conversation, contribution task, and temporary shelter (BLOCKED on Phase 1; 5 points).
- [ ] T02-002 — Day transition, first identity mystery, and persistence (BLOCKED on T02-001; 5 points).

## Status policy

- READY: requirements and dependencies are concrete enough to begin.
- IN PROGRESS: worker has started on the ticket branch.
- IN REVIEW: implementation PR is ready for review.
- BLOCKED: a dependency, owner decision, or missing reference prevents safe progress.
- DONE: merged and accepted. Human visual/narrative gates need explicit owner approval.

A checklist item remains unchecked until the accepted change is merged. The tracker is informational and does not supersede ticket acceptance criteria.
