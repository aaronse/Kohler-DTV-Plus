---
title: "Kohler DTV+ — State of the Project"
filename: "2026-10-31-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md"
status: "point-in-time-assessment"
date: "2026-10-31"
generated_by: "claude-opus-5"
audience: ["Product Planner Agents", "Operator", "Dev Agents"]
purpose: >
  Third snapshot, 63 days after the second. One commit landed in that window and it was
  housekeeping. This doc exists to say what changed — and the honest answer is that the
  project's own record did not move, while two of its liabilities got older: GPS bytes in
  public history, and 63 days of analysis that lives outside git. It supports one decision:
  what the first session back spends itself on.
sources:
  - "README.md"
  - "AGENT.md (story-log section rewritten 2026-10-08 for storylog v0)"
  - "CLAUDE.md"
  - "DISCLAIMER.md"
  - "DESIGN.md"
  - "FLOW.md"
  - "PROTOCOL.md"
  - "LICENSE.md"
  - "INVESTIGATIONS.md"
  - "STORY-LOG-INDEX.md"
  - "STORY-LOG.md (index plus cited entries only, per AGENT.md:62-63)"
  - "app/package.json, app/vite.config.ts, app/.gitignore"
  - "app/server/{cgi-safety,middleware,kohler-client,trace,standalone}.mjs"
  - "app/server/__tests__/trace.test.ts"
  - "app/scripts/selftest.mjs"
  - "app/src/{main.tsx,App.tsx}"
  - "app/src/api/{client,config,model,outlets,types}.ts"
  - "app/src/state/{useShower,useTheme}.ts"
  - "app/.trace/egress.log (untracked, gitignored — 1,998 lines, 2026-08-05 → 08-11; re-parsed today)"
  - "viewer/package.json, viewer/README.md"
  - "research/FIELD-NOTES.md"
  - "research/SOURCES.md"
  - "research/PROMPT-observability.md"
  - "research/diagnostics/ (directory listing)"
  - "cnc/ (directory listing — still no README)"
  - "docs/state/2026-08-29-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md (prior snapshot, untracked)"
  - "docs/state/2026-08-04-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md (first snapshot)"
  - "research/scout/kohler-dtv-plus-work-scout-v2.json (prior ledger, untracked)"
  - "git log, git status, git blame, git show 5d83023"
  - "sibling: e:/git/storylog (SPEC.md, BACKLOG-INDEX.md)"
  - "sibling: e:/git/inferiere (apps/web/scripts/gate-b10.ts)"
  - "sibling: e:/git/mg-web, e:/git/mg-controller, e:/git/OpenMakerLicense, e:/git/llm-fab"
  - "sibling: e:/git/craftcraft-private/pipeline/repos.json"
repo_activity:
  last_commit: "2026-10-08"
  quiet_days: 23
  is_active: false
invalidated_by: >
  The four untracked artifacts in `git status` being committed; `app/.trace/egress.log` being
  copied into `research/diagnostics/` or deleted; the GPS blob being purged from public history
  (tracked as storylog S20); any story-log entry dated after 2026-08-04; the E9 guard fix
  landing; the app being run again (the trace would grow past 1,998 lines); E1 or E10 being run.
prior_snapshot: "docs/state/2026-08-29-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md"
prior_ledger: "research/scout/kohler-dtv-plus-work-scout-v2.json"
this_ledger: "research/scout/kohler-dtv-plus-work-scout-v3.json"
portfolio_card: "research/scout/kohler-dtv-plus-portfolio-card.json"
backlog_index: "BACKLOG-INDEX.md"
---

# Kohler DTV+ — State of the Project

## TLDR

This repository replaces the K-99693 wall interface of a Kohler DTV+ shower with a browser app
driving the controller's undocumented HTTP/0.9 CGI API through a raw-socket Node proxy behind a
code-enforced safety gate, and runs an open investigation into why the shower stopped itself
mid-use. **Everything that was true on 2026-08-29 is still true, re-verified line by line, and
nothing in the 2026-08-29 ledger was acted on.** One commit landed in 63 days — `5d83023`,
2026-10-08 — which stripped GPS coordinates out of a public board photo and migrated the story
log to storylog v0. Both suites still pass unchanged: 85 app tests, 164 viewer tests, typecheck
and build clean. **The honest gate is that this project's three most valuable artifacts are all
outside git.** (a) The only copy of 1,998 lines of hardware evidence is `app/.trace/egress.log`,
gitignored by design, untouched since 2026-08-29, and the app has not been run since 2026-08-11 —
81 days. (b) The 2026-08-29 snapshot that *read* that evidence, its ledger and its portfolio card
are still untracked: 63 days of analysis one `git clean` from gone, and still absent from
`INVESTIGATIONS.md` and `STORY-LOG.md`. (c) The GPS bytes stripped on 2026-10-08 are still live
in the public history — the commit message says so plainly — and the decision about them is
parked in a *sibling* repo's backlog (`storylog` S20, open since 2026-10-18), not here.
Re-measured today from the trace: consecutive defeats of the `values.cgi` valve-loss guard are
**411 ± 4 s apart** across seven intervals on 2026-08-05, which is a periodic controller fault,
not the load-induced one the story log still blames; and the 2026-08-11 shower took **79 s and
two 12 s timeouts** to start because it started inside a stall. Two things changed that the repo
does not know: the 2026-10-08 commit created fresh doc rot (`README.md:40` still calls the story
log newest-first; it is now oldest-first) and skipped the story-log append its own `AGENT.md:58`
requires, and `inferiere` turns out to have carried a two-chapter "Kohler Shower Diagnosis"
deliverable since 2026-07-31 — which **corrects** the 08-29 snapshot's claim that nothing there
references this footage. Nothing is on fire in the sense of corruption. Two things are on fire in
the sense that one operator action each prevents a loss or an exposure, and both have been true
for weeks.

