import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateSpec } from "./validation.mjs";

const inputPath = process.argv[3];
if (process.argv[2] !== "validate" || !inputPath) {
  process.stderr.write("Usage: node src/cli.mjs validate <spec.json>\n");
  process.exit(2);
}

const fullPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", inputPath);
const spec = JSON.parse(await readFile(fullPath, "utf8"));
const result = validateSpec(spec);
process.stdout.write(`${JSON.stringify({ schema_version: "1.0", ...result }, null, 2)}\n`);
if (!result.valid) process.exitCode = 1;
