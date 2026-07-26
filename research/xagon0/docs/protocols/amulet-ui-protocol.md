# Amulet UI Protocol Specification

## Overview

The Amulet UI protocol is a Modbus-like CRC-protected protocol used for communication between the DTV+ controller and the touchscreen display. It implements a **datatable memory model** where the controller maintains authoritative state and pushes updates to the UI, while the UI sends user interactions back via remote procedure calls (RPCs).

The protocol is named after the Amulet display module used in earlier DTV+ touchscreen variants, but the same protocol is used regardless of whether the display hardware is the ColdFire-based Amulet or the ARM/Linux-based variant.

---

## Physical Layer

| Parameter | Value |
|---|---|
| Interface | UART |
| Baud Rate | 115200 bps |
| Data Bits | 8 |
| Parity | None |
| Stop Bits | 1 |
| Flow Control | None |
| RX Timeout | 150 ms |

---

## Frame Format

```
+----------+--------+-----------+------  ------+---------+---------+
| SLAVE_ID | OPCODE | VAR_INDEX | DATA (var)   | CRC_LSB | CRC_MSB |
| 1 byte   | 1 byte | 1 byte   | 0-N bytes    | 1 byte  | 1 byte  |
+----------+--------+-----------+------  ------+---------+---------+
```

| Field | Size | Description |
|---|---|---|
| SLAVE_ID | 1 byte | Target device identifier |
| OPCODE | 1 byte | Operation code (read/write/invoke) |
| VAR_INDEX | 1 byte | Datatable variable index |
| DATA | 0-N bytes | Opcode-specific payload |
| CRC_LSB | 1 byte | CRC-16 low byte |
| CRC_MSB | 1 byte | CRC-16 high byte |

---

## Slave IDs

| ID | Name | Description |
|---|---|---|
| 0x01 | AMULET | Touchscreen display (slave) |
| 0x02 | HOST | DTV+ controller (master) |

The controller sends frames addressed to `0x01` (AMULET). The touchscreen sends frames addressed to `0x02` (HOST).

---

## Opcodes

### Read Operations (Controller -> UI or UI -> Controller)

| Opcode | Name | Description |
|---|---|---|
| 0x20 | GET_BYTE_VAR | Read a single byte variable |
| 0x21 | GET_WORD_VAR | Read a single 16-bit word variable |
| 0x22 | GET_STRING_VAR | Read a string variable (null-terminated) |
| 0x23 | GET_COLOR_VAR | Read a 32-bit color variable (ARGB) |
| 0x24 | GET_BYTE_VAR_ARRAY | Read an array of byte variables |
| 0x25 | GET_WORD_VAR_ARRAY | Read an array of word variables |
| 0x26 | GET_COLOR_VAR_ARRAY | Read an array of color variables |
| 0x27 | GET_RAM_RPCS | Read pending RPC queue from RAM |
| 0x28 | GET_LABEL_VAR | Read a label/text variable |

### Write Operations (Controller -> UI or UI -> Controller)

| Opcode | Name | Description |
|---|---|---|
| 0x30 | SET_BYTE_VAR | Write a single byte variable |
| 0x31 | SET_WORD_VAR | Write a single 16-bit word variable |
| 0x32 | SET_STRING_VAR | Write a string variable |
| 0x33 | SET_COLOR_VAR | Write a 32-bit color variable |
| 0x34 | SET_BYTE_VAR_ARRAY | Write an array of byte variables |
| 0x35 | SET_WORD_VAR_ARRAY | Write an array of word variables |
| 0x36 | SET_COLOR_VAR_ARRAY | Write an array of color variables |
| 0x37 | INVOKE_RPC | Invoke a remote procedure call |

---

## Datatable Structure

The datatable is a shared memory model organized into pages. Variables are accessed by type, page, and index within the page.

### Page Organization

Pages are divided into two regions:

- **Stationary pages (0-127):** Always accessible regardless of which UI screen is active. Used for global state (temperature, device status, etc.).
- **Active pages (128-255):** Switched when the user navigates between screens. Only the current page's variables are accessible.

### Page Counts by Data Type

| Data Type | Size | Stationary | Active | Ghost | Total Pages |
|---|---|---|---|---|---|
| BYTE | 8-bit | S + P0-P29 | (page-switched) | 1 GHOST | 31 pages |
| WORD | 16-bit | S + P0-P15 | (page-switched) | 1 GHOST | 17 pages |
| COLOR | 32-bit ARGB | 3 pages | - | - | 3 pages |
| STRING | 26 bytes max | 3 pages | - | - | 3 pages |

### Ghost Pages

