# Firmware File Reference

> **CRITICAL:** The bootloader searches for firmware files by specific filename patterns. If the filename does not match the expected pattern, the bootloader will not find it and the unit will fall back to TFS recovery mode (or brick if TFS is also unavailable).

## Filename Patterns

### Standard (Non-ECO) Units

| File | Pattern | Purpose |
|------|---------|---------|
| Controller app | `dtvplus2_app_v*.*.*.*.S19` | Main controller firmware |
| Amulet touchscreen UI | `ui_amulet_v*.*.*.*.S19` | Amulet-based touchscreen interface |
| Linux touchscreen UI | `dtvplus2_uiapp_v*.*.*.*.pack.tar` | Linux-based touchscreen interface |

### ECO Variant Units

| File | Pattern | Purpose |
|------|---------|---------|
| Controller app | `eco_dtvplus2_app_v*.*.*.*.S19` | ECO controller firmware |
| Amulet touchscreen UI | `eco_ui_amulet_v*.*.*.*.S19` | ECO Amulet touchscreen interface |

## S-Record Format

The `.S19` firmware files use Motorola S-Record format with the following structure:

### Record Types

| Record | Purpose |
|--------|---------|
| **S0** | Header record -- contains CRC32 checksum and total file length |
| **S3** | Data record -- 32-bit address + payload data |
| **S7** | Start address record -- entry point for execution |

### Bootloader Validation

The bootloader performs three levels of validation before accepting a firmware file:

1. **Per-line checksums:** Each S-record line has a trailing checksum byte (one's complement of the byte sum)
2. **CRC32 of entire file:** Stored in the S0 header record, verified against the computed CRC32 of all data
3. **Memory address range:** All S3 data addresses must be `>= 0x40500000` (RAM region)

If any validation step fails, the bootloader rejects the file and signals an error via the LED (slow blink for CRC failure).

## Known Good File Sizes

These sizes are from verified working firmware files and can be used as a sanity check:

| Filename | Lines | Approximate Size |
|----------|-------|-----------------|
| `dtvplus2_app_v0.0.3.89.S19` | 9,214 lines | ~4.7 MB |
| `ui_amulet_v0.1.3.72.S19` | 47,769 lines | ~13 MB |
| `dtvplus2_uiapp_v0.0.7.44.pack.tar` | N/A (binary) | ~6.1 MB |

> **Warning:** Truncated or partial files WILL fail CRC validation. A failed CRC during boot results in `error_led_CRC()` (slow blink) and the unit will not boot normally. Always verify file integrity before uploading.

## Upload Procedure

### Method 1: Web UI (Recommended)

1. Navigate to `http://<controller-ip>/` in a web browser
2. Use the firmware upload page
3. Select the firmware file and upload

### Method 2: cURL

```
curl -F "file=@/path/to/firmware.S19" http://<controller-ip>/fileupload.cgi
```

### Upload Order

Firmware files must be uploaded in this specific order:

1. **Controller application** (`dtvplus2_app_v*.S19`) -- always first
2. **UI firmware** (`ui_amulet_v*.S19`) -- after controller app
3. **Linux UI pack** (`dtvplus2_uiapp_v*.pack.tar`) -- last, only if using Linux touchscreen

Power cycle the controller after all uploads are complete.

## Known Firmware Versions

| Component | Version | Notes |
|-----------|---------|-------|
| Controller app | v0.0.3.56 | Marriott reference build |
| Controller app | v0.0.3.89 | Common production version |
| Controller app | v0.0.3.90 | Patched release |
| Controller firmware | v4.05 | Internal firmware revision |
| Datatable version | 65 | Data structure version |
| Default UI version | 0.1/3.71 | Amulet touchscreen UI |
