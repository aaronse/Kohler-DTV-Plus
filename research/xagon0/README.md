# Kohler DTV+ Reverse Engineering Documentation

Community-driven documentation for the Kohler DTV+ digital shower system — a ~$5,000 "black box" that controls water temperature, steam, lighting, audio, and more through an embedded controller with no official API documentation.

This project aims to make the system understandable, repairable, and integrable with home automation.

> **New here?** Start with the [Getting Started Guide](guides/getting-started.md).
> **Bricked controller?** Jump to [NAND Flash Recovery](docs/repair/nand-flash-recovery.md).

**[Read the Disclaimer](DISCLAIMER.md)** before making any changes to your system.

---

## System at a Glance

```
                        ┌─────────────────────┐
                        │  MASTER CONTROLLER   │
                        │  (ColdFire MCF5441X) │
                        │                      │
                        │  MQX 3.8 RTOS        │
                        │  HTTP Server (CGI)   │
                        │  8x RS485 Ports      │
                        │  2x Valve Ports      │
                        └──────────┬───────────┘
                                   │
          ┌────────┬───────┬───────┼───────┬────────┐
          │        │       │       │       │        │
       ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐
       │Valve│ │Steam│ │Rain │ │Light│ │ Amp │ │ UI  │
       │     │ │ Gen │ │Panel│ │Brdg │ │     │ │     │
       └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
       Saturn   DTV+    DTV+    DTV+    DTV+   Amulet
       9600bd  9600bd  9600bd  9600bd  9600bd  115200bd
```

Three separate protocols, one controller, six device types. It's complicated — but it's all documented here.

## Documentation

### Architecture & Hardware
| Document | Description |
|----------|-------------|
| [System Overview](docs/system-overview.md) | Architecture diagram, device catalog, task structure |
| [Hardware Specs](docs/hardware.md) | MCU, memory, RS485 ports, connectors, replacement options |

### Communication Protocols
| Document | Description |
|----------|-------------|
| [DTV+ Protocol](docs/protocols/dtv-plus-protocol.md) | Primary RS485 protocol for peripherals (steam, rain, lights, amp, UI) |
| [Saturn Protocol](docs/protocols/saturn-protocol.md) | Valve control protocol (DTV 6-port, Prompt 2/3) |
| [Amulet UI Protocol](docs/protocols/amulet-ui-protocol.md) | Touch screen UART protocol (CRC-16, datatable paging) |

### Device Documentation
| Document | Description |
|----------|-------------|
| [Valve Control](docs/devices/valve-control.md) | All valve types, temperature format, calibration, 30-min timeout |
| [Steam Generator](docs/devices/steam-generator.md) | Temperature control, timer, power clean, error handling |
| [Rain Panel RGB](docs/devices/rain-panel.md) | Colors, effects, fade speeds, lighting modes |
| [Light Bridge](docs/devices/light-bridge.md) | Dimmer modules, brightness, external switches |
| [Amplifier](docs/devices/amplifier.md) | Bluetooth audio, volume/EQ, simulation mode |
| [Touch Screen UI](docs/devices/touchscreen-ui.md) | Amulet/Linux variants, datatable sync, RPC system |

### Web Interface & API
| Document | Description |
|----------|-------------|
| [CGI Endpoints](docs/web-interface/cgi-endpoints.md) | All ~68 HTTP endpoints with parameters and safety ratings |
| [Save Variable Reference](docs/web-interface/save-variable-reference.md) | Complete variable ID table (IDs 1-105) |
| [RPC Reference](docs/web-interface/rpc-reference.md) | 60+ remote procedure calls + digital screen replacement guide |
| [Datatable Structure](docs/web-interface/datatable-structure.md) | Memory pages, data types, ghost variables |
| [Values.cgi Guide](docs/web-interface/values-cgi-guide.md) | Reading system state via the values endpoint |

