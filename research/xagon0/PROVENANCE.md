# Vendored: xagon0/Kohler-DTV-Plus

Everything in this directory below `PROVENANCE.md` is a **verbatim copy** of
<https://github.com/xagon0/Kohler-DTV-Plus> at branch `master`, fetched
2026-07-26. It is not our work.

It is vendored so that the safety ratings and protocol details this project
depends on stay pinned and available offline — the CGI risk table in
[app/server/cgi-safety.mjs](../../app/server/cgi-safety.mjs) is built directly
from it.

## Licensing

**The upstream repository states no license.** No `LICENSE`, `COPYING`, or
equivalent file exists in the tree as fetched. That means no explicit grant of
reuse has been made, and the copy here should be treated as reference material
only.

If you intend to redistribute this project, or reuse this material beyond
private research and repair, check with the upstream author first. Removing this
directory does not break the app — the ratings are transcribed into
`cgi-safety.mjs`, which cites its sources inline.

## What was and was not copied

Copied: all 37 `.md` and `.py` files.

Skipped: `Images/KohlerBoardOverall.png` (11 MB board photograph) and
`docs/.DS_Store`.

The board photograph is instead carried as a derivative at
[../../Images/KohlerBoardOverall.webp](../../Images/KohlerBoardOverall.webp) —
lossy WebP, quality 82, full 3710×2242 resolution, 962 KB (PSNR 40.3 dB against
the original). It sits outside this directory precisely because it is *not*
verbatim. Silkscreen designators remain legible; use the upstream PNG if you
need a pixel-exact source. Same licensing caveat as everything else here: the
upstream repository states no license.

## Where it disagrees with this system

Two conflicts surfaced when checking the vendored docs against the live
controller. In both cases we follow the controller's own web UI, because that is
the code the hardware actually shipped with:

| Topic | Upstream says | This controller | Resolution |
| --- | --- | --- | --- |
| Massage modes | `1 = wave, 2 = single` | `control.html` labels `1 = Single, 2 = Wave` | Followed the controller's own UI. |
| `quick_shower.cgi` temperature | Celsius | Sent in the unit `values.units` reports — °F on this system, with the controller's own inputs bounded 86-113 | Send in the configured unit, clamped to the controller's `max_temp`. |

The Celsius discrepancy is most likely explained by the upstream unit being
configured for Celsius rather than by a protocol difference.

See [../../PROTOCOL.md](../../PROTOCOL.md) for our own findings and
[../../DISCLAIMER.md](../../DISCLAIMER.md) for the safety policy.
