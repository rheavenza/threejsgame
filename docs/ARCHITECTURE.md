# Technical Architecture (Proposed)

**Status: WORKING architecture target.** Avoid building systems before the first prototype proves they are needed.

## 1. Runtime stack

Proposed starting point:
- Three.js for 3D rendering.
- TypeScript for runtime code and content contracts.
- Vite for local development and production builds.
- Vitest for unit tests.
- Playwright or another browser runner for a small number of end-to-end smoke tests when practical.

Do not add a physics engine, UI framework, ECS, navigation package, or procedural terrain library without a ticket that demonstrates why it is needed. The first interaction and movement prototypes should validate the minimum viable stack.

## 2. Separation of responsibilities

Keep five concepts separate even if the first implementation uses only a few files:

1. **Application shell:** bootstrap, renderer, resize handling, asset loading, input lifecycle, error reporting.
2. **Presentation/world scene:** Three.js meshes, lights, cameras, scene graph, animations, visual effects.
3. **Game state:** time, player inventory, interactions, quest facts, relationship values, shelter/home ownership, and saveable state.
4. **Simulation systems:** day clock, NPC schedules, interaction resolution, dialogue conditions, quest facts, and later combat.
5. **Content:** NPC definitions, dialogue, schedule tables, task definitions, object metadata, visual presets, and world layout data.

Three.js objects are not the authoritative source of story or save state. Systems update game state; presentation reacts to that state.

## 3. Suggested source layout

Initial implementation may start smaller, but preserve these boundaries as it grows:

- src/app — startup and lifecycle.
- src/core — shared types, event dispatch, clock interfaces, deterministic utilities.
- src/render — renderer setup, camera, pixel pipeline, resize handling.
- src/world — scene assembly, terrain, paths, buildings, props, spatial helpers.
- src/entities — player and NPC runtime representations.
- src/systems — interaction, dialogue, time, schedule, quest facts, persistence.
- src/ui — HUD, prompts, dialogue panels, debug tools.
- src/content — typed or JSON data for NPCs, dialogue, schedules, tasks, palette values.
- tests — unit/integration checks; browser smoke tests live separately if tooling warrants it.
- public/assets — static textures, audio, fonts, and authored files.

Do not create empty abstraction layers just to match this diagram. Add a folder or interface when a real ticket needs it.

## 4. Main loop and state

Use one clear application lifecycle and a controlled animation loop. Avoid starting duplicate requestAnimationFrame loops when scenes reload. Centralize resize, visibility changes, and disposal of GPU resources.

Game state should be serializable independently from the scene graph. Prefer explicit IDs for NPCs, locations, interactables, dialogue flags, and world facts. Derived visual state should be rebuildable after a save is loaded.

Use deterministic updates where practical for time and schedules. Avoid tying simulation progress directly to frame count.

## 5. Content and narrative contracts

NPC definitions should gradually support:
- stable ID and display name;
- visual/role tags;
- schedule anchors;
- conversational topics and conditional responses;
- relationships and known facts;
- current intention or small personal goal.

Do not build a universal dialogue engine in the first sprint. Begin with the simplest model that supports one short conversation and a clear state change. Expand only when multiple real use cases demand it.

The narrative model should distinguish what actually happened, what an NPC believes, what the player has learned, and what the public record says. Do not encode all of these into one boolean or one global morality value.

## 6. Time, NPCs, and life-sim expansion

The first version may use a simple day clock and a few schedule slots. NPCs not visible to the player can use abstract schedule anchors rather than expensive full simulation. Movement transitions should be explicit and testable. Time should provide opportunities, not soft-lock the player for missing an hour.

Home, marriage, and adoption are later systems. When added, model household membership, consent/relationship progression, guardianship state, and NPC agency separately from the renderer.

## 7. Pixel-art rendering path

Keep pixel rendering behind one configurable presentation module. Candidate approach:
- render the Three.js scene into a low-resolution WebGLRenderTarget;
- use nearest filtering during the upscale pass;
- choose internal resolution from a small set while respecting the actual viewport;
- keep the canvas responsive without introducing fractional blur;
- test aspect ratio, device pixel ratio, resizing, fullscreen, and small UI overlays.

The exact pipeline is not final until a browser look-dev scene is compared at several internal resolutions. Do not attach style-critical behavior to scattered per-material hacks.

## 8. Asset and performance policy

- Prefer reusable, authored geometry and deterministic procedural helpers for early blockout.
- Dispose of textures, materials, render targets, and geometries when replacing scenes.
- Avoid unnecessary allocations in the hot render loop.
- Start with a small scene and measure before introducing instancing or complex culling.
- Keep accessible interaction prompts and dialogue as crisp UI overlays where world-space text would be unreadable.
- Keep controls and simulation usable when visual detail is reduced.

Initial performance target: stable, responsive play on a common desktop browser at 1080p output, with an intentionally lower internal render resolution. Measure before locking numerical budgets.

## 9. Save and versioning

Do not serialize the entire Three.js scene. Save stable game state: schema version, world clock, player state, inventory, story facts, known clues, NPC relationship state, and persistent world changes. Introduce a migration function when the save schema changes. A first-sprint local save may be deferred until the minimal scene and interaction loop exists.

## 10. Architecture change rule

A ticket that changes shared state ownership, rendering architecture, content schemas, or dependencies must state the reason, migration impact, and tests. Agents must not silently replace the stack or introduce an architecture framework because it feels more scalable.
