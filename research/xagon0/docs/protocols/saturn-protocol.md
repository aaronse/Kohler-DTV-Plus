# Saturn Protocol Specification

## Overview

The Saturn protocol is the valve control protocol used by the Kohler DTV+ system to communicate with valve assemblies. It predates the DTV+ protocol and originates from earlier Kohler digital shower products. Saturn is used by:

- **DTV 6-Port** valve assemblies
- **Prompt 2-Port** valve assemblies
- **Prompt 3-Port** valve assemblies (with optional flow control)

The DTV+ controller communicates with valves over two dedicated RS485 ports using the Saturn protocol, while all other devices use the DTV+ protocol on separate ports.

---

## Physical Layer

| Parameter | Value |
|---|---|
| Electrical Standard | RS485 half-duplex |
| Baud Rate | 9600 bps |
| Data Bits | 8 |
| Parity | None |
| Stop Bits | 1 |
| Flow Control | None |
| Max Packet Size | 20 bytes |

---

## Frame Format

```
+-------+-------+---------+---------+----------+------  ------+----------+
| SYNC1 | SYNC2 | ADDRESS | CONTROL | DATA_LEN | DATA (0-N)  | CHECKSUM |
| 0xAA  | 0x55  | 1 byte  | 1 byte  | 1 byte   | 0-N bytes   | 1 byte   |
+-------+-------+---------+---------+----------+------  ------+----------+
```

### Field Definitions

| Offset | Field | Size | Description |
|---|---|---|---|
| 0 | SYNC1 | 1 byte | Synchronization byte 1: `0xAA` |
| 1 | SYNC2 | 1 byte | Synchronization byte 2: `0x55` |
| 2 | ADDRESS | 1 byte | Target device address |
| 3 | CONTROL | 1 byte | Command/control byte |
| 4 | DATA_LEN | 1 byte | Length of DATA field (0 to N) |
| 5 | DATA | 0-N bytes | Command-specific payload |
| 5+N | CHECKSUM | 1 byte | 2's complement checksum |

### Overhead Calculation

```
Total packet size = 6 + DATA_LEN
  (2 sync + 1 address + 1 control + 1 data_len + DATA_LEN + 1 checksum)
```

---

## Addressing

| Address | Assignment | Description |
|---|---|---|
| 0x00 | Master (DTV) | Used when controller is a DTV unit |
| 0x10 | Master (Prompt) | Used when controller is a Prompt unit |
| 0x0F | Broadcast | All valves on the bus |
| 0x03-0x07 | Assignable | Dynamically assigned valve addresses |

> **CRITICAL:** The master address must match the controller type. DTV controllers use address `0x00`, while Prompt controllers use `0x10`. Using the wrong master address will cause valves to ignore commands or respond incorrectly. When integrating with DTV+ hardware, always use `0x00`.

---

## Valve Firmware Types

Each valve reports a firmware type ID during discovery:

| Firmware Type | ID | Description |
|---|---|---|
| Null | 0x00 | No valve / uninitialized |
| DTV 6-Port | 0x06 | DTV-style 6-outlet valve |
| Prompt 2-Port | 0x17 | Prompt-style 2-outlet valve |
| Prompt 3-Port | 0x1E | Prompt-style 3-outlet valve |
| Prompt 3 Flow Control | 0xFF | Prompt 3-port with flow rate control |

---

## Control Bytes (Command Set)

### Address Management

| Control Byte | Subcommand | Direction | Description |
|---|---|---|---|
| 0x3A | 0x01 | Master -> Broadcast | Address enquiry -- discover unaddressed valves |
| 0x3A | 0x02 | Master -> Device | Allocate address to a valve |
| 0x3A | 0x03 | Master -> Broadcast | Clear all assigned addresses |

### Read Commands

| Control Byte | Direction | Description |
|---|---|---|
| 0x01 | Master -> Device | Read firmware version |
| 0x02 | Master -> Device | Read firmware type |
| 0x07 | Master -> Device | Read outlet states |
| 0x0B | Master -> Device | Read temperature sensor value |
| 0x0C | Master -> Device | Read flow rate |
| 0x0F | Master -> Device | Read fault/error flags |
| 0x10 | Master -> Device | Read calibration data |
| 0x11 | Master -> Device | Read valve serial number |
| 0x15 | Master -> Device | Read configuration parameters |
| 0x16 | Master -> Device | Read generic outlet status |
| 0x40 | Master -> Device | Read extended status |
| 0x54 | Master -> Device | Read diagnostic counters |

### Write Commands

