# Light Bridge Dimmer Module

## Overview

The Light Bridge provides dimmable lighting control for up to 3 independent light modules connected to a single bridge unit. It supports incandescent and LED loads with configurable fade speeds and external wall switch integration.

## Device Configuration

| Parameter | Value |
|---|---|
| Device ID | `0x08` |
| Protocol | DTV+ |
| Tick interval | 200 ms |
| Max modules per bridge | 3 |

## Module Structure

```
+------------------+
|   LIGHT BRIDGE   |
|   (Device 0x08)  |
+--------+---------+
         |
    RS485 Bus
         |
    +----+----+----+
    |         |         |
+---+---+ +---+---+ +---+---+
| MOD 1 | | MOD 2 | | MOD 3 |
| Light | | Light | | Light |
+-------+ +-------+ +-------+
```

Each module is independently addressable and can have its own brightness, fade speed, and load type configuration.

## Module Tracking

The bridge tracks which modules are attached:

| Module | Subcommand | Status |
|---|---|---|
| Module 1 | `0x01` | Attached / Not attached |
| Module 2 | `0x02` | Attached / Not attached |
| Module 3 | `0x03` | Attached / Not attached |

Module attachment is detected automatically by the bridge. Hot-plugging a module will be picked up on the next status poll cycle.

## State Machine

```
+--------+
|  INIT  |
+--------+
     |
     v
+--------------+
| READ_BRIDGE  |  (get bridge-level status)
+--------------+
     |
     v
+----------------+
| READ_MODULE_1  |  (subcommand 0x01)
+----------------+
     |
     v
+----------------+
| READ_MODULE_2  |  (subcommand 0x02)
+----------------+
     |
     v
+----------------+
| READ_MODULE_3  |  (subcommand 0x03)
+----------------+
     |
     v
+--------------+
| SET_PARAMS   |  (apply pending changes)
+--------------+
     |
     +-----> loop back to READ_BRIDGE
```

The state machine continuously cycles through reading each module's status and applying any parameter changes.

## Communication

### Get Bridge Status

Polls the overall bridge status including number of detected modules and bridge-level errors.

```
DTV+ header | Device 0x08 | GET_DEV_STATUS | CRC
```

### Get Module Status

Polls an individual module. The subcommand byte selects which module (0x01, 0x02, or 0x03):

```
DTV+ header | Device 0x08 | GET_DEV_STATUS | Subcommand (01/02/03) | CRC
```

Response includes current brightness level, active fade, and module health.

### Set Module Parameters

Write brightness and fade speed to a specific module:

```
DTV+ header | Device 0x08 | SET_DEV_PARAM |
  Module number (1-3)
  Brightness (0-100)
  Fade speed:
    0x00 = Instant
    0x01 = Slow
    0x02 = Fast
  CRC
```

### Set External Key Mode (0x13)

Configures how the bridge responds to external wall switches:

```
DTV+ header | Device 0x08 | Command 0x13 |
  Key mode configuration
  CRC
```

## Light Delay Control

The light bridge supports an auto-off delay feature. When the shower turns off, the lights remain on for a configurable delay period before fading out. This prevents the user from being left in a dark enclosure immediately after the shower stops.

The delay timer starts when the associated shower event (valve off) is detected.

## External Switch Support

Each module can be controlled by a physical wall switch in addition to the digital controller:

- **Toggle mode:** Each press toggles the light on/off.
- **Dim up/down:** Press and hold to ramp brightness up or down.
- **Override:** Physical switch commands take priority over controller commands.

### Button Debouncing

External switch inputs are debounced with a **3-tick (150 ms) minimum** hold time. Presses shorter than 150 ms are ignored to prevent false triggers from electrical noise or switch bounce.

## Load Types

| Load Type | Description |
|---|---|
| Incandescent | Traditional filament bulbs, standard dimming curve |
| LED | LED fixtures, modified dimming curve to avoid flicker at low levels |

LED loads use a different dimming curve because LEDs respond non-linearly to voltage changes. At very low dimming levels, incandescent curves can cause visible LED flicker.

## CGI Variables

| Variable Name | CGI Index | Description |
|---|---|---|
| light_name | 50 | User-assigned light name |
| light_load_type | 51 | Incandescent or LED |
| light_fade_speed | 52 | Fade speed (0=instant, 1=slow, 2=fast) |
| light_brightness | 53 | Brightness level (0-100) |
| light_delay_time | 55 | Auto-off delay in seconds |
| light_delay_event | 56 | Event that triggers delay timer |
| lighting_add_module | 84 | Add/register a module |
| lighting_del_module | 85 | Remove/deregister a module |
