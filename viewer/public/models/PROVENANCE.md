# Vendored model assets

Everything under this directory is **third-party manufacturer CAD**. It is not
our work, and it is vendored here only so the viewer has something to load
without a network fetch.

## kohler-dtv-plus/99693-P.obj

| | |
| --- | --- |
| Part | Kohler K-99693 DTV+ Digital Interface (wall control unit) |
| Format | Wavefront OBJ, ASCII |
| Producer | `3ds Max Wavefront OBJ Exporter v0.97b`, per the file's own header |
| Authored | 2014-03-24 14:09:43, per the file's own header |
| Geometry | 2392 vertices, 2301 face records, 9146 vertex normals, one group `99693` |
| Triangulated | 4544 triangles (the face records are largely quads) |
| Materials | None. No `mtllib`, no `usemtl`, no UVs. |
| Watertight | **No.** 224 unshared edges — an open surface, not a solid. |
| Copied from | `E:\proj-med\build-661-diag-kohler-shower\kohler\kohler-digital-interface-99693\99693-P.obj` |
| Copied on | 2026-07-27 |

**Verbatim copy.** The bytes here are identical to the source file; nothing was
re-exported, decimated or re-oriented. The viewer applies its unit and axis
transforms at load and export time instead, so the vendored asset stays
byte-comparable against whatever Kohler publishes.

### Units and orientation

The file declares neither, as OBJ has no facility to. Both were **established by
measurement, not assumed**:

| Axis | Mesh extent | Spec sheet | Reading |
| --- | --- | --- | --- |
| X | 5.259 | 5-1/4 in (5.250) | width |
| Y | 1.214 | 1-3/16 in (1.1875) | depth |
| Z | 3.310 | 3-5/16 in (3.3125) | height |

So the file is in **inches**, with **Z up** and Y as depth — the usual 3ds Max
and mechanical-CAD convention. This is recorded as `sourceUnit: "in"` and
`sourceUpAxis: "z"` in `src/catalog/catalog.json`, and it is what makes the STL
export trustworthy: millimetres are a flat ×25.4 with no rotation at all.

Measured through the app's own export path, the envelope comes out at
**133.59 × 30.84 × 84.07 mm** against a published 133.35 × 30.16 × 84.14 mm:
+0.24 mm on width, +0.68 mm on depth, −0.07 mm on height.

The depth is the outlier. That is plausibly a trim-ring or mounting-boss detail
included in the CAD but excluded from the published depth. **It has not been
checked against the physical part** — treat the depth as the least certain of
the three.

### The mesh is not watertight

`npm run verify` reports **224 unshared edges**. The published CAD is an open
surface, not a closed solid.

This does not affect viewing or measurement, and the dimensions above are
unaffected. It does affect anything downstream:

- A slicer will need to repair the mesh before it will print.
- CAM packages that require a closed solid will reject it or produce a bad
  toolpath.
- The app deliberately **withholds a volume figure** for this part rather than
  reporting the meaningless number a signed-volume sum gives on an open mesh.

Repair in Blender, Meshmixer, Netfabb or PrusaSlicer's own repair before use.
This is the manufacturer's file as published — it has not been degraded here.

### Licensing — read before publishing

**Kohler publishes this CAD for specification and design use. It carries no
open licence, and no grant of redistribution has been identified.** It is
included here for private repair and research on a unit we own.

This repository is public. Before this directory is pushed anywhere public,
somebody needs to make a deliberate call on whether redistributing the
manufacturer's CAD is acceptable, or whether the viewer should instead fetch it
from Kohler's own URL or require the user to drop the file in themselves.

The application does **not** depend on this file being present. The catalog
entry will simply fail to load, and the drag-and-drop loader works regardless —
so removing this directory degrades the demo without breaking the app.

### Not copied

The source directory also holds `.dwg`, `.dxf`, `.skp`, `.rfa` and `.3ds`
versions of the same part, plus four PDF manuals. None are vendored:

- `99693-P.3ds` is the same single mesh with no materials, so it adds nothing
  over the OBJ and would cost another loader on the critical path.
- `.dwg` / `.skp` / `.rfa` have no browser loader and would need offline
  conversion.
- `99693-P.dxf` does carry 3D polymesh data, but three.js ships no DXF loader
  and it is redundant with the OBJ.
- `99693_pfrt.dxf`, `99693_ppln.dxf`, `99693_psde.dxf` are 2D front, plan and
  side elevations (`LINE` and `ARC` entities only). Useful as dimensioned
  reference drawings later; not model geometry.
- The PDFs are documentation, not geometry. The catalog references them by name
  with empty URLs until a hosting decision is made.
