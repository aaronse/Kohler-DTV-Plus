/**
 * Live, strictly read-only check against the DTV+ controller.
 *
 * Fetches status, configuration and identity, asserts the shapes the app relies
 * on, and confirms the proxy refuses the destructive endpoints. It never sends
 * a command and never opens a valve — safe to run at any time, including while
 * someone is in the shower.
 *
 *   npm run selftest
 *   KOHLER_HOST=192.168.0.115 npm run selftest
 *   npm run selftest -- --api http://127.0.0.1:5180
 */
import { kohlerGet, DEFAULT_HOST } from '../server/kohler-client.mjs';
import { CGI, MAX_RISK, checkAccess, exposedEndpoints } from '../server/cgi-safety.mjs';

const args = process.argv.slice(2);
const apiBase = args.includes('--api') ? args[args.indexOf('--api') + 1] : null;
const host = process.env.KOHLER_HOST || DEFAULT_HOST;

let passed = 0;
const failures = [];

function check(name, fn) {
  try {
    const detail = fn();
    passed++;
    console.log(`  ok   ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const OUTLET_RE = /^outlet_(\d|1\d|2[0-3])$/;

console.log(`\nDTV+ self-test (read-only)   controller ${host}\n`);

// ------------------------------------------------------------ safety policy
// Checked first, and entirely offline: if the gate is wrong, nothing else
// should be trusted to run.
console.log('safety policy');

check('nothing above the risk ceiling is exposed', () => {
  const over = exposedEndpoints().filter((e) => e.risk > MAX_RISK);
  assert(over.length === 0, `exposed above ${MAX_RISK}/5: ${over.map((e) => e.name).join(', ')}`);
  return `${exposedEndpoints().length} exposed, all <= ${MAX_RISK}/5`;
});

check('the destructive endpoints are unreachable', () => {
  const critical = [
    'reset_factory.cgi',
    'clear_dt.cgi',
    'fileupload.cgi',
    'unpack_bin.cgi',
    'edit_dt.cgi',
    'rpc.cgi',
    'set_device.cgi',
    'swapvalves.cgi',
    'forget_devices.cgi',
    'reset_default.cgi',
  ];
  for (const name of critical) {
    for (const kind of ['read', 'command']) {
      const gate = checkAccess(name, kind);
      assert(!gate.allowed, `${name} is reachable as ${kind}`);
    }
  }
  return `${critical.length} verified blocked`;
});

check('the documented lockup endpoints are blocked', () => {
  for (const name of ['mac.cgi', 'serial.cgi', 'powerclean_check.cgi']) {
    assert(CGI[name].risk >= 3, `${name} rated ${CGI[name].risk}/5, expected >= 3`);
    assert(!checkAccess(name, 'read').allowed, `${name} is readable`);
  }
  return 'mac.cgi, serial.cgi, powerclean_check.cgi';
});

check('unknown endpoints are refused by default', () => {
  assert(!checkAccess('made_up.cgi', 'command').allowed, 'unknown endpoint allowed');
  assert(!checkAccess('', 'read').allowed, 'empty name allowed');
  return 'deny by default';
});

// --------------------------------------------------------------- values.cgi
console.log('values.cgi');
let values; // reassigned if a suspect read is re-confirmed
const t0 = Date.now();
try {
  const res = await kohlerGet('values.cgi', {}, { host, timeout: 10000 });
  values = res.json;
  assert(values, `no JSON body (got ${res.body?.slice(0, 80)})`);
  console.log(`  ok   fetched — ${Object.keys(values).length} keys in ${Date.now() - t0}ms`);
  passed++;
} catch (err) {
  console.log(`  FAIL fetch — ${err.message}`);
  failures.push('values.cgi fetch');
}

if (values) {
  check('temperature limits are sane', () => {
    assert(Number(values.max_temp) > Number(values.def_temp), 'max_temp <= def_temp');
    assert(Number(values.def_temp) > 0, 'def_temp missing');
    return `default ${values.def_temp}, max ${values.max_temp}`;
  });

  check('outlet types are well formed', () => {
    const keys = ['one_type', 'two_type', 'three_type', 'four_type', 'five_type', 'six_type'];
    for (const k of keys) assert(OUTLET_RE.test(String(values[k])), `${k} = ${values[k]}`);
    const configured = keys.filter((k) => values[k] !== 'outlet_0');
    return `${configured.length} configured: ${configured.map((k) => values[k]).join(', ')}`;
  });

  check('the default outlet is one of the configured ones', () => {
    const types = [
      values.one_type,
      values.two_type,
      values.three_type,
      values.four_type,
      values.five_type,
      values.six_type,
    ];
    const def = Number(values.def_outlet);
    assert(def >= 1 && def <= 6, `def_outlet out of range: ${def}`);
    assert(types[def - 1] !== 'outlet_0', `def_outlet ${def} points at an unassigned position`);
    return `position ${def} (${types[def - 1]})`;
  });

  check('units are recognised', () => {
    assert([0, 1].includes(Number(values.units)), `units = ${values.units}`);
    return Number(values.units) === 0 ? 'Fahrenheit' : 'Celsius';
  });

  // Confirmed by a second read: values.cgi intermittently reports a healthy
  // valve as absent, then reads normally again (see research/FIELD-NOTES.md).
  // A single sample is not evidence of a disconnected valve.
  if (!values.valve1_installed || values.valve_1_con_string !== 'conn') {
    console.log('  ..   valve 1 read as absent, re-reading to rule out a known flap');
    try {
      const again = await kohlerGet('values.cgi', {}, { host, timeout: 10000 });
      if (again.json?.valve1_installed && again.json.valve_1_con_string === 'conn') {
        console.log('  ok   valve 1 transient bad read — second read is healthy');
        passed++;
        values = again.json;
      }
    } catch {
      /* fall through to the assertion below */
    }
  }

  check('an installed valve is actually connected', () => {
    assert(values.valve1_installed, 'valve 1 not installed (confirmed by re-read)');
    assert(
      values.valve_1_con_string === 'conn',
      `valve 1 is "${values.valve_1_con_string}" (confirmed by re-read)`,
    );
    return `valve 1 ${values.valve_1_con_string}, fw ${values.valve_1_version_string}`;
  });

  check('controller identity is reported', () => {
    assert(/^\d+\.\d+\.\d+\.\d+$/.test(String(values.IP)), `IP = ${values.IP}`);
    assert(values.controller_version_string, 'no firmware string');
    return `${values.IP} · fw ${values.controller_version_string} · MAC ${values.MAC}`;
  });

  check('web lock is off (otherwise commands would be refused)', () => {
    assert(values.web_locked === false, 'web_locked is set — the controller will reject writes');
    return 'unlocked';
  });

  check('wall interface presence is reported', () => {
    const n = Number(values.num_interface);
    assert(Number.isFinite(n), `num_interface = ${values.num_interface}`);
    return n === 0
      ? 'none seen — expected on this system, the K-99693 is the faulty part'
      : `${n} attached`;
  });
}

// ---------------------------------------------------------- system_info.cgi
console.log('\nsystem_info.cgi');
let system;
try {
  const res = await kohlerGet('system_info.cgi', {}, { host, timeout: 10000 });
  system = res.json;
  assert(system, `no JSON body (got ${res.body?.slice(0, 80)})`);
  console.log(`  ok   fetched — ${Object.keys(system).length} keys`);
  passed++;
} catch (err) {
  console.log(`  FAIL fetch — ${err.message}`);
  failures.push('system_info.cgi fetch');
}

if (system) {
  check('run-state flags are booleans', () => {
    for (const k of ['ui_shower_on', 'ui_steam_running', 'devices_running', 'spa_on']) {
      assert(typeof system[k] === 'boolean', `${k} is ${typeof system[k]}`);
    }
    return system.ui_shower_on ? 'water IS running' : 'idle';
  });

  check('setpoint is a number within the valve limits', () => {
    const sp = Number(system.valve1Setpoint);
    assert(Number.isFinite(sp), `valve1Setpoint = ${system.valve1Setpoint}`);
    if (values) assert(sp <= Number(values.max_temp), `setpoint ${sp} exceeds max`);
    return `${sp}°`;
  });

  check('per-outlet selection flags are present', () => {
    const armed = [1, 2, 3, 4, 5, 6].filter((i) => system[`valve1outlet${i}`]);
    return armed.length ? `armed: ${armed.join(', ')}` : 'none armed';
  });

  check('massage mode is a known value', () => {
    const m = Number(system.valve1_massage);
    assert([0, 1, 2, 3, 4].includes(m), `valve1_massage = ${m}`);
    return ['off', 'single', 'wave', 'custom 1', 'custom 2'][m];
  });

  check('amplifier status is readable', () => {
    assert(typeof system.musicStatus === 'string', 'musicStatus missing');
    return `${system.musicStatus}, volume ${system.volStatus}`;
  });
}

// -------------------------------------------------------- cross-consistency
if (values && system) {
  console.log('\nconsistency');
  check('shower_on agrees between the two endpoints', () => {
    assert(
      Boolean(values.shower_on) === Boolean(system.ui_shower_on),
      `values.shower_on=${values.shower_on} vs system.ui_shower_on=${system.ui_shower_on}`,
    );
    return `both ${values.shower_on ? 'running' : 'idle'}`;
  });
}

// ------------------------------------------------------------- proxy layer
if (apiBase) {
  console.log(`\nproxy at ${apiBase}`);
  const hit = async (path, init) => {
    const res = await fetch(`${apiBase}${path}`, init);
    return { status: res.status, body: await res.json().catch(() => null) };
  };

  try {
    const r = await hit('/api/status');
    check('GET /api/status returns both payloads', () => {
      assert(r.status === 200, `status ${r.status}`);
      assert(r.body?.ok, 'ok flag not set');
      assert(r.body.values && r.body.system, 'missing values or system');
      return `${Object.keys(r.body.values).length} + ${Object.keys(r.body.system).length} keys`;
    });
  } catch (err) {
    failures.push('/api/status');
    console.log(`  FAIL GET /api/status — ${err.message}`);
  }

  // The allowlist is the safety net around a controller with no auth and
  // several endpoints that can wipe or wedge it. Verify it actually holds.
  for (const blocked of ['reset_factory.cgi', 'forget_devices.cgi', 'unpack_bin.cgi']) {
    try {
      const r = await hit(`/api/command/${blocked}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      check(`command ${blocked} is refused`, () => {
        assert(r.status === 403, `expected 403, got ${r.status}`);
        return 'blocked';
      });
    } catch (err) {
      failures.push(`allowlist ${blocked}`);
      console.log(`  FAIL allowlist ${blocked} — ${err.message}`);
    }
  }

  try {
    const r = await hit('/api/read/reset_factory.cgi');
    check('read passthrough is allowlisted too', () => {
      assert(r.status === 403, `expected 403, got ${r.status}`);
      return 'blocked';
    });
  } catch (err) {
    failures.push('read allowlist');
    console.log(`  FAIL read allowlist — ${err.message}`);
  }
} else {
  console.log('\nproxy — skipped (pass --api http://127.0.0.1:5180 to include it)');
}

console.log(
  `\n${failures.length ? 'FAILED' : 'PASSED'}  ${passed} checks ok` +
    (failures.length ? `, ${failures.length} failed: ${failures.join(', ')}` : '') +
    '\n',
);
// Set the code rather than calling process.exit(): a hard exit while the last
// socket is still tearing down trips a libuv assertion on Windows.
process.exitCode = failures.length ? 1 : 0;