| Control Byte | Direction | Description |
|---|---|---|
| 0x81 | Master -> Device | Write firmware version (factory) |
| 0x82 | Master -> Device | Write firmware type (factory) |
| 0x87 | Master -> Device | Write outlet states (turn on/off) |
| 0x8B | Master -> Device | Write target temperature |
| 0x8C | Master -> Device | Write target flow rate |
| 0x95 | Master -> Device | Write configuration parameters |
| 0x99 | Master -> Device | Write pause state |
| 0xA1 | Master -> Device | Write generic outlet control |
| 0xA4 | Master -> Device | Write extended control |
| 0xC0 | Master -> Device | Write calibration data |

### System Commands

| Control Byte | Direction | Description |
|---|---|---|
| 0xF4 | Master -> Device | Reset valve to factory defaults |
| 0xF6 | Master -> Device | Enter bootloader mode for firmware update |
| 0xF7 | Master -> Device | Calibrate flow sensor |

### Response Indicators

| Control Byte | Direction | Description |
|---|---|---|
| 0x01 | Device -> Master | ACK (positive acknowledgment, echoes read command) |
| 0x80 | Device -> Master | ERROR with error code in data |
| 0xFF | Device -> Master | NAK (negative acknowledgment / command rejected) |

> **Note:** Read commands echo back the same control byte in the response (e.g., send 0x01, receive 0x01 with data). The 0x01 ACK listed above is context-dependent -- for read commands, the response control byte matches the request.

---

## Response Packet Lengths

Expected response sizes for common commands:

| Command | Response Length | Description |
|---|---|---|
| Address Request (0x3A/0x01) | 11 bytes | Address enquiry response |
| Address Allocate (0x3A/0x02) | 6 bytes | Allocation ACK (no data) |
| Read Firmware Version (0x01) | 9 bytes | 3 bytes version data |
| Read Firmware Type (0x02) | 7 bytes | 1 byte type ID |
| Read Outlet States (0x07) | 8 bytes | 2 bytes outlet bitmap |
| Read Temperature (0x0B) | 8 bytes | 2 bytes temp value |
| Read Flow Rate (0x0C) | 8 bytes | 2 bytes flow value |
| Read Fault Flags (0x0F) | 8 bytes | 2 bytes fault bitmap |
| Read Calibration (0x10) | 14 bytes | 8 bytes calibration data |
| Read Serial Number (0x11) | 12 bytes | 6 bytes serial data |
| Read Configuration (0x15) | 12 bytes | 6 bytes config data |
| Read Generic Outlet (0x16) | 17 bytes | 11 bytes outlet detail |
| Read Extended Status (0x40) | 14 bytes | 8 bytes status data |
| Read Diagnostics (0x54) | 10 bytes | 4 bytes counters |
| Write ACK (generic) | 6 bytes | No data, control echoed |
| Error Response (0x80) | 7 bytes | 1 byte error code |
| NAK Response (0xFF) | 6 bytes | No data |

---

## Error Codes

| Code | Description |
|---|---|
| 0 | No error |
| 1 | Unknown command |
| 2 | Invalid parameter |
| 3 | Parameter out of range |
| 4 | Checksum error |
| 5 | Packet too short |
| 6 | Packet too long |
| 7 | Invalid address |
| 8 | Device busy |
| 9 | Command not supported in current state |
| 10 | EEPROM write failure |
| 11 | EEPROM read failure |
| 12 | Sensor fault -- temperature sensor open circuit |
| 13 | Sensor fault -- temperature sensor short circuit |
| 14 | Over-temperature fault |
| 15 | Under-temperature fault |
| 16 | Flow sensor fault |
| 17 | No flow detected |
| 18 | Over-flow fault |
| 19 | Motor stall detected |
| 20 | Motor overcurrent |
| 21-30 | Reserved (motor/actuator faults) |
| 31 | Calibration required |
| 32 | Calibration in progress |
| 33 | Calibration failed |
| 34-50 | Reserved (calibration faults) |
| 51 | Communication timeout |
| 52 | Bus contention detected |
| 53 | Address conflict |
| 54-60 | Reserved (communication faults) |
| 61 | Firmware update in progress |
| 62 | Firmware update failed |
| 63 | Firmware CRC mismatch |
| 64-70 | Reserved (firmware faults) |
| 71 | Inlet water too cold |
| 72 | Inlet water too hot |
| 73 | Mixed water over-temperature safety |
| 74 | Outlet blocked |
| 75-100 | Reserved (application-specific faults) |
| 101 | Internal watchdog reset |
| 102 | Stack overflow detected |
| 103 | Heap allocation failure |
| 104 | Assertion failure |
| 105-113 | Reserved (internal faults) |
| 114 | Unknown / unclassified error |

