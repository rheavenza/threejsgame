/**
 * Presentation settings for the low-resolution "pixel" render pipeline.
 *
 * This module is intentionally free of Three.js and DOM imports so the sizing
 * rules stay unit-testable without a WebGL context. See docs/ARCHITECTURE.md §7.
 */

export interface ViewportSize {
  width: number;
  height: number;
}

/** A candidate internal render resolution, expressed as 16:9 base dimensions. */
export interface PixelPreset {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  /** Short human-readable note shown in the look-dev overlay. */
  readonly note: string;
}

/**
 * Candidate internal resolutions from docs/ART_BIBLE.md §5. D-011 (exact pixel
 * resolution) is still OPEN, so none of these is treated as the final choice.
 */
export const PIXEL_PRESETS: readonly PixelPreset[] = [
  { id: '320x180', width: 320, height: 180, note: 'coarsest clusters' },
  { id: '426x240', width: 426, height: 240, note: 'midpoint' },
  { id: '480x270', width: 480, height: 270, note: 'finest detail' },
] as const;

export const DEFAULT_PRESET_ID = '426x240';

export function findPreset(id: string): PixelPreset {
  const preset = PIXEL_PRESETS.find((candidate) => candidate.id === id);
  if (!preset) {
    throw new Error(`Unknown pixel preset "${id}".`);
  }
  return preset;
}

/**
 * The largest integer scale factor that still fits `preset` inside `viewport`.
 *
 * Integer scaling is what keeps nearest-neighbour upscaling crisp: a fractional
 * factor would place source pixels on partial destination pixels and produce
 * uneven, shimmering pixel clusters (docs/ART_BIBLE.md §5).
 */
export function integerScaleFor(preset: ViewportSize, viewport: ViewportSize): number {
  if (viewport.width <= 0 || viewport.height <= 0) return 0;
  const scale = Math.min(viewport.width / preset.width, viewport.height / preset.height);
  return Math.max(0, Math.floor(scale));
}

export interface PixelLayout {
  /** Internal render target size in device pixels. */
  readonly target: ViewportSize;
  /** Integer nearest-neighbour upscale factor applied to the target. */
  readonly scale: number;
  /** On-screen size of the upscaled image, in device pixels. */
  readonly display: ViewportSize;
  /**
   * Letterbox bars left by integer scaling, in device pixels. Zero on an axis
   * the image fills exactly. These are real pixels the pipeline never draws
   * into, so they must be reported rather than hidden.
   */
  readonly letterbox: ViewportSize;
  /**
   * The scale actually applied to the target on screen. It always equals
   * `scale`, because the present pass draws into `display` and never stretches
   * across the whole framebuffer. Exposed so evidence can state a measured
   * value rather than an assumed one.
   */
  readonly effectiveScale: { readonly x: number; readonly y: number };
}

const EMPTY_LAYOUT: PixelLayout = {
  target: { width: 0, height: 0 },
  scale: 0,
  display: { width: 0, height: 0 },
  letterbox: { width: 0, height: 0 },
  effectiveScale: { x: 0, y: 0 },
};

/**
 * Resolves the internal render size and the upscale factor for a viewport.
 *
 * The internal aspect ratio always matches the viewport, so the world is never
 * stretched; the preset only sets the pixel *density*. The result carries the
 * letterbox bars so the caller can present the target in exactly `display`
 * device pixels and leave the remainder undrawn.
 */
export function resolvePixelLayout(preset: PixelPreset, viewport: ViewportSize): PixelLayout {
  if (viewport.width <= 0 || viewport.height <= 0) {
    return EMPTY_LAYOUT;
  }

  const aspect = viewport.width / viewport.height;

  // Preserve the preset's pixel budget (its area) while matching viewport aspect.
  const presetArea = preset.width * preset.height;
  let targetHeight = Math.max(1, Math.round(Math.sqrt(presetArea / aspect)));
  let targetWidth = Math.max(1, Math.round(targetHeight * aspect));

  // A viewport narrower than the preset must not render more pixels than it can
  // show; cap the shorter axis at the viewport so the fallback stays 1:1.
  const cap = Math.min(viewport.width, viewport.height);
  if (targetWidth > cap || targetHeight > cap) {
    const shrink = cap / Math.max(targetWidth, targetHeight);
    targetWidth = Math.max(1, Math.floor(targetWidth * shrink));
    targetHeight = Math.max(1, Math.floor(targetHeight * shrink));
  }

  const target = { width: targetWidth, height: targetHeight };

  // Floor at 1 so a tiny viewport still draws something rather than nothing.
  const scale = Math.max(1, integerScaleFor(target, viewport));

  const display = { width: target.width * scale, height: target.height * scale };

  return {
    target,
    scale,
    display,
    letterbox: {
      width: Math.max(0, viewport.width - display.width),
      height: Math.max(0, viewport.height - display.height),
    },
    effectiveScale: {
      x: target.width > 0 ? display.width / target.width : 0,
      y: target.height > 0 ? display.height / target.height : 0,
    },
  };
}
