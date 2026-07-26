# RPC Reference

Complete reference for Remote Procedure Calls (RPCs) used by the Kohler DTV+ system.

## Web API

```
GET /rpc.cgi?index=<N>
```

Response: `":)"` on success, `":("` on failure.

RPCs are the mechanism by which the UI tells the controller to perform actions (and vice versa). The web interface can invoke UI-to-Controller RPCs via the CGI endpoint above. Controller-to-UI RPCs are received by the UI automatically and are documented here for completeness.

---

## UI to Controller Commands (Index 0-40)

### System Commands (0-10)

| Index | Name | Description |
|-------|------|-------------|
| 0 | `COMPLETE_RESET` | Full system reset -- clears all configuration and restarts |
| 1 | `PAUSE` | Pause the current shower operation |
| 2 | `RESUME` | Resume a paused shower operation |
| 3 | `RUN_MAN_CMD_1` | Execute manual command sequence 1 (valve outlet test) |
| 4 | `SKIP_AUTO_PURGE` | Skip the auto-purge cycle on startup |
| 5 | `STOP_MASSAGE` | Stop all active massage patterns |
| 6 | `RUN_MASSAGE_CMD_1` | Start massage command sequence 1 |
| 7 | `DATA_TABLE_SAVE_REQ` | Request the controller to save the datatable to flash |
| 8 | `RESET_ERROR` | Clear the current error state |
| 10 | `POWER_BUTTON_CHANGE` | Notify controller of power button state change |

> Index 9 is unused/reserved.

### Feature Commands (11-20)

| Index | Name | Description |
|-------|------|-------------|
| 11 | `STEAM` | Toggle or update steam operation |
| 12 | `RAIN_PANEL` | Toggle or update rain panel operation |
| 13 | `LIGHTING` | Notify controller of lighting configuration change |
| 14 | `OPERATION_MODE` | Change the system operation mode |
| 15 | `UPDATE_CONTROLLER_TIME` | Sync the current time to the controller |
| 16 | `UPDATE_AUDIO_COMMAND` | Send an audio control command to the amplifier |
| 17 | `CLEAR_MASSAGE` | Clear custom massage configuration |
| 18 | `AMULET_PAGE_LOAD` | Notify controller that a UI page has loaded |
| 19 | `CANCEL_AUTO_PURGE` | Cancel an in-progress auto-purge |
| 20 | `UPDATE_DEVICES` | Re-scan and update the connected device list |

### State Change Notifications (21-27)

| Index | Name | Description |
|-------|------|-------------|
| 21 | `WATER_CHANGE` | Water/shower settings have changed |
| 22 | `STEAM_CHANGE` | Steam settings have changed |
| 23 | `LIGHT_CHANGE` | Lighting settings have changed |
| 24 | `MUSIC_CHANGE` | Audio settings have changed |
| 25 | `USER_CHANGE` | Active user has changed |
| 26 | `SPA_END` | End the current spa session |
| 27 | `TIMER_CHANGE` | Timer value has changed |

### Outlet, Massage, and Extended Commands (28-40)

| Index | Name | Description |
|-------|------|-------------|
| 28 | `STAGGER_OUTLETS` | Stagger outlet activation sequence |
| 29 | `START_TIMER` | Start the countdown timer |
| 30 | `RUN_MASSAGE_CMD_2` | Execute massage command sequence 2 |
| 31 | `RUN_MASSAGE_CMD_2_ALT_1` | Execute massage command sequence 2 (alternate 1) |
| 32 | `STOP_MASSAGE_VALVE1` | Stop massage on valve 1 only |
| 33 | `STOP_MASSAGE_VALVE2` | Stop massage on valve 2 only |
| 34 | `TUB_FILL_START` | Start tub fill operation |
| 35 | `POPULATE_LANGUAGE` | Load language strings into datatable |
| 36 | `ERROR_RST` | Reset error state (alternate) |
| 37 | `RUN_MASSAGE_CMD_2_ALT_1_USER` | Execute massage command 2 alt 1 with user context |
| 38 | `ON_DELUGE` | Activate the deluge outlet |
| 39 | `TEMP_MAN_CMD_1` | Temporary manual command 1 (diagnostic) |
| 40 | `LIGHT_DELAY` | Trigger the light delayed-off timer |

---

## Controller to UI Commands (Index 1-62)

These are received by the UI from the controller. They are not directly callable via the web API but are documented for protocol understanding and for building custom UI replacements.

### Settings Updates (1-12)

