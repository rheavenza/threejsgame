# Working Title TBD

A colorful 3D pixel-art life-sim action RPG built with Three.js.

The project is in **pre-production / concept exploration**. Its visual north star is a sunlit fantasy valley: emerald hills, luminous chartreuse grass, cyan-blue water, warm ochre buildings, distant slate-blue mountains, expressive pixel-clustered clouds, and a small traveler looking toward a lived-in town beneath an ancient castle. The look should feel more pixelated than the supplied painterly reference while retaining its depth, faceted forms, and welcoming light.

The game combines:
- a life-sim-first opening in a peaceful settlement;
- gradual belonging through work, friendships, a home, romance, and eventually family/adoption systems;
- layered third-person action combat and interconnected, challenging dungeons;
- character-driven conflicts where each person has partial information and understandable motives;
- a long-running mystery about names, identity, memory, and who gets to define a person.

**Nothing in the concept is locked yet.** Treat design docs as proposals until the project owner explicitly marks a decision LOCKED.

## Start here

- [Design concept](docs/DESIGN.md)
- [Art bible](docs/ART_BIBLE.md)
- [Technical architecture](docs/ARCHITECTURE.md)
- [Asset generation pipeline (proposed)](docs/ASSET_PIPELINE.md)
- [First 30 minutes](docs/FIRST_30_MINUTES.md)
- [World and narrative bible](docs/WORLD_BIBLE.md)
- [Roadmap](docs/ROADMAP.md)
- [Agent workflow](docs/WORKFLOW.md)
- [Codex instructions](AGENTS.md)
- [Decision log](docs/DECISIONS.md)
- [Testing strategy](docs/TESTING.md)
- [Sprint tickets](docs/tickets/)

## Planned stack

- Three.js + TypeScript
- Vite for local development and builds
- Vitest for unit tests
- Playwright or browser automation for selected smoke tests once the app shell exists

These are proposed defaults pending the first implementation ticket.

## Workflow

GitHub is the source of truth. Implement one ticket at a time on a dedicated branch, commit each meaningful/testable increment, push early, and open or update a pull request at the first useful review stage. Do not silently lock design decisions or expand ticket scope.

See `AGENTS.md` and `docs/WORKFLOW.md` before implementing.
