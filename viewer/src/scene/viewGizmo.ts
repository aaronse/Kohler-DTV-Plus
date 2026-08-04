import * as THREE from 'three';

// The orientation gizmo: a chamfered view cube in the corner of the viewport,
// with curved arrows for 90-degree steps. Modelled on Fusion 360's, because
// that is the one people already know — a gizmo that has to be learned is worse
// than no gizmo.
//
// TWENTY-SIX PICK REGIONS
//
// The chamfer is not decoration. A plain cube gives six views; chamfering it
// exposes the twelve edges and eight corners as separate faces, so the same
// widget also reaches the twelve 45-degree edge-on views and the eight
// isometrics. That is the whole reason Fusion's cube is chamfered, and it is
// most of the value of the control.
//
//   6 faces   -> the orthographic views
//   12 edges  -> 45 degrees between two faces
//   8 corners -> the isometrics
//
// LABELLED IN EXPORT SPACE, NOT DISPLAY SPACE, AND NOT "FRONT"/"TOP"
//
// The viewport is Y-up because three is Y-up; every number this app reports —
// the pointer readout, the measurements, the decal anchors, the exported STL —
// is millimetres Z-up. A gizmo labelled with the viewport's own axes would be a
// fourth convention for the user to hold in their head, and would contradict
// the readout in the opposite corner of the same canvas.
//
// The faces are also NOT labelled FRONT / TOP / RIGHT, tempting as that is. On
// the K-99693 the product's faceplate is on the CAD's +Y — the axis a CAD
// convention calls "back" — so naming the faces after the product would be
// wrong for other parts, and naming them after the CAD would be wrong for this
// one. Axis names are true for both.
//
//   export +X  ->  display +X
//   export +Y  ->  display -Z      (the K-99693's faceplate)
//   export +Z  ->  display +Y
//
// Rendered as a second viewport in the same canvas rather than a second WebGL
// context: one renderer, one animation loop, no chance of the two drifting out
// of sync by a frame.

/** Pixels along each edge of the gizmo's viewport. */
const SIZE = 176;
/** Gap from the canvas corner, matching the readout's inset. */
const INSET = 12;
/** Orthographic half-extent. The cube is 1 unit half-width; the chrome sits outside it. */
const EXTENT = 2.14;

const CUBE_HALF = 1;
/** How far the chamfer cuts in. 0 is a plain cube; 1 is an octahedron. */
const CHAMFER = 0.28;
const INNER = CUBE_HALF - CHAMFER;

/** Step triangles, on the four sides. */
const STEP_RADIUS = 1.58;
const STEP_SCALE = 0.44;
/** Roll arrows, paired at the top right, as Fusion places them. */
const ROLL_POSITIONS: Array<[number, number]> = [
  [1.18, 1.66],
  [1.68, 1.22],
];
const ROLL_SCALE = 0.82;
/** Home, opposite the roll pair. */
const HOME_POSITION: [number, number] = [-1.62, 1.66];
const HOME_SCALE = 0.5;

const CHROME_IDLE_OPACITY = 0.38;
const CHROME_HOVER_OPACITY = 1;

const FACE_COLOR = 0x8b98b5;
const CHAMFER_COLOR = 0x5c688a;
const HOVER_COLOR = 0xffb347;
const ARROW_COLOR = 0xc7d0e4;
const LABEL_DARK = '#0b0d16';

const AXES = ['X', 'Y', 'Z'] as const;

/** Export axis -> display direction. The one place the mapping is written. */
const EXPORT_TO_DISPLAY: Record<(typeof AXES)[number], THREE.Vector3> = {
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 0, -1),
  Z: new THREE.Vector3(0, 1, 0),
};

export type GizmoStep = 'left' | 'right' | 'up' | 'down';