## 1. Burn-down of the 2026-08-29 ledger

The window is cheap to audit: `git diff 9d6bbbe..HEAD --stat` touches **four files**
(`AGENT.md`, `Images/KohlerBoardOverall.webp`, `STORY-LOG.md`, `STORY-LOG-INDEX.md`). Every
other evidence line in the prior ledger is byte-identical. I re-read each one rather than assume
it, and re-derived the trace measurements from the file instead of inheriting them.

| Prior id | Title | Status | What I verified today |
| --- | --- | --- | --- |
| KDTV-W11 | ~6-minute periodic stall unread in the trace | **STILL OPEN — re-measured** | `egress.log` unchanged at 1,998 lines. Re-parsed: 12 `ACCEPTED` guard defeats; the 8 on 08-05 are spaced **415 / 408 / 411 / 415 / 408 / 411 / 415 s** (mean 411.9, range 408–415), the 08-11 ones at 417 / 425 / 808 s, the last ≈ a doubled cycle. Nothing about this is in `INVESTIGATIONS.md`. **Carried as W11.** |
| KDTV-W10 | `values.cgi` guard defeated every stall; E9 specified, unbuilt | **STILL OPEN** | `middleware.mjs:92-119` unchanged; `git blame` dates the twice-rule to `c8cefc13`, 2026-07-26 — **97 days**. E9 still unchecked at `INVESTIGATIONS.md:574-586`. **Carried as W10.** |
| KDTV-W1 | E1/E10 unrun; E2 apparently run and unrecorded | **STILL OPEN** | `INVESTIGATIONS.md:111-175` — E1 and E2 still `[ ]`. `STORY-LOG-INDEX.md` lists 20 entries ending **2026-08-04 23:10**; none mentions 08-11. **Carried as W1.** |
| KDTV-W4 | State-diff trace and phone log viewer unbuilt | **STILL OPEN** | `grep -n DIFF app/server/trace.mjs` → comments only (`:42`, `:131`). `middleware.mjs:125-173` has four `/api/` routes, none serving the log. **Carried as W4.** |
| KDTV-W8 | Four documents describe the 07-26 world | **STILL OPEN — and the 10-08 commit added a fifth** | `README.md:18-19`, `DESIGN.md:11-13`, `PROTOCOL.md:199-201` still state `num_interface = 0`, which `INVESTIGATIONS.md:518` has recorded as `= 1` since 2026-08-04. `DESIGN.md:165` says 49 tests (85 measured); `viewer/README.md:87` says 88 (164 measured); `DESIGN.md:204-206` still "no valve has been opened"; `selftest.mjs:179` still "expected on this system". **New:** `README.md:40` calls the story log "newest first" — `5d83023` made it oldest-first and rewrote `AGENT.md:64-65` to say so. **Carried as W8.** |
| KDTV-W13 | StrictMode fires the first poll twice; proxy forwards abandoned requests | **STILL OPEN** | `main.tsx:7` `<StrictMode>`; `useShower.ts:66-108` ticks in a mount effect; `middleware.mjs:125-173` has no `req.on('close')`. `git blame` → `6a1b2d43` / `c8cefc13`, both 2026-07-26, **97 days**. **Carried as W13.** |
| KDTV-W14 | `npm test` writes into the operator's live trace | **STILL OPEN — now with a one-flag proof** | Reproduced and contained today: with `DTV_TRACE_DIR` pointed at a scratch directory, `npx vitest run` wrote its `NOTE … proxy start` line to **the scratch file** and the live `egress.log` stayed at exactly 1,998 lines. Also measured: `DTV_TRACE=0` — the kill switch at `trace.mjs:71` — **fails 12 of 85 tests**, because `trace.test.ts` asserts that lines get written. **Carried as W14, cheaper and bigger than it looked.** |
| KDTV-W5 | Degraded `values.cgi` silently declares °F / 113 | **STILL OPEN** | `model.ts:136,153,186,213` unchanged; blame → 2026-07-26, **97 days**. **Carried as W5.** |
| KDTV-W7 | `cnc/` holds twelve undocumented files | **STILL OPEN — demoted to `considered`** | 12 files, no README, unchanged. Nothing depends on the README and the operator holds the knowledge. Its one perishable fact — *which* rear-cover revision is installed — is folded into W18, which has a reason to go and look. |
| KDTV-W9 | Unlicensed third-party bodies under a draft licence | **STILL OPEN** | `LICENSE.md:46` still "Status: Draft"; canonical `e:/git/OpenMakerLicense/LICENSE.md` unchanged since 2026-01-08 (296 days — so no drift); no record anywhere of xagon0 being asked. **Carried as W9.** |
| KDTV-W3 | Fabrication week and Kohler call absent from the story log | **STILL OPEN — and the prior snapshot's cross-repo claim was wrong** | `STORY-LOG-INDEX.md` jumps 2026-07-27 16:10 → 2026-08-03 16:18, and has no 07-27 support-call entry. But `e:/git/inferiere/apps/web/scripts/gate-b10.ts:9-12,247` is a committed "Kohler Shower Diagnosis (B10 field test)" with two chapters — *Shower Digital Interface Diagnosis* and *Controller Support and Troubleshooting* — dated **2026-07-31**, which predates the 08-29 snapshot's "finds nothing that references this footage". That claim was false when written. **Carried as W3, reframed.** |

