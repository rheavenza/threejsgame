/**
 * @typedef {object} ProviderAdapter
 * @property {string} id Stable provider identifier.
 * @property {string} model Provider/model identifier for provenance.
 * @property {(stage: string) => boolean} supports Whether this adapter handles a stage.
 * @property {(request: object) => Promise<object>} submit Submit one operation and return its provider handle.
 * @property {(handle: object) => Promise<object>} poll Read the operation status.
 * @property {(handle: object) => Promise<object>} fetch Retrieve completed output metadata/files.
 * @property {(handle: object) => Promise<object>} reportUsage Return measured cost and license metadata.
 */

/** @param {string} stage @param {ProviderAdapter[]} adapters */
export function providerForStage(stage, adapters = []) {
  const adapter = adapters.find((candidate) => candidate.supports(stage));
  if (adapter) return { available: true, provider: adapter.id, model: adapter.model, adapter };
  return { available: false, provider: null, model: null, reason: `No approved provider adapter is installed for '${stage}'. No external request was made.` };
}