export type GizmoPick =
  /** A cube region: look at the model from this display-space direction. */
  | { kind: 'view'; towards: THREE.Vector3; label: string }
  /** A side triangle: turn 90 degrees this way and land on the nearest region. */
  | { kind: 'step'; step: GizmoStep; label: string }
  /** A curved arrow: roll about the line of sight. Sign is the on-screen turn. */
  | { kind: 'roll'; radians: number; label: string }
  /** The house: back to the default three-quarter view, refitted. */
  | { kind: 'home'; label: string };

interface Region {
  object: THREE.Object3D;
  pick: GizmoPick;
  /** Restored when the pointer leaves. */
  restore: () => void;
  highlight: () => void;
}

export interface ViewGizmoHandles {
  /** Draw into the corner of the canvas. Call after the main scene is rendered. */
  render(renderer: THREE.WebGLRenderer, mainCamera: THREE.PerspectiveCamera): void;
  /** Update the hover highlight and report what is under the pointer. */
  hover(clientX: number, clientY: number, renderer: THREE.WebGLRenderer): GizmoPick | null;
  /** What is under the pointer, without changing the highlight. */
  hit(clientX: number, clientY: number, renderer: THREE.WebGLRenderer): GizmoPick | null;
  dispose(): void;
}

export function createViewGizmo(): ViewGizmoHandles {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-EXTENT, EXTENT, EXTENT, -EXTENT, 0.1, 100);
  // The arrows hang off the camera so they stay put on screen while the cube
  // turns underneath them, which is how Fusion's behave.
  scene.add(camera);

  const regions: Region[] = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: Region | null = null;

  buildCube(scene, regions);
  buildChrome(camera, regions);

  function viewportOf(renderer: THREE.WebGLRenderer): { x: number; y: number; size: number } {
    // CSS pixels, NOT device pixels: setViewport and setScissor apply the
    // renderer's pixel ratio themselves. Applying it here as well puts the
    // gizmo off the canvas on any HiDPI display.
    const target = renderer.getSize(new THREE.Vector2());
    return { x: target.x - SIZE - INSET, y: INSET, size: SIZE };
  }

  function render(renderer: THREE.WebGLRenderer, mainCamera: THREE.PerspectiveCamera): void {
    // Match the main camera's orientation at a fixed distance, so the cube
    // turns with the part but never changes size.
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(mainCamera.quaternion);
    camera.position.copy(forward).multiplyScalar(-4);
    camera.up.copy(mainCamera.up);
    camera.lookAt(0, 0, 0);

    const view = viewportOf(renderer);
    const previousAutoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setScissorTest(true);
    renderer.setViewport(view.x, view.y, view.size, view.size);
    renderer.setScissor(view.x, view.y, view.size, view.size);
    renderer.clearDepth();
    renderer.render(scene, camera);
    renderer.setScissorTest(false);

    // Hand the full canvas back, or the next main render draws into the corner.
    const target = renderer.getSize(new THREE.Vector2());
    renderer.setViewport(0, 0, target.x, target.y);
    renderer.autoClear = previousAutoClear;
  }

  function pick(clientX: number, clientY: number, renderer: THREE.WebGLRenderer): Region | null {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = clientX - rect.left;
    // CSS pixels from the canvas's bottom-left, matching the viewport origin.
    const y = rect.height - (clientY - rect.top);
    const left = rect.width - SIZE - INSET;
    if (x < left || x > left + SIZE || y < INSET || y > INSET + SIZE) return null;

    pointer.x = ((x - left) / SIZE) * 2 - 1;
    pointer.y = ((y - INSET) / SIZE) * 2 - 1;
    // The arrows are camera children, so their world matrices are only correct
    // once the camera's is.
    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(regions.map((r) => r.object), false)[0];
    return hit ? (regions.find((r) => r.object === hit.object) ?? null) : null;
  }

  function setHovered(region: Region | null): void {
    if (hovered === region) return;
    hovered?.restore();
    hovered = region;
    hovered?.highlight();
  }

  return {
    render,
    hover: (clientX, clientY, renderer) => {
      const region = pick(clientX, clientY, renderer);
      setHovered(region);
      return region?.pick ?? null;
    },
    hit: (clientX, clientY, renderer) => pick(clientX, clientY, renderer)?.pick ?? null,
    dispose: () => {
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        const sprite = object as THREE.Sprite;
        if (mesh.isMesh) mesh.geometry.dispose();
        if (!mesh.isMesh && !sprite.isSprite) return;
        const material = (mesh.isMesh ? mesh.material : sprite.material) as THREE.SpriteMaterial;
        material.map?.dispose();
        material.dispose();
      });
    },
  };
}

