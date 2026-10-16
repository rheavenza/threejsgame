import Ajv from "ajv";
import addFormats from "ajv-formats";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { canonicalJson } from "./canonical-json.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

export const specSchema = JSON.parse(await readFile(path.resolve(here, "../schemas/asset-spec.v1.schema.json"), "utf8"));
export const manifestSchema = JSON.parse(await readFile(path.resolve(here, "../schemas/manifest.v1.schema.json"), "utf8"));
export const validateSpecSchema = ajv.compile(specSchema);
export const validateManifestSchema = ajv.compile(manifestSchema);

export function validateSpec(spec) {
  if (!validateSpecSchema(spec)) {
    return {
      valid: false,
      errors: (validateSpecSchema.errors ?? []).map((error) => ({
        path: error.instancePath || "/",
        keyword: error.keyword,
        message: describeValidationError(error),
      })),
    };
  }
  return { valid: true, errors: [] };
}

export function validateManifest(manifest) {
  const valid = validateManifestSchema(manifest);
  return {
    valid,
    errors: valid ? [] : (validateManifestSchema.errors ?? []).map((error) => ({
      path: error.instancePath || "/",
      keyword: error.keyword,
      message: describeValidationError(error),
    })),
  };
}

export function hashSpec(spec) {
  return `sha256:${createHash("sha256").update(canonicalJson(spec)).digest("hex")}`;
}

function describeValidationError(error) {
  switch (error.keyword) {
    case "required":
      return `missing required field '${error.params.missingProperty}'`;
    case "additionalProperties":
      return `unknown field '${error.params.additionalProperty}'`;
    case "enum":
      return `must be one of: ${error.params.allowedValues.join(", ")}`;
    case "pattern":
      return `must match ${error.params.pattern}`;
    case "minimum":
      return `must be at least ${error.params.limit}`;
    case "maximum":
      return `must be at most ${error.params.limit}`;
    case "type":
      return `must be ${[].concat(error.params.type).join(" or ")}`;
    default:
      return error.message ?? "is invalid";
  }
}
