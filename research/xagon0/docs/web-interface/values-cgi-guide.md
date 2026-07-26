# values.cgi Guide

Practical guide to reading system state from the Kohler DTV+ using the `values.cgi` endpoint.

---

## Endpoint

```
GET /values.cgi[?page=<PAGE>&type=<TYPE>]
```

Both parameters are optional. When omitted, the endpoint returns a default set of values for the current page context.

---

## Response Format

The response is JSON with the following structure:

```json
{
    "page": "control",
    "type": "byte",
    "values": [0, 1, 40, 0, 0, 255, 0, 1, 0, 0, ...]
}
```

| Field | Description |
|-------|-------------|
| `page` | The page context that was queried |
| `type` | The data type of the returned values |
| `values` | Array of numeric values, indexed by datatable position |

The `values` array is ordered by datatable index. Each position corresponds to a variable in the datatable for the given page and type. See [Datatable Structure](datatable-structure.md) for the meaning of each index.

---

## Parameters

### `page`

Selects the data page to read. This corresponds to the web page context that the stock UI uses when navigating:

| Value | Description | Typical Use |
|-------|-------------|-------------|
| (default) | Main page data | General status |
| `settings` | Settings page data | Configuration values |
| `service` | Service page data | Diagnostic and service info |
| `control` | Control page data | Active shower/steam/light state |

The page parameter maps to the datatable pages the stock UI would load when navigating to that section. The exact variables returned depend on the firmware version.

### `type`

Filters by data type:

| Value | Description |
|-------|-------------|
| `byte` | 8-bit values |
| `word` | 16-bit values |
| `color` | 32-bit ARGB values |
| `string` | String values |

---

## Standard Web Pages

The DTV+ serves the following HTML pages, each of which uses `values.cgi` to populate its data:

| URL Path | Description |
|----------|-------------|
| `/` | Main landing page (redirects based on `landing_url.cgi`) |
| `/settings.html` | System settings and configuration |
| `/service.html` | Service diagnostics, error logs, firmware info |
| `/control.html` | Active shower control interface |

---

## How to Interpret Response Data

The `values` array contains raw datatable values. To interpret them:

1. **Identify the page and type** from the response.
2. **Look up the index** in the [Datatable Structure](datatable-structure.md) to find the variable meaning.
3. **Apply any scaling.** Temperatures are often stored as integers multiplied by 10 (e.g., `415` means `41.5` degrees).
4. **Check bitfields.** Some values are packed bitfields where each bit represents a flag or outlet.

### Temperature decoding example

```javascript
// Independently written example
function decodeTemperature(rawValue) {
    // Raw datatable word values are scaled by 10
    return rawValue / 10.0;
}

// If values[0] is 415, the actual temperature is 41.5 degrees
```

### Outlet bitmask decoding example

```javascript
// Independently written example
function decodeActiveOutlets(rawValue) {
    const outlets = [];
    for (let i = 0; i < 6; i++) {
        if (rawValue & (1 << i)) {
            outlets.push(i + 1);
        }
    }
    return outlets;
}

// If values[4] is 5 (binary 000101), outlets 1 and 3 are active
```

---

## Common Use Cases

### Check if the shower is running

```javascript
// Independently written example
async function isShowerRunning() {
    const resp = await fetch('/values.cgi?type=byte', { cache: 'no-store' });
    const data = await resp.json();
    // Stationary byte index 1 holds the shower state
    // 0 = idle, nonzero = active
    return data.values[1] !== 0;
}
```

### Read current water temperature

```javascript
// Independently written example
async function getCurrentTemperature(valve) {
    const resp = await fetch('/values.cgi?type=word', { cache: 'no-store' });
    const data = await resp.json();
    // Word index 0 = valve 1 current temp, index 2 = valve 2 current temp
    const idx = (valve === 1) ? 0 : 2;
    return data.values[idx] / 10.0;
}
```

### Check connected device status

