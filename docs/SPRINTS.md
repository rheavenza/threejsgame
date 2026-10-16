# Initial Sprint Plan

This plan intentionally limits each sprint to a coherent, demoable result. Story points are relative estimates, not time promises.

## Sprint 0 — Browser shell and visual proof

**Goal:** establish that Three.js can render the intended pixel-faceted look reliably in the target browser.

Tickets:
- T00-001 (3 pts): app shell, Vite/TypeScript, Three.js scene, responsive canvas, basic build verification.
- T00-002 (3 pts): low-resolution rendering experiment, configurable internal resolution, sample terrain/sky/landmark shapes, screenshot evidence.

Demo: a browser opens into a luminous scene and can switch between candidate pixel scales without blur or resize bugs.

Review gate: owner chooses or revises the visual target. Do not build a large environment kit before this gate passes.

## Sprint 1 — Walkable valley

**Goal:** turn the beauty shot into a place that can be explored.

Tickets:
- T01-001 (5 pts): small valley approach with path, river, clustered trees, settlement silhouettes, and one distant landmark.
- T01-002 (5 pts): player movement, camera behavior, collision/grounding appropriate to the selected implementation, and one clear interaction.

Demo: the player can walk from the scenic approach toward the town, orient using landmarks, and activate one interactable.

Review gate: movement and path readability feel good; the style holds up at gameplay camera distance.

## Sprint 2 — A reason to stay

**Goal:** make the town more than scenery.

Tickets:
- T02-001 (5 pts): a few NPCs, dialogue, one practical contribution task, and temporary sleeping space.
- T02-002 (5 pts): rest/day transition, a subtle contradiction about a missing or disputed identity, and minimal persistence.

Demo: a short, repeatable first-session loop that the owner can play through without reading design docs.

Review gate: the opening feels peaceful and human; the mystery creates curiosity without turning the first half-hour into a lore dump.

## Sprint rules

- Normally 1–5 points per ticket.
- No sprint begins with a large umbrella ticket.
- If a ticket crosses a major testable milestone, push a commit and open/update its draft PR then.
- No next-sprint dependency starts before acceptance of the prior gate.
- Feature breadth (full farming, marriage, adoption, extensive combat, large dungeons) remains deferred until the core loop proves itself.
