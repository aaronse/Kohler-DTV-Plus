# Getting Started

## What You Need

- A **DTV+ controller** connected to your local network (Ethernet)
- A **web browser** (Chrome recommended)
- The controller's **IP address**

## Finding Your Controller's IP Address

The DTV+ controller requests an IP address via DHCP when it boots. To find it:

**Option 1 -- Check your router:**
Log into your router's admin page and look at the DHCP lease table. The controller will appear as a new device.

**Option 2 -- Network scan:**
Use a network scanner to find devices listening on port 80:

```
nmap -sn 192.168.1.0/24
```

Or use a GUI tool like Angry IP Scanner.

## First Test

Open your browser and navigate to:

```
http://<controller-ip>/
```

You should see the DTV+ web interface. If the page loads, you are connected and ready to explore.

## Safety First

- Read the project DISCLAIMER before making any changes
- Be aware of safety ratings -- this controls real water and electrical systems
- **Start with read-only endpoints** to understand the system before sending commands
- The controller supports only **2 concurrent HTTP sessions** -- exceeding this can lock it up

## Quick Wins

Here are some safe endpoints to try right away. All are HTTP GET requests you can open directly in your browser.

### Check System Information

```
GET http://<controller-ip>/system_info.cgi
```

Returns controller model, firmware version, serial number, and network configuration.

### Check Update Status

```
GET http://<controller-ip>/ftp_status.cgi
```

Returns JSON with internet connectivity status and whether firmware upload is enabled.

### Read System Values

```
GET http://<controller-ip>/values.cgi
```

Returns the current datatable values -- temperatures, device states, configuration.

### Start a Shower

```
GET http://<controller-ip>/quick_shower.cgi?valve_num=1&valve1_outlet=1&valve1_massage=0&valve1_temp=38
```

Starts valve 1, outlet 1, at 38 degrees Celsius with massage off.

### Stop a Shower

```
GET http://<controller-ip>/stop_shower.cgi
```

Stops all active outlets.

### Turn On Lights

```
GET http://<controller-ip>/light_on.cgi?module=1&intensity=75
```

Turns on light module 1 at 75% intensity.

### Turn Off Lights

```
GET http://<controller-ip>/light_off.cgi?module=1
```

### Toggle Rain Panel

```
GET http://<controller-ip>/rain_on.cgi?mode=1&color=235
```

Activates rain panel in mode 1 with color value 235 (blue).

## Common Pitfalls

| Pitfall | Details |
|---------|---------|
| 2-session limit | Only 2 concurrent HTTP connections. Always close connections promptly. Use `Connection: close` header. |
| No Content-Length | Most CGI responses omit Content-Length. Read until socket close. |
| Lockup risk | Some endpoints or excessive connections can lock the controller. Power cycle to recover. |
| Cache issues | Disable HTTP caching when polling endpoints. Stale responses show outdated data. |

## Where to Go Next

- **[CGI Endpoints](../docs/web-interface/)** -- Full reference for all HTTP endpoints
- **[RPC Reference](../docs/protocols/)** -- Direct device control via RPC calls
- **[Home Automation Guide](home-automation.md)** -- Integrate with Home Assistant, Node-RED, etc.
- **[Implementation Quirks](../docs/implementation-quirks.md)** -- Timing constraints and non-obvious behaviors
