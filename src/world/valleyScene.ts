import * as THREE from 'three';
import { PALETTE, facet, makeRandom } from './palette';

/**
 * Builds the look-dev valley vista.
 *
 * Composition follows docs/ART_BIBLE.md §4: a foreground frame, a winding route
 * toward a midground settlement, overlapping ridges for depth, one distant
 * adventure landmark, and large cloud masses overhead. This is a look-dev
 * scene, not the T01-001 level: geometry is deliberately blocky, and every
 * object is chosen to test how a *shape class* survives pixelation (foliage
 * masses, thin fences, diagonal paths, water highlights, distant silhouettes).
 */

export interface ValleyScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  dispose(): void;
}

const geometries: THREE.BufferGeometry[] = [];
const materials: THREE.Material[] = [];

function geo<T extends THREE.BufferGeometry>(g: T): T {
  geometries.push(g);
  return g;
}

function mat<T extends THREE.Material>(m: T): T {
  materials.push(m);
  return m;
}

function mesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
): THREE.Mesh {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...position);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** A faceted hill/ridge mass. Scaled icosahedra give broad readable planes. */
function ridge(
  x: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: string,
  detail = 0,
): THREE.Mesh {
  const m = mesh(
    geo(new THREE.IcosahedronGeometry(1, detail)),
    mat(facet(color)),
    [x, sy * 0.42, z],
  );
  m.scale.set(sx, sy, sz);
  return m;
}

function tree(x: number, z: number, size: number, canopy: string, trunkScale = 1): THREE.Group {
  const group = new THREE.Group();

  const trunk = mesh(
    geo(new THREE.CylinderGeometry(size * 0.1, size * 0.15 * trunkScale, size * 0.8, 5)),
    mat(facet(PALETTE.warmBark)),
    [0, size * 0.4, 0],
  );
  group.add(trunk);

  // Two stacked canopy clumps read as a layered silhouette once pixelated.
  const lower = mesh(
    geo(new THREE.IcosahedronGeometry(size * 0.5, 0)),
    mat(facet(canopy)),
    [0, size * 0.95, 0],
  );
  group.add(lower);

  const upper = mesh(
    geo(new THREE.IcosahedronGeometry(size * 0.34, 0)),
    mat(facet(PALETTE.emerald)),
    [size * 0.1, size * 1.32, -size * 0.06],
  );
  group.add(upper);

  group.position.set(x, 0, z);
  return group;
}

function cottage(x: number, z: number, scale: number, wall: string, roof: string): THREE.Group {
  const group = new THREE.Group();

  const walls = mesh(
    geo(new THREE.BoxGeometry(2.2, 1.7, 1.9)),
    mat(facet(wall)),
    [0, 0.85, 0],
  );
  group.add(walls);

  const roofMesh = mesh(
    geo(new THREE.ConeGeometry(1.85, 1.4, 4)),
    mat(facet(roof)),
    [0, 2.3, 0],
  );
  roofMesh.rotation.y = Math.PI / 4;
  group.add(roofMesh);

  // A small chimney gives the roofline a readable notch at low resolution.
  group.add(
    mesh(geo(new THREE.BoxGeometry(0.3, 0.9, 0.3)), mat(facet(PALETTE.umber)), [0.6, 2.6, 0.4]),
  );

  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  return group;
}