Net: **0 done, 0 partial, 10 still open, 1 demoted.** Five new items (W15, W16, W18, W19, W20)
come from the window itself, from the calendar, and from the one sibling-repo correction.

## 2. What it is intended to do

Unchanged in the project's own terms (`README.md:3-4,11-24`, `AGENT.md:7-13`): replace a dead wall
interface with a browser app over the controller's CGI API; find out why the shower stops
mid-use; document it publicly for YouTube and possibly for Kohler support. The first premise is
**historical** — the interface has reported `conn` since 2026-07-29
(`INVESTIGATIONS.md:476`, `:518`) — and the front page still opens with the old reading (§4.4).
The third premise has had no owner, no date and no artifact in this repo for 97 days (§4.6).

**Deliberate stances** — all still enforced in code or contract, none violated in this window:

| Stance | Where | Verified today |
| --- | --- | --- |
| Nothing above 2/5 reachable, ever | `cgi-safety.mjs` self-throws at import | `exposedEndpoints()` → **18 of 56 rated** (5 read, 13 command), `MAX_RISK = 2`; 25 safety tests pass |
| Never open a valve without in-the-moment consent | `AGENT.md:31-33` | This sweep contacted no hardware and generated no `REQ` line |
| 15 s idle / 5 s active is a floor | `useShower.ts:26-27`, `FIELD-NOTES.md` §1 | Constants unchanged |
| No test may open a valve | `AGENT.md:84-85` | `safety.test.ts` imports only the predicate; `useShower.test.ts` mocks the client |
| The viewer has no hardware surface | `viewer/README.md:7-10` | `viewer/package.json` dependencies: `three` only |
| Mark inference as inference; report own failures | `AGENT.md:37-42` | This doc labels the ≥31-minute shower as inference and corrects the prior snapshot in §1 |
| Commit only metadata-free WebP; never GPS | `AGENT.md:71` (new, 2026-10-08) | The current blob is clean; the pre-`5d83023` blob is not, and is still on the public remote (§4.2) |
| Absence of a `REQ` line means "we did not send it", never "nobody did" | `trace.mjs:26-28` | Load-bearing for §4.1 |

## 3. What is actually built

### 3.1 `app/` — the hardware interface

Measured today. Both suites were run with `DTV_TRACE_DIR` redirected into a scratch directory, so
this sweep did **not** repeat W14's pollution of the live trace.

| Claim | Label | Evidence |
| --- | --- | --- |
| 85 unit tests, 5 files, no hardware | **real — measured** | `npx vitest run` in `app/` → 85 passed, exit 0 (trace 14, safety 25, model 37, useShower 7, updaterPurity 2) |
| Typecheck and production build clean | **real — measured** | `npx tsc --noEmit` exit 0; `npx vite build` → 41 modules, JS **168.38 kB** (53.79 kB gzip), CSS 9.61 kB, 525 ms |
| Raw-socket HTTP/0.9 transport, one serialised queue, gap floor, retries | **real** | `kohler-client.mjs`; every call goes through `enqueue()` |
| Safety gate refuses > 2/5 before a packet is sent; table self-checks at import | **real — measured** | `cgi-safety.mjs`; `exposedEndpoints()` = 18 of 56, `MAX_RISK = 2` |
| `values.cgi` 30 s cache; `system_info.cgi` always live | **real** | `middleware.mjs:40,74-91,129-155` |
| Valve-dropout guard ("must say so twice") | **real, and measured defeated 12 times** | `middleware.mjs:92-119`; 12 `ACCEPTED` lines in `egress.log` |
| Egress trace: REQ/RES/ERR/CACHE/GUARD/NOTE, correlation ids, rotation, never throws | **real** | `trace.mjs`; `trace.test.ts`, 14 tests, including "it cannot break the shower" |
| Command path proven end to end including opening a valve | **real** | `egress.log:1360-1361` `quick_shower.cgi … ok 24ms 2B body=":)"`, then four accepted temperature changes |
| `DTV_TRACE=0` is a safe kill switch | **claimed — and false** | `trace.mjs:71` reads the flag, but setting it fails 12 of 85 tests (measured today) |
| State `DIFF` lines in the trace | **aspirational** | `trace.mjs:42`, `:131` name the kind in comments; no emitter exists |
| Phone-readable log viewer served by the proxy | **aspirational** | `middleware.mjs:125-173` — four routes, none serve the log |
| Server-side temperature clamp | **does not exist** | the proxy forwards `params` unclamped; the clamp is UI-only (`useShower.ts`) |
| Steam / lighting / rain panel; second valve | **claimed** | `DESIGN.md:207-214`; none installed on this system |
| Android/Capacitor port; preset saving; massage speed; PWA | **aspirational** | `DESIGN.md:202-216` declares all four as known gaps |

