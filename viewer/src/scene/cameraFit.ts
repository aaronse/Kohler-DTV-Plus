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
  snapToDirection(object, camera, controls, VIEW_DIRECTIONS[view]);
}

/**
 * Snap to an arbitrary display-space direction and re-fit. `snapToView` is this
 * with a named direction; the view gizmo needs the unnamed form.
 *
 * `up` overrides which way is up on screen. Without it the world's Y is used,
 * which is right for CAD-frame views and wrong whenever a part is authored on
 * its side — the K-99693's faceplate is upright along the CAD's -X, so viewing
 * it the way a person would see it on the wall needs the override.
 *
 * A direction parallel to the up vector needs a different up: OrbitControls'
 * end-of-update `lookAt` degenerates when the two are parallel, and the model
 * spins to an arbitrary roll.
 */
export function snapToDirection(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  towards: THREE.Vector3,
  up?: THREE.Vector3,
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const direction = towards.clone().normalize();

  if (up) {
    camera.up.copy(up).normalize();
  } else {
    camera.up.set(0, 1, 0);
    if (direction.y > 0.999) camera.up.set(0, 0, -1);
    if (direction.y < -0.999) camera.up.set(0, 0, 1);
  }
  syncControlsUp(camera, controls);

  const distance = camera.position.distanceTo(controls.target) || 1;
  camera.position.copy(center).add(direction.multiplyScalar(distance));
  controls.target.copy(center);
  controls.update();

  frameObject(object, camera, controls, 1.25, true);
}

/**
 * Roll the camera about its own line of sight.
 *
 * `radians` is the direction the MODEL appears to turn on screen, which is the
 * opposite of the way the up vector moves — an arrow that promises a clockwise
 * rotation has to rotate `up` anticlockwise to deliver it.
 */
export function rollCamera(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  radians: number,
): void {
  const sight = camera.position.clone().sub(controls.target);
  if (sight.lengthSq() < 1e-12) return;
  const axis = sight.normalize();

  // Square `up` to the line of sight before rolling it. After orbiting, the
  // camera's stored up is still world-up and leans out of the screen plane;
  // `lookAt` quietly discards the leaning part, so the picture looks right
  // while the vector is not the screen's up at all. Rolling that vector
  // preserves the lean, and the orbit axis handed to the controls below then
  // disagrees with what the user sees.
  const up = camera.up.clone().projectOnPlane(axis);
  if (up.lengthSq() < 1e-12) return;

  // Negated: turning the up vector one way turns the picture the other. The
  // parameter is what the viewer sees, because that is what the arrow promised.
  camera.up.copy(up.normalize().applyAxisAngle(axis, -radians));
  syncControlsUp(camera, controls);
  controls.update();
}

/** Reset to the default framing: the standard three-quarter view, refitted. */
export function goHome(
  object: THREE.Object3D,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
): void {
  snapToView(object, camera, controls, 'iso');
}

/**
 * Tell OrbitControls that `camera.up` has moved.
 *
 * OrbitControls derives its orbit frame from `camera.up` ONCE, in its
 * constructor, and caches it as `_quat` / `_quatInverse` (see the "so camera.up
 * is the orbit axis" comment in its source). Nothing re-derives it, so changing
 * `camera.up` afterwards rolls the picture but leaves dragging orbiting around
 * the old axis — the view and the mouse stop agreeing, which reads as the
 * controls being broken rather than as a stale cache.
 *
 * Those two fields are underscore-prefixed, so this is reaching past the public
 * API on purpose. It is guarded rather than assumed: if a future three renames
 * them, roll degrades to "the picture rolls but orbiting stays Y-up", which is
 * exactly today's behaviour without this function, rather than throwing.
 */
function syncControlsUp(camera: THREE.PerspectiveCamera, controls: OrbitControls): void {
  const internals = controls as unknown as {
    _quat?: THREE.Quaternion;
    _quatInverse?: THREE.Quaternion;
  };
  if (!internals._quat || !internals._quatInverse) return;
  internals._quat.setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
  internals._quatInverse.copy(internals._quat).invert();
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
