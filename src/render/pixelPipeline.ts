import * as THREE from 'three';
import {
  type PixelLayout,
  type PixelPreset,
  type ViewportSize,
  resolvePixelLayout,
} from './pixelConfig';

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
  private preset: PixelPreset;
  private layout: PixelLayout = {
    target: { width: 0, height: 0 },
    scale: 0,
    display: { width: 0, height: 0 },
  };

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

  /** Renders one frame of `scene` through the low-resolution pipeline. */
  render(scene: THREE.Scene, camera: THREE.Camera): void {
    const target = this.renderTarget;
    if (!target) return;

    this.renderer.setRenderTarget(target);
    this.renderer.render(scene, camera);

    // Present: clear the default framebuffer, then draw the upscaled quad with
    // the depth test off so it simply fills the viewport.
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.targetScene, this.targetCamera);
  }

  dispose(): void {
    this.renderTarget?.dispose();
    this.renderTarget = null;
    this.material.dispose();
    this.quad.geometry.dispose();
    this.targetScene.clear();
  }
}
