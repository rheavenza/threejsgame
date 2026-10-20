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

## Run the prototype

Requires Node.js 22.12+ (or another LTS release, such as 24) and npm. Vite alone also
runs on Node 20.19+, but Vitest 5, which `npm test` uses, does not support Node 20, so
20.19 is no longer enough for the whole toolchain.

From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). To make a
production build, run:

```sh
npm run build
```

To serve the built output locally, run `npm run preview` after the build.

To run the unit tests (Vitest), and to typecheck without emitting:

```sh
npm test
npm run typecheck
```

### Look-dev controls

The scene renders through a low-resolution pixel pipeline. Switch the internal
resolution with the on-screen control, or with a query parameter:

```
http://localhost:5173/?res=320x180
http://localhost:5173/?res=426x240
http://localhost:5173/?res=480x270
```

The internal size is derived from the viewport, so it changes with the window
while the upscale stays a whole-number nearest-neighbour expansion. The current
internal resolution and upscale factor are shown in the panel.

To capture screenshot evidence headlessly (Chromium via Playwright) at every
preset, and to fail on any console error:

```sh
npm run capture
```

Output goes to `docs/evidence/T00-002/`. See [docs/LOOKDEV_NOTES.md](docs/LOOKDEV_NOTES.md)
for the pipeline notes, the resolution trade-offs, and the known gaps against the
reference image.

### Shell smoke test

To exercise the application shell headlessly — normal startup, the browser
without WebGL, WebGL context loss and restore, and resize — and fail on any
uncaught error:

```sh
npm run smoke
```

Output and screenshots go to `docs/evidence/T00-007/`.

### When the scene cannot render

If the browser has no WebGL, or cannot create a context, the shell shows a short
explanation instead of a blank page. The canvas is not appended and no uncaught
error is thrown. If the GPU context is lost while the page is open, rendering
pauses, a console warning is logged, and the scene redraws automatically once
the browser restores the context.

```mermaid
flowchart TD
  A[Load page] --> B{WebGL available?}
  B -- No --> C[Show "could not be drawn" notice]
  B -- Yes --> D[Create renderer and pipeline]
  D --> E[Observe host size]
  E --> F[Render frame]
  F --> G{Context lost?}
  G -- Yes --> H[Pause drawing, warn]
  H --> I[Browser restores context]
  I --> J[Rebuild target, redraw]
  J --> F
```


