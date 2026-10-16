# Game Design Concept (Working Draft)

**Status: EXPLORING — nothing here is canon until the owner explicitly locks it.**  
**Genre:** life-sim-first fantasy RPG with third-person action combat and dense authored exploration.  
**Engine direction:** Three.js + TypeScript in the browser; implementation details remain open until the shell ticket validates the stack.

## One-sentence pitch

A traveler arrives in a warm riverside town looking for a place to sleep and gradually builds a life there, while small disagreements about forgotten people lead toward a world-spanning mystery about names, memory, identity, and who has the power to decide what someone is.

## Emotional promise

The player should enjoy an ordinary afternoon in town enough to care when the larger story puts it under pressure. The game is not a dungeon RPG with a farming menu attached, nor a farming sim interrupted by unrelated boss fights. Daily life, relationships, exploration, and difficult choices should all reinforce the same themes.

The intended progression is:

STRANGER → KNOWN → TRUSTED → CONNECTED → ROOTED

Combat power is only one kind of growth. The player can become capable without being pushed toward kingship, leadership, or a predetermined heroic identity.

## Pillars under exploration

1. **A place worth returning to.** Towns have routines, local businesses, shared spaces, disagreements, celebrations, and visible changes over time.
2. **People who are not quest dispensers.** Major NPCs have private goals, fears, loyalties, blind spots, boundaries, and lives that continue outside player conversations.
3. **A world worth reading.** Landscapes and dungeons communicate through silhouettes, architecture, object placement, enemy behavior, shortcuts, and environmental clues—not map markers alone.
4. **Choices with competing costs.** Most important conflicts should involve understandable motives and incomplete information, not a good path and an evil path disguised as a dilemma.
5. **A beautiful world with real shadows.** The default outdoor mood is luminous and inviting. Darkness becomes more powerful because quiet, happy, ordinary life is allowed to feel sincere.

## Opening premise

The player is a traveler who is not originally from the starting settlement. They arrive without a house or guaranteed welcome and must earn a temporary place to stay through work, contribution, or trust. Their precise past and reason for travel are OPEN.

The opening should not announce a prophecy or explain the world's ancient metaphysics. Let the player learn the town's social rhythms first. A small contradiction—two residents remembering a missing person's name or history differently—creates curiosity without immediately destroying the peaceful tone.

## Life-sim direction

The first loop should support walking around town, speaking to people, helping with a local task, earning modest money or goodwill, resting, and seeing NPC routines. Long-term possibilities include buying or earning a home, decorating it, cooking, gardening, friendship, romance, marriage, and adoption/guardianship.

These systems should be designed as meaningful relationships rather than completion bars. Marriage candidates have their own goals and boundaries. A child who joins the household is a person with history, preferences, and agency—not a collectible reward. Adoption is a future-facing pillar, not required for the first prototype.

## Narrative direction

Working thematic seed:

> A monster without a name is a monster the world cannot understand. Perhaps it is destined to find its name; perhaps the act of naming is also a form of control.

This is a question, not a rule we have decided is objectively true. Explore the possibility that identity has personal, social, historical, and possibly supernatural dimensions. A person's memories, other people's memories, written records, and their actual actions may contradict each other.

A name may offer recognition, impose a label, create belonging, or remove freedom. Discovering why a character acted a certain way does not automatically excuse their actions. Some threats can be genuinely dangerous; not every monster must be redeemable.

## Character writing rules

For each major character, define:
- what they want;
- what they fear losing;
- what information they know, misunderstand, or conceal;
- what lie they tell themselves;
- what boundary they will not cross;
- what evidence might change their mind;
- how they behave when the player is not present.

Secrets should arise from character motive, not from a universal habit of everyone lying. Let the player triangulate the truth from dialogue, behavior, objects, records, and geography. Avoid a single omniscient exposition scene that resolves every uncertainty.

## Exploration and dungeon direction

Favor compact regions with high spatial density over a huge empty map. A strong dungeon uses layers, vertical routes, alternate paths, readable landmarks, shortcuts, safe pockets, and environmental storytelling. The player should sometimes see a locked gate or distant room long before discovering how to reach it.

Dungeons can embody questions about the world—who gets remembered, how order is maintained, who pays for peace—without every location becoming a lecture. Navigation, combat, secrets, and a satisfying boss or climax must work even for players who ignore most lore.

## Combat direction

Explore responsive third-person action combat with readable enemy telegraphs, reliable dodge timing, clear hit feedback, interesting positioning, and opportunities to learn enemy behavior. Skill and observation should matter more than grinding large stat values. Do not force every encounter into a moral referendum.

## Explicit non-goals for the first prototype

- No full open world.
- No complete relationship, marriage, or adoption system.
- No complex crafting/economy simulation.
- No production-ready combat roster.
- No final explanation of the world's metaphysics.
- No final game title, character canon, factions, or ending.

The first prototype proves one thing: is a small, sunlit town with a few memorable people and an inviting visual style enjoyable to inhabit?

## Open questions

- Is the identity mystery supernatural, political, social, or a combination?
- What is the player's immediate reason for traveling?
- What does a name change in the world, if anything?
- Can memories be altered, copied, inherited, or disputed?
- What makes the first town peaceful, and what compromises keep it that way?
- What level of player-authored backstory is desirable?
- How should the camera, combat lock-on, and pixel rendering interact?
