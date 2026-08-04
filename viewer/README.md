# Parts Viewer

An interactive 3D viewer and STL exporter for service parts, aimed at people
modifying them. Load a manufacturer's published CAD, measure it, and download a
binary STL that a slicer or CAM package will accept.

**This app is deliberately separate from [`../app`](../app).** That one drives a
real shower valve and has to stay lean and predictable; this one is a browsing
and fabrication tool with no hardware surface whatsoever. They share no code, no
build, and no port. Nothing here can move water.

```bash
npm install
npm run dev        # http://localhost:5181
npm run check      # typecheck + unit tests + export gate + build
npm run verify     # export gate on its own, against the vendored CAD
```

## What it does

- **Views** OBJ, STL, 3MF, glTF/GLB, 3DS and PLY — from the catalog or by
  dropping a file on the window.
- **Measures** in export space: envelope, surface area, volume, solid-PLA mass,
  and whether the mesh is actually closed.
- **Reads out coordinates.** Hover the model and the corner shows the point
  under the cursor in millimetres, Z-up — the same frame the exported STL uses,
  so a coordinate can go straight into CAM.
- **Exports binary STL** in millimetres (or inches, for imperial posts), Z-up,
  with the units stated in the filename.

## The thing this app is actually about

Every mesh format in common use records geometry and nothing else. **None of
OBJ, STL, 3MF or PLY records what units the numbers are in, or which way is
up.** A part authored in inches and read as millimetres renders perfectly — it
is simply 25.4× too small, and nothing on screen says so. That error survives
all the way to the machine.

So the catalog requires every file to declare `sourceUnit` and `sourceUpAxis`,
and the loader refuses entries that omit them rather than picking a default. A
guessed unit is worse than a refusal, because it looks like an answer.

The conventions are fixed:

| Space | Units | Up axis | Used for |
| --- | --- | --- | --- |
| Source | as declared per file | as declared per file | nothing directly |
| Export | mm | Z | STL output, all measurements, the pointer readout |
| Display | mm | Y | the viewport only |

Measurements are taken in **export** space, not display space, so the numbers in
the inspector are the numbers in the downloaded file.

### Why not three's `STLExporter`

`STLExporter` serialises a scene graph, which means you export what you are
*looking at* — display space, whatever orientation the viewport happens to use.
That is precisely the failure this tool exists to prevent. [`src/core/stl.ts`](src/core/stl.ts)
writes the format directly from the source geometry and the declared units
instead, in about fifty lines, and can be tested in plain Node with no WebGL
context. See its header comment for the full reasoning.

## Verification

`npm run verify` loads every vendored catalog asset, exports it, then
**re-derives the bounding box from the exported bytes** and compares it against
the measured one. It catches a transform applied on one path but not the other,
an asset swapped for a different revision, and any dimension that lands outside
1 mm–2 m (almost always a units error).

Current output:

```
- kohler-dtv-plus/k-99693 (99693-P.obj)
    source        in, z-up
    triangles     4,544
    envelope      133.59 x 30.84 x 84.07 mm
    surface       423.24 cm2
    mesh          OPEN — 224 unshared edges, volume withheld
    read-back     133.59 x 30.84 x 84.07 mm, 0 degenerate facet(s)
    repair        Repaired: welded 11,242 vertices, capped 11 hole(s) with 200
                  triangles, collapsed 2 hairline seam(s). Watertight and manifold.
                  4544 -> 4736 triangles, boundary 222 -> 0, non-manifold 0
    enclosed vol  190.30 cm3
```

The 88 unit tests cover the maths on synthetic geometry; this gate covers the
real manufacturer CAD, which is where the interesting failures actually live.

## Mesh repair

Manufacturer CAD is routinely published as an open surface rather than a solid.
The K-99693 model has 222 boundary edges across 11 open loops and 2 non-manifold
seams. [`src/core/repair.ts`](src/core/repair.ts) closes it, and both meshes are
downloadable — pick "As published" or "Repaired" next to the units selector.

Three distinct fixes, which get conflated and are not the same thing:

| Fix | What it addresses | Adds geometry? |
| --- | --- | --- |
| **Welding** (merge by distance) | *Cracks* — triangles that touch but reference duplicate vertices, so their shared edge is double-counted | no |
| **Capping** (hole filling) | *Holes* — a boundary loop with nothing on the other side | yes |
| **Seam collapse** | *T-junctions* — a hairline edge claimed by four triangles instead of two | no |

Welding runs first and is not optional: a hole finder run on unwelded geometry
sees every crack as a hole and would "fill" seams that were never open.

On the K-99693 model: 11,242 vertices welded, 11 loops capped with 200 added
triangles, 2 seams collapsed. 4,544 → 4,736 triangles, watertight and manifold.

**The envelope does not move.** Capping adds interior geometry only; the outer
surface is what a toolpath is cut against, so `npm run verify` fails if any axis
drifts by more than 0.0001 mm. On this part the drift is 0.000000 mm on all three.

### What it refuses to do

A repair that silently invents geometry is worse than no repair, because the
output looks authoritative. So it will not bridge two different loops, guess at
missing internal structure, or re-mesh. A loop that is not planar within
tolerance (default 0.25 mm) is **skipped and reported**, and the result is
declared not watertight rather than flattened into a plausible-looking lie.

## Known limitations

1. **The repaired K-99693 is a closed shell, not a solid model of the part.**
   Its enclosed volume (190.30 cm³) counts the hollow interior, so the "solid
   PLA" mass figure is an upper bound on a part that isn't solid.
2. **The CAD contains no internal structure at all** — no PCB, no connector, no
   ribs or bosses. It is authority for the outside of the part and for nothing
   behind it. Establish internal clearances from the physical part.
3. **Parts are single meshes.** The Kohler CAD is one unnamed group, so buttons
   and bezel cannot be picked or isolated separately without splitting the mesh
   by hand in Blender first.
3. **Dropped files assume mm and Z-up**, because nothing in the file says
   otherwise. The status line says so every time. Use a catalog entry for
   anything headed to a machine.
4. **DWG, SKP and RFA are not supported** and will not be — they have no browser
   loader and need offline conversion. DXF is not supported either; three.js
   ships no loader for it.

## Adding a part

Add an entry to [`src/catalog/catalog.json`](src/catalog/catalog.json). The
validator will reject it unless every file declares `sourceUnit` and
`sourceUpAxis`.

Establish those from a dimensioned source — a spec sheet, a drawing, or a
measurement of the physical part — and record how in `provenanceNote`. The
K-99693 entry is the worked example: its bounding box was checked against the
published spec sheet on all three axes before the units were declared.

Vendored assets go in `public/models/<familyId>/` and must be recorded in
[`public/models/PROVENANCE.md`](public/models/PROVENANCE.md).

## Relationship to Maker Galaxy

The catalog's `files[]` entries deliberately use the same `id` / `name` /
`format` / `url` / `isDefaultViewer` fields as Maker Galaxy's
`src/maker-galaxy/data/models.json`, and [`src/scene/cameraFit.ts`](src/scene/cameraFit.ts)
is a behaviour-preserving port of its `viewerHelpers.js`. A part described here
should move into that catalog without a translation layer.

Two fields are additions Maker Galaxy does not yet have: `sourceUnit` and
`sourceUpAxis`. Its current viewer assumes STL and 3MF are already in
millimetres, which holds for maker-authored models and does not hold for
manufacturer CAD.
