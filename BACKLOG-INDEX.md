# Kohler DTV+ — backlog index

One queue of open work for the N-Star portfolio board (`craftcraft/nstar/CONTRACT.md` §1).
Detail lives in the source each row cites, never here. Created **2026-10-31** against `master`
at `5d83023`; this repo has no `BACKLOG.md`, so every row below comes from the work ledger
[`research/scout/kohler-dtv-plus-work-scout-v3.md`](research/scout/kohler-dtv-plus-work-scout-v3.md)
and its state doc
[`docs/state/2026-10-31-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md`](docs/state/2026-10-31-KOHLER-DTV-PLUS-STATE-OF-PROJECT.md).

**IDs are stable and never reused or renumbered.** A row's `Item` cell is what gets scored, so
re-wording it forces a re-score — edit it only when the work itself changes. Closed work leaves
the open table or gets a ✅ / ❌ status, in the same commit as the work.

**Who:** `op` owner only · `dev` any agent session · `dec` owner decision, then dev.
**Cost is an estimate. Status:** ⬜ not started · ◐ partial · ⏳ waiting on an owner call.

> ⚠️ `WS-1031-14` moves real water at temperatures that can scald. Read
> [DISCLAIMER.md](DISCLAIMER.md) first; it needs explicit in-the-moment operator consent, every
> time. No other row touches the hardware.

## Scout candidates 2026-10-31

