# Request flow

What actually happens between your phone and the controller when you tap
**Start** on the Shower screen. See [DESIGN.md](DESIGN.md) for why it is shaped
this way and [PROTOCOL.md](PROTOCOL.md) for the wire format.

## The one-line answer

The phone talks only to your dev machine on port 5180. The Vite dev server
serves the React app *and*, in the same Node process, hosts an `/api`
middleware that opens a raw TCP socket to the controller on port 80. There is
no separate proxy script and no Python anywhere — the middleware is a Vite
plugin (`vite.config.ts` -> `kohlerApi`) loaded into the dev server.

The browser cannot reach the controller directly: its `.cgi` handlers answer in
HTTP/0.9 (a bare body, no status line), which no browser, `fetch`, or WebView
HTTP stack will accept. Only a raw socket client can read it, so a Node process
stays in the picture on every platform.

## Sequence

```mermaid
sequenceDiagram
    autonumber

    actor U as You (phone)
    participant B as Mobile browser<br/>React SPA
    box rgb(60,70,90) Dev machine — ONE Node process, port 5180
        participant V as Vite dev server<br/>(static assets)
        participant M as kohler-api middleware<br/>server/middleware.mjs
        participant S as cgi-safety.mjs<br/>risk gate
        participant Q as kohler-client.mjs<br/>queue + raw TCP
    end
    participant C as K-99695 controller<br/>192.168.0.115:80<br/>MQX embedded httpd

    Note over B,V: 1. Page load — plain HTTP, same origin
    U->>B: open http://<dev-machine>:5180
    B->>V: GET / , /assets/*.js
    V-->>B: index.html + React bundle

    Note over B,C: 2. Polling loop — every 2500 ms, forever
    loop every POLL_MS = 2500 ms
        B->>M: GET /api/status
        M->>Q: kohlerGet("values.cgi")
        M->>Q: kohlerGet("system_info.cgi")
        Note over Q: Serialised: one at a time,<br/>120 ms floor between calls.<br/>Parallel requests wedge this unit.
        Q->>C: raw socket: GET /values.cgi HTTP/1.0<br/>Connection: close
        C-->>Q: HTTP/0.9 body (~300 keys), then FIN
        Q->>C: raw socket: GET /system_info.cgi HTTP/1.0
        C-->>Q: HTTP/0.9 body (39 keys), then FIN
        Q-->>M: parsed JSON (repr-tolerant: True/False/None)
        M-->>B: 200 {ok, values, system}
        B->>B: buildModel() -> ShowerModel -> re-render
    end

    Note over U,C: 3. You tap START
    U->>B: click Start
    B->>B: useShower.start()<br/>pick outlets (selection or default)
    B->>B: graceUntil = now + 5000 ms<br/>(ignore polls that would snap UI back)
    B->>M: POST /api/command/quick_shower.cgi<br/>{valve_num, valve1_outlet, valve1_massage, valve1_temp, ...}

    M->>M: reject unless method is POST
    M->>S: checkAccess("quick_shower.cgi", "command")
    alt rated above MAX_RISK (2/5) or not exposed
        S-->>M: denied
        M-->>B: 4xx {ok:false, error, risk}
        Note over M,C: No packet ever reaches the controller
    else allowed
        S-->>M: allowed
        M->>Q: kohlerGet("quick_shower.cgi", params)<br/>timeout 12 s, 1 retry
        Q->>Q: wait for queue slot + 120 ms gap
        Q->>C: GET /quick_shower.cgi?valve_num=1&valve1_outlet=... HTTP/1.0
        C->>C: opens the valve — water starts
        C-->>Q: HTTP/0.9 body, then FIN
        Q-->>M: {status, body, json}
        M-->>B: 200 {ok:true, name, params}
    end

    Note over B,C: 4. Next poll confirms — but the UI already<br/>shows the optimistic state during the 5 s grace window
    B->>M: GET /api/status
    M->>Q: values.cgi / system_info.cgi
    Q->>C: raw socket
    C-->>Q: shower_on = true
    M-->>B: 200
    B->>B: grace expired -> controller becomes the authority
```

## Who talks to whom

| Hop | Protocol | Who initiates |
| --- | --- | --- |
| phone -> dev machine :5180 | normal HTTP/1.1, JSON | browser `fetch` |
| dev machine -> controller :80 | HTTP/1.0 out, **HTTP/0.9 in**, raw `net.Socket` | Node |
| phone -> controller | **never happens** | — |

## Things worth knowing

- **Everything is one process.** `npm run dev` starts Vite; the plugin in
  [vite.config.ts](app/vite.config.ts) calls `createKohlerMiddleware()` and
  mounts it with `server.middlewares.use()`. Kill the terminal and both the web
  page and the proxy go away.
- **`server.host: true`** is what makes 5180 reachable from the phone at all —
  it binds every interface rather than just localhost.
- **`API_BASE` is empty in dev**, so the app calls `/api/...` on whatever origin
  served it. That is the seam for the Android/Capacitor port: a packaged app has
  no Node of its own and must be built with
  `VITE_API_BASE=http://<lan-host>:8080`.
- **`npm run serve`** ([server/standalone.mjs](app/server/standalone.mjs)) is
  the same middleware without Vite, serving `dist/` instead. Identical flow,
  different port.
- **Start and "change temperature" are the same call.** The controller takes the
  complete desired state every time, so `quick_shower.cgi` carries outlets,
  massage mode and temperature for both valves on every invocation.
- **Stop is a different endpoint.** Deselecting every outlet routes to
  `stop_shower.cgi`, not to `quick_shower.cgi` with an empty list.
