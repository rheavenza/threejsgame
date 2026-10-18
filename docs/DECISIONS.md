# Decision Log

This file records decisions and their status so agents do not mistake brainstorming for canon.

## Status vocabulary

- **LOCKED:** project owner explicitly approved; agents must follow it.
- **WORKING:** current preferred direction, but still open to revision.
- **OPEN:** several options remain under consideration.
- **DEFERRED:** intentionally not decided until a later milestone.
- **REJECTED:** considered and declined; do not quietly reintroduce.

## Current entries

| ID | Topic | Status | Current direction |
|---|---|---|---|
| D-001 | Target repository | LOCKED | rheavenza/threejsgame |
| D-002 | Engine direction | WORKING | Three.js + TypeScript; first sprint should validate the stack |
| D-003 | Broad visual mood | WORKING | Luminous emerald/blue/ochre valley with a distinctly pixelated, faceted 3D appearance |
| D-004 | Opening structure | WORKING | Outsider traveler; peaceful town; earn temporary shelter; small social mystery late in first 30 minutes |
| D-005 | Main theme | WORKING | Names, identity, memory, belonging, and who gets to define a person |
| D-006 | Game title | OPEN | Do not invent a final title |
| D-007 | World metaphysics | OPEN | Naming may have social, political, or supernatural consequences; no final rule |
| D-008 | Protagonist history | OPEN | Traveler from outside the town; exact motivation/backstory undecided |
| D-009 | Full life-sim scope | DEFERRED | Build the foundation first; marriage/adoption are future systems |
| D-010 | Visual reference file | LOCKED | `docs/reference/valley-look-reference.png` (1448×1086 PNG, sha256 `5d58991f16c41c61ddc474dc218d9ec58d0daf473be202fd204b28ff52798998`) is the owner-selected valley vista reference. Committed 2026-10-18. Agents may compare look-dev output against this file. |
| D-011 | Exact pixel resolution | OPEN | Compare several internal resolutions during look-dev |
| D-012 | Rendering/physics/gameplay libraries | DEFERRED | Select only when a testable ticket needs them |
| D-013 | Asset generation pipeline | WORKING | Codex-driven, MCP-based pipeline (concept -> mesh -> cleanup -> rig -> motion -> preview -> publish) with owner gates G1/G2; see docs/ASSET_PIPELINE.md. Proposal only; nothing implemented |
| D-014 | Asset generation providers | OPEN | NVIDIA-hosted FLUX/TRELLIS endpoints for prototyping only (API trial terms); rig/motion providers (UniRig, Kimodo) and GPU hosting undecided; no provider is approved for shipped assets |
| D-015 | Asset provenance and license status | WORKING | Every generated asset carries a manifest; license_status stays `prototype` until the owner marks it `cleared` |
| D-016 | Canonical humanoid skeleton | OPEN | Propose one ~22-bone body skeleton, no fingers at first; decide before any rigging ticket |
| D-017 | Asset budgets (cost caps, regeneration limits, file-size cap) | OPEN | Proposed defaults are in AGENTS.md section 12.4 and 12.7; owner to confirm or change |

## Change rule

Any major creative or architecture change must update this log in the same PR as the design/ticket that authorizes it. If two documents conflict, do not guess which is newer; stop, report the conflict, and request owner direction.
