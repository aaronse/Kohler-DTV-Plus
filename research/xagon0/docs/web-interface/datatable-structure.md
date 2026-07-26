# Datatable Structure Reference

The datatable is the shared memory structure used by the Kohler DTV+ controller and UI to exchange configuration, status, and control data. Understanding its layout is essential for reading and writing system state directly.

---

## Overview

The datatable acts as a communication bridge between the controller (valve/steam/lighting hardware) and the UI (touchscreen or web interface). Both sides read and write variables in the datatable, which is organized into typed, paged memory regions.

All configuration, user preferences, runtime state, and error flags live in the datatable. The web interface accesses it through `edit_dt.cgi` (direct read/write), `values.cgi` (bulk read), and `save_variable.cgi` (high-level write with validation).

---

## Memory Organization

The datatable is divided into two address regions per data type:

| Region | Index Range | Description |
|--------|-------------|-------------|
| **Stationary** | 0-127 | Always accessible without page switching. Used for frequently accessed variables (current state, active settings). |
| **Active Page** | 128-255 | Requires a page switch before access. Used for per-user, per-outlet, and extended configuration data. |

A page switch selects which block of data occupies the 128-255 index range. The stationary region (0-127) is always visible regardless of which page is active.

---

## Data Types

| Type | Code | Size | Total Pages | Description |
|------|------|------|-------------|-------------|
| BYTE | `0` | 8-bit unsigned | 31 | Single-byte values, flags, enums |
| WORD | `1` | 16-bit unsigned | 17 | Temperatures, timers, counters |
| COLOR | `2` | 32-bit ARGB | 3 | Color values (Alpha, Red, Green, Blue) |
| STRING | `3` | 26 characters max | 3 | Names, labels, identifiers |

When using `edit_dt.cgi`, the `type` parameter selects the data type: `0` = byte, `1` = word, `2` = color, `3` = string.

---

## Page Sizes

### Byte Pages (31 pages)

| Page | Name | Element Count |
|------|------|---------------|
| Stationary | `DT_BYTE_S` | 128 |
| 0 | `DT_BYTE_P0` | 74 |
| 1 | `DT_BYTE_P1` | 18 |
| 2 | `DT_BYTE_P2` | 21 |
| 3 | `DT_BYTE_P3` | 21 |
| 4 | `DT_BYTE_P4` | 21 |
| 5 | `DT_BYTE_P5` | 21 |
| 6 | `DT_BYTE_P6` | 21 |
| 7 | `DT_BYTE_P7` | 21 |
| 8 | `DT_BYTE_P8` | 84 |
| 9 | `DT_BYTE_P9` | 38 |
| 10 | `DT_BYTE_P10` | 38 |
| 11 | `DT_BYTE_P11` | 20 |
| 12 | `DT_BYTE_P12` | 126 |
| 13 | `DT_BYTE_P13` | 126 |
| 14 | `DT_BYTE_P14` | 126 |
| 15 | `DT_BYTE_P15` | 126 |
| 16 | `DT_BYTE_P16` | 126 |
| 17 | `DT_BYTE_P17` | 126 |
| 18 | `DT_BYTE_P18` | 126 |
| 19 | `DT_BYTE_P19` | 18 |
| 20 | `DT_BYTE_P20` | 11 |
| 21 | `DT_BYTE_P21` | 84 |
| 22 | `DT_BYTE_P22` | 10 |
| 23 | `DT_BYTE_P23` | 24 |
| 24 | `DT_BYTE_P24` | 23 |
| 25 | `DT_BYTE_P25` | 32 |
| 26 | `DT_BYTE_P26` | 88 |
| 27 | `DT_BYTE_P27` | 1 |
| 28 | `DT_BYTE_P28` | 1 |
| 29 | `DT_BYTE_P29` | 1 |
| Ghost | `DT_BYTE_GHOST` | 44 |

### Word Pages (17 pages)

