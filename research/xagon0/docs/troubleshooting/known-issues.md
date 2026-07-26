# Known Issues and Common Error Patterns

Documented failure modes, root causes, and workarounds for the Kohler DTV+ system.

---

## 1. Flash Filesystem Degradation (~1 Week Uptime)

**Symptoms:** `FFS_FATAL_ERRORS` (error code 103), triple-blink LED pattern on the controller, settings fail to save, web interface returns errors on configuration changes.

**Root Cause:** The on-board flash filesystem accumulates fragmentation and metadata corruption during normal operation. Write-heavy operations (logging, frequent setting changes) accelerate degradation.

**Timeline:** Typically manifests after approximately 1 week of continuous operation, though it may appear sooner under heavy use.

**Workaround:** Schedule a weekly reboot of the DTV+ controller. Power cycle the unit or use the web interface reboot command. A reboot reinitializes the filesystem and reclaims corrupted blocks.

---

## 2. Network Stack Death (~2 Months Uptime)

**Symptoms:** `NETWORK_TASK_ABORT` (error code 146), `ETHERNET_LINK_DROP` (105). The web interface becomes unreachable, but the shower continues to function normally via the touchscreen UI.

**Root Cause:** The RTCS TCP/IP stack used by the controller has a memory leak. Over time, network buffer allocations are not fully released, eventually exhausting available memory for the network task. When the task cannot allocate memory, it aborts.

**Timeline:** Typically occurs after approximately 2 months of continuous operation.

**Workaround:** Schedule a monthly reboot. Since this issue and the flash degradation issue (above) both benefit from reboots, a weekly reboot schedule addresses both problems. The shower operates normally without network access, so this issue only affects remote/web control.

---

## 3. Motor Stuck in Hard Water Areas

**Symptoms:** `M_STUCK` (error code 60), progressing to `M_REALLY_STUCK` (61) if unresolved. Water temperature fails to regulate. Valve may output only hot or only cold water.

**Root Cause:** Mineral deposits (calcium, lime) accumulate on the mixing valve's motor shaft and internal surfaces. The motor cannot overcome the friction to adjust the hot/cold mixing ratio.

**Prevention:**
- Install a water softener upstream of the DTV+ system.
- Periodically exercise the valve through its full range by requesting extreme temperature setpoints (min then max) to break up early deposits.
- In severe hard water areas, schedule annual valve descaling by a plumber.

**Recovery:** `M_STUCK` (60) is often temporary and clears on retry. `M_REALLY_STUCK` (61) requires professional service -- the valve motor or entire valve may need replacement.

---

## 4. Valve Communication Instability with Long Cable Runs

**Symptoms:** `VALVE_x_INSTABLE` (error codes 201-204). Intermittent valve responses, temperature control becomes erratic, occasional valve timeout errors.

**Root Cause:** The Saturn protocol runs at 9600 baud over RS-485. Long cable runs (especially over 50 feet), poor shielding, or missing termination resistors degrade signal integrity.

**Fix:**
- Use shielded twisted-pair cable for all valve connections.
- Install 120-ohm termination resistors at both ends of the RS-485 bus.
- Reduce cable length where possible.
- Route RS-485 cables away from AC power lines and motors.
- Verify all connections are tight and free of corrosion.

---

## 5. HTTP Session Limit (2 Concurrent Sessions)

**Symptoms:** Web interface hangs, requests time out, new browser tabs to the controller do not load. Existing sessions eventually recover after ~20 seconds.

**Root Cause:** The embedded web server supports a maximum of 2 concurrent HTTP connections. Opening additional connections (e.g., multiple browser tabs, concurrent API calls) exceeds this limit.

**Workaround:** Limit access to a single browser tab at a time. When making programmatic API calls, serialize requests and wait for each response before sending the next. Timed-out sessions release after approximately 20 seconds.

---

## 6. FlexBus Semaphore Timeout (750 ms)

**Symptoms:** Operations on external UART devices fail or return errors. May manifest as intermittent communication failures with devices connected via the FlexBus interface.

**Root Cause:** The FlexBus external UART is protected by a semaphore with a 750 ms timeout. If any operation holds the semaphore longer than 750 ms (due to a slow device, bus contention, or firmware bug), subsequent operations fail until the semaphore is released.

**Workaround:** Ensure all FlexBus operations complete well within 750 ms. If using custom integrations, keep message payloads small and avoid back-to-back large transfers.

