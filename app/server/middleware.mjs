import { kohlerGet, DEFAULT_HOST } from './kohler-client.mjs';
import { checkAccess, exposedEndpoints, MAX_RISK } from './cgi-safety.mjs';

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

export function createKohlerMiddleware({ host = DEFAULT_HOST } = {}) {
  return async function kohlerMiddleware(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/api/')) return next();

    try {
      // --- Combined status: the one call the UI polls on a timer. ----------
      if (url.pathname === '/api/status') {
        const [values, system] = await Promise.allSettled([
          kohlerGet('values.cgi', {}, { host, timeout: 8000 }),
          kohlerGet('system_info.cgi', {}, { host, timeout: 8000 }),
        ]);
        const v = values.status === 'fulfilled' ? values.value.json : null;
        const s = system.status === 'fulfilled' ? system.value.json : null;
        if (!v && !s) {
          return send(res, 502, {
            ok: false,
            error: values.reason?.message || system.reason?.message || 'controller unreachable',
            host,
          });
        }
        return send(res, 200, { ok: true, ts: Date.now(), host, values: v, system: s });
      }

      // --- The safety policy itself, so the UI and tests can show it. ------
      if (url.pathname === '/api/safety') {
        return send(res, 200, { ok: true, maxRisk: MAX_RISK, exposed: exposedEndpoints() });
      }

      // --- Raw read passthrough (diagnostics). ----------------------------
      if (url.pathname.startsWith('/api/read/')) {
        const name = url.pathname.slice('/api/read/'.length);
        const gate = checkAccess(name, 'read');
        if (!gate.allowed) {
          return send(res, gate.status, { ok: false, error: gate.reason, risk: gate.risk });
        }
        const r = await kohlerGet(name, Object.fromEntries(url.searchParams), { host });
        return send(res, 200, { ok: true, name, json: r.json, body: r.json ? undefined : r.body });
      }

      // --- Commands. POST only, so nothing can fire one by navigation. -----
      if (url.pathname.startsWith('/api/command/')) {
        const name = url.pathname.slice('/api/command/'.length);
        if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'POST required' });
        const gate = checkAccess(name, 'command');
        if (!gate.allowed) {
          return send(res, gate.status, { ok: false, error: gate.reason, risk: gate.risk });
        }
        const params = await readBody(req);
        const r = await kohlerGet(name, params, { host, timeout: 12000, retries: 1 });
        return send(res, 200, { ok: true, name, params, status: r.status, body: r.body?.slice(0, 500) });
      }

      return send(res, 404, { ok: false, error: 'unknown endpoint' });
    } catch (err) {
      return send(res, 502, { ok: false, error: String(err?.message || err), host });
    }
  };
}
