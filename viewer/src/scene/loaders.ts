import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import type { ModelFormat } from '../catalog/types';
import type { RawGeometry } from '../core/stl';

// Format dispatch and source-space geometry extraction.
//
// The critical rule in this file: `extractSourceGeometry` runs against the
// UNTOUCHED loaded graph, before anything display-related is applied. Every
// measurement and every export downstream is derived from that snapshot, so
// what you download can never drift from what the catalog declared just because
// the viewport did something to the model.

const EXTENSION_FORMATS: Record<string, ModelFormat> = {
  obj: 'obj',
  stl: 'stl',
  '3mf': '3mf',
  gltf: 'gltf',
  glb: 'glb',
  '3ds': '3ds',
  ply: 'ply',
};

/** Formats that need the file as text rather than bytes. */
const TEXT_FORMATS: ReadonlySet<ModelFormat> = new Set<ModelFormat>(['obj']);

export function detectFormat(filename: string): ModelFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_FORMATS[ext] ?? null;
}

export function isTextFormat(format: ModelFormat): boolean {
  return TEXT_FORMATS.has(format);
}

/**
 * Parse an already-fetched model into an Object3D.
 *
 * Everything is normalized to an Object3D even when the underlying loader hands
 * back a bare BufferGeometry (STL, PLY), so the rest of the app has one shape to
 * deal with. Materials that arrive with the file (3MF, glTF) are discarded and
 * replaced by the viewer's own — the point of this tool is dimensional truth,
 * and a supplied material makes two models look different for reasons that have
 * nothing to do with their geometry.
 */
export async function parseModel(
  data: ArrayBuffer | string,
  format: ModelFormat,
): Promise<THREE.Object3D> {
  switch (format) {
    case 'obj': {
      const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
      return new OBJLoader().parse(text);
    }
    case 'stl': {
      const geometry = new STLLoader().parse(toArrayBuffer(data));
      return new THREE.Mesh(geometry, placeholderMaterial());
    }
    case 'ply': {
      const geometry = new PLYLoader().parse(toArrayBuffer(data));
      return new THREE.Mesh(geometry, placeholderMaterial());
    }
    case '3mf':
      return new ThreeMFLoader().parse(toArrayBuffer(data));
    case '3ds':
      return new TDSLoader().parse(toArrayBuffer(data), '');
    case 'gltf':
    case 'glb':
      return new Promise((resolve, reject) => {
        new GLTFLoader().parse(
          toArrayBuffer(data),
          '',
          (gltf) => resolve(gltf.scene),
          (error) => reject(error),
        );
      });
  }
}

/** Fetch and parse a model by URL. */
export async function loadModel(url: string, format: ModelFormat): Promise<THREE.Object3D> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }
  const data = isTextFormat(format) ? await response.text() : await response.arrayBuffer();
  if (typeof data !== 'string' && data.byteLength === 0) {
    throw new Error(`fetch returned an empty body for ${url}`);
  }
  return parseModel(data, format);
}

function toArrayBuffer(data: ArrayBuffer | string): ArrayBuffer {
  if (typeof data === 'string') return new TextEncoder().encode(data).buffer as ArrayBuffer;
  return data;
}

function placeholderMaterial(): THREE.Material {
  // Replaced immediately by the viewer's material set; exists only so a bare
  // geometry can legally become a Mesh.
  return new THREE.MeshStandardMaterial();
}

/**
 * Flatten every mesh under `root` into one triangle soup in the root's own
 * coordinate space.
 *
 * Each mesh's transform is taken RELATIVE to `root`, not from world space, so a
 * transform sitting on the root itself cannot leak into the result. This is the
 * same discipline new-zenxy's `geometriesFromGltf` arrived at after node
 * transforms were being silently dropped there.
 *
 * The output is intentionally non-indexed: STL has no shared vertices anyway,
 * and merging index buffers across meshes with different vertex counts is a
 * source of off-by-one bugs for no benefit at these triangle counts.
 */
export function extractSourceGeometry(root: THREE.Object3D): RawGeometry {
  root.updateMatrixWorld(true);
  const toRootSpace = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const local = new THREE.Matrix4();
  const chunks: Float32Array[] = [];
  let total = 0;

  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;

    local.multiplyMatrices(toRootSpace, mesh.matrixWorld);

    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    geometry.applyMatrix4(local);

    const position = geometry.getAttribute('position');
    if (!position) {
      geometry.dispose();
      return;
    }

    // Copy out rather than retaining the attribute: the clone is disposed here,
    // and an interleaved attribute's array would carry unrelated data with it.
    const out = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      out[i * 3] = position.getX(i);
      out[i * 3 + 1] = position.getY(i);
      out[i * 3 + 2] = position.getZ(i);
    }
    chunks.push(out);
    total += out.length;
    geometry.dispose();
  });

  if (chunks.length === 1) return { positions: chunks[0] };

  const positions = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    positions.set(chunk, offset);
    offset += chunk.length;
  }
  return { positions };
}

/** Free every geometry and material under a node. */
export function disposeObject(root: THREE.Object3D): void {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((m) => m?.dispose());
    else material?.dispose();
  });
}
