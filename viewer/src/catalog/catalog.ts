import { isLengthUnit, isUpAxis } from '../core/units';
import type { Catalog, CatalogEntry, ModelFile, Part, ProductFamily } from './types';

// Catalog loading and validation.
//
// The validation is deliberately strict and loud. A catalog entry with a
// missing or bogus `sourceUnit` would still render — it would just render at
// the wrong size, silently, and export a file that is wrong by a factor of 25.4.
// Failing at load with a message naming the offending part is much cheaper than
// discovering it on the machine.

export const SUPPORTED_FORMATS = ['obj', 'stl', '3mf', 'gltf', 'glb', '3ds', 'ply'] as const;

export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogError';
  }
}

/** Validate a parsed catalog, throwing on the first structural problem. */
export function validateCatalog(input: unknown): Catalog {
  const catalog = input as Catalog;
  if (!catalog || typeof catalog !== 'object') {
    throw new CatalogError('catalog is not an object');
  }
  if (typeof catalog.catalogVersion !== 'string' || !catalog.catalogVersion) {
    throw new CatalogError('catalog.catalogVersion is required');
  }
  if (!Array.isArray(catalog.families)) {
    throw new CatalogError('catalog.families must be an array');
  }

  const seenFamilies = new Set<string>();
  for (const family of catalog.families) {
    validateFamily(family, seenFamilies);
  }
  return catalog;
}

function validateFamily(family: ProductFamily, seenFamilies: Set<string>): void {
  if (!family.familyId) throw new CatalogError('a family is missing familyId');
  if (seenFamilies.has(family.familyId)) {
    throw new CatalogError(`duplicate familyId: ${family.familyId}`);
  }
  seenFamilies.add(family.familyId);

  if (!Array.isArray(family.parts)) {
    throw new CatalogError(`family ${family.familyId}: parts must be an array`);
  }

  const seenParts = new Set<string>();
  for (const part of family.parts) {
    validatePart(family, part, seenParts);
  }
}

function validatePart(family: ProductFamily, part: Part, seenParts: Set<string>): void {
  const where = `${family.familyId}/${part.partId ?? '<no partId>'}`;
  if (!part.partId) throw new CatalogError(`family ${family.familyId}: a part is missing partId`);
  if (seenParts.has(part.partId)) throw new CatalogError(`duplicate partId: ${where}`);
  seenParts.add(part.partId);

  if (!part.title) throw new CatalogError(`part ${where}: title is required`);
  if (!Array.isArray(part.files) || part.files.length === 0) {
    throw new CatalogError(`part ${where}: at least one file is required`);
  }

  for (const file of part.files) {
    validateFile(where, file);
  }

  const defaults = part.files.filter((f) => f.isDefaultViewer);
  if (defaults.length > 1) {
    throw new CatalogError(
      `part ${where}: ${defaults.length} files marked isDefaultViewer, expected at most 1`,
    );
  }
}

function validateFile(where: string, file: ModelFile): void {
  const at = `${where}/${file.id ?? file.name ?? '<no id>'}`;
  if (!file.id) throw new CatalogError(`file in ${where} is missing id`);
  if (!file.url) throw new CatalogError(`file ${at}: url is required`);
  if (!(SUPPORTED_FORMATS as readonly string[]).includes(file.format)) {
    throw new CatalogError(
      `file ${at}: unsupported format ${JSON.stringify(file.format)} ` +
        `(supported: ${SUPPORTED_FORMATS.join(', ')})`,
    );
  }
  // The two fields that make an export trustworthy. No defaulting: a guessed
  // unit is worse than a refusal, because it looks like an answer.
  if (!isLengthUnit(file.sourceUnit)) {
    throw new CatalogError(
      `file ${at}: sourceUnit ${JSON.stringify(file.sourceUnit)} is missing or invalid. ` +
        `Determine the real units before adding this file — an STL exported from a ` +
        `guessed unit is wrong by a constant factor and looks perfectly normal on screen.`,
    );
  }
  if (!isUpAxis(file.sourceUpAxis)) {
    throw new CatalogError(
      `file ${at}: sourceUpAxis ${JSON.stringify(file.sourceUpAxis)} is missing or invalid`,
    );
  }
}

/** The file a part should open with: its explicit default, else the first. */
export function defaultFileFor(part: Part): ModelFile {
  return part.files.find((f) => f.isDefaultViewer) ?? part.files[0];
}

/** Flatten a catalog to one entry per part, using each part's default file. */
export function flattenCatalog(catalog: Catalog): CatalogEntry[] {
  const entries: CatalogEntry[] = [];
  for (const family of catalog.families) {
    for (const part of family.parts) {
      entries.push({ family, part, file: defaultFileFor(part) });
    }
  }
  return entries;
}

/** Stable `family/part` key used in the URL hash for deep links. */
export function entryKey(entry: Pick<CatalogEntry, 'family' | 'part'>): string {
  return `${entry.family.familyId}/${entry.part.partId}`;
}

export function findEntry(entries: CatalogEntry[], key: string): CatalogEntry | undefined {
  return entries.find((entry) => entryKey(entry) === key);
}

/**
 * Case-insensitive search across family, part, sku and tags. Plain substring
 * matching — the catalog is small, and a fuzzy matcher would be a dependency
 * and a surprise for no gain at this size.
 */
export function searchEntries(entries: CatalogEntry[], query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((entry) => {
    const haystack = [
      entry.family.brand,
      entry.family.title,
      entry.part.title,
      entry.part.sku ?? '',
      ...(entry.part.tags ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