Ghost pages are **controller-only** storage. They exist in the datatable on the controller side but are invisible to the UI. The touchscreen never reads or writes ghost variables. This is useful for internal controller state that does not need to be displayed.

### Data Types

| Type | Size | Format |
|---|---|---|
| BYTE | 1 byte | Unsigned 8-bit integer |
| WORD | 2 bytes | Unsigned 16-bit integer, **little-endian** (LSB first) |
| COLOR | 4 bytes | ARGB format (Alpha, Red, Green, Blue), 1 byte each |
| STRING | Up to 26 bytes | Null-terminated, maximum 25 printable characters + null |

---

## CRC-16 Calculation

The protocol uses **CRC-16/Modbus** for frame integrity.

| Parameter | Value |
|---|---|
| Polynomial | 0xA001 (reflected representation of 0x8005) |
| Initial Value | 0xFFFF |
| Byte Order | Little-endian (LSB transmitted first) |

### Algorithm

```
function crc16_modbus(data[], length):
    crc = 0xFFFF

    for i = 0 to length - 1:
        crc = crc XOR data[i]
        for bit = 0 to 7:
            if (crc AND 0x0001) != 0:
                crc = (crc >> 1) XOR 0xA001
            else:
                crc = crc >> 1

    return crc   // 16-bit result
```

### Worked Example

Computing CRC for bytes: `[0x01, 0x20, 0x0A]` (SLAVE_ID=0x01, OPCODE=GET_BYTE_VAR, VAR_INDEX=0x0A)

```
Initial CRC = 0xFFFF

Byte 0x01:
  CRC = 0xFFFF XOR 0x01 = 0xFFFE
  Bit 0: LSB=0, shift -> 0x7FFF
  Bit 1: LSB=1, shift XOR poly -> 0x3FFF XOR 0xA001 = 0x9FFE
  Bit 2: LSB=0, shift -> 0x4FFF
  Bit 3: LSB=1, shift XOR poly -> 0x27FF XOR 0xA001 = 0x87FE
  Bit 4: LSB=0, shift -> 0x43FF
  Bit 5: LSB=1, shift XOR poly -> 0x21FF XOR 0xA001 = 0x81FE
  Bit 6: LSB=0, shift -> 0x40FF
  Bit 7: LSB=1, shift XOR poly -> 0x207F XOR 0xA001 = 0x807E
  CRC after byte 0x01 = 0x807E

  (Remaining bytes processed similarly...)

Final CRC = [computed 16-bit value]
Transmit: CRC_LSB = CRC & 0xFF, CRC_MSB = (CRC >> 8) & 0xFF
```

> **Implementation tip:** Use a 256-entry lookup table for performance. Pre-compute CRC for each byte value and XOR into the running CRC.

---

## Protocol State Machine

```
                    +----------------+
          +-------->| WAIT_SLAVE_ID  |
          |         +-------+--------+
          |                 | byte received
          |                 v
          |         +----------------+
          |         | WAIT_OPCODE    |
          |         +-------+--------+
          |                 | byte received
          |                 v
          |         +----------------+
          |         | WAIT_VAR_INDEX |
          |         +-------+--------+
          |                 | byte received
          |                 v
          |     +-----------+-----------+
          |     |                       |
          |     v                       v
          | +-------------------+  +------------------------+
          | | WAIT_COUNT        |  | WAIT_TERMINATED_VALUE  |
          | | (array ops:       |  | (string ops:           |
          | |  known length)    |  |  until null or max)    |
          | +--------+----------+  +-----------+------------+
          |          |                         |
          |          +----------+--------------+
          |                     | all data received
          |                     v
          |            +----------------+
          |            | WAIT_CRC_LSB   |
          |            +-------+--------+
          |                    | byte received
          |                    v
          |            +----------------+
          |            | WAIT_CRC_MSB   |
          |            +-------+--------+
          |                    | byte received
          |                    v
          |            +----------------+
          +------------| FRAME_COMPLETE |
            reset      +----------------+
           (timeout        | CRC check
            or error)      v
                       process frame
```

The RX timeout (150 ms) resets the state machine to WAIT_SLAVE_ID if a complete frame is not received within the timeout window.

---

## Annotated Packet Captures

### Example 1: Read Byte Variable

Controller requests byte variable at index 10 from the UI:

```
TX: 01  20  0A  [CRC_L] [CRC_H]
    |   |   |
    SID OP  IDX
    =UI =GET =10
        BYTE

Response from UI:
RX: 02  20  0A  [value]  [CRC_L] [CRC_H]
    |   |   |   |
    SID OP  IDX DATA
    =HOST       =current value of byte var 10
```

