# Kohler DTV+ — Work Ledger v3

Generated **2026-10-31** by `claude-opus-5` from [docs/state/2026-10-31-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md](../../docs/state/2026-10-31-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md) — read that first; this file does not repeat it.

Machine-readable twin: `research/scout/kohler-dtv-plus-work-scout-v3.json`. Prior ledger: `research/scout/kohler-dtv-plus-work-scout-v2.json` (2026-08-29, still untracked — see KDTV-W15). Scored rows for the portfolio board live in `BACKLOG-INDEX.md`.

**This ledger does not score and does not implement.** It establishes what is true, frames each
candidate as PCFIRG, routes it, and stops.

## Repo activity

| Last commit | Quiet days | App last run | In flight |
| --- | --- | --- | --- |
| 2026-10-08 | 23 | 2026-08-11 | nothing |

Paused, and paused differently than on 2026-08-29. One commit landed in 63 days (5d83023, housekeeping: GPS strip plus a storylog v0 migration). git status has shown the same four untracked scout artifacts for 63 days, HEAD equals origin/master, and the app has not been run in 81 days. Measured today: 85 app tests and 164 viewer tests pass, both typechecks and the app build are clean. Nothing in the 2026-08-29 ledger was acted on.

## Candidates at a glance

| # | Candidate | Shape | Age | Route | Cost of delay (first clause) |
| --- | --- | --- | --- | --- | --- |
| 1 | **KDTV-W15** 🔥 Sixty-three days of hardware evidence and the only analysis of it both live outside git | silent-failure | 63 d (2026-08-29) | `just-do-it` | High and asymmetric |
| 2 | **KDTV-W16** 🔥 GPS coordinates are still in the public git history, and the decision is recorded in another repo | irreversible | 23 d (2026-10-08) | `just-do-it` | The exposure itself is already 97 days old and another quarter changes little about the bytes |
| 3 | **KDTV-W11** A ~412-second periodic controller fault is measured in the trace and recorded nowhere, while the story log still blames load | untested-assumption | 87 d (2026-08-05) | `just-do-it` | Every session that reads INVESTIGATIONS |
| 4 | **KDTV-W10** The values.cgi valve-loss guard is defeated on every stall and the replacement rule has been specified for 88 days | silent-failure | 97 d (2026-07-26) | `batch` | Low in water terms — the UI blanks for 30 s and recovers — and high in evidence terms: every future trace stays ambiguous about whether a valve loss was real, which is the one question I1 exists to answer |
| 5 | **KDTV-W4** The state-diff trace and the phone log viewer are the unbuilt half of the telemetry brief, and the built half shows why they are needed | dormant-decision | 88 d (2026-08-04) | `batch` | Moderate |
| 6 | **KDTV-W8** The front page of a public repo states the fault this project works around is still present, and the one commit in 63 days added a fresh contradiction | doc-rot | 97 d (2026-07-26) | `just-do-it` | Low operationally, real reputationally |
| 7 | **KDTV-W13** Every dev page load sends four requests to hardware documented as fragile, and the proxy forwards reads the browser already abandoned | silent-failure | 97 d (2026-07-26) | `batch` | Low in itself |
| 8 | **KDTV-W14** npm test writes into the operator's live evidence file, and the documented way to stop it breaks twelve tests | silent-failure | 72 d (2026-08-20) | `just-do-it` | Low, and it accrues one line per test run |
| 9 | **KDTV-W5** A degraded or absent values.cgi makes the model declare the system Fahrenheit and its ceiling 113 | silent-failure | 97 d (2026-07-26) | `batch` | Nothing much for this shower |
| 10 | **KDTV-W18** The repair's own re-check is 94 days overdue and nothing in the repo will ever fire it | aging-assumption | 94 d (2026-07-29) | `just-do-it` | Unknown, which is the problem |
| 11 | **KDTV-W19** The monitoring index whose purpose is a periodic sweep has not been swept in 97 days | aging-assumption | 97 d (2026-07-26) | `just-do-it` | Low per quarter and compounding: the longer the gap, the larger the diff and the more likely a relevant finding is read as old news |
| 12 | **KDTV-W9** A public repo redistributes three unlicensed third-party bodies and a manufacturer's CAD under a licence labelled Draft | irreversible | 97 d (2026-07-26) | `just-do-it` | Nothing much most quarters, and a step change the moment the repo gets attention — which is the explicit plan, since the work is heading for a public video |
| 13 | **KDTV-W3** The week that justifies this project is missing from the story log, and the footage has been sitting processed in a sibling repo since July | drift | 95 d (2026-07-28) | `just-do-it` | The detail keeps leaving |
| 14 | **KDTV-W1** The cheapest experiment that could settle the leading hypothesis has been specified and unrun for 97 days | blocked-decision | 97 d (2026-07-26) | `just-do-it` | High in information terms |
| 15 | **KDTV-W20** The repo's stated public purpose has no owner, date or artifact after 97 days | blocked-decision | 97 d (2026-07-26) | `scored-proposal` | Nothing operationally |

🔥 = `onFire`: one operator action prevents a loss or an exposure.

**Anti-recency quota:** 10 of 15 candidates have a last substantive touch older than ~90 days — **met**.

Met for the first time in this repo's three ledgers, and the reason is the calendar rather than better attention: the repo's substantive history begins 2026-07-26 and crossed 90 days on 2026-10-24. The 2026-08-29 ledger reported 0 of 11 and explained why honestly. Ten of fifteen candidates now have a last substantive touch of 94 days or more, and seven of those ten were already in the 2026-08-04 or 2026-08-29 ledger and were not acted on. No item was promoted to fill the quota; W18 and W19 are the only two admitted on age alone, and both expired against dates written in the repo itself ('after some months'; 'last full sweep').

