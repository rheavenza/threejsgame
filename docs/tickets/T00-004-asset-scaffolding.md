# T00-004 — Asset Pipeline Scaffolding and Provider Readiness

**Status:** PROPOSED — not scheduled. The planning/review agent sets the real status and points.
**Sprint:** 0 — Browser shell and visual proof
**Points:** 2 (rough estimate)
**Worker:** unassigned
**Base branch:** master
**Suggested implementation branch:** work/T00-004-asset-scaffolding-codex
**PR target:** master
**Depends on:** T00-003 (assetforge skeleton, merged in PR #4)

## Objective

Close the gap between "the assetforge server exists and passes its own tests" and
"an asset ticket can actually run". `AGENTS.md` §12.2 orders the worker to read
`assets/style_profile.json` and compare against `assets/golden_assets/`, and §12.7
publishes into `public/assets/`. None of those paths existed before this ticket.

This ticket creates the scaffolding and records the exact state of provider
readiness. It does **not** generate any asset.

## Read first

- AGENTS.md §12
- docs/ASSET_PIPELINE.md (§5 providers, §7 style consistency, §9 QA)
- docs/ART_BIBLE.md §3 palette
- docs/DECISIONS.md (D-013 to D-017)
- docs/tickets/T00-003-assetforge-skeleton.md

## Allowed scope

- `assets/style_profile.json` — the deterministic post-processing profile referenced by the pipeline.
- `assets/golden_assets/` and `public/assets/` directories with explanatory READMEs.
- `assets/_work/` scratch directory (git-ignored).
- `.gitignore` additions required by the above.
- Documentation of what is still missing before a provider-backed run is possible.

## Out of scope

- Any concept, mesh, texture, rig, or motion generation.
- Installing or approving a provider adapter (see Open questions).
- Changing `docs/ART_BIBLE.md` palette values or `docs/DECISIONS.md` statuses.
- Blender MCP or ComfyUI wiring.
- `src/` application code.

## Acceptance criteria

- [ ] `assets/style_profile.json` exists, is valid JSON, and its palette matches `docs/ART_BIBLE.md` §3 exactly.
- [ ] Every path referenced by `AGENTS.md` §12.2 and §12.7 exists in the tree.
- [ ] `assets/_work/` is present but not committable (`git check-ignore` confirms).
- [ ] No generated asset files are committed.
- [ ] The ticket states plainly which stages can and cannot run today.

## Verification

- `node -e` JSON parse of `style_profile.json`, with the palette compared key-by-key against the art bible table.
- `git check-ignore -v assets/_work/`.
- `npm run check`, `npm test`, and `npm run smoke` in `tools/assetforge`.
- Confirm no `public/assets/<category>/` content was added.

## Open questions for the owner

1. **Provider approval.** D-014 is OPEN. The registry in
   `tools/assetforge/src/providers/registry.mjs` currently ships **zero** adapters,
   so every stage returns `available: false` with reason "No approved provider
   adapter is installed". Nothing can generate until an adapter is written and a
   provider is approved.
2. **`NVIDIA_API_KEY`.** Not present in this environment. AGENTS.md §12.6 requires
   it to come from the environment only.
3. **Cost cap.** AGENTS.md §12.4 leaves the per-ticket cap to the ticket; asset
   tickets must state one.
4. **T00-005 scope.** A provider adapter is pipeline tooling, which AGENTS.md §12.1
   makes a separate ticket from generating assets with it. Suggest T00-005
   "NVIDIA concept + mesh adapters" and T00-006 "Blender cleanup + QA" to match
   `docs/ASSET_PIPELINE.md` §12.

## Provenance

Created while bringing the repository to an implementation-ready state. The
scaffolding files were written by the same session that discovered T00-003 was
merged but unusable end-to-end because its documented paths did not exist.
