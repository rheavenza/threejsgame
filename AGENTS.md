# Codex and Agent Contract

This file governs every implementation, content, and asset agent working in this repository. Read it before editing. The project owner is the final authority on scope and creative decisions.

## 1. Mission

Build a small, polished, testable Three.js prototype for a colorful, pixelated 3D life-sim fantasy RPG. The immediate proof is not a full game: it is a beautiful valley vista leading into a welcoming town, a few memorable NPCs, one useful interaction, and a first quiet identity mystery.

Current design status is exploratory. Do not treat WORKING or OPEN ideas as canon. Read the assigned ticket and its linked documents before changing code.

## 2. Source-of-truth order

If requirements conflict, follow this order and report the contradiction rather than guessing:

1. Explicit current instruction from the project owner.
2. Assigned READY ticket and its acceptance criteria.
3. This AGENTS.md contract.
4. Relevant technical and art authority docs: docs/ARCHITECTURE.md, docs/ART_BIBLE.md, docs/DESIGN.md, docs/WORLD_BIBLE.md.
5. docs/DECISIONS.md.
6. docs/ROADMAP.md and docs/TASKLIST.md for sequence/status only.

Tickets define the authorized scope. Roadmap text is not permission to implement future features. If a ticket conflicts with a LOCKED decision, stop and ask. If an idea is OPEN or WORKING, use only a small reversible placeholder when the ticket explicitly allows it.

## 3. Current product scope

- Target repository: rheavenza/threejsgame.
- Runtime direction: Three.js + TypeScript, using Vite as the proposed development server/build tool.
- Art direction: luminous, saturated emerald/green, sky/cyan blue, warm ochre, and slate-blue distance; faceted 3D forms; a deliberately pixelated presentation.
- First experience: outsider traveler arrives at a peaceful town, meets residents, contributes to a modest local need, earns temporary shelter, and notices one subtle narrative inconsistency.
- Future intent: deeper life simulation, home ownership, relationships, marriage, adoption/guardianship, action combat, and layered dungeons. These are not automatic requirements for the first ticket.
- Do not import unrelated lore, names, code, or decisions from other repositories.

## 4. Role expectations

### Project owner
Decides the game's creative direction, locks decisions, accepts subjective art/feel work, and approves merge decisions.

### Planning/review agent
Maintains design docs, splits the roadmap into small tickets, checks repository reality, reviews implementation diffs and verification evidence, and requests changes where needed.

### Codex / implementation worker
Implements only the assigned ticket. Inspects the existing code, writes the smallest coherent change, tests it, commits it, pushes its branch, and opens/updates a PR. It does not silently enlarge scope, rewrite design authority, mark owner-only visual gates as passed, or merge its own PR.

## 5. Mandatory Git workflow

### Preflight

Before modifying files, run and report the equivalent of:

    pwd
    git rev-parse --show-toplevel
    git remote -v
    git fetch origin
    git branch --show-current
    git rev-parse HEAD
    git status --short

Confirm the clone is rheavenza/threejsgame, fetch succeeded, the assigned ticket exists on the target base branch, and the worktree has no unrelated changes. Preserve user changes. Never reset or clean a worktree to make it convenient.

### Branches

- Default/base branch: master unless the ticket explicitly says otherwise.
- Implementation branch: work/<ticket-id>-codex.
- Planning/design docs branch: lead/<topic> or docs/<topic>.
- One ticket per implementation branch and PR.
- Do not commit implementation directly to master.
- Do not force-push or rewrite published history unless the owner explicitly authorizes it.
- If the current branch or base commit does not match the ticket, stop and report the mismatch.

### Commit progression

Commits are the work log; do not hide all progress in one final mega-commit.

- Commit each meaningful, reviewable increment using imperative, scoped messages, e.g. feat(world): add walkable meadow blockout.
- Keep commits coherent and small enough to review or revert.
- Avoid unrelated formatting, dependency upgrades, asset regeneration, and drive-by refactors.
- Include tests in the same logical commit when practical.
- Never claim code is tested unless the command was actually run and its outcome observed.
- Do not commit secrets, local env files, caches, build output, or large generated files without explicit approval.

