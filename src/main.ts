import * as THREE from 'three';
import './style.css';

const canvasHost = document.querySelector<HTMLDivElement>('#app');

if (!canvasHost) {
  throw new Error('The scene canvas host is missing.');
}
const hostElement = canvasHost;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#9bd4f4');
scene.fog = new THREE.Fog('#9bd4f4', 34, 78);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
camera.position.set(11, 10, 16);
camera.lookAt(0, 1.6, -2.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.domElement.className = 'scene-canvas';
renderer.domElement.setAttribute('aria-label', 'A sunlit valley with hills, trees, and village cottages');
hostElement.append(renderer.domElement);

const hemisphere = new THREE.HemisphereLight('#e8f7ff', '#587c4e', 2.1);
scene.add(hemisphere);

const sunlight = new THREE.DirectionalLight('#fff1c9', 3.4);
sunlight.position.set(-9, 15, 9);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -24;
sunlight.shadow.camera.right = 24;
sunlight.shadow.camera.top = 24;
sunlight.shadow.camera.bottom = -24;
sunlight.shadow.normalBias = 0.035;
scene.add(sunlight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ color: '#8ac65c', roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
ground.receiveShadow = true;
scene.add(ground);

const pathShape = new THREE.Shape();
pathShape.moveTo(-1.2, -18);
pathShape.quadraticCurveTo(-0.3, -11, -2.2, -6);
pathShape.quadraticCurveTo(-4.3, -1.5, -1.6, 3);
pathShape.quadraticCurveTo(0.5, 7, 0, 13);
pathShape.lineTo(2.1, 13);
pathShape.quadraticCurveTo(2.6, 6.5, 0.3, 2);
pathShape.quadraticCurveTo(-2.1, -1.7, -0.5, -5.5);
pathShape.quadraticCurveTo(1.8, -11.5, 0.9, -18);
const path = new THREE.Mesh(
  new THREE.ShapeGeometry(pathShape, 12),
  new THREE.MeshStandardMaterial({ color: '#d6ad66', roughness: 1 }),
);
path.rotation.x = -Math.PI / 2;
path.position.y = -0.075;
path.receiveShadow = true;
scene.add(path);

const makeMaterial = (color: THREE.ColorRepresentation, roughness = 1) =>
  new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });

function addHill(
  x: number,
  z: number,
  scale: [number, number, number],
  color: THREE.ColorRepresentation,
) {
  const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), makeMaterial(color));
  hill.position.set(x, scale[1] * 0.45 - 0.04, z);
  hill.scale.set(...scale);
  hill.castShadow = true;
  hill.receiveShadow = true;
  scene.add(hill);
}

function addTree(x: number, z: number, size: number, foliage: string) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.11, size * 0.16, size * 0.9, 5),
    makeMaterial('#80543a'),
  );
  trunk.position.set(x, size * 0.45, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size * 0.56, 1),
    makeMaterial(foliage),
  );
  crown.position.set(x, size * 1.12, z);
  crown.castShadow = true;
  crown.receiveShadow = true;
  scene.add(crown);
}

function addCottage(x: number, z: number, wallColor: string, roofColor: string) {
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 2, 2.25),
    makeMaterial(wallColor),
  );
  walls.position.set(x, 1, z);
  walls.castShadow = true;
  walls.receiveShadow = true;
  scene.add(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.05, 1.55, 4),
    makeMaterial(roofColor),
  );
  roof.rotation.y = Math.PI / 4;
  roof.position.set(x, 2.7, z);
  roof.castShadow = true;
  scene.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.95, 0.08),
    makeMaterial('#674731'),
  );
  door.position.set(x + 0.28, 0.48, z + 1.17);
  scene.add(door);
}

// Overlapping hill silhouettes create depth without a terrain system.
addHill(-19, -14, [12, 7, 9], '#6d9f71');
addHill(17, -18, [15, 8, 10], '#759d70');
addHill(-4, -27, [19, 10, 8], '#819fa0');
addHill(20, -36, [22, 13, 8], '#788fa9');
addHill(-22, -39, [20, 12, 9], '#829bb1');

// A compact settlement sits in the middle distance beneath the hills.
addCottage(-5.4, -8.5, '#f1d18d', '#b96843');
addCottage(-1.6, -11.4, '#e8bd70', '#8e573e');
addCottage(4.4, -9.2, '#f0d9a5', '#bd7848');

// Tree groups frame the view and keep the path open.
addTree(-8, -2, 4.1, '#286e51');
addTree(-10.3, 1.1, 3.2, '#43834e');
addTree(8.6, -2.1, 4.4, '#286e51');
addTree(10.7, 0.8, 3.3, '#4d8b4d');
addTree(-7.8, -12.4, 2.5, '#4e8e52');
addTree(7.9, -13.2, 2.8, '#36784f');
addTree(-14.4, -8, 3.1, '#3c7950');
addTree(14.5, -10.5, 3.4, '#32734e');

// Small sunlit stones add a few grounded, readable accents.
for (const [x, z, size, color] of [
  [-3.8, 0.2, 0.52, '#d7c18b'],
  [3.1, -3.4, 0.42, '#e2c889'],
  [-2.8, -8.1, 0.35, '#a7a576'],
  [5.8, -5.4, 0.48, '#c6bd8c'],
] as const) {
  const stone = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size, 0),
    makeMaterial(color),
  );
  stone.position.set(x, size * 0.65, z);
  stone.rotation.set(0.16, x * 0.12, 0.24);
  stone.castShadow = true;
  stone.receiveShadow = true;
  scene.add(stone);
}

function resizeRenderer() {
  const { width, height } = hostElement.getBoundingClientRect();
  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.render(scene, camera);
}

const resizeObserver = new ResizeObserver(resizeRenderer);
resizeObserver.observe(hostElement);
window.addEventListener('resize', resizeRenderer);
resizeRenderer();

window.addEventListener(
  'pagehide',
  () => {
    resizeObserver.disconnect();
    window.removeEventListener('resize', resizeRenderer);
    renderer.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
  },
  { once: true },
);