---

## The candidates

### KDTV-W15 · Sixty-three days of hardware evidence and the only analysis of it both live outside git — 🔥 **on fire**

`silent-failure` · last substantive touch **2026-08-29** (63 days) · route **`just-do-it`**

```text
Problem: The project's newest hardware evidence and the only written analysis of it are both outside git: app/.trace/egress.log is gitignored and 1,998 lines exist in one copy, and `git status` has shown the same four untracked scout artifacts for 63 days.
Cause: The trace is gitignored by design and keepers are copied by hand; the 2026-08-29 sweep wrote four files and stopped at the `git add` gate, which is the same mechanism the portfolio inventory keeps finding in other repos.
Fix: Copy the 2026-08-05 and 2026-08-11 windows into research/diagnostics/ with dates in the filenames, then `git add` the four untracked paths and commit.
Impact: Sixty-three days of analysis and the single copy of the evidence behind it stop being one `git clean -xdf` away from gone.
Risk: A committed trace publishes the controller's LAN host and the poll cadence to a public repo; the 2026-08-04 capture already does, so scrub or accept that deliberately rather than by default.
Goal: `git status` is clean and research/diagnostics/ holds dated copies of both trace windows.
```

**What its age means.** Sixty-three days is how long the repo has been one command away from preserving its own newest knowledge and has not run it. The age is the finding: nothing else happened in that window.

**Why this route.** No decision, no code, no hardware — two `cp` commands and a `git add`. It costs more to plan than to do, and every other candidate's evidence depends on the file surviving.

**Steelman against.** The operator may intend to prune the trace before committing it, and committing a scout's analysis of a file the operator has not read themselves puts an agent's reading into the record ahead of the owner's. Both are arguments for ordering, not for leaving it untracked.

**Cost of delay.** High and asymmetric. Nothing degrades gradually; one `git clean -xdf`, one reinstall or one disk takes the only copy of the evidence for the periodic stall, the 08-11 shower and twelve guard defeats. There is no second capture because the app has not run in 81 days.

**Evidence.** `app/.gitignore:11-13`; `app/.trace/egress.log:1-1998`; `research/diagnostics/ (4 files, newest 2026-08-04)`; `docs/state/2026-08-29-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md:1-10 (untracked)`; `research/scout/kohler-dtv-plus-work-scout-v2.json (untracked)`

### KDTV-W16 · GPS coordinates are still in the public git history, and the decision is recorded in another repo — 🔥 **on fire**

**Closed 2026-11-01:** owner ruling: GPS photo purged from history and force-pushed. Do not raise again.

`irreversible` · last substantive touch **2026-10-08** (23 days) · route **`just-do-it`**

```text
Problem: The pre-5d83023 blob of Images/KohlerBoardOverall.webp still carries an exif:GPS chunk and is reachable from origin/master on a public GitHub repository.
Cause: 5d83023 removed the chunk from the working tree only and said so in its own message; the history decision was deferred and is tracked in a sibling repo's backlog (storylog S20), so a reader of this repo cannot see that it is open.
Fix: Take the decision — rewrite history and force-push, or record 'accepted, and why' in this repo — and either way append the story-log entry AGENT.md:58 requires for a mistake that got corrected.
Impact: Either the owner's premises stop being derivable from the public repo, or the repo stops implying the question is still being worked.
Risk: A force-push on a public default branch breaks existing clones and does not reach forks or the host's own caches, so a support request may be needed to finish the job.
Goal: No blob reachable from this repo's public history carries GPS metadata, or a dated line in this repo records that the exposure was accepted and on what reasoning.
```

**What its age means.** The decision is 23 days old; the exposure is 97. The gap between those two numbers is the finding — the fix commit named the problem and then the clock started again.

**Why this route.** One owner decision followed by either a short mechanical job or one line of writing. It is not a study: both options and their costs are already known.

**Steelman against.** Rewriting a public default branch has real costs and reaches neither forks nor caches, so 'accept it' may well be the right answer — and the photo is of a circuit board, not a front door. The candidate is for the undecidedness, not for a particular outcome.

**Cost of delay.** The exposure itself is already 97 days old and another quarter changes little about the bytes. What it costs is that the repo's own safety convention (AGENT.md:71) is on record being broken with no resolution, in a repo written to be read by outsiders.

**Evidence.** `git show 5d83023^:Images/KohlerBoardOverall.webp (exif:GPS present)`; `git log 5d83023 (commit body: 'The old bytes remain in history and on GitHub')`; `git merge-base --is-ancestor 05ebb49 origin/master (true)`; `AGENT.md:71`; `AGENT.md:58`; `e:/git/storylog/BACKLOG-INDEX.md:13 (S20, Who=dec, status open)`

### KDTV-W11 · A ~412-second periodic controller fault is measured in the trace and recorded nowhere, while the story log still blames load

`untested-assumption` · last substantive touch **2026-08-05** (87 days) · route **`just-do-it`**

