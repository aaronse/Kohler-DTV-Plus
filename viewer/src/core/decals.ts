// Decals: flat artwork pinned to a face of a model.
//
// WHY THIS EXISTS
//
// Manufacturer CAD is geometry and nothing else. The Kohler K-99693 model is a
// single unnamed group with no materials and no UV coordinates, so there is
// nothing to texture in the usual sense — and generating UVs would mean
// splitting the mesh, which changes the thing we are trying to preserve.
//
// A decal sidesteps that. It is a separate quad, floated a fraction of a
// millimetre off a face, carrying its own image. The source mesh is never
// touched, so a decal can never reach an exported STL. That is a guarantee, not
// a convention: `decalQuad` returns geometry that lives only in the scene, and
// the export path reads `LoadedModel.sourceGeometry`, which is snapshotted
// before anything is added to the scene at all.
//
// AUTHORING FRAME
//
// Anchors are expressed in EXPORT space — millimetres, Z-up — for the same
// reason measurements are: it is the frame the part is really in, it is what the
// pointer readout prints, and it does not move if the viewport's conventions
// change. Authoring a decal is therefore a hover-and-type job: point at the
// corners of the face, read the millimetres off the readout, and write them in.
//
// THE ANCHOR IS THREE VECTORS, NOT A RECT PLUS A ROTATION
//
//   origin — where the image's (0,0) corner sits: bottom-left, as the viewer
//            standing in front of the face sees it
//   u      — the edge the image's +X runs along. ITS LENGTH IS THE WIDTH.
//   v      — the edge the image's +Y runs along. ITS LENGTH IS THE HEIGHT.
//
// Position, size, orientation and handedness all fall out of those three, so
// there is no separate rotate/flip/scale field to get backwards. The outward
// normal is `u x v`, which makes handedness self-checking: get u and v the wrong
// way round and the decal faces into the part, which is obvious on screen and
// caught by the verify gate.
//
// PORTABILITY
//
// This module is deliberately free of three.js and of anything specific to this
// app. It takes a record and returns four corners, four UVs and a normal. A
// different renderer — Maker Galaxy's Studio viewer, say — can feed those into
// its own scene graph without adopting anything else from here. The record
// shape follows Maker Galaxy's markup model (`markupId` / `sourceModelId` /
// `geometryAnchor` / `style` / `createdBy` / `createdAt`) so a decal set can move
// across as a project-linked review record rather than needing a translation
// layer. See docs/studio/MG-STUDIO-PHASE-2,EDITORS,3D-MODELS,VIEWER(STL,STEP)-SPEC.md
// sections 8.1 and 16.2 in the mg-web repo.

export type Vec3 = readonly [number, number, number];
export type Vec2 = readonly [number, number];

/**
 * How a decal reconciles an image whose proportions differ from its anchor.
 *
 * `stretch` is the default and is strict: the image aspect must match the
 * anchor aspect within `ASPECT_TOLERANCE`, or the record is rejected. Silently
 * distorting artwork is the same class of error as a silently wrong unit — it
 * renders perfectly and it is wrong.
 *
 * `contain` is the explicit escape hatch: the quad shrinks along its over-long
 * axis and re-centres, so the artwork keeps its proportions and simply does not
 * fill the face. Choosing it is a decision someone made on purpose.
 */
export type DecalFit = 'stretch' | 'contain';

export interface DecalAnchor {
  /** Image (0,0) corner, in export-space millimetres. */
  origin: Vec3;
  /** Image +X edge. Length is the decal width in millimetres. */
  u: Vec3;
  /** Image +Y edge. Length is the decal height in millimetres. */
  v: Vec3;
}

export interface DecalImage {
  /** Relative to the app root, like a model url. */
  url: string;
  /**
   * The image's own coordinate extent: pixels for a raster, viewBox units for
   * an SVG. Only the RATIO is used, and it is declared rather than sniffed so
   * the aspect check can run offline with no image decoder.
   */
  intrinsicWidth: number;
  intrinsicHeight: number;
}