```javascript
// Independently written example
async function getDeviceStatus() {
    const resp = await fetch('/values.cgi?type=byte', { cache: 'no-store' });
    const data = await resp.json();
    return {
        showerState: data.values[1],
        activeUser: data.values[2],
        errorFlags: data.values[3],
        devices: data.values[5]
    };
}
```

---

## Practical Polling Example

A complete polling loop for a custom dashboard:

```javascript
// Independently written example -- not from Kohler source code

class DtvPlusMonitor {
    constructor(baseUrl, intervalMs) {
        this.baseUrl = baseUrl;
        this.intervalMs = intervalMs || 500;
        this.running = false;
        this.listeners = [];
    }

    start() {
        this.running = true;
        this._poll();
    }

    stop() {
        this.running = false;
    }

    onUpdate(callback) {
        this.listeners.push(callback);
    }

    async _poll() {
        while (this.running) {
            try {
                const [bytes, words] = await Promise.all([
                    this._fetch('byte'),
                    this._fetch('word')
                ]);

                const state = {
                    showerRunning: bytes.values[1] !== 0,
                    activeUser: bytes.values[2],
                    tempValve1: words.values[0] / 10.0,
                    targetValve1: words.values[1] / 10.0,
                    tempValve2: words.values[2] / 10.0,
                    targetValve2: words.values[3] / 10.0,
                    steamTemp: words.values[10],
                    steamTimer: words.values[12],
                    lightModule1: bytes.values[20],
                    lightModule2: bytes.values[21],
                    lightModule3: bytes.values[22],
                    errors: bytes.values[3] | (bytes.values[4] << 8)
                };

                for (const cb of this.listeners) {
                    cb(state);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }

            await this._sleep(this.intervalMs);
        }
    }

    async _fetch(type) {
        const resp = await fetch(
            `${this.baseUrl}/values.cgi?type=${type}`,
            { cache: 'no-store' }
        );
        return resp.json();
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Usage
const monitor = new DtvPlusMonitor('http://192.168.1.100', 500);
monitor.onUpdate(state => {
    console.log(`Shower: ${state.showerRunning ? 'ON' : 'OFF'}`);
    console.log(`Temp: ${state.tempValve1} C (target: ${state.targetValve1} C)`);
});
monitor.start();
```

---

## Important Notes

### Session Limit

The DTV+ supports only **2 concurrent HTTP sessions**. A polling loop counts as one persistent session. If you have two browser tabs or two polling scripts running, a third connection will fail.

Design your polling to use a single connection where possible. The example above issues two requests per cycle (`byte` and `word`), but they are sequential, not parallel long-lived connections.

### Cache Busting

Always disable caching when reading `values.cgi`. The DTV+ web server does not set proper cache-control headers, so browsers may return stale data.

```javascript
// Using fetch API
fetch('/values.cgi', { cache: 'no-store' });

// Using jQuery
$.ajax({ url: '/values.cgi', cache: false });

// Using a timestamp parameter
fetch('/values.cgi?_t=' + Date.now());
```

### Relationship to edit_dt.cgi

`values.cgi` is a **read-only bulk endpoint** -- it returns many variables at once but cannot write.

For writing individual values, use:
- [`edit_dt.cgi`](datatable-structure.md) for direct datatable writes (low-level)
- [`save_variable.cgi`](save-variable-reference.md) for validated, high-level writes

For reading a single specific variable, `edit_dt.cgi` with no `value` parameter is more efficient than parsing the full `values.cgi` response.

### Response Timing

Responses typically arrive within 50-100ms on a local network. If polling at 500ms intervals, you will get fresh data every half second. For tighter control loops, you can poll as fast as 200ms, but be aware of the session limit and avoid saturating the embedded web server.

### Error Handling

The endpoint may return empty responses or malformed JSON if the system is busy (e.g., during firmware updates or flash writes). Always wrap your fetch calls in try/catch blocks and handle parse errors gracefully.

```javascript
// Independently written example
async function safeFetch(url) {
    try {
        const resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok) return null;
        const text = await resp.text();
        if (!text || text.length === 0) return null;
        return JSON.parse(text);
    } catch (err) {
        return null;
    }
}
```
