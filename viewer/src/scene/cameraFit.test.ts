import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { rollCamera } from './cameraFit';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Roll, tested without a DOM. OrbitControls needs an element to attach to, so
// these use a stand-in carrying only the fields roll touches: the target, the
// cached up-axis quaternions, and `update`.
//
// The stand-in is the point of the test as much as the maths is. OrbitControls
// derives its orbit frame from `camera.up` once, in its constructor, and caches
// it in `_quat` / `_quatInverse`. If roll changes `camera.up` without
// refreshing those, the picture rolls but dragging still orbits about the old
// axis — the view and the mouse quietly stop agreeing.

interface FakeControls {
  target: THREE.Vector3;
  _quat: THREE.Quaternion;
  _quatInverse: THREE.Quaternion;
  updates: number;
  update(): void;
}

function fakeControls(camera: THREE.PerspectiveCamera): FakeControls {
  const quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
  return {
    target: new THREE.Vector3(),
    _quat: quat,
    _quatInverse: quat.clone().invert(),
    updates: 0,
    update() {
      this.updates++;
    },
  };
}

/** Where a world direction lands on screen: +x is right, +y is up. */
function toScreen(camera: THREE.PerspectiveCamera, world: THREE.Vector3): { x: number; y: number } {
  const forward = camera.position.clone().negate().normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  return { x: world.dot(right), y: world.dot(up) };
}

describe('rollCamera', () => {
  const facing = (): THREE.PerspectiveCamera => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.up.set(0, 1, 0);
    return camera;
  };

  it('turns the picture anticlockwise for a positive angle', () => {
    // The parameter is what the VIEWER sees, not how the up vector moves —
    // an arrow that promises anticlockwise has to deliver anticlockwise.
    const camera = facing();
    const controls = fakeControls(camera);
    const before = toScreen(camera, new THREE.Vector3(1, 0, 0));
    expect(before.x).toBeCloseTo(1, 6);
    expect(before.y).toBeCloseTo(0, 6);

    rollCamera(camera, controls as unknown as OrbitControls, Math.PI / 2);

    // World +X started on the right; a quarter turn anticlockwise puts it up.
    const after = toScreen(camera, new THREE.Vector3(1, 0, 0));
    expect(after.x).toBeCloseTo(0, 6);
    expect(after.y).toBeCloseTo(1, 6);
  });

  it('turns the picture clockwise for a negative angle', () => {
    const camera = facing();
    const controls = fakeControls(camera);
    rollCamera(camera, controls as unknown as OrbitControls, -Math.PI / 2);
    const after = toScreen(camera, new THREE.Vector3(1, 0, 0));
    expect(after.y).toBeCloseTo(-1, 6);
  });

  it('returns to where it started after four quarter turns', () => {
    const camera = facing();
    const controls = fakeControls(camera);
    for (let i = 0; i < 4; i++) {
      rollCamera(camera, controls as unknown as OrbitControls, Math.PI / 2);
    }
    expect(camera.up.x).toBeCloseTo(0, 6);
    expect(camera.up.y).toBeCloseTo(1, 6);
    expect(camera.up.z).toBeCloseTo(0, 6);
  });

  it('leaves the camera position and the target alone', () => {
    const camera = facing();
    const controls = fakeControls(camera);
    rollCamera(camera, controls as unknown as OrbitControls, Math.PI / 2);
    expect(camera.position.toArray()).toEqual([0, 0, 10]);
    expect(controls.target.toArray()).toEqual([0, 0, 0]);
  });

  it("refreshes the controls' cached orbit axis to the new up vector", () => {
    const camera = facing();
    const controls = fakeControls(camera);
    rollCamera(camera, controls as unknown as OrbitControls, Math.PI / 2);

    // The cache must map the NEW up onto world +Y, or dragging orbits about
    // an axis the picture no longer uses.
    const mapped = camera.up.clone().applyQuaternion(controls._quat);
    expect(mapped.x).toBeCloseTo(0, 6);
    expect(mapped.y).toBeCloseTo(1, 6);
    expect(mapped.z).toBeCloseTo(0, 6);
    expect(controls._quatInverse.clone().multiply(controls._quat).w).toBeCloseTo(1, 6);
    expect(controls.updates).toBe(1);
  });

  it('does nothing when the camera sits on its own target', () => {
    const camera = facing();
    camera.position.set(0, 0, 0);
    const controls = fakeControls(camera);
    rollCamera(camera, controls as unknown as OrbitControls, Math.PI / 2);
    expect(camera.up.toArray()).toEqual([0, 1, 0]);
  });

  it('rolls about the line of sight from any angle, not about world Z', () => {
    const camera = facing();
    camera.position.set(6, 3, 6);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);
    const controls = fakeControls(camera);
    const sight = camera.position.clone().normalize();

    rollCamera(camera, controls as unknown as OrbitControls, Math.PI / 2);

    // Up must stay perpendicular to the line of sight — that is what makes it
    // a roll rather than an orbit.
    expect(camera.up.dot(sight)).toBeCloseTo(0, 6);
    expect(camera.up.length()).toBeCloseTo(1, 6);
  });
});