/**
 * Turn a 90-degree step into the direction to look from next.
 *
 * The step rotates the current view direction about the camera's own up or
 * right vector, then lands on the nearest of the cube's 26 regions. Snapping to
 * a region rather than applying the rotation directly means the arrows always
 * arrive somewhere the cube can also reach, even from a freely orbited angle.
 */
export function stepDirection(
  step: GizmoStep,
  camera: THREE.PerspectiveCamera,
  target: THREE.Vector3,
): THREE.Vector3 {
  const view = camera.position.clone().sub(target).normalize();
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();

  // Each arrow brings the region it points at round to the front, which is the
  // convention every view cube uses: the arrow on the right of the cube shows
  // you what is currently on the right.
  const quarter = Math.PI / 2;
  const rotated = view.clone();
  if (step === 'left') rotated.applyAxisAngle(up, -quarter);
  if (step === 'right') rotated.applyAxisAngle(up, quarter);
  if (step === 'up') rotated.applyAxisAngle(right, -quarter);
  if (step === 'down') rotated.applyAxisAngle(right, quarter);

  return nearestRegionDirection(rotated);
}

/** The closest of the cube's 26 outward directions. */
export function nearestRegionDirection(to: THREE.Vector3): THREE.Vector3 {
  let best = new THREE.Vector3(0, 0, 1);
  let bestDot = -Infinity;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (!x && !y && !z) continue;
        const candidate = new THREE.Vector3(x, y, z).normalize();
        const dot = candidate.dot(to);
        if (dot > bestDot) {
          bestDot = dot;
          best = candidate;
        }
      }
    }
  }
  return best;
}

// ---------------------------------------------------------------- cube

function buildCube(scene: THREE.Scene, regions: Region[]): void {
  const e = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ];

  // Faces. Labelled with the EXPORT axis whose display direction they face.
  for (const axis of AXES) {
    for (const sign of [1, -1] as const) {
      const normal = EXPORT_TO_DISPLAY[axis].clone().multiplyScalar(sign);
      const label = `${sign > 0 ? '+' : '−'}${axis}`;
      const { right, up } = faceBasis(normal);
      const centre = normal.clone().multiplyScalar(CUBE_HALF);
      const corners = [
        centre.clone().addScaledVector(right, -INNER).addScaledVector(up, -INNER),
        centre.clone().addScaledVector(right, INNER).addScaledVector(up, -INNER),
        centre.clone().addScaledVector(right, INNER).addScaledVector(up, INNER),
        centre.clone().addScaledVector(right, -INNER).addScaledVector(up, INNER),
      ];
      const mesh = new THREE.Mesh(
        polygon(corners, normal, true),
        new THREE.MeshBasicMaterial({ color: FACE_COLOR, map: faceTexture(label) }),
      );
      add(scene, regions, mesh, { kind: 'view', towards: normal, label }, FACE_COLOR);
    }
  }

  // Edge chamfers: a quad bridging the trimmed borders of two faces.
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const k = 3 - i - j;
      for (const si of [1, -1] as const) {
        for (const sj of [1, -1] as const) {
          const corners = [
            span(e, i, si * CUBE_HALF, j, sj * INNER, k, -INNER),
            span(e, i, si * INNER, j, sj * CUBE_HALF, k, -INNER),
            span(e, i, si * INNER, j, sj * CUBE_HALF, k, INNER),
            span(e, i, si * CUBE_HALF, j, sj * INNER, k, INNER),
          ];
          const normal = e[i]
            .clone()
            .multiplyScalar(si)
            .addScaledVector(e[j], sj)
            .normalize();
          const mesh = new THREE.Mesh(
            polygon(corners, normal, false),
            new THREE.MeshBasicMaterial({ color: CHAMFER_COLOR }),
          );
          add(scene, regions, mesh, { kind: 'view', towards: normal, label: 'edge' }, CHAMFER_COLOR);
        }
      }
    }
  }

  // Corner chamfers: a triangle across the three trimmed face borders.
  for (const sx of [1, -1] as const) {
    for (const sy of [1, -1] as const) {
      for (const sz of [1, -1] as const) {
        const corners = [
          new THREE.Vector3(sx * CUBE_HALF, sy * INNER, sz * INNER),
          new THREE.Vector3(sx * INNER, sy * CUBE_HALF, sz * INNER),
          new THREE.Vector3(sx * INNER, sy * INNER, sz * CUBE_HALF),
        ];
        const normal = new THREE.Vector3(sx, sy, sz).normalize();
        const mesh = new THREE.Mesh(
          polygon(corners, normal, false),
          new THREE.MeshBasicMaterial({ color: CHAMFER_COLOR }),
        );
        add(scene, regions, mesh, { kind: 'view', towards: normal, label: 'corner' }, CHAMFER_COLOR);
      }
    }
  }
}

