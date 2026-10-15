# T02-002 — First Identity Mystery and Minimal Persistence

**Status:** BLOCKED on T02-001 and owner review of the mystery beat  
**Sprint:** 2 — A reason to stay  
**Points:** 5  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T02-002-identity-mystery-persistence-codex  
**PR target:** master  
**Depends on:** T02-001

## Objective

Add one subtle narrative inconsistency near the end of the first-session loop and persist the minimum state needed to experience the loop consistently after reload.

## Allowed scope

- One contradiction involving a missing/disputed name or person, as approved by the owner.
- Distinguish world facts from what the player has learned.
- Simple journal or clue flag only if needed to preserve the discovery.
- Minimal local save for task/shelter/day/story state, with an explicit schema version.
- Tests for serialization, reload defaults, and the mystery trigger conditions.

## Out of scope

- Explaining the whole identity metaphysics.
- A universal memory-editing system, evidence board, faction campaign, multiple endings, or full save migration framework.
- A forced combat encounter or a town-destroying cliffhanger.

## Acceptance criteria

- [ ] Mystery appears only after the intended opening beats or conditions.
- [ ] It is conveyed through a human moment, not a long exposition dump.
- [ ] At least two accounts or sources disagree in a meaningful way.
- [ ] The player can leave the scene and continue normal play; curiosity, not urgency, drives the next step.
- [ ] Relevant task/day/clue state survives a reload or clearly reports the known limits.
- [ ] Save data has a schema version and safe fallback for absent/invalid local data.
- [ ] Targeted tests and build pass.
- [ ] Owner explicitly accepts the pacing and tone before the story gate is marked DONE.

## Delivery rule

Open/update a draft PR as soon as the trigger and state persistence can be reproduced. Keep narrative rewrites behind owner review rather than improvising additional lore.
