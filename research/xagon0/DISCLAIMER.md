# Disclaimer

## Safety Warning

The Kohler DTV+ is a system that controls water temperature and flow. Improper modification can result in:

- **Scalding** from incorrect temperature limits or calibration
- **Water damage** from stuck valves or relay failures
- **Electrical hazard** from improper wiring of RS485, steam, or lighting circuits
- **Bricked hardware** from incorrect firmware uploads or CGI calls

## Responsibility

This documentation is provided for **educational, repair, and home automation purposes**. All information was obtained through independent reverse engineering of commercially available hardware.

- This project is **not affiliated with, endorsed by, or supported by Kohler Co.**
- Modifying your DTV+ controller may **void your warranty**
- You assume **all responsibility** for any issues arising from use of this information
- Some CGI endpoints can **freeze or brick your controller** — always note the safety ratings
- **Never** modify temperature limits without verifying actual water temperature with a reliable thermometer

## CGI Safety Ratings

Throughout this documentation, CGI endpoints are rated on a 0-5 safety scale:

| Rating | Meaning |
|--------|---------|
| 0/5 | Safe — read-only or no side effects |
| 1/5 | Low risk — minor settings changes |
| 2/5 | Moderate — changes device behavior |
| 3/5 | Caution — may cause lockups, requires reboot |
| 4/5 | Dangerous — can cause persistent issues |
| 5/5 | Critical — can brick the controller |

## Before You Begin

1. **Note your controller's IP address** — you'll need it for recovery
2. **Record your firmware versions** via `system_info.cgi` before making changes
3. **Never upload partial or truncated firmware files** — they will fail CRC and brick the unit
4. **Limit concurrent HTTP connections to 2** — the controller cannot handle more
5. **Test changes one at a time** — if something goes wrong, you'll know what caused it
