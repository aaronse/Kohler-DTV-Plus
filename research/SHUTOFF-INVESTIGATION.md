# Open investigation: shower stops mid-use

**Status: open. Hypotheses ranked, not proven.**

## The symptom

For roughly two months before 2026-07-25, the shower would stop of its own
accord partway through use. Reported durations before shutoff: "a couple of
minutes" on one occasion, "about 4 minutes" on another. No pattern identified by
the operator.

Separately, on the evening of 2026-07-25 the internal power cable was
disconnected from the K-99693 digital interface's wire-to-board connector,
leaving the system with no working user interface. That is what prompted this
project.

**These two facts may not be independent.** See hypothesis 1.

## Evidence

### The controller's error log is almost empty

`cerror_logs.cgi`, read 2026-07-26 (raw capture:
[diagnostics/error-log-2026-07-26.txt](diagnostics/error-log-2026-07-26.txt)):

```
['Hr:M:S D/M/Y']:         ['ID':  'SOURCE']        [DESCRIPTION]
[10:32.42 p.m. 07/25/2026] 100:  UI Error
```

One entry. Code **100 = `DETACH_EVENT`** — "a device has disconnected from the
bus" — with the UI as the source, device byte `0x30` (primary UI). Timestamp
22:32 on 2026-07-25, matching when the interface cable came off.

This log is a **99-entry circular buffer stored in flash that survives power
cycles** ([xagon0 error-codes.md](xagon0/docs/troubleshooting/error-codes.md)).
So over two months of mid-shower shutoffs, the controller recorded **nothing**:

| Would have logged | Code | Present? |
| --- | --- | --- |
| Device detach (valve, amp, UI) | 100 | Only the UI, last night |
| Valve/UI unresponsive | 101-103 | No |
| Ethernet / Wi-Fi link drop | 105 / 106 | No |
| Flash filesystem fatal | 103 | No |
| RTOS task exception | 130-137 | No |
| RTOS task abort | 138-146 | No |

`kerror_logs.cgi` reports no Konnect errors.

⚠️ **Caveat:** we do not know the log was never cleared. A single entry in a
99-slot persistent buffer is consistent with either "nothing happened" or "the
log was emptied at some point". Treat the negative result as strong but not
conclusive.

### Valve fault flags are clear

`valve1_ErrorFatal = 0`, `valve1_ErrorResettable = 0`. No latched valve fault.
The valve reports firmware `0.12` and `conn`.

### Runtime limits are disabled

`max_valve1_runtime_enable = 0`, `max_valve1_runtime = 0`. The configurable
runtime cutoff is off, so it cannot explain the shutoffs.

### The 30-minute valve watchdog does not fit

xagon0 documents an 1800-second safety timeout on **Prompt 3** valves that shuts
all outlets off if the controller stops talking to them
([saturn-protocol.md](xagon0/docs/protocols/saturn-protocol.md)). Two reasons
this is not our answer: the timeout is 30 minutes, not 2-4, and this system has a
**six-port valve** (`valve1PortsAvailable = 6`), not a Prompt 3.

## Hypotheses, ranked

### 1. The failing interface was stopping the shower — most likely

A K-99693 with a failing power connection is a device that can brown out,
reset, or register phantom touches. A "stop" sent by the interface is a
*legitimate command*, not a fault, so the controller would carry it out and log
nothing — which is exactly what we see.

This also explains the timeline: months of worsening random shutoffs, ending in
an interface that finally had to be disconnected. Same root cause, two symptoms.

**Prediction, and it is a strong one:** with the interface now fully
disconnected, **the shutoffs should stop.** Nothing else can issue that command.

**How we test it:** run showers from this app and record whether any stop
unexpectedly. This is why the trace capture matters — it converts "it feels
better" into evidence.

### 2. Controller crash-and-reboot

Owner reviews of this hardware describe crashes that "take 30 seconds to 1
minute to reboot, during which water may or may not shut off randomly"
(second-hand via search summary — see [FIELD-NOTES.md](FIELD-NOTES.md) §7, weak
evidence).

Against it: a reboot should leave a task exception or abort (130-146) in a log
that persists across power cycles, and there are none. Also testable — a reboot
would make the controller unreachable for ~30-60 s, which a trace would catch
plainly.

### 3. Thermal or supply-side fault

Codes exist for exactly this shape of failure: `OVERTEMP_CONTROL_ERROR` (3),
`OVERTEMP_OUTLET_ERROR` (7), `ALG_COLD_TIMEOUT` (38), `ALG_HOT_TIMEOUT` (39) —
several of which shut the valve down deliberately. A hot-water supply that runs
out after a few minutes would fit the *duration* well.

Against it: all of these log, and none are logged. Unless the log was cleared.

### 4. RS-485 comms instability

xagon0 documents signal-integrity problems on long runs, missing 120 Ω
termination, or cabling routed near AC
([known-issues.md](xagon0/docs/troubleshooting/known-issues.md)).

We saw `valve_1_con_string` read `dis` with `valve1_installed: false` once on
2026-07-26 at 11:43, recovering immediately
([FIELD-NOTES.md](FIELD-NOTES.md) §6). That looked like a comms dropout.

**But the error log argues against it:** a genuine valve detach should log code
100 with a valve device byte, and no such entry exists. On balance that single
bad read was more likely a partially-populated HTTP response than a real bus
event. Worth continuing to watch rather than concluding.

## What would settle it

Passive trace capture during real showers, recording at minimum:

- `valveN_Currentstatus`, `ui_shower_on`, per-outlet armed state
- `valve_N_con_string` and all `*_con_string` values
- `valveN_ErrorFatal` / `ErrorResettable`
- `cerror_logs.cgi` on change
- Controller reachability, including the gaps that indicate a reboot
- Setpoint and any temperature the controller exposes

With a timeline around a shutoff event, hypotheses 1-4 separate cleanly:

| Hypothesis | Signature in a trace |
| --- | --- |
| Interface command | Clean stop, controller reachable throughout, no error, no detach |
| Controller reboot | Controller unreachable ~30-60 s, then back with uptime reset |
| Thermal / supply | New error-log entry (3, 7, 38, 39) and/or fault flag set |
| RS-485 | `valve_1_con_string` drops to `dis` **and** a detach entry appears |

Design of that capture is pending — sampling rate has to be traded off against
the controller's documented tendency to lock up under polling
([FIELD-NOTES.md](FIELD-NOTES.md) §1).

## Separately: the interface may be repairable

The failure was a disconnected wire-to-board power connector, not a dead panel.
Reseating it is plausibly all that is required. xagon0's
[hardware.md](xagon0/docs/hardware.md) and board photograph are the reference.

Worth doing regardless of this app — a working K-99693 is also the control of
the experiment. If shutoffs resume once it is reconnected, hypothesis 1 is
confirmed outright.

⚠️ Mains-adjacent work. Power down at the breaker first.
