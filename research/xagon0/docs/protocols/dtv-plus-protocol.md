# DTV+ Protocol Specification

## Overview

The DTV+ protocol is the primary RS485 communication protocol used by the Kohler DTV+ digital shower system. It connects the central controller to peripheral devices including steam generators, rain panels, light bridges, amplifiers, and touchscreen UIs.

The protocol uses a master-slave architecture where the controller polls each port sequentially. Devices are auto-discovered and assigned addresses at startup.

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
| TX Buffer | 2048 bytes |
| RX Buffer | 2048 bytes |
| Bus Topology | Point-to-point per port (8 independent buses) |

---

## Frame Format

```
+------+------+------+------+--  --+----------+------+
| SOF  | DEST | SRC  | CMD  | ... | CHECKSUM | EOF  |
| 0x88 | 1B   | 1B   | 1B   | 0-N | 1B       | 0x55 |
+------+------+------+------+--  --+----------+------+
```

| Field | Size | Description |
|---|---|---|
| SOF | 1 byte | Start of frame marker: `0x88` |
| DEST | 1 byte | Destination device address |
| SRC | 1 byte | Source device address |
| CMD | 1 byte | Command opcode |
| PAYLOAD | 0-N bytes | Command-specific data |
| CHECKSUM | 1 byte | 2's complement checksum |
| EOF | 1 byte | End of frame marker: `0x55` |

---

## Special Characters and Byte Stuffing

### Reserved Bytes

| Character | Value | Purpose |
|---|---|---|
| SOF | 0x88 | Start of frame delimiter |
| EOF | 0x55 | End of frame delimiter |
| ESC | 0xAA | Escape character |

### Byte Stuffing Rules

When any reserved byte appears in the DEST, SRC, CMD, PAYLOAD, or CHECKSUM fields, it must be escaped:

| Original Byte | Escaped Sequence |
|---|---|
| 0x88 | 0xAA 0x88 |
| 0x55 | 0xAA 0x55 |
| 0xAA | 0xAA 0xAA |

The SOF and EOF framing bytes themselves are NOT escaped -- they are transmitted literally to mark frame boundaries.

**Encoding example:** To send payload byte `0x55`, transmit `0xAA 0x55` instead.

**Decoding:** When `0xAA` is received mid-frame, consume the next byte as the literal value (strip the escape).

---

## Checksum Calculation

The checksum is the **2's complement** of the sum of all bytes between SOF and CHECKSUM (exclusive of SOF and EOF).

### Algorithm

```
function calculate_checksum(dest, src, cmd, payload):
    total = dest + src + cmd
    for each byte in payload:
        total = total + byte
    total = total & 0xFF          // keep low byte only
    checksum = (~total + 1) & 0xFF  // 2's complement
    return checksum
```

### Worked Example

Suppose we send: DEST=0x03, SRC=0x00, CMD=0x30, PAYLOAD=[0x01]

```
Step 1: Sum all bytes
  0x03 + 0x00 + 0x30 + 0x01 = 0x34

Step 2: Mask to 8 bits
  0x34 & 0xFF = 0x34

Step 3: 2's complement (bitwise NOT + 1)
  ~0x34 = 0xCB
  0xCB + 1 = 0xCC

Checksum = 0xCC
```

### Verification

To verify, sum all bytes including the checksum. The result (masked to 8 bits) should be 0x00:

```
0x03 + 0x00 + 0x30 + 0x01 + 0xCC = 0x100
0x100 & 0xFF = 0x00  // Valid!
```

---

## Addressing

| Address | Assignment |
|---|---|
| 0x00 | Master controller (also default/unassigned) |
| 0x01-0x02 | Reserved |
| 0x03-0x07 | Assignable device addresses |
| 0x08-0xFE | Reserved |
| 0xFF | Broadcast (all devices) |

Devices ship with address 0x00. During discovery, the controller assigns unique addresses (0x03-0x07) per port so that up to 5 devices per port can be individually addressed.

