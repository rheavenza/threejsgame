# T00-001 — Minimal Three.js Application Shell

**Status:** READY  
**Sprint:** 0 — Browser shell and visual proof  
**Points:** 3  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T00-001-project-shell-codex  
**PR target:** master  
**Depends on:** none

## Objective

Create the smallest reliable web application that initializes Three.js and renders a simple scene. This ticket validates the stack and establishes a runnable project; it does not attempt the final art style or a full game framework.

## Read first

- AGENTS.md
- docs/ARCHITECTURE.md
- docs/ART_BIBLE.md
- docs/TESTING.md

## Allowed scope

- package.json and lockfile.
- TypeScript/Vite configuration.
- app entry point and basic scene, camera, renderer, lights, and resize handling.
- minimal HTML/CSS shell.
- one simple scene containing sky/background, ground plane, and a few colored faceted primitives.
- minimal test/build scripts appropriate to the created project.
- .gitignore for dependencies and generated output.

## Out of scope

- Player controller, NPCs, dialogue, quests, combat, save system.
- Large art asset libraries or procedural terrain.
- React or another UI framework unless an actual requirement is documented and approved.
- Final pixel pipeline; that belongs in T00-002.

## Acceptance criteria

- [ ] npm install completes using the committed lockfile.
- [ ] documented development command opens the application in a browser.
- [ ] Three.js renders a visible scene with a camera and lighting.
- [ ] canvas resizes with the viewport without stretched aspect ratio or duplicate render loops.
- [ ] production build succeeds.
- [ ] no uncaught errors appear during a brief browser smoke test.
- [ ] README contains exact local run/build commands.
- [ ] no unrelated files or generated build output are committed.

## Verification

Record the exact commands and outcomes for dependency install, production build, and browser smoke test. If browser automation is not yet configured, state the manual steps used.

## Delivery rule

Commit the working shell as soon as it can render and build. Push the branch and open a draft PR at that testable stage; do not wait to start T00-002. Mark the PR ready only when all acceptance criteria pass.