### Example 2: Write Word Variable

Controller writes value 0x01F4 (500 decimal) to word variable index 5:

```
TX: 01  31  05  F4  01  [CRC_L] [CRC_H]
    |   |   |   |   |
    SID OP  IDX LSB MSB
    =UI =SET    =0x01F4 (little-endian)
        WORD

Note: Word values are little-endian. 0x01F4 is sent as F4 01.
```

### Example 3: Invoke RPC

Controller invokes RPC index 3 with one byte argument (0x01):

```
TX: 01  37  03  01  [CRC_L] [CRC_H]
    |   |   |   |
    SID OP  IDX ARG
    =UI =RPC =3 =0x01
        INVOKE

The UI processes RPC 3 with argument 0x01 and may
respond with updated variable values or a status frame.
```

---

## Data Flow Diagrams

### UI to Controller (Touch Event)

```
  Touchscreen                              Controller
      |                                        |
      |  User presses "Start Steam"            |
      |                                        |
      |-- INVOKE_RPC (rpc_idx=steam_start) --->|
      |   [01 37 XX 01 CRC CRC]               |
      |                                        |
      |   Controller processes RPC:            |
      |   - Sends Saturn cmd to valve          |
      |   - Sends DTV+ cmd to steam gen        |
      |   - Updates datatable variables        |
      |                                        |
      |<-- SET_BYTE_VAR (steam_status=ON) -----|
      |   [01 30 XX 01 CRC CRC]               |
      |                                        |
      |<-- SET_WORD_VAR (steam_temp=104) ------|
      |   [01 31 XX 68 00 CRC CRC]            |
      |                                        |
      |   UI updates display with new values   |
```

### Controller to UI (Device Status Change)

```
  Steam Generator       Controller                Touchscreen
      |                     |                          |
      |-- STATUS_UPDATE --->|                          |
      |   (temp changed)    |                          |
      |                     |  Update datatable:       |
      |                     |  word_var[temp_idx]=106  |
      |                     |                          |
      |                     |-- SET_WORD_VAR --------->|
      |                     |   (temp_display=106)     |
      |                     |                          |
      |                     |   UI shows new temp      |
```

### Communication Flow: Typical Exchange

```
Controller                                  Touchscreen (Amulet)
    |                                            |
    |-- GET_BYTE_VAR (idx=10) ----------------->|
    |   [01 20 0A CRC CRC]                      |
    |                                            |
    |<-- Response (value=0x40) -----------------|
    |   [02 20 0A 40 CRC CRC]                   |
    |                                            |
    |-- SET_WORD_VAR (idx=5, val=500) --------->|
    |   [01 31 05 F4 01 CRC CRC]                |
    |                                            |
    |   (no response expected for SET)           |
    |                                            |
    |<-- INVOKE_RPC (idx=3, arg=0x01) ----------|
    |   [02 37 03 01 CRC CRC]                   |
    |                                            |
    |   Controller processes RPC 3...            |
    |                                            |
    |-- SET_BYTE_VAR (idx=12, val=0x01) ------->|
    |   [01 30 0C 01 CRC CRC]                   |
    |                                            |
```

---

## Data Storage Model

The controller is the **master and authoritative source** for all data. The touchscreen is a **slave and display-only** device.

Key principles:

1. **Controller owns all state.** Device statuses, temperatures, presets, configurations -- all stored and managed by the controller.
2. **UI is stateless.** The touchscreen does NOT store persistent data. It displays whatever the controller tells it and forwards user input as RPCs.
3. **Datatable is a shared view.** The datatable provides a structured way for the controller to push display data and for the UI to read it.
4. **RPCs are fire-and-forget from the UI perspective.** The touchscreen sends an RPC and trusts the controller to handle it. The controller then updates the datatable to reflect the result.

---

## Key Datatable Variables

| Variable | Type | Index | Description |
|---|---|---|---|
| DT_B_DisplayBrightness | BYTE | 10 | Display backlight brightness (0-255) |
| interface_auto_dim | CGI | 30 | Auto-dim timeout setting |
| interface_start_screen | CGI | 31 | Default start screen after wake |

> **CGI indices** refer to configuration/parameter indices accessible through the web interface or internal configuration system, mapped into the datatable.

---

## Faking Devices

To make the UI display controls for a device that may not be physically connected, set the corresponding status byte in the datatable to indicate the device is present and online.

For example, to make the UI show steam controls even without a steam generator connected:

1. Locate the byte variable index for steam device status
2. Set it to a non-zero "present" value using SET_BYTE_VAR
3. The UI will render the steam control panel as if the device were installed