export interface DecalRecord {
  decalId: string;
  title: string;
  /** `familyId/partId/fileId` — the model file this decal is pinned to. */
  sourceModelId: string;
  /** Only one frame is accepted, and it must be stated. */
  space: 'export-mm-zup';
  anchor: DecalAnchor;
  image: DecalImage;
  fit?: DecalFit;
  /**
   * How far off the face to float the quad, in millimetres. Enough to beat
   * depth precision, small enough that the decal still reads as printed on the
   * part rather than hovering over it.
   */
  liftMm?: number;
  opacity?: number;
  /**
   * Unlit artwork ignores scene lighting. Correct for anything that emits — a
   * screen, a backlit legend — and wrong for anything printed, which should
   * pick up the same key light as the plastic around it.
   */
  unlit?: boolean;
  /** Raster resolution to render vector artwork at. Ignored for rasters. */
  renderPxPerMm?: number;
  /** Shown when this decal is selected. Say what the artwork IS and is not. */
  provenanceNote: string;
}

export interface DecalSet {
  decalsVersion: string;
  decals: DecalRecord[];
}

/** Everything a renderer needs, derived. No renderer types involved. */
export interface DecalQuad {
  /** Corners in export space, counter-clockwise from the image origin. */
  corners: [Vec3, Vec3, Vec3, Vec3];
  /** Texture coordinates matching `corners`, origin at bottom-left. */
  uvs: [Vec2, Vec2, Vec2, Vec2];
  /** Unit outward normal, `u x v`. Points away from the face it sits on. */
  normal: Vec3;
  /** Size of the anchor itself, before any `contain` letterboxing. */
  anchorWidthMm: number;
  anchorHeightMm: number;
  /** Size the artwork actually occupies. Equal to the anchor when stretching. */
  widthMm: number;
  heightMm: number;
  anchorAspect: number;
  imageAspect: number;
  /** True when `fit: contain` had to shrink the quad. */
  letterboxed: boolean;
}

/** Aspect mismatch tolerated by `fit: stretch`, as a fraction. */
export const ASPECT_TOLERANCE = 0.01;

/** `|cos|` between u and v above which the anchor is a shear, not a rectangle. */
export const ORTHOGONALITY_TOLERANCE = 1e-3;

/** Lift beyond this stops looking like a decal and starts looking like a bug. */
export const MAX_LIFT_MM = 5;

export const DEFAULT_LIFT_MM = 0.12;
export const DEFAULT_RENDER_PX_PER_MM = 12;

export class DecalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecalError';
  }
}

// ---------------------------------------------------------------- vectors

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

function unit(a: Vec3): Vec3 {
  const l = len(a);
  return l === 0 ? [0, 0, 0] : mul(a, 1 / l);
}

// ---------------------------------------------------------------- validation

/**
 * Validate a parsed decal set, throwing on the first structural problem.
 *
 * Strict on purpose, in the same spirit as `validateCatalog`: a decal with a
 * sheared anchor or a squashed aspect ratio still renders, it just renders a
 * lie, and nothing on screen says so.
 */
export function validateDecalSet(input: unknown): DecalSet {
  const set = input as DecalSet;
  if (!set || typeof set !== 'object') throw new DecalError('decal set is not an object');
  if (typeof set.decalsVersion !== 'string' || !set.decalsVersion) {
    throw new DecalError('decalsVersion is required');
  }
  if (!Array.isArray(set.decals)) throw new DecalError('decals must be an array');

  const seen = new Set<string>();
  for (const decal of set.decals) {
    validateDecal(decal);
    if (seen.has(decal.decalId)) throw new DecalError(`duplicate decalId: ${decal.decalId}`);
    seen.add(decal.decalId);
  }
  return set;
}

