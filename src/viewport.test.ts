import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { applyViewport, measureViewport } from './viewport';

function host(width: number, height: number) {
  return { getBoundingClientRect: () => ({ width, height }) };
}

describe('measureViewport', () => {
  it('returns the element layout size', () => {
    expect(measureViewport(host(1280, 720))).toEqual({ width: 1280, height: 720 });
  });

  it('returns null when the element has no layout', () => {
    expect(measureViewport(host(0, 720))).toBeNull();
    expect(measureViewport(host(1280, 0))).toBeNull();
  });
});

describe('applyViewport', () => {
  it('sizes the drawing buffer without writing inline canvas styles', () => {
    const setSize = vi.fn();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);

    applyViewport({ width: 800, height: 400 }, camera, { setSize });

    expect(setSize).toHaveBeenCalledWith(800, 400, false);
  });

  it('updates the camera aspect ratio so the image is not stretched', () => {
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);

    applyViewport({ width: 1600, height: 900 }, camera, { setSize: vi.fn() });

    expect(camera.aspect).toBeCloseTo(1600 / 900);
  });
});
