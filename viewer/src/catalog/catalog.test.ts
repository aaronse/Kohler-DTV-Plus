import { describe, expect, it } from 'vitest';
import catalogJson from './catalog.json';
import {
  CatalogError,
  defaultFileFor,
  entryKey,
  findEntry,
  flattenCatalog,
  searchEntries,
  validateCatalog,
} from './catalog';
import type { Catalog } from './types';

function minimal(): Catalog {
  return {
    catalogVersion: 'test',
    families: [
      {
        familyId: 'fam',
        brand: 'Brand',
        title: 'Family',
        parts: [
          {
            partId: 'p1',
            title: 'Part One',
            files: [
              {
                id: 'f1',
                name: 'p1.obj',
                format: 'obj',
                url: '/p1.obj',
                sourceUnit: 'in',
                sourceUpAxis: 'z',
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('the shipped catalog', () => {
  it('validates', () => {
    expect(() => validateCatalog(catalogJson)).not.toThrow();
  });

  it('declares units and up-axis on every file', () => {
    // The whole export path rests on these being right, so this is pinned
    // rather than left to the validator alone.
    const catalog = validateCatalog(catalogJson);
    for (const family of catalog.families) {
      for (const part of family.parts) {
        for (const file of part.files) {
          expect(file.sourceUnit, `${part.partId}/${file.id}`).toBeTruthy();
          expect(file.sourceUpAxis, `${part.partId}/${file.id}`).toBeTruthy();
        }
      }
    }
  });

  it('carries the K-99693 interface as an inch-authored Z-up model', () => {
    const catalog = validateCatalog(catalogJson);
    const entries = flattenCatalog(catalog);
    const entry = findEntry(entries, 'kohler-dtv-plus/k-99693');
    expect(entry).toBeDefined();
    // Verified against the K-99693 spec sheet, not assumed — see the file's
    // provenanceNote and viewer/public/models/PROVENANCE.md.
    expect(entry!.file.sourceUnit).toBe('in');
    expect(entry!.file.sourceUpAxis).toBe('z');
  });
});

describe('validateCatalog', () => {
  it('rejects a missing version', () => {
    const c = minimal();
    delete (c as Partial<Catalog>).catalogVersion;
    expect(() => validateCatalog(c)).toThrow(CatalogError);
  });

  it('rejects a file with no declared units', () => {
    const c = minimal();
    delete (c.families[0].parts[0].files[0] as Partial<{ sourceUnit: unknown }>).sourceUnit;
    expect(() => validateCatalog(c)).toThrow(/sourceUnit/);
  });

  it('rejects an invalid unit rather than defaulting it', () => {
    const c = minimal();
    (c.families[0].parts[0].files[0] as unknown as { sourceUnit: string }).sourceUnit = 'cubits';
    expect(() => validateCatalog(c)).toThrow(/sourceUnit/);
  });

  it('rejects a missing up-axis', () => {
    const c = minimal();
    (c.families[0].parts[0].files[0] as unknown as { sourceUpAxis: string }).sourceUpAxis = 'q';
    expect(() => validateCatalog(c)).toThrow(/sourceUpAxis/);
  });

  it('rejects an unsupported format', () => {
    const c = minimal();
    (c.families[0].parts[0].files[0] as unknown as { format: string }).format = 'dwg';
    expect(() => validateCatalog(c)).toThrow(/unsupported format/);
  });

  it('rejects duplicate part ids within a family', () => {
    const c = minimal();
    c.families[0].parts.push({ ...c.families[0].parts[0] });
    expect(() => validateCatalog(c)).toThrow(/duplicate partId/);
  });

  it('rejects duplicate family ids', () => {
    const c = minimal();
    c.families.push({ ...c.families[0] });
    expect(() => validateCatalog(c)).toThrow(/duplicate familyId/);
  });

  it('rejects a part with two default viewer files', () => {
    const c = minimal();
    const file = c.families[0].parts[0].files[0];
    c.families[0].parts[0].files = [
      { ...file, id: 'a', isDefaultViewer: true },
      { ...file, id: 'b', isDefaultViewer: true },
    ];
    expect(() => validateCatalog(c)).toThrow(/isDefaultViewer/);
  });

  it('rejects a part with no files', () => {
    const c = minimal();
    c.families[0].parts[0].files = [];
    expect(() => validateCatalog(c)).toThrow(/at least one file/);
  });
});

describe('catalog queries', () => {
  it('picks the flagged default file', () => {
    const c = minimal();
    const file = c.families[0].parts[0].files[0];
    c.families[0].parts[0].files = [
      { ...file, id: 'a' },
      { ...file, id: 'b', isDefaultViewer: true },
    ];
    expect(defaultFileFor(c.families[0].parts[0]).id).toBe('b');
  });

  it('falls back to the first file when none is flagged', () => {
    expect(defaultFileFor(minimal().families[0].parts[0]).id).toBe('f1');
  });

  it('builds a stable deep-link key', () => {
    const entries = flattenCatalog(minimal());
    expect(entryKey(entries[0])).toBe('fam/p1');
    expect(findEntry(entries, 'fam/p1')).toBeDefined();
    expect(findEntry(entries, 'fam/nope')).toBeUndefined();
  });

  it('searches across brand, title, sku and tags', () => {
    const c = minimal();
    c.families[0].parts[0].sku = 'K-99693';
    c.families[0].parts[0].tags = ['faceplate'];
    const entries = flattenCatalog(c);
    expect(searchEntries(entries, 'k-996')).toHaveLength(1);
    expect(searchEntries(entries, 'FACEPLATE')).toHaveLength(1);
    expect(searchEntries(entries, 'brand')).toHaveLength(1);
    expect(searchEntries(entries, 'nonsense')).toHaveLength(0);
  });

  it('returns everything for an empty query', () => {
    const entries = flattenCatalog(minimal());
    expect(searchEntries(entries, '   ')).toHaveLength(1);
  });
});
