import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRESET_ID,
  PIXEL_PRESETS,
  findPreset,
  integerScaleFor,
  resolvePixelLayout,
} from './pixelConfig';

describe('PIXEL_PRESETS', () => {
  it('offers the candidate resolutions listed in the art bible', () => {
    expect(PIXEL_PRESETS.map((preset) => preset.id)).toEqual([
      '320x180',
      '426x240',
      '480x270',
    ]);
  });

  it('stays within a hair of 16:9', () => {
    // 426x240 is deliberately 1.775 rather than exactly 1.778: the art bible
    // names it as a candidate, and the layout pass re-derives exact size anyway.
    for (const preset of PIXEL_PRESETS) {
      expect(preset.width / preset.height).toBeCloseTo(16 / 9, 1);
      expect(preset.width).toBeGreaterThan(preset.height);
    }
  });

  it('defaults to a preset that exists', () => {
    expect(() => findPreset(DEFAULT_PRESET_ID)).not.toThrow();
  });
});

describe('findPreset', () => {
  it('returns the matching preset', () => {
    expect(findPreset('320x180').width).toBe(320);
  });

  it('throws on an unknown id instead of silently falling back', () => {
    expect(() => findPreset('999x999')).toThrow(/Unknown pixel preset/);
  });
});

describe('integerScaleFor', () => {
  it('rounds down to a whole multiple', () => {
    expect(integerScaleFor({ width: 320, height: 180 }, { width: 1280, height: 720 })).toBe(4);
    expect(integerScaleFor({ width: 320, height: 180 }, { width: 1300, height: 720 })).toBe(4);
  });

  it('is limited by the tighter axis', () => {
    // Width could fit 3, but height only fits 2.
    expect(integerScaleFor({ width: 320, height: 180 }, { width: 1000, height: 400 })).toBe(2);
  });

  it('reports 0 when the viewport cannot fit one whole copy', () => {
    expect(integerScaleFor({ width: 320, height: 180 }, { width: 200, height: 120 })).toBe(0);
  });

  it('reports 0 for a viewport with no layout', () => {
    expect(integerScaleFor({ width: 320, height: 180 }, { width: 0, height: 720 })).toBe(0);
  });
});

describe('resolvePixelLayout', () => {
  const preset = findPreset('426x240');

  it('matches the viewport aspect ratio so the world is never stretched', () => {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 1920, height: 1080 },
    ]) {
      const { target } = resolvePixelLayout(preset, viewport);
      expect(target.width / target.height).toBeCloseTo(viewport.width / viewport.height, 2);
    }
  });

  it('keeps the preset pixel budget regardless of viewport size', () => {
    const budget = preset.width * preset.height;
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
    ]) {
      const { target } = resolvePixelLayout(preset, viewport);
      expect(target.width * target.height).toBeGreaterThan(budget * 0.9);
      expect(target.width * target.height).toBeLessThan(budget * 1.1);
    }
  });

  it('upscales by whole numbers only', () => {
    const { target, scale } = resolvePixelLayout(preset, { width: 1280, height: 720 });
    expect(Number.isInteger(scale)).toBe(true);
    expect(scale).toBeGreaterThanOrEqual(1);
    expect(target.width * scale).toBeLessThanOrEqual(1280);
    expect(target.height * scale).toBeLessThanOrEqual(720);
  });

  it('fills the display box exactly from the target and scale', () => {
    const { target, scale, display } = resolvePixelLayout(preset, { width: 1600, height: 900 });
    expect(display.width).toBe(target.width * scale);
    expect(display.height).toBe(target.height * scale);
  });

  it('degrades to scale 1 when the viewport is smaller than the preset', () => {
    const { target, scale } = resolvePixelLayout(preset, { width: 200, height: 150 });
    expect(scale).toBe(1);
    expect(target.width).toBeLessThanOrEqual(200);
  });

  it('returns an empty layout for a viewport with no layout', () => {
    expect(resolvePixelLayout(preset, { width: 0, height: 0 })).toEqual({
      target: { width: 0, height: 0 },
      scale: 0,
      display: { width: 0, height: 0 },
      letterbox: { width: 0, height: 0 },
      effectiveScale: { x: 0, y: 0 },
    });
  });

  // Regression: the present pass originally stretched the target across the
  // whole framebuffer, so the *reported* integer scale disagreed with what was
  // actually on screen (427 -> 1280 is an effective x3, not x2). These lock the
  // invariant that makes the reported number trustworthy.
  it('reports an effective scale that matches the integer scale', () => {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1600, height: 900 },
      { width: 1024, height: 768 },
      { width: 1920, height: 1080 },
    ]) {
      for (const candidate of PIXEL_PRESETS) {
        const layout = resolvePixelLayout(candidate, viewport);
        expect(layout.effectiveScale.x).toBe(layout.scale);
        expect(layout.effectiveScale.y).toBe(layout.scale);
      }
    }
  });

  it('never lets the display box exceed the viewport', () => {
    for (const viewport of [
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 800, height: 600 },
    ]) {
      for (const candidate of PIXEL_PRESETS) {
        const { display, letterbox } = resolvePixelLayout(candidate, viewport);
        expect(display.width).toBeLessThanOrEqual(viewport.width);
        expect(display.height).toBeLessThanOrEqual(viewport.height);
        expect(letterbox.width).toBeGreaterThanOrEqual(0);
        expect(letterbox.height).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('accounts for every viewport pixel as either drawn or letterboxed', () => {
    const viewport = { width: 1280, height: 720 };
    const { display, letterbox } = resolvePixelLayout(preset, viewport);
    expect(display.width + letterbox.width).toBe(viewport.width);
    expect(display.height + letterbox.height).toBe(viewport.height);
  });

  it('leaves no letterbox on the axis the target fills exactly', () => {
    // 320x180 at 1280x720 is a clean x4 on both axes.
    const layout = resolvePixelLayout(findPreset('320x180'), { width: 1280, height: 720 });
    expect(layout.letterbox).toEqual({ width: 0, height: 0 });
    expect(layout.scale).toBe(4);
  });
});
