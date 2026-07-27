import { applyBasis, basisToZUp, scaleFactor, type LengthUnit, type UpAxis } from './units';

// Binary STL writer.
//
// Deliberately NOT three's STLExporter. Three reasons, in order of weight:
//
//  1. It takes a scene graph, which means the thing you export is the thing you
//     are *looking at* — display space, Y-up, whatever scale the viewport
//     happens to use. That is exactly the bug this app exists to avoid. Here
//     the export is derived from the declared source units instead, so what
//     lands in the slicer is independent of the camera.
//  2. It is testable in plain node. No WebGL context, no DOM, no headless
//     browser — `stl.test.ts` reads bytes back and asserts on them.
//  3. Binary STL is ~50 lines. Wrapping a dependency to save 50 lines of
//     format code, and losing control of the units in exchange, is a bad trade.
//
// Format (little-endian throughout):
//   [0..80)    header, 80 bytes, free-form ASCII
//   [80..84)   uint32 triangle count
//   then per triangle, 50 bytes:
//     3 x float32 facet normal
//     9 x float32 vertices (v1, v2, v3)
//     1 x uint16 attribute byte count (0)

export const STL_HEADER_BYTES = 80;
export const STL_COUNT_OFFSET = 80;
export const STL_TRIANGLE_BYTES = 50;

/** Geometry in its own source space, as extracted from a loaded model. */
export interface RawGeometry {
  /** Flat xyz triples. */
  positions: Float32Array | number[];
  /** Optional triangle indices. Absent means `positions` is already expanded. */
  indices?: Uint32Array | Uint16Array | number[] | null;
}

export interface StlExportOptions {
  /** Units the source geometry is expressed in. */
  sourceUnit: LengthUnit;
  /** Up-axis the source geometry uses. */
  sourceUpAxis: UpAxis;
  /**
   * Units to write. Defaults to `mm` — slicers and most CAM posts treat a
   * unitless STL as millimetres, so anything else needs a deliberate choice.
   */
  targetUnit?: LengthUnit;
  /** Up to 79 ASCII chars recorded in the STL header. */
  header?: string;
}

export interface StlExportResult {
  buffer: ArrayBuffer;
  triangleCount: number;
  /** The scale actually applied, for display and for the provenance line. */
  scale: number;
  targetUnit: LengthUnit;
}

/**
 * Expand an optionally-indexed position array into a flat triangle soup.
 * STL has no concept of shared vertices, so this happens either way.
 */
function expand(geometry: RawGeometry): Float32Array {
  const positions =
    geometry.positions instanceof Float32Array
      ? geometry.positions
      : Float32Array.from(geometry.positions);

  const indices = geometry.indices;
  if (!indices || indices.length === 0) return positions;

  const out = new Float32Array(indices.length * 3);
  for (let i = 0; i < indices.length; i++) {
    const src = indices[i] * 3;
    const dst = i * 3;
    out[dst] = positions[src];
    out[dst + 1] = positions[src + 1];
    out[dst + 2] = positions[src + 2];
  }
  return out;
}

/**
 * Write a binary STL.
 *
 * The transform order is scale-then-rotate; both are linear so the order does
 * not change the result, but the scale is uniform and the rotation is a proper
 * rotation, which together guarantee the exported part is neither distorted nor
 * mirrored relative to the source CAD.
 *
 * Facet normals are recomputed from the transformed winding rather than carried
 * over from the source. Source normals are frequently smoothed (the Kohler OBJ
 * ships 9146 vertex normals for 2301 faces, i.e. smoothing groups), and a
 * smoothed normal in an STL facet slot is wrong by definition — the facet
 * normal must be the true geometric normal of that triangle or slicers will
 * disagree with your CAM about which way is out.
 */
