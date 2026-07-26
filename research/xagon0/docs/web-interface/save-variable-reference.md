# save_variable.cgi Reference

Complete reference for all variable IDs accepted by `save_variable.cgi`.

## Usage

```
GET /save_variable.cgi?index=<ID>&value=<VALUE>[&module=<1-3>][&valve=<1-2>][&outlet=<N>]
```

The `module`, `valve`, and `outlet` parameters are optional and only required for variables that apply to a specific hardware target (e.g. lighting modules, valve outlets).

---

## Variable ID Table

### User and System Settings (1-31)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 1 | `shower_config` | Shower configuration preset | |
| 2 | `date_time` | Set date and time | Formatted string |
| 3 | `daylight_savings` | Daylight savings toggle | `0` = off, `1` = on |
| 4 | `lang` | Language selection | `0`-`13` (see language enum) |
| 5 | `units` | Temperature units | `0` = Fahrenheit, `1` = Celsius |
| 6 | `power_off` | Power off system | |
| 7 | `settings_lock` | Lock settings from UI changes | `0` = unlocked, `1` = locked |
| 8 | `steam_select` | Steam feature selection | |
| 9 | `massage` | Massage configuration | |
| 10 | `spa` | Spa mode configuration | |
| 11 | `relay_on_when` | Relay 1 activation trigger | Event ID |
| 12 | `relay_off_when` | Relay 1 deactivation trigger | Event ID |
| 13 | `relay_on_delay` | Relay 1 on-delay enable | `0` = no delay, `1` = delay |
| 14 | `relay_on_delay_time` | Relay 1 on-delay duration | Seconds |
| 15 | `relay_off_delay` | Relay 1 off-delay enable | `0` = no delay, `1` = delay |
| 16 | `relay_off_delay_time` | Relay 1 off-delay duration | Seconds |
| 17 | `relay_name` | Relay 1 display name | String (max 25 chars) |
| 18 | `contact_name` | Contact input 1 display name | String |
| 19 | `contact_when_closed` | Contact 1 action when closed | Event ID |
| 20 | `contact_when_open` | Contact 1 action when open | Event ID |
| 21 | `contact_on_delay` | Contact 1 on-delay enable | `0` or `1` |
| 22 | `contact_on_delay_time` | Contact 1 on-delay duration | Seconds |
| 23 | `contact_off_delay` | Contact 1 off-delay enable | `0` or `1` |
| 24 | `contact_off_delay_time` | Contact 1 off-delay duration | Seconds |
| 25 | `user_name` | User display name | String; requires `user` context |
| 26 | `clear_user_name` | Clear a user's name | |
| 27 | `auto_return` | Auto-return to home screen | Timeout in seconds, `0` = disabled |
| 28 | `interface_beep` | Interface button beep | `0` = off, `1` = on |
| 29 | `interface_name` | Interface display name | String |
| 30 | `interface_auto_dim` | Auto-dim timeout | Seconds, `0` = disabled |
| 31 | `interface_start_screen` | Default screen on wake | Screen ID |

### Valve Control (32-42)

These variables accept optional `valve` (1-2) and `outlet` parameters.

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 32 | `valve_outlet_order` | Outlet activation order | Requires `valve`, `outlet` |
| 33 | `valve_outlet_massage` | Outlet massage assignment | Requires `valve`, `outlet` |
| 34 | `valve_outlet_default` | Default outlet(s) for valve | Requires `valve` |
| 35 | `valve_outlet_flow` | Outlet flow rate setting | Requires `valve`, `outlet` |
| 36 | `valve_outlet_ramp` | Outlet ramp-up time | Requires `valve`, `outlet` |
| 37 | `valve_outlet_type` | Outlet type identifier | Requires `valve`, `outlet` |
| 38 | `valve_default_temp` | Default temperature | Float, Celsius; requires `valve` |
| 39 | `valve_max_temp` | Maximum temperature limit | Float, Celsius; requires `valve` |
| 40 | `valve_massage_order` | Massage outlet rotation order | Requires `valve` |
| 41 | `valve_auto_purge` | Auto-purge on startup | `0` = off, `1` = on; requires `valve` |
| 42 | `valve_cold_water` | Cold water flush enable | `0` = off, `1` = on; requires `valve` |

### Audio (43-49)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 43 | `music_volume` | Playback volume | `0`-`100` |
| 44 | `music_treble` | Treble level | `0`-`100` |
| 45 | `music_bass` | Bass level | `0`-`100` |
| 46 | `music_balance` | Left/right balance | `-50` to `+50` |
| 47 | `music_BT_device` | Bluetooth device name | String |
| 48 | `music_BT_key` | Bluetooth pairing key | String |
| 49 | `music_BT_password` | Bluetooth password/PIN | String |

### Lighting (50-56)

These variables accept an optional `module` (1-3) parameter.

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 50 | `light_name` | Light module display name | String; requires `module` |
| 51 | `light_load_type` | Load type (dimmer curve) | Requires `module` |
| 52 | `light_fade_speed` | Fade transition speed | Requires `module` |
| 53 | `light_brightness` | Brightness level | `0`-`100`; requires `module` |
| 55 | `light_delay_time` | Delayed off time | Seconds; requires `module` |
| 56 | `light_delay_event` | Delay trigger event | Event ID; requires `module` |

> Note: ID 54 is unused/reserved.