```text
Problem: STORY-LOG.md's 2026-08-04 23:05 entry states 'we caused both hangs', and the trace shows twelve guard defeats whose spacing on 2026-08-05 is 408-415 s under single-client idle polling.
Cause: The evidence arrived 18 days after the narrative and 81 days before anyone wrote it down; INVESTIGATIONS.md has no hypothesis for a periodic fault and E11 is still marked unrun although the file on disk answers it.
Fix: Add a periodic-fault hypothesis to I3 with the measured spacing and its anchor, mark E11 answered on its 'short reads with normal latency appear' branch, add the 08-11 shower to I1 as E2-apparently-run, and append one story-log entry overturning the 08-04 claim.
Impact: I3's leading mechanism moves from load-induced to periodic, which changes what E1 and E10 are testing and makes a stall a candidate explanation for I1's symptom.
Risk: Two readings of the same file disagree on the period — ~366 s anchored on stall onsets, ~412 s anchored on guard defeats — so writing one number without its anchor would mislead the next reader.
Goal: I3 carries a periodic-fault hypothesis with its measurement and anchor, E11 is marked answered, and the story log has an entry overturning 2026-08-04 23:05.
```

**What its age means.** The measurement is 87 days old and has been written down twice, both times outside the files a reader of this repo would consult. Age here measures how long a wrong belief has had the floor unchallenged.

**Why this route.** The analysis is done twice over; what is missing is three paragraphs in two files and one story-log entry. No new capture, no hardware, no code.

**Steelman against.** Both existing measurements come from one scout reading one gitignored file, and the confounders are untested: a browser tab left open on the controller's own page, or a second LAN client, would not be visible in an egress-only trace. Writing 'periodic' into I3 promotes an inference to a hypothesis on single-source evidence — which is exactly why it should be written as a hypothesis with its anchor, not as a finding.

**Cost of delay.** Every session that reads INVESTIGATIONS.md inherits the wrong mechanism and plans the wrong experiment. The trace also only survives while the file does (W15), so a quarter of delay risks losing the basis for the correction entirely.

**Evidence.** `app/.trace/egress.log:228,321,412,503,594,685,776,867 (08-05 ACCEPTED lines)`; `app/.trace/egress.log:1353,1579,1781,1873 (08-11 ACCEPTED lines)`; `INVESTIGATIONS.md:588-600 (E11, both branches pre-stated)`; `INVESTIGATIONS.md:553-571 (E8 result: 'everything degraded tonight followed load we generated')`; `STORY-LOG-INDEX.md (entry 2026-08-04 23:05)`; `AGENT.md:68`

### KDTV-W10 · The values.cgi valve-loss guard is defeated on every stall and the replacement rule has been specified for 88 days

`silent-failure` · last substantive touch **2026-07-26** (97 days) · route **`batch`**

```text
Problem: Twelve payloads that drop a healthy valve were accepted in 1,998 trace lines, each one entering the 30 s cache and reporting the valve absent and its outlets unconfigured to whoever was looking — once within a minute of the operator's shower starting.
Cause: middleware.mjs:92-119 requires a loss to be reported twice before disbelieving it, and the degraded payload arrives twice; the guard is additionally disarmed on the first read after any process restart because lastGood starts null.
Fix: Implement E9 as specified: distrust a valve-loss payload that is short relative to the session maximum or slow relative to the ~175 ms norm, both properties of a single sample, instead of counting repetitions.
Impact: The proxy stops manufacturing the exact signature the shutoff investigation is hunting, so a future trace showing a valve loss means something.
Risk: A stricter guard can mask a real dropout; every rejection has to stay traced or a genuine loss becomes invisible instead of merely wrong.
Goal: A session reproducing the 08-05 stall pattern produces zero `ACCEPTED valve-loss` lines, and each rejection appears as a GUARD line.
```

**What its age means.** The twice-rule dates to the repo's first week and the fix to its fifth. Ninety-seven days means the defect predates every piece of evidence that proves it, which is why nobody experienced it as a regression.

**Why this route.** Implementation work, fully specified, with a pass condition expressible as a command and an exit code: replay the stall pattern, assert no ACCEPTED lines. The PCFIRG header above is the batch header.

**Steelman against.** The guard only matters while the controller is stalling, and the stalls may be a symptom of something that a firmware update or a network change removes. Fixing the client-side guard also makes the fault quieter, which is the opposite of what an investigation wants — unless the rejections stay loudly traced, which is why that is in the goal.

**Cost of delay.** Low in water terms — the UI blanks for 30 s and recovers — and high in evidence terms: every future trace stays ambiguous about whether a valve loss was real, which is the one question I1 exists to answer.

**Evidence.** `app/server/middleware.mjs:92-119`; `INVESTIGATIONS.md:574-586 (E9, unchecked)`; `app/src/api/model.ts:101-160 (buildValve)`; `app/.trace/egress.log:1353 (ACCEPTED at 22:17:23Z, one minute into the 08-11 shower)`; `git blame app/server/middleware.mjs:88-94 -> c8cefc13 (2026-07-26)`

### KDTV-W4 · The state-diff trace and the phone log viewer are the unbuilt half of the telemetry brief, and the built half shows why they are needed

`dormant-decision` · last substantive touch **2026-08-04** (88 days) · route **`batch`**

```text
Problem: Neither the 08-11 shower's ending nor the stalls the operator stood through are recoverable from the record, because the trace captures only what the proxy sent and received.
Cause: Step 5 of the observability brief — state DIFF lines and a phone-readable log route — was deliberately sequenced after step 4 and then never started; trace.mjs:42 and :131 name the DIFF kind in comments with no emitter behind them.
Fix: Emit a DIFF line whenever the derived model changes between polls, and add one route that serves the tail of the current trace file.
Impact: The next shower's end is recorded whether or not anyone is watching a laptop, and a stall becomes visible to someone standing in the bathroom.
Risk: A DIFF emitter sits on the poll path and must obey the same never-throw rule as trace.mjs; a log route exposes the trace to anyone on the LAN, which is the same trust boundary the controller already has.
Goal: A shower run produces DIFF lines bracketing its start and end, readable from a phone without a terminal.
```

