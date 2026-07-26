# LED Diagnostic Patterns

The DTV+ controller uses its onboard LED to signal error conditions through specific blink patterns. These patterns are visible on the controller board and can be observed without connecting to the web interface.

---

## Pattern Reference

### Double-Blink: General Error

```
|==ON==|      |==ON==|                          |==ON==|      |==ON==|
 200ms  200ms  200ms          1000ms              200ms  200ms  200ms
        off                    off                        off
```

**Pattern:** 200 ms on, 200 ms off, 200 ms on, 1000 ms off (repeating).

**Meaning:** A general system error has occurred. This is the most common error indication and covers a range of conditions including device communication failures, configuration errors, and runtime faults.

**What to Do:**
1. Connect to the web interface and check the error log at `/cerror_logs.cgi`.
2. Identify the specific error code from the log -- see [error-codes.md](error-codes.md) for the full reference.
3. If the error is resettable, clear it from the UI or power cycle the controller.
4. If the error persists after a power cycle, consult the [known issues](known-issues.md) page for common root causes.
5. For fatal errors (welded relay, persistent motor stuck, hardware faults), professional service is required. See the [repair section](../repair/) for guidance.

---

### Slow Blink: CRC Error

```
|=======ON=======|                              |=======ON=======|
      2000ms                  4000ms                  2000ms
                               off
```

**Pattern:** 2000 ms on, 4000 ms off (repeating).

**Meaning:** A firmware file failed CRC32 validation. The controller detected that a firmware image in flash storage is corrupted -- the checksum does not match the expected value.

**What to Do:**
1. The controller will not run corrupted firmware. It remains in this error state until valid firmware is loaded.
2. Re-flash the firmware using the bootloader. Connect to the controller via Ethernet and use the firmware update procedure.
3. If the CRC error occurs immediately after a firmware update, the update file may have been corrupted during transfer. Re-download the firmware file and retry.
4. If CRC errors recur after successful flashing, the flash memory hardware may be degrading. The controller board may need replacement.
5. See the [repair section](../repair/) for firmware flashing procedures.

---

### Very Slow Blink: NAND Error

```
|=======ON=======|                                                      |=======ON=======|
      2000ms                              8000ms                              2000ms
                                           off
```

**Pattern:** 2000 ms on, 8000 ms off (repeating).

**Meaning:** NAND flash memory error. This pattern is defined in the firmware but may not be encountered in production units, as it relates to a specific NAND failure mode that is rare in practice.

**What to Do:**
1. If observed, the flash storage hardware has failed.
2. Power cycle the controller to see if the error clears.
3. If the pattern persists after power cycling, the controller board requires replacement.
4. Contact Kohler technical support or a qualified service technician.
5. See the [repair section](../repair/) for hardware replacement guidance.

---

## Quick Reference

| Pattern            | Timing                                | Meaning        | Severity |
|--------------------|---------------------------------------|----------------|----------|
| Double-blink       | 200ms on, 200ms off, 200ms on, 1s off | General error  | Variable |
| Slow blink         | 2s on, 4s off                         | CRC error      | High     |
| Very slow blink    | 2s on, 8s off                         | NAND error     | Critical |
| Solid on (no blink)| Continuous                            | Normal / boot  | None     |

---

## Notes

- The LED patterns are only active when the controller detects an error condition. During normal operation, the LED behavior depends on the firmware version (it may be solid on, solid off, or show a heartbeat pattern).
- If the controller is completely unresponsive (no LED activity at all), verify that power is reaching the board.
- LED patterns take priority over normal LED behavior -- if an error condition exists, the error pattern will override any other LED state.