---

## Device IDs

Each device type has a unique identifier used during discovery and status reporting:

| Device | ID | Description |
|---|---|---|
| Controller | 0x00 | DTV+ central controller |
| Rain Panel | 0x03 | Rain showerhead module |
| Steam Generator | 0x05 | Steam output module |
| Steam Management Module | 0x06 | SMM (secondary steam control) |
| Amplifier (Alt) | 0x07 | Amplifier (alternate ID) |
| Light Bridge | 0x08 | Chromatherapy lighting module |
| Test Fixture | 0x09 | Factory test equipment |
| UI v1 | 0x30 | First-generation touchscreen |
| UI v2 | 0x31 | Second-generation touchscreen |
| Amplifier | 0x40 | Audio amplifier module |
| Bootloader | 0xF0 | Device in bootloader/firmware-update mode |

---

## Command Set

### Network Management Commands

| Command | Opcode | Direction | Description |
|---|---|---|---|
| NETWORK_RESET | 0x03 | Master -> Broadcast | Reset all device addresses on the bus |
| DEV_ADDRESS_OPP | 0x05 | Master -> Broadcast | Address opportunity -- invites unaddressed devices to respond |
| DEV_REQUEST_ADDR | 0x06 | Device -> Master | Device requests an address assignment |
| DEV_ASSIGN_ADDR | 0x07 | Master -> Device | Master assigns an address to a device |

### Status and Control Commands

| Command | Opcode | Direction | Description |
|---|---|---|---|
| GET_DEV_STATUS | 0x30 | Master -> Device | Request current device status |
| STATUS_UPDATE | 0x31 | Device -> Master | Device reports its current status |
| SETTINGS_UPDATE | 0x32 | Either | Synchronize device settings |
| GET_DEV_PARAM | 0x33 | Master -> Device | Read a specific parameter |
| SET_DEV_PARAM | 0x34 | Master -> Device | Write a specific parameter |
| DEV_ACK | 0x35 | Device -> Master | Positive acknowledgment |
| DEV_NAK | 0x36 | Device -> Master | Negative acknowledgment (error/reject) |
| ERROR | 0x37 | Device -> Master | Error report with code |
| GET_FIRMWARE_VERSION | 0x38 | Master -> Device | Request firmware version string |
| FIRMWARE_UPDATE | 0x39 | Master -> Device | Initiate firmware update mode |
| CLEAR_FAULT_FLAGS | 0x3A | Master -> Device | Clear stored fault/error flags |

### Configuration Commands

| Command | Opcode | Direction | Description |
|---|---|---|---|
| SET_EXT_KEY | 0x13 | Master -> Device | Set external authentication key |
| CHANGE_BAUD | 0x18 | Master -> Device | Change UART baud rate (rarely used) |
| ID_DEV | 0x40 | Master -> Device | Identify device (e.g., flash LED) |

### Data Transfer Commands

| Command | Opcode | Direction | Description |
|---|---|---|---|
| SET_FILE_TRANSFER | 0x20 | Master -> Device | Initiate file transfer session |
| FLUSH_MD5 | 0x21 | Master -> Device | Flush buffer and verify MD5 hash |
| FILE_COMPLETE | 0x22 | Master -> Device | Signal file transfer complete |
| WRITE_DATA | 0x70 | Master -> Device | Write data block to device |
| READ_DATA | 0x71 | Master -> Device | Read data block from device |
| GET_DATA_BUFFER | 0x72 | Device -> Master | Return buffered data |
| WRITE_LARGE_DATA | 0x74 | Master -> Device | Write large data block (extended timeout) |

### System Commands

| Command | Opcode | Direction | Description |
|---|---|---|---|
| REBOOT | 0x80 | Master -> Device | Reboot the target device |
| GET_TRACK_STR | 0x90 | Master -> Device | Get tracking/serial string |
| GET_DIR_ENTRIES | 0x91 | Master -> Device | List directory entries on device |
| ACTIVATE_BOOT | 0xA1 | Master -> Device | Activate bootloader mode |

