import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Fit-to-view and camera-state (de)serialization.
//
// Ported from mg-web's `viewerHelpers.js` by way of new-zenxy's `cameraFit.ts`,
// so that a camera state produced here means the same thing in Maker Galaxy's
// viewer. Kept deliberately identical in behaviour rather than "improved" —
// divergence between the two would be a silent integration cost later.

const DEFAULT_DIRECTION = new THREE.Vector3(1, 0.8, 1);
const NEAR_FAR_SPAN = 100;

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/**
 * Frame `object`: aim the controls at its bounding-box centre and pull back far
 * enough that its largest dimension fits both FOVs, with a margin.
 *
 * `keepDirection` reuses the current camera-to-target direction, so a re-fit
 * after the user has orbited keeps their angle instead of snapping back to the
 * default three-quarter view.
 */
export function frameObject(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  marginFraction = 1.25,
  keepDirection = false,
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;

  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const fitHeight = maxDim / 2 / Math.tan(fovRad / 2);
  const fitWidth = fitHeight / Math.min(1, camera.aspect || 1);
  const distance = marginFraction * Math.max(fitHeight, fitWidth);

  const direction =
    keepDirection && camera.position.distanceTo(controls.target) > 1e-6
      ? camera.position.clone().sub(controls.target).normalize()
      : DEFAULT_DIRECTION.clone().normalize();

  camera.position.copy(center).add(direction.multiplyScalar(distance));
  camera.near = distance / NEAR_FAR_SPAN;
  camera.far = distance * NEAR_FAR_SPAN;
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

/** Canonical named views, as direction vectors in three's Y-up display space. */
export const VIEW_DIRECTIONS = {
  front: new THREE.Vector3(0, 0, 1),
  back: new THREE.Vector3(0, 0, -1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
  top: new THREE.Vector3(0, 1, 0),
  bottom: new THREE.Vector3(0, -1, 0),
  iso: new THREE.Vector3(1, 0.8, 1),
} as const;

export type ViewName = keyof typeof VIEW_DIRECTIONS;

/**
 * Snap to a named orthogonal or isometric view and re-fit.
 *
 * The top and bottom views need an explicit `up`: OrbitControls' end-of-update
 * `lookAt` degenerates when the view direction is parallel to `camera.up`, and
 * the model spins to an arbitrary roll.
 */
export function snapToView(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  view: ViewName,
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const direction = VIEW_DIRECTIONS[view].clone().normalize();

  camera.up.set(0, 1, 0);
  if (view === 'top') camera.up.set(0, 0, -1);
  if (view === 'bottom') camera.up.set(0, 0, 1);

  const distance = camera.position.distanceTo(controls.target) || 1;
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  controls.target.copy(center);
  controls.update();

  frameObject(object, camera, controls, 1.25, true);
}

export function serializeCameraState(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): CameraState {
  return {
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [controls.target.x, controls.target.y, controls.target.z],
    fov: camera.fov,
  };
}

export function applyCameraState(
  state: CameraState | null,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): void {
  if (!state) return;
  if (Array.isArray(state.position)) camera.position.set(...state.position);
  if (typeof state.fov === 'number') {
    camera.fov = state.fov;
    camera.updateProjectionMatrix();
  }
  if (Array.isArray(state.target)) controls.target.set(...state.target);
  controls.update();
}