**What its age means.** Eighty-eight days since the half that was built landed, and the built half is what demonstrates the missing half's value. A dormant decision that its own partial execution argues for.

**Why this route.** Understood implementation work behind a command with an exit code, and it is the piece that makes the next water-moving experiment worth running. Two pieces that ship together.

**Steelman against.** The thing it would record — a shower stopping — has not been reproduced since 2026-07-14, and E1 may move the investigation out of the DTV+ entirely, in which case this instrumentation is built for a fault that is not here. Running E1 first with the egress trace alone is a defensible order.

**Cost of delay.** Moderate. Every water-moving experiment run without it produces a result nobody can audit later, and E1 is the next one queued. The 08-11 shower is the worked example: it happened, and what it proved is an inference.

**Evidence.** `app/server/trace.mjs:42`; `app/server/trace.mjs:131`; `app/server/middleware.mjs:125-173 (four routes, none serving the log)`; `research/PROMPT-observability.md (step 5)`; `app/.trace/egress.log:1873-1998 (the 08-11 run's last poll, then nothing)`

### KDTV-W8 · The front page of a public repo states the fault this project works around is still present, and the one commit in 63 days added a fresh contradiction

`doc-rot` · last substantive touch **2026-07-26** (97 days) · route **`just-do-it`**

```text
Problem: README.md, DESIGN.md and PROTOCOL.md present `num_interface = 0` as the live state of a system that has reported `= 1` since 2026-08-04, and five further statements in prose are measurably wrong.
Cause: The premise, the test counts and the story-log ordering each changed in a commit that did not sweep the prose around them; README.md:40 was invalidated by 5d83023 itself 23 days ago.
Fix: One documentation pass: move the premise to past tense in the three files, correct 49 to 85 and 88 to 164, strike 'no valve has been opened by this app yet', change README.md:40 to oldest-first and add STORY-LOG-INDEX.md to the reading table, and re-word selftest.mjs:179.
Impact: A reader arriving at a public repo — including a Kohler engineer, which AGENT.md:10-13 says to assume — stops being told something the repo itself disproved 88 days ago.
Risk: Quoting a fresh count that goes stale again; cite the command that produces it instead of the number.
Goal: No tracked document states the dead premise, and every count in prose matches `npm test` output.
```

**What its age means.** Flagged in the 2026-08-04 ledger, flagged again on 08-29, unchanged. Ninety-seven days is also how long the premise has been the first thing a stranger reads.

**Why this route.** Known problem, known fix, no judgement calls, under an hour. The only reason it has survived two ledgers is that nothing breaks when it is wrong.

**Steelman against.** Nothing in the code reads these sentences, and every hour spent on prose is an hour not spent on the investigation the prose is about. A reader who gets as far as INVESTIGATIONS.md finds the truth. The counter-argument is that the repo's stated value is being credible to outsiders, and this is the page they land on.

**Cost of delay.** Low operationally, real reputationally. It compounds quietly: each new number added to a doc is another thing to get wrong, and the 10-08 commit shows the rot now generates itself.

**Evidence.** `README.md:18-19`; `README.md:40`; `DESIGN.md:11-13`; `DESIGN.md:165`; `DESIGN.md:204-206`; `PROTOCOL.md:199-201`; `viewer/README.md:87`; `app/scripts/selftest.mjs:179`; `research/FIELD-NOTES.md:251`; `INVESTIGATIONS.md:518`; `AGENT.md:64-65`

### KDTV-W13 · Every dev page load sends four requests to hardware documented as fragile, and the proxy forwards reads the browser already abandoned

`silent-failure` · last substantive touch **2026-07-26** (97 days) · route **`batch`**

```text
Problem: A single dev page load produces two values.cgi and two system_info.cgi requests within milliseconds — the same stacked-read burst the story log blames for a controller hang — automatically, on every reload.
Cause: useShower.ts:66-108 runs the first tick in a mount effect and main.tsx:7 double-mounts under StrictMode; the cleanup aborts the browser fetch but middleware.mjs:125-173 has no req.on('close') handling, so the proxy completes both upstream reads.
Fix: Guard the first tick against a double mount, and abort the in-flight upstream read when the client disconnects.
Impact: The burst pattern stops being generated by the development workflow, so a burst in a future trace means a human did something.
Risk: Suppressing a second mount's effect can hide a real remount, and the existing test harness states it does not model double-mounted effects, so the test has to come before the fix.
Goal: A dev page load produces exactly one values.cgi and one system_info.cgi REQ, pinned by a test that fails on today's behaviour.
```

**What its age means.** Ninety-seven days, and invisible for all of them because the requests are serialised and nothing ever complained. The 2026-08-04 fix for the sibling defect could not see it: its harness says so in a comment.

**Why this route.** Two related changes with a testable pass condition, and the test is the hard part — the harness has to grow before the fix can be proven. That is a batch, not a quick edit.

**Steelman against.** Four serialised reads do not breach the documented two-session limit, and the burst only happens in development, never in the built app the operator uses. It may be entirely harmless, and the honest version of the claim is 'we do not know', which is a thinner basis for code change than the other candidates.

**Cost of delay.** Low in itself. What it costs is interpretive: FIELD-NOTES and the story log blame bursts for lockups while the dev workflow emits one on every reload, so any future lockup during development has a confounder nobody has removed.

