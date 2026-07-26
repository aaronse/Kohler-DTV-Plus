# Timing Constants Reference

All timing constants governing the Kohler DTV+ system's communication, retry logic, and device scheduling.

---

## Device Poll Intervals

Each device type on the bus is polled at a fixed interval by the controller's main loop.

| Constant                   | Value   | Description                        |
|----------------------------|---------|------------------------------------|
| `VALVE_PORT_TICK_TIME`     | 525 ms  | Mixing valve poll cycle            |
| `UI_TICK_TIME`             | 50 ms   | Touchscreen UI poll cycle          |
| `STEAM_TICK_TIME`          | 150 ms  | Steam generator poll cycle         |
| `RAIN_PANEL_TICK_TIME`     | 175 ms  | Rain panel (showerhead) poll cycle |
| `LIGHT_BRIDGE_TICK_TIME`   | 200 ms  | LightBridge chromotherapy module   |
| `AMP_TICK_TIME`            | 350 ms  | Amplifier / audio module           |
| `RELAY_TICK_TIME`          | 100 ms  | Relay board poll cycle             |
| `SHOWER_TICK_TIME`         | 100 ms  | Shower device poll cycle           |
| `DIM_TICK_TIME`            | 1000 ms | Dimmer module poll cycle           |
| `BOOTLOADER_TICK_TIME`     | 115 ms  | Bootloader-mode poll cycle         |
| `OLD_BOOTLOADER_TICK_TIME` | 35 ms   | Legacy bootloader poll cycle       |

---

## Device Timeouts

Maximum wait durations before a message exchange is considered failed.

| Constant                             | Value   | Description                                   |
|--------------------------------------|---------|-----------------------------------------------|
| `DEVICE_WAIT_REPLY_TIMEOUT`          | 300 ms  | General reply timeout for any device           |
| `DEVICE_LARGE_WRITE_REPLY_TIMEOUT`   | 2000 ms | Reply timeout for large payload writes         |
| `DEVICE_STATUS_TIMEOUT`              | 300 ms  | Timeout waiting for a status response          |
| `VALVE_MESSAGE_TIMEOUT`              | 320 ms  | Valve-specific message reply timeout           |
| `VALVE_MESSAGE_ECHO_TIMEOUT`         | 20 ms   | Time allowed for RS-485 echo to clear (valve)  |
| `RS485_ECHO_TIMEOUT`                 | 150 ms  | General RS-485 echo clearance window           |
| `AMULET_RX_TIMEOUT_MS`              | 150 ms  | Amulet display serial receive timeout          |
| `FLEXBUS_SEMAPHORE_TIMEOUT_MS`       | 750 ms  | Max hold time for the external UART semaphore  |

---

## Address Discovery Timing

The controller discovers devices by sending enquiry frames at regular intervals.

| Constant                              | Value   | Description                                    |
|---------------------------------------|---------|------------------------------------------------|
| `ADDRESS_ENQUIRY_RATE_TIME`           | 2000 ms | Interval between address enquiry broadcasts     |
| `DEVICE_ADDRESS_ENQUIRY_RATE_TIME`    | 2000 ms | Per-device enquiry rate                         |
| `ADDRESS_ENQUIRY_TIMEOUT`             | 400 ms  | Timeout waiting for an enquiry reply            |
| `ADDRESS_CLEAR_DELAY_TIME`            | 2000 ms | Delay after clearing addresses before re-scan   |
| `DEVICE_ADDRESS_CLEAR_DELAY_TIME`     | 1000 ms | Per-device address clear settling time          |

---

## Retry Counts

Maximum attempts before giving up on a communication exchange.

| Constant                     | Value | Description                                |
|------------------------------|-------|--------------------------------------------|
| `TX_ATTEMPTS`                | 250   | Raw transmit attempts (low-level retries)  |
| `VALVE_MAX_RETRIES`          | 5     | Valve command retries                      |
| `DEVICE_MAX_RETRIES`         | 5     | General device command retries             |
| `UI_DEVICE_RETRIES`          | 5     | UI device retries                          |
| `MAX_MULTIDROP_ENQUIRIES`    | 3     | Multidrop address enquiry attempts         |
| `MAX_NON_MULTIDROP_ENQUIRIES`| 3     | Single-device address enquiry attempts     |
| `MAX_ADDRESS_ENQUIRIES`      | 3     | Total address scan rounds                  |

---

## Massage Timing

Timing for spa-mode massage outlet sequencing (see also [massage-patterns.md](massage-patterns.md)).

| Constant            | Value   | Description                          |
|---------------------|---------|--------------------------------------|
| `STAGGER_TIME`      | 500 ms  | Delay between activating each outlet |
| `WAVE_SLOW_3_ON`    | 1300 ms | Wave mode slow: ON duration          |
| `WAVE_FAST_3_ON`    | 700 ms  | Wave mode fast: ON duration          |
| `WAVE_OFF_TIME`     | 300 ms  | Wave mode: OFF duration between pulses |
| `SINGLE_SLOW_ON`    | 600 ms  | Single mode slow: ON duration        |
| `SINGLE_FAST_ON`    | 300 ms  | Single mode fast: ON duration        |
| `SINGLE_OFF_TIME`   | 200 ms  | Single mode: OFF gap                 |

