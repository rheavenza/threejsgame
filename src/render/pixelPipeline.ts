import * as THREE from 'three';
import {
  type PixelLayout,
  type PixelPreset,
  type ViewportSize,
  resolvePixelLayout,
} from './pixelConfig';

/** Placeholder used only to build the initial empty layout before the first
 * resize; it is replaced by the caller's preset on the first `resize()`. */
const EMPTY_PRESET: PixelPreset = { id: 'initial', width: 1, height: 1, note: 'initial' };

/** Neutral dark used for letterbox bars, so they never read as scene content. */
const LETTERBOX_COLOR = new THREE.Color('#101d1c');

/**
 * Renders the scene into a low-resolution render target, then presents that
 * target through a full-screen quad with nearest-neighbour filtering.
 *
 * The upscale happens inside the GPU pipeline rather than via CSS or screenshot
 * scaling, as required by docs/ART_BIBLE.md §5. Keeping this behind one module
 * follows docs/ARCHITECTURE.md §7: no per-material pixel hacks.
 */
export class PixelPipeline {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly targetScene = new THREE.Scene();
  private readonly targetCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: THREE.MeshBasicMaterial;
  private readonly quad: THREE.Mesh;
  private renderTarget: THREE.WebGLRenderTarget | null = null;
  private readonly scratchSize = new THREE.Vector2();
  private readonly scratchColor = new THREE.Color();
  private preset: PixelPreset;
  private layout: PixelLayout = resolvePixelLayout(EMPTY_PRESET, { width: 0, height: 0 });

  constructor(renderer: THREE.WebGLRenderer, preset: PixelPreset) {
    this.renderer = renderer;
    this.preset = preset;

    // Nearest filtering is the whole point: linear sampling would blur the
    // pixel clusters back into smooth gradients.
    this.material = new THREE.MeshBasicMaterial({
      map: null,
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.targetScene.add(this.quad);
  }

  getLayout(): PixelLayout {
    return this.layout;
  }

  getPreset(): PixelPreset {
    return this.preset;
  }

  setPreset(preset: PixelPreset): void {
    if (preset.id === this.preset.id) return;
    this.preset = preset;
    this.renderTarget?.dispose();
    this.renderTarget = null;
  }

  /** Recomputes the internal render size for a new viewport. */
  resize(viewport: ViewportSize): PixelLayout {
    const layout = resolvePixelLayout(this.preset, viewport);
    const previous = this.layout;
    this.layout = layout;

    if (layout.target.width === 0 || layout.target.height === 0) return layout;

    if (
      !this.renderTarget ||
      previous.target.width !== layout.target.width ||
      previous.target.height !== layout.target.height
    ) {
      this.renderTarget?.dispose();
      this.renderTarget = new THREE.WebGLRenderTarget(layout.target.width, layout.target.height, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        // No mipmaps: they would reintroduce smoothing at the very scale we
        // are trying to keep crisp.
        generateMipmaps: false,
        depthBuffer: true,
        stencilBuffer: false,
      });
      this.renderTarget.texture.colorSpace = THREE.SRGBColorSpace;
      this.material.map = this.renderTarget.texture;
      this.material.needsUpdate = true;
    }

    return layout;
  }

  /**
   * Renders one frame of `scene` through the low-resolution pipeline.
   *
   * The present pass draws the target into the integer-scaled display
   * rectangle rather than stretching it across the whole framebuffer. Stretching
   * would apply a fractional effective scale (for example a 427-wide target
   * filling 1280 px is an effective x3.00, not the stated x2), which would both
   * break the whole-number nearest-neighbour guarantee and make the reported
   * scale disagree with what is actually on screen. Any leftover space is
   * letterboxed with the scene's own background colour.
   */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    const target = this.renderTarget;
    if (!target) return;

    this.renderer.setRenderTarget(target);
    this.renderer.render(scene, camera);

    this.renderer.setRenderTarget(null);

    const canvasSize = this.renderer.getSize(this.scratchSize);
    const { display } = this.layout;
    if (canvasSize.width === 0 || canvasSize.height === 0) return;

    const offsetX = Math.floor((canvasSize.width - display.width) / 2);
    const offsetY = Math.floor((canvasSize.height - display.height) / 2);

    // Clear the letterbox bars, then restrict rendering to the display rect.
    // The bars use a neutral dark rather than the scene background, so they
    // never read as part of the image.
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, canvasSize.width, canvasSize.height);
    const previousClear = this.renderer.getClearColor(this.scratchColor);
    const previousAlpha = this.renderer.getClearAlpha();
    this.renderer.setClearColor(LETTERBOX_COLOR, 1);
    this.renderer.clear();
    this.renderer.setClearColor(previousClear, previousAlpha);

    this.renderer.setViewport(offsetX, offsetY, display.width, display.height);
    this.renderer.setScissor(offsetX, offsetY, display.width, display.height);
    this.renderer.setScissorTest(true);
    this.renderer.render(this.targetScene, this.targetCamera);

    // Leave the renderer in its default state for any later pass.
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, canvasSize.width, canvasSize.height);
  }

  dispose(): void {
    this.renderTarget?.dispose();
    this.renderTarget = null;
    this.material.dispose();
    this.quad.geometry.dispose();
    this.targetScene.clear();
  }
}