### 3.2 `viewer/` — the parts viewer

| Claim | Label | Evidence |
| --- | --- | --- |
| 164 unit tests, 10 files | **real — measured** | `npx vitest run` in `viewer/` → 164 passed, exit 0 |
| Typecheck clean | **real — measured** | `npx tsc --noEmit` exit 0 |
| Renderer-free core: declared-unit STL writer, mesh stats, weld/cap/seam repair, decal maths | **real** | `viewer/src/core/*.ts`; no `three` import in core |
| Export gate re-derives the envelope from the exported bytes | **real — not re-run today** | `viewer/scripts/verify-exports.ts`; needs `vite-node` and the vendored OBJ, both present |
| Catalog contract aligned with Maker Galaxy `models.json` plus `sourceUnit` / `sourceUpAxis` | **real here; nothing graduated** | `grep -rl sourceUnit e:/git/mg-web/src` → no matches, unchanged from 08-29 |
| View gizmo "on a path into Maker Galaxy" | **claimed, now 89 days stale** | no `viewGizmo` / `gizmoDrag` / `cameraTween` anywhere in `mg-web/src`; no viewer commit since 2026-08-04 |

### 3.3 The investigation — the tree versus the trace

| Claim | Label | Evidence |
| --- | --- | --- |
| I2 resolved: interface reconnected, Kohler contacted, ~$2013 quoted | **real — recorded** | `INVESTIGATIONS.md:500-518` |
| "We caused both hangs"; load is the whole mechanism | **contradicted, 88 days and counting** | `STORY-LOG-INDEX.md` entry *2026-08-04 23:05*. `egress.log` then shows 8 consecutive guard defeats on 08-05 at **408–415 s** spacing under single-client idle polling, and 3 more on 08-11. `AGENT.md:68` says a wrong entry is overturned by a new one; no such entry exists |
| E11 "measure the natural rate" needs a week of running | **already answerable from the file on disk** | `INVESTIGATIONS.md:596-600` pre-states both branches. The trace fires the second: short reads with **normal latency** appear — 11 of the 12 defeats arrive in 169–178 ms — so "truncation is real and separate" from the hang |
| E2 (ordinary shower, interface back) not run | **apparently run 2026-08-11, unrecorded — inference** | `egress.log:1331-1361`: `valve1_outlet=3` (handshower alone) attempted 22:16:23Z, two 12 s timeouts, accepted 22:17:42Z — **79 s to start**; temperature 86→96 °F by 22:19; `system_info.cgi` polled 448 times through 22:48:48Z with no `stop_shower` REQ. The log simply **ends** there, so ≥ 31 minutes is a floor on what the controller reported, not a confirmed run length |
| Shutoff writes nothing to the controller log; valve flags are transient | **real** | `INVESTIGATIONS.md:190-260`, unchanged |
| "One bad read in 30-50" | **claimed, and known wrong in mechanism** | `FIELD-NOTES.md:251` self-labels it rough; `INVESTIGATIONS.md` I3 supersedes the explanation; the doc still carries it, 97 days |
| The story log is well-formed | **real — measured** | `storylog verify .` → **0 errors, 1 warning** (`STORY-LOG.md:41` has no `**Why it matters:**` line) |

### 3.4 `cnc/` — the physical repair

Unchanged: 12 files, no README, no record of which cover revision is installed. `I2` says "TPU
rear cover printed and installed 2026-07-29" without naming the STL. **real, still undocumented.**

### 3.5 What the one commit in this window did

`5d83023` (2026-10-08) does three things and discloses the fourth it did not do. It removes the
XMP GPS chunk from `Images/KohlerBoardOverall.webp` losslessly (pixels identical), reorders
`STORY-LOG.md` oldest-first with a generated `STORY-LOG-INDEX.md`, and rewrites `AGENT.md`'s
story-log section for storylog v0. Its own message states the consequence it leaves open: *"The
old bytes remain in history and on GitHub until the owner decides whether to rewrite it."*

Verified: `git show 5d83023^:Images/KohlerBoardOverall.webp` still contains an `exif:GPS` chunk;
the introducing commit `05ebb49` (2026-07-26) is an ancestor of `origin/master`; and `HEAD`
equals `origin/master`, 0 ahead and 0 behind. The bytes are live on a public remote and have
been for **97 days**.

