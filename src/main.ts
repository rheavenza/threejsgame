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
    presetLabel.textContent = `${preset.id} · internal ${layout.target.width}×${layout.target.height} · ×${layout.scale}`;
  }
  for (const button of presetButtons) {
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.preset === pipeline.getPreset().id),
    );
  }
  // Exposed for headless capture and manual inspection.
  document.body.dataset.preset = pipeline.getPreset().id;
  document.body.dataset.internalResolution = `${layout.target.width}x${layout.target.height}`;
  document.body.dataset.upscale = String(layout.scale);
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
