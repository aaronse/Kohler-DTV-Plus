import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import catalogJson from '../src/catalog/catalog.json';
import { flattenCatalog, validateCatalog } from '../src/catalog/catalog';
import { extractSourceGeometry } from '../src/scene/loaders';
import { computeMeshStats, estimatedMassGrams, volumeCm3 } from '../src/core/meshStats';
import { exportFilename, readBinaryStlCount, writeBinaryStl } from '../src/core/stl';
import type { ModelFormat } from '../src/catalog/types';

// Offline gate: load every vendored catalog asset, export it, and re-read the
// exported bytes to confirm the geometry survived the trip.
//
// The unit tests prove the maths on synthetic boxes. This proves it on the
// actual manufacturer CAD, which is where the real risks live — a mis-declared
// unit, an asset replaced by a newer revision with different dimensions, a
// loader change that silently drops a node transform. Run it in CI and before
// trusting a downloaded file.
//
// Run: npm run verify

const ROOT = resolve(import.meta.dirname, '..');

/** Formats this gate can load without a browser. Others are reported skipped. */
const OFFLINE_FORMATS: ReadonlySet<ModelFormat> = new Set<ModelFormat>(['obj', 'stl']);

interface Failure {
  where: string;
  message: string;
}

const failures: Failure[] = [];

function check(where: string, condition: boolean, message: string): void {
  if (!condition) failures.push({ where, message });
}

const catalog = validateCatalog(catalogJson);
const entries = flattenCatalog(catalog);
console.log(`catalog ${catalog.catalogVersion}: ${entries.length} part(s)\n`);

for (const entry of entries) {
  const where = `${entry.family.familyId}/${entry.part.partId}`;
  const { file } = entry;

  if (!OFFLINE_FORMATS.has(file.format)) {
    console.log(`- ${where}: SKIPPED (${file.format} needs a browser to parse)\n`);
    continue;
  }

  const path = resolve(ROOT, 'public', file.url);
  let raw: Buffer;
  try {
    raw = readFileSync(path);
  } catch {
    // A missing vendored asset is a warning, not a failure: PROVENANCE.md
    // explicitly allows the manufacturer CAD to be absent, and the app still
    // works via drag-and-drop.
    console.log(`- ${where}: asset not present at ${file.url} — skipping\n`);
    continue;
  }

  const object =
    file.format === 'obj'
      ? new OBJLoader().parse(raw.toString('utf8'))
      : new THREE.Mesh(new STLLoader().parse(bufferOf(raw)));

  const geometry = extractSourceGeometry(object);
  const stats = computeMeshStats(geometry, {
    sourceUnit: file.sourceUnit,
    sourceUpAxis: file.sourceUpAxis,
  });

  const result = writeBinaryStl(geometry, {
    sourceUnit: file.sourceUnit,
    sourceUpAxis: file.sourceUpAxis,
    targetUnit: 'mm',
  });

  console.log(`- ${where} (${file.name})`);
  console.log(`    source        ${file.sourceUnit}, ${file.sourceUpAxis}-up`);
  console.log(`    triangles     ${stats.triangleCount.toLocaleString()}`);
  console.log(`    envelope      ${stats.size.map((n) => n.toFixed(2)).join(' x ')} mm`);
  console.log(`    surface       ${(stats.surfaceArea / 100).toFixed(2)} cm2`);
  console.log(
    stats.closed
      ? `    volume        ${volumeCm3(stats).toFixed(2)} cm3  (${estimatedMassGrams(stats).toFixed(1)} g solid PLA)`
      : `    mesh          OPEN — ${stats.boundaryEdges.toLocaleString()} unshared edges, volume withheld`,
  );
  console.log(`    export        ${exportFilename(entry.part.sku ?? entry.part.title, 'mm')} (${result.buffer.byteLength.toLocaleString()} bytes)`);

  // Structural read-back.
  let written = 0;
  try {
    written = readBinaryStlCount(result.buffer);
  } catch (error) {
    failures.push({ where, message: `exported STL failed its own length check: ${String(error)}` });
  }
  check(where, written === stats.triangleCount, `wrote ${written} triangles, expected ${stats.triangleCount}`);

  // Geometric read-back: re-derive the envelope from the exported bytes rather
  // than trusting the in-memory numbers. This is what catches a transform that
  // was applied for measurement but not for export, or vice versa.
  const reread = envelopeOf(result.buffer);
  for (let axis = 0; axis < 3; axis++) {
    const delta = Math.abs(reread.size[axis] - stats.size[axis]);
    check(
      where,
      delta < 0.01,
      `axis ${'XYZ'[axis]}: exported envelope ${reread.size[axis].toFixed(3)} mm ` +
        `disagrees with measured ${stats.size[axis].toFixed(3)} mm`,
    );
  }
  console.log(`    read-back     ${reread.size.map((n) => n.toFixed(2)).join(' x ')} mm, ${reread.degenerate} degenerate facet(s)`);

  // A part whose largest dimension lands under 1 mm or over 2 m is almost
  // certainly a units error rather than a real part, and that is exactly the
  // failure this whole app exists to prevent.
  const largest = Math.max(...stats.size);
  check(where, largest > 1 && largest < 2000, `largest dimension ${largest.toFixed(2)} mm looks like a units error`);
  console.log('');
}

if (failures.length) {
  console.error(`FAILED — ${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  ${failure.where}: ${failure.message}`);
  process.exit(1);
}
console.log('OK — every catalog asset exported and read back consistently.');

// ---------------------------------------------------------------- helpers

function bufferOf(raw: Buffer): ArrayBuffer {
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;
}

function envelopeOf(buffer: ArrayBuffer): { size: number[]; degenerate: number } {
  const view = new DataView(buffer);
  const count = view.getUint32(80, true);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let degenerate = 0;

  for (let t = 0; t < count; t++) {
    const base = 84 + t * 50;
    const nx = view.getFloat32(base, true);
    const ny = view.getFloat32(base + 4, true);
    const nz = view.getFloat32(base + 8, true);
    if (nx === 0 && ny === 0 && nz === 0) degenerate++;
    for (let corner = 0; corner < 3; corner++) {
      for (let axis = 0; axis < 3; axis++) {
        const value = view.getFloat32(base + 12 + corner * 12 + axis * 4, true);
        if (value < min[axis]) min[axis] = value;
        if (value > max[axis]) max[axis] = value;
      }
    }
  }
  return { size: max.map((m, i) => m - min[i]), degenerate };
}
