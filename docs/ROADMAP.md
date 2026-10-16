# Roadmap

**Status: WORKING — sequence and priorities may change after owner review.**  
The roadmap is a plan, not authorization to implement every listed feature. Work begins only from a READY ticket.

## Phase 0 — Prove the visual and technical foundation

Goal: a stable browser app with one compact pixel-faceted 3D look-dev scene.

- T00-001 — Minimal Three.js application shell.
- T00-002 — Pixel-resolution look-dev controls and visual test scene.
- Owner review: pick a pixel scale and confirm the direction before expanding the asset workload.
- Deferred dependency: commit the actual reference image into the repository before delegating strict image-match acceptance.

Exit gate: app builds; scene renders; resizing works; pixel sampling is visibly crisp; owner accepts or revises the visual direction.

## Phase 1 — Walkable valley and town approach

Goal: a tiny but navigable outdoor space that communicates the valley composition and gives the player a clear place to go.

- T01-001 — Valley vista and walkable town blockout.
- T01-002 — Player movement, camera, and basic interaction.

Exit gate: player can move around, approach the town, recognize the path/river/settlement/distant landmark, and interact with one obvious object. No final environmental asset library is required.

## Phase 2 — The first town loop

Goal: prove that the player wants to stay in the town and come back tomorrow.

- T02-001 — Small NPC cast, short dialogue, local contribution task, and temporary shelter.
- T02-002 — Day transition, quiet mystery beat, and minimal persistence.

Exit gate: a short playable loop supports arrival, meeting residents, contributing, sleeping, and noticing a narrative inconsistency. Owner reviews the experience for pacing and tone.

## Phase 3 — Relationship and evidence foundation

Only start after Phase 2 is accepted.

- Define durable world facts and player knowledge separately.
- Expand NPC routines and dialogue conditions.
- Add evidence/journal presentation only after the first mystery has been playtested.
- Prototype one relationship progression path, without building marriage/adoption breadth yet.

## Phase 4 — Action-combat proof

Only start once the town and movement foundations feel stable.

- Build one combat sandbox.
- Validate attack, dodge, stamina, enemy telegraph readability, hit response, and reset behavior.
- Keep combat code separate from the town simulation and narrative state.

## Phase 5 — Layered dungeon proof

Only start after the combat sandbox is accepted.

- Create one dense, authored dungeon with alternate routes, verticality, clear landmarks, shortcuts, and meaningful encounters.
- Favor a compact, memorable route network over a large corridor maze.
- Ensure the layout can be understood through play, not only through a map.

## Later / not scoped yet

- Home ownership and home decoration.
- Friendship, romance, marriage, and family.
- Adoption/guardianship with child agency and persistence.
- Seasonal economy, farming, crafting breadth, and long-running community events.
- Multiple regional settlements, political story arcs, and large interconnected dungeons.
- Final world metaphysics, factions, divine history, endgame, and endings.

## Scope rule

At any point, one or two testable tickets should be active. New feature ideas go into the backlog or decision log; they do not silently expand current work.
