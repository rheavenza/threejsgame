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

  const blocks = 7;
  for (let i = 0; i < blocks; i += 1) {
    const t = i / (blocks - 1);
    const w = 3.4 * scale * (1 - Math.abs(t - 0.5) * 0.9) * (0.8 + rand() * 0.5);
    const h = 1.5 * scale * (0.7 + rand() * 0.6);
    const d = 1.6 * scale * (0.7 + rand() * 0.5);
    const bright = i % 2 === 0;
    group.add(
      mesh(
        geo(new THREE.BoxGeometry(w, h, d)),
        mat(facet(bright ? PALETTE.cloudCream : PALETTE.cloudShadow)),
        [(t - 0.5) * 6 * scale, (rand() - 0.3) * 0.7 * scale, 0],
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
  const stone = mat(facet(PALETTE.slateBlue));

  const keep = mesh(geo(new THREE.BoxGeometry(2.4, 3.2, 2.0)), stone, [0, 1.6, 0]);
  group.add(keep);

  // Stepped towers; the tallest offsets the silhouette from a plain block.
  const towers: Array<[number, number, number, number]> = [
    [-1.7, 0, 0, 4.4],
    [1.7, 0, 0.2, 3.6],
    [0.2, 0, -1.2, 5.2],
  ];
  for (const [tx, , tz, th] of towers) {
    group.add(mesh(geo(new THREE.BoxGeometry(1.0, th, 1.0)), stone, [tx, th / 2, tz]));
    group.add(
      mesh(geo(new THREE.ConeGeometry(0.85, 0.9, 4)), mat(facet(PALETTE.coolBlueGray)), [
        tx,
        th + 0.45,
        tz,
      ]),
    );
  }

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

  // Warm key light from the upper left, matching the reference's sun.
  const sun = new THREE.DirectionalLight('#FFF3D0', 2.9);
  sun.position.set(-22, 30, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.shadow.camera.left = -46;
  sun.shadow.camera.right = 46;
  sun.shadow.camera.top = 46;
  sun.shadow.camera.bottom = -34;
  sun.shadow.normalBias = 0.08;
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
  scene.add(ridge(-78, -190, 86, 40, 34, PALETTE.slateBlue));
  scene.add(ridge(84, -200, 92, 46, 38, PALETTE.slateBlue));
  scene.add(ridge(0, -240, 110, 42, 40, PALETTE.coolBlueGray));
  scene.add(ridge(-40, -140, 58, 22, 26, '#6F9B86'));
  scene.add(ridge(52, -148, 62, 24, 28, '#77A183'));

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
  // feel framed rather than merely observed (ART_BIBLE.md §4.1).
  const frameRand = makeRandom(4242);
  const frameTree = new THREE.Group();
  const trunk = mesh(
    geo(new THREE.CylinderGeometry(0.9, 1.3, 22, 6)),
    mat(facet(PALETTE.warmBark)),
    [0, 8.5, 0],
  );
  trunk.rotation.z = 0.08;
  const frameCanopy = new THREE.Group();
  for (let i = 0; i < 7; i += 1) {
    const size = 5 + frameRand() * 3.4;
    const clump = mesh(
      geo(new THREE.IcosahedronGeometry(size, 0)),
      mat(facet(i % 3 === 0 ? PALETTE.emerald : PALETTE.deepForest)),
      [
        (frameRand() - 0.35) * 17,
        19 + (frameRand() - 0.4) * 6,
        (frameRand() - 0.5) * 13,
      ],
    );
    frameCanopy.add(clump);
  }
  frameTree.add(trunk, frameCanopy);
  // Positioned just off the left edge of frame so the canopy overhangs the
  // corner without covering the valley.
  frameTree.position.set(-30, 0, 16);
  scene.add(frameTree);

  // A second, smaller tree on the right keeps the frame balanced.
  scene.add(tree(30, 4, 8.5, PALETTE.emerald));
  scene.add(tree(-40, -20, 7, PALETTE.deepForest));

  scene.add(signpost(-15, 12));

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
  scene.add(cloud(-46, 46, -120, 6.5));
  scene.add(cloud(-14, 54, -150, 8.0));
  scene.add(cloud(26, 48, -128, 6.8));
  scene.add(cloud(62, 52, -160, 6.0));
  scene.add(cloud(-76, 50, -164, 5.4));
  scene.add(cloud(6, 66, -190, 7.2));

  // --- The distant adventure landmark --------------------------------------
  // A broad, low summit crag with the castle on top. The crag is wide and flat
  // rather than tall, so it reads as a rock plateau instead of a boulder that
  // blocks the valley behind it.
  scene.add(ridge(46, -178, 52, 20, 34, PALETTE.coolBlueGray));
  scene.add(castle(46, 17, -178, 5.2));

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