### Pull request timing

The PR is not reserved for the end of a long ticket.

1. As soon as a major change reaches a useful, testable stage, commit and push it.
2. Open a **draft PR** immediately when that stage is reviewable, even if the ticket still has acceptance criteria outstanding.
3. Add subsequent meaningful commits to the same ticket branch and update the same PR. In the PR description, list what works now, what's incomplete, tests run, and the next milestone.
4. When the ticket's full acceptance criteria pass, update the handoff report and mark the PR ready for review.
5. Keep the PR narrow. If work naturally separates into independently testable features, split it into separate tickets/PRs before implementation instead of creating one sprawling branch.
6. Never merge your own PR. The owner/reviewer decides acceptance and merge.

If the GitHub connector or credentials do not permit pushing/opening a PR, do not pretend it worked. Provide the exact branch, commit, error, and next command needed.

## 6. Ticket discipline

- Work only on one assigned ticket at a time.
- Tickets should normally be 1–5 story points and deliver a visible or verifiable increment.
- Read the ticket in full, then follow only relevant cross-references.
- Respect Allowed Scope and Out of Scope.
- If acceptance criteria are ambiguous, stop and ask before making an irreversible design choice.
- Add a ticket for extra work rather than smuggling it into the current PR.
- Do not alter the official task status; the planning/review agent updates status after acceptance/merge.
- Mark human art, narrative, or feel gates as awaiting owner review until the owner explicitly accepts them.

## 7. Design and code rules

- Keep Three.js scene objects as presentation, not as the sole source of truth for story, relationship, or save state.
- Separate reusable systems from scene-specific content. Avoid building a generic engine or full ECS before the prototype needs it.
- Prefer TypeScript types, explicit ownership, and small modules with clear boundaries.
- Data that designers are likely to revise should be separated from runtime logic when practical.
- Avoid giant components/files, implicit global state, magic strings, and duplicated authoritative state.
- Minimize dependencies. Add a library only when the current ticket proves the need and the choice is explained.
- Keep visuals performant and deterministic enough for repeated tests.
- Do not regenerate or replace assets broadly to solve a local visual issue.

## 8. Visual tickets

Before presentation-facing work, read docs/ART_BIBLE.md. Test the asset in the actual gameplay scene at the intended camera distance and pixel resolution, not just in isolation.

For visual milestones, include:
- screenshot(s) of the testable scene at native game scale;
- exact viewport and internal render resolution;
- any known compromises or artifacts;
- a short statement against the art checklist.

The owner makes the final subjective visual acceptance decision. A screenshot or a passing import test alone does not mean the art gate passed.

The supplied valley reference is not currently stored in the repository. Do not claim an agent has compared its output to the actual image until the reference file is committed or otherwise explicitly provided to the worker.

## 9. Verification

- Discover the repository's actual scripts and tooling before assuming commands.
- Run relevant targeted tests first, then the broader available suite.
- At minimum, for a runnable app, verify dependency install, production build, and a browser smoke test if available.
- For rendering work, verify no console errors and capture a screenshot at a fixed viewport.
- For world interaction, test both the success path and at least one failure/edge path.
- Record exact commands and results in the PR.
- If a check cannot run, state why. Never invent passing tests.

## 10. Completion report

Every PR must include:
- ticket ID and objective;
- concise change summary;
- files/modules changed;
- commits or stage reached;
- exact checks run and results;
- screenshot or reproduction instructions for visual/user-facing changes;
- known limitations and follow-up tickets;
- confirmation that out-of-scope files were not changed.

A reviewer must be able to reproduce the result without relying on private chat context.

## 11. Hard stops

Stop and report instead of proceeding when:
- the repository/base branch/assigned ticket cannot be verified;
- the worktree contains unrelated user changes;
- requirements conflict with current locked decisions;
- a requested change requires a new major dependency or architecture decision not authorized by the ticket;
- required visual reference material is unavailable and visual matching is the core acceptance criterion;
- a test failure suggests a broader regression outside the ticket's safe scope.

The goal is frequent, testable progress with clean Git history—not maximum lines of code per session.