---

## Protocol Sequences

### Device Discovery (3-Step)

The controller discovers devices on each port using a 3-step handshake:

```
Controller                                    Device (unaddressed)
    |                                              |
    |-- [1] DEV_ADDRESS_OPP (broadcast 0xFF) ----->|
    |   SOF DEST=FF SRC=00 CMD=05 ... CHK EOF      |
    |                                              |
    |<-- [2] DEV_REQUEST_ADDR --------------------|
    |   SOF DEST=00 SRC=00 CMD=06 [DevID] CHK EOF  |
    |                                              |
    |-- [3] DEV_ASSIGN_ADDR (addr=0x03) --------->|
    |   SOF DEST=00 SRC=00 CMD=07 [0x03] CHK EOF   |
    |                                              |
    |   Device now responds to address 0x03         |
```

**Step 1:** Controller broadcasts an address opportunity on the port. Any unaddressed device may respond.

**Step 2:** An unaddressed device responds with its device ID, requesting an address.

**Step 3:** Controller assigns the next available address (0x03-0x07) to the device.

### Get Device Status

```
Controller                         Device (addr 0x03)
    |                                   |
    |-- GET_DEV_STATUS ---------------->|
    |   88 03 00 30 CD 55              |
    |                                   |
    |<-- DEV_ACK + status payload ------|
    |   88 00 03 35 [status...] CHK 55  |
```

### Set Device Parameter

```
Controller                         Device (addr 0x03)
    |                                   |
    |-- SET_DEV_PARAM ----------------->|
    |   88 03 00 34 [param] [val] CHK 55|
    |                                   |
    |<-- DEV_ACK ----------------------|   (success)
    |   88 00 03 35 CHK 55             |
    |                                   |
    |   -- OR --                        |
    |                                   |
    |<-- DEV_NAK ----------------------|   (failure)
    |   88 00 03 36 [err] CHK 55       |
```

---

## Annotated Packet Captures

### Example 1: Get Steam Generator Status

Request from controller to steam at address 0x05:

```
Byte:  88    05    00    30    CB    55
       |     |     |     |     |     |
       SOF   DEST  SRC   CMD   CHK   EOF
             =0x05 =0x00 =GET  =2's
             steam ctrlr STATUS comp
```

Checksum verification: `0x05 + 0x00 + 0x30 + 0xCB = 0x100 -> 0x00` (valid)

### Example 2: Set Rain Panel Parameter with Escape Sequence

Setting a parameter on rain panel (addr 0x03), where the parameter value happens to be 0x55 (requires escaping):

```
Raw data:  DEST=0x03, SRC=0x00, CMD=0x34, PARAM_ID=0x01, VALUE=0x55

On wire:   88  03  00  34  01  AA 55  92  55
           |   |   |   |   |   |  |   |   |
           SOF DST SRC CMD P_ID ESC|  CHK  EOF
                                   |
                              escaped 0x55

Checksum calc (on unescaped data):
  0x03 + 0x00 + 0x34 + 0x01 + 0x55 = 0x8D
  ~0x8D + 1 = 0x72 + 1 = 0x73

  Wait -- let's recompute:
  0x03 + 0x00 + 0x34 + 0x01 + 0x55 = 0x8D
  ~0x8D = 0x72
  0x72 + 1 = 0x73

  But 0x73 does not need escaping, so CHK = 0x73 on wire.
```

Corrected wire bytes:
```
88  03  00  34  01  AA 55  73  55
SOF DST SRC CMD PID ESC|55 CHK EOF
```

Verification: `0x03 + 0x00 + 0x34 + 0x01 + 0x55 + 0x73 = 0x100 -> 0x00` (valid)

### Example 3: Device Discovery 3-Step