function add(
  scene: THREE.Object3D,
  regions: Region[],
  mesh: THREE.Mesh,
  pick: GizmoPick,
  baseColor: number,
): void {
  scene.add(mesh);
  const material = mesh.material as THREE.MeshBasicMaterial;
  regions.push({
    object: mesh,
    pick,
    highlight: () => material.color.setHex(HOVER_COLOR),
    restore: () => material.color.setHex(baseColor),
  });
}

/** A point at `a` along axis `i`, `b` along `j` and `c` along `k`. */
function span(
  e: THREE.Vector3[],
  i: number,
  a: number,
  j: number,
  b: number,
  k: number,
  c: number,
): THREE.Vector3 {
  return e[i]
    .clone()
    .multiplyScalar(a)
    .addScaledVector(e[j], b)
    .addScaledVector(e[k], c);
}

/**
 * In-plane basis for a face, chosen so its label reads the right way up when
 * the camera is looking straight at it.
 */
function faceBasis(normal: THREE.Vector3): { right: THREE.Vector3; up: THREE.Vector3 } {
  // Any reference up parallel to the normal degenerates, so the two horizontal
  // faces borrow a different one — the same trick `snapToDirection` uses.
  const reference =
    Math.abs(normal.y) > 0.9
      ? new THREE.Vector3(0, 0, normal.y > 0 ? -1 : 1)
      : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(reference, normal).normalize();
  const up = new THREE.Vector3().crossVectors(normal, right).normalize();
  return { right, up };
}

/**
 * A triangle or quad from ordered corners, wound so it faces `normal`.
 *
 * The winding is corrected rather than assumed: the edge and corner chamfers
 * are generated from sign loops, and half of them come out back-facing. A
 * back-facing pick region is invisible and unclickable, which is a tedious bug
 * to chase for the sake of a cross product.
 */
function polygon(corners: THREE.Vector3[], normal: THREE.Vector3, withUv: boolean): THREE.BufferGeometry {
  const facing = new THREE.Vector3()
    .subVectors(corners[1], corners[0])
    .cross(new THREE.Vector3().subVectors(corners[2], corners[0]));
  const ordered = facing.dot(normal) >= 0 ? corners : [...corners].reverse();

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(ordered.length * 3);
  const normals = new Float32Array(ordered.length * 3);
  ordered.forEach((corner, index) => {
    positions.set([corner.x, corner.y, corner.z], index * 3);
    normals.set([normal.x, normal.y, normal.z], index * 3);
  });
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  if (withUv) {
    // Quads only, and only faces carry a label. Reversal above would put the
    // UVs on backwards, so they follow the same order.
    const uv = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const source = facing.dot(normal) >= 0 ? uv : [...uv].reverse();
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(source.flat()), 2));
  }

  geometry.setIndex(ordered.length === 3 ? [0, 1, 2] : [0, 1, 2, 0, 2, 3]);
  return geometry;
}