**Evidence.** `app/src/main.tsx:7`; `app/src/state/useShower.ts:66-108`; `app/server/middleware.mjs:125-173`; `app/test/hookHarness.ts:18-22`; `app/.trace/egress.log:1241-1244 (a 4-REQ burst)`; `git blame app/src/state/useShower.ts:60-110 -> 6a1b2d43, c8cefc13 (both 2026-07-26)`

### KDTV-W14 · npm test writes into the operator's live evidence file, and the documented way to stop it breaks twelve tests

`silent-failure` · last substantive touch **2026-08-20** (72 days) · route **`just-do-it`**

```text
Problem: Running the unit suite appends a `proxy start` NOTE to app/.trace/egress.log — an event that did not happen, in the file trace.mjs:50-52 calls the single source of truth — and setting DTV_TRACE=0 to prevent it fails 12 of 85 tests.
Cause: vite.config.ts:13 calls createKohlerMiddleware() at config-evaluation time, which calls traceNote() at middleware.mjs:72 into the real directory; only trace.test.ts redirects DTV_TRACE_DIR, and nothing re-enables tracing for the tests that assert writes.
Fix: Pin DTV_TRACE_DIR to a temporary directory for the whole vitest run, and have trace.test.ts set DTV_TRACE=1 for itself.
Impact: The evidence file stops accumulating events from test runs, and the kill switch becomes usable; measured today, the directory redirect alone is sufficient and costs one line.
Goal: `npx vitest run` leaves the live trace byte-identical, and `DTV_TRACE=0 npx vitest run` exits 0.
```

**What its age means.** The pollution path opened when the trace shipped on 2026-08-20 and has had 72 days to add lines that never happened. Both halves were measured today, one of them for the first time.

**Why this route.** One line in the test config and one in a test file. Reproduced and contained during this sweep, which is the proof that the fix works: with DTV_TRACE_DIR redirected, the live trace stayed at exactly 1,998 lines.

**Steelman against.** Only one spurious line exists in 1,998, it is clearly labelled a NOTE with a pid, and anyone parsing the file can filter it. The DTV_TRACE=0 half is arguably correct behaviour — a test that asserts tracing should fail when tracing is off — so the fix may be documentation rather than code.

**Cost of delay.** Low, and it accrues one line per test run. The real cost is to the authority chain: a file the repo names as its source of truth about hardware is writable by a command every agent runs reflexively.

**Evidence.** `app/vite.config.ts:13`; `app/server/middleware.mjs:72`; `app/server/trace.mjs:63`; `app/server/trace.mjs:71`; `app/server/__tests__/trace.test.ts:173-175`; `app/.trace/egress.log:1998 (a NOTE written by the 2026-08-29 sweep's own test run)`

### KDTV-W5 · A degraded or absent values.cgi makes the model declare the system Fahrenheit and its ceiling 113

`silent-failure` · last substantive touch **2026-07-26** (97 days) · route **`batch`**

```text
Problem: When values.cgi is absent or truncated, the model reports units as Fahrenheit and the per-valve maximum as 113 rather than refusing to say, because a missing field reads as zero and zero means Fahrenheit.
Cause: model.ts:136 and :186 test `num(values?.units) === 0`, which is true for a payload that does not contain `units` at all; :153 then defaults maxTemp to 113.
Fix: Make units and the ceiling nullable through the model, and have the UI show them as unknown when the payload did not supply them.
Impact: On a Celsius system a degraded read would display a 113-shaped ceiling with nothing marking it as guessed; the repo's own stance elsewhere is that a guessed unit is worse than a refusal.
Risk: Nullable units touch every screen that formats a temperature, and the scald predicate has to keep working when the unit is unknown.
Goal: A degraded payload produces no unit and no ceiling in the UI, pinned by a test, and the scald check still refuses to pass a temperature it cannot classify.
```

**What its age means.** Ninety-seven days, never triggered visibly because this system is Fahrenheit and the wrong guess happens to be right here. The age tells you the defect is waiting for a different installation, not for time.

**Why this route.** A typed-model change with a clear test, touching several screens. Small but not a one-liner, and the scald interaction means it wants a pass condition rather than a glance.

**Steelman against.** This system is Fahrenheit with a 113 maximum, so the guess is correct on the only hardware the project has; a degraded read is already visibly wrong in other ways, and the app is not used anywhere else. Fixing it is work for a hypothetical second installation.

**Cost of delay.** Nothing much for this shower. It matters if the app is ever published or run against another DTV+, which is the direction the README points, and it is a scald-adjacent default, which is the one category this repo treats as not worth carrying.

**Evidence.** `app/src/api/model.ts:136`; `app/src/api/model.ts:153`; `app/src/api/model.ts:186`; `app/src/api/model.ts:213`; `app/src/api/model.ts:254-258 (isScaldRange)`; `git blame app/src/api/model.ts:130-160 -> 614de910, ab29b2dc (both 2026-07-26)`

### KDTV-W18 · The repair's own re-check is 94 days overdue and nothing in the repo will ever fire it

`aging-assumption` · last substantive touch **2026-07-29** (94 days) · route **`just-do-it`**

```text
Problem: INVESTIGATIONS.md:522-524 records that the FDM-printed rear cover in a shower wall is 'worth re-checking after some months'; 94 days have passed, the check carries no date, owner or trigger, and no record exists of which of the two cover revisions is installed.
Cause: The open question was written as a note to a future reader rather than as an experiment with a date, and the repo has no mechanism for a time-triggered check.
Fix: Read the controller's interface state first, inspect the housing only if something reads wrong, then record the result, the date, and which rear-cover revision is installed.
Impact: Either I2 stays resolved with dated evidence, or a gasket failure behind a wall is found while it is still a gasket failure.
Risk: Inspecting means going back into a wall that was sealed deliberately; the read-only check costs nothing and should gate the physical one.
Goal: I2 carries a dated re-check result naming the installed cover revision, and the next re-check has an actual date on it.
```