export function writeBinaryStl(geometry: RawGeometry, options: StlExportOptions): StlExportResult {
  const targetUnit = options.targetUnit ?? 'mm';
  const scale = scaleFactor(options.sourceUnit, targetUnit);
  const basis = basisToZUp(options.sourceUpAxis);

  const positions = expand(geometry);
  if (positions.length % 9 !== 0) {
    throw new Error(
      `geometry is not a whole number of triangles: ${positions.length} floats ` +
        `(${positions.length / 3} vertices) is not divisible by 9`,
    );
  }

  const triangleCount = positions.length / 9;
  const buffer = new ArrayBuffer(STL_HEADER_BYTES + 4 + triangleCount * STL_TRIANGLE_BYTES);
  const view = new DataView(buffer);

  writeHeader(view, options.header ?? '');
  view.setUint32(STL_COUNT_OFFSET, triangleCount, true);

  let offset = STL_HEADER_BYTES + 4;
  const v = new Float64Array(9); // transformed triangle, kept in f64 until written

  for (let t = 0; t < triangleCount; t++) {
    const base = t * 9;
    for (let corner = 0; corner < 3; corner++) {
      const p = base + corner * 3;
      const [x, y, z] = applyBasis(
        basis,
        positions[p] * scale,
        positions[p + 1] * scale,
        positions[p + 2] * scale,
      );
      v[corner * 3] = x;
      v[corner * 3 + 1] = y;
      v[corner * 3 + 2] = z;
    }

    const [nx, ny, nz] = facetNormal(v);
    view.setFloat32(offset, nx, true);
    view.setFloat32(offset + 4, ny, true);
    view.setFloat32(offset + 8, nz, true);
    offset += 12;

    for (let i = 0; i < 9; i++) {
      view.setFloat32(offset, v[i], true);
      offset += 4;
    }

    view.setUint16(offset, 0, true); // attribute byte count
    offset += 2;
  }

  return { buffer, triangleCount, scale, targetUnit };
}

/**
 * ASCII header, truncated to fit and NUL-padded.
 *
 * Never begin the header with the literal "solid": some readers sniff that
 * prefix to decide a file is ASCII STL and will then fail to parse the binary
 * body. `exportHeader` guards this, but so does this function, because the
 * caller can pass anything.
 */
function writeHeader(view: DataView, text: string): void {
  const safe = text.replace(/^solid/i, 'Solid').slice(0, STL_HEADER_BYTES - 1);
  for (let i = 0; i < safe.length; i++) {
    // Non-ASCII collapses to '?' rather than emitting a stray high byte.
    const code = safe.charCodeAt(i);
    view.setUint8(i, code < 128 ? code : 0x3f);
  }
}

/** Newell/cross-product normal for one transformed triangle, normalized. */
function facetNormal(v: Float64Array): [number, number, number] {
  const ax = v[3] - v[0];
  const ay = v[4] - v[1];
  const az = v[5] - v[2];
  const bx = v[6] - v[0];
  const by = v[7] - v[1];
  const bz = v[8] - v[2];

  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;

  const len = Math.hypot(nx, ny, nz);
  // A degenerate (zero-area) triangle gets a zero normal, which is what the
  // spec says to do and what slicers already cope with. Dividing by zero here
  // would write NaNs and corrupt the file instead.
  if (len === 0) return [0, 0, 0];
  return [nx / len, ny / len, nz / len];
}

/**
 * A provenance header for an exported part. Kept short — 79 chars is the whole
 * budget — but enough that a file found on a USB stick six months from now can
 * still be traced to what produced it and in what units.
 */
export function exportHeader(partLabel: string, unit: LengthUnit): string {
  return `${partLabel} | ${unit} Z-up | parts-viewer`.slice(0, STL_HEADER_BYTES - 1);
}

/** Filename that states the units, because STL itself cannot. */
export function exportFilename(partLabel: string, unit: LengthUnit): string {
  const slug = partLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'part'}_${unit}_z-up.stl`;
}

/**
 * Parse just enough of a binary STL to verify one. Used by the tests and by the
 * post-export sanity check in the UI, so a corrupt export is caught here rather
 * than on the machine.
 */
export function readBinaryStlCount(buffer: ArrayBuffer): number {
  if (buffer.byteLength < STL_HEADER_BYTES + 4) {
    throw new Error('too short to be a binary STL');
  }
  const view = new DataView(buffer);
  const count = view.getUint32(STL_COUNT_OFFSET, true);
  const expected = STL_HEADER_BYTES + 4 + count * STL_TRIANGLE_BYTES;
  if (buffer.byteLength !== expected) {
    throw new Error(
      `binary STL length mismatch: header claims ${count} triangles ` +
        `(${expected} bytes) but the buffer is ${buffer.byteLength} bytes`,
    );
  }
  return count;
}
