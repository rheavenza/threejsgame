import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import path from "node:path";
import { JobStore } from "./job-store.mjs";
import { createManifest } from "./manifest.mjs";
import { hashSpec, validateManifest, validateSpec } from "./validation.mjs";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(serverDirectory, "../../..");
const dataRoot = path.resolve(process.env.ASSETFORGE_DATA_DIR ?? path.join(repositoryRoot, "assets/_work/assetforge"));
const store = new JobStore(path.join(dataRoot, "jobs"));

function textResult(value, isError = false) {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
    ...(isError ? { isError: true } : {}),
  };
}

export function createServer(jobStore = store, workRoot = dataRoot) {
  const server = new McpServer({ name: "assetforge", version: "0.1.0" });

  server.registerTool("spec_validate", {
    description: "Validate an asset specification against the versioned asset-spec v1 JSON Schema. Does not generate an asset.",
    inputSchema: { spec: z.record(z.string(), z.unknown()) },
  }, async ({ spec }) => {
    const result = validateSpec(spec);
    return textResult({ schema_version: "1.0", ...result }, !result.valid);
  });

  server.registerTool("job_create", {
    description: "Persist a validated asynchronous asset request and return its job ID. This skeleton has no generation providers; the job is explicitly blocked without making a network request.",
    inputSchema: { spec: z.record(z.string(), z.unknown()) },
  }, async ({ spec }) => {
    const validation = validateSpec(spec);
    if (!validation.valid) return textResult({ valid: false, errors: validation.errors }, true);
    try {
      const job = await jobStore.create(spec, hashSpec(spec));
      return textResult(summarizeJob(job));
    } catch (error) {
      return textResult({ error: error.message }, true);
    }
  });

  server.registerTool("job_status", {
    description: "Read the persisted status and stage history for one assetforge job ID.",
    inputSchema: { job_id: z.string().uuid() },
  }, async ({ job_id }) => {
    const job = await jobStore.get(job_id);
    return job ? textResult(summarizeJob(job)) : textResult({ error: `Job '${job_id}' was not found.` }, true);
  });

  server.registerTool("job_list", {
    description: "List locally persisted assetforge jobs, newest first.",
    inputSchema: { limit: z.number().int().min(1).max(100).default(25) },
  }, async ({ limit }) => {
    const jobs = await jobStore.list();
    return textResult({ jobs: jobs.slice(0, limit).map(summarizeJob), total: jobs.length });
  });

  server.registerTool("cost_report", {
    description: "Report only provider usage recorded by assetforge. Zero recorded cost is not an external billing balance.",
    inputSchema: { job_id: z.string().uuid().optional() },
  }, async ({ job_id }) => {
    let jobs = await jobStore.list();
    if (job_id) jobs = jobs.filter((job) => job.job_id === job_id);
    if (job_id && jobs.length === 0) return textResult({ error: `Job '${job_id}' was not found.` }, true);
    const records = jobs.flatMap((job) => job.cost_records.map((record) => ({ job_id: job.job_id, ...record })));
    return textResult({
      recorded_cost_usd: records.reduce((total, record) => total + record.cost_usd, 0),
      usage_records: records,
      accounting_complete: false,
      note: "No provider usage was recorded. This is not a provider billing statement.",
    });
  });

  server.registerTool("manifest_create", {
    description: "Write and schema-validate an honest prototype provenance manifest for a persisted job. It never marks QA as passed or publishes an asset.",
    inputSchema: { job_id: z.string().uuid() },
  }, async ({ job_id }) => {
    const job = await jobStore.get(job_id);
    if (!job) return textResult({ error: `Job '${job_id}' was not found.` }, true);
    try {
      const result = await createManifest(job, workRoot);
      const validation = validateManifest(result.manifest);
      return textResult({
        path: path.relative(repositoryRoot, result.path),
        sha256: result.sha256,
        valid: validation.valid,
        manifest: result.manifest,
      });
    } catch (error) {
      return textResult({ error: error.message }, true);
    }
  });

  return server;
}

function summarizeJob(job) {
  return {
    job_id: job.job_id,
    asset_id: job.asset_id,
    category: job.category,
    ticket: job.ticket,
    status: job.status,
    status_reason: job.status_history.at(-1)?.reason ?? null,
    status_history: job.status_history,
    created_at: job.created_at,
    updated_at: job.updated_at,
    spec_hash: job.spec_hash,
    provider: job.provider,
    model: job.model,
    stages: job.stages,
  };
}

async function main() {
  await store.initialize();
  const server = createServer(store, dataRoot);
  await server.connect(new StdioServerTransport());
}

if (process.argv[1] && realpathSync(path.resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    process.stderr.write(`assetforge failed to start: ${error.message}\n`);
    process.exitCode = 1;
  });
}