| Index | Name | Description |
|-------|------|-------------|
| 1 | `UPDATE_LANGUAGE` | Language has changed -- reload strings |
| 2 | `UPDATE_TEMP_UNITS` | Temperature units changed (F/C) |
| 3 | `UPDATE_TIME_DATE_FORMAT` | Time or date format changed |
| 4 | `UPDATE_SYSTEM_SETTINGS` | General system settings updated |
| 5 | `LOC_DOWNLOAD_STARTED` | Localization file download has begun |
| 6 | `IMG_INSTALL_STARTED` | Image/firmware installation has begun |
| 7 | `VALVE_ERROR_RESETTABLE` | Valve error occurred (can be cleared by user) |
| 8 | `VALVE_ERROR_FATAL` | Valve error occurred (requires service) |
| 12 | `UPDATE_AMULETS_TIME` | Time update for all connected UI panels |

> Indices 9-11 are unused/reserved.

### Massage Notifications (13-20)

| Index | Name | Description |
|-------|------|-------------|
| 13 | `START_MAN_COMMAND_1` | Manual command 1 has started executing |
| 14 | `START_WAVE_MASSAGE_1` | Wave massage started on valve 1 |
| 15 | `START_WAVE_MASSAGE_2` | Wave massage started on valve 2 |
| 16 | `START_SINGLE_MASSAGE_1` | Single-point massage started on valve 1 |
| 17 | `START_SINGLE_MASSAGE_2` | Single-point massage started on valve 2 |
| 18 | `START_CUSTOM_MASSAGE_1` | Custom massage started on valve 1 |
| 19 | `START_CUSTOM_MASSAGE_2` | Custom massage started on valve 2 |
| 20 | `TIMER_EXPIRED` | Countdown timer has reached zero |

> Indices 21-27 are unused/reserved in the controller-to-UI direction.

### User and Feature Start Notifications (28-40)

| Index | Name | Description |
|-------|------|-------------|
| 28 | `START_USER_1` | User 1 preset has started |
| 29 | `START_USER_2` | User 2 preset has started |
| 30 | `START_USER_3` | User 3 preset has started |
| 31 | `START_USER_4` | User 4 preset has started |
| 32 | `START_USER_5` | User 5 preset has started |
| 33 | `START_USER_6` | User 6 preset has started |
| 34 | `START_LIGHTING` | Lighting has been activated |
| 35 | `START_STEAM` | Steam has been activated |
| 36 | `START_RAIN_PANEL` | Rain panel has been activated |
| 37 | `START_MUSIC` | Audio playback has started |
| 38 | `DEVICE_CHANGE` | A device was connected or disconnected |
| 39 | `STOP_USER` | Active user session has stopped |
| 40 | `DATA_TABLE_SAVED` | Datatable has been saved to flash |

### Error and Status Notifications (41-62)

| Index | Name | Description |
|-------|------|-------------|
| 41 | `STEAM_ERROR_GENERAL` | General steam generator error |
| 42 | `STEAM_ERROR_TEMP_SENSOR` | Steam temperature sensor fault |
| 43 | `STEAM_ERROR_OVERTEMP` | Steam over-temperature condition |
| 44 | `STEAM_ERROR_COMM` | Steam generator communication failure |
| 45 | `VALVE_ERROR_TEMP_SENSOR_1` | Valve 1 temperature sensor fault |
| 46 | `VALVE_ERROR_TEMP_SENSOR_2` | Valve 2 temperature sensor fault |
| 47 | `VALVE_ERROR_FLOW_1` | Valve 1 flow sensor fault |
| 48 | `VALVE_ERROR_FLOW_2` | Valve 2 flow sensor fault |
| 49 | `VALVE_ERROR_MOTOR_1` | Valve 1 motor fault |
| 50 | `VALVE_ERROR_MOTOR_2` | Valve 2 motor fault |
| 51 | `VALVE_ERROR_OVERTEMP_1` | Valve 1 over-temperature condition |
| 52 | `VALVE_ERROR_OVERTEMP_2` | Valve 2 over-temperature condition |
| 53 | `VALVE_ERROR_COMM` | Valve communication failure |
| 54 | `ERROR_RESET` | Error state has been cleared |
| 55 | `RUNTIME_LIMIT_VALVE` | Valve maximum runtime limit reached |
| 56 | `RUNTIME_LIMIT_STEAM` | Steam maximum runtime limit reached |
| 57 | `RUNTIME_LIMIT_WARNING` | Runtime limit warning (approaching max) |
| 58 | `UI_FIRMWARE_VERSION` | UI firmware version notification |
| 59 | `SPA_STOP` | Spa session has ended |
| 60 | `STEAM_POWER_DOWN` | Steam generator is powering down |
| 61 | `STEAM_DELUGE` | Steam deluge cycle activated |
| 62 | `SPA_CHANGE` | Spa configuration has changed |

