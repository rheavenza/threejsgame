import type * as THREE from 'three';

export interface ViewportSize {
  width: number;
  height: number;
}

interface Measurable {
  getBoundingClientRect(): { width: number; height: number };
}

interface Sizeable {
  setSize(width: number, height: number, updateStyle?: boolean): void;
}

/**
 * Reads a usable layout size from an element, or returns null when the element
 * has no layout yet (for example while it is hidden). Callers can skip the
 * resize rather than dividing by zero and producing a NaN camera aspect.
 */
export function measureViewport(host: Measurable): ViewportSize | null {
  const { width, height } = host.getBoundingClientRect();
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

/**
 * Sizes the renderer to the viewport and keeps a perspective camera's aspect
 * ratio in sync so the image is never stretched. Passes updateStyle = false so
 * three.js only resizes the drawing buffer and the stylesheet keeps owning the
 * canvas layout.
 */
export function applyViewport(
  size: ViewportSize,
  camera: THREE.PerspectiveCamera,
  renderer: Sizeable,
): void {
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height, false);
}
