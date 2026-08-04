import * as THREE from 'three';
import {
  DEFAULT_LIFT_MM,
  decalQuad,
  rasterSize,
  type DecalQuad,
  type DecalRecord,
} from '../core/decals';
import { exportToDisplayMatrixElements } from '../core/units';

// Draws decals. Owns GPU resources and nothing else — the anchor maths, the
// validation and the fit logic all live in `core/decals.ts`, which has no
// renderer dependency and can be lifted into another viewer whole.
//
// THE DECAL LAYER IS NOT PART OF THE MODEL.
//
// Quads are parented to their own root, added straight to the scene, never to
// the model group. That is what makes "a decal can never end up in a download"
// structural rather than a promise: the export path reads
// `LoadedModel.sourceGeometry`, which is snapshotted at load, and nothing here
// can reach it. `scripts/verify-exports.ts` asserts the same thing offline.
//
// The layer's root carries the export -> display transform, so every quad is
// built directly in export millimetres and never has to know that the viewport
// happens to be Y-up.

/** Assumed when a record does not say. High enough to look printed, not pasted. */
const DEFAULT_ANISOTROPY = 8;

export interface DecalHandle {
  record: DecalRecord;
  quad: DecalQuad;
  mesh: THREE.Mesh;
}

export interface DecalLayerHandles {
  root: THREE.Object3D;
  /** Replace everything on the layer. Rejected records are reported, not thrown. */
  setDecals(records: DecalRecord[], maxAnisotropy?: number): Promise<DecalHandle[]>;
  /** Show exactly one decal by id, or none when `null`. */
  select(decalId: string | null): void;
  clear(): void;
  dispose(): void;
}

export function createDecalLayer(): DecalLayerHandles {
  const root = new THREE.Group();
  root.name = 'decals';
  const m = new THREE.Matrix4();
  m.set(...(exportToDisplayMatrixElements() as Parameters<THREE.Matrix4['set']>));
  root.applyMatrix4(m);
  // Decals sit a fraction of a millimetre off the surface. Drawing them after
  // the model, without writing depth, keeps them out of the depth-fighting
  // argument entirely at any camera distance.
  root.renderOrder = 1;

  let handles: DecalHandle[] = [];
  let generation = 0;

  function clear(): void {
    for (const handle of handles) {
      root.remove(handle.mesh);
      handle.mesh.geometry.dispose();
      const material = handle.mesh.material as THREE.MeshBasicMaterial;
      material.map?.dispose();
      material.dispose();
    }
    handles = [];
  }

  async function setDecals(
    records: DecalRecord[],
    maxAnisotropy = DEFAULT_ANISOTROPY,
  ): Promise<DecalHandle[]> {
    clear();
    const mine = ++generation;
    const built: DecalHandle[] = [];

    for (const record of records) {
      const quad = decalQuad(record);
      let texture: THREE.Texture;
      try {
        texture = await loadDecalTexture(record, quad);
      } catch (error) {
        // One unloadable image must not take the rest of the layer down with
        // it. The part is still the point; the artwork is decoration.
        console.warn(`decal ${record.decalId}: ${String(error)}`);
        continue;
      }
      // A newer call landed while this image was decoding.
      if (mine !== generation) {
        texture.dispose();
        return [];
      }

      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;

      const mesh = new THREE.Mesh(quadGeometry(quad), quadMaterial(record, texture));
      mesh.name = `decal:${record.decalId}`;
      mesh.visible = false;
      mesh.renderOrder = 1;
      root.add(mesh);
      built.push({ record, quad, mesh });
    }

    handles = built;
    return built;
  }

  return {
    root,
    setDecals,
    select: (decalId) => {
      for (const handle of handles) handle.mesh.visible = handle.record.decalId === decalId;
    },
    clear,
    dispose: () => {
      clear();
      root.removeFromParent();
    },
  };
}

// ---------------------------------------------------------------- geometry

/** Two triangles from the four corners `core/decals.ts` produced. */
function quadGeometry(quad: DecalQuad): THREE.BufferGeometry {
  const positions = new Float32Array(12);
  const uvs = new Float32Array(8);
  const normals = new Float32Array(12);

  quad.corners.forEach((corner, i) => {
    positions.set(corner, i * 3);
    normals.set(quad.normal, i * 3);
    uvs.set(quad.uvs[i], i * 2);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  // Corners are counter-clockwise from the front, so this winding faces out.
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  return geometry;
}

function quadMaterial(record: DecalRecord, map: THREE.Texture): THREE.Material {
  const opacity = record.opacity ?? 1;
  const shared = {
    map,
    transparent: opacity < 1,
    opacity,
    side: THREE.FrontSide,
    // Belt and braces alongside renderOrder: at 0.12 mm of lift a distant
    // camera can still land both surfaces in the same depth bucket.
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  };

  // A screen emits; it does not take the key light. Shading one would make it
  // read as a printed sticker, which is exactly the wrong impression.
  return record.unlit
    ? new THREE.MeshBasicMaterial({ ...shared, toneMapped: false })
    : new THREE.MeshStandardMaterial({ ...shared, metalness: 0, roughness: 0.85 });
}

// ---------------------------------------------------------------- textures

/**
 * Load artwork as a texture.
 *
 * Vector artwork is rasterised at a size derived from the decal's REAL
 * millimetres, not from the SVG's own numbers, so a 131 mm faceplate gets the
 * same texel density whatever coordinate system the file happens to use.
 *
 * Rasters load directly. Note that an SVG drawn into a canvas cannot fetch
 * external fonts or images — the browser treats it as a sandboxed document —
 * so decal SVGs have to be self-contained.
 */
async function loadDecalTexture(record: DecalRecord, quad: DecalQuad): Promise<THREE.Texture> {
  if (!record.image.url.toLowerCase().endsWith('.svg')) {
    return new THREE.TextureLoader().loadAsync(record.image.url);
  }

  const { width, height } = rasterSize(record, quad);
  const image = await loadImage(record.image.url);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('no 2D canvas context available to rasterise the SVG');
  context.drawImage(image, 0, 0, width, height);
  return new THREE.CanvasTexture(canvas);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`could not load ${url}`));
    image.src = url;
  });
}

/** Millimetres of lift a record will actually use. Exposed for the inspector. */
export function liftOf(record: DecalRecord): number {
  return record.liftMm ?? DEFAULT_LIFT_MM;
}
