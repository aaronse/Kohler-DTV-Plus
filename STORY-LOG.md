# Story log

Significant events, findings and reversals, newest first. Raw material for the
YouTube video ([@azab2c](https://www.youtube.com/@azab2c)) and for conversations
with Kohler technical support.

Entries marked **For Kohler** are collated when contacting support.

See the Story log section of [AGENT.md](AGENT.md) for what to append and how.

---

## 2026-07-26

### 13:05 — The shutoff logs absolutely nothing, and that is now proven

The operator cleared the controller's error log **before** filming the
2026-07-14 repro, and captured it again **after**. The result:

```
No errors are logged from Controller
```

Cleared before, shutoff reproduced during, empty after. This turns yesterday's
ambiguous "the log might have been cleared" into a controlled negative result.

It rules out everything that writes to the log: device detach, device
unresponsive, valve faults, task exceptions and aborts, link drops, config
errors. And we know the mechanism works, because the UI disconnection on 07-25
was logged as code 100 within seconds.

That undercuts the hypothesis this session had been building toward. If the
valve had lost power or dropped off the RS-485 bus, code 100 is exactly what
should have appeared. It didn't.

**New leading theory:** something mechanical or hydraulic stops the water, and
the electronics never find out — a thermal or anti-scald cutoff, hot supply
exhaustion, or supply pressure loss. That explains every observation at once,
including the silence.

**Why it matters:** it changes what to instrument. If the cause is mechanical,
controller telemetry will never show it — a trace would only ever record
"running, then timed out", which we already know. The informative signal is
probably outside the controller: outlet temperature, flow, supply behaviour.
**For Kohler:** a reproducible condition in which the valve stops delivering
water, the controller continues reporting a running shower for ~1 minute, and
nothing is written to the error log. Is there any mechanical or thermal cutoff in
the valve or its install that closes flow without signalling the controller?

Bonus: the captured log header preserves the interface's own firmware versions
(UI OS v0.0.7.44, Touch Panel v0.0.0.2), which we can no longer read now that it
reports `not_seen`.

### 12:45 — Video review kills the leading hypothesis

Reviewed the operator's 2026-07-14 recording of a live shutoff. The decisive
moment is at 06:46, immediately after the water stops:

> "if I go over to the shower, it says that it's still running. It thinks that
> it's still pushing water out, or at least the controller does, but obviously
> it's not."

The controller keeps displaying a running shower for **about a minute**, then
times out and reverts to the clock screen.

A commanded stop — from the interface, this app, or anything else — sets the
controller's state to off immediately. That is not what happens. **The water
stops first and the controller finds out later.**

This kills the theory that a failing K-99693 was sending spurious stop commands,
which the operator was independently sceptical of. The investigation moves from
the interface to the valve.

Two supporting details from the same recording: the setpoint reverted from 97 to
96 °F on its own (96 is `def_temp`, so something reloaded defaults — the
signature of a reset), and there were no error messages or status LEDs anywhere.

**Why it matters:** we were about to instrument the wrong end of the system.
**For Kohler:** the controller has no awareness that the valve has stopped
delivering water until an internal timeout fires roughly a minute later. During
that window it reports a running shower to the user and to the API.

### 12:10 — Error log read for the first time

`cerror_logs.cgi` holds exactly one entry in a 99-slot circular buffer that
survives power cycles:

```
[10:32.42 p.m. 07/25/2026] 100:  UI Error
```

Code 100 is `DETACH_EVENT`, device byte `0x30` = primary UI — the interface
connector coming out the previous evening. Nothing else. Two months of shutoffs
produced no valve detach, no valve fault, no task exception, no link drop.
`kerror_logs.cgi` reports nothing from Konnect.

**Why it matters:** either these shutoffs genuinely aren't logged, or the log was
cleared at some point. We can't tell which, and it's now the biggest gap in the
evidence.
**For Kohler:** is there any condition under which the controller stops
delivering water without writing to the error log? And can the log be cleared by
a normal operation such as a firmware update or factory reset?

### 11:43 — Caught a valve dropout while idle

A routine `values.cgi` read returned `valve_1_con_string: 'dis'` and
`valve1_installed: false` on a valve that was healthy immediately before and
after. Four reads over the following minute were all normal, with no command
sent. Roughly one bad read in 30-50.

Initially written off as a partially-populated HTTP response. After the video
review it looks more interesting — "controller has lost the valve" is exactly
the state a shutoff produces.

**Why it matters:** it may be a quiet-moment glimpse of the actual failure mode.
Also forced a real fix: the proxy caches `values.cgi`, so one bad read would
have blanked the UI for 30 seconds — possibly with someone standing in the
shower.

### 10:30 — Community research changed the app's design

Surveyed everyone who has driven a DTV+ over the network. Three separate people
had locked this controller up with polling — no HTTP, no ping, for hours,
sometimes needing a power cycle, while the touchscreen kept working.

**Our app was polling every 2.5 seconds, roughly six times faster than the
interval already known to be unsafe.** Backed off to 15 s idle / 5 s active and
cached the configuration endpoint. Idle load went from ~0.8 to ~0.07 req/s.

Also found and fixed two bugs this hardware cannot demonstrate: outlet numbering
uses two different index spaces (they happen to coincide here), and `PurgeActive`
means water is already running during the auto-purge warm-up.

**Why it matters:** the fix arrived from reading other people's failures rather
than from wedging our own controller.

### 09:00 — First working control path

Reverse-engineered the controller's API by mirroring its own web UI. The blocker
nobody's writeup leads with: the `.cgi` endpoints answer in **HTTP/0.9** — a bare
body with no status line — which Node, `fetch` and every browser reject outright.
Solved with a raw TCP client.

Built a React app styled after the K-99693, driving the live controller.
`stop_shower.cgi` returned the controller's `:)` — command path confirmed
end-to-end without opening a valve.

**For Kohler:** the local CGI API answering in HTTP/0.9 makes the controller
unreachable from any standard HTTP client library. A status line would make this
integrable with no other change.

## 2026-07-25

### 22:32 — Interface connector pulled out

The original installation silicone-sealed the interface housing to the wall,
including the blue seal plug. Removing the interface left the plug attached to
the wall, which pulled the internal wire-to-board connector out of its socket.

Logged by the controller as `DETACH_EVENT` at 22:32.

The connector is not reachable without opening the housing. Contacts were
inspected while accessible: clean copper and gold, no corrosion — the housing was
vapor-tight and recessed well away from direct water.

The original intent was only to inspect for corrosion behind the panel.

**Why it matters:** this is why the project exists. It is *not* the cause of the
shutoffs, which predate it by ~2 months.
**For Kohler:** sealing the housing and the blue seal plug together at
installation makes the interface effectively non-removable without pulling the
internal connector. Is there a supported method for reconnecting it without
cutting the housing open? The unit is ~$1500.
