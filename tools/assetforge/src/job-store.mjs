import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { providerForStage } from "./providers/registry.mjs";

const transitions = new Map([
  ["created", new Set(["blocked", "failed"])],
  ["blocked", new Set()],
  ["failed", new Set()],
]);

export class JobStore {
  constructor(directory) {
    this.directory = path.resolve(directory);
  }

  async initialize() {
    await mkdir(this.directory, { recursive: true });
    for (const filename of await readdir(this.directory)) {
      if (!filename.endsWith(".json")) continue;
      const job = await this.#read(filename);
      if (job.status === "created") {
        await this.transition(job.job_id, "blocked", {
          reason: "Server restarted before provider dispatch; no generation was submitted.",
        });
      }
    }
  }

  async create(spec, specHash) {
    const now = new Date().toISOString();
    const job = {
      store_version: 1,
      job_id: randomUUID(),
      asset_id: spec.id,
      category: spec.category,
      ticket: spec.ticket ?? null,
      status: "created",
      created_at: now,
      updated_at: now,
      spec,
      spec_hash: specHash,
      provider: null,
      model: null,
      cost_records: [],
      status_history: [{ status: "created", timestamp: now }],
      stages: [{
        name: "spec_validation",
        status: "passed",
        provider: "assetforge-local",
        model: "asset-spec-v1",
        parameters: { schema_version: spec.schema_version },
        seed: null,
        started_at: now,
        finished_at: now,
      }],
      output_hashes: [],
    };
    await this.#write(job);

    const provider = providerForStage("concept");
    return this.transition(job.job_id, "blocked", {
      reason: provider.reason,
      provider: provider.provider,
      model: provider.model,
    });
  }

  async transition(jobId, status, details = {}) {
    const job = await this.get(jobId);
    if (!job) throw new Error(`Job '${jobId}' was not found.`);
    if (!transitions.get(job.status)?.has(status)) {
      throw new Error(`Invalid job status transition '${job.status}' → '${status}'.`);
    }
    const now = new Date().toISOString();
    const reason = details.reason ?? null;
    job.status = status;
    job.updated_at = now;
    job.provider = details.provider ?? job.provider;
    job.model = details.model ?? job.model;
    job.status_history.push({ status, timestamp: now, reason });
    if (status === "blocked") {
      job.stages.push({
        name: "provider_preflight",
        status: "blocked",
        provider: job.provider,
        model: job.model,
        parameters: { requested_stage: "concept", reason },
        seed: null,
        started_at: now,
        finished_at: now,
      });
    }
    await this.#write(job);
    return job;
  }

  async get(jobId) {
    try {
      return JSON.parse(await readFile(this.#filename(jobId), "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  }

  async list() {
    const names = (await readdir(this.directory)).filter((name) => name.endsWith(".json"));
    const jobs = await Promise.all(names.map((name) => this.#read(name)));
    return jobs.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async #read(filename) {
    const job = JSON.parse(await readFile(path.join(this.directory, filename), "utf8"));
    if (job.store_version !== 1 || typeof job.job_id !== "string" || !Array.isArray(job.status_history)) {
      throw new Error(`Cannot recover malformed assetforge job record '${filename}'.`);
    }
    return job;
  }

  async #write(job) {
    const target = this.#filename(job.job_id);
    const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, `${JSON.stringify(job, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
      await rename(temporary, target);
    } finally {
      await rm(temporary, { force: true });
    }
  }

  #filename(jobId) {
    if (!/^[0-9a-f-]{36}$/.test(jobId)) throw new Error("job_id must be a UUID.");
    return path.join(this.directory, `${jobId}.json`);
  }
}