```
-- Step 1: Address Opportunity Broadcast --
TX: 88  FF  00  05  FC  55
    SOF DST SRC CMD CHK EOF
    Checksum: ~(0xFF+0x00+0x05)+1 = ~0x04+1 = 0xFB+1 = 0xFC

-- Step 2: Device Request Address (Steam, DevID=0x05) --
RX: 88  00  00  06  05  F5  55
    SOF DST SRC CMD DID CHK EOF
    Checksum: ~(0x00+0x00+0x06+0x05)+1 = ~0x0B+1 = 0xF4+1 = 0xF5

-- Step 3: Assign Address 0x03 --
TX: 88  00  00  07  03  F6  55
    SOF DST SRC CMD ADR CHK EOF
    Checksum: ~(0x00+0x00+0x07+0x03)+1 = ~0x0A+1 = 0xF5+1 = 0xF6
```

---

## Timing Parameters

| Parameter | Value | Description |
|---|---|---|
| Port Tick | 500 ms | Main polling interval per port |
| Address Enquiry Timeout | 400 ms | Time to wait for response to address opportunity |
| Device Reply Timeout | 300 ms | Time to wait for response to a command |
| Large Write Timeout | 2000 ms | Extended timeout for WRITE_LARGE_DATA |
| RS485 Echo Timeout | 150 ms | Time to wait for TX echo on half-duplex bus |
| TX Attempts (max) | 250 | Maximum transmission retries before port fault |

---

## State Machine

Each port operates an independent state machine:

```
          +--------+
          |  IDLE  |<-----------------------+
          +---+----+                        |
              |                             |
         cmd to send                   rx complete
              |                        or timeout
              v                             |
          +--------+                   +----+---+
          |   TX   |--- tx done --->   |   RX   |
          +---+----+                   +--------+
              |                             ^
         half-duplex                        |
         turnaround                         |
              |                             |
              v                             |
        +-----------+                       |
        | WAIT_ECHO |--- echo ok ----------+
        +-----------+
              |
         echo timeout
              |
              v
          (retry or
           error)
```

**States:**
- **IDLE**: Port is idle, waiting for next tick or command to send.
- **TX**: Transmitting a frame. RS485 DE (driver enable) is asserted.
- **WAIT_ECHO**: After TX completes, listening for the transmitted bytes echoed back on the half-duplex bus. DE is de-asserted, RE (receiver enable) is asserted.
- **RX**: Receiving response frame from the device.

---

## Implementation Notes

### Half-Duplex Control

RS485 is half-duplex. The firmware must explicitly control the DE (Driver Enable) and RE (Receiver Enable) pins via GPIO:

1. **Before TX:** Assert DE, de-assert RE
2. **During TX:** Transmit frame bytes
3. **After TX:** De-assert DE, assert RE
4. **During RX:** Receive frame bytes with RE asserted
5. **Turnaround time:** Allow a brief delay (~1 bit time) between TX and RX switch

### Echo Handling

On a half-duplex RS485 bus, the transmitter sees its own transmitted data. The firmware must:
1. Wait for the echo of all transmitted bytes
2. Verify the echo matches what was sent (optional integrity check)
3. Discard the echo before processing the response

### Escape Processing

- **TX path:** Scan each byte of DEST, SRC, CMD, PAYLOAD, CHECKSUM. If the byte is 0x88, 0x55, or 0xAA, prepend 0xAA before it.
- **RX path:** When 0xAA is received (outside SOF/EOF position), consume the next byte as the literal value.
- SOF (0x88) and EOF (0x55) are never escaped in their framing role.

### Checksum Verification

On receive, sum all bytes between SOF and EOF (exclusive), including the checksum byte. If the result (masked to 8 bits) is 0x00, the frame is valid.

### Retry Logic

- Failed transmissions are retried up to **5 times** per command
- The port tick (500 ms) controls overall polling cadence
- After 250 cumulative TX failures, the port is marked as faulted

### Multi-Port Support

All 8 DTV+ ports operate independently with their own:
- State machine instance
- TX/RX buffers (2 KB each)
- Retry counters
- Device address table
- Timing state
