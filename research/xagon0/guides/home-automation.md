# Home Automation Integration Guide

## Overview

The DTV+ controller exposes an HTTP API via CGI endpoints on port 80. Any home automation system capable of making HTTP GET requests can control the shower, steam, lights, rain panel, and music.

## Key Endpoints for Automation

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/quick_shower.cgi` | GET | Start a shower with specified parameters |
| `/stop_shower.cgi` | GET | Stop all active outlets |
| `/steam_on.cgi` | GET | Activate steam generator |
| `/steam_off.cgi` | GET | Deactivate steam generator |
| `/light_on.cgi` | GET | Turn on lights (with module and intensity) |
| `/light_off.cgi` | GET | Turn off lights |
| `/rain_on.cgi` | GET | Activate rain panel |
| `/rain_off.cgi` | GET | Deactivate rain panel |
| `/music_on.cgi` | GET | Start music playback |
| `/music_off.cgi` | GET | Stop music playback |
| `/start_user.cgi` | GET | Activate a saved user preset |
| `/rpc.cgi` | GET | Direct RPC calls (most flexible) |
| `/values.cgi` | GET | Read current system state |
| `/save_variable.cgi` | GET | Write configuration values |
| `/edit_dt.cgi` | GET | Direct datatable access (advanced) |

## RPC-Based Control (Recommended)

The cleanest approach for automation is using `/rpc?index=N` which maps to high-level actions:

| RPC Index | Action |
|-----------|--------|
| 10 | Power toggle |
| 11 | Steam toggle |
| 12 | Rain toggle |
| 13 | Lights toggle |

Example: `GET http://<controller-ip>/rpc?index=10` toggles the shower on or off.

## Reading State

Poll `/values.cgi` to read the current datatable, which contains:

- Active shower state (on/off, which outlets)
- Current water temperature
- Device status (valves, steam, lights, rain, amplifier)
- Error states

## Writing Settings

Use `/save_variable.cgi` for configuration changes that need to persist. Use `/edit_dt.cgi` for direct datatable manipulation (advanced -- know what you are writing).

---

## Home Assistant Integration

### REST Commands

Add these to your Home Assistant `configuration.yaml`:

```yaml
rest_command:
  dtv_start_shower:
    url: "http://192.168.1.100/quick_shower.cgi?valve_num=1&valve1_outlet=1&valve1_massage=0&valve1_temp={{ temperature }}"
    method: GET

  dtv_stop_shower:
    url: "http://192.168.1.100/stop_shower.cgi"
    method: GET

  dtv_steam_on:
    url: "http://192.168.1.100/steam_on.cgi"
    method: GET

  dtv_steam_off:
    url: "http://192.168.1.100/steam_off.cgi"
    method: GET

  dtv_light_on:
    url: "http://192.168.1.100/light_on.cgi?module={{ module }}&intensity={{ intensity }}"
    method: GET

  dtv_light_off:
    url: "http://192.168.1.100/light_off.cgi?module={{ module }}"
    method: GET

  dtv_rain_on:
    url: "http://192.168.1.100/rain_on.cgi?mode=1&color={{ color }}"
    method: GET

  dtv_rain_off:
    url: "http://192.168.1.100/rain_off.cgi"
    method: GET

  dtv_start_preset:
    url: "http://192.168.1.100/start_user.cgi?user={{ preset }}"
    method: GET

  dtv_rpc:
    url: "http://192.168.1.100/rpc?index={{ index }}"
    method: GET
```

### REST Sensors

```yaml
sensor:
  - platform: rest
    name: "DTV+ Shower Status"
    resource: "http://192.168.1.100/values.cgi"
    scan_interval: 2
    value_template: "{{ value_json.shower_state | default('unknown') }}"
```

### Polling Interval

- Recommended: 500ms to 2000ms
- Remember the **2-session limit** -- a polling sensor counts as one session
- Leave one session free for commands

### Example Automation: Good Morning Preset

```yaml
automation:
  - alias: "Good Morning Shower"
    trigger:
      - platform: time
        at: "06:30:00"
    condition:
      - condition: state
        entity_id: binary_sensor.workday_sensor
        state: "on"
    action:
      - service: rest_command.dtv_start_preset
        data:
          preset: 1
```

---

## Node-RED Integration

Use **HTTP Request** nodes to call the CGI endpoints directly:

1. Add an HTTP Request node
2. Set method to GET
3. Set URL to `http://<controller-ip>/quick_shower.cgi?valve_num=1&valve1_outlet=1&valve1_massage=0&valve1_temp=38`
4. Connect to your trigger (button, schedule, voice assistant, etc.)

For state polling, use an Inject node set to repeat every 2 seconds feeding into an HTTP Request node pointed at `/values.cgi`, with a JSON parse node to extract the values you need.

---

## Important Limitations

| Limitation | Details |
|------------|---------|
| 2 concurrent sessions | The controller supports only 2 HTTP connections at a time. Exceeding this hangs the controller. |
| No push notifications | There is no WebSocket or event stream. You must poll for state changes. |
| ~200ms polling latency | Between the 525ms valve polling interval and HTTP round-trip, expect ~200ms minimum latency for state updates. |
| Monthly reboot recommended | The controller may become unresponsive after months of continuous operation. Schedule a monthly power cycle via a smart plug. |
| Connection handling | Always use `Connection: close` headers. Do not keep connections open. |
