import * as THREE from 'three';

/**
 * Shared palette for the look-dev valley.
 *
 * Values come from docs/ART_BIBLE.md §3. The art bible calls them "starting
 * points, not locked color constants", so keep them in one place rather than
 * scattering hex strings through the scene builder.
 */
export const PALETTE = {
  deepForest: '#205B4D',
  emerald: '#25885B',
  sunlitGreen: '#71B94B',
  lime: '#C7D94D',
  deepTeal: '#174B4C',
  skyBlue: '#62B3F1',
  paleAzure: '#A4D9F1',
  riverCyan: '#49B8D2',
  riverBlue: '#347FAF',
  warmOchre: '#D8A34E',
  sandyGold: '#EBC66F',
  mutedOrange: '#B97843',
  warmBark: '#684A35',
  umber: '#47372D',
  slateBlue: '#6487B8',
  coolBlueGray: '#536D8F',
  cloudCream: '#F6E8CA',
  cloudShadow: '#B7D6E7',
} as const;

/**
 * Faceted, flat-shaded material. Broad planes read better at a low internal
 * resolution than smooth shading, which turns into noise once pixelated.
 */
export function facet(color: THREE.ColorRepresentation, roughness = 1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
}

/**
 * Deterministic pseudo-random source (linear congruential generator) so repeated
 * screenshot captures produce identical scenes.
 */
export function makeRandom(seed = 1337): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
