# Error Codes Reference

Comprehensive listing of all error codes in the DTV+ system, organized by subsystem.

---

## Valve Error Codes (Saturn Protocol)

These codes are reported by the mixing valve hardware over the Saturn serial protocol.

### Configuration Errors

| Code | Name                  | Description                                          |
|------|-----------------------|------------------------------------------------------|
| 0    | `UNCONFIGURED_ERROR`  | Valve has not been configured. Run initial setup.     |
| 1    | `ERROR_OK`            | No error. Normal operating state.                     |
| 114  | `BAD_VALVE_CONFIG`    | Valve configuration is corrupted or invalid. Reconfigure via the installer interface. |

### Temperature Errors

| Code | Name                       | Description                                          |
|------|----------------------------|------------------------------------------------------|
| 2    | `RANGE_ERROR`              | Requested temperature is outside the allowed range (below 30 C or above 49 C). |
| 3    | `OVERTEMP_CONTROL_ERROR`   | Mixing valve's internal temperature exceeds safe limits. The valve shuts down to prevent scalding. Check hot supply temperature. |
| 5    | `A2D_ERROR`                | Analog-to-digital converter failure. The thermistor reading circuit has malfunctioned. Hardware fault. |
| 6    | `A2D_TIMEOUT`              | ADC conversion did not complete in time. May indicate intermittent hardware issue. Power cycle the valve. |
| 7    | `OVERTEMP_OUTLET_ERROR`    | Outlet water temperature exceeds safe threshold. Valve closes hot supply. May indicate a stuck mixing motor. |

### Algorithm Errors

| Code | Name                | Description                                          |
|------|---------------------|------------------------------------------------------|
| 4    | `COMP_ERROR`        | Compensation algorithm failure. The valve's internal control loop cannot converge on the target temperature. |
| 37   | `ALG_FAULT`         | General algorithm fault in the mixing control logic.  |
| 38   | `ALG_COLD_TIMEOUT`  | Valve timed out trying to reach setpoint from the cold side. Hot supply may be unavailable. |
| 39   | `ALG_HOT_TIMEOUT`   | Valve timed out trying to reach setpoint from the hot side. Cold supply may be unavailable. |

### Memory Errors

| Code | Name           | Description                                          |
|------|----------------|------------------------------------------------------|
| 8    | `RAM_ERROR`    | RAM self-test failed. Hardware fault -- valve needs replacement. |
| 16   | `EE_ERROR`     | EEPROM read/write failure. Calibration and settings may be lost. |
| 32   | `FLASH_ERROR`  | Flash memory error. Firmware integrity compromised.   |
| 80   | `STACK_ERROR`  | Stack overflow or corruption detected. Firmware bug or hardware fault. |

### Relay and Electrical Errors

| Code | Name               | Description                                          |
|------|--------------------|------------------------------------------------------|
| 35   | `WELDED`           | **SAFETY HAZARD.** A relay contact has welded shut, meaning an outlet cannot be turned off. The valve must be replaced immediately. Water flow cannot be stopped through normal control. |
| 36   | `RELAY_FAULT`      | Relay failed to switch. May be intermittent. Check relay board connections. |
| 40   | `CONTROLLER_FAULT` | Internal controller hardware failure.                 |
| 41   | `BATTERY_FAULT`    | Backup battery (RTC or EEPROM retention) has failed.  |

### Motor Errors

| Code | Name              | Description                                          |
|------|-------------------|------------------------------------------------------|
| 60   | `M_STUCK`         | Mixing motor is stuck (temporary). Often caused by mineral buildup. May clear on retry. |
| 61   | `M_REALLY_STUCK`  | Mixing motor is persistently stuck. Multiple retry attempts have failed. Requires professional service -- motor or valve replacement. |
| 70   | `M_CALIB`         | Motor calibration in progress or calibration error.   |
| 71   | `M_HOMING`        | Motor is performing its homing sequence.              |

### Other Valve Errors

| Code | Name              | Description                                          |
|------|-------------------|------------------------------------------------------|
| 45   | `OUTLET_ERROR`    | General outlet fault (flow sensor, solenoid, or relay issue). |
| 90   | `SCHEDULE_ERROR`  | Scheduled operation failed to execute.                |

---

## Controller System Error Log (Codes 100-204)

These errors are logged by the DTV+ controller itself and stored in the on-board error log.

### Device Events (100-109)

#### DETACH_EVENT (100)

A device has disconnected from the bus. The error log records the device type byte:

