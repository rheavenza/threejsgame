import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateManifest, validateSpec } from "./validation.mjs";

const operation = process.argv[2];
const inputPath = process.argv[3];
if (!["validate", "validate-manifest"].includes(operation) || !inputPath) {
  process.stderr.write("Usage: node src/cli.mjs validate <spec.json> | validate-manifest <manifest.json>\n");
  process.exit(2);
}

const assetforgeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(assetforgeRoot, "../..");
const fullPath = operation === "validate-manifest"
  ? path.resolve(repositoryRoot, inputPath)
  : path.resolve(assetforgeRoot, inputPath);
const document = JSON.parse(await readFile(fullPath, "utf8"));
const result = operation === "validate-manifest" ? validateManifest(document) : validateSpec(document);
process.stdout.write(`${JSON.stringify({ schema_version: "1.0", ...result }, null, 2)}\n`);
if (!result.valid) process.exitCode = 1;
