import * as THREE from 'three';
import './style.css';
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

const valley = buildValleyScene();
const { scene, camera } = valley;

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
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

for (const button of presetButtons) {
  button.addEventListener('click', () => {
    const id = button.dataset.preset;
    if (!id) return;
    pipeline.setPreset(findPreset(id));
    resize();
  });
}

function resize(): void {
  const size = measureViewport(hostElement);
  if (!size) return;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height, false);

  pipeline.resize(size);
  updatePresetReadout();
  pipeline.render(scene, camera);
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(hostElement);
window.addEventListener('resize', resize);
resize();

window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;

  resizeObserver.disconnect();
  window.removeEventListener('resize', resize);
  pipeline.dispose();
  valley.dispose();
  renderer.dispose();
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) resize();
});