---

## Protocol Sequences

### Address Discovery (4-Step)

```
Controller                              Valve (unaddressed)
    |                                        |
    |-- [1] Clear addresses (broadcast) ---->|
    |   AA 55 0F 3A 01 03 .. CHK             |
    |                                        |
    |   (wait 2000ms for clear to take       |
    |    effect on all valves)               |
    |                                        |
    |-- [2] Address enquiry (broadcast) ---->|
    |   AA 55 0F 3A 01 01 .. CHK             |
    |                                        |
    |<-- [3] Valve responds with ID ---------|
    |   AA 55 00 3A 05 01 [type] [ver] CHK   |
    |                                        |
    |-- [4] Allocate address 0x03 ---------->|
    |   AA 55 0F 3A 01 02 03 .. CHK          |
    |                                        |
    |   Valve now responds to address 0x03   |
```

**Byte-level breakdown of Step 2 (Address Enquiry):**

```
Byte:  AA    55    0F    3A    01    01    .. CHK
       |     |     |     |     |     |        |
       SYNC1 SYNC2 ADDR  CTRL  DLEN  SUB      CHECKSUM
                   =bcast =addr =1   =enquiry
                          mgmt  byte
```

### Read Firmware Version

```
Controller                         Valve (addr 0x03)
    |                                   |
    |-- Read firmware version --------->|
    |   AA 55 03 01 00 CHK              |
    |                                   |
    |<-- Version response --------------|
    |   AA 55 00 01 03 [maj][min][pat] CHK
```

---

## Annotated Packet Captures

### Example 1: Read Valve Firmware Type

Request to valve at address 0x03:

```
TX: AA 55 03 02 00 A1
    |  |  |  |  |  |
    S1 S2 ADR CTL DL CHK

    Address = 0x03 (valve)
    Control = 0x02 (read firmware type)
    Data Len = 0x00 (no request data)
    Checksum: ~(0x03 + 0x02 + 0x00) + 1
            = ~0x05 + 1 = 0xFA + 1 = 0xFB

    Wait -- let me recompute:
    Sum of ADDRESS + CONTROL + DATA_LEN + DATA = 0x03 + 0x02 + 0x00 = 0x05
    2's complement: ~0x05 + 1 = 0xFA + 1 = 0xFB
```

Corrected:
```
TX: AA 55 03 02 00 FB
```

Response:
```
RX: AA 55 00 02 01 1E DF
    |  |  |  |  |  |  |
    S1 S2 ADR CTL DL DT CHK

    Address = 0x00 (master)
    Control = 0x02 (echoed read command)
    Data Len = 0x01
    Data = 0x1E (Prompt 3-Port)
    Checksum: ~(0x00 + 0x02 + 0x01 + 0x1E) + 1
            = ~0x21 + 1 = 0xDE + 1 = 0xDF
```

### Example 2: Turn On Valve Outlet (Prompt 3)

Turning on outlet 1 (bit 0x04) on Prompt 3 valve at address 0x03:

```
TX: AA 55 03 87 02 04 00 70
    |  |  |  |  |  |  |  |
    S1 S2 ADR CTL DL D0 D1 CHK

    Address = 0x03
    Control = 0x87 (write outlet states)
    Data Len = 0x02
    Data[0] = 0x04 (outlet 1 ON, see bitmap below)
    Data[1] = 0x00 (no flags)
    Checksum: ~(0x03 + 0x87 + 0x02 + 0x04 + 0x00) + 1
            = ~0x90 + 1 = 0x6F + 1 = 0x70
```

### Example 3: Address Clear Broadcast

```
TX: AA 55 0F 3A 01 03 AE
    |  |  |  |  |  |  |
    S1 S2 ADR CTL DL SC CHK

    Address = 0x0F (broadcast)
    Control = 0x3A (address management)
    Data Len = 0x01
    Subcommand = 0x03 (clear all addresses)
    Checksum: ~(0x0F + 0x3A + 0x01 + 0x03) + 1
            = ~0x4D + 1 = 0xB2 + 1 = 0xB3

    Corrected: CHK = 0xB3
```

Corrected packet:
```
TX: AA 55 0F 3A 01 03 B3
```

---

## Generic Outlet Bitmaps (Prompt 3)

The Prompt 3 valve uses a bitmapped byte to control individual outlets:

| Outlet | Bit | Bitmask | Description |
|---|---|---|---|
| Outlet 1 | Bit 2 | 0x04 | First outlet |
| Outlet 2 | Bit 3 | 0x08 | Second outlet |
| Outlet 3 | Bit 4 | 0x10 | Third outlet |
| Outlet 4 | Bit 5 | 0x20 | Fourth outlet |
| Outlet 5 | Bit 6 | 0x40 | Fifth outlet |
| Outlet 6 | Bit 7 | 0x80 | Sixth outlet |