/** Chunky stepped cloud built from stacked boxes, per ART_BIBLE.md §6. */
function cloud(x: number, y: number, z: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  const rand = makeRandom(Math.round(x * 13 + y * 7 + z * 3) + 99);

  const blocks = 9;
  for (let i = 0; i < blocks; i += 1) {
    const t = i / (blocks - 1);
    const w = 3.6 * scale * (1 - Math.abs(t - 0.5) * 0.85) * (0.85 + rand() * 0.4);
    const h = 1.8 * scale * (0.75 + rand() * 0.55);
    const d = 1.8 * scale * (0.75 + rand() * 0.45);
    // Bright cream tops with cool shadowed undersides, as the art bible asks.
    const bright = i % 2 === 0;
    group.add(
      mesh(
        geo(new THREE.BoxGeometry(w, h, d)),
        mat(
          new THREE.MeshStandardMaterial({
            color: bright ? '#FFFDF2' : PALETTE.cloudShadow,
            roughness: 1,
            // Clouds are lit by the sky rather than by hard shadowing, so they
            // stay luminous instead of picking up dark cast shadow.
            flatShading: true,
            emissive: new THREE.Color(bright ? '#FFF6DC' : '#8FB6CE'),
            emissiveIntensity: bright ? 0.42 : 0.2,
          }),
        ),
        [(t - 0.5) * 6.4 * scale, (rand() - 0.25) * 0.9 * scale, (rand() - 0.5) * 1.2 * scale],
      ),
    );
  }

  group.position.set(x, y, z);
  return group;
}

/** Segmented wooden fence: a thin-geometry readability test at low resolution. */
function fence(
  points: Array<[number, number]>,
  height = 0.85,
): THREE.Group {
  const group = new THREE.Group();
  const postGeo = geo(new THREE.BoxGeometry(0.09, height, 0.09));
  const postMat = mat(facet(PALETTE.warmBark));

  for (const [x, z] of points) {
    group.add(mesh(postGeo, postMat, [x, height / 2, z]));
  }

  // Rails span each consecutive pair, angled to match the run.
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, z1] = points[i]!;
    const [x2, z2] = points[i + 1]!;
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dz, dx);

    for (const y of [height * 0.42, height * 0.78]) {
      const rail = mesh(
        geo(new THREE.BoxGeometry(length, 0.07, 0.05)),
        postMat,
        [(x1 + x2) / 2, y, (z1 + z2) / 2],
      );
      rail.rotation.y = -angle;
      group.add(rail);
    }
  }

  return group;
}

/** The distant castle: one memorable skyline landmark (ART_BIBLE.md §4.4). */
function castle(x: number, y: number, z: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  // A deeper slate than the surrounding crag so the keep separates from the
  // rock it stands on instead of dissolving into it.
  const stone = mat(facet('#4A6A96'));

  const keep = mesh(geo(new THREE.BoxGeometry(3.0, 4.0, 2.6)), stone, [0, 2.0, 0]);
  group.add(keep);

  // Stepped towers; varying heights keep the silhouette from reading as a box.
  const towers: Array<[number, number, number, number]> = [
    [-2.1, 0, 0, 5.6],
    [2.1, 0, 0.3, 4.4],
    [0.2, 0, -1.5, 6.6],
    [-0.4, 0, 1.6, 3.4],
  ];
  for (const [tx, , tz, th] of towers) {
    group.add(mesh(geo(new THREE.BoxGeometry(1.2, th, 1.2)), stone, [tx, th / 2, tz]));
    group.add(
      mesh(geo(new THREE.ConeGeometry(1.0, 1.2, 4)), mat(facet('#3D5C86')), [
        tx,
        th + 0.6,
        tz,
      ]),
    );
  }

  // A connecting curtain wall ties the towers into one mass.
  group.add(mesh(geo(new THREE.BoxGeometry(4.6, 1.8, 0.8)), stone, [0, 0.9, 0.9]));
  group.add(mesh(geo(new THREE.BoxGeometry(0.8, 1.8, 3.2)), stone, [0, 0.9, -0.6]));

  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  return group;
}

