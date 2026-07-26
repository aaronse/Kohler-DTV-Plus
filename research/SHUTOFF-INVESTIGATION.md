# Open investigation: shower stops mid-use

**Status: open.** Leading hypothesis changed 2026-07-26 after reviewing a video
recorded on 2026-07-14, which rules out the explanation this document previously
led with.

## The symptom

For roughly two months, the shower stops of its own accord partway through use.
Observed durations before shutoff: "a couple of minutes", "about 4 minutes", and
~3.5 minutes in the recorded session. No pattern identified.

Separately, on 2026-07-25 at 22:32 the K-99693 interface's internal power
connector was pulled out — see [Interface failure](#interface-failure-separate-cause)
below. That is a **separate, understood event**, not a cause of the shutoffs.

## Direct observation — 2026-07-14 recording

Source: `E:\proj-med\build-661-diag-kohler-shower\2026-07-14-DTV-shower-unexpectedly-stops.txt`
(operator's own timestamped transcript; not copied into this repo).

The decisive observations, in the operator's words:

| Time | Observation |
| --- | --- |
| 00:57 | "Showers disappeared. No, it says, thinks it's running. Sort of problem with the valve." |
| 03:10 | "randomly off for a few minutes, this thing will just decide to stop" |
| 04:58-05:23 | Target raised to 97 °F — then "**Target's gone down to 96**", reverting on its own |
| 05:53 | "I don't see any error messages on display" |
| ~06:40 | "**it just kind of seized up and stopped**" — water stops, nothing was touched |
| 06:46 | "**if I go over to the shower, it says that it's still running.** It thinks that it's still pushing water out, or at least the controller does, but obviously it's not" |
| 07:11 | "this display will stay like this for a little bit... we'll see it here **within about a minute**... at some point it figures out, oh, either the poor valve has lost power or shut down" |
| 07:47 | No status LEDs or flashing lights anywhere |
| 08:21 | Controller returns to the clock screen, now correctly showing not-running |

### What this proves

**The shower was not commanded off.** After the water stops, the controller
still believes it is running and continues to display a running shower for
about a minute before timing out and reverting to idle.

A stop command — from the interface, the app, or anything else — sets the
controller's state to off *immediately*. That is not what happens. The water
stops first and the controller finds out later.

**This eliminates the previous leading hypothesis** (a failing interface sending
spurious stop commands, including "phantom touches"), which the operator was
independently sceptical of. It is struck from the ranking below.

### Two further clues

- **The setpoint reverted 97 → 96 on its own.** 96 °F is `def_temp`, the
  configured default. Something reloaded defaults, which is the signature of a
  valve or control-loop reset rather than a smooth handover.
- **The controller takes ~1 minute to notice.** That is a timeout, and it puts
  a bound on the detection path we can instrument.

## Instrument evidence

### A controlled negative: the shutoff logs nothing at all

**This is the strongest single piece of evidence we have.**

The operator cleared the controller's error log **before** filming the
2026-07-14 session, reproduced the shutoff on camera, and captured the log
**after**. Raw captures:
[2026-07-14-controller_Error-after-repro.log](diagnostics/2026-07-14-controller_Error-after-repro.log),
[2026-07-14-konnect_Error-after-repro.log](diagnostics/2026-07-14-konnect_Error-after-repro.log).

```
Controller (S): v0.0.3.89
...
No errors are logged from Controller
```

Cleared before, reproduced during, **still empty after**. This is a properly
controlled negative result, not an ambiguous one.

It eliminates everything that writes to the log:

| Ruled out | Code |
| --- | --- |
| Device detach — valve, amplifier, anything | 100 |
| Device unresponsive | 101-103 |
| Configuration / flash filesystem errors | 102-110 |
| Ethernet / Wi-Fi link drop | 105 / 106 |
| RTOS task exception | 130-137 |
| RTOS task abort | 138-146 |
| Valve faults (`OVERTEMP_*`, `ALG_*`, `RELAY_FAULT`) | 2-39 |

**The detach mechanism demonstrably works** — the UI disconnection on 2026-07-25
was logged as code 100 within seconds. So the controller is perfectly capable of
noticing and recording a device dropping off the bus. It did not do so here.

That is bad news for the valve-power and RS-485 hypotheses: if the valve had lost
power or fallen off the bus, code 100 is exactly what we should see.

### Interface firmware, recorded while it was still attached

The captured log header preserves versions we can no longer read, since the
interface now reports `not_seen`:

```
User Interface1 (S):  OS v0.0.7.44 · Graphics v0.0.1.7
                      Language v0.1.1.0 · Touch Panel v0.0.0.2
Kohler Konnect:       OS v0.0.1.77 · Graphics v0.0.1.9
Valve 1:              FW v0.12
Controller (S):       v0.0.3.89
```

### The log today

`cerror_logs.cgi`, read 2026-07-26 (raw:
[diagnostics/error-log-2026-07-26.txt](diagnostics/error-log-2026-07-26.txt)):

```
['Hr:M:S D/M/Y']:         ['ID':  'SOURCE']        [DESCRIPTION]
[10:32.42 p.m. 07/25/2026] 100:  UI Error
```

One entry: code **100 = `DETACH_EVENT`**, source UI (device byte `0x30`),
timestamped to the interface disconnection. This is a **99-entry circular buffer
in flash that survives power cycles**
([xagon0 error-codes.md](xagon0/docs/troubleshooting/error-codes.md)).

Consistent with the controlled capture above: the only thing ever logged is the
UI detach. `valve1_ErrorFatal` and `valve1_ErrorResettable` are both `0`.

*(An earlier revision of this document flagged "we cannot prove the log was
never cleared" as the biggest gap. That is now resolved — it was cleared
deliberately, before the repro, which is what makes the empty result meaningful
rather than ambiguous.)*

### A transient valve dropout, caught once

On 2026-07-26 at 11:43, a routine `values.cgi` read returned
`valve_1_con_string: 'dis'` and `valve1_installed: false`, recovering on the next
read ([FIELD-NOTES.md](FIELD-NOTES.md) §6).

This was previously written off as a partially-populated HTTP response. **In
light of the video it deserves promotion**: "controller has lost the valve" is
precisely the state the video shows during a shutoff. One clean sample of the
suspected failure mode, caught while idle.

### Ruled out

| Cause | Why not |
| --- | --- |
| Configurable runtime limit | `max_valve1_runtime_enable = 0`, `max_valve1_runtime = 0` |
| Prompt 3 valve watchdog | 1800 s, not 2-4 min — and this is a six-port valve, not a Prompt 3 |
| Commanded stop (any source) | Controller still reports running after water stops |
| Interface corrosion | Contacts inspected: clean copper/gold, vapor-tight sealed, recessed away from water |

## Hypotheses, ranked

> **Re-ranked 2026-07-26** after the controlled log capture. Any hypothesis that
> would write to the error log is now heavily penalised, because a reproduced
> shutoff wrote nothing while a real detach (the UI, 07-25) wrote immediately.

### 0. Something mechanical or hydraulic stops the water, and the electronics never know — new leading

The combination we have to explain is: water stops instantly · nothing was
commanded · the controller believes it is still running · **nothing is logged**
· no fault flags · no status LEDs.

An electrical or bus failure struggles with the last three. A *mechanical* or
*hydraulic* cutoff explains all of them trivially, because there is nothing in
that path that reports to firmware:

- **Thermal/anti-scald mechanical cutoff.** Many thermostatic mixing valves
  close flow mechanically if the cold supply fails or outlet temperature exceeds
  a limit. Purely hydraulic, invisible to the controller.
- **Hot supply exhaustion.** A tank running down after a few minutes at the flow
  rate of these outlets fits the 2-4 minute timing well, and could trip the above.
- **Supply pressure loss**, e.g. a pump cycling, a pressure-balancing element, or
  another fixture drawing.
- **A valve mechanism closing without reporting** — a mixing motor driving to a
  closed position, or an internal safety that firmware does not surface.

The setpoint reverting 97 → 96 still needs explaining and is the one detail that
does not obviously fit; it may be unrelated, or may be the valve reinitialising
after the event.

**Why this matters for instrumentation:** if the cause is mechanical, **the
controller's telemetry will never show it.** A trace would only ever record
"running, then timed out" — which we already know. Confirming that negative is
cheap and worth doing, but the informative signal is almost certainly *outside*
the controller: outlet water temperature, flow, and supply-side behaviour.

### 1. Valve loses power or resets — demoted

Previously the leading hypothesis. It fits the observable behaviour — water
stops, controller unaware, ~1 minute timeout, setpoint reverting to default as a
reset signature.

**What demotes it:** a valve losing power or resetting should drop off the RS-485
bus, and the controller demonstrably logs that as code 100 within seconds. The
controlled capture shows no such entry. Not impossible — a reset fast enough to
recover before the detach timeout might slip through — but it now has to explain
the silence rather than being supported by it.

**Instrument:** `valve_1_con_string` and `valve1_installed` sampled through a
shower, plus the error log polled for new entries. A power loss should show as
`conn` → `dis`/`not_seen` at, or shortly after, the moment water stops. If a
trace ever catches that, this hypothesis is back at the top immediately.

### 2. RS-485 comms loss between controller and valve — close second

Mechanically similar from the controller's side, and hard to distinguish from
(1) without valve-side visibility. xagon0 documents signal-integrity failure
modes: runs over 50 ft, missing 120 Ω termination, cabling near AC lines
([known-issues.md](xagon0/docs/troubleshooting/known-issues.md)).

Distinguishing (1) from (2) probably needs physical inspection of the valve's
power and RS-485 wiring, or a scope on the bus.

**Note:** if the valve merely lost comms but kept power, it would normally *keep
running* until its own safety timeout — yet the water stops immediately. That
argues for (1) over (2), or for a valve that fails closed on comms loss.

### 3. Valve-side fault that cannot be reported

An `OVERTEMP_*`, `ALG_*_TIMEOUT` or `RELAY_FAULT` condition that trips the valve
— but if the valve then loses comms or resets, it never gets to report it, which
would explain the empty log.

The hot-supply angle deserves attention: `ALG_HOT_TIMEOUT` / `ALG_COLD_TIMEOUT`
would fit a failure that appears a few minutes in, which is roughly when a
supply-side limitation would bite. The operator notes hot/cold shutoffs and a
steam isolation switch in the same cabinet.

### 4. Controller crash-and-reboot — unlikely

Would leave a task exception (130-146) and make the controller unreachable for
30-60 s. The video shows the controller responsive and displaying throughout.
Effectively excluded by the recording, retained only because the log may be
unreliable.

## What would settle it

A trace spanning a real shutoff, sampling at the app's existing 5 s active rate
(no added controller load — see [FIELD-NOTES.md](FIELD-NOTES.md) §1):

| Hypothesis | Signature |
| --- | --- |
| Valve power loss / reset | `conn` → `dis`, setpoint reverts to `def_temp`, controller still reports running for ~1 min |
| RS-485 comms loss | `conn` → `dis` with no setpoint reversion |
| Valve fault | New `cerror_logs.cgi` entry and/or `ErrorFatal`/`ErrorResettable` set |
| Controller reboot | Controller unreachable 30-60 s |

The ~1 minute detection timeout means 5 s sampling has roughly 12 samples across
the transition — ample resolution.

**Also worth capturing:** wall-clock duration from start to shutoff across many
events. The operator's instinct at 08:21 — "maybe there's a hint there in the
clue... I'll figure out exactly the exact time" — is right. If the interval
clusters, that points at a timer; if it scatters, at a fault.

## Interface failure — separate cause

The K-99693 interface is **not** implicated in the shutoffs, but it is why this
project exists.

The original installation silicone-sealed the interface housing to the wall, and
sealed the blue seal plug along with it. Removing the interface left the blue
plug attached to the wall, which pulled the internal wire-to-board connector out
of its socket. Logged at 22:32 on 2026-07-25 as `DETACH_EVENT`.

The connector is **not reachable without opening the housing**. Contacts were
inspected while accessible and were clean copper/gold with no corrosion — the
housing was vapor-tight and recessed away from direct water.

Plan of record:

1. Contact Kohler technical support for a recommended reconnection method.
2. Only if there is no supported route: 3D scan the interface, generate a CNC
   toolpath, and cut a surgical access opening over the connector.

The unit is ~$1500, which is what justifies the effort over replacement.

⚠️ Mains-adjacent. Power down at the breaker before any physical work.

## Open questions

- ~~Was the error log ever cleared?~~ **Answered.** Cleared deliberately before
  the 2026-07-14 repro; still empty afterwards. The negative is real.
- What is the hot water source, its capacity, and the combined flow rate of the
  outlets in use? A tank running down would fit the timing.
- Does the valve or the install include a **mechanical** anti-scald or
  cold-supply-failure cutoff that closes flow without telling the electronics?
- Does the shutoff happen with a single low-flow outlet (handshower alone) as
  readily as with several? The 2026-07-14 repro ran the handshower alone and
  still failed, which argues against pure flow demand — worth confirming.
- Does the valve have its own power feed that could be independently
  instrumented or monitored?
- Does shutoff timing cluster or scatter?
- Does the shutoff still happen with the interface disconnected? (Now testable —
  the interface has been out since 2026-07-25.)
- Is hot supply exhaustion plausible on this install given tank size and the
  flow rate of the outlets in use?

## Confounders to note

During the 2026-07-14 recording the operator had **a web browser open on the
controller's own web page** while testing. The controller supports only two
concurrent HTTP sessions ([FIELD-NOTES.md](FIELD-NOTES.md) §1). This is unlikely
to explain shutoffs that predate the browser being connected — the operator notes
"web browser is not normally connected" — but any future trace should record
whether other clients were active.