| Page | Name | Element Count |
|------|------|---------------|
| Stationary | `DT_WORD_S` | 101 |
| 0 | `DT_WORD_P0` | 90 |
| 1 | `DT_WORD_P1` | 1 |
| 2 | `DT_WORD_P2` | 25 |
| 3 | `DT_WORD_P3` | 25 |
| 4 | `DT_WORD_P4` | 25 |
| 5 | `DT_WORD_P5` | 25 |
| 6 | `DT_WORD_P6` | 25 |
| 7 | `DT_WORD_P7` | 25 |
| 8 | `DT_WORD_P8` | 139 |
| 9 | `DT_WORD_P9` | 24 |
| 10 | `DT_WORD_P10` | 6 |
| 11 | `DT_WORD_P11` | 24 |
| 12 | `DT_WORD_P12` | 37 |
| 13 | `DT_WORD_P13` | 1 |
| 14 | `DT_WORD_P14` | 1 |
| 15 | `DT_WORD_P15` | 1 |
| Ghost | `DT_WORD_GHOST` | 15 |

### Color Pages (3 pages)

| Page | Name | Element Count |
|------|------|---------------|
| Stationary | `DT_COLOR_S` | 1 |
| 0 | `DT_COLOR_P0` | 1 |
| Ghost | `DT_COLOR_GHOST` | 59 |

### String Pages (3 pages)

| Page | Name | Element Count | Max Chars per Entry |
|------|------|---------------|---------------------|
| Stationary | `DT_STRING_S` | 128 | 26 |
| 0 | `DT_STRING_P0` | 0 (empty) | -- |
| Ghost | `DT_STRING_G` | 31 | 65 |

---

## Ghost Pages

Ghost pages (`DT_BYTE_GHOST`, `DT_WORD_GHOST`, `DT_COLOR_GHOST`, `DT_STRING_G`) contain controller-internal variables that are **not synchronized** with the UI under normal operation. They are used for:

- Internal counters and state machines
- Debugging and diagnostic values
- Intermediate calculation results
- Hardware driver state

Ghost variables can be read via `edit_dt.cgi` with `page=g` or `page=G` for debugging purposes, but writing to them can cause unpredictable behavior.

---

## Variable Naming Convention

Variables follow a prefix naming convention based on their data type:

| Prefix | Data Type | Example |
|--------|-----------|---------|
| `DT_B_` | Byte | `DT_B_SHOWER_STATE` |
| `DT_W_` | Word | `DT_W_CURRENT_TEMP` |
| `DT_S_` | String | `DT_S_USER_NAME` |
| `DT_C_` | Color | `DT_C_RAIN_COLOR` |

---

## Common Variables

### System State (Stationary Byte)

| Index | Name | Description |
|-------|------|-------------|
| 0 | System mode | Current operating mode |
| 1 | Shower state | `0` = idle, `1` = starting, `2` = running, `3` = pausing |
| 2 | Active user | Currently active user preset (0 = none, 1-6) |
| 3 | Error flags low | Error bitfield (low byte) |
| 4 | Error flags high | Error bitfield (high byte) |
| 5 | Device status | Connected device bitfield |

### Shower Control (Stationary Word)

| Index | Name | Description |
|-------|------|-------------|
| 0 | Current temp valve 1 | Current water temperature, valve 1 (x10 for decimal) |
| 1 | Target temp valve 1 | Setpoint temperature, valve 1 (x10) |
| 2 | Current temp valve 2 | Current water temperature, valve 2 (x10) |
| 3 | Target temp valve 2 | Setpoint temperature, valve 2 (x10) |
| 4 | Active outlets valve 1 | Bitfield of active outlets |
| 5 | Active outlets valve 2 | Bitfield of active outlets |

### Steam (Stationary Word)

| Index | Name | Description |
|-------|------|-------------|
| 10 | Steam temperature | Current steam temperature |
| 11 | Steam target | Steam target temperature |
| 12 | Steam timer | Remaining steam time in seconds |

### Lighting (Stationary Byte)