**What its age means.** The assumption did not age — it expired. 'Some months' is now behind us, and the only thing that was ever going to fire this check was somebody re-reading a file that nothing points at.

**Why this route.** The read-only half is one selftest run and costs nothing. Writing down which STL is installed is the one fact in cnc/ that will be lost if nobody records it, and it is why W7 was demoted into this item.

**Steelman against.** An FDM part gasketed with a formed-in-place sealant and recessed away from direct water is probably fine, and opening the housing to check introduces exactly the failure mode the check is looking for. Doing nothing and waiting for a symptom is a coherent strategy for a part that is cheap to replace.

**Cost of delay.** Unknown, which is the problem. Water behind a wall is the one failure in this project that is expensive rather than merely informative, and the repo's own note says it should have been looked at by now.

**Evidence.** `INVESTIGATIONS.md:476 (resolved 2026-07-29)`; `INVESTIGATIONS.md:500-518`; `INVESTIGATIONS.md:522-524`; `cnc/new-rear-port-cover.stl`; `cnc/new-rear-port-cover-v2.stl`; `app/scripts/selftest.mjs:177-181 (the read-only interface check)`

### KDTV-W19 · The monitoring index whose purpose is a periodic sweep has not been swept in 97 days

`aging-assumption` · last substantive touch **2026-07-26** (97 days) · route **`just-do-it`**

```text
Problem: research/SOURCES.md:6 still reads 'Last full sweep: 2026-07-26', 97 days ago, for a file that exists only to make a periodic sweep cheap and that FIELD-NOTES depends on for its community evidence.
Cause: The sweep has no schedule and no owner; the 2026-08-29 scout looked at it and correctly declined to promote it at 34 days.
Fix: Run the `gh api` loop the file already contains with the recorded since-date, re-run the discovery searches, record what changed, and update the sweep date.
Impact: Three months of upstream DTV+ activity — new repos, new issues, new teardowns — either enters the project or is confirmed absent on the record.
Risk: Needs the gh CLI and may return nothing, which is a legitimate outcome and still worth writing down.
Goal: SOURCES.md carries a 2026-10 sweep date and what the diff found, explicitly including 'nothing new'.
```

**What its age means.** Thirty-four days was correctly not a finding; 97 is. This is the one candidate whose status changed purely because the calendar moved, which is what the file is for.

**Why this route.** The procedure is written inside the file, with the since-date already in the command. One session, read-only, no hardware.

**Steelman against.** Upstream DTV+ work moves in years, not months, and the last sweep found a thin field. Three months of silence is the likeliest outcome and the whole exercise may produce one line. A six-month cadence would be defensible — but then the file should say six months.

**Cost of delay.** Low per quarter and compounding: the longer the gap, the larger the diff and the more likely a relevant finding is read as old news. FIELD-NOTES' authority rests on this file being current.

**Evidence.** `research/SOURCES.md:6`; `research/SOURCES.md:12-19 (the sweep loop, with since=2026-07-26)`; `research/SOURCES.md:28,60,80`; `research/FIELD-NOTES.md:251`

### KDTV-W9 · A public repo redistributes three unlicensed third-party bodies and a manufacturer's CAD under a licence labelled Draft

`irreversible` · last substantive touch **2026-07-26** (97 days) · route **`just-do-it`**

```text
Problem: The tree carries vendored material from upstreams that state no licence, plus a manufacturer's CAD, published under a LICENSE.md whose own status line reads 'Draft'.
Cause: The material was vendored with provenance but the permission question was recorded as needing a deliberate call and the call was never made; there is no record anywhere of the main upstream being asked.
Fix: Ask for terms, make and date the call on the manufacturer's CAD, and either promote the licence out of draft or state in the README that the terms are provisional.
Impact: The repo's licensing position becomes something a contributor or a vendor can read and rely on.
Risk: Asking can produce a refusal, which forces removing material the viewer and the research currently depend on — which is also the honest reason it has not been asked.
Goal: Every third-party body in the tree has a dated licence position and a named decider.
```

**What its age means.** Ninety-seven days of publishing under terms nobody has finished writing. Age is almost irrelevant here: the exposure is structural, and it is cheap now and expensive once anyone cares.

**Why this route.** The work is three emails and three recorded decisions, not a project. It is routed here rather than to a study because nothing needs researching — the question is who is willing to say yes.

**Steelman against.** Nobody has complained in 97 days, the material is provenance-tracked and credited, and a hobby repo asking a manufacturer for CAD redistribution rights invites a 'no' that is worse than silence. Doing nothing preserves optionality.

**Cost of delay.** Nothing much most quarters, and a step change the moment the repo gets attention — which is the explicit plan, since the work is heading for a public video.

**Evidence.** `LICENSE.md:46-48`; `research/xagon0/PROVENANCE.md`; `viewer/public/models/PROVENANCE.md`; `AGENT.md:80-81`; `e:/git/OpenMakerLicense/LICENSE.md (unchanged since 2026-01-08)`

### KDTV-W3 · The week that justifies this project is missing from the story log, and the footage has been sitting processed in a sibling repo since July

`drift` · last substantive touch **2026-07-28** (95 days) · route **`just-do-it`**