To activate multiple outlets, OR the bitmasks together. For example, outlets 1 and 3: `0x04 | 0x10 = 0x14`.

---

## Valve State Bits

The valve status byte uses individual bits for state flags:

| Bit | Mask | Description |
|---|---|---|
| Bit 1 | 0x02 | Pause -- valve outputs are paused (hold current state) |
| Bit 7 | 0x80 | Error -- valve has an active error condition |

Other bits are reserved or valve-type-specific.

---

## Timing Parameters

| Parameter | Value | Description |
|---|---|---|
| Valve Tick | 525 ms | Main polling interval for valve communication |
| Enquiry Rate | 2000 ms | Interval between address discovery attempts |
| Response Timeout | 400 ms | Time to wait for valve response |
| Clear Delay | 2000 ms | Wait time after address clear before re-discovery |
| Message Timeout | 320 ms | Maximum time for a complete message to arrive |
| Echo Timeout | 20 ms | Time to wait for TX echo on half-duplex bus |
| Max Retries (read) | 3 | Retry count for read commands |
| Max Retries (write) | 3 | Retry count for write commands |
| Max Retries (address) | 3 | Retry count for address management |
| Max Retries (critical) | 5 | Retry count for critical commands |

---

## Checksum Calculation

The checksum covers ADDRESS, CONTROL, DATA_LEN, and DATA bytes. It is the 2's complement of their sum, ensuring the total sum (including checksum) equals 0x00 (mod 256).

### Algorithm

```
function saturn_checksum(address, control, data_len, data[]):
    total = address + control + data_len
    for i = 0 to data_len - 1:
        total = total + data[i]
    total = total & 0xFF
    checksum = (~total + 1) & 0xFF
    return checksum
```

### Worked Example

Computing checksum for: ADDRESS=0x03, CONTROL=0x87, DATA_LEN=0x02, DATA=[0x04, 0x00]

```
Step 1: Sum fields
  0x03 + 0x87 + 0x02 + 0x04 + 0x00 = 0x90

Step 2: Mask to 8 bits
  0x90 & 0xFF = 0x90

Step 3: 2's complement
  ~0x90 = 0x6F
  0x6F + 1 = 0x70

Checksum = 0x70
```

Verification:
```
0x03 + 0x87 + 0x02 + 0x04 + 0x00 + 0x70 = 0x100
0x100 & 0xFF = 0x00  // Valid!
```

---

## Implementation Notes

### Master Address Selection

When building a replacement controller for DTV+ integration, always use master address `0x00`. The Prompt master address (`0x10`) is only for standalone Prompt controllers. Using the wrong address will prevent valves from recognizing commands.

### Response Validation

1. Verify SYNC1 (0xAA) and SYNC2 (0x55) header
2. Check that response ADDRESS matches expected sender
3. Verify DATA_LEN does not exceed maximum packet size (20 bytes total)
4. Validate checksum before processing any data
5. Check CONTROL byte for error indicators (0x80 = error, 0xFF = NAK)

### Prompt 3 Timeout (30-Minute Safety)

Prompt 3 valves implement a **30-minute safety timeout** (1800 seconds). If no communication is received within this window, the valve automatically shuts off all outlets as a safety measure.

The controller must periodically send status requests or keep-alive commands to prevent timeout. The timeout counter resets on any valid received command.

> **Important:** When the remaining timeout drops below 900 seconds (15 minutes), the controller should send a reset/keep-alive to restart the counter. Do not wait until the last moment -- RS485 communication failures could cause the valve to shut off unexpectedly.

### Temperature Format

Temperature values in the Saturn protocol use a **Celsius times 2** format (Cx2):

```
Encoded value = Temperature_Celsius * 2

Examples:
  38.0 C  ->  76  (0x4C)
  40.5 C  ->  81  (0x51)
  20.0 C  ->  40  (0x28)
```

This provides 0.5 degree Celsius resolution using integer values.

### Half-Duplex Bus Management

Like the DTV+ protocol, Saturn operates on a half-duplex RS485 bus. The same DE/RE GPIO control applies:

1. Assert DE before transmitting
2. De-assert DE after last byte is sent
3. Assert RE to listen for response
4. Process echo bytes (discard own transmission)
5. Receive and process response

The echo timeout (20 ms) is much shorter than DTV+ (150 ms) because Saturn packets are smaller (max 20 bytes at 9600 baud takes ~21 ms to transmit).
