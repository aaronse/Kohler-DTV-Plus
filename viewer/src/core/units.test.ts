import { describe, expect, it } from 'vitest';
import {
  applyBasis,
  applyMatrixElements,
  basisToZUp,
  convertLength,
  determinant3,
  displayMatrixElements,
  displayRotationX,
  formatDimensions,
  isLengthUnit,
  isUpAxis,
  MM_PER_UNIT,
  scaleFactor,
  UP_AXES,
} from './units';

describe('unit conversion', () => {
  it('treats the inch as exactly 25.4 mm', () => {
    // Exact, not approximate — a part that mates with real hardware cannot
    // absorb a rounding error introduced at the units layer.
    expect(MM_PER_UNIT.in).toBe(25.4);
    expect(convertLength(1, 'in', 'mm')).toBe(25.4);
  });

  it('round-trips a length through an intermediate unit', () => {
    const original = 5.259; // the K-99693 faceplate width, in inches
    const mm = convertLength(original, 'in', 'mm');
    expect(mm).toBeCloseTo(133.5786, 6);
    expect(convertLength(mm, 'mm', 'in')).toBeCloseTo(original, 10);
  });

  it('scaleFactor is the inverse of its reverse', () => {
    expect(scaleFactor('in', 'mm') * scaleFactor('mm', 'in')).toBeCloseTo(1, 12);
    expect(scaleFactor('m', 'mm')).toBe(1000);
    expect(scaleFactor('ft', 'in')).toBeCloseTo(12, 12);
  });

  it('identifies valid units and axes', () => {
    expect(isLengthUnit('in')).toBe(true);
    expect(isLengthUnit('furlong')).toBe(false);
    expect(isUpAxis('z')).toBe(true);
    expect(isUpAxis('w')).toBe(false);
  });
});

describe('up-axis remapping', () => {
  it('never mirrors the part', () => {
    // Determinant +1 == proper rotation. A -1 here would silently hand the
    // operator a mirrored part that fits nothing.
    for (const axis of UP_AXES) {
      expect(determinant3(basisToZUp(axis))).toBeCloseTo(1, 12);
    }
  });

  it('lands each source up-axis on +Z', () => {
    const up = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] } as const;
    for (const axis of UP_AXES) {
      const [x, y, z] = up[axis];
      const out = applyBasis(basisToZUp(axis), x, y, z);
      expect(out[0]).toBeCloseTo(0, 12);
      expect(out[1]).toBeCloseTo(0, 12);
      expect(out[2]).toBeCloseTo(1, 12);
    }
  });

  it('leaves an already-Z-up model untouched', () => {
    // The Kohler assets are Z-up, so this is the path they take: no rotation
    // on export at all, only a scale.
    const p = applyBasis(basisToZUp('z'), 2.63, -0.607, 1.655);
    expect(p).toEqual([2.63, -0.607, 1.655]);
  });

  it('preserves vector length under remap', () => {
    for (const axis of UP_AXES) {
      const p = applyBasis(basisToZUp(axis), 1, 2, 3);
      const len = Math.hypot(p[0], p[1], p[2]);
      expect(len).toBeCloseTo(Math.hypot(1, 2, 3), 12);
    }
  });
});

describe('display rotation', () => {
  it('tips a Z-up CAD model upright for three.js', () => {
    expect(displayRotationX('z')).toBeCloseTo(-Math.PI / 2, 12);
  });

  it('leaves a Y-up model alone', () => {
    expect(displayRotationX('y')).toBe(0);
  });
});

describe('displayMatrixElements', () => {
  it('puts the source up-axis on +Y, where three.js expects it', () => {
    const up = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] } as const;
    for (const axis of UP_AXES) {
      const [x, y, z] = up[axis];
      const out = applyMatrixElements(displayMatrixElements(axis, 'mm'), x, y, z);
      expect(out[0], axis).toBeCloseTo(0, 12);
      expect(out[1], axis).toBeCloseTo(1, 12);
      expect(out[2], axis).toBeCloseTo(0, 12);
    }
  });

  it('scales into millimetres', () => {
    const out = applyMatrixElements(displayMatrixElements('z', 'in'), 0, 0, 1);
    expect(out[1]).toBeCloseTo(25.4, 9);
  });

  it('maps the Kohler case exactly: source (x,y,z) in -> display (25.4x, 25.4z, -25.4y) mm', () => {
    // The K-99693 OBJ is inches, Z-up. Its Z (height) must become display Y.
    const out = applyMatrixElements(displayMatrixElements('z', 'in'), 2, 3, 4);
    expect(out[0]).toBeCloseTo(2 * 25.4, 9);
    expect(out[1]).toBeCloseTo(4 * 25.4, 9);
    expect(out[2]).toBeCloseTo(-3 * 25.4, 9);
  });

  it('is a similarity transform — no shear, no mirror', () => {
    // Uniform scale times a proper rotation: every basis vector keeps the same
    // length and the handedness survives. A shear here would distort the part.
    for (const axis of UP_AXES) {
      const m = displayMatrixElements(axis, 'in');
      const cols = [
        applyMatrixElements(m, 1, 0, 0),
        applyMatrixElements(m, 0, 1, 0),
        applyMatrixElements(m, 0, 0, 1),
      ];
      for (const col of cols) {
        expect(Math.hypot(...col), axis).toBeCloseTo(25.4, 9);
      }
      // Right-handed: col0 x col1 == col2.
      const [a, b, c] = cols;
      const cross = [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
      ];
      for (let i = 0; i < 3; i++) {
        expect(cross[i] / 25.4, axis).toBeCloseTo(c[i], 9);
      }
    }
  });

  it('agrees with the export basis on relative proportions', () => {
    // Display and export disagree only about which axis is up. A part measured
    // one way and shown the other must still have the same three extents.
    const point: [number, number, number] = [5.259, 1.214, 3.31];
    const display = applyMatrixElements(displayMatrixElements('z', 'in'), ...point);
    const exported = applyBasis(basisToZUp('z'), point[0] * 25.4, point[1] * 25.4, point[2] * 25.4);
    expect([...display].map(Math.abs).sort()).toEqual([...exported].map(Math.abs).sort());
  });
});

describe('formatDimensions', () => {
  it('renders a millimetre bounding box', () => {
    expect(formatDimensions([133.58, 30.84, 84.07], 'mm')).toBe('133.6 x 30.8 x 84.1 mm');
  });
});
