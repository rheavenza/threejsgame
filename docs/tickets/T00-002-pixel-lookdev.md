# T00-002 — Pixel Resolution Look-Dev

**Status:** READY — T00-001 is merged (PR #2) and the reference image is committed (D-010 LOCKED), so both former blockers are cleared.  
**Sprint:** 0 — Browser shell and visual proof  
**Points:** 3  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T00-002-pixel-lookdev-codex  
**PR target:** master  
**Depends on:** T00-001 (merged). Reference for comparison: `docs/reference/valley-look-reference.png`

## Objective

Create a small controlled experiment for the game's pixelated 3D presentation. The player should see real 3D depth and faceted forms, but with larger, deliberate pixel clusters than the supplied painterly reference.

## Read first

- AGENTS.md
- docs/ART_BIBLE.md
- docs/ARCHITECTURE.md
- docs/TESTING.md

## Allowed scope

- One render pipeline abstraction for low-resolution rendering and nearest-neighbor upscaling.
- A small debug control or configuration for candidate internal resolutions, such as 320×180, 426×240, and 480×270.
- A look-dev scene with large sky/cloud masses, hill forms, a winding path or river, simple tree clusters, warm settlement blocks, and a distant castle silhouette.
- A short note explaining the chosen technical approach and known limitations.
- Screenshot evidence at the actual target viewport.

## Out of scope

- The entire valley level or a detailed building asset kit.
- Final palette lock, final title treatment, CRT effects, heavy dithering, or post-processing stack.
- Replacing the renderer or adding a rendering framework without owner approval.

## Acceptance criteria

- [ ] internal resolution can be changed without changing layout dimensions.
- [ ] nearest-neighbor upscaling is visibly crisp and survives viewport resizing.
- [ ] aspect ratio, high-DPI display, and resize behavior are handled intentionally.
- [ ] scene composition follows the art bible: foreground frame, destination, layered hills, luminous sky, and distant landmark.
- [ ] foliage, path edges, water highlights, distant shapes, and UI remain readable at normal gameplay size.
- [ ] captures show at least two candidate resolutions and state the output viewport.
- [ ] build and relevant smoke tests pass.
- [ ] owner reviews the screenshots before the look direction is treated as accepted.

## Delivery rule

Push each working milestone and update a draft PR. Do not make the internal resolution permanent until the owner has reviewed the trade-offs.