export function validateDecal(decal: DecalRecord): DecalRecord {
  const at = decal?.decalId ? `decal ${decal.decalId}` : 'a decal';
  if (!decal || typeof decal !== 'object') throw new DecalError(`${at} is not an object`);
  if (!decal.decalId) throw new DecalError('a decal is missing decalId');
  if (!decal.title) throw new DecalError(`${at}: title is required`);
  if (!decal.sourceModelId) throw new DecalError(`${at}: sourceModelId is required`);

  // The frame must be stated, never inferred. Same reasoning as sourceUnit:
  // coordinates that do not say what space they are in are not coordinates.
  if (decal.space !== 'export-mm-zup') {
    throw new DecalError(
      `${at}: space must be "export-mm-zup" (millimetres, Z-up — what the pointer ` +
        `readout prints), got ${JSON.stringify(decal.space)}`,
    );
  }

  const anchor = decal.anchor;
  if (!anchor) throw new DecalError(`${at}: anchor is required`);
  for (const field of ['origin', 'u', 'v'] as const) {
    const value = anchor[field];
    if (!Array.isArray(value) || value.length !== 3 || value.some((n) => !Number.isFinite(n))) {
      throw new DecalError(`${at}: anchor.${field} must be three finite numbers`);
    }
  }

  const w = len(anchor.u);
  const h = len(anchor.v);
  if (w <= 0 || h <= 0) throw new DecalError(`${at}: anchor.u and anchor.v must have length`);

  // Non-perpendicular edges describe a parallelogram, which would shear the
  // artwork. Nobody means that; it is always a typo in a corner coordinate.
  const skew = Math.abs(dot(anchor.u, anchor.v)) / (w * h);
  if (skew > ORTHOGONALITY_TOLERANCE) {
    throw new DecalError(
      `${at}: anchor.u and anchor.v are not perpendicular (|cos| = ${skew.toFixed(5)}), ` +
        `so the anchor is a sheared parallelogram rather than a rectangle. ` +
        `Re-read the face corners — one coordinate is usually mistyped.`,
    );
  }

  const image = decal.image;
  if (!image?.url) throw new DecalError(`${at}: image.url is required`);
  if (!(image.intrinsicWidth > 0) || !(image.intrinsicHeight > 0)) {
    throw new DecalError(`${at}: image.intrinsicWidth and image.intrinsicHeight must be positive`);
  }

  const fit = decal.fit ?? 'stretch';
  if (fit !== 'stretch' && fit !== 'contain') {
    throw new DecalError(`${at}: fit must be "stretch" or "contain", got ${JSON.stringify(fit)}`);
  }

  // The check that earns this module its keep.
  const anchorAspect = w / h;
  const imageAspect = image.intrinsicWidth / image.intrinsicHeight;
  const drift = Math.abs(anchorAspect / imageAspect - 1);
  if (fit === 'stretch' && drift > ASPECT_TOLERANCE) {
    throw new DecalError(
      `${at}: the anchor is ${w.toFixed(2)} x ${h.toFixed(2)} mm (aspect ` +
        `${anchorAspect.toFixed(4)}) but the artwork is ${image.intrinsicWidth} x ` +
        `${image.intrinsicHeight} (aspect ${imageAspect.toFixed(4)}) — ` +
        `${(drift * 100).toFixed(1)}% apart. Stretching it would distort the artwork ` +
        `without saying so. Re-author the image at the anchor's proportions, or set ` +
        `"fit": "contain" to letterbox it deliberately.`,
    );
  }

  const lift = decal.liftMm ?? DEFAULT_LIFT_MM;
  if (!(lift >= 0) || lift > MAX_LIFT_MM) {
    throw new DecalError(`${at}: liftMm must be between 0 and ${MAX_LIFT_MM}, got ${lift}`);
  }
  const opacity = decal.opacity ?? 1;
  if (!(opacity > 0) || opacity > 1) {
    throw new DecalError(`${at}: opacity must be in (0, 1], got ${opacity}`);
  }
  if (decal.renderPxPerMm !== undefined && !(decal.renderPxPerMm > 0)) {
    throw new DecalError(`${at}: renderPxPerMm must be positive`);
  }
  if (!decal.provenanceNote) {
    throw new DecalError(
      `${at}: provenanceNote is required. A decal is added content sitting on top of ` +
        `manufacturer geometry; what it depicts and where it came from has to be recorded.`,
    );
  }
  return decal;
}

