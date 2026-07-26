# Priming prompt — observability / telemetry session

Copy everything below the line into a fresh chat in `e:\git\Kohler-DTV-Plus`.

---

I need to build passive observability for a Kohler DTV+ shower system so we can
root-cause a "shower randomly stops mid-use" fault. Please start by reading
`CLAUDE.md`, `AGENT.md`, `research/SHUTOFF-INVESTIGATION.md`,
`research/FIELD-NOTES.md` and `DESIGN.md` — they carry the context and the hard
constraints. Don't re-derive what's already in them.

## The problem

For ~2 months the shower stops on its own 2-4 minutes into a shower. No pattern
found yet.

The decisive evidence is a video I recorded on 2026-07-14 (transcript at
`E:\proj-med\build-661-diag-kohler-shower\2026-07-14-DTV-shower-unexpectedly-stops.txt`,
technical content already extracted into `research/SHUTOFF-INVESTIGATION.md`):
**after the water stops, the controller still reports the shower as running** and
keeps doing so for about a minute before timing out to the clock screen. So
nothing commanded it off — the valve stops and the controller finds out late.
The setpoint also reverted 97 → 96 °F on its own during that session, and 96 is
`def_temp`.

Leading hypotheses, in order: valve power loss or reset; RS-485 comms loss;
a valve-side fault it can't report. The controller's error log holds exactly one
entry — the UI detach from when I pulled the interface connector — which either
means these events aren't logged, or the log was cleared. That's the biggest gap.

Separately: the K-99693 interface is physically disconnected (its internal
wire-to-board connector was pulled out when I removed the housing — the original
install silicone-sealed the housing *and* the blue seal plug to the wall). Its
contacts are clean, no corrosion, and it is **not** implicated in the shutoffs.
I'm contacting Kohler support about reconnecting it; possibly 3D scanning and
CNC-cutting an access opening. That's a separate track from this session.

## What I want built

A passive telemetry capture that runs on this dev box and gives us a trace
spanning a real shutoff.

Decisions already made:

1. **Runs on the dev machine for now.** If this proves worth it, we migrate to my
   home server. Don't build for the home server yet, but don't paint us into a
   corner either.
2. **No extra load on the controller.** Piggyback on the app's existing polling
   (15 s idle / 5 s active) rather than adding a second poller.
   `research/FIELD-NOTES.md` §1 explains why this is non-negotiable: three
   separate people have locked this controller up with polling, taking it out for
   hours.
3. **JSONL, parseable, not enormous.** Capture what's useful for this class of
   fault. Rotate or cap it.

Please treat these as settled unless you find a concrete reason one is wrong, in
which case say so.

## The question I most want you to investigate first

**Is there a better transport than polling?** Before writing a poller, look for
anything push-shaped on this hardware:

- **Partially answered already — start from this.** The controller's own web UI
  does nothing push-shaped. `research/controller-mirror/js/control.js` contains
  exactly two timers and no `EventSource`, `WebSocket`, long-poll or chunked
  stream anywhere in the mirrored JS:

  ```js
  setInterval(function () { loadXMLDoc();   }, 5000);   // system_info.cgi
  setInterval(function () { load_status();  }, 10000);  // values.cgi
  ```

  Two things follow. First, Kohler's own UI polls `system_info.cgi` at **5 s**,
  which is exactly our active rate — so we are within what the hardware was
  designed to serve, and the lockups others hit were probably about
  *concurrency* rather than interval alone. Second, if a push transport exists
  it is undocumented and unused by the vendor's own client, so treat finding one
  as unlikely. Confirm by checking whether any endpoint holds the socket open
  rather than closing it, but timebox it.
- Is there anything on the RS-485 side we could observe passively? The valve and
  controller talk Saturn protocol; `research/xagon0/docs/protocols/` documents
  it. A passive bus tap would see the failure directly instead of inferring it
  from the controller's late timeout — that's a hardware question, but tell me if
  it's the right answer.
- Does the Konnect module (`konnect_installed = true` on this system) expose
  anything locally that's more event-driven?

If the answer is "no, polling is all there is", say so plainly and move on — but
I'd like that established rather than assumed.

## What the trace needs to distinguish

`research/SHUTOFF-INVESTIGATION.md` has the signature table. In short:

| Hypothesis | Signature |
| --- | --- |
| Valve power loss / reset | `valve_1_con_string` → `dis`, setpoint reverts to `def_temp`, controller still reports running for ~1 min |
| RS-485 comms loss | `conn` → `dis`, no setpoint reversion |
| Valve fault | New `cerror_logs.cgi` entry, or `ErrorFatal`/`ErrorResettable` set |
| Controller reboot | Unreachable 30-60 s |

Also worth capturing: wall-clock duration from shower start to shutoff, across
many events, so we can see whether it clusters (timer) or scatters (fault).

`cerror_logs.cgi` and `kerror_logs.cgi` are already exposed as reads (0/5) — poll
them for *changes* rather than continuously.

## Constraints you must not break

- **Nothing above 2/5** on the CGI risk scale. The gate in
  `app/server/cgi-safety.mjs` enforces it; don't weaken it. Widening the exposed
  surface needs a recorded reason and the pinned test updated deliberately.
- **Never open a valve.** All of this is read-only. I'll run showers manually.
- **Two concurrent HTTP sessions maximum**, serialised, with a gap.
- The app must stay usable — this is still my only way to run the shower.

## Also

Append anything significant to `STORY-LOG.md` per the convention in `AGENT.md`.
This is being documented for YouTube (@azab2c) and may go to Kohler support, so
findings, reversals and mistakes are all worth capturing as they happen.

Start by telling me what you found on the transport question and what you'd
capture, before writing code.
