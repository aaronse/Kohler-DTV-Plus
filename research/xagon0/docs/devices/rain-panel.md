# Rain Panel RGB Lighting

## Overview

The rain panel module controls RGB LED lighting integrated into overhead shower panels. It supports fixed colors, animated effects, choreography sequences, and music-reactive modes.

## Device Configuration

| Parameter | Value |
|---|---|
| Device ID | `0x03` |
| Protocol | DTV+ |
| Tick interval | 175 ms |
| Max per system | 2 |

## Operation States

| State | Value | Description |
|---|---|---|
| OFF | `0x00` | Lights off |
| FIXED_COLOR | `0x01` | Static single color |
| EFFECTS | `0x02` | Animated lighting effect |
| CHOREOGRAPHY | `0x03` | Scripted color sequence |
| MUSIC_MATCH | `0x04` | Color reacts to audio input |

## Color System

Colors are specified using a **hue-based system** on a 0-360 degree scale:

| Color | Hue Value |
|---|---|
| Red | 0 |
| Orange | 30 |
| Yellow | 60 |
| Green | 115 |
| Blue | 235 |
| Violet | 270 |
| Purple | 305 |
| Pink | 330 |
| White (special) | 180 |

### White Variants

White is handled as a special case with negative hue values:

| Variant | Value |
|---|---|
| Cool White | -1 |
| Neutral White | -2 |
| Warm White | -3 |

### Preset Color Values

The following preset hue values are available for quick selection:

```
PRESET_RED       = 0
PRESET_ORANGE    = 30
PRESET_YELLOW    = 60
PRESET_GREEN     = 115
PRESET_CYAN      = 180
PRESET_BLUE      = 235
PRESET_VIOLET    = 270
PRESET_PURPLE    = 305
PRESET_PINK      = 330
PRESET_WHITE_C   = -1
PRESET_WHITE_N   = -2
PRESET_WHITE_W   = -3
```

## Lighting Effects

| Effect | Value | Description |
|---|---|---|
| OFF | `0x00` | No effect active |
| COLOR_CYCLE | `0x01` | Smooth cycle through full spectrum |
| SUNRISE | `0x02` | Warm orange/yellow gradual ramp |
| SUNSET | `0x03` | Red/purple gradual fade |
| SUNNY_CLOUDS | `0x04` | Warm white with gentle fluctuations |
| THUNDERSTORM | `0x05` | Dark blue with bright white flashes |
| WATER_REFLECTIONS | `0x06` | Shifting blue/cyan patterns |
| WARM_ENERGY | `0x07` | Red/orange pulsing |
| COOL_CALM | `0x08` | Blue/green slow transitions |

## Effect Speeds

| Speed | Duration per step |
|---|---|
| SLOW | 3000 ms |
| MEDIUM | 2250 ms |
| FAST | 1500 ms |
| OFF (instant) | 0 ms |

## Intensity

Brightness is specified as a percentage from **0 to 100**, where 0 is off and 100 is full brightness.

## Communication

### SET_DEV_PARAM Payload Structure

```
DTV+ header | Device 0x03 | Command SET_DEV_PARAM |
  Byte 0: Operation state (0x00-0x04)
  Byte 1: Color hue high byte
  Byte 2: Color hue low byte
  Byte 3: Intensity (0-100)
  Byte 4: Ramp speed (transition to new color)
  Byte 5: Effect speed (0=instant, 1=slow, 2=medium, 3=fast)
  Byte 6: Effect ID (0x00-0x08)
  CRC
```

### GET_DEV_STATUS

Request the current state of the rain panel:

```
DTV+ header | Device 0x03 | Command GET_DEV_STATUS | CRC
```

Response includes current operation state, active color, intensity, and active effect.

## Status Enum

| Code | Name | Description |
|---|---|---|
| 0 | NOT_INSTALLED | No rain panel detected |
| 1 | OFF | Panel present, lights off |
| 2 | ON | Lights active |
| 3 | ERROR | Communication or hardware fault |

## Examples

### Turn On Red at 75% Brightness

```
DTV+ header | Device 0x03 | SET_DEV_PARAM |
  0x01          <- FIXED_COLOR mode
  0x00, 0x00    <- Hue = 0 (Red)
  0x4B          <- Intensity = 75
  0x02          <- Ramp speed (medium transition)
  0x00          <- Effect speed (not applicable)
  0x00          <- Effect ID (none)
  CRC
```

### Start Color Cycle Effect

```
DTV+ header | Device 0x03 | SET_DEV_PARAM |
  0x02          <- EFFECTS mode
  0x00, 0x00    <- Hue (ignored for effects)
  0x64          <- Intensity = 100
  0x00          <- Ramp speed (not applicable)
  0x02          <- Effect speed = MEDIUM
  0x01          <- Effect = COLOR_CYCLE
  CRC
```

## CGI Interface

### Endpoint

```
GET /rain_on.cgi?mode=<mode>&color=<color>&effect=<effect>
```

### CGI Color Values

| Color | CGI Value |
|---|---|
| Red | 0 |
| Orange | 1 |
| Yellow | 2 |
| Green | 3 |
| Blue | 4 |
| Violet | 5 |
| Purple | 6 |
| Pink | 7 |
| Cool White | 8 |
| Neutral White | 9 |
| Warm White | 10 |

### CGI Effect Values

| Effect | CGI Value |
|---|---|
| Color Cycle | 1 |
| Sunrise | 2 |
| Sunset | 3 |
| Sunny Clouds | 4 |
| Thunderstorm | 5 |
| Water Reflections | 6 |
| Warm Energy | 7 |
| Cool Calm | 8 |

### CGI Mode Values

| Mode | CGI Value |
|---|---|
| Fixed Color | 1 |
| Effect | 2 |
| Choreography | 3 |
| Music Match | 4 |