| Index | Name | Description |
|-------|------|-------------|
| 20 | Light module 1 state | `0` = off, brightness level otherwise |
| 21 | Light module 2 state | Same as above |
| 22 | Light module 3 state | Same as above |

---

## Write Protection

Each datatable variable has an associated permission flag that determines whether it can be written from the UI side. The controller enforces these permissions. Attempting to write a read-only variable via `edit_dt.cgi` will succeed at the protocol level (you will receive `":)"`) but the controller will overwrite the value on its next update cycle.

Variables that are written by the controller (sensor readings, state flags, error codes) should be treated as read-only from the web interface.

---

## Language Support

The system supports 14 languages, identified by the following enum values:

| Value | Language |
|-------|----------|
| 0 | English |
| 1 | Arabic |
| 2 | Chinese (Simplified) |
| 3 | Mandarin (Traditional) |
| 4 | British English |
| 5 | German |
| 6 | Italian |
| 7 | Korean |
| 8 | Japanese |
| 9 | Portuguese |
| 10 | Russian |
| 11 | Thai |
| 12 | French |
| 13 | Spanish |

Set via `save_variable.cgi?index=4&value=<N>`, followed by `rpc.cgi?index=35` (`POPULATE_LANGUAGE`) to load the strings.

---

## Datatable Version

The datatable schema version is **65**. This version number must match between the controller firmware and the UI firmware. A version mismatch causes a communication failure and the UI will display an error.

The version can be read from the stationary byte page and is exchanged during the initial handshake between controller and UI.

---

## Persistence

Datatable values are persisted to flash memory under the following conditions:

- **Automatic save:** Configuration changes made via `save_variable.cgi` are automatically persisted.
- **Manual save:** Call `rpc.cgi?index=7` (`DATA_TABLE_SAVE_REQ`) or `saveDT.cgi` to force a save.
- **User preferences:** Stored per-user (users 1-6) in dedicated byte/word pages (pages 2-7 correspond to users 1-6).
- **Power-up restore:** All persisted values are restored from flash on power-up. Volatile state (current temperature readings, timer counts) starts from zero.

---

## Amulet Protocol Opcodes for Datatable Access

The physical touchscreen communicates with the controller via the Amulet serial protocol. The protocol defines specific opcodes for datatable read/write operations. These are relevant if you are building a hardware-level interface:

- Byte read/write uses dedicated Amulet commands per variable index
- Word read/write uses separate opcodes with 16-bit values
- String operations transfer up to 26 characters per transaction
- Page switches are issued before accessing active-page variables

The web interface abstracts this via `edit_dt.cgi` and `values.cgi`, so direct Amulet protocol knowledge is only needed for embedded development.

---

## Page Access via edit_dt.cgi

### Read a stationary byte

```
GET /edit_dt.cgi?type=0&page=s&index=1
```

Returns the current shower state.

### Write a value to byte page 20, index 5

```
GET /edit_dt.cgi?type=0&page=20&index=5&value=1
```

### Read a word from the stationary page

```
GET /edit_dt.cgi?type=1&page=s&index=0
```

Returns the current water temperature for valve 1.

### Read a ghost byte (debug)

```
GET /edit_dt.cgi?type=0&page=g&index=12
```

### Write a string to the stationary string page

```
GET /edit_dt.cgi?type=3&page=s&index=0&value=MyShowerSystem
```

String values are limited to 25 characters (the 26th byte is a null terminator).

### Read a color value

```
GET /edit_dt.cgi?type=2&page=s&index=0
```

Returns a 32-bit ARGB color value.

---

## Notes

- The stationary page is always index `s` or `S` in `edit_dt.cgi`, not a number.
- Page numbers `0`-`29` map to the active pages listed in the size tables above.
- Ghost pages use `g` or `G` and are primarily for debugging.
- Response `":)"` means the operation succeeded. Response `":("` means the page identifier was invalid.
- When polling values for a custom UI, prefer `values.cgi` for bulk reads and `edit_dt.cgi` for targeted single-variable access.