| Device Byte | Device Type       | Common Causes                              | Recovery                                |
|-------------|-------------------|--------------------------------------------|-----------------------------------------|
| `0x03`      | Rain Panel        | Loose connector, cable damage              | Reseat cable, check for corrosion       |
| `0x05`      | Steam Generator   | Communication cable fault, generator reset | Check RS-485 wiring, power cycle steam  |
| `0x08`      | LightBridge       | Module power loss, firmware crash          | Power cycle LightBridge module          |
| `0x30`      | UI (primary)      | Touchscreen disconnect, cable fault        | Reseat ribbon cable, check UI power     |
| `0x31`      | UI (secondary)    | Same as primary UI                         | Same as primary UI                      |
| `0x40`      | Amplifier (alt)   | Amplifier power loss, bus contention       | Check amplifier power and cabling       |
| `0x07`      | Amplifier         | Same as 0x40 (dual device ID)             | Same as 0x40                            |

#### Other Device Events

| Code | Name                           | Description                                          |
|------|--------------------------------|------------------------------------------------------|
| 101  | `LIGHT_BRIDGE_MODULE_DROP`     | LightBridge module stopped responding mid-session.    |
| 101  | `UI1_AMULET_UNRESPONSIVE`     | Primary UI Amulet display not responding to serial polls. |
| 102  | `UI2_AMULET_UNRESPONSIVE`     | Secondary UI Amulet display not responding.           |
| 103  | `UI3_AMULET_UNRESPONSIVE`     | Tertiary UI Amulet display not responding.            |

### Configuration Errors (102-110)

| Code | Name                          | Description                                          |
|------|-------------------------------|------------------------------------------------------|
| 102  | `INVALID_SETTINGS`            | Stored settings failed validation after loading from flash. |
| 103  | `FFS_FATAL_ERRORS`            | Flash filesystem fatal error. File operations failing. See [known issues](known-issues.md). |
| 104  | `DATA_TABLE_MISMATCH`         | Internal data table version does not match expected. Possible firmware mismatch. |
| 105  | `ETHERNET_LINK_DROP`          | Wired Ethernet connection lost.                       |
| 106  | `WIFI_LINK_DROP`              | Wi-Fi connection dropped.                             |
| 107  | `FTP_UNREACHABLE`             | FTP server for firmware updates not reachable.        |
| 108  | `DATA_TABLE_RE_INIT`          | Data tables were re-initialized to defaults.          |
| 109  | `NETWORK_RESET`               | Network stack was reset.                              |
| 110  | `BOOTLOADER_STORED_DATA_ERROR`| Bootloader configuration data is corrupted.           |

### Task Exceptions (130-137)

The controller runs multiple RTOS tasks. If a task encounters an unhandled exception, it logs one of these codes.

| Code | Name               | Description                   |
|------|--------------------|-------------------------------|
| 130  | `TASK1_EXCEPTION`  | Task 1 unhandled exception    |
| 131  | `TASK2_EXCEPTION`  | Task 2 unhandled exception    |
| 132  | `TASK3_EXCEPTION`  | Task 3 unhandled exception    |
| 133  | `TASK4_EXCEPTION`  | Task 4 unhandled exception    |
| 134  | `TASK5_EXCEPTION`  | Task 5 unhandled exception    |
| 135  | `TASK6_EXCEPTION`  | Task 6 unhandled exception    |
| 136  | `TASK7_EXCEPTION`  | Task 7 unhandled exception    |
| 137  | `TASK8_EXCEPTION`  | Task 8 unhandled exception    |

### Task Aborts (138-146)

More severe than exceptions -- the task has terminated and will not restart without a reboot.

| Code | Name                  | Description                                          |
|------|-----------------------|------------------------------------------------------|
| 138  | `TASK1_ABORT`         | Task 1 aborted                                        |
| 139  | `TASK2_ABORT`         | Task 2 aborted                                        |
| 140  | `TASK3_ABORT`         | Task 3 aborted                                        |
| 141  | `TASK4_ABORT`         | Task 4 aborted                                        |
| 142  | `TASK5_ABORT`         | Task 5 aborted                                        |
| 143  | `TASK6_ABORT`         | Task 6 aborted                                        |
| 144  | `TASK7_ABORT`         | Task 7 aborted                                        |
| 145  | `TASK8_ABORT`         | Task 8 aborted                                        |
| 146  | `NETWORK_TASK_ABORT`  | Network task aborted. Common after extended uptime due to TCP/IP stack memory leak. See [known issues](known-issues.md). |

### Valve Instability (201-204)

| Code | Name                | Description                                          |
|------|---------------------|------------------------------------------------------|
| 201  | `VALVE_1_INSTABLE`  | Valve 1 communication is unstable (intermittent replies). |
| 202  | `VALVE_2_INSTABLE`  | Valve 2 communication is unstable.                    |
| 203  | `VALVE_3_INSTABLE`  | Valve 3 communication is unstable.                    |
| 204  | `VALVE_4_INSTABLE`  | Valve 4 communication is unstable.                    |