### Control Logic
| Document | Description |
|----------|-------------|
| [Timing Constants](docs/control-logic/timing-constants.md) | All poll intervals, timeouts, retry counts |
| [Temperature System](docs/control-logic/temperature-system.md) | Q-format (Cx2/Fx2), conversions, safety limits |
| [Massage Patterns](docs/control-logic/massage-patterns.md) | Wave/single timing, outlet staggering |

### Troubleshooting
| Document | Description |
|----------|-------------|
| [Error Codes](docs/troubleshooting/error-codes.md) | Valve, controller, steam, and amplifier error codes |
| [Known Issues](docs/troubleshooting/known-issues.md) | Network memory leak, flash degradation, common gotchas |
| [LED Patterns](docs/troubleshooting/led-patterns.md) | Diagnostic blink codes and what they mean |

### Repair
| Document | Description |
|----------|-------------|
| [NAND Flash Recovery](docs/repair/nand-flash-recovery.md) | Chip specs, extraction, reflash, firmware upload |
| [Boot Process](docs/repair/boot-process.md) | Bootloader flow, TFS fallback, failure modes |
| [Firmware Files](docs/repair/firmware-files.md) | Naming conventions, S-Record format, known versions |

### Other
| Document | Description |
|----------|-------------|
| [Firmware Updates](docs/firmware-update.md) | How OTA updates work, schedule calculation |
| [Implementation Quirks](docs/implementation-quirks.md) | Every gotcha, edge case, and "why does it do that?" |

## Guides

| Guide | Description |
|-------|-------------|
| [Getting Started](guides/getting-started.md) | Find your controller, make your first API call |
| [Home Automation](guides/home-automation.md) | Home Assistant, Node-RED integration patterns |

## Example Scripts

Python scripts (stdlib only, no dependencies) for controlling your DTV+:

| Script | Description |
|--------|-------------|
| [kohler_http.py](examples/kohler_http.py) | HTTP client library handling controller quirks |
| [basic_connection_test.py](examples/basic_connection_test.py) | Verify controller is reachable |
| [shower_control.py](examples/shower_control.py) | Start/stop shower, steam, lights, rain, music |
| [device_status_monitor.py](examples/device_status_monitor.py) | Live device status display |

```bash
cd examples
python basic_connection_test.py 192.168.1.100
python shower_control.py 192.168.1.100 start 40
python shower_control.py 192.168.1.100 rain blue
python device_status_monitor.py 192.168.1.100
```

## Quick Reference

### Most Useful Endpoints

| Action | Endpoint |
|--------|----------|
| Start shower | `GET /quick_shower.cgi?valve_num=1&valve1_outlet=1&valve1_temp=38&valve1_massage=0` |
| Stop shower | `GET /stop_shower.cgi` |
| Start user preset | `GET /start_user.cgi?user=1` |
| Toggle power (RPC) | `GET /rpc.cgi?index=10` |
| Toggle steam (RPC) | `GET /rpc.cgi?index=11` |
| Toggle lights (RPC) | `GET /rpc.cgi?index=13` |
| Toggle rain (RPC) | `GET /rpc.cgi?index=12` |
| Read system state | `GET /values.cgi` |
| System info | `GET /system_info.cgi` |

### Key Safety Notes

- **Maximum 2 concurrent HTTP connections** — the controller will hang if you exceed this
- **Some CGI endpoints can freeze or brick** the controller — check safety ratings
- **Never upload partial firmware files** — they will fail CRC validation and brick the unit
- **Verify water temperature** with a thermometer after any calibration changes

## Contributing

Found something new? Have corrections? Open an issue or PR.

Areas that need work:
- Datatable variable index mapping (many are still TBD)
- Additional firmware version documentation
- Home Assistant custom component
- Comprehensive endpoint response format documentation

## Disclaimer

This project is **not affiliated with Kohler Co.** All information was obtained through independent reverse engineering. See [DISCLAIMER.md](DISCLAIMER.md) for full details.

## License

MIT License