```text
Problem: The 2026-07-27 support call and the 2026-07-28 to 07-29 fabrication and repair are absent from the story log, and this repo still records the video pipeline as having no consumer for the footage.
Cause: The write-up was treated as blocked on footage processing; a sibling repo has carried a two-chapter deliverable descriptor for exactly this material since 2026-07-31, and neither repo records the link — the 2026-08-29 snapshot asserted the opposite after a grep that missed it.
Fix: Append story-log entries for the support call and the fabrication from what INVESTIGATIONS.md and cnc/ already prove, and record in one of them where the footage lives, per the repo's own rule of referencing the path rather than committing the media.
Impact: The two events a Kohler engineer and a viewer would most want to read are in the record, and a cross-repo dependency stops being invisible from both ends.
Risk: Reconstructing detail 95 days later gets things wrong; mark what is reconstructed as reconstructed, which the convention already requires.
Goal: The story log covers 2026-07-27 to 07-29, and one of its entries names where the footage is and what state it is in.
```

**What its age means.** Ninety-five days, and the stated blocker dissolved on day three without either repo noticing. The age measures how long a dependency can be satisfied and unrecorded at the same time.

**Why this route.** Two story-log entries written from evidence already in the tree, plus one sentence naming where the footage is. The video itself is not this item — that is W20.

**Steelman against.** Writing these entries from reconstruction partly defeats the convention's own reason for existing, which is that the detail is gone by the next session. A thin, honest 'this happened, the detail is in the footage' entry may be all that is recoverable, and some would rather have no entry than a vague one.

**Cost of delay.** The detail keeps leaving. Ninety-five days on, the support call survives as two lines in INVESTIGATIONS.md and a filename, and the fabrication week survives as twelve undocumented files and 45 clips nobody in this repo can point to.

**Evidence.** `STORY-LOG-INDEX.md (2026-07-27 16:10 -> 2026-08-03 16:18, no 07-27 support call)`; `INVESTIGATIONS.md:500-518 (the call, the quote, the machining, the cover)`; `AGENT.md:55-56`; `AGENT.md:82-83`; `e:/git/inferiere/apps/web/scripts/gate-b10.ts:9-12`; `e:/git/inferiere/apps/web/scripts/gate-b10.ts:240-247 (two declared chapters)`

### KDTV-W1 · The cheapest experiment that could settle the leading hypothesis has been specified and unrun for 97 days

`blocked-decision` · last substantive touch **2026-07-26** (97 days) · route **`just-do-it`**

```text
Problem: E1, the high-flow shower that discriminates the leading I1 hypothesis from everything else, is still unchecked after 97 days, as is E10, and E2's apparent 2026-08-11 run was never recorded.
Cause: All three need the operator, running water and in-the-moment consent, so no agent session has ever been able to close them, and nothing re-asks the question between sessions.
Fix: Run E1 as written — several outlets open, timed, against the ~3.5-minute handshower failure of 2026-07-14 — with the trace running, and record the result either way.
Impact: The tankless minimum-flow hypothesis is either close to confirmed, which moves the investigation out of the DTV+ entirely, or dead, which moves attention to the valve hardware.
Risk: It moves water, and the controller's configured maximum is above the 43 C / 109 F scald threshold, so the operator sets the temperature deliberately below it and is present throughout.
Goal: E1 is checked in INVESTIGATIONS.md with a duration, a story-log entry, and its trace window copied into research/diagnostics/.
```

**What its age means.** Ninety-seven days is the whole life of the investigation. The experiment has never been blocked by anything except that only one person can run it and nobody has written it on a list that person reads.

**Why this route.** Fully specified, both outcomes pre-stated, needs no code — but it is operator work, not agent work, and that is the only reason it is still open. It belongs on a list the operator reads, which is what BACKLOG-INDEX.md now is.

**Steelman against.** It is the only candidate here that moves water at temperature, and W4's state trace would make its result unambiguous rather than inferred — the 08-11 run is the worked example of running an experiment without it. Doing E1 after the instrumentation is a defensible order and costs one more quarter.

**Cost of delay.** High in information terms. Until E1 runs, every hypothesis in I3 and I1 is reasoning about a fault nobody has reproduced since 2026-07-14, and the shower is in daily use, so the fault may silently resolve or recur without anyone timing it.

**Evidence.** `INVESTIGATIONS.md:113-123 (E1, unchecked)`; `INVESTIGATIONS.md:124-138 (E2, unchecked)`; `INVESTIGATIONS.md:180-190 (E10, unchecked)`; `INVESTIGATIONS.md:92-100 (leading hypothesis)`; `INVESTIGATIONS.md:574-586 (E9)`; `DISCLAIMER.md (scald threshold and consent rule)`; `AGENT.md:31-33`; `app/.trace/egress.log:1331-1361 (the 08-11 start, unrecorded)`

### KDTV-W20 · The repo's stated public purpose has no owner, date or artifact after 97 days

`blocked-decision` · last substantive touch **2026-07-26** (97 days) · route **`scored-proposal`**

```text
Problem: AGENT.md says the work is heading for a YouTube video and may be shared with Kohler technical support; after 97 days neither has an owner, a date or an artifact in this repo, while the raw material sits in two others.
Cause: Both outputs are cross-repo and compete for the same attention as everything else in the portfolio, and neither has ever been scored against anything.
Fix: Score both as initiatives in the portfolio's N-Star pass — the video, whose footage and chapters already exist in a sibling repo, and the For-Kohler collation, whose fifteen source lines are already written here.
Impact: Either the project's public purpose gets a slot and a date, or it is deliberately deprioritised and stops being implied by every document in the tree.
Risk: A scored pass may show it losing to income-thesis work, which makes explicit a de-prioritisation the repo currently avoids stating.
Goal: Both appear in a dated N-Star pass with a classification, or this repo's documents stop presenting them as current intent.
```

