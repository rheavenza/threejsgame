# Assetforge Local Setup

Assetforge is a small local stdio MCP server. This setup supports specification validation, local job records, status/list queries, recorded-cost reporting, and prototype provenance manifests. It does **not** generate, clean, QA, or publish assets.

## Requirements

- Node.js 18 or newer and npm.
- Codex CLI (project configuration and MCP invocation verified with 0.162.1); `codex mcp list` is the discovery check.
- No Python, `uv`, Blender, GPU, network provider, or API credential is needed for the offline checks.

## Install and verify offline features

From the repository root:

```sh
npm ci --prefix tools/assetforge
npm --prefix tools/assetforge run check
npm --prefix tools/assetforge test
npm --prefix tools/assetforge run validate-sample
npm --prefix tools/assetforge run smoke
npm --prefix tools/assetforge run validate-manifest -- assets/_work/assetforge/<job-id>/manifest.json
```

The smoke script starts the MCP server implementation with the SDK's linked in-memory transport, validates the sample prop and an invalid spec, creates and queries a job, reconstructs the server and recovers the persisted record, reports recorded cost, and writes then schema-validates a sample manifest. The project-scoped Codex configuration uses the real stdio transport; a live Codex invocation is also part of verification. After `manifest_create`, use `validate-manifest` with the returned `<job-id>` to independently check the saved JSON. No generation endpoint is called. Runtime job data and manifests live below `assets/_work/assetforge/`, which Git ignores.

## Register with Codex

This repository includes `.codex/config.toml` with a project-scoped `assetforge` MCP entry. The installed Codex CLI's `codex mcp add --help` does not offer a project scope option; that command writes user-level configuration, so use the checked-in project configuration instead. Codex loads `.codex/config.toml` only after the developer trusts this repository. Review the server command and source before trusting it.

Start Codex with the repository as its working directory, trust the project when prompted, and run:

```sh
codex mcp list
```

The configuration runs `node tools/assetforge/src/server.mjs` with the repository root as its working directory. `spec_validate` is auto-approved because it is read-only; state-writing tools remain subject to the active Codex approval policy. A non-interactive run with approval policy `never` denies MCP calls; use interactive approval or an approved auto-review path. If Codex was already open before the project configuration was added, restart it after trusting the repository. The same project MCP registration is used by the CLI and compatible Codex IDE clients.

For a one-off manual server check outside Codex:

```sh
npm --prefix tools/assetforge ci
npm --prefix tools/assetforge start
```

The server speaks MCP on stdin/stdout; diagnostics go to stderr. The local smoke script uses the SDK's linked in-memory transport so it can deterministically restart the server implementation and store in one process; the separate Codex invocation verifies the configured stdio transport.

## Job and manifest behavior

- `job_create` validates and persists the request, then returns an ID with `status: blocked` and an explicit reason because this skeleton has no approved generation adapter. It makes no network request.
- A crash after a job is written but before provider dispatch is recovered as `blocked`; no job is described as generated.
- Job files are individually written to a temporary file and atomically renamed under `assets/_work/assetforge/jobs/`. This is a local single-process development store, not a multi-process database.
- `cost_report` totals only usage records stored by assetforge. A zero total and `accounting_complete: false` mean no usage is recorded; this is not an external billing statement.
- Manifests preserve the spec hash, stage names/timestamps, provider/model fields when present, output hashes when present, and `license_status: prototype`. The initial skeleton emits no output hashes, reports `qa_status: not_run`, and sets `publication_status: not_published`.

## Future providers

`NVIDIA_API_KEY` is not required or read by this ticket. `docs/ASSET_PIPELINE.md` lists NVIDIA-hosted FLUX/TRELLIS as a proposal under trial terms; it is not yet an approved/implemented provider. No Blender MCP server was installed because cleanup is out of scope and no single Blender implementation/version is approved. Optional ComfyUI and GPU workers are also not required. A future provider ticket must name and approve the adapter, model, credentials, license terms, and cost cap before adding network calls.

## Troubleshooting

- **No server in `codex mcp list`:** verify the CLI is running from this trusted repository, `.codex/config.toml` is present, and Node.js is on `PATH`; restart Codex after trusting the project.
- **Module not found:** run `npm ci --prefix tools/assetforge` from the repository root.
- **Invalid stored record:** the server fails explicitly rather than dropping malformed job data. Preserve the affected file under `assets/_work/assetforge/jobs/` for inspection.
- **Job is blocked:** expected in this ticket. No provider or generation route is enabled.
