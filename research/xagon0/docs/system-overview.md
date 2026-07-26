# System Architecture Overview

The Kohler DTV+ is a digital shower system built around a central controller that coordinates valves, steam, lighting, audio, and a touch screen UI over RS485 serial buses.

## System Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MASTER CONTROLLER                                   │
│                     (Freescale MCF5441X ColdFire)                           │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Main Task   │  │ Shower Task  │  │  Steam Task  │  │  UI Task     │   │
│  │  (Priority   │  │  (Priority   │  │  (Priority   │  │  (Priority   │   │
│  │   17)        │  │   15)        │  │   15)        │  │   13)        │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    RTOS Message Queue System                       │     │
│  │                    (MQX 3.8 Real-Time OS)                         │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              8x RS485 Port Tasks (DTV+ Protocol)                    │    │
│  │   Port 1-8: Each supporting up to 2 devices per port               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ HTTP Server  │  │ Flash FS     │  │ Network      │                      │
│  │ (CGI/Web)    │  │ (HCC Safe)   │  │ (RTCS)       │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
          │              │              │              │              │
          │              │              │              │              │
    ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │   Valve   │  │   Steam   │  │   Rain    │  │  Light    │  │   Audio   │
    │  Module   │  │ Generator │  │  Panel    │  │  Bridge   │  │ Amplifier │
    │  (RS485)  │  │  (RS485)  │  │  (RS485)  │  │  (RS485)  │  │  (RS485)  │
    │           │  │           │  │           │  │           │  │           │
    │ Saturn    │  │ DTV+      │  │ DTV+      │  │ DTV+      │  │ DTV+      │
    │ Protocol  │  │ Protocol  │  │ Protocol  │  │ Protocol  │  │ Protocol  │
    └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │      Touch Screen UI          │
                        │   (Amulet CRC Protocol)       │
                        │   115200 baud UART             │
                        └───────────────────────────────┘
```

## Three Communication Protocols

The system uses **three separate protocols** — this is one of the key things that makes it confusing:

| Protocol | Used By | Baud Rate | Purpose |
|----------|---------|-----------|---------|
| [DTV+ Protocol](protocols/dtv-plus-protocol.md) | Steam, Rain, Lights, Amp, UI | 9600 | Primary device communication |
| [Saturn Protocol](protocols/saturn-protocol.md) | All valve types | 9600 | Valve control (predates DTV+) |
| [Amulet CRC Protocol](protocols/amulet-ui-protocol.md) | Touch screen only | 115200 | UI datatable synchronization |

The UI is special — it uses **DTV+ protocol for discovery**, then switches to **Amulet CRC for data transfer**.

## Device Catalog

| Device | DTV+ ID | Protocol | Poll Interval | Notes |
|--------|---------|----------|---------------|-------|
| Controller | 0x00 | — | — | Master, never a slave |
| Rain Panel | 0x03 | DTV+ | 175ms | RGB LED rain head |
| Steam Generator | 0x05 | DTV+ | 150ms | Temperature + timer control |
| Light Bridge | 0x08 | DTV+ | 200ms | Up to 3 dimmer modules |
| Test Fixture | 0x09 | DTV+ | — | Factory test equipment |
| UI v1 | 0x30 | DTV+ / Amulet | 50ms | Original ColdFire-based |
| UI v2 | 0x31 | DTV+ / Amulet | 50ms | New generation |
| Amplifier | 0x40 (or 0x07) | DTV+ | 350ms | Bluetooth audio |
| Bootloader | 0xF0 | DTV+ | — | Firmware update mode |
| DTV 6-Port Valve | 0x06* | Saturn | 525ms | *Firmware type ID, not DTV+ ID |
| Prompt 2-Port Valve | 0x17* | Saturn | 525ms | *Firmware type ID |
| Prompt 3-Port Valve | 0x1E* | Saturn | 525ms | *Firmware type ID |

## RTOS Task Structure

The controller runs 15+ concurrent tasks on MQX 3.8 RTOS:

| Task | Priority | Period | Purpose |
|------|----------|--------|---------|
| MAIN_TASK | 17 (highest) | Event-driven | System coordinator |
| SHOWER_TASK | 15 | 100ms | Shower control logic |
| STEAM_TASK | 15 | 150ms | Steam generator control |
| RAIN_PANEL_TASK | 15 | 175ms | Rain panel / RGB lighting |
| LIGHT_BRIDGE_TASK | 15 | 200ms | Dimmer control |
| RELAY_TASK | 15 | 100ms | Relay switching |
| DIM_TASK | 15 | 1000ms | Dimmer timing |
| VALVE_TASK | 14 | 525ms | Primary valve control |
| VALVE2_TASK | 14 | 525ms | Secondary valve control |
| DTV_PLUS_PORT[1-8] | 14 | Varies | RS485 port handlers |
| UI_TASK | 13 | 50ms | Touch screen interface |

## Web Interface

The controller runs an embedded HTTP server with:
- **~68 CGI endpoints** for control, configuration, and diagnostics
- **Web pages** built with jQuery 1.9.1 and jQuery UI 1.10.2
- **Two data access methods**: Direct datatable reads (`values.cgi`) and a CGI variable system (`save_variable.cgi`)
- **Maximum 2 concurrent HTTP connections** — exceeding this will cause hangs

See [CGI Endpoints Reference](web-interface/cgi-endpoints.md) for full documentation.

## Key System Features

1. **Multi-Valve Support** — Up to 4 valves (2 per valve port), supporting DTV 6-port, Prompt 2-port, and Prompt 3-port
2. **Temperature Control** — Q-format arithmetic (Celsius x 2) for 0.5°C resolution without floating point
3. **6 User Presets** — Each user stores temperature, outlets, steam, lighting, and audio preferences
4. **Massage Modes** — Wave and single patterns with configurable timing sequences
5. **Steam Generator** — Timer-based with automatic power clean cycle tracking
6. **RGB Rain Panel** — Color cycling, sunrise/sunset, weather effects
7. **Dimmer Control** — Up to 3 light modules per Light Bridge with external switch support
8. **Bluetooth Audio** — Paired amplifier with volume, bass, treble, and balance
9. **Device Simulation** — Built-in simulation mode for testing without physical hardware
10. **Auto-Discovery** — Devices are auto-discovered on RS485 bus at startup

## Where to Go From Here

- **Just want to control your shower from a browser?** Start with the [Getting Started Guide](../guides/getting-started.md)
- **Integrating with Home Assistant?** See the [Home Automation Guide](../guides/home-automation.md)
- **Need to fix a bricked controller?** Go to the [Repair Section](repair/nand-flash-recovery.md)
- **Building a replacement controller?** Read the [Protocols](protocols/) and [Implementation Quirks](implementation-quirks.md)