| ID | Item | Who | Cost | Status |
|---|---|---|---|---|
| WS-1031-01 | **Preserve the project's own evidence.** Copy the 2026-08-05 and 2026-08-11 windows of the gitignored `app/.trace/egress.log` into `research/diagnostics/` with dates, then `git add` the four scout artifacts untracked since 2026-08-29. Unlocks every other row, because all of them cite that file, and it is the only copy. — ledger `KDTV-W15`, shape `silent-failure`, 63 d 🔥 | dec | small | ⬜ |
| WS-1031-02 | **Settle the GPS history exposure.** Decide whether to purge the pre-`5d83023` photo blob from public history and force-push, or to record the exposure as accepted and why, and append the story-log entry the repo's own convention requires either way. Unlocks publishing the work without an open privacy question. Tracked in parallel as storylog S20. — ledger `KDTV-W16`, shape `irreversible`, 23 d 🔥 | dec | one decision, then small | ✅ |
| WS-1031-03 | **Land the periodic-fault finding so the investigation stops reasoning from a belief the evidence killed.** Write the measured ~412 s guard-defeat cycle into I3 as a hypothesis with its anchor, mark E11 answered, record the 2026-08-11 shower in I1, and overturn the 2026-08-04 'we caused both hangs' entry. Unlocks a correctly aimed E1 and E10. — ledger `KDTV-W11`, shape `untested-assumption`, 87 d | dec | ~1 session | ⬜ |
| WS-1031-04 | **Fix the valve-loss guard (E9) so a valve loss in a future trace means something.** Replace the count-repetitions rule in `middleware.mjs:92-119` with the specified short-or-slow single-sample test. Unlocks trustworthy evidence for I1 and stops the proxy manufacturing the signature the investigation hunts; measured defeated 12 times. — ledger `KDTV-W10`, shape `silent-failure`, 97 d | dec | ~1 session | ⬜ |
| WS-1031-05 | **Record what the controller did, not only what we asked.** Emit state `DIFF` lines when the derived model changes, and serve the trace tail on one route so a stall is visible from the bathroom. Unlocks a water-moving experiment whose result is recorded rather than inferred — the 2026-08-11 shower is the worked example of running one without it. — ledger `KDTV-W4`, shape `dormant-decision`, 88 d | dec | ~2 sessions | ⬜ |
| WS-1031-06 | **Stop a public repo stating the fault it works around is still present.** Move the `num_interface = 0` premise to past tense in README, DESIGN and PROTOCOL, correct the test counts (49→85, 88→164), strike 'no valve has been opened', and fix the story-log ordering claim the 2026-10-08 commit invalidated. Unlocks credibility with the outside readers the project is written for. — ledger `KDTV-W8`, shape `doc-rot`, 97 d | dec | small | ⬜ |
| WS-1031-07 | **Stop the dev workflow emitting the burst the project blames for lockups.** Guard the first poll against a StrictMode double mount and abort the upstream read when the browser disconnects, after growing the test harness to see double-mounted effects. Unlocks reading a future lockup during development without a self-inflicted confounder. — ledger `KDTV-W13`, shape `silent-failure`, 97 d | dec | ~1 session | ⬜ |
| WS-1031-08 | **Keep the evidence file free of events that never happened.** Pin `DTV_TRACE_DIR` to a temp directory for the vitest run and let `trace.test.ts` re-enable tracing for itself, so `npm test` stops appending to the live trace and `DTV_TRACE=0` stops failing 12 tests. Unlocks running the suite without thinking about it. — ledger `KDTV-W14`, shape `silent-failure`, 72 d | dec | small | ⬜ |
| WS-1031-09 | **Refuse to guess the temperature scale.** Make units and the ceiling nullable through the model so a degraded or absent `values.cgi` shows unknown instead of silently declaring Fahrenheit and a 113 ceiling. Unlocks running this app against any other DTV+ without a scald-adjacent guess. — ledger `KDTV-W5`, shape `silent-failure`, 97 d | dec | ~1 session | ⬜ |
| WS-1031-10 | **Close the repair's own overdue re-check.** Read the interface state, inspect the housing only if something reads wrong, and record the result, the date and which of the two rear-cover revisions is installed. Unlocks either a dated 'the repair holds' or finding a gasket failure behind a wall while it is still only a gasket failure; the note said 'after some months' 94 days ago. — ledger `KDTV-W18`, shape `aging-assumption`, 94 d | dec | small | ⬜ |
| WS-1031-11 | **Sweep three months of upstream DTV+ activity.** Run the `gh api` loop `research/SOURCES.md` already contains, record what changed — explicitly including 'nothing' — and update the sweep date. Unlocks FIELD-NOTES staying the authority it claims to be. — ledger `KDTV-W19`, shape `aging-assumption`, 97 d | dec | ~1 session | ⬜ |
| WS-1031-12 | **Make the licensing position of a public repo defensible.** Ask the unlicensed upstream for terms, make and date the call on redistributing the manufacturer's CAD, and either promote the licence out of draft or say in the README that the terms are provisional. Unlocks accepting contributions and publishing without an undeclared IP position. — ledger `KDTV-W9`, shape `irreversible`, 97 d | dec | one decision, then small | ⬜ |
| WS-1031-13 | **Put the week that justifies this project into the record.** Append story-log entries for the 2026-07-27 support call and the 2026-07-28 to 07-29 fabrication and repair from evidence already in the tree, and name where the footage lives — a sibling repo has carried a two-chapter deliverable for it since 2026-07-31. Unlocks the video and the Kohler conversation having a narrative to draw on. — ledger `KDTV-W3`, shape `drift`, 95 d | dec | small | ⬜ |
| WS-1031-14 | **Run E1 and settle the leading hypothesis.** Several outlets open, timed against the ~3.5-minute handshower failure of 2026-07-14, with the trace running and the temperature set deliberately below the scald threshold. Unlocks either moving the investigation out of the DTV+ entirely or killing the tankless hypothesis; specified and unrun for 97 days. **Moves water — needs in-the-moment operator consent.** — ledger `KDTV-W1`, shape `blocked-decision`, 97 d | dec | ~1 session, operator present | ⬜ |

🔥 = `onFire` in the portfolio card: one operator action prevents a loss or an exposure.

## Not indexed here

One ledger candidate is deliberately absent, because the index holds only work routed
`just-do-it` or `batch`:

- **KDTV-W20** — the repo's stated public purpose (a YouTube video, and collating the fifteen
  *For Kohler:* lines for support) has no owner, date or artifact after 97 days. Routed
  `scored-proposal`: it is cross-repo and competes for the same budget as other repos, so it
  belongs in a portfolio N-Star pass, not in this repo's queue. See the ledger.

Ten further items were looked at and did not clear the bar; they are listed with their reasons
under *Considered and not carried* in the ledger.

## Owner rulings

- **2026-11-01, WS-1031-02:** The coordinates were not the owner's. The photo blob was purged from history and `master` force-pushed on 2026-11-01. Closed; do not raise again.
