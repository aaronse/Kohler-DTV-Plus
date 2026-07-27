import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  applyBasis,
  basisToZUp,
  displayMatrixElements,
  scaleFactor,
  type LengthUnit,
  type UpAxis,
} from '../core/units';
import { disposeObject, extractSourceGeometry } from './loaders';
import { frameObject, snapToView, type ViewName } from './cameraFit';
import type { RawGeometry } from '../core/stl';

// The WebGL engine. Owns GPU resources; knows nothing about the catalog or the
// DOM chrome around it.
//
// Display space is DELIBERATELY millimetres, Y-up:
//   * millimetres so the grid squares are a real 10 mm and the pointer readout
//     needs no further conversion;
//   * Y-up because that is three's world and fighting it costs more than the
//     one rotation it saves.
// Export space stays millimetres Z-up. `toExportSpace` is the only bridge
// between the two, and it inverts the display transform rather than guessing.

const CAMERA_FOV = 45;
const MAX_PIXEL_RATIO = 2;
const BACKGROUND_COLOR = 0x0b0d16;
const MODEL_COLOR = 0xb8c1d9;
const GRID_COLOR_CENTER = 0x3a4a5a;
const GRID_COLOR_LINES = 0x232838;
const GRID_OPACITY = 0.35;
const GRID_CELL_MM = 10;
const GRID_MIN_CELLS = 12;
const BBOX_COLOR = 0x4d7cff;
const HIGHLIGHT_COLOR = 0xffb347;

export interface LoadedModel {
  /** Untouched source-space triangle soup. Measurement and export read this. */
  sourceGeometry: RawGeometry;
  sourceUnit: LengthUnit;
  sourceUpAxis: UpAxis;
}

export interface PickResult {
  /** Point in export space: millimetres, Z-up. */
  point: [number, number, number];
  distanceMm: number;
}

export interface ViewerHandles {
  setModel(object: THREE.Object3D, unit: LengthUnit, upAxis: UpAxis): LoadedModel;
  clearModel(): void;
  fit(): void;
  snap(view: ViewName): void;
  setWireframe(on: boolean): void;
  setFlatShading(on: boolean): void;
  setGridVisible(on: boolean): void;
  setBoundsVisible(on: boolean): void;
  /** Screen-space pick, returning export-space millimetres. */
  pick(clientX: number, clientY: number): PickResult | null;
  dispose(): void;
}

