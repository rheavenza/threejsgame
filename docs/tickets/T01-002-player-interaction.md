# T01-002 — Player Movement, Camera, and First Interaction

**Status:** BLOCKED on T01-001  
**Sprint:** 1 — Walkable valley  
**Points:** 5  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T01-002-player-interaction-codex  
**PR target:** master  
**Depends on:** T01-001

## Objective

Make the valley blockout traversable and establish a reliable interaction pattern for later NPCs and town objects.

## Allowed scope

- Keyboard movement and mouse camera behavior appropriate to the current third-person design.
- Grounding and simple collision using the simplest reliable solution supported by the scene.
- One interaction interface and one sample interactable, such as a wooden sign or noticeboard.
- Interaction prompt and a small contextual response.
- Basic input focus/cleanup behavior.

## Out of scope

- Full combat, inventory, complete dialogue system, lock-on, parkour, or complex physics.
- Multiple movement modes or controller support unless specifically requested.

## Acceptance criteria

- [ ] Player can move along the primary path and reach the town approach.
- [ ] Camera remains usable around trees, walls, and simple obstacles.
- [ ] Movement does not depend on frame rate.
- [ ] Interaction prompt appears only when the target is in range and eligible.
- [ ] Interacting produces a visible response; moving away removes the prompt.
- [ ] Keyboard controls do not accidentally scroll the page.
- [ ] Tests cover any pure movement/interaction eligibility logic where practical.
- [ ] PR includes a short manual verification checklist and screenshot/video if supported.

## Delivery rule

Open a draft PR at the first stable traversal-and-interaction milestone. Keep controller tuning and any major camera redesign in small follow-up commits.
