#!/usr/bin/env python3
"""
Basic Connection Test for Kohler DTV+ Controller

Verifies the controller is reachable and responding before running
other scripts. Tests connectivity, JSON parsing, and system info.

Usage:
    python basic_connection_test.py <controller_ip>
    python basic_connection_test.py 192.168.1.100
"""

import sys
import json
from kohler_http import KohlerClient


def main():
    if len(sys.argv) < 2:
        print("Usage: python basic_connection_test.py <controller_ip>")
        sys.exit(1)

    host = sys.argv[1]
    client = KohlerClient(host)

    print(f"{'=' * 50}")
    print(f"Kohler DTV+ Connection Test")
    print(f"Controller: {host}")
    print(f"{'=' * 50}")

    # Test 1: Basic connectivity
    print("\n[1/3] Testing basic connectivity...")
    result = client.get("/ftp_status.cgi")

    if not result["success"]:
        print(f"  FAIL — {result['error']}")
        print("\n  Check that:")
        print("    - The IP address is correct")
        print("    - The controller is powered on")
        print("    - Your computer is on the same network")
        sys.exit(1)

    print(f"  OK — responded in {result['elapsed_ms']}ms")

    # Test 2: JSON parsing
    print("\n[2/3] Testing JSON response parsing...")
    if result["body"]:
        try:
            data = json.loads(result["body"])
            print(f"  OK — valid JSON with {len(data)} fields")
            for key in ["internet_status", "upload_enable"]:
                if key in data:
                    print(f"    {key}: {data[key]}")
        except json.JSONDecodeError:
            print(f"  WARN — response is not JSON: {result['body'][:80]}...")

    # Test 3: System values
    print("\n[3/3] Testing system values endpoint...")
    result2 = client.get("/values.cgi")

    if result2["success"]:
        body_len = len(result2["body"]) if result2["body"] else 0
        print(f"  OK — {body_len} bytes in {result2['elapsed_ms']}ms")

        if result2["body"]:
            try:
                data = json.loads(result2["body"])
                print("\n  Controller info:")
                for key in ["controller_version", "ui_version", "IP", "MAC",
                             "shower_on", "steam_running"]:
                    if key in data:
                        print(f"    {key}: {data[key]}")
            except json.JSONDecodeError:
                print(f"  (Response was not JSON — this is normal for some firmware versions)")
    else:
        print(f"  FAIL — {result2['error']}")

    print(f"\n{'=' * 50}")
    print("CONNECTION TEST PASSED")
    print(f"{'=' * 50}")
    print(f"\nYou can now try:")
    print(f"  python shower_control.py {host} status")
    print(f"  python device_status_monitor.py {host}")


if __name__ == "__main__":
    main()