## 4. Ambition vs implemented reality — the gaps

Ordered by how much they matter.

### 4.1 Three artifacts, all outside git, holding the project's newest knowledge — **silent-failure, 63 days old**

`app/.trace/egress.log` is gitignored on purpose (`app/.gitignore:11-13`: captures worth keeping
get copied into `research/diagnostics/` by hand). One capture was copied, on 2026-08-04 — the
first 199 lines. The other ~1,800 lines have never been copied, and `research/diagnostics/` still
holds exactly four files, newest 2026-08-04.

What makes this different from the 08-29 reading is that the analysis now *exists* and is also
outside git. `git status` has held the same four untracked paths for 63 days:

| Untracked path | Written | Holds |
| --- | --- | --- |
| `docs/state/2026-08-29-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md` | 2026-08-29 | the whole second snapshot |
| `research/scout/kohler-dtv-plus-work-scout-v2.json` | 2026-08-29 | 11 framed candidates |
| `research/scout/kohler-dtv-plus-work-scout-v2.md` | 2026-08-29 | the readable form |
| `research/scout/kohler-dtv-plus-portfolio-card.json` | 2026-08-29 | the portfolio entry |

So the mechanism the portfolio inventory keeps finding — *hygiene work ends at the gate, before
`git add`* — has run here twice: once on the evidence, once on the analysis of the evidence. One
`git clean -xdf`, or one disk, takes both. **This is the on-fire item that one operator action
fixes**, and the action needs no decision: copy the 08-05 and 08-11 windows into
`research/diagnostics/` with dates in the filenames, and `git add` four files.

The measurement is worth restating, because it is the most load-bearing unrecorded fact in the
project and because I got a different number than the prior snapshot:

| Anchor | 08-29 figure | Measured today | Note |
| --- | --- | --- | --- |
| Spacing of consecutive guard defeats, 08-05 | ~366 s (anchored on stall onsets) | **415, 408, 411, 415, 408, 411, 415 s** — mean 411.9, range 408–415 | 7 intervals, 8 events, one client, idle cadence |
| Same, 08-11 | 365 / 393 / 379 / 803 s | **417 / 425 / 808 s** | 808 ≈ a doubled cycle |
| Defeats in the file | 12 | **12** | agrees |
| `SHORT` flags / `ERR` lines in the file | — | **83 / 88** | new |

Both readings say *periodic*; they disagree on the number because they anchor on different
events. Nothing is in `INVESTIGATIONS.md` yet, so no reader has been misled — but a ~412-second
cycle generates different hypotheses than a 366-second one, and whoever writes it down must say
which anchor they used. Mechanisms worth recording before they are forgotten: the Konnect module
phoning home; an MQX housekeeping task; the controller's own DHCP or NTP cycle. None tested.

This also re-opens I1's symptom description from a direction nobody has written down: during a
stall the app's commands time out, and the 08-11 start took 79 s. A stall coinciding with a real
shutoff would look, from the app, exactly like "the controller still says running, then stops
answering" — which is I1's symptom. That is inference, and it is the clearest argument for the
state-`DIFF` half of W4.

### 4.2 GPS coordinates are still in public history, and the decision lives in another repo — **irreversible-if-wrong, 23 days since it was named**

`5d83023` fixed the working tree and said plainly it had not fixed the history. The owner
decision *is* tracked — in `e:/git/storylog/BACKLOG-INDEX.md` as **S20, "Decide the Kohler
history purge"**, `Who = dec`, status ⬜, checked 2026-10-18. It was not tracked here, and until
this sweep this repo had no `BACKLOG-INDEX.md` at all, so a planner reading *this* repo could not
see it. The owner says the coordinates are not theirs (2026-11-01); it is described and never reproduced in any
artifact this sweep writes.

Two honest halves. The rewrite-and-force-push is a real cost on a public default branch, and it
does not reach clones, forks or caches that already have the blob. "Accept it" is a legitimate
answer the owner is entitled to pick. What is not legitimate is the current state: open,
undecided, and recorded only where this repo cannot see it.

### 4.3 The guard is defeated every stall; the fix has been specified for 88 days — **silent-failure, unchanged**

`INVESTIGATIONS.md:574-586` (E9) states the rule and why it was deliberately not shipped with the
trace: distrust a valve-loss payload that is *short relative to the session maximum* **or** *slow
relative to the ~175 ms norm*, instead of counting repetitions. The trace then recorded the
failure 12 times, and its data says the new rule is right and the old one cannot work: 11 of 12
accepted payloads were **fast** (169–178 ms) and short, so "slow alone" would miss them.

Each acceptance puts a ~300-key payload into the 30 s cache and makes `buildValve()` report a
healthy valve absent to whoever is looking. On 2026-08-11 that happened at 22:17:23Z, within a
minute of the operator's shower starting. The defect itself dates to 2026-07-26 (`git blame` →
`c8cefc13`): **97 days**.