This technique is useful for development, testing, and for building replacement controllers that support a subset of devices.

---

## Endianness Notes

| Data Type | Byte Order | Example |
|---|---|---|
| WORD (16-bit) | Little-endian (LSB first) | 0x01F4 sent as `F4 01` |
| CRC-16 | Little-endian (LSB first) | CRC 0xABCD sent as `CD AB` |
| COLOR (32-bit) | 4 bytes: A, R, G, B | Opaque red: `FF FF 00 00` |
| BYTE | Single byte | No endianness concern |
| STRING | Sequential characters | Null-terminated, left to right |

---

## UI Device Detection

The touchscreen connection uses a two-phase detection process:

1. **DTV+ protocol phase:** The controller first uses the standard DTV+ protocol on the UI port for device discovery (DEV_ADDRESS_OPP, DEV_REQUEST_ADDR, DEV_ASSIGN_ADDR). This identifies the UI hardware type and firmware version.

2. **Amulet CRC protocol phase:** After discovery, the connection switches to the Amulet CRC protocol for ongoing datatable communication. All subsequent frames use the SLAVE_ID/OPCODE/VAR_INDEX/DATA/CRC format.

This hybrid approach means the UI port must support both protocols, switching based on the connection state.

---

## Minimum Viable Implementation

To get a replacement controller communicating with an existing DTV+ touchscreen, implement the following:

### Required Components

| Component | Details |
|---|---|
| UART | 115200 8N1, no flow control |
| CRC-16 | Modbus polynomial 0xA001, init 0xFFFF |
| Frame Parser | State machine for SLAVE_ID -> OPCODE -> VAR_INDEX -> DATA -> CRC |
| Opcode Handler | Process GET_BYTE_VAR, GET_WORD_VAR, GET_STRING_VAR, SET_*, INVOKE_RPC |
| Datatable | Arrays for BYTE, WORD, COLOR, STRING variables (at least stationary pages) |
| RPC Dispatcher | Map RPC indices to handler functions |
| Periodic Tick | ~50 ms interval for pushing updated variables to the UI |

### Implementation Checklist

1. **Initialize UART** at 115200 8N1
2. **Implement CRC-16/Modbus** -- use a lookup table for speed
3. **Build frame parser** with the state machine shown above, with 150 ms RX timeout
4. **Allocate datatable arrays:**
   - `byte_vars[31][N]` -- 31 pages of byte variables
   - `word_vars[17][N]` -- 17 pages of word variables
   - `color_vars[3][N]` -- 3 pages of color variables
   - `string_vars[3][N]` -- 3 pages of string variables (26 bytes each)
5. **Handle GET opcodes:** When the UI requests a variable, respond with the current value from the datatable
6. **Handle SET opcodes:** When receiving a SET, update the datatable entry
7. **Handle INVOKE_RPC:** Dispatch to handler functions based on RPC index
8. **50 ms tick:** Periodically push changed variables to the UI using SET_*_VAR frames
9. **DTV+ discovery:** Implement the DTV+ protocol device discovery sequence on the UI port before switching to Amulet CRC mode

### Minimal Datatable for Basic Operation

At minimum, populate:
- Display brightness variable
- Device status bytes (to show/hide device controls)
- Temperature display variables
- Basic preset/scene variables
- Screen navigation variables

---

## Implementation Notes

### CRC Verification

Every received frame must be CRC-verified before processing. Compute CRC over SLAVE_ID + OPCODE + VAR_INDEX + DATA, then compare against the received CRC_LSB and CRC_MSB. Discard frames with CRC mismatches silently (do not send error responses).

### Page Management

When the UI navigates to a new screen, the active page context changes. The controller must track which page is active and serve the correct variables for GET requests. Stationary variables (pages 0-127) are always available regardless of active page.

### String Handling

- Maximum string length: **25 characters** (plus null terminator = 26 bytes)
- Strings are null-terminated
- If a string variable is shorter than 25 characters, the null terminator marks the end
- Pad or truncate strings to fit the 25-character limit

### Ghost Variables

Ghost page variables exist only in the controller's datatable. The UI never sees or accesses them. Use ghost variables for:
- Internal controller state
- Intermediate calculation results
- Configuration values not displayed on screen
- Debug/diagnostic counters

### Timing Considerations

- The 150 ms RX timeout is critical -- if exceeded, reset the frame parser state machine
- A 50 ms tick rate provides responsive UI updates without overwhelming the UART
- Batch multiple SET operations within a single tick cycle when possible
- Prioritize user-visible variables (temperature, status indicators) over background data
