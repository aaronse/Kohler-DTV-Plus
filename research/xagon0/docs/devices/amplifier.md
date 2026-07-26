# Bluetooth Audio Amplifier

## Overview

The amplifier module provides Bluetooth audio streaming with volume, tone, and balance control. It supports two control methods: dedicated CGI endpoints and direct datatable manipulation with RPC invocation.

## Device Configuration

| Parameter | Value |
|---|---|
| Device ID | `0x40` (alternate: `0x07`) |
| Protocol | DTV+ |
| Tick interval | 350 ms |

**IMPORTANT:** During device discovery, you **MUST** check both `0x40` and `0x07` as the device ID. Some amplifier hardware revisions report one ID, some the other. Failing to check both will result in the amplifier not being found on certain installations.

## Operating States

| State | Value | Description |
|---|---|---|
| OFF | 0 | Amplifier idle |
| PLAY | 1 | Audio playing |
| PAUSE | 2 | Playback paused |
| ERROR | 3 | Hardware or communication fault |
| NOT_INSTALLED | 15 | No amplifier detected |

## Audio Parameters

| Parameter | Range | Description |
|---|---|---|
| Volume | 0-100 | Master volume level |
| Treble | 0-100 | High frequency adjustment |
| Bass | 0-100 | Low frequency adjustment |
| Balance | -50 to +50 | Left/right balance (0 = center) |

## CGI Variable IDs

| Variable Name | CGI Index | Description |
|---|---|---|
| music_volume | 43 | Volume level |
| music_treble | 44 | Treble level |
| music_bass | 45 | Bass level |
| music_balance | 46 | Left/right balance |
| music_BT_device | 47 | Paired Bluetooth device name |
| music_BT_key | 48 | Bluetooth pairing key |
| music_BT_password | 49 | Bluetooth pairing PIN |

## Control Method 1: Dedicated CGI Endpoints

### Turn On / Play

```
GET /music_on.cgi?volume=75
```

### Turn Off

```
GET /music_off.cgi
```

### Adjust Volume / Treble / Bass / Balance

```
GET /save_variable.cgi?index=43&value=80    (volume = 80)
GET /save_variable.cgi?index=44&value=60    (treble = 60)
GET /save_variable.cgi?index=45&value=70    (bass = 70)
GET /save_variable.cgi?index=46&value=25    (balance = +25, right)
```

## Control Method 2: Direct Datatable + RPC

This method writes directly to the datatable byte page and triggers an RPC to push the changes to hardware.

### Step 1: Write to Byte Page 20

```
GET /edit_dt.cgi?page=byte&index=<variable_index>&page_index=20&value=<value>
```

### Step 2: Trigger RPC

```
GET /rpc?index=16
```

The RPC at index 16 signals the amplifier task to read the updated datatable values and apply them.

### Datatable Page 20 Control Variables

| Variable | Index | Range | Description |
|---|---|---|---|
| AudioVolume | 0 | 0-100 | Absolute volume |
| AudioRelativeVolume | 1 | 0-100 | Relative volume adjustment |
| AudioSource | 2 | -- | Input source selector |
| AudioTrackSkip | 3 | -- | Skip forward/backward |
| AudioOperationMode | 4 | -- | Play/pause/stop |
| AudioMute | 5 | 0/1 | Mute toggle |
| AudioBalance | 6 | 0-200 | Balance (100 = center) |
| AudioTreble | 7 | 0-200 | Treble (100 = flat) |
| AudioBass | 8 | 0-200 | Bass (100 = flat) |
| AudioShuffle | 9 | 0/1 | Shuffle mode toggle |

Note that the datatable uses **0-200 range** with 100 as center/flat for balance, treble, and bass. This differs from the CGI interface which uses 0-100 for treble/bass and -50 to +50 for balance.

### Status Variables (Stationary Page)

| Variable | Index | Description |
|---|---|---|
| AmplifierStatus | 105 | Current operating state |
| AmplifierAudioSource | 106 | Active audio source |

### String Variables (Stationary Page)