### 4.4 Doc rot: four documents from the 07-26 world, plus one the 10-08 commit created — **doc rot, worse**

The premise rot is the one that matters. `README.md:18-19`, `DESIGN.md:11-13` and
`PROTOCOL.md:199-201` present `num_interface = 0` as the live state of the system, and
`INVESTIGATIONS.md:518` has recorded `num_interface = 1` since 2026-08-04. A reader arriving at
this public repo is told the fault the project exists to work around is still present. It is not.

The rest, all measured today: `DESIGN.md:165` 49 tests → 85; `viewer/README.md:87` 88 → 164;
`DESIGN.md:204-206` "no valve has been opened by this app yet" → `egress.log:1361` disagrees;
`selftest.mjs:179` "none seen — expected on this system"; `FIELD-NOTES.md:251` "one bad read in
30-50". And the new one: `README.md:40` describes `STORY-LOG.md` as "newest first" 23 days after
`5d83023` made it oldest-first and rewrote `AGENT.md:64-65` to say so. The same commit did not
add `STORY-LOG-INDEX.md` to the README's reading table, although `AGENT.md:62-63` now makes the
index the first thing a reader should open.

This is the cheapest gap in the document and the one a public audience hits first.

### 4.5 The story log stopped 88 days ago and its own triggers have fired since — **drift**

`AGENT.md:50-60` lists when to append. Since the last entry (2026-08-04 23:10) three listed
triggers have fired and none produced an entry:

1. *"A hypothesis is killed, and by what evidence"* (`:53`) — the 08-29 analysis overturned "we
   caused both hangs". `AGENT.md:68` is explicit that a wrong entry is overturned by a new one,
   never edited. No such entry exists.
2. *"We get something wrong and correct it — **especially then**"* (`:58`) — a public repo
   published the owner's coordinates for 74 days before `5d83023` caught it. That is precisely
   the kind of self-correction the convention exists for, and it is the one event in this window.
3. *"A physical action is taken on the hardware"* (`:55`) and *"Kohler support is contacted"*
   (`:56`) — the fabrication week (2026-07-28 → 07-31) and the 2026-07-27 support call, both
   still missing (W3). The footage is no longer the blocker: `inferiere` has had a two-chapter
   deliverable descriptor for it since 2026-07-31, which **corrects** the prior snapshot.

The format side of the convention is in good shape — `storylog verify .` exits 0 with one
warning — which makes the content silence the more conspicuous.

### 4.6 The stated public purpose has no artifact after 97 days — **blocked decision**

`AGENT.md:10-13` says the work is heading for a YouTube video and may be shared with Kohler
technical support. Evidence that the first is underway lives entirely in `inferiere`; evidence of
the second is fifteen **For Kohler:** lines — thirteen entries in `STORY-LOG.md` and two in
`INVESTIGATIONS.md` (`:525`, `:676`) — which `STORY-LOG.md:7` and `AGENT.md:67` both say "get collated
when we contact them" and which have never been collated. Neither has an owner, a date or a
scored proposal in any repo this sweep read. This is a planning gap, not a defect, and it is the
one candidate that belongs to the portfolio rather than to this repo (W20).

### 4.7 Spec-compliant deferrals — not drift

`DESIGN.md:202-216` still declares presets, massage speed, the second valve and the PWA as
deferred, and `DISCLAIMER.md`'s rating policy is intact. The viewer is a paused prototype, not
rot: no commits since 2026-08-04, and its Maker Galaxy graduation is a decision that lives in
`mg-web`.

## 5. Age and activity

| Period | What moved |
| --- | --- |
| 2026-07-26 (34 commits) | Everything foundational |
| 2026-07-27 → 08-04 | Viewer, mesh repair, gizmo; the physical repair; the doubled-command fix; the egress trace |
| 2026-08-05, 08-06, 08-11 (no commits) | The app was run — 1,998 trace lines; a real shower on 08-11 |
| 2026-08-20 | `wip: snapshot before vacation handoff` |
| 2026-08-29 (no commit) | A scout read the trace and wrote four files nobody added |
| 2026-10-08 | GPS strip; storylog v0 migration |
| 2026-10-09 → 10-31 | Nothing. 23 quiet days; 81 days since the app was last run |

**In flight:** nothing; `git status` shows four untracked files and no modifications.
**Paused:** everything.
**Never started:** E1, E3, E10; the state trace; the log viewer; the licence ask; the Kohler
collation; the `cnc/` README.
**Done but unrecorded:** E2 (inferred); E11's first-pass answer; the periodic-stall measurement.

**The oldest load-bearing thing nobody has revisited** is `research/FIELD-NOTES.md` — one commit,
2026-07-26, **97 days** — and its §6 figure is known wrong in mechanism while the middleware
comments still cite the file as justification. Second is `PROTOCOL.md`: one commit, required
reading, carrying the dead premise.

**Assumptions that have now expired rather than merely aged:**

