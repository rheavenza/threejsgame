import { createHash } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateManifest } from "./validation.mjs";

export async function createManifest(job, workRoot) {
  const manifest = {
    schema_version: "1.0",
    id: job.asset_id,
    version: "v1",
    category: job.category,
    ticket: job.ticket,
    stages: job.stages,
    spec_hash: job.spec_hash,
    prompt_hash: null,
    input_concept_id: null,
    license_status: "prototype",
    outputs: job.output_hashes.map((output) => ({ path: output.path, sha256: output.sha256 })),
    manual_edits: [],
    qa_status: "not_run",
    publication_status: "not_published",
    created_at: job.created_at,
  };
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Generated manifest failed schema validation: ${validation.errors.map((error) => `${error.path} ${error.message}`).join("; ")}`);
  }

  const jobDirectory = path.resolve(workRoot, job.job_id);
  const target = path.join(jobDirectory, "manifest.json");
  await mkdir(jobDirectory, { recursive: true });
  const body = `${JSON.stringify(manifest, null, 2)}\n`;
  const temporary = `${target}.${process.pid}.tmp`;
  try {
    await writeFile(temporary, body, { encoding: "utf8", mode: 0o600, flag: "wx" });
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
  const sha256 = createHash("sha256").update(body).digest("hex");
  return { manifest, path: target, sha256, validation };
}
