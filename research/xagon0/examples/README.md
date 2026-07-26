# Examples

Example Python scripts for interacting with the Kohler DTV+ controller over HTTP.

## Prerequisites

- Python 3.6 or later
- No external dependencies required (uses standard library only: `urllib`, `json`, `sys`, `time`)

## Scripts Overview

| Script | Description |
|--------|-------------|
| `kohler_http.py` | HTTP client library wrapping DTV+ CGI endpoints |
| `basic_connection_test.py` | Verify connectivity and read system info |
| `shower_control.py` | Start and stop showers, set temperature and outlets |
| `device_status_monitor.py` | Poll and display device status in a loop |

## Usage

```
python <script>.py <controller_ip>
```

For example:

```
python basic_connection_test.py 192.168.1.100
python shower_control.py 192.168.1.100
python device_status_monitor.py 192.168.1.100
```

## Important Notes

- **2-session limit:** The controller supports only 2 concurrent HTTP connections. These scripts use `Connection: close` to release connections immediately.
- **Request spacing:** A 500ms delay is included between consecutive requests to avoid overwhelming the controller.
- **No Content-Length:** CGI responses typically omit the Content-Length header. The client library reads until socket close.
- **Independence:** These are independently written examples inspired by community reverse engineering work. No proprietary code is included.