export function createViewer(canvas: HTMLCanvasElement, container: HTMLElement): ViewerHandles {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100000);
  camera.position.set(0, 0, 300);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !prefersReducedMotion();
  controls.dampingFactor = 0.08;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x30354a, 1.0));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(1, 1.5, 1);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-1, -0.5, -1);
  scene.add(fill);

  const material = new THREE.MeshStandardMaterial({
    color: MODEL_COLOR,
    metalness: 0.15,
    roughness: 0.7,
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  /** Wraps the loaded model and carries the source -> display transform. */
  let modelRoot: THREE.Group | null = null;
  let grid: THREE.GridHelper | null = null;
  let bounds: THREE.Box3Helper | null = null;
  let loaded: LoadedModel | null = null;
  let frameId = 0;
  let disposed = false;

  function clearModel(): void {
    if (modelRoot) {
      scene.remove(modelRoot);
      disposeObject(modelRoot);
      modelRoot = null;
    }
    if (grid) {
      scene.remove(grid);
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      grid = null;
    }
    if (bounds) {
      scene.remove(bounds);
      bounds.geometry.dispose();
      (bounds.material as THREE.Material).dispose();
      bounds = null;
    }
    loaded = null;
  }

  function setModel(object: THREE.Object3D, unit: LengthUnit, upAxis: UpAxis): LoadedModel {
    clearModel();

    // Snapshot the geometry BEFORE any display transform touches it. Everything
    // measured or exported comes from here, never from the scene graph.
    const sourceGeometry = extractSourceGeometry(object);
    loaded = { sourceGeometry, sourceUnit: unit, sourceUpAxis: upAxis };

    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) mesh.material = material;
    });

    // Source -> display: scale into millimetres and rotate the declared up axis
    // onto +Y. The elements come from `displayMatrixElements`, which is pure and
    // unit-tested; building it here inline is how a shear or a mirror sneaks in
    // unnoticed, since a wrongly-oriented part just looks like a wrongly-
    // oriented part.
    modelRoot = new THREE.Group();
    const m = new THREE.Matrix4();
    m.set(...(displayMatrixElements(upAxis, unit) as Parameters<THREE.Matrix4['set']>));
    modelRoot.applyMatrix4(m);
    modelRoot.add(object);
    scene.add(modelRoot);

    addGrid();
    addBounds();
    frameObject(modelRoot, camera, controls);
    return loaded;
  }

  /** A real 10 mm grid, sized to sit comfortably under the part. */
  function addGrid(): void {
    if (!modelRoot) return;
    const box = new THREE.Box3().setFromObject(modelRoot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const footprint = Math.max(size.x, size.z, GRID_CELL_MM * GRID_MIN_CELLS);
    const cells = Math.max(GRID_MIN_CELLS, Math.ceil((footprint * 1.6) / GRID_CELL_MM));
    const extent = cells * GRID_CELL_MM;

    grid = new THREE.GridHelper(extent, cells, GRID_COLOR_CENTER, GRID_COLOR_LINES);
    grid.position.set(center.x, box.min.y, center.z);
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = GRID_OPACITY;
    grid.visible = true;
    scene.add(grid);
  }

  function addBounds(): void {
    if (!modelRoot) return;
    const box = new THREE.Box3().setFromObject(modelRoot);
    bounds = new THREE.Box3Helper(box, new THREE.Color(BBOX_COLOR));
    bounds.visible = false;
    scene.add(bounds);
  }

  /**
   * Convert a display-space point back to export space (mm, Z-up).
   *
   * Inverts the model root's actual matrix to recover source coordinates, then
   * re-applies the export transform. Deriving it from the live matrix rather
   * than re-deriving from unit/axis means a display change can never silently
   * desynchronise the readout from the geometry.
   */
  function toExportSpace(displayPoint: THREE.Vector3): [number, number, number] {
    if (!modelRoot || !loaded) return [0, 0, 0];
    modelRoot.updateMatrixWorld(true);
    const inverse = new THREE.Matrix4().copy(modelRoot.matrixWorld).invert();
    const source = displayPoint.clone().applyMatrix4(inverse);
    const mmScale = scaleFactor(loaded.sourceUnit, 'mm');
    return applyBasis(
      basisToZUp(loaded.sourceUpAxis),
      source.x * mmScale,
      source.y * mmScale,
      source.z * mmScale,
    );
  }

  function pick(clientX: number, clientY: number): PickResult | null {
    if (!modelRoot) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(modelRoot, true)[0];
    if (!hit) return null;
    return { point: toExportSpace(hit.point), distanceMm: hit.distance };
  }

  function resize(): void {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function renderFrame(): void {
    if (disposed) return;
    frameId = window.requestAnimationFrame(renderFrame);
    resize();
    controls.update();
    renderer.render(scene, camera);
  }

  resize();
  renderFrame();

  return {
    setModel,
    clearModel,
    fit: () => {
      if (modelRoot) frameObject(modelRoot, camera, controls, 1.25, true);
    },
    snap: (view) => {
      if (modelRoot) snapToView(modelRoot, camera, controls, view);
    },
    setWireframe: (on) => {
      material.wireframe = on;
      material.needsUpdate = true;
    },
    setFlatShading: (on) => {
      material.flatShading = on;
      material.needsUpdate = true;
    },
    setGridVisible: (on) => {
      if (grid) grid.visible = on;
    },
    setBoundsVisible: (on) => {
      if (bounds) bounds.visible = on;
    },
    pick,
    dispose: () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      clearModel();
      material.dispose();
      controls.dispose();
      renderer.dispose();
    },
  };
}

export function isWebglSupported(): boolean {
  return typeof window !== 'undefined' && 'WebGLRenderingContext' in window;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const VIEWER_COLORS = { HIGHLIGHT_COLOR, MODEL_COLOR } as const;