### Steam (57-60)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 57 | `steam_def_temp` | Default steam temperature | Degrees |
| 58 | `steam_max_temp` | Maximum steam temperature | Degrees |
| 59 | `steam_def_time` | Default steam duration | Minutes |
| 60 | `steam_start_clean` | Power-clean on startup | `0` = off, `1` = on |

### Calibration (61-62)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 61 | `six_port_calibration_valve1` | Valve 1 calibration offset | `160`-`200` |
| 62 | `six_port_calibration_valve2` | Valve 2 calibration offset | `160`-`200` |

> IDs 63-64 are unused/reserved.

### Relay 2 (65-71)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 65 | `relay_two_on_when` | Relay 2 activation trigger | Event ID |
| 66 | `relay_two_off_when` | Relay 2 deactivation trigger | Event ID |
| 67 | `relay_two_on_delay` | Relay 2 on-delay enable | `0` or `1` |
| 68 | `relay_two_on_delay_time` | Relay 2 on-delay duration | Seconds |
| 69 | `relay_two_off_delay` | Relay 2 off-delay enable | `0` or `1` |
| 70 | `relay_two_off_delay_time` | Relay 2 off-delay duration | Seconds |
| 71 | `relay_two_name` | Relay 2 display name | String |

### Contact 2 (72-78)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 72 | `contact_two_name` | Contact 2 display name | String |
| 73 | `contact_two_when_closed` | Contact 2 action when closed | Event ID |
| 74 | `contact_two_when_open` | Contact 2 action when open | Event ID |
| 76 | `contact_two_on_delay_time` | Contact 2 on-delay duration | Seconds |
| 78 | `contact_two_off_delay_time` | Contact 2 off-delay duration | Seconds |

> IDs 75 and 77 are unused/reserved.

### Rain Panel (79-82)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 79 | `rain_fade_speed` | Color fade transition speed | |
| 80 | `rain_brightness` | Panel brightness | `0`-`100` |
| 81 | `rain_white_color` | White color temperature | |
| 82 | `rain_effect_speed` | Effect animation speed | |

### System and Advanced (83-105)

| ID | Name | Description | Values / Notes |
|----|------|-------------|----------------|
| 83 | `outlet_auto_purge` | Global outlet auto-purge | `0` = off, `1` = on |
| 84 | `lighting_add_module` | Add a light module | Module number |
| 85 | `lighting_del_module` | Delete a light module | Module number |
| 86 | `wifi_password` | Wi-Fi password | String |
| 87 | `wifi_security` | Wi-Fi security type | |
| 88 | `wifi_SSID` | Wi-Fi network name | String |
| 89 | `hospitality` | Hospitality mode | `0` = off, `1` = on |
| 90 | `date_format` | Date display format | `0` = MM/DD/YYYY, `1` = DD/MM/YYYY |
| 91 | `time_format` | Time display format | `0` = 12-hour, `1` = 24-hour |
| 92 | `dual_shower` | Dual shower mode | `0` = single, `1` = dual |
| 93 | `valve_deluge_default` | Default deluge outlet | Requires `valve` |
| 94 | `clear_input_name` | Clear an input name | |
| 95 | `input_name` | Set input display name | String |
| 96 | `customMassageStatus` | Custom massage enable | `0` = off, `1` = on |
| 97 | `ui_user_lock` | Lock user switching on UI | `0` = unlocked, `1` = locked |
| 98 | `webpage_lock` | Lock web interface access | `0` = unlocked, `1` = locked |
| 99 | `max_valve_runtime` | Maximum valve runtime limit | Minutes; `0` = unlimited |
| 100 | `max_steam_runtime` | Maximum steam runtime limit | Minutes; `0` = unlimited |
| 101 | `clear_massage` | Clear custom massage config | |
| 102 | `spa_selection` | Spa preset selection | |
| 103 | `file_deletion` | Delete a file | Filename |
| 104 | `light_add_popup` | Show light-add confirmation | `0` = hide, `1` = show |
| 105 | `light_remove_popup` | Show light-remove confirmation | `0` = hide, `1` = show |

---

## Usage Examples

### Basic -- set temperature units to Celsius

```
GET /save_variable.cgi?index=5&value=1
```

### With valve parameter -- set valve 1 default temperature to 40 C

```
GET /save_variable.cgi?index=38&value=40&valve=1
```

### With module parameter -- set light module 2 brightness to 80%

```
GET /save_variable.cgi?index=53&value=80&module=2
```

### With valve and outlet -- set outlet 3 on valve 1 flow rate

```
GET /save_variable.cgi?index=35&value=75&valve=1&outlet=3
```

### Set user name (user context is determined by the active session)

```
GET /save_variable.cgi?index=25&value=Morning%20Shower
```

### Set Wi-Fi credentials

```
GET /save_variable.cgi?index=88&value=MyNetworkSSID
GET /save_variable.cgi?index=86&value=MyPassword123
GET /save_variable.cgi?index=87&value=3
```

### Enable hospitality mode

```
GET /save_variable.cgi?index=89&value=1
```

### Set maximum shower runtime to 30 minutes

```
GET /save_variable.cgi?index=99&value=30
```

---

## Notes

- The `index` parameter is required for every call.
- The `value` parameter is required for writes. String values should be URL-encoded.
- `module`, `valve`, and `outlet` are only meaningful for variables that target specific hardware. Supplying them for unrelated variables has no effect.
- Some variables trigger an RPC automatically after being written (e.g., lighting changes trigger RPC index 13).
- Write operations while the shower is running may be blocked by `CGI_SHOWER_LOCK`. See [CGI Endpoints](cgi-endpoints.md) for details.
