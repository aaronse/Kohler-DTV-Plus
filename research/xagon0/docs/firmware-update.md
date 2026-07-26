# Firmware Update Process

## Update Trigger

Firmware updates can be initiated in two ways:

1. **Manual trigger:** Calling `/check_updates.cgi` sets `BYTE_G[34]` to `true`, which initiates the update check immediately.
2. **Scheduled check:** The controller computes a daily update time based on its serial number (see below).

## Schedule Calculation

The controller derives its daily update time from the serial number to distribute update checks across the fleet and avoid overwhelming the FTP server:

```
minutes_after_midnight = (first_4_digits_of_serial % 144) * 10
```

- `first_4_digits_of_serial` is read from `WORD_S[32]`
- The modulo 144 produces values 0-143
- Multiplied by 10 gives 0-1430 minutes (spanning nearly 24 hours)
- This creates 144 possible time slots, each 10 minutes apart

For example, a serial number starting with `2847` would check at `(2847 % 144) * 10 = 126 * 10 = 1260` minutes after midnight (9:00 PM).

## Update Process

Once triggered, the controller performs these steps in order:

1. **Verify no active writes:** Confirm no firmware images are currently being written or downloaded
2. **Verify internet connectivity:**
   - Resolve `*.kohler.com` via DNS
   - Ping the resolved address to confirm reachability
3. **Connect to FTP server:**
   - Username: `ftpuser`
   - Navigate to the update folder (see below)
4. **Download version manifest:** Retrieve and parse `versions.txt` from the update folder
5. **Store latest versions:**
   - Controller version stored in `STRING_S[27]`
   - UI version stored in `STRING_S[29]`
6. **Compare versions:** Check if the server versions are newer than the installed versions
7. **Download if newer:** Fetch the updated firmware files from the FTP server
8. **Trigger image swap:** Fire the image swap event to install the new firmware on next boot

## Update Folder

| Mode | Folder | Source |
|------|--------|--------|
| Standard (consumer) | `00` | Default folder on FTP server |
| Hospitality (hotel) | Custom folder name | Configured in `STRING_S[39]` |

Hospitality mode allows hotel installations to use a separate update channel with firmware tailored for commercial deployments.

## Checking FTP/Update Status

The endpoint `/ftp_status.cgi` returns a JSON response with the current update state:

| Field | Description |
|-------|-------------|
| `internet_status` | Whether the controller can reach the internet |
| `upload_enable` | Whether firmware upload is currently permitted |

This is useful for verifying connectivity before triggering a manual update, or for monitoring the progress of an in-flight update.