| Variable | Index | Description |
|---|---|---|
| SONG_TITLE_1 | 13 | Current track title |
| ARTIST_NAME_1 | 16 | Current track artist |
| BT_PAIR_NAME | 19 | Name of paired Bluetooth device |

## Web API Examples

### Play

**Method 1 (CGI):**
```
GET /music_on.cgi?volume=75
```

**Method 2 (Datatable + RPC):**
```
GET /edit_dt.cgi?page=byte&index=4&page_index=20&value=1
GET /rpc?index=16
```

### Pause

**Method 1 (CGI):**
```
GET /music_off.cgi
```

**Method 2 (Datatable + RPC):**
```
GET /edit_dt.cgi?page=byte&index=4&page_index=20&value=2
GET /rpc?index=16
```

### Next Track

```
GET /edit_dt.cgi?page=byte&index=3&page_index=20&value=1
GET /rpc?index=16
```

### Previous Track

```
GET /edit_dt.cgi?page=byte&index=3&page_index=20&value=2
GET /rpc?index=16
```

### Set Volume to 60

**Method 1 (CGI):**
```
GET /save_variable.cgi?index=43&value=60
```

**Method 2 (Datatable + RPC):**
```
GET /edit_dt.cgi?page=byte&index=0&page_index=20&value=60
GET /rpc?index=16
```

### Mute

```
GET /edit_dt.cgi?page=byte&index=5&page_index=20&value=1
GET /rpc?index=16
```

### Set Balance (Pan Right)

**Method 1 (CGI):**
```
GET /save_variable.cgi?index=46&value=25
```

**Method 2 (Datatable + RPC):**
```
GET /edit_dt.cgi?page=byte&index=6&page_index=20&value=150
GET /rpc?index=16
```

(CGI value 25 maps to datatable value 150, since datatable center is 100.)

## Bluetooth Pairing

### Set Pairing Key

```
GET /save_variable.cgi?index=48&value=<BTKey>
```

### Set Pairing PIN

```
GET /save_variable.cgi?index=49&value=<BTPin>
```

### Disconnect Current Device

```
GET /bt_disconnect.cgi
```

The pairing process:
1. Set the BT key and PIN via CGI.
2. The amplifier enters pairing mode and is discoverable.
3. The user pairs from their phone/tablet.
4. On successful pairing, `BT_PAIR_NAME` (string index 19) is populated with the device name.

## Simulated Amplifier Mode

For installations without physical amplifier hardware, the controller can run a **simulated amplifier** that mirrors control commands to status variables and populates dummy metadata.

### Enable Simulated Mode

```
GET /set_device.cgi?value=00000000001
```

### Behavior in Simulated Mode

- All control writes (volume, play, pause, etc.) are automatically mirrored to the corresponding status variables.
- Dummy track metadata is populated (song title, artist name).
- No RS485 polling occurs -- the controller does not attempt to communicate with a physical device.
- Status always reports as healthy (no communication errors).

### External Amplifier Integration

Simulated mode is intended for integrating an external (non-Kohler) amplifier. The architecture:

```
+------------------+       +-----------------+
|  DTV+ Controller |       | External Amp    |
|                  |       | (Sonos, etc.)   |
|  Simulated Amp   |       |                 |
|  Mode Enabled    |       |                 |
+--------+---------+       +--------+--------+
         |                          |
         |  Control API             |  Audio Output
         |  (CGI/Datatable)         |  (speakers)
         |                          |
+--------+---------+       +--------+--------+
|  Home Automation |-------| Home Automation |
|  Controller      |       | Audio Bridge    |
+------------------+       +-----------------+
```

The home automation system reads control state from the DTV+ controller's API and translates those commands into the external amplifier's native protocol.

## Error Handling

### DETACH_EVENT

When the amplifier becomes unreachable (disconnected, powered off, or communication failure), the system generates a **DETACH_EVENT** with error code **100** and device type set to the amplifier identifier.

This event triggers the controller to:
1. Mark the amplifier as NOT_INSTALLED.
2. Stop polling the RS485 bus for amplifier responses.
3. Notify the touchscreen UI to update the amplifier status display.

The amplifier is rediscovered on the next full device discovery cycle.
