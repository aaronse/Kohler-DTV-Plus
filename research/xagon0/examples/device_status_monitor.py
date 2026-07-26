#!/usr/bin/env python3
"""
Device Status Monitor for Kohler DTV+

Continuously polls the controller and displays device status,
simulation state, and system health information.

Usage:
    python device_status_monitor.py <controller_ip> [interval_seconds]
    python device_status_monitor.py 192.168.1.100
    python device_status_monitor.py 192.168.1.100 5

Default polling interval is 3 seconds.
Press Ctrl+C to stop.
"""

import sys
import time
import json
from kohler_http import KohlerClient


def clear_screen():
    print("\033[2J\033[H", end="")


def format_sim_status(value):
    """Interpret simulation status values."""
    return {0: "Real device", 1: "Simulated (ON)", 2: "Sim available"}.get(value, f"Unknown ({value})")


def poll_and_display(client: KohlerClient):
    """Poll all status endpoints and display results."""
    clear_screen()
    print(f"Kohler DTV+ Status Monitor — {client.host}")
    print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # System values
    values = client.get_json("/values.cgi")
    if values:
        print("\n--- System Values ---")
        for key in ["controller_version", "ui_version", "IP", "MAC",
                     "shower_on", "steam_running", "temperature",
                     "setpoint_temp", "active_outlets", "active_user"]:
            if key in values:
                print(f"  {key:25s}: {values[key]}")

        # Show any additional keys
        shown = {"controller_version", "ui_version", "IP", "MAC",
                 "shower_on", "steam_running", "temperature",
                 "setpoint_temp", "active_outlets", "active_user"}
        other_keys = sorted(set(values.keys()) - shown)
        if other_keys:
            print(f"\n  ({len(other_keys)} additional fields available)")

    # Simulation status
    sim = client.get_json("/sim_dev_values.cgi")
    if sim:
        print("\n--- Device & Simulation Status ---")

        # Real device detection
        print("  Real Devices:")
        for key in ["real_valve_attached", "real_valve_prompt3_attached",
                     "real_valve_prompt2_attached", "Valve_1_attached", "Valve_2_attached"]:
            if key in sim:
                attached = "Yes" if sim[key] else "No"
                print(f"    {key:35s}: {attached}")

        # Simulated peripherals
        print("\n  Peripherals:")
        for key in ["steam_status", "rain_status", "light_status", "amp_status"]:
            if key in sim:
                print(f"    {key:35s}: {format_sim_status(sim[key])}")

        # Simulated valves
        print("\n  Simulated Valves:")
        for key in ["v1_status", "v2_status", "v1_P3status", "v2_P3status",
                     "v1_P2status", "v2_P2status"]:
            if key in sim:
                state = "Enabled" if sim[key] else "Disabled"
                print(f"    {key:35s}: {state}")

        # Warnings
        warnings = []
        for key in ["steamWarning", "rainPanelWarning", "lightBridgeWarning", "ampWarning"]:
            if sim.get(key):
                warnings.append(key.replace("Warning", ""))
        if warnings:
            print(f"\n  WARNINGS: {', '.join(warnings)} — port conflict detected!")

    # FTP / update status
    ftp = client.get_json("/ftp_status.cgi")
    if ftp:
        print("\n--- Update Status ---")
        for key, value in sorted(ftp.items()):
            print(f"  {key:25s}: {value}")

    print("\n" + "=" * 60)
    print("Press Ctrl+C to stop")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    host = sys.argv[1]
    interval = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
    client = KohlerClient(host)

    print(f"Connecting to {host}...")
    test = client.get("/ftp_status.cgi")
    if not test["success"]:
        print(f"Cannot reach controller: {test['error']}")
        sys.exit(1)

    print(f"Connected. Polling every {interval}s...")
    time.sleep(1)

    try:
        while True:
            try:
                poll_and_display(client)
            except Exception as e:
                print(f"\nPoll error: {e}")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