// ---------------------------------------------------------------- geometry

/**
 * Turn a validated record into four corners, four UVs and a normal, all in
 * export space (mm, Z-up).
 *
 * Corner order is counter-clockwise seen from the front — bottom-left,
 * bottom-right, top-right, top-left — so a renderer can triangulate as
 * (0,1,2), (0,2,3) and get front faces without guessing a winding.
 */
export function decalQuad(decal: DecalRecord): DecalQuad {
  const { origin, u, v } = decal.anchor;
  const anchorWidthMm = len(u);
  const anchorHeightMm = len(v);
  const uHat = unit(u);
  const vHat = unit(v);
  const normal = unit(cross(u, v));

  const anchorAspect = anchorWidthMm / anchorHeightMm;
  const imageAspect = decal.image.intrinsicWidth / decal.image.intrinsicHeight;

  let widthMm = anchorWidthMm;
  let heightMm = anchorHeightMm;
  let letterboxed = false;

  if ((decal.fit ?? 'stretch') === 'contain' && Math.abs(anchorAspect / imageAspect - 1) > 1e-9) {
    // Shrink the over-long axis so the artwork keeps its proportions, then
    // re-centre inside the anchor rather than pinning it to a corner.
    if (imageAspect > anchorAspect) heightMm = anchorWidthMm / imageAspect;
    else widthMm = anchorHeightMm * imageAspect;
    letterboxed = true;
  }

  const lift = decal.liftMm ?? DEFAULT_LIFT_MM;
  const bottomLeft = add(
    add(
      add(origin, mul(uHat, (anchorWidthMm - widthMm) / 2)),
      mul(vHat, (anchorHeightMm - heightMm) / 2),
    ),
    mul(normal, lift),
  );

  const acrossU = mul(uHat, widthMm);
  const acrossV = mul(vHat, heightMm);

  return {
    corners: [
      bottomLeft,
      add(bottomLeft, acrossU),
      add(add(bottomLeft, acrossU), acrossV),
      add(bottomLeft, acrossV),
    ],
    uvs: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    normal,
    anchorWidthMm,
    anchorHeightMm,
    widthMm,
    heightMm,
    anchorAspect,
    imageAspect,
    letterboxed,
  };
}

/** Pixel dimensions to rasterise vector artwork at, so it is crisp at 1:1. */
export function rasterSize(decal: DecalRecord, quad: DecalQuad): { width: number; height: number } {
  const pxPerMm = decal.renderPxPerMm ?? DEFAULT_RENDER_PX_PER_MM;
  return {
    width: Math.max(1, Math.round(quad.widthMm * pxPerMm)),
    height: Math.max(1, Math.round(quad.heightMm * pxPerMm)),
  };
}

/** One-line human summary, used by the inspector and the verify gate. */
export function summarizeDecal(decal: DecalRecord, quad: DecalQuad): string {
  const size = `${quad.widthMm.toFixed(2)} x ${quad.heightMm.toFixed(2)} mm`;
  const face = `normal (${quad.normal.map((n) => n.toFixed(3)).join(', ')})`;
  const lift = `${(decal.liftMm ?? DEFAULT_LIFT_MM).toFixed(2)} mm proud`;
  const box = quad.letterboxed
    ? `, letterboxed inside ${quad.anchorWidthMm.toFixed(2)} x ${quad.anchorHeightMm.toFixed(2)} mm`
    : '';
  return `${size}, ${face}, ${lift}${box}`;
}

/** Every decal pinned to one model file, in declaration order. */
export function decalsFor(set: DecalSet, sourceModelId: string): DecalRecord[] {
  return set.decals.filter((decal) => decal.sourceModelId === sourceModelId);
}
