import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { JobStore } from "../src/job-store.mjs";
import { createServer } from "../src/server.mjs";

const assetforgeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specPath = path.join(assetforgeDirectory, "samples/market-stall.json");
const spec = (await import("node:fs/promises")).readFile(specPath, "utf8").then(JSON.parse);
const dataDirectory = await mkdtemp(path.join(os.tmpdir(), "assetforge-mcp-smoke-"));

function readToolResult(result) {
  if (result.structuredContent) return result.structuredContent;
  const textContent = result.content?.find((item) => item.type === "text")?.text;
  return textContent ? JSON.parse(textContent) : null;
}

async function connect() {
  const store = new JobStore(path.join(dataDirectory, "jobs"));
  await store.initialize();
  const server = createServer(store, dataDirectory);
  const client = new Client({ name: "assetforge-smoke", version: "0.1.0" }, { capabilities: {} });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return { client, server };
}

let connection;
try {
  const sampleSpec = await spec;
  connection = await connect();
  let { client } = connection;
  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name);
  for (const required of ["spec_validate", "job_create", "job_status", "job_list", "cost_report", "manifest_create"]) {
    assert.ok(toolNames.includes(required), `MCP server did not expose ${required}`);
  }

  const valid = readToolResult(await client.callTool({ name: "spec_validate", arguments: { spec: sampleSpec } }));
  assert.equal(valid.valid, true);

  const invalidResponse = await client.callTool({
    name: "spec_validate",
    arguments: { spec: { ...sampleSpec, tri_budget: 0 } },
  });
  const invalid = readToolResult(invalidResponse);
  assert.equal(invalidResponse.isError, true);
  assert.ok(invalid.errors.some((error) => error.path === "/tri_budget"));

  const created = readToolResult(await client.callTool({ name: "job_create", arguments: { spec: sampleSpec } }));
  assert.ok(created.job_id);
  assert.equal(created.status, "blocked");
  assert.match(created.status_reason, /No approved provider adapter/);

  const status = readToolResult(await client.callTool({ name: "job_status", arguments: { job_id: created.job_id } }));
  assert.equal(status.status, "blocked");
  await client.close();
  await connection.server.close();
  connection = await connect();
  ({ client } = connection);

  const recovered = readToolResult(await client.callTool({ name: "job_status", arguments: { job_id: created.job_id } }));
  assert.equal(recovered.job_id, created.job_id);
  assert.equal(recovered.status, "blocked");
  const list = readToolResult(await client.callTool({ name: "job_list", arguments: { limit: 25 } }));
  assert.equal(list.total, 1);

  const cost = readToolResult(await client.callTool({ name: "cost_report", arguments: { job_id: created.job_id } }));
  assert.equal(cost.recorded_cost_usd, 0);
  assert.equal(cost.usage_records.length, 0);
  assert.equal(cost.accounting_complete, false);

  const manifestResult = readToolResult(await client.callTool({ name: "manifest_create", arguments: { job_id: created.job_id } }));
  assert.equal(manifestResult.valid, true);
  assert.equal(manifestResult.manifest.license_status, "prototype");
  assert.equal(manifestResult.manifest.qa_status, "not_run");
  assert.equal(manifestResult.manifest.publication_status, "not_published");
  process.stdout.write(`MCP protocol smoke passed: tools=${toolNames.join(",")}; job=${created.job_id}; persisted restart recovery and manifest schema verified.\n`);
} finally {
  if (connection) {
    await connection.client.close();
    await connection.server.close();
  }
  await rm(dataDirectory, { recursive: true, force: true });
}