Instability typically indicates wiring problems -- long cable runs, missing termination resistors, or electromagnetic interference. See [known issues](known-issues.md).

---

## Steam Generator Errors

### RPC Notification Codes

These are sent from the steam generator to the controller as asynchronous notifications:

| Code | Name                         | Description                                          |
|------|------------------------------|------------------------------------------------------|
| 41   | `STEAM_THERMISTOR_ERROR`     | Steam temperature sensor has failed or is out of range. |
| 42   | `STEAM_COMMUNICATION_ERROR`  | Controller lost communication with the steam generator. |
| 43   | `STEAM_OVER_TEMP_ERROR`      | Steam generator exceeded maximum safe temperature.    |
| 44   | `STEAM_SAFETY_CIRCUIT_ERROR` | Hardware safety interlock has tripped. Manual reset required. |

### Steam Status Codes

| Code | Name          | Description                                          |
|------|---------------|------------------------------------------------------|
| 0    | `NOT_INSTALLED` | No steam generator detected on the bus.             |
| 1    | `OFF`           | Steam generator is off.                             |
| 2    | `ON`            | Steam generator is actively producing steam.        |
| 3    | `PC_ACTIVE`     | Power clean cycle is actively running.              |
| 4    | `PC_WARNING`    | Power clean due in 600 minutes of steam use.        |
| 5    | `PC_REQUIRED`   | Power clean is overdue. Must be run before next steam session. |
| 6    | `ERROR`         | Steam generator is in an error state.               |
| 7    | `PURGE_ACTIVE`  | Post-session purge cycle is running (clears residual water). |
| 8    | `INVALID`       | Status byte is unrecognized or corrupted.           |

---

## UI RPC Error Codes

Error codes sent from the controller to the UI for display to the user:

| Code | Name                   | Description                                          |
|------|------------------------|------------------------------------------------------|
| 7    | `VALVE_ERROR_RESETTABLE` | Valve error that can be cleared by the user (e.g., retry from the UI). |
| 8    | `VALVE_ERROR_FATAL`    | Valve error that requires professional service. Cannot be cleared from the UI. |
| 36   | `ERROR_RST`            | Error reset command sent to valve.                    |
| 54   | `ERROR_RESET`          | Full error state reset.                               |

---

## Amplifier Status Codes

| Code | Name            | Description                          |
|------|-----------------|--------------------------------------|
| 0    | `OFF`           | Amplifier is powered off             |
| 1    | `PLAY`          | Audio is playing                     |
| 2    | `PAUSE`         | Audio is paused                      |
| 3    | `ERROR`         | Amplifier fault                      |
| 15   | `NOT_INSTALLED` | No amplifier detected on the bus     |

---

## Error Severity Classification

### Resettable Errors

These errors can be cleared by the user through the UI or by power cycling the affected device:

- `RANGE_ERROR` (2) -- adjust temperature setpoint
- `A2D_TIMEOUT` (6) -- power cycle valve
- `COMP_ERROR` (4) -- retry operation
- `M_STUCK` (60) -- often clears on retry
- `ALG_COLD_TIMEOUT` (38) / `ALG_HOT_TIMEOUT` (39) -- check water supply, retry
- `VALVE_ERROR_RESETTABLE` (7) -- use UI reset button

### Fatal / Service-Required Errors

These errors indicate hardware failure and require professional service or part replacement:

- `WELDED` (35) -- **immediate valve replacement** (safety hazard)
- `M_REALLY_STUCK` (61) -- motor or valve replacement
- `RAM_ERROR` (8) -- valve replacement
- `A2D_ERROR` (5) -- valve replacement
- `CONTROLLER_FAULT` (40) -- valve replacement
- `STEAM_SAFETY_CIRCUIT_ERROR` (44) -- manual reset on generator
- `VALVE_ERROR_FATAL` (8) -- professional service

---

## Accessing the Error Log

### Web Interface Endpoints

| Endpoint              | Description                                  |
|-----------------------|----------------------------------------------|
| `/values.cgi?page=error_log` | Read the error log as structured data  |
| `/cerror_logs.cgi`    | Controller error log (formatted)              |
| `/kerror_logs.cgi`    | Kohler-format error log export                |

### Error Log Characteristics

- **Capacity:** 99 entries maximum.
- **Storage:** Circular buffer -- oldest entries are overwritten when full.
- **Persistence:** Saved to flash memory so errors survive power cycles.
- **Format:** Each entry includes a timestamp, error code, and source identifier.

To retrieve the error log programmatically:

```
GET http://<controller-ip>/cerror_logs.cgi
```

The response contains the log entries in plain text, one per line, with the most recent entries last.
