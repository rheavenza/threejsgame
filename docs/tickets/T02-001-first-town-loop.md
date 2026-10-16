# T02-001 — NPC Conversation, Contribution Task, and Temporary Shelter

**Status:** BLOCKED on Phase 1 acceptance  
**Sprint:** 2 — A reason to stay  
**Points:** 5  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T02-001-first-town-loop-codex  
**PR target:** master  
**Depends on:** T01-001 and T01-002

## Objective

Implement the first small social loop: meet a few residents, help with a practical need, and earn a temporary place to sleep. Keep the simulation narrow but structure state so more NPCs can be added later.

## Allowed scope

- Three or four placeholder NPCs with distinct visible roles and simple routine anchors.
- Short, data-driven dialogue or clearly separated dialogue content.
- One practical task with visible before/after state.
- A temporary shelter interaction and rest action.
- Minimal player state for the task and shelter access.
- Small tests for dialogue selection/task completion where practical.

## Out of scope

- Final character canon or romance candidates.
- Full relationship system, marriage, adoption, farming, crafting economy, or extensive quest editor.
- Complex autonomous behavior for every NPC.

## Acceptance criteria

- [ ] Player can initiate and exit a conversation reliably.
- [ ] At least three NPCs read as distinct through role, placement, and dialogue.
- [ ] One contribution task can be completed and gives clear feedback.
- [ ] Temporary shelter becomes available through an understandable condition.
- [ ] Player can rest and return to a known town state.
- [ ] NPCs can be expanded through data/configuration without duplicating the full interaction system.
- [ ] No major story fact exists only as a transient UI string.
- [ ] Build and targeted tests pass; PR explains manual verification.

## Narrative constraint

Keep the town peaceful and specific. NPCs should not all speak cryptically or behave as if they know the central mystery. Most daily interactions are ordinary, and that ordinariness is what gives later revelations weight.
