# Massage Patterns

The DTV+ system supports spa-mode massage functionality where body spray outlets cycle on and off in configurable patterns to create a pulsing water massage effect.

---

## Massage Modes

| Mode | Name   | Description                                      |
|------|--------|--------------------------------------------------|
| 0    | None   | Massage off -- outlets run continuously           |
| 1    | Wave   | Outlets activate/deactivate in a rolling sequence |
| 2    | Single | One outlet at a time, cycling through each        |
| 3    | Custom 1 | User-configurable pattern                       |
| 4    | Custom 2 | User-configurable pattern                       |

---

## Timing Constants

| Constant          | Value   | Used In      | Description                             |
|-------------------|---------|--------------|-----------------------------------------|
| `STAGGER_TIME`    | 500 ms  | All modes    | Delay between activating each outlet    |
| `WAVE_SLOW_3_ON`  | 1300 ms | Wave (slow)  | Duration each outlet stays on           |
| `WAVE_FAST_3_ON`  | 700 ms  | Wave (fast)  | Duration each outlet stays on           |
| `WAVE_OFF_TIME`   | 300 ms  | Wave         | Duration each outlet stays off          |
| `SINGLE_SLOW_ON`  | 600 ms  | Single (slow)| Duration the active outlet stays on     |
| `SINGLE_FAST_ON`  | 300 ms  | Single (fast)| Duration the active outlet stays on     |
| `SINGLE_OFF_TIME` | 200 ms  | Single       | Gap between one outlet off, next on     |

---

## How Wave Massage Works

In wave mode, outlets activate in sequence with overlap, creating a rippling effect across the body sprays. Each outlet turns on with a stagger delay, runs for the ON duration, then turns off in the same sequence.

### Wave Timing (Slow, 3 Outlets)

```
Outlet A: ___[=======ON 1300ms=======]_______________...
Outlet B: _________[=======ON 1300ms=======]_________...
Outlet C: _______________[=======ON 1300ms=======]___...
              |   500ms  |   500ms  |
              <--stagger--><--stagger-->

          ... [OFF 300ms][=======ON 1300ms=======] ...  (A repeats)
```

1. Outlet A turns on.
2. After 500 ms (stagger), Outlet B turns on while A is still running.
3. After another 500 ms, Outlet C turns on while A and B are still running.
4. Outlet A turns off after its 1300 ms ON period.
5. After 300 ms OFF, Outlet A turns on again to start the next cycle.

The overlapping activation creates the "wave" sensation as water pressure shifts across outlets.

### Wave Timing (Fast, 3 Outlets)

Same pattern but with 700 ms ON duration, resulting in a faster pulse.

---

## How Single Massage Works

In single mode, only one outlet runs at a time. The system cycles through each configured outlet in order.

### Single Timing (Slow)

```
Outlet A: [===ON 600ms===][OFF 200ms]________________________...
Outlet B: ________________________[===ON 600ms===][OFF 200ms]...
Outlet C: ________________________________________________[===ON 600ms===]...
```

1. Outlet A turns on for 600 ms.
2. Outlet A turns off. Wait 200 ms.
3. Outlet B turns on for 600 ms.
4. Outlet B turns off. Wait 200 ms.
5. Outlet C turns on. Cycle continues.

### Single Timing (Fast)

Same sequence but with 300 ms ON duration per outlet.

---

## Custom Massage Modes (3 and 4)

Modes 3 and 4 are user-configurable patterns stored via the web interface. Custom modes allow the installer or user to define:

- Which outlets participate in the massage pattern
- The activation order of outlets
- ON/OFF timing parameters

Custom patterns are configured through `save_variable.cgi` using the `customMassageStatus` variable (ID 96).

---

## Outlet Staggering

When activating multiple outlets (in any mode, not just massage), the system enforces a **500 ms delay** between each outlet activation. This prevents:

- **Electrical surge:** Multiple solenoid coils energizing simultaneously draws excessive current from the relay board.
- **Water hammer:** Simultaneous valve opening causes pressure spikes in the plumbing.
- **Relay damage:** Concurrent inrush currents can weld relay contacts over time.

The stagger applies both at shower startup and during massage pattern transitions.

---

## CGI Control

### massage_toggle.cgi

Toggles massage on/off for the active shower session:

```
GET /massage_toggle.cgi
```

### save_variable.cgi -- Massage Variables

| Variable ID | Name                    | Description                          |
|-------------|-------------------------|--------------------------------------|
| 33          | `valve_outlet_massage`  | Bitmask of outlets assigned to massage |
| 40          | `valve_massage_order`   | Outlet activation sequence            |
| 96          | `customMassageStatus`   | Custom massage mode configuration     |
| 101         | `clear_massage`         | Reset massage state                   |

Example -- set outlet massage assignment:

```
GET /save_variable.cgi?idx=33&val=<bitmask>
```

### quick_shower.cgi -- Massage Parameter

The quick shower endpoint accepts a massage mode parameter:

```
GET /quick_shower.cgi?valve=1&temp=40&outlet=1&massage=1
```

| Value | Meaning        |
|-------|----------------|
| 0     | No massage     |
| 1     | Wave pattern   |
| 2     | Single pattern |
| 3     | Custom mode 1  |
| 4     | Custom mode 2  |

---

## RPC Commands

The controller uses these RPC command codes to manage massage state over the internal bus:

| Command               | Code | Description                                    |
|-----------------------|------|------------------------------------------------|
| `STOP_MASSAGE`        | 5    | Stop all massage activity                      |
| `RUN_MASSAGE_CMD_1`   | 6    | Start massage pattern 1 (wave)                 |
| `RUN_MASSAGE_CMD_2`   | 30   | Start massage pattern 2 (single)               |
| `STOP_MASSAGE_VALVE1` | 32   | Stop massage on valve 1 outlets only           |
| `STOP_MASSAGE_VALVE2` | 33   | Stop massage on valve 2 outlets only           |
| `CLEAR_MASSAGE`       | 17   | Clear all massage state and reset to defaults  |

These commands are sent from the controller to the valve(s) as part of the normal polling cycle. The valve applies the outlet on/off changes at the next servo update.
