import { describe, expect, it } from 'vitest';
import {
  exportFilename,
  exportHeader,
  readBinaryStlCount,
  STL_COUNT_OFFSET,
  STL_HEADER_BYTES,
  STL_TRIANGLE_BYTES,
  writeBinaryStl,
} from './stl';

/** One unit triangle in the XY plane, wound counter-clockwise (normal = +Z). */
const UNIT_TRIANGLE = {
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
};

/** Read a triangle's 3 vertices back out of an exported buffer. */
function readTriangle(buffer: ArrayBuffer, index: number) {
  const view = new DataView(buffer);
  const base = STL_HEADER_BYTES + 4 + index * STL_TRIANGLE_BYTES;
  const f = (o: number) => view.getFloat32(base + o, true);
  return {
    normal: [f(0), f(4), f(8)],
    a: [f(12), f(16), f(20)],
    b: [f(24), f(28), f(32)],
    c: [f(36), f(40), f(44)],
    attributes: view.getUint16(base + 48, true),
  };
}

describe('writeBinaryStl — file structure', () => {
  it('emits a buffer of exactly the specified length', () => {
    const { buffer, triangleCount } = writeBinaryStl(UNIT_TRIANGLE, {
      sourceUnit: 'mm',
      sourceUpAxis: 'z',
    });
    expect(triangleCount).toBe(1);
    expect(buffer.byteLength).toBe(STL_HEADER_BYTES + 4 + STL_TRIANGLE_BYTES);
    expect(readBinaryStlCount(buffer)).toBe(1);
  });

  it('writes the triangle count little-endian at offset 80', () => {
    const positions = new Float32Array(9 * 3);
    const { buffer } = writeBinaryStl({ positions }, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    expect(new DataView(buffer).getUint32(STL_COUNT_OFFSET, true)).toBe(3);
  });

  it('zeroes the attribute byte count', () => {
    const { buffer } = writeBinaryStl(UNIT_TRIANGLE, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    expect(readTriangle(buffer, 0).attributes).toBe(0);
  });

  it('refuses geometry that is not a whole number of triangles', () => {
    expect(() =>
      writeBinaryStl({ positions: new Float32Array(8) }, { sourceUnit: 'mm', sourceUpAxis: 'z' }),
    ).toThrow(/not a whole number of triangles/);
  });

  it('never lets the header start with "solid"', () => {
    // A binary STL whose header begins "solid" is mis-sniffed as ASCII by a
    // number of readers, which then fail on the binary body.
    const { buffer } = writeBinaryStl(UNIT_TRIANGLE, {
      sourceUnit: 'mm',
      sourceUpAxis: 'z',
      header: 'solid part from CAD',
    });
    const head = new TextDecoder().decode(new Uint8Array(buffer, 0, 5));
    expect(head).not.toBe('solid');
    expect(head).toBe('Solid');
  });
});

describe('writeBinaryStl — units', () => {
  it('defaults to millimetres', () => {
    const { targetUnit } = writeBinaryStl(UNIT_TRIANGLE, { sourceUnit: 'in', sourceUpAxis: 'z' });
    expect(targetUnit).toBe('mm');
  });

  it('scales an inch-authored part to millimetres', () => {
    // This is the Kohler case: the OBJ is in inches, the slicer wants mm.
    const { buffer, scale } = writeBinaryStl(UNIT_TRIANGLE, {
      sourceUnit: 'in',
      sourceUpAxis: 'z',
    });
    expect(scale).toBe(25.4);
    const t = readTriangle(buffer, 0);
    expect(t.b[0]).toBeCloseTo(25.4, 4);
    expect(t.c[1]).toBeCloseTo(25.4, 4);
  });

  it('honours an explicit inch target for CAM posts that want imperial', () => {
    const { buffer, scale } = writeBinaryStl(UNIT_TRIANGLE, {
      sourceUnit: 'in',
      sourceUpAxis: 'z',
      targetUnit: 'in',
    });
    expect(scale).toBe(1);
    expect(readTriangle(buffer, 0).b[0]).toBeCloseTo(1, 6);
  });

  it('reproduces the real K-99693 faceplate width in millimetres', () => {
    // Source bbox X spans -2.630..2.630 in => 5.259 in => 133.58 mm. Verified
    // against the K-99693 spec sheet (5-1/4 in wide).
    const positions = new Float32Array([-2.6297, 0, 0, 2.6297, 0, 0, 0, 1, 0]);
    const { buffer } = writeBinaryStl({ positions }, { sourceUnit: 'in', sourceUpAxis: 'z' });
    const t = readTriangle(buffer, 0);
    const width = t.b[0] - t.a[0];
    expect(width).toBeCloseTo(133.59, 1);
  });
});

describe('writeBinaryStl — orientation', () => {
  it('leaves an already-Z-up part unrotated', () => {
    const { buffer } = writeBinaryStl(UNIT_TRIANGLE, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    const t = readTriangle(buffer, 0);
    expect(t.a).toEqual([0, 0, 0]);
    expect(t.b[0]).toBeCloseTo(1, 6);
    expect(t.c[1]).toBeCloseTo(1, 6);
  });

  it('stands a Y-up part up onto Z', () => {
    // Source triangle lies in the XZ plane with its up along +Y.
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const { buffer } = writeBinaryStl({ positions }, { sourceUnit: 'mm', sourceUpAxis: 'y' });
    const t = readTriangle(buffer, 0);
    // The source +Y vertex must come out on +Z.
    expect(t.c[2]).toBeCloseTo(1, 6);
    expect(t.c[1]).toBeCloseTo(0, 6);
  });
});

describe('writeBinaryStl — facet normals', () => {
  it('computes the geometric normal from the winding', () => {
    const { buffer } = writeBinaryStl(UNIT_TRIANGLE, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    const t = readTriangle(buffer, 0);
    expect(t.normal[0]).toBeCloseTo(0, 6);
    expect(t.normal[1]).toBeCloseTo(0, 6);
    expect(t.normal[2]).toBeCloseTo(1, 6);
  });

  it('flips the normal when the winding reverses', () => {
    const positions = new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0]);
    const { buffer } = writeBinaryStl({ positions }, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    expect(readTriangle(buffer, 0).normal[2]).toBeCloseTo(-1, 6);
  });

  it('emits unit-length normals regardless of triangle size', () => {
    const positions = new Float32Array([0, 0, 0, 500, 0, 0, 0, 500, 0]);
    const { buffer } = writeBinaryStl({ positions }, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    const n = readTriangle(buffer, 0).normal;
    expect(Math.hypot(n[0], n[1], n[2])).toBeCloseTo(1, 6);
  });

  it('writes a zero normal for a degenerate triangle rather than NaN', () => {
    const positions = new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1]);
    const { buffer } = writeBinaryStl({ positions }, { sourceUnit: 'mm', sourceUpAxis: 'z' });
    const n = readTriangle(buffer, 0).normal;
    expect(n.every((c) => Number.isFinite(c))).toBe(true);
    expect(n).toEqual([0, 0, 0]);
  });
});

describe('writeBinaryStl — indexed geometry', () => {
  it('expands indices into a triangle soup', () => {
    // A quad as two triangles sharing an edge: 4 vertices, 6 indices.
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
    const { buffer, triangleCount } = writeBinaryStl(
      { positions, indices },
      { sourceUnit: 'mm', sourceUpAxis: 'z' },
    );
    expect(triangleCount).toBe(2);
    expect(readBinaryStlCount(buffer)).toBe(2);
    // Both halves of a flat quad face the same way.
    expect(readTriangle(buffer, 0).normal[2]).toBeCloseTo(1, 6);
    expect(readTriangle(buffer, 1).normal[2]).toBeCloseTo(1, 6);
  });

  it('treats an empty index array as non-indexed', () => {
    const { triangleCount } = writeBinaryStl(
      { positions: UNIT_TRIANGLE.positions, indices: new Uint32Array(0) },
      { sourceUnit: 'mm', sourceUpAxis: 'z' },
    );
    expect(triangleCount).toBe(1);
  });
});

describe('readBinaryStlCount', () => {
  it('rejects a truncated file', () => {
    expect(() => readBinaryStlCount(new ArrayBuffer(20))).toThrow(/too short/);
  });

  it('rejects a length that disagrees with the header count', () => {
    const buffer = new ArrayBuffer(STL_HEADER_BYTES + 4 + STL_TRIANGLE_BYTES);
    new DataView(buffer).setUint32(STL_COUNT_OFFSET, 99, true);
    expect(() => readBinaryStlCount(buffer)).toThrow(/length mismatch/);
  });
});

describe('export naming', () => {
  it('states the units in the filename', () => {
    expect(exportFilename('K-99693 Digital Interface', 'mm')).toBe(
      'k-99693-digital-interface_mm_z-up.stl',
    );
  });

  it('survives a label with no usable characters', () => {
    expect(exportFilename('///', 'mm')).toBe('part_mm_z-up.stl');
  });

  it('keeps the header within the 80-byte budget', () => {
    const header = exportHeader('A'.repeat(200), 'mm');
    expect(header.length).toBeLessThanOrEqual(79);
  });
});
