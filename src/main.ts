import * as THREE from 'three';
import './style.css';
import {
  ContextLiveness,
  clearRendererFailure,
  describeContextLoss,
  detectWebGLSupport,
  showRendererFailure,
} from './app/rendererGuard';
import { ResizeController, animationFrameScheduler } from './app/resizeController';
import {
  DEFAULT_PRESET_ID,
  findPreset,
  type PixelPreset,
} from './render/pixelConfig';
import { PixelPipeline } from './render/pixelPipeline';
import { measureViewport } from './viewport';
import { buildValleyScene } from './world/valleyScene';

const canvasHost = document.querySelector<HTMLDivElement>('#app');

if (!canvasHost) {
  throw new Error('The scene canvas host is missing.');
}
const hostElement = canvasHost;

// --- Boot: refuse gracefully when the browser cannot render at all ----------
// T00-007 finding 3: constructing WebGLRenderer unguarded threw an uncaught
// "Error creating WebGL context." and left the player with an unexplained page.
const supportFailure = detectWebGLSupport();
if (supportFailure) {
  showRendererFailure(hostElement, supportFailure);
} else {
  start();
}

function start(): void {
  const valley = buildValleyScene();
  const { scene, camera } = valley;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  } catch (error) {
    showRendererFailure(hostElement, {
      kind: 'context-creation-failed',
      message:
        'The browser reported WebGL support but could not create a 3D context. ' +
        'Reloading the page may help; if it persists, check that hardware ' +
        'acceleration is enabled.',
    });
    valley.dispose();
    // Surface the original reason for debugging without crashing the page.
    console.error('WebGL context creation failed:', error);
    return;
  }

  // The low-resolution pipeline owns the pixel look, so the drawing buffer stays
  // at CSS size. High-DPI scaling here would only fight the upscale pass.
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'scene-canvas';
  renderer.domElement.setAttribute(
    'aria-label',
    'A sunlit pixelated valley with hills, a river, a village, and a distant castle',
  );
  hostElement.append(renderer.domElement);

  const requestedPreset = new URLSearchParams(window.location.search).get('res');
  let activePreset: PixelPreset;
  try {
    activePreset = findPreset(requestedPreset ?? DEFAULT_PRESET_ID);
  } catch {
    activePreset = findPreset(DEFAULT_PRESET_ID);
  }

  const pipeline = new PixelPipeline(renderer, activePreset);
  const liveness = new ContextLiveness();

  const presetLabel = document.querySelector<HTMLSpanElement>('#preset-label');
  const presetButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-preset]'),
  );

  function updatePresetReadout(): void {
    const layout = pipeline.getLayout();
    if (presetLabel) {
      const preset = pipeline.getPreset();
      const box =
        layout.letterbox.width > 0 || layout.letterbox.height > 0
          ? ` · letterbox ${layout.letterbox.width}×${layout.letterbox.height}`
          : '';
      presetLabel.textContent = `${preset.id} · internal ${layout.target.width}×${layout.target.height} · shown ${layout.display.width}×${layout.display.height} · ×${layout.scale}${box}`;
    }
    for (const button of presetButtons) {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.preset === pipeline.getPreset().id),
      );
    }
    // Exposed for headless capture and manual inspection. `upscale` is the scale
    // actually applied on screen, which equals the integer scale because the
    // present pass draws into the display rectangle instead of stretching.
    document.body.dataset.preset = pipeline.getPreset().id;
    document.body.dataset.internalResolution = `${layout.target.width}x${layout.target.height}`;
    document.body.dataset.displayResolution = `${layout.display.width}x${layout.display.height}`;
    document.body.dataset.upscale = String(layout.scale);
    document.body.dataset.effectiveScale = layout.effectiveScale.x.toFixed(3);
    document.body.dataset.letterbox = `${layout.letterbox.width}x${layout.letterbox.height}`;
  }

  function draw(): void {
    if (!liveness.shouldRender()) return;
    const size = measureViewport(hostElement);
    if (!size) return;

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height, false);

    pipeline.resize(size);
    updatePresetReadout();
    pipeline.render(scene, camera);
  }

  for (const button of presetButtons) {
    button.addEventListener('click', () => {
      const id = button.dataset.preset;
      if (!id) return;
      pipeline.setPreset(findPreset(id));
      controller.renderNow();
    });
  }

  // T00-007 finding 4: this used to be wired to both a ResizeObserver and a
  // window resize listener, so each window resize rendered twice. A
  // ResizeObserver on the full-viewport host already covers window resizes, so
  // it is now the single trigger path.
  const controller = new ResizeController(draw, animationFrameScheduler());
  const resizeObserver = new ResizeObserver(() => controller.notify());
  resizeObserver.observe(hostElement);
  controller.renderNow();

  // --- T00-007 finding 2: recover from WebGL context loss -------------------
  const canvas = renderer.domElement;

  const onContextLost = (event: Event) => {
    // Preventing the default lets the browser attempt a restore.
    event.preventDefault();
    liveness.markLost();
    hostElement.dataset.contextLost = 'true';
    console.warn(describeContextLoss(event as WebGLContextEvent));
  };

  const onContextRestored = () => {
    liveness.markRestored();
    delete hostElement.dataset.contextLost;
    // The pipeline's GPU resources died with the context, so rebuild the
    // render target and redraw immediately instead of waiting for a resize.
    pipeline.invalidateRenderTarget();
    controller.renderNow();
    clearRendererFailure(hostElement);
  };

  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;

    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    resizeObserver.disconnect();
    controller.dispose();
    pipeline.dispose();
    valley.dispose();
    renderer.dispose();
    // Release the GPU context explicitly rather than waiting for GC.
    renderer.forceContextLoss();
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) controller.renderNow();
  });
}