| Assumption | Written | Age | Why it expired |
| --- | --- | --- | --- |
| "Does the repair hold? … Worth re-checking after some months" (`INVESTIGATIONS.md:522-524`) | 2026-07-29 | **94 d** | "Some months" has elapsed. An FDM-printed part gasketed into a shower wall, and nothing in the repo will ever fire this check (W18) |
| "Last full sweep: **2026-07-26**" (`research/SOURCES.md:6`) | 2026-07-26 | **97 d** | The file's whole purpose is a periodic sweep; the 08-29 scout correctly declined to promote it at 34 days (W19) |
| OpenMakerLicense draft, vendored at `543803f` | 2026-01-08 upstream | 296 d | Checked: canonical unchanged, so no drift — but still a draft governing a public repo (W9) |
| `three ^0.184`, `vite ^6`, `vitest ^2`, `react ^18.3` | 2026-07-26 | 97 d | Young for these pins. Not a finding |

**The repo's own age is context that changed a rule this cycle.** The 2026-08-29 snapshot could
not meet the ledger's ≥90-day quota and said so honestly: the repo was 34 days old in substance.
It crossed 90 days on **2026-10-24**. This ledger meets the quota — 10 of 15 candidates have a
last substantive touch of 94 days or more — and that is not an improvement in anything. It is
the plain statement that two thirds of what is wrong here has been wrong since the first week and
has now survived two ledgers.

## 6. What is next — the project's answer, tested

The documents say: E1 high-flow shower, then E6 telemetry (`INVESTIGATIONS.md:111-175`); the
observability brief says build the state trace and the phone viewer next
(`research/PROMPT-observability.md`, step 5). Both are still credible, and both are still second.

**The first session back is about twenty minutes of git and typing, with no water and no code:**
copy the 08-05 and 08-11 trace windows into `research/diagnostics/`, `git add` the four untracked
files, and write the periodic stall and the 08-11 shower into `INVESTIGATIONS.md` I3 and I1 with
a story-log entry overturning "we caused both hangs". That converts 63 days of orphaned analysis
into project knowledge and closes the only data-loss path in the repo. **Then** the owner
decision on the GPS history. **Then** E9 — small, fully specified, with the trace's own data
proving the rule. **Then** the state trace, so the next shower's end is recorded. **Then** E1,
which is the only item on this list that moves water and therefore the only one that needs
in-the-moment consent. The YouTube and Kohler-collation questions are portfolio decisions, not
dev work, and they should not be allowed to look like dev work.

## 7. Cross-project relationships

| Sibling | Relationship | Verified today | Divergence a planner must not paper over |
| --- | --- | --- | --- |
| `e:/git/storylog` | **New since 08-29.** Owns the story-log format this repo adopted on 2026-10-08 (`AGENT.md:64`), and carries this repo's GPS decision as **S20** | Active — commits dated 2026-10-31; `SPEC.md` and `BACKLOG-INDEX.md` present; its closed row S05 is "Migrate Kohler-DTV-Plus" | This repo's only open owner decision is recorded in *storylog's* backlog. Whoever reads one and not the other sees half the state |
| `e:/git/inferiere` | Intended consumer of the fabrication footage | `apps/web/scripts/gate-b10.ts:9-12,247` — a committed two-chapter "Kohler Shower Diagnosis (B10 field test)", 2026-07-31 | The 08-29 snapshot said inferiere references nothing. It was wrong. The dependency is recorded there and still not here |
| `e:/git/craftcraft-private` | Pipeline registry; `pipeline/repos.json` lists this repo with `backlog: ../Kohler-DTV-Plus/BACKLOG-INDEX.md` | That file did not exist until this sweep, so the repo was `unindexed` in N-Star | A row's `Item` cell is the scoring unit (`nstar/CONTRACT.md` §1.3): re-wording a row re-scores it. Do not tidy this index |
| `e:/git/mg-web` (Maker Galaxy) | Viewer catalog contract aligned with `models.json`; gizmo "on a path in" | `sourceUnit` absent from `mg-web/src`; no gizmo, drag or tween files | Nothing has crossed the border in 89 days. When it does, `sourceUnit` / `sourceUpAxis` must cross with it or the viewer's core guarantee is lost |
| `e:/git/mg-controller` | `DESIGN.md:178-200` models the Capacitor port on `apps/android-cap` | Directory present | HTTP/0.9 means a Node proxy stays on every platform. Copying the Capacitor config without it yields an app that cannot talk to the hardware |
| `e:/git/OpenMakerLicense` | `LICENSE.md` vendored | Canonical unchanged since 2026-01-08 | Still a draft; still the terms a public repo publishes under |
| `e:/git/llm-fab` | `research/scout/B01-strictmode-double-command.md` uses its BATCH-DEV PCFIRG format | This repo has no `fab.json` | A batch plan here was executed inline. The plan file still says "drop into whichever run adopts it" and none did |
| `e:/git/sig-wb` | Produces these scout artifacts | This doc | The method names output `<repo>-work-scout-vN`; this repo's existing files are lower-case `kohler-dtv-plus-*`, and that spelling is kept so "overwrite the card" overwrites rather than forks |
| Upstream, not portfolio: `xagon0`, `dcmeglio`, `niemyjski`, `timelery` | Vendored; cited; forked-from | `SOURCES.md` not swept in 97 days | Two of the three vendored bodies state no licence (W9) |