---

## Building a Digital Screen Replacement

The RPC and datatable systems make it possible to build a completely custom interface that replaces the physical Kohler touchscreen.

### Architecture

```
+------------------+       HTTP/CGI        +------------------+
|  Custom Web UI   | <------------------> |   DTV+ Controller |
|  (Browser/App)   |   /values.cgi        |   (Embedded Web)  |
|                  |   /edit_dt.cgi        |                   |
|  - Dashboard     |   /rpc.cgi           |   - Valve control  |
|  - Controls      |   /quick_shower.cgi  |   - Steam control  |
|  - Status        |   /save_variable.cgi |   - Lighting       |
+------------------+                       +------------------+
```

### Minimum Implementation

A functional replacement needs four components:

**1. Status Polling Loop**

Poll `values.cgi` on a regular interval to read system state:

```javascript
// Independently written example -- not from Kohler source
async function pollStatus() {
    try {
        const resp = await fetch('/values.cgi?page=control&type=byte', {
            cache: 'no-store'
        });
        const data = await resp.json();
        updateDashboard(data.values);
    } catch (err) {
        console.error('Poll failed:', err);
    }
}

setInterval(pollStatus, 500);  // Poll every 500ms
```

**2. Action Buttons**

Wire controls to the appropriate CGI endpoints:

```javascript
// Start shower with user preset
async function startUser(userNum) {
    await fetch(`/start_user.cgi?user=${userNum}`);
}

// Stop shower
async function stopShower() {
    await fetch('/stop_shower.cgi');
}

// Toggle steam
async function toggleSteam(temp, minutes) {
    await fetch(`/steam_on.cgi?temp=${temp}&time=${minutes}`);
}
```

**3. Temperature Control**

Use `save_variable.cgi` to adjust temperature, then trigger an RPC:

```javascript
async function setTemperature(valve, tempCelsius) {
    await fetch(`/save_variable.cgi?index=38&value=${tempCelsius}&valve=${valve}`);
    await fetch('/rpc.cgi?index=21');  // WATER_CHANGE -- notify controller
}
```

**4. User Presets**

Start saved user configurations:

```javascript
async function activatePreset(userId) {
    await fetch(`/start_user.cgi?user=${userId}`);
}
```

### Key Datatable Variables to Poll

| Variable | Page | Type | Description |
|----------|------|------|-------------|
| Shower running state | Stationary byte | Byte | Nonzero when shower is active |
| Current temperature | Stationary word | Word | Current water temperature reading |
| Target temperature | Stationary word | Word | Setpoint temperature |
| Steam state | Stationary byte | Byte | Steam on/off and timer |
| Active user | Stationary byte | Byte | Currently active user (0 = none) |
| Error flags | Stationary word | Word | Active error bitfield |

See [Datatable Structure](datatable-structure.md) and [values.cgi Guide](values-cgi-guide.md) for specifics.

### Advantages

- **No physical touchscreen required** -- any device with a browser can control the system
- **Multi-device access** -- control from phone, tablet, wall-mounted display, or desktop
- **Custom UI** -- design an interface tailored to your household's needs
- **Remote control** -- operate the shower from anywhere on the local network
- **Home automation integration** -- bridge to Home Assistant, OpenHAB, or custom systems via HTTP calls

### Limitations

- **No firmware updates via web** -- firmware upload requires the official Kohler interface or `fileupload.cgi` with the correct binary
- **Polling latency** -- HTTP polling introduces approximately 200ms latency compared to the ~50ms update rate of the physical touchscreen's direct Amulet protocol
- **Network dependency** -- the custom UI requires a working network connection to the DTV+ unit
- **Session limit** -- only 2 concurrent HTTP sessions, so a polling loop plus user interactions must share connections carefully
- **No push notifications** -- the web server does not support WebSockets or server-sent events; all state monitoring requires polling

---

## Notes

- RPC indices are distinct between UI-to-Controller and Controller-to-UI directions. Index 1 means `PAUSE` when sent from UI, but `UPDATE_LANGUAGE` when sent from controller.
- After writing settings via `save_variable.cgi`, you typically need to fire the corresponding state-change RPC (e.g., `WATER_CHANGE` after changing temperature) for the controller to act on the new values.
- `DATA_TABLE_SAVE_REQ` (index 7) should be called after a batch of configuration changes to persist them to flash. Without this, changes survive only until the next power cycle.