---

## 7. Two Different Communication Protocols

**Impact:** Development and debugging complexity.

**Details:** The system uses two distinct serial protocols on the same physical bus:
- **Saturn protocol** (9600 baud) for mixing valves -- binary framed, master-slave polling.
- **DTV+ protocol** (9600 baud) for all other devices (UI, steam, rain panel, LightBridge, amplifier) -- different frame format and command set.

Sending a DTV+ command to a valve (or vice versa) produces no response or garbage data. When implementing custom tooling, always verify which protocol a device expects.

---

## 8. Master Address Varies by Valve Type

**Impact:** Address configuration errors during setup.

**Details:** The controller uses different master addresses depending on the valve type:
- Standard valves: master address `0x00`
- Certain valve variants: master address `0x10`

Using the wrong master address causes the valve to ignore all commands. If a valve is unresponsive after installation, verify the master address matches the valve type.

---

## 9. Amplifier Dual Device IDs

**Impact:** Device discovery confusion.

**Details:** The amplifier module responds to two different device type IDs: `0x40` and `0x07`. Both refer to the same physical device. The controller must handle both IDs when identifying amplifiers on the bus. A detach event (error 100) may report either ID for the same amplifier.

---

## 10. 30-Minute Prompt3 Auto-Shutoff

**Symptoms:** Shower turns off unexpectedly after 30 minutes of operation.

**Root Cause:** The Prompt3 safety timer automatically shuts off the shower after `PROMPT3_TIMEOUT_MAX` (1800 seconds / 30 minutes) if the timer is not periodically reset. This is a safety feature to prevent indefinite water flow if the user forgets to turn off the shower.

**Details:** The timer can be reset by user interaction on the touchscreen (adjusting temperature, pressing buttons) or programmatically. The reset limit is 900 seconds -- the timer can only be extended if at least 15 minutes have elapsed. For custom integrations that run long sessions, ensure the timer reset is called before the 30-minute window expires.

---

## 11. Steam Fx2 vs Valve Cx2 Temperature Format Mismatch

**Symptoms:** Steam generator runs at the wrong temperature (too hot or too cold).

**Root Cause:** Steam temperatures use Fx2 (Fahrenheit x 2) encoding, while valve temperatures use Cx2 (Celsius x 2). If a Cx2 value is accidentally sent to the steam generator as-is, or an Fx2 value is sent to a valve, the resulting temperature will be incorrect.

**Example:** A target of 40 C (Cx2 = 80) sent directly to the steam generator would be interpreted as Fx2 = 80, which is 40 F / 4.4 C -- far too cold. Conversely, Fx2 = 208 (104 F) sent to a valve as Cx2 would be interpreted as 104 C -- an impossible and dangerous setpoint.

**Prevention:** Always convert between Cx2 and Fx2 when crossing the valve/steam boundary. See [temperature-system.md](../control-logic/temperature-system.md) for conversion functions.

---

## 12. CGI Variable IDs Defined in Two Places

**Impact:** Configuration drift, incorrect behavior after firmware or UI updates.

**Details:** The CGI variable ID numbers (used by `save_variable.cgi`, `values.cgi`, etc.) are defined independently in both the controller's C firmware and the touchscreen UI's JavaScript code. These two definitions must stay exactly in sync. If one is updated without the other, the UI may read or write the wrong variable, causing unpredictable behavior.

**Mitigation:** After any firmware or UI update, verify that both variable ID tables match. Test critical variables (temperature setpoints, outlet configuration) after updates.

---

## 13. Bootloader Mode Requires Password

**Impact:** Field service and firmware updates.

**Details:** Entering the controller's bootloader mode (for firmware flashing) requires a password. Without the correct password, the bootloader rejects the entry request and the controller boots normally. This prevents unauthorized firmware modification but can complicate field service if the password is unknown.

---

## 14. Default Lock Codes

**Details:** The system ships with the following default lock codes:

| Lock Type      | Default Code | Purpose                              |
|----------------|--------------|--------------------------------------|
| Settings lock  | `1020`       | Prevents unauthorized setting changes |
| Webpage lock   | `0922`       | Restricts web interface access        |

These codes may be changed by the installer during commissioning. If the codes have been changed and are unknown, a factory reset is required to restore defaults. Document any code changes during installation.
