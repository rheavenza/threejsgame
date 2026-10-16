# T00-003 — Assetforge Skeleton

**Status:** READY  
**Sprint:** 0 — Technical foundation  
**Points:** 3  
**Worker:** Codex  
**Base branch:** master  
**Worker branch:** work/T00-003-assetforge-skeleton-codex  
**PR target:** master  
**Depends on:** docs/ASSET_PIPELINE.md; Node.js 18+ and npm. Independent of the Three.js shell and T00-002.

## Objective

Implement the smallest locally verifiable `assetforge` MCP foundation for validating asset specifications, recording recoverable jobs, and producing honest provenance manifests. This ticket does not generate or publish assets.

## Read first

- AGENTS.md (especially §§5 and 12)
- docs/ASSET_PIPELINE.md
- docs/ART_BIBLE.md
- docs/ARCHITECTURE.md
- docs/WORKFLOW.md
- docs/DECISIONS.md
- docs/TASKLIST.md
- docs/tickets/T00-002-pixel-lookdev.md

## Allowed scope

- A small Node.js MCP stdio server using the official MCP SDK.
- A versioned JSON Schema for prop-first asset specs and actionable validation errors.
- A persistent job store below `assets/_work/`, including safe atomic writes and restart recovery.
- MCP tools `spec_validate`, `job_create`, `job_status`, `job_list`, `cost_report`, and `manifest_create`.
- Explicit non-generation behavior when no provider adapter/credentials are available; no generation endpoint calls.
- A narrow provider adapter boundary, with no provider implementation until a provider ticket approves one.
- Provenance manifest schema/serialization with stage metadata, timestamps, input/spec hashes, provider/model identifiers when present, output hashes when present, and prototype license status.
- Project-scoped Codex registration, setup/recovery documentation, and focused automated tests.
- Ignore `assets/_work/` and other local dependency/build artifacts.
- Add this ticket to the task tracker without changing other ticket or gate statuses.

## Out of scope

- Image, mesh, texture, rig, or motion generation; provider credentials or endpoint calls.
- Blender, ComfyUI, GPU worker, or other MCP server installation.
- Mesh cleanup, rendering, automated QA metrics, asset publishing, or committing generated assets.
- Changes to the game runtime, art bible, locked decisions, or approved reference material.
- Claims that a job passed QA or was published.

## Acceptance criteria

- [ ] Codex can start an actual stdio MCP server and discover the scoped tools.
- [ ] Valid sample prop specs pass; invalid specs return field-specific guidance.
- [ ] A job receives an ID, deterministic status, timestamps, hashes, and a persisted record under `assets/_work/`.
- [ ] Restarting the server recovers the job record and exposes it through `job_status` and `job_list`.
- [ ] Provider absence is explicit; creating a job makes no external request and cannot imply generation occurred.
- [ ] `cost_report` reports recorded costs only and clearly states when no provider usage is recorded.
- [ ] A manifest serializes against a versioned schema and does not claim QA approval or publication.
- [ ] Working files remain ignored by Git; secrets are absent from tracked config, logs, and manifests.
- [ ] Automated tests cover valid/invalid specs, job creation/status, manifest serialization, and restart recovery.
- [ ] Setup documentation gives exact install, test, Codex trust, registration, discovery, and troubleshooting commands.

## Verification commands

From the repository root:

```sh
npm ci --prefix tools/assetforge
npm --prefix tools/assetforge run check
npm --prefix tools/assetforge test
npm --prefix tools/assetforge run validate-sample
npm --prefix tools/assetforge run smoke
npm --prefix tools/assetforge run validate-manifest -- assets/_work/assetforge/<job-id>/manifest.json
git diff --check
codex mcp list
```

The smoke command must start and stop the MCP server implementation locally, validate valid/invalid specs, create/query a job, restart and recover it, and validate a sample manifest. A separate real Codex MCP invocation verifies the configured stdio transport. These checks must not call any image/mesh endpoint or require paid credentials. The base branch currently has no Three.js package/build scripts; browser app checks are not part of this ticket.

## Limitations and handoff

The job store is a local single-process development store, not a multi-writer database. Generation providers, provider pricing, QA, visual gates, and publishing remain future ticket work. A completed T00-003 PR does not satisfy T00-002's render-pipeline requirements or its T00-001/reference dependencies.