/** The lone traveler: a small, high-contrast foreground silhouette. */
function traveler(x: number, z: number): THREE.Group {
  const group = new THREE.Group();

  group.add(
    mesh(geo(new THREE.CylinderGeometry(0.16, 0.2, 0.62, 6)), mat(facet(PALETTE.umber)), [0, 0.31, 0]),
  );
  const torso = mesh(
    geo(new THREE.CylinderGeometry(0.2, 0.17, 0.55, 6)),
    mat(facet(PALETTE.emerald)),
    [0, 0.88, 0],
  );
  group.add(torso);
  group.add(
    mesh(geo(new THREE.IcosahedronGeometry(0.17, 0)), mat(facet(PALETTE.cloudCream)), [0, 1.28, 0]),
  );
  // Backpack + staff keep the silhouette readable from behind.
  group.add(mesh(geo(new THREE.BoxGeometry(0.3, 0.34, 0.16)), mat(facet(PALETTE.mutedOrange)), [0, 0.92, -0.2]));
  const staff = mesh(
    geo(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 4)),
    mat(facet(PALETTE.warmBark)),
    [0.26, 0.78, -0.1],
  );
  staff.rotation.z = 0.22;
  group.add(staff);

  group.position.set(x, 0, z);
  return group;
}

function signpost(x: number, z: number): THREE.Group {
  const group = new THREE.Group();
  const wood = mat(facet(PALETTE.warmBark));

  group.add(mesh(geo(new THREE.BoxGeometry(0.16, 2.1, 0.16)), wood, [0, 1.05, 0]));
  for (const [y, w, dir] of [
    [1.75, 1.15, 1],
    [1.4, 0.95, -1],
  ] as const) {
    const board = mesh(
      geo(new THREE.BoxGeometry(w, 0.28, 0.07)),
      mat(facet(PALETTE.sandyGold)),
      [(w / 2 + 0.08) * dir, y, 0.02],
    );
    group.add(board);
  }

  group.position.set(x, 0, z);
  group.rotation.y = 0.5;
  return group;
}

function rock(x: number, z: number, size: number, color: string): THREE.Mesh {
  const m = mesh(geo(new THREE.IcosahedronGeometry(size, 0)), mat(facet(color)), [
    x,
    size * 0.55,
    z,
  ]);
  m.rotation.set(0.3, x * 0.4, 0.2);
  return m;
}