One vocabulary divergence to hold, unchanged and now measured on both sides: **"stall"** (this
doc and the trace: ~20 s, self-recovering, recurring every ~412 s) versus **"lockup"**
(`FIELD-NOTES.md` §1: hours, needs a power cycle). They may be one mechanism at two severities or
two unrelated things. Do not merge them in prose until something measures the link.

## 8. Reading list + authority chains

For a fresh agent, in order:

1. `DISCLAIMER.md` — always first.
2. `AGENT.md` — the contract; its story-log section was rewritten 2026-10-08.
3. `STORY-LOG-INDEX.md`, then entries by line range (`AGENT.md:62-63`). Never the whole log.
4. **`app/.trace/egress.log`** if present on the operator's machine — before `INVESTIGATIONS.md`,
   because it is 81 days newer than the narrative. Read `trace.mjs:1-53` first for what the
   columns mean and `:26-28` for what the file cannot see.
5. `INVESTIGATIONS.md` — I3 then I1; know that I3's "load is the whole mechanism" predates the
   file above, and that E11's answer is already inside it.
6. `research/FIELD-NOTES.md` — before changing polling, commands or state handling; know §6 is
   superseded by I3.
7. `DESIGN.md`, `FLOW.md`, `PROTOCOL.md` — architecture, request path, wire format; know the
   stale lines in §4.4.
8. `research/PROMPT-observability.md` — only for telemetry work; step 4 done, step 5 not.
9. `viewer/README.md` — only if touching the viewer.
10. `BACKLOG-INDEX.md` — what is open and who owns it; detail lives in the source each row cites.

### Who wins when two disagree

| Area | Authority | Beaten by |
| --- | --- | --- |
| What is reachable on the controller | `app/server/cgi-safety.mjs` (self-throwing table) | `GET /api/safety` live; `PROTOCOL.md` / `README.md` / `DISCLAIMER.md` are downstream prose and behind |
| What the controller *did* | `app/.trace/egress.log` and dated copies in `research/diagnostics/` | Nothing — except that absence of a `REQ` line proves nothing about other clients (`trace.mjs:26-28`) |
| What we *believe* about the fault | `INVESTIGATIONS.md` status lines | A newer trace; the story log for when and why a belief changed |
| The project's narrative | `STORY-LOG.md`, oldest first, with `STORY-LOG-INDEX.md` as the map | Never edited — a wrong entry is overturned by a newer one (`AGENT.md:68`) |
| Wire format | `PROTOCOL.md`, then `research/controller-mirror/js/` | The controller itself over xagon0 where they conflict |
| Timings | `useShower.ts` / `middleware.mjs` / `kohler-client.mjs` constants | `FIELD-NOTES.md` §1 is the justification and must move with them; the `FLOW.md` table is a mirror |
| Units, geometry | viewer catalog declarations + `npm run verify` | Measurement over spec sheet; the K-99694 drawing over the K-99693 sheet on orientation |
| Licensing | `LICENSE.md` scope table | Canonical OpenMakerLicense; "upstream states no licence" beats everything |
| Test counts, endpoint counts | `npm test` output; `exposedEndpoints()` | Every doc that quotes a number |
| What is open, and who owns it | `BACKLOG-INDEX.md` | The cited source for detail; `storylog` S20 for the GPS decision until it is mirrored here |

## 9. Reusable inventory

The machine-readable form, with `reuseMode`, coupling and maturity per item, is
`research/scout/kohler-dtv-plus-portfolio-card.json`. Unchanged in substance from 2026-08-29 — no
code moved in this window — with one correction: the story-log convention is no longer this
repo's own invention. It is `e:/git/storylog`'s `SPEC.md`, and `AGENT.md:44-72` is now an
*application* of it. Take it from storylog, not from here.

**Best three things to steal**

1. **The three-homes investigation pattern** (`INVESTIGATIONS.md:13-76`) — present tense in
   INVESTIGATIONS, past tense in the story log, raw evidence in `research/diagnostics/`, with
   experiments that pre-state both outcomes *before* being run. Suits any multi-session debugging
   or repair project.
2. **The self-throwing risk-rated allowlist plus the read-only selftest shape**
   (`app/server/cgi-safety.mjs`, `app/src/api/__tests__/safety.test.ts`,
   `app/scripts/selftest.mjs`) — anything driving unauthenticated or fragile hardware. 18 of 56
   endpoints reachable, enforced at import, pinned by a test.
3. **The egress trace** (`app/server/trace.mjs` plus 14 tests) — fixed-column greppable lines,
   correlation ids, a `CACHE` line so silence is never mistaken for confirmation, a header that
   states what the file *cannot* see, and a test asserting it cannot break the thing it watches.
   The whole of §4.1 is downstream of that one file, which is the argument for building it.
