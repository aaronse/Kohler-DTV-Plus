import type { LengthUnit, UpAxis } from '../core/units';

// Catalog schema.
//
// Shaped to line up with Maker Galaxy's existing `models.json`
// (mg-web/src/maker-galaxy/data/models.json): `files[]` entries carry the same
// `id` / `name` / `format` / `url` / `isDefaultViewer` fields, so a part here
// can be promoted into that catalog without a translation layer.
//
// Two fields are additions that Maker Galaxy does not yet have and that this
// app cannot work without:
//
//   sourceUnit  — manufacturer CAD arrives in inches as often as millimetres,
//                 and nothing in OBJ/STL/3MF records which.
//   sourceUpAxis — CAD is usually Z-up, three.js is Y-up, STL is Z-up.
//
// Without both declared per-file, an export is a guess. They are required, not
// optional, precisely so that adding a part forces someone to determine them.

export type ModelFormat = 'obj' | 'stl' | '3mf' | 'gltf' | 'glb' | '3ds' | 'ply';

export interface ModelFile {
  id: string;
  name: string;
  format: ModelFormat;
  /** Relative to the app root, or absolute for a remote asset. */
  url: string;
  /** Units the geometry inside this file is expressed in. */
  sourceUnit: LengthUnit;
  /** Up-axis the geometry inside this file uses. */
  sourceUpAxis: UpAxis;
  /** Exactly one file per part should set this. */
  isDefaultViewer?: boolean;
  /** How the units/axis above were established. Inference must say so. */
  provenanceNote?: string;
}

/** A non-model document — spec sheet, service instructions, install guide. */
export interface PartDocument {
  name: string;
  url: string;
  kind: 'spec' | 'install' | 'service' | 'user-guide' | 'other';
}

export interface Part {
  partId: string;
  /** Manufacturer part number, where one exists. */
  sku?: string;
  title: string;
  description?: string;
  tags?: string[];
  files: ModelFile[];
  documents?: PartDocument[];
  /** Free-form notes aimed at someone about to modify the part. */
  modNotes?: string;
}

export interface ProductFamily {
  familyId: string;
  brand: string;
  title: string;
  description?: string;
  parts: Part[];
}

export interface Catalog {
  catalogVersion: string;
  /** Mirrors Maker Galaxy's sourcePolicy field — keeps asset origins honest. */
  sourcePolicy?: string;
  families: ProductFamily[];
}

/** A part plus the family it belongs to, which the UI needs together. */
export interface CatalogEntry {
  family: ProductFamily;
  part: Part;
  file: ModelFile;
}