// ---------------------------------------------------------------- arrows

/**
 * The chrome around the cube, laid out the way Fusion lays it out:
 *
 *   - four triangles on the sides, each a 90-degree turn onto the neighbouring
 *     region;
 *   - a pair of curved arrows at the top right, which ROLL the camera about its
 *     own line of sight — the one rotation the cube itself cannot express,
 *     since every cube region implies a canonical up vector;
 *   - a house at the top left, back to the default framing.
 *
 * All of it is parented to the camera, so it holds its screen position while
 * the cube turns underneath. It idles at low opacity and brightens under the
 * pointer: present when wanted, out of the way when not.
 */
function buildChrome(camera: THREE.Camera, regions: Region[]): void {
  const place = (
    texture: THREE.Texture,
    x: number,
    y: number,
    scale: number,
    rotation: number,
    pick: GizmoPick,
  ): void => {
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: ARROW_COLOR,
      transparent: true,
      opacity: CHROME_IDLE_OPACITY,
      rotation,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    // Camera-local: x right, y up, and negative z is in front of the lens.
    sprite.position.set(x, y, -1);
    sprite.scale.setScalar(scale);
    sprite.renderOrder = 2;
    camera.add(sprite);
    regions.push({
      object: sprite,
      pick,
      highlight: () => {
        material.opacity = CHROME_HOVER_OPACITY;
        material.color.setHex(HOVER_COLOR);
      },
      restore: () => {
        material.opacity = CHROME_IDLE_OPACITY;
        material.color.setHex(ARROW_COLOR);
      },
    });
  };

  // Side triangles, each pointing INWARD at the cube, as Fusion draws them.
  // Outward-pointing reads as "move the camera that way"; inward reads as
  // "bring that side round to the front", which is what actually happens.
  const triangle = triangleTexture();
  const steps: Array<{ step: GizmoStep; x: number; y: number; rotation: number }> = [
    { step: 'up', x: 0, y: STEP_RADIUS, rotation: Math.PI },
    { step: 'down', x: 0, y: -STEP_RADIUS, rotation: 0 },
    { step: 'left', x: -STEP_RADIUS, y: 0, rotation: -Math.PI / 2 },
    { step: 'right', x: STEP_RADIUS, y: 0, rotation: Math.PI / 2 },
  ];
  for (const s of steps) {
    place(triangle, s.x, s.y, STEP_SCALE, s.rotation, {
      kind: 'step',
      step: s.step,
      label: `turn ${s.step}`,
    });
  }

  // Roll pair. `radians` is the way the MODEL turns on screen, which is what
  // the arrow depicts — the up vector goes the other way to deliver it.
  const quarter = Math.PI / 2;
  place(rollTexture(false), ROLL_POSITIONS[0][0], ROLL_POSITIONS[0][1], ROLL_SCALE, 0, {
    kind: 'roll',
    radians: quarter,
    label: 'roll anticlockwise',
  });
  place(rollTexture(true), ROLL_POSITIONS[1][0], ROLL_POSITIONS[1][1], ROLL_SCALE, 0, {
    kind: 'roll',
    radians: -quarter,
    label: 'roll clockwise',
  });

  place(homeTexture(), HOME_POSITION[0], HOME_POSITION[1], HOME_SCALE, 0, {
    kind: 'home',
    label: 'home view',
  });
}

// Every sprite texture is white artwork on transparent, so the material's
// `color` can tint it — which makes the hover highlight a one-line colour swap
// rather than a second texture per control. All of them are drawn about the
// CANVAS CENTRE: sprite rotation spins the texture inside its own quad, so
// artwork that strays towards an edge gets clipped once rotated.

