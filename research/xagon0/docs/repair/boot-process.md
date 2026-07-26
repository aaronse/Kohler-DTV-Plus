# Boot Process

## Bootloader Flow

```
Power On
   |
   v
MCU Internal Flash Bootloader
   |
   v
Initialize NAND
   |-- Send RESET command to NAND
   |-- Read Chip ID
   |
   v
Chip ID Match? ----NO----> Hang (infinite loop)
   |                        Must replace with correct chip
  YES
   |
   v
Mount HCC SafeFAT Filesystem
   |
   v
FS_VOL_NOTFORMATTED? --YES--> Format filesystem, then continue
   |
   NO
   |
   v
Search for a:/images/dtvplus2_app_v*.*.*.*.S19
   |
   v
Found? ----NO----> Fall back to TFS
   |                (recovery mode)
  YES
   |
   v
Validate S-Record
   |-- Check per-line checksums
   |-- Verify CRC32 (from S0 header)
   |
   v
CRC Valid? ----NO----> error_led_CRC()
   |                    (slow blink pattern)
  YES
   |
   v
Load S-Record to RAM (address >= 0x40500000)
   |
   v
Jump to Application
```

## TFS Fallback Mode

TFS (Trivial File System) is a **read-only** filesystem compiled directly into the bootloader binary. It serves as the last-resort recovery mechanism.

**Contents:**

| File | Purpose |
|------|---------|
| `/default.S19` | Standard DTV+ recovery application |
| `/eco_ui_default.S19` | ECO variant recovery application |

When the bootloader cannot find a valid firmware image on the NAND filesystem, it falls back to TFS and boots the built-in recovery application. This recovery application provides a minimal web interface that allows you to upload new firmware over the network.

**This is why NAND recovery works:** even with a completely blank NAND chip, the bootloader can still boot into a functional state via TFS, giving you a way to upload firmware.

## LED Error Patterns

The bootloader communicates errors through the status LED on the controller board:

| Pattern | Meaning | Cause |
|---------|---------|-------|
| Double blink | General error | Various startup failures |
| Slow blink | CRC error | Firmware file failed CRC32 validation (`error_led_CRC()`) |
| Very slow blink | NAND error | NAND chip communication failure or bad blocks in critical area |

## NAND Chip ID Mismatch

If the bootloader reads a chip ID that does not match the expected values (`0x2CCA` for 16-bit or `0x2CDA` for 8-bit), it enters an **infinite loop hang**. The controller will not boot and will not respond on the network.

This is a hard-coded check with no bypass. The only solution is to replace the NAND chip with the correct part number. See [NAND Flash Recovery](nand-flash-recovery.md) for the chip replacement procedure.