**What its age means.** The purpose was declared in the first week and has never been revisited. Ninety-seven days with no artifact is the signal; the repo is not failing at it so much as not attempting it.

**Why this route.** It is large, cross-repo and competes with other repos for the same budget, which is the definition of the scored route. The collation half is cheap enough to peel off as just-do-it if the owner wants one small win — fifteen marked lines into one document — but the video is not a thing this repo can decide alone.

**Steelman against.** The project is producing value as an investigation and a working app regardless of whether a video ships, and declaring the public purpose dead would remove the reason several of its conventions exist (the story log, the For-Kohler lines, 'assume Kohler engineers read this'). Leaving it as background intent is cheap and harmless.

**Cost of delay.** Nothing operationally. What it costs is that half the repo's conventions exist to serve an output nobody has committed to, so every session pays a small tax for a deliverable that may never be attempted.

**Evidence.** `AGENT.md:10-13`; `AGENT.md:67 (For Kohler lines 'get collated when we contact them')`; `STORY-LOG.md:7 (For Kohler lines are collated when contacting support)`; `INVESTIGATIONS.md:525,676`; `STORY-LOG.md:36,52,106,135,169,209,325,330,423,437,479`; `CLAUDE.md:21-25`; `e:/git/inferiere/apps/web/scripts/gate-b10.ts:240-247`

---

## Considered and not carried

What was rejected is how a reader calibrates how aggressive the filter was.

| Looked at | Why it did not clear the bar |
| --- | --- |
| cnc/ still holds twelve undocumented files (prior KDTV-W7) | Carried twice and never done, and nothing depends on it: the operator holds the knowledge and the files are inputs to one machine. Its one perishable fact — which rear-cover revision is installed — is folded into W18, which has an actual reason to go and look. Demoted rather than carried a third time. |
| STORY-LOG.md:41 has no '**Why it matters:**' line (the one storylog verify warning) | Unfixable as written: AGENT.md:68 forbids editing a committed entry, and the only compliant fix is a new entry, which is disproportionate to a missing closing line. Recorded here as a standing tension between the format check and the append-only rule, not as work. |
| The 2026-08-29 snapshot's claim that inferiere references nothing of this footage | False when written — gate-b10.ts predates it by four weeks. Corrected in the state doc's burn-down and folded into W3's cause rather than carried as its own item; a wrong claim in an uncommitted artifact is not work, it is a correction. |
| vite.config.ts hardcodes the controller's LAN address as a default in a public repo | A private-range address behind the operator's own router, overridable by KOHLER_HOST, and already published. Not an exposure. Worth remembering only when deciding how to scrub trace copies under W15. |
| The proxy does not clamp valve temperature server-side | Unchanged reason from both prior ledgers: the controller is reachable directly by any unauthenticated LAN client with no clamp at all, so a proxy-side clamp protects nothing it does not already protect by being the only client people use. |
| 9d6bbbe's message says 'wip … amend or reset as normal' and it is pushed | A message problem, not a content problem; the commit is coherent and test-passing. Amending means a force-push on a public default branch, which is the same cost as W16 and should ride along with that decision if it goes that way. |
| Per-process queue means a dev-server reload briefly runs two proxies | Already documented as a confounder with a known workaround. Not promoted. |
| docs/state casing versus the sweep template's convention | Git tracks lowercase docs/state and Windows folds the alternative into it. A rename is the operator's call and changes nothing functional. |
| The viewer's Maker Galaxy graduation has not started | Verified again: mg-web has no sourceUnit and no gizmo files. The roadmap lives in mg-web, so recording 'nothing crossed' belongs in the state doc's cross-project table, not in this repo's ledger. |
| DESIGN.md's known gaps — presets, massage speed, second valve, PWA — and the Android port | Spec-compliant deferrals, declared plainly and unchanged. Not drift. |

---

## Caveats

Verified by execution: npx vitest run in app/ (85 passed, exit 0) and viewer/ (164 passed), npx tsc --noEmit in both (exit 0), npx vite build in app/ (exit 0, 168.38 kB JS), exposedEndpoints() (18 of 56, MAX_RISK 2), storylog verify . (0 errors, 1 warning), git log/status/blame/show, and a fresh parse of app/.trace/egress.log with every timestamp re-derived rather than inherited from the prior ledger. Both test suites were run with DTV_TRACE_DIR pointed at a scratch directory, so this sweep did NOT repeat KDTV-W14's pollution: the live trace is still exactly 1,998 lines. NOT contacted: the controller or any hardware; no REQ line was generated. Where I disagree with the prior snapshot I say so: the guard-defeat spacing measures 408-425 s, not ~366 s, because the two readings anchor on different events, and inferiere does reference this footage, which the 08-29 snapshot denied. NOT verified: whether a browser tab on the controller's own page or a second LAN client was open during the 08-05 and 08-11 windows, which an egress-only trace cannot see and which is the main confounder for calling the fault periodic; whether the 08-11 shower actually ran 31 minutes or merely was polled for 31 minutes (the log ends, it does not record a stop); the viewer's export gate, which was not re-run. Cross-repo reads were read-only and shallow: storylog, inferiere, mg-web, mg-controller, OpenMakerLicense, llm-fab, sig-wb and craftcraft-private. One distortion to hold for a cross-repo read: this repo is unusually well documented for its size, so its gaps are visible in a way a less-documented sibling's are not; do not read the length of this ledger as the repo being in worse shape than its neighbours.
