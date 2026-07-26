#!/usr/bin/env python3
"""
Shower Control Script for Kohler DTV+

Demonstrates starting/stopping showers, controlling temperature,
toggling steam, lights, and rain panel via the CGI and RPC interfaces.

Usage:
    python shower_control.py <controller_ip> <command> [args]

Commands:
    status              Show current system status
    start <temp>        Start shower at temperature (Celsius), default 38
    stop                Stop shower
    user <1-6>          Start user preset
    steam_on <temp> <min>  Start steam (temp in F, duration in minutes)
    steam_off           Stop steam
    light_on <1-3> <0-100> Turn on light module at brightness
    light_off <1-3>     Turn off light module
    rain <color>        Turn on rain panel (red/blue/green/white/off)
    music_on <vol>      Turn on music at volume (0-100)
    music_off           Turn off music
    rpc <index>         Send raw RPC command

Examples:
    python shower_control.py 192.168.1.100 start 40
    python shower_control.py 192.168.1.100 user 1
    python shower_control.py 192.168.1.100 rain blue
    python shower_control.py 192.168.1.100 rpc 10
"""

import sys
from kohler_http import KohlerClient

# Rain panel color name → hue value mapping
RAIN_COLORS = {
    "red": 0, "orange": 30, "yellow": 60, "green": 115,
    "blue": 235, "violet": 270, "purple": 305, "pink": 330,
    "white": -1,
}


def show_status(client: KohlerClient):
    """Read and display current system status."""
    data = client.get_json("/values.cgi")
    if data:
        print("System Status:")
        for key, value in sorted(data.items()):
            print(f"  {key}: {value}")
    else:
        result = client.get("/ftp_status.cgi")
        if result["success"]:
            print(f"Controller is reachable. /values.cgi returned: {result.get('body', '(empty)')[:100]}")
        else:
            print(f"Controller not reachable: {result['error']}")


def start_shower(client: KohlerClient, temp: float = 38.0):
    """Start a quick shower on valve 1, outlet 1, at the given temperature."""
    result = client.get("/quick_shower.cgi", {
        "valve_num": "1",
        "valve1_outlet": "1",
        "valve1_massage": "0",
        "valve1_temp": str(temp),
        "valve2_outlet": "",
        "valve2_massage": "0",
        "valve2_temp": "38",
    })
    if result["success"]:
        print(f"Shower started at {temp}°C")
    else:
        print(f"Failed: {result['error']}")


def stop_shower(client: KohlerClient):
    result = client.get("/stop_shower.cgi")
    print("Shower stopped" if result["success"] else f"Failed: {result['error']}")


def start_user(client: KohlerClient, user_num: int):
    result = client.get("/start_user.cgi", {"user": str(user_num)})
    print(f"User {user_num} preset started" if result["success"] else f"Failed: {result['error']}")


def steam_on(client: KohlerClient, temp: float, minutes: int):
    result = client.get("/steam_on.cgi", {"temp": str(temp), "time": str(minutes)})
    print(f"Steam on at {temp}°F for {minutes} min" if result["success"] else f"Failed: {result['error']}")


def steam_off(client: KohlerClient):
    result = client.get("/steam_off.cgi")
    print("Steam off" if result["success"] else f"Failed: {result['error']}")


def light_on(client: KohlerClient, module: int, intensity: int):
    result = client.get("/light_on.cgi", {"module": str(module), "intensity": str(intensity)})
    print(f"Light {module} on at {intensity}%" if result["success"] else f"Failed: {result['error']}")


def light_off(client: KohlerClient, module: int):
    result = client.get("/light_off.cgi", {"module": str(module)})
    print(f"Light {module} off" if result["success"] else f"Failed: {result['error']}")


def rain_control(client: KohlerClient, color_name: str):
    if color_name == "off":
        result = client.get("/rain_off.cgi")
        print("Rain panel off" if result["success"] else f"Failed: {result['error']}")
        return

    hue = RAIN_COLORS.get(color_name.lower())
    if hue is None:
        print(f"Unknown color '{color_name}'. Options: {', '.join(RAIN_COLORS.keys())}, off")
        return

    result = client.get("/rain_on.cgi", {"mode": "1", "color": str(hue)})
    print(f"Rain panel: {color_name}" if result["success"] else f"Failed: {result['error']}")


def music_on(client: KohlerClient, volume: int):
    result = client.get("/music_on.cgi", {"volume": str(volume)})
    print(f"Music on at volume {volume}" if result["success"] else f"Failed: {result['error']}")


def music_off(client: KohlerClient):
    result = client.get("/music_off.cgi")
    print("Music off" if result["success"] else f"Failed: {result['error']}")


def send_rpc(client: KohlerClient, index: int):
    result = client.get("/rpc.cgi", {"index": str(index)})
    body = result.get("body", "").strip()
    if result["success"]:
        print(f"RPC {index} sent — response: {body}")
    else:
        print(f"Failed: {result['error']}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    host = sys.argv[1]
    command = sys.argv[2]
    args = sys.argv[3:]
    client = KohlerClient(host)

    commands = {
        "status": lambda: show_status(client),
        "start": lambda: start_shower(client, float(args[0]) if args else 38.0),
        "stop": lambda: stop_shower(client),
        "user": lambda: start_user(client, int(args[0])),
        "steam_on": lambda: steam_on(client, float(args[0]) if args else 110, int(args[1]) if len(args) > 1 else 20),
        "steam_off": lambda: steam_off(client),
        "light_on": lambda: light_on(client, int(args[0]) if args else 1, int(args[1]) if len(args) > 1 else 75),
        "light_off": lambda: light_off(client, int(args[0]) if args else 1),
        "rain": lambda: rain_control(client, args[0] if args else "blue"),
        "music_on": lambda: music_on(client, int(args[0]) if args else 50),
        "music_off": lambda: music_off(client),
        "rpc": lambda: send_rpc(client, int(args[0])),
    }

    handler = commands.get(command)
    if handler:
        handler()
    else:
        print(f"Unknown command: {command}")
        print(f"Available: {', '.join(commands.keys())}")
        sys.exit(1)


if __name__ == "__main__":
    main()
