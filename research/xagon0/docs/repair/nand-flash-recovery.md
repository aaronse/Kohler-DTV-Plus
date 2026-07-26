# NAND Flash Recovery Procedure

## NAND Chip Identification

The DTV+ controller uses a Micron NAND flash chip:

| Variant | Part Number | Bus Width | Chip ID |
|---------|------------|-----------|---------|
| 16-bit  | MT29F2G16AABWP | 16-bit | `0x2CCA` |
| 8-bit   | MT29F2G08 | 8-bit | `0x2CDA` |

**Specifications:**

- Capacity: 256MB (2Gb)
- Page size: 2048 bytes + 64 bytes OOB (spare area)
- Block size: 128KB (64 pages per block)
- Total blocks: 2048

## Block Layout

| Block Range | Byte Offset | Purpose |
|-------------|-------------|---------|
| 0 - 499     | 0 - 67,583,999 | Reserved (bootloader, configuration) |
| 500 - 2047  | 67,584,000 - end | HCC SafeFAT filesystem |

The filesystem region (blocks 500-2047) is where firmware images and user data reside. The reserved region should never be modified unless you know exactly what you are doing.

## Requirements

- **NAND programmer:** T48, TL866II+, or similar programmer with NAND support
- **Hot air rework station:** capable of 320-340 degrees Celsius
- **Flux:** no-clean liquid flux recommended
- **Patience:** this is delicate work

## Step 1: Extract the NAND Chip

1. Preheat the PCB to 100-150 degrees Celsius to reduce thermal shock
2. Apply flux generously around all pins of the NAND chip
3. Apply hot air at 320-340 degrees Celsius, moving in a circular pattern
4. Wait until solder melts on all sides (you will see it flow)
5. Lift the chip **straight up** -- do not tilt or pry, as this can tear pads

> **Warning:** The PCB pads can only handle approximately 3-5 rework cycles before trace damage becomes likely. Work carefully.

## Step 2: Create a Recovery Image

You need a clean image that the bootloader can format on first boot.

**Option A -- Erase filesystem blocks only:**

Erase blocks 500 through 2047 (byte offset 67,584,000 to end of chip). Set all bytes in this region to `0xFF`. Leave blocks 0-499 intact with their original data.

**Option B -- Use a known-good erased image:**

If you have a full chip dump from a working unit, use that as your base image. Ensure the filesystem region is clean (all `0xFF`) so the bootloader will reformat it on first boot.

## Step 3: Flash the Recovery Image

1. Place the NAND chip in the programmer socket (check orientation)
2. Erase the entire chip
3. Write the recovery image -- **include the spare/OOB area** in the write operation
4. Verify the write by reading back and comparing

## Step 4: Reinstall the NAND Chip

1. Clean the PCB pads with flux and solder wick
2. Align the chip carefully (pin 1 marker must match the board silkscreen)
3. Preheat the board to 100-150 degrees Celsius
4. Apply flux and reflow with hot air at 320-340 degrees Celsius
5. Allow to cool naturally
6. Inspect all pins under magnification -- look for bridges or cold joints

## Step 5: Boot and Upload Firmware

After reinstalling the chip with a clean filesystem:

1. **Power on** the controller -- it will enter TFS fallback boot (the read-only recovery filesystem compiled into the bootloader)
2. **Find the controller's IP address:**
   - Check your router's DHCP lease table
   - Or scan your network subnet (e.g., `nmap -sn 192.168.1.0/24`)
3. **Access the web UI** at `http://<controller-ip>/`
4. **Upload firmware in this order:**
   1. Controller application: `dtvplus2_app_v*.S19`
   2. Amulet touchscreen UI: `ui_amulet_v*.S19`
   3. Linux touchscreen UI (if applicable): `dtvplus2_uiapp_v*.pack.tar`
5. **Power cycle** the controller after all uploads complete

### Upload via cURL (Alternative)

```
curl -F "file=@/path/to/firmware.S19" http://<controller-ip>/fileupload.cgi
```

> **Note:** Large files may cause the HTTP request to timeout. The web UI is more reliable for firmware uploads as it handles chunked transfer and provides progress feedback.
