# T01-001 — Walkable Valley and Town Blockout

**Status:** BLOCKED on Phase 0 visual gate  
**Sprint:** 1 — Walkable valley  
**Points:** 5  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T01-001-valley-blockout-codex  
**PR target:** master  
**Depends on:** accepted T00-001 and T00-002

## Objective

Build a compact scenic area that can serve as the walkable approach to the starting town. Preserve the reference's composition language without copying every detail: high foreground framing, winding path, a reflective river, warm clustered houses, hills, and a distant adventure landmark.

## Allowed scope

- A small manually authored or deterministic procedural blockout.
- Basic ground/hill shapes, paths, water, tree clusters, rock groups, house silhouettes, bridge, and one distant landmark.
- Walkability boundaries and simple collision/ground checks needed by the current controller.
- Basic scene dressing focused on composition, not asset count.

## Out of scope

- Complete town interiors, NPC schedules, combat, dungeon, farming, or final custom models.
- Procedural open-world generation.
- Dense prop clutter used to hide weak composition.

## Acceptance criteria

- [ ] Player start position has a readable vista toward the town and distant landmark.
- [ ] Path and river lead the eye into the settlement.
- [ ] Visual hierarchy separates foreground framing, midground destination, and distant mountains/landmark.
- [ ] Main path is navigable and does not contain invisible collision traps.
- [ ] Vegetation is grouped naturally rather than evenly scattered.
- [ ] Pixel style and palette are consistent with docs/ART_BIBLE.md.
- [ ] Performance is reasonable for the agreed target desktop browser.
- [ ] PR includes screenshots plus a short play route.

## Delivery rule

Commit/push once the walkable blockout works, open or update the draft PR, then submit a separate, reviewable pass for major composition changes rather than burying them in a final mega-commit.
