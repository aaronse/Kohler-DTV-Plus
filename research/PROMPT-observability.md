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

**The most important fact, and it constrains everything:** I cleared the
controller's error log *before* filming that session, reproduced the shutoff on
camera, and captured the log *after*. It said `No errors are logged from
Controller`. Cleared before, reproduced during, empty after — a controlled
negative. Captures are in `research/diagnostics/2026-07-14-*.log`.

So the shutoff writes **nothing**: no detach, no valve fault, no task exception,
no link drop. And we know the mechanism works, because pulling the interface
connector on 07-25 logged code 100 within seconds.

That demoted what had been the leading theory. If the valve lost power or fell
off the RS-485 bus, code 100 is exactly what should have appeared.

**Important caveat on that negative:** it rules out things that write to the
controller's on-board log (codes 100-204). It does **not** rule out *valve*
errors, which travel the Saturn serial protocol and surface only as the transient
flags `valve1_ErrorFatal` / `valve1_ErrorResettable`. Those are current state, not
history — read them the next day and you learn nothing. Sampling them *during* a
shutoff is the single highest-value thing this work can do.

**Current leading hypothesis — tankless heater minimum-flow cutout.** My hot
water is **tankless**. Tankless units have a minimum activation flow (~0.5-0.75
GPM) and no reservoir, so if flow drops below it the burner stops and hot water
goes cold within seconds. The valve then can't reach setpoint and shuts off
rather than deliver cold water — which is behaviour I expect from it. Nothing
reaches the controller log because valve errors don't go there.

This fits the detail that previously looked contradictory: in the 07-14 repro I'd
**turned off the overhead and left only the handshower running** to save water,
about 3.5 minutes before it failed. Low flow is the trigger under this
hypothesis, not a counter-example.

**So be sceptical about what controller polling can achieve.** The chain above is
mostly invisible to it. Please tell me what would actually discriminate the
hypotheses — including instrumenting things that aren't the DTV+ at all (outlet
temperature, flow rate, the tankless unit's own fault log). I'd rather hear
"polling the controller won't answer this, here's what would" than get a
beautifully engineered logger that cannot see the fault.

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
| **Tankless min-flow → valve cutout** | `valve1_ErrorResettable` sets transiently (look for `ALG_COLD_TIMEOUT` 38 / `ALG_HOT_TIMEOUT` 39); outlet temperature falls before the stop |
| Valve power loss / reset | `valve_1_con_string` → `dis`, setpoint reverts to `def_temp`, controller still reports running for ~1 min |
| RS-485 comms loss | `conn` → `dis`, no setpoint reversion |
| Controller reboot | Unreachable 30-60 s |
| Purely mechanical/hydraulic | Nothing anywhere — controller simply times out |

Note the last row: if the trace shows *nothing*, that is itself a result, and it
points outside the controller.

**Before building anything, tell me whether this experiment is cheaper than the
code:** run the shower with several outlets open, well above any minimum firing
flow, and see whether it survives materially longer than the handshower-alone
case. If high flow is stable and low flow fails, that's close to conclusive with
no instrumentation at all. I'm happy to build the logger too — I want the traces
regardless — but say so if the experiment should come first.

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

## How I want to work through this

1. Tell me what you found on the transport question, and — more importantly —
   **whether controller telemetry can actually discriminate the hypotheses**,
   given the controlled negative above. If it can't, say so and tell me what
   would.
2. Propose what to capture and the JSONL record shape, before writing code.
3. Build it, and get it capturing on the dev box.
4. **Stop there and show me real captured traces.** I want to look at actual
   content — a few minutes of idle capture — and understand what's in each field
   before I run any water.
5. Only once I've reviewed that and confirmed will I start a shower. Treat "the
   operator has reviewed the trace and said go" as a hard gate. Do not ask me to
   start the shower before step 4 is done.

Sample output I can eyeball matters more than completeness — if a field is
cryptic, tell me what it means and why it's worth logging.