---

## Rain Panel Fade Speeds

Duration for a full 0-100% brightness fade on rain panel LEDs.

| Speed  | Duration | Notes             |
|--------|----------|-------------------|
| Slow   | 3000 ms  | Gentle transition |
| Medium | 2250 ms  | Default           |
| Fast   | 1500 ms  | Quick transition  |
| Off    | 0 ms     | Instant (no fade) |

---

## Valve Timing

| Constant                        | Value    | Description                                       |
|---------------------------------|----------|---------------------------------------------------|
| `PROMPT3_TIMEOUT_RESET_LIMIT`   | 900 sec  | Prompt3 timer reset threshold (15 min)             |
| `PROMPT3_TIMEOUT_MAX`           | 1800 sec | Auto-shutoff if Prompt3 timer not reset (30 min)   |
| `MAX_STEAM_PRE_HEAT_TIME`       | 10 min   | Maximum steam generator pre-heat period            |

---

## Buffer and Queue Sizes

| Constant              | Value      | Description                          |
|-----------------------|------------|--------------------------------------|
| `TX_BUFFER_LEN`       | 2048 bytes | Serial transmit buffer               |
| `RX_BUFFER_LEN`       | 2048 bytes | Serial receive buffer                |
| `MESSAGE_PAYLOAD_SIZE`| 16 bytes   | Standard message payload             |
| Short buffer          | 32 bytes   | Short temporary buffers              |
| Long buffer           | 256 bytes  | Long temporary buffers               |
| Shower queue          | 32 entries | Shower command queue depth            |
| Global queue          | 32 entries | Global message queue depth            |

---

## Physical Limits

| Constraint               | Value | Notes                              |
|--------------------------|-------|------------------------------------|
| Ports per controller     | 8     | Physical RS-485 ports              |
| Max valves per port      | 2     | Multidrop pairing                  |
| Max devices per port     | 1     | Non-valve devices                  |
| Max valves per system    | 4     | Across all ports                   |
| Typical valves           | 2     | Most installations                 |
| Max rain panels          | 2     | Per system                         |

---

## Protocol Constants

| Parameter            | Value       | Description                    |
|----------------------|-------------|--------------------------------|
| Valve baud rate      | 9600        | Saturn protocol (RS-485)       |
| Test baud rate       | 57600       | Factory test mode              |
| Amulet baud rate     | 115200      | Touchscreen display serial     |
| Saturn max packet    | 20 bytes    | Maximum Saturn frame length    |

---

## Timing Diagrams

### Valve Communication Cycle (525 ms)

```
|<----------------------- 525 ms ----------------------->|
|  TX   | Echo Clear |    RX Wait    |  Process  | Idle  |
| ~50ms |   ~70ms    |   ~150ms      |  ~200ms   | ~55ms |
|-------|------------|---------------|-----------|-------|

 0ms   50ms        120ms          270ms        470ms  525ms
```

1. **TX (~50 ms):** Controller transmits command frame at 9600 baud.
2. **Echo Clear (~70 ms):** RS-485 half-duplex echo dissipates; transceiver switches to receive.
3. **RX Wait (~150 ms):** Controller waits for valve reply frame.
4. **Process (~200 ms):** Parse response, update internal state, queue next command.
5. **Idle (remainder):** Pad to exactly 525 ms before next cycle.

### UI Communication Cycle (50 ms)

```
|<---------- 50 ms ---------->|
|   Poll    |    Process       |
|  ~25ms    |     ~25ms        |
|-----------|------------------|

 0ms       25ms              50ms
```

1. **Poll (~25 ms):** Exchange messages with UI at 115200 baud (fast).
2. **Process (~25 ms):** Handle UI commands, update display state.

---

## Implementation Recommendations

1. **Maintain the 525 ms valve tick.** The mixing valve firmware expects commands at this cadence. Faster polling yields no benefit; slower polling causes the valve to assume loss of communication.

2. **50 ms is acceptable for the UI.** The Amulet display refreshes at this rate. Faster polling wastes CPU cycles without visible improvement.

3. **Add 10-20% timeout margins.** When implementing custom integrations, pad all timeouts by at least 10-20% to account for bus contention and processing jitter.

4. **Always stagger outlets by 500 ms.** Activating multiple solenoid outlets simultaneously draws excessive current. The 500 ms stagger prevents electrical surges and relay damage.

5. **Wait 150 ms for echo clearance.** On the RS-485 bus, allow at least 150 ms after transmitting before reading to avoid interpreting your own echo as a reply.

6. **Use exponential backoff for retries.** Rather than retrying at fixed intervals, double the delay between each successive retry up to the maximum retry count. This reduces bus congestion during error conditions.
