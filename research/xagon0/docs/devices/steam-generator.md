# Steam Generator Module

## Overview

The steam generator produces steam for shower enclosures. It communicates over the **DTV+ protocol** and manages temperature regulation, timed operation, and power clean cycles.

## Device Configuration

| Parameter | Value |
|---|---|
| Device ID | `0x05` |
| Protocol | DTV+ |
| Tick interval | 150 ms |
| Max temperature | 125 degrees F |

## Operating States

| State | Value | Description |
|---|---|---|
| STEAM_OFF | `0x00` | Generator idle |
| STEAM_ON | `0xFF` | Normal steam generation |
| STEAM_POWER_CLEAN | `0xCC` | Power clean sanitization cycle |

## Temperature Format

Steam temperatures use **Fx2 format** (Fahrenheit times 2).

**Conversion from Cx2 to Fx2:**

```
Fx2 = ((Cx2 * 9) / 5) + 64
```

**Example:** Cx2 of 70 (35 degrees C) converts to Fx2 of 190 (95 degrees F).

| Constant | Cx2 Value | Actual Temp |
|---|---|---|
| MIN_STEAM_SETPOINT | 48 | 24 degrees C / 75 degrees F |
| Max pre-heat duration | -- | 10 minutes |
| Overtemp safety limit | -- | 125 degrees F |

## Timer System

The steam generator uses a simple second-based timer:

- `steamOnTicker` increments by 1 each second while the generator is active.
- When `steamOnTicker >= steamTimerSetTime`, the generator automatically shuts off.
- The timer value persists across pause/resume cycles.
- Setting `steamTimerSetTime` to 0 disables automatic shutoff (manual control only).

## Communication

### GET_DEV_STATUS (0x30)

**Request:**

```
DTV+ header | Device 0x05 | Command 0x30 | CRC
```

**Response:**

```
DTV+ header | Device 0x05 | Command 0x30 |
  Actual temp (Fx2) | Desired temp (Fx2) |
  Operation state | Timer minutes | Timer seconds |
  Error flags | CRC
```

### SET_DEV_PARAM (0x34)

**Request:**

```
DTV+ header | Device 0x05 | Command 0x34 |
  Desired temp (Fx2) | Operation state |
  Timer duration (minutes) | CRC
```

No explicit response is expected. Poll with GET_DEV_STATUS to confirm the change took effect.

## Error Bits

Error flags are returned as a bitmask in the status response:

| Error | Bit | Mask | Description |
|---|---|---|---|
| Thermistor fault | 2 | `0x04` | Temperature sensor failure |
| Communication error | 3 | `0x08` | Serial link to generator lost |
| Overtemperature | 5 | `0x20` | Steam temp exceeded safety limit |
| Safety circuit | 6 | `0x40` | Hardware safety interlock tripped |

Multiple error bits can be set simultaneously.

## Recovery Logic

When a communication error occurs:

1. The controller retries the failed command up to **4 times**.
2. Each retry uses the standard 150 ms tick interval.
3. If all 4 retries fail, the error is marked as **permanent**.
4. A permanent error requires a system restart or manual reset to clear.

Transient errors (such as a single missed response) will self-clear on the next successful exchange.

## State Machine

```
         +----------+
         |   INIT   |
         +----------+
              |
              v
         +----------+
    +--->|   OFF    |<---+
    |    +----------+    |
    |         |          |
    |         v          |
    |    +----------+    |
    |    |   ON     |----+  (timer expired or error)
    |    +----------+
    |         |
    |         v
    |   +-----------+
    +---|  PREHEAT  |
    |   +-----------+
    |         |
    |         v
    |   +-----------+
    +---| STEAMING  |
    |   +-----------+
    |         |
    |         v
    |   +-----------+
    +---|  COOLDOWN |
        +-----------+
```

## Datatable Variables

### Writable Variables

| Variable | Description |
|---|---|
| DT_W_SteamActualTemperature | Current steam temperature (Fx2) |
| DT_W_SteamDesiredTemperature | Target steam temperature (Fx2) |
| DT_W_SteamOperationState | Current operating state |
| DT_W_SteamOperationTimerMinutes | Timer minutes remaining |
| DT_W_SteamOperationTimerSeconds | Timer seconds remaining |
| DT_W_SteamDuration | Configured session duration (minutes) |

## Steam Status Codes

These are the high-level status values exposed to the user interface:

| Code | Name | Description |
|---|---|---|
| 0 | NOT_INSTALLED | No steam generator detected |
| 1 | OFF | Generator present but idle |
| 2 | ON | Actively producing steam |
| 3 | PC_ACTIVE | Power clean cycle running |
| 4 | PC_WARNING | Power clean recommended soon |
| 5 | PC_REQUIRED | Power clean overdue |
| 6 | ERROR | Generator fault (see error bits) |
| 7 | PURGE_ACTIVE | Post-session purge in progress |
| 8 | INVALID | Unknown or corrupt state |

## Power Clean

Power clean runs the generator at an elevated temperature to sanitize the boiler and plumbing. It is recommended every **600 minutes** of cumulative steam runtime.

- Triggered by setting operation state to `STEAM_POWER_CLEAN` (`0xCC`).
- The generator runs at a higher temperature than normal operation.
- Duration is fixed by the generator firmware.
- Status transitions through `PC_ACTIVE` and back to `OFF` when complete.
- If power clean is overdue, the status code will report `PC_WARNING` (approaching limit) or `PC_REQUIRED` (past limit).