/** A winding path or river, built from a flat extruded ribbon. */
function ribbon(
  control: Array<[number, number]>,
  width: number,
  color: string,
  y: number,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(
    control.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  );
  const divisions = 60;
  const geometry = geo(new THREE.BufferGeometry());
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= divisions; i += 1) {
    const t = i / divisions;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const halfWidth = width / 2;

    positions.push(
      point.x + normal.x * halfWidth,
      0,
      point.z + normal.z * halfWidth,
      point.x - normal.x * halfWidth,
      0,
      point.z - normal.z * halfWidth,
    );

    if (i < divisions) {
      // Winding matters: the strip lies in the XZ plane, and the triangle order
      // below is what makes computeVertexNormals produce +Y (up-facing) normals.
      // Reversing it yields -Y normals, and the surface then renders unlit.
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const m = new THREE.Mesh(
    geometry,
    mat(
      new THREE.MeshStandardMaterial({
        color,
        roughness: 1,
        // Flat ribbon surfaces are near-coplanar with the ground; a polygon
        // offset keeps them from z-fighting with it at low internal resolution.
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        side: THREE.DoubleSide,
      }),
    ),
  );
  m.position.y = y;
  m.receiveShadow = true;
  return m;
}

export function buildValleyScene(): ValleyScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.skyBlue);
  // Fog starts well beyond the village so the settlement stays saturated, and
  // only the far ridges dissolve toward blue-gray (ART_BIBLE.md §3, §7).
  scene.fog = new THREE.Fog(PALETTE.paleAzure, 120, 300);

  // Camera: standing on the ridge road, looking slightly *up* the valley so the
  // castle, village, river, and cloud band all fit in one frame. Aiming down
  // instead buries the distant landmarks below the horizon and fills the shot
  // with near ground.
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.5, 600);
  camera.position.set(-2.5, 7, 26);
  camera.lookAt(2, 6, -40);

  // Warm key light from the upper left, matching the reference's sun. The light
  // is positioned high and far so its direction is nearly constant across the
  // valley and the shadow frustum can cover the whole visible scene.
  const sun = new THREE.DirectionalLight('#FFF3D0', 3.1);
  sun.position.set(-48, 62, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 260;
  sun.shadow.camera.left = -90;
  sun.shadow.camera.right = 90;
  sun.shadow.camera.top = 90;
  sun.shadow.camera.bottom = -60;
  sun.shadow.normalBias = 0.12;
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  // Sky/ground ambient keeps shadow interiors cool and legible.
  scene.add(new THREE.HemisphereLight(PALETTE.paleAzure, '#5C8A4C', 1.5));

  const ground = new THREE.Mesh(
    geo(new THREE.PlaneGeometry(600, 600)),
    mat(facet(PALETTE.sunlitGreen, 1)),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  ground.receiveShadow = true;
  scene.add(ground);

  // --- Distant ridges: low contrast, pushed toward blue-gray for depth ------
  // Kept behind the fog start so they read as soft atmospheric silhouettes and
  // never dominate the composition (ART_BIBLE.md §3 "distant terrain loses
  // contrast", §7 "layered distant landmarks").
  // Layered ridges: four staggered depth planes, each greener and more
  // contrasted than the one behind it, so the valley reads as receding space
  // rather than a single backdrop (ART_BIBLE.md §4.5).
  scene.add(ridge(-40, -140, 58, 22, 26, '#4E8F63'));
  scene.add(ridge(52, -148, 62, 24, 28, '#57996A'));
  // A closer, fully saturated hill mass behind the village.
  scene.add(ridge(-64, -96, 46, 18, 22, '#3F8A57'));
  scene.add(ridge(72, -102, 50, 20, 24, '#468F5D'));
  scene.add(ridge(-78, -190, 86, 40, 34, '#6C97A8'));
  scene.add(ridge(84, -200, 92, 46, 38, '#6C97A8'));
  scene.add(ridge(0, -240, 110, 42, 40, PALETTE.coolBlueGray));

  // --- Water: broad calm shapes with a distinct shore boundary --------------
  // A wide river/lake band sitting between the near bank and the village. It is
  // deliberately deep in Z so the shallow camera angle still shows a readable
  // expanse of blue rather than a thin edge-on sliver.
  const riverControl: Array<[number, number]> = [
    [-90, -12],
    [-30, -18],
    [14, -22],
    [56, -16],
    [96, -24],
  ];
  scene.add(ribbon(riverControl, 24, PALETTE.riverBlue, -0.14));
  scene.add(ribbon(riverControl, 15, PALETTE.riverCyan, -0.10));
  // A few pale glints read as water highlights once pixelated.
  const glintRand = makeRandom(77);
  for (let i = 0; i < 30; i += 1) {
    const t = glintRand();
    const x = -70 + t * 150;
    const z = -18 - Math.sin(t * 3.2) * 5 + (glintRand() - 0.5) * 3;
    const glint = new THREE.Mesh(
      geo(new THREE.PlaneGeometry(1.6 + glintRand() * 2.4, 0.5 + glintRand() * 0.5)),
      mat(new THREE.MeshBasicMaterial({ color: PALETTE.paleAzure })),
    );
    glint.rotation.x = -Math.PI / 2;
    glint.position.set(x, -0.05, z);
    scene.add(glint);
  }

  // --- The village: warm anchors against the green-blue landscape -----------
  // Placed on the far bank of the river, in a compact cluster so it reads as
  // one destination mass rather than scattered dots.
  const village: Array<[number, number, number, string, string]> = [
    [-13, -34, 1.9, '#F1D18D', PALETTE.mutedOrange],
    [-4, -39, 2.2, '#E8BD70', '#8E573E'],
    [6, -34, 1.8, '#F0D9A5', PALETTE.mutedOrange],
    [-19, -42, 1.7, '#EAC27C', '#9A5F41'],
    [15, -41, 1.9, '#F3DCA8', '#B06A44'],
    [24, -35, 1.6, '#EFD49B', '#A56442'],
  ];
  for (const [x, z, s, wall, roof] of village) {
    scene.add(cottage(x, z, s, wall, roof));
  }

  // A church tower: a vertical accent that lifts the village skyline.
  const tower = new THREE.Group();
  tower.add(mesh(geo(new THREE.BoxGeometry(1.8, 5.2, 1.8)), mat(facet('#E8D3A0')), [0, 2.6, 0]));
  tower.add(mesh(geo(new THREE.ConeGeometry(1.5, 2.2, 4)), mat(facet(PALETTE.slateBlue)), [0, 6.3, 0]));
  tower.position.set(-1, 0, -30);
  scene.add(tower);

  // A windmill with four blades: a distinctive silhouette on the skyline.
  const mill = new THREE.Group();
  mill.add(
    mesh(geo(new THREE.CylinderGeometry(1.1, 1.5, 4.6, 6)), mat(facet('#E8D3A0')), [0, 2.3, 0]),
  );
  mill.add(mesh(geo(new THREE.ConeGeometry(1.6, 1.6, 6)), mat(facet('#8E573E')), [0, 5.4, 0]));
  for (let i = 0; i < 4; i += 1) {
    const blade = mesh(
      geo(new THREE.BoxGeometry(0.3, 3.4, 0.14)),
      mat(facet(PALETTE.cloudCream)),
      [0, 0, 0],
    );
    blade.position.set(Math.cos((i * Math.PI) / 2) * 1.7, 4.4 + Math.sin((i * Math.PI) / 2) * 1.7, 1.6);
    blade.rotation.z = (i * Math.PI) / 2;
    mill.add(blade);
  }
  mill.position.set(22, 0, -31);
  scene.add(mill);

  // A stone bridge where the road crosses the river.
  for (let i = 0; i < 7; i += 1) {
    const plank = mesh(
      geo(new THREE.BoxGeometry(0.9, 0.22, 5.4)),
      mat(facet(i % 2 === 0 ? PALETTE.sandyGold : '#DCC088')),
      [-4 + i * 0.94, 0.75, -17.5],
    );
    scene.add(plank);
  }
  for (const px of [-4.4, 2.4]) {
    scene.add(
      mesh(geo(new THREE.BoxGeometry(0.5, 1.6, 0.5)), mat(facet('#B9A87E')), [px, 0.8, -20]),
    );
    scene.add(
      mesh(geo(new THREE.BoxGeometry(0.5, 1.6, 0.5)), mat(facet('#B9A87E')), [px, 0.8, -15]),
    );
  }

  // --- Midground foliage: grouped, not evenly scattered ---------------------
  // Clusters flank the village and line the riverbanks, leaving the road and
  // the village itself clear (ART_BIBLE.md §6).
  const rand = makeRandom(2026);
  const treeClusters: Array<[number, number, number]> = [
    [-46, -52, 7.0],
    [-40, -46, 5.4],
    [-54, -44, 6.0],
    [48, -56, 7.2],
    [42, -48, 5.6],
    [56, -50, 6.2],
    [-34, -70, 6.6],
    [40, -74, 6.8],
    [14, -58, 5.0],
    [-18, -62, 5.2],
    [-62, -30, 6.4],
    [66, -34, 6.2],
    // A small stand on the near bank, left of the road.
    [-28, -8, 4.4],
    [-34, -18, 4.8],
  ];
  for (const [x, z, size] of treeClusters) {
    const canopy = rand() > 0.5 ? PALETTE.emerald : PALETTE.deepForest;
    scene.add(tree(x + (rand() - 0.5) * 4, z + (rand() - 0.5) * 4, size, canopy));
  }

  // --- Foreground frame: canopy at the left edge, oversized and close ------
  // A near tree whose canopy clips the top-left corner is what makes the shot
  // feel framed rather than merely observed (ART_BIBLE.md §4.1). The trunk is
  // kept thin and off to the left so it frames without blocking the valley.
  const frameRand = makeRandom(4242);
  const frameTree = new THREE.Group();
  const trunk = mesh(
    geo(new THREE.CylinderGeometry(0.32, 0.5, 13, 6)),
    mat(facet(PALETTE.warmBark)),
    [0, 6, 0],
  );
  trunk.rotation.z = 0.1;
  const frameCanopy = new THREE.Group();
  for (let i = 0; i < 8; i += 1) {
    const size = 4.4 + frameRand() * 3.0;
    const clump = mesh(
      geo(new THREE.IcosahedronGeometry(size, 0)),
      mat(facet(i % 3 === 0 ? PALETTE.emerald : PALETTE.deepForest)),
      [
        (frameRand() - 0.3) * 20,
        13 + (frameRand() - 0.4) * 6,
        (frameRand() - 0.5) * 15,
      ],
    );
    frameCanopy.add(clump);
  }
  frameTree.add(trunk, frameCanopy);
  // The canopy must sit within a few units of the camera to enter the frame at
  // all: at this FOV a tree much further back or further left falls entirely
  // outside the frustum. Placed so the clumps overhang the upper-left corner.
  frameTree.position.set(-16.5, 0, 7);
  frameTree.scale.setScalar(0.55);
  scene.add(frameTree);

  // A second, smaller tree on the right keeps the frame balanced.
  scene.add(tree(30, 4, 8.5, PALETTE.emerald));
  scene.add(tree(-40, -20, 7, PALETTE.deepForest));

  scene.add(signpost(-8.5, 4));

  const rockSpecs: Array<[number, number, number, string]> = [
    [-9.5, 17, 1.8, '#B9A87E'],
    [-3, 20, 1.3, '#C6B489'],
    [13, 16, 2.0, '#AD9E78'],
    [7, 21, 1.4, '#BFAC80'],
    [20, 19, 1.6, '#A79A76'],
    [-13, 22, 1.5, '#B3A57C'],
  ];
  for (const [x, z, size, color] of rockSpecs) {
    scene.add(rock(x, z, size, color));
  }

  scene.add(traveler(-2.5, 6));

  // --- Route: a sandy road winding from the foreground down to the bridge ---
  // Kept narrow: a wide ribbon reads as a lake of sand once the near end is
  // close to camera.
  const roadControl: Array<[number, number]> = [
    [6, 26],
    [2, 18],
    [-1, 10],
    [-3, 2],
    [-3, -6],
    [-2, -15],
  ];
  scene.add(ribbon(roadControl, 1.5, '#C0A163', -0.06));
  scene.add(ribbon(roadControl, 2.3, PALETTE.sandyGold, -0.04));

  // Thin fence rails run beside the road: a pixel-readability stress test.
  scene.add(
    fence([
      [7, 30],
      [9, 24],
      [10, 18],
      [10, 12],
      [9, 6],
    ]),
  );

  // --- Sky: large stepped cloud masses, built from stacked boxes -----------
  // High and far, so they sit in the upper sky as a band rather than crowding
  // down over the valley.
  scene.add(cloud(-52, 58, -150, 6.0));
  scene.add(cloud(-16, 68, -180, 7.4));
  scene.add(cloud(28, 60, -158, 6.2));
  scene.add(cloud(68, 64, -190, 5.6));
  scene.add(cloud(-86, 62, -190, 5.0));
  scene.add(cloud(8, 82, -220, 6.6));

  // --- The distant adventure landmark --------------------------------------
  // A broad, low summit crag with the castle on top. The crag is wide and flat
  // rather than tall, so it reads as a rock plateau instead of a boulder that
  // blocks the valley behind it.
  scene.add(ridge(46, -172, 54, 21, 34, PALETTE.coolBlueGray));
  // Pulled closer than the outermost ridges so fog leaves it a legible
  // silhouette rather than dissolving it into the sky (ART_BIBLE.md §7: the
  // castle "must remain a recognizable silhouette").
  scene.add(castle(46, 18, -172, 6.0));

  return {
    scene,
    camera,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      scene.clear();
    },
  };
}