/** A triangle pointing up: one 90-degree step onto the neighbouring region. */
function triangleTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const c = size / 2;
    const r = size * 0.36;
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.moveTo(c, c - r);
    context.lineTo(c + r * 0.9, c + r * 0.66);
    context.lineTo(c - r * 0.9, c + r * 0.66);
    context.closePath();
    context.fill();
  }
  return finish(canvas);
}

/**
 * A thick quarter-turn swept arc with a head on the leading end.
 *
 * Exactly 90 degrees, because that is exactly what one click does — an arc that
 * sweeps most of a circle reads as "reload", which is what the first attempt
 * looked like. The two arrows are mirror images bowing over the top of the
 * cube, and the head points the way the model will turn.
 */
function rollTexture(clockwise: boolean): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const c = size / 2;
    // A tight radius on purpose: 90 degrees swept at a large radius is almost
    // a straight line, and the curve is the whole point of the glyph.
    const radius = size * 0.31;
    // Kept well under the arc's own length. An oversized head swallows the
    // sweep and the glyph stops reading as a rotation at all.
    const head = size * 0.12;
    // The top quadrant: a true 90 degrees from upper-left to upper-right.
    const start = Math.PI * 1.25;
    const end = Math.PI * 1.75;
    // Stop the stroke just short of the tip so the head caps the sweep rather
    // than sprouting out of the side of a line cap.
    const tail = clockwise ? start : end;
    const tip = clockwise ? end : start;
    const stroked = clockwise ? end - 0.16 : start + 0.16;

    context.strokeStyle = '#ffffff';
    context.lineWidth = size * 0.13;
    context.lineCap = 'butt';
    context.beginPath();
    context.arc(c, c, radius, Math.min(tail, stroked), Math.max(tail, stroked));
    context.stroke();

    // Head laid along the tangent, pointing the way the sweep runs.
    const tipX = c + Math.cos(tip) * radius;
    const tipY = c + Math.sin(tip) * radius;
    const tangent = tip + (clockwise ? Math.PI / 2 : -Math.PI / 2);
    const point = (angle: number, distance: number): [number, number] => [
      tipX + Math.cos(angle) * distance,
      tipY + Math.sin(angle) * distance,
    ];
    context.fillStyle = '#ffffff';
    context.beginPath();
    context.moveTo(...point(tangent, head));
    context.lineTo(...point(tangent + 2.3, head * 1.05));
    context.lineTo(...point(tangent - 2.3, head * 1.05));
    context.closePath();
    context.fill();
  }
  return finish(canvas);
}

/** A house: the default framing, same idea as Fusion's home. */
function homeTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const c = size / 2;
    const r = size * 0.34;
    context.strokeStyle = '#ffffff';
    context.lineWidth = size * 0.1;
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(c - r, c - r * 0.06);
    context.lineTo(c, c - r * 0.86);
    context.lineTo(c + r, c - r * 0.06);
    context.stroke();
    context.beginPath();
    context.moveTo(c - r * 0.68, c - r * 0.24);
    context.lineTo(c - r * 0.68, c + r * 0.78);
    context.lineTo(c + r * 0.68, c + r * 0.78);
    context.lineTo(c + r * 0.68, c - r * 0.24);
    context.stroke();
  }
  return finish(canvas);
}

function finish(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * A face label, drawn dark on white so the material's `color` can tint it —
 * which is what makes the hover highlight a one-line colour swap rather than a
 * second texture per face.
 */
function faceTexture(label: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);
    context.strokeStyle = 'rgba(11, 13, 22, 0.35)';
    context.lineWidth = 6;
    context.strokeRect(3, 3, size - 6, size - 6);
    context.fillStyle = LABEL_DARK;
    context.font = `600 ${size * 0.38}px ui-sans-serif, system-ui, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, size / 2, size / 2 + size * 0.02);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
