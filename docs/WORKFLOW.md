# GitHub and Sprint Workflow

## Purpose

Keep Codex implementation work reviewable, testable, and reversible. GitHub is the handoff boundary and the source of truth for accepted progress.

## Lifecycle

1. **Plan:** The owner and planning agent brainstorm; decisions remain OPEN/WORKING until explicitly locked.
2. **Ticket:** Write a narrow ticket with objective, dependencies, allowed scope, acceptance criteria, test commands, and handoff evidence.
3. **Ready:** Mark the ticket READY only when its requirements and dependencies are concrete enough to implement.
4. **Branch:** Codex fetches the latest master and uses work/<ticket-id>-codex.
5. **Implement:** Inspect first, make one meaningful change at a time, run targeted checks, and commit.
6. **Early delivery:** At the first useful testable stage, push and open a draft PR. Do not wait for a large ticket to be completely finished.
7. **Iterate:** Push each meaningful follow-up commit to the same branch and update the PR with test results and remaining work.
8. **Handoff:** When acceptance criteria pass, mark the PR ready for review and provide reproduction steps/evidence.
9. **Review:** The reviewer checks the exact diff, tests, scope, and visual evidence. Request changes on the same PR when possible.
10. **Accept:** The owner/reviewer decides whether to merge. Only after merge is the ticket marked DONE.
11. **Track:** Update docs/TASKLIST.md and docs/ROADMAP.md after the change is accepted; never mark subjective owner gates complete without explicit approval.

## Branch and PR naming

- Implementation branch: work/T00-001-project-shell-codex.
- Design/documentation branch: docs/design-art-bible-workflow.
- PR title: [T00-001] Build minimal Three.js app shell.
- Commit examples:
  - docs: establish working concept and pixel-art direction
  - feat(render): add nearest-neighbor pixel pipeline
  - feat(town): add first walkable village blockout
  - test(npc): cover schedule transition conditions
  - fix(interaction): prevent duplicate prompt registration

Keep conventional prefixes simple: feat, fix, test, docs, refactor, chore.

## The testable-stage rule

A large change should not remain local or unreviewed until all adjacent work is complete. For example:
- Stage A: browser opens and renders a colored Three.js scene → commit, push, draft PR.
- Stage B: pixel render pipeline has a resolution toggle → commit and update that PR.
- Stage C: terrain, path, and landmark silhouette can be walked through → commit and update PR, or use a separate ticket if it is independently reviewable.
- Stage D: interaction works with an NPC and tests cover its state → use the ticket's PR to deliver.

Prefer one PR per ticket; use multiple tickets when features have separate acceptance criteria. Opening one draft PR early and updating it as work progresses satisfies early review without fragmenting every tiny commit into a separate PR.

## Sprint structure

- Keep implementation tickets to 1–5 points where possible.
- A sprint should end with something a human can run, see, or evaluate.
- Avoid parallel implementation tasks that touch the same files or shared architecture at once.
- Every sprint has a demo/acceptance checklist and explicit deferred scope.
- At sprint end, run a clean build and the most relevant tests, update the tracker, and identify the next dependency-ready ticket.
- Do not begin the next dependent ticket merely because code has been written; wait for review/merge when the next ticket depends on the accepted version.

## Ticket template

Each ticket should contain:

- ID, title, status, points, sprint, target branch, implementation branch, dependencies.
- User-facing objective and why it matters.
- References to authoritative docs.
- Allowed scope and explicit out-of-scope list.
- Acceptance criteria phrased so another person can verify them.
- Required tests and visual evidence.
- Demo/reproduction steps.
- Known risks and questions that need owner decisions.

## Reviews and merges

Review for correctness, scope, maintainability, accessibility/readability, performance, and whether the change actually demonstrates the promised result. For visuals, human inspection is mandatory. A green build does not replace playtesting. Do not merge work with failing required checks unless the owner explicitly approves an exception and it is recorded.

## Traceability

Every implementation PR links its ticket. Every ticket links its PR when one exists. Task status changes only after merge. When the design changes, update the relevant authority doc and decision log in a separate design commit or a clearly scoped design PR before asking Codex to implement it.
