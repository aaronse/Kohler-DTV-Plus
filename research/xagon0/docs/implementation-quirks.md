# Implementation Quirks and Gotchas

A comprehensive list of non-obvious behaviors, timing constraints, and design decisions discovered through reverse engineering. Read this before building anything on top of the DTV+ controller.

---

## Timing and Latency

### 750ms FlexBus Semaphore Timeout

External UART operations (via the FlexBus-mapped TL16C752C chips) must complete within 750ms or they will timeout. This affects all RS485 device communication.

**Implications:**
- Chunk large data transfers into pieces that complete within the window
- UI updates may lag during heavy bus traffic
- Back-to-back commands can queue up and cascade timeouts

### 525ms Valve Polling Interval

Valve status is polled every 525ms at most. Status changes (temperature, flow, errors) are not instant.

**Implication:** Use optimistic UI updates when sending commands -- do not wait for the next poll cycle to reflect the change.

### 50ms UI Tick

The minimum UI processing interval is 50ms (20 Hz). This is the floor for touch input latency.

### 500ms Outlet Stagger

When activating multiple outlets, the controller staggers them by 500ms to prevent electrical surge from simultaneous valve activation.

### 150ms RS485 Echo Wait

The RS485 bus is half-duplex. After transmitting, the controller waits 150ms before processing the response to avoid reading its own echo back.

### 3-Tick Button Debounce

Physical button inputs require 3 consecutive ticks (150ms minimum at 50ms/tick) before registering as a press.

---

## Communication Protocols

### Two Device Protocols: Saturn and DTV+

The system uses two distinct protocols on the RS485 bus:

| Protocol | Used For | Origin |
|----------|----------|--------|
| Saturn | Valves (Mira heritage) | Predates DTV+, carried over from Mira valve controllers |
| DTV+ | Everything else (touchscreens, amplifiers, rain panels, etc.) | Native DTV+ protocol |

### Master Address Varies by Configuration

| Configuration | Master Address |
|---------------|---------------|
| DTV controller (standalone) | `0x00` |
| Non-networked Prompt2 | `0x00` |
| Networked Prompt2 | `0x10` |
| Prompt3 | `0x10` |

### Amplifier Dual IDs

The amplifier module responds to **two** addresses: `0x40` and `0x07`. When scanning for or communicating with the amplifier, check both.

### 8 Independent RS485 Ports

The controller has 8 RS485 ports, each with its own TX/RX buffers and state machine. The external UARTs are TL16C752C chips mapped at:

- `0xC0000000` (first chip, ports 1-2)
- `0xC0010000` (second chip, ports 3-4)

Each port has 2KB TX and 2KB RX buffers.

### Simulation Ports

For development and testing, certain port numbers are designated for simulated devices:

| Port | Simulated Device |
|------|-----------------|
| 5 | Steam generator |
| 6 | Rain panel |
| 7 | LightBridge |
| 8 | Amplifier |

---

## Web Interface / HTTP

### Only 2 Concurrent HTTP Sessions

The controller supports a maximum of **2 concurrent HTTP connections**. Exceeding this causes the controller to hang and become unresponsive until power cycled.

**Always** use `Connection: close` headers and close connections promptly.

### CGI Responses Lack Content-Length

Most CGI endpoint responses do not include a `Content-Length` header. HTTP clients must read until the socket closes to get the full response body.

### Ajax Cache Must Be Disabled

When making repeated requests to the same endpoint (e.g., polling), the browser or HTTP client cache must be disabled. Stale cached responses will show outdated data.

### Dual Data Access Methods

There are two independent systems for reading and writing controller data:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `values.cgi` | Direct datatable access | Read/write datatable indices directly |
| `save_variable.cgi` | CGI variable system | Named variables with additional logic |

The CGI variable system has variable definitions in **both** C code (controller firmware) and JavaScript (web UI). These definitions must stay synchronized -- if they diverge, the web UI will read/write incorrect data.

### Default Lock Codes

| Lock | Default Code |
|------|-------------|
| Settings menu | `1020` |
| Web page access | `0922` |

---

## Data and Arithmetic

### Temperature Format: NOT What You Expect

The controller uses two different temperature representations depending on the device:

| Device | Format | Unit |
|--------|--------|------|
| Valves | Cx2 | Celsius multiplied by 2 |
| Steam generator | Fx2 | Fahrenheit multiplied by 2 |

**Conversion formula:** `Fx2 = ((Cx2 * 9) / 5) + 64`

For example, 38 degrees Celsius = Cx2 value of 76, Fx2 value of `((76 * 9) / 5) + 64 = 200`.

### NOT PID Control

The controller does **not** use PID (Proportional-Integral-Derivative) control for temperature regulation. Instead, it uses Q-format fixed-point arithmetic for calculations, and the valve hardware handles the actual mixing.

### GHOST Datatable Pages

Some datatable pages exist only in the controller firmware and are invisible to the UI. These "ghost" pages hold internal state that the UI never needs to access.

### Page Switching Overhead

Datatable indices above 127 require a page switch operation. Accessing high-index values incurs additional overhead compared to indices 0-127.

### String Length Limit

All string values in the datatable are limited to **25 characters plus a null terminator** (26 bytes total).

---

## Error Handling

### 4-Retry Limit

Failed operations are retried up to 4 times (5 total attempts) before the controller declares a permanent error.

### Resettable vs Fatal Errors

Some errors can be cleared by the user (resettable), while others require a power cycle or service call (fatal). The valve state bit field distinguishes these:

- **Bit 1 (0x02):** Pause state
- **Bit 7 (0x80):** Error state

### 30-Minute Prompt3 Timeout

Prompt3 touchscreens have a 30-minute inactivity timeout. The timeout counter resets when it drops below 900 seconds (15 minutes), creating an effective 15-minute window before timeout begins.

---

## Miscellaneous

### Command 0x81 Undocumented Behavior

When sent to a Prompt2 device, command `0x81` returns a 17-byte response that differs from what the protocol documentation describes. Handle this response length explicitly.

### Bootloader Requires Password

Access to certain bootloader functions is password-protected. This is separate from the web interface lock codes.

### Different Bootloader Tick Times

| Version | Tick Period |
|---------|------------|
| Current bootloader | 115ms |
| Legacy bootloader | 35ms |

Timing-sensitive bootloader interactions must account for which version is installed.

### 14 Supported Languages

The UI supports 14 languages, stored as an enum in the datatable.

### RPC Index Reference

For automation, the key RPC indices via `/rpc?index=N`:

| Index | Action |
|-------|--------|
| 10 | Power toggle |
| 11 | Steam toggle |
| 12 | Rain toggle |
| 13 | Lights toggle |
