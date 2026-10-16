import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { canonicalJson } from "../src/canonical-json.mjs";
import { JobStore } from "../src/job-store.mjs";
import { createManifest } from "../src/manifest.mjs";
import { hashSpec, validateManifest, validateSpec } from "../src/validation.mjs";

const samplePath = new URL("../samples/market-stall.json", import.meta.url);
const sample = JSON.parse(await readFile(samplePath, "utf8"));

async function withTempDirectory(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "assetforge-test-"));
  try {
    await run(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("valid prop spec passes the versioned schema", () => {
  assert.deepEqual(validateSpec(sample), { valid: true, errors: [] });
});

test("invalid specs return actionable paths and errors", () => {
  const result = validateSpec({ ...sample, tri_budget: 0, unknown_key: true });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path === "/tri_budget" && error.message.includes("at least 1")));
  assert.ok(result.errors.some((error) => error.message.includes("unknown field 'unknown_key'")));
});

test("character specs require a skeleton", () => {
  const result = validateSpec({ ...sample, category: "character" });
  assert.ok(result.errors.some((error) => error.message.includes("missing required field 'skeleton'")));
});

test("canonical spec hashes do not depend on object key order", () => {
  assert.equal(canonicalJson({ z: 1, a: { y: 2, x: 3 } }), canonicalJson({ a: { x: 3, y: 2 }, z: 1 }));
  assert.equal(hashSpec({ z: 1, a: 2 }), hashSpec({ a: 2, z: 1 }));
});

test("job creation records a provider-unavailable transition and rejects invalid transitions", async () => {
  await withTempDirectory(async (directory) => {
    const store = new JobStore(path.join(directory, "jobs"));
    await store.initialize();
    const job = await store.create(sample, hashSpec(sample));
    assert.equal(job.status, "blocked");
    assert.deepEqual(job.status_history.map((entry) => entry.status), ["created", "blocked"]);
    assert.match(job.status_history.at(-1).reason, /No approved provider adapter/);
    await assert.rejects(store.transition(job.job_id, "running"), /Invalid job status transition/);
    assert.equal((await store.get(job.job_id)).spec_hash, hashSpec(sample));
  });
});

test("server restart recovers persisted jobs and repairs an interrupted created state", async () => {
  await withTempDirectory(async (directory) => {
    const jobsDirectory = path.join(directory, "jobs");
    const firstStore = new JobStore(jobsDirectory);
    await firstStore.initialize();
    const job = await firstStore.create(sample, hashSpec(sample));

    const interrupted = structuredClone(job);
    interrupted.job_id = "00000000-0000-4000-8000-000000000001";
    interrupted.status = "created";
    interrupted.status_history = [{ status: "created", timestamp: interrupted.created_at }];
    interrupted.stages = interrupted.stages.slice(0, 1);
    await writeFile(path.join(jobsDirectory, `${interrupted.job_id}.json`), JSON.stringify(interrupted));

    const restartedStore = new JobStore(jobsDirectory);
    await restartedStore.initialize();
    const recovered = await restartedStore.get(job.job_id);
    const interruptedRecovered = await restartedStore.get(interrupted.job_id);
    assert.equal(recovered.status, "blocked");
    assert.equal(interruptedRecovered.status, "blocked");
    assert.match(interruptedRecovered.status_history.at(-1).reason, /restarted before provider dispatch/);
    assert.equal((await restartedStore.list()).length, 2);
  });
});

test("manifest serializes against the schema without claiming QA or publication", async () => {
  await withTempDirectory(async (directory) => {
    const store = new JobStore(path.join(directory, "jobs"));
    await store.initialize();
    const job = await store.create(sample, hashSpec(sample));
    const result = await createManifest(job, path.join(directory, "work"));
    assert.deepEqual(result.validation, { valid: true, errors: [] });
    assert.deepEqual(validateManifest(result.manifest), { valid: true, errors: [] });
    assert.equal(result.manifest.license_status, "prototype");
    assert.equal(result.manifest.qa_status, "not_run");
    assert.equal(result.manifest.publication_status, "not_published");
    assert.deepEqual(result.manifest.outputs, []);
    assert.match(await readFile(result.path, "utf8"), /"publication_status": "not_published"/);
  });
});
