import { describe, expect, it } from 'vitest';
import valuesFixture from '../../../test/fixtures/values.json';
import systemFixture from '../../../test/fixtures/system_info.json';
import {
  buildModel,
  connectionState,
  encodeOutlets,
  isFlowing,
  toggleOutletSelection,
  usableOutlets,
} from '../model';
import { parseOutletType, OUTLET_TYPES, outletIcon } from '../outlets';
import type { KohlerSystemInfo, KohlerValues, StatusResponse } from '../types';

/**
 * Fixtures are verbatim captures from the live K-99695 at 192.168.0.115 taken
 * 2026-07-26 while the shower was idle. Read-only: nothing here touches
 * hardware.
 */
function status(over: Partial<StatusResponse> = {}): StatusResponse {
  return {
    ok: true,
    ts: 1_700_000_000_000,
    host: '192.168.0.115',
    values: valuesFixture as unknown as KohlerValues,
    system: systemFixture as unknown as KohlerSystemInfo,
    ...over,
  };
}

describe('parseOutletType', () => {
  it('parses the controller string form', () => {
    expect(parseOutletType('outlet_12')).toBe(12);
    expect(parseOutletType('outlet_0')).toBe(0);
    expect(parseOutletType('outlet_23')).toBe(23);
  });

  it('falls back to 0 rather than NaN', () => {
    expect(parseOutletType(undefined)).toBe(0);
    expect(parseOutletType('')).toBe(0);
    expect(parseOutletType('nonsense')).toBe(0);
  });
});

describe('encodeOutlets', () => {
  it('concatenates positions in ascending order', () => {
    expect(encodeOutlets([3, 1, 4])).toBe('134');
    expect(encodeOutlets([2])).toBe('2');
  });

  it('encodes an empty selection as an empty string', () => {
    expect(encodeOutlets([])).toBe('');
  });
});

describe('buildModel against the live capture', () => {
  const model = buildModel(status());
  const valve = model.valves[0];

  it('reads the system as online with one installed valve', () => {
    expect(model.online).toBe(true);
    expect(valve.installed).toBe(true);
    expect(valve.connected).toBe(true);
    expect(model.valves[1].installed).toBe(false);
  });

  it('maps the four configured fittings in order', () => {
    expect(usableOutlets(valve).map((o) => [o.position, o.typeId])).toEqual([
      [1, 2], // showerhead
      [2, 23], // Real Rain
      [3, 8], // handshower
      [4, 12], // bodyspray
    ]);
  });

  it('excludes Real Rain from massage even though other fittings allow it', () => {
    const byPos = Object.fromEntries(valve.outlets.map((o) => [o.position, o]));
    expect(byPos[1].massageCapable).toBe(true);
    expect(byPos[3].massageCapable).toBe(true);
    expect(byPos[4].massageCapable).toBe(true);
    expect(byPos[2].massageCapable).toBe(false);
  });

  it('reads temperature setpoint and limits', () => {
    expect(valve.targetTemp).toBe(96);
    expect(valve.maxTemp).toBe(113);
    expect(valve.minTemp).toBe(86); // Fahrenheit floor
    expect(model.units).toBe('F');
  });

  it('does not report water running just because an outlet is armed', () => {
    // The capture has valve1outlet3 = true (the default) with the shower off.
    expect(valve.outlets[2].selected).toBe(true);
    expect(model.showerOn).toBe(false);
    expect(isFlowing(model, valve.outlets[2])).toBe(false);
  });

  it('flags the missing wall interface', () => {
    expect(model.interfacePresent).toBe(false);
  });

  it('reads the amplifier and its volume', () => {
    expect(model.audio.installed).toBe(true);
    expect(model.audio.playing).toBe(false);
    expect(model.audio.volume).toBe(50);
  });

  it('marks the default outlet', () => {
    expect(valve.outlets.filter((o) => o.isDefault).map((o) => o.position)).toEqual([3]);
  });

  it('reports all six presets as unsaved', () => {
    expect(model.presets).toHaveLength(6);
    expect(model.presets.every((p) => !p.enabled)).toBe(true);
  });
});

describe('buildModel degradation', () => {
  it('survives a total loss of the controller', () => {
    const model = buildModel(null);
    expect(model.online).toBe(false);
    expect(model.showerOn).toBe(false);
    expect(model.valves).toHaveLength(2);
    expect(usableOutlets(model.valves[0])).toEqual([]);
  });

  it('marks a model built from nothing as not loaded', () => {
    // The empty model's six type-0 slots look exactly like an unconfigured
    // valve, so the UI needs this flag to avoid announcing that the shower has
    // no outlets before the first poll has even answered.
    expect(buildModel(null).loaded).toBe(false);
    expect(buildModel(status()).loaded).toBe(true);
  });

  it('stays loaded when a later poll fails after a good read', () => {
    // useShower keeps the last payload and flips ok=false, so the model is
    // loaded but offline — a real fault, not a cold start.
    const model = buildModel(status({ ok: false }));
    expect(model.loaded).toBe(true);
    expect(model.online).toBe(false);
  });

  it('still builds when only system_info came back', () => {
    const model = buildModel(status({ values: null }));
    expect(model.online).toBe(true);
    expect(model.valves[0].targetTemp).toBe(96);
  });

  it('treats water as running when the controller says so', () => {
    const model = buildModel(
      status({
        system: { ...(systemFixture as unknown as KohlerSystemInfo), ui_shower_on: true },
      }),
    );
    expect(model.showerOn).toBe(true);
    expect(isFlowing(model, model.valves[0].outlets[2])).toBe(true);
    expect(isFlowing(model, model.valves[0].outlets[0])).toBe(false);
  });
});

describe('connectionState', () => {
  const live = buildModel(status());
  const cold = buildModel(null);

  it('reports connecting before the first reply, with no error yet', () => {
    expect(connectionState(cold, null)).toBe('connecting');
  });

  it('reports unreachable when the first poll itself failed', () => {
    // Nothing was stored, so the model is still unloaded; only the error
    // separates this from a cold start.
    expect(connectionState(cold, 'timeout after 8000ms')).toBe('unreachable');
  });

  it('reports unreachable once a loaded model goes offline', () => {
    expect(connectionState(buildModel(status({ ok: false })), 'connect ECONNREFUSED')).toBe(
      'unreachable',
    );
  });

  it('separates idle from running while connected', () => {
    expect(connectionState(live, null)).toBe('idle');
    const running = buildModel(
      status({ system: { ...(systemFixture as unknown as KohlerSystemInfo), ui_shower_on: true } }),
    );
    expect(connectionState(running, null)).toBe('running');
  });

  it('lets a live reading win over a stale error', () => {
    // A recovered poll clears lastError, but even if it lingered the model
    // being online is the stronger signal.
    expect(connectionState(live, 'timeout after 8000ms')).toBe('idle');
  });
});

/**
 * Regressions for failures other DTV+ integrations hit in the field. See
 * research/FIELD-NOTES.md for the reports these come from.
 */
describe('field-report regressions', () => {
  it('counts PurgeActive as running (niemyjski#45)', () => {
    // Auto-purge is enabled on this system, so the warm-up runs cold water
    // before shower_on is set. Missing it means offering "start" mid-shower.
    const model = buildModel(
      status({
        system: {
          ...(systemFixture as unknown as KohlerSystemInfo),
          valve1_Currentstatus: 'PurgeActive',
        },
      }),
    );
    expect(model.valves[0].purging).toBe(true);
    expect(model.valves[0].running).toBe(true);
    expect(model.showerOn).toBe(true);
    expect(model.purging).toBe(true);
  });

  it('counts a plain On status as running without flagging purge', () => {
    const model = buildModel(
      status({
        system: { ...(systemFixture as unknown as KohlerSystemInfo), valve1_Currentstatus: 'On' },
      }),
    );
    expect(model.showerOn).toBe(true);
    expect(model.purging).toBe(false);
  });

  it('tolerates the empty status this controller reports at rest', () => {
    // Ours returns "" rather than "Off" when idle.
    expect((systemFixture as unknown as KohlerSystemInfo).valve1_Currentstatus).toBe('');
    expect(buildModel(status()).showerOn).toBe(false);
  });

  it('reads outlet state via valveN_outletM_func.id, not the slot (niemyjski#39)', () => {
    // Turning on outlet 2 lit outlet 6 for that reporter because the two index
    // spaces were conflated. Here slot 3 is remapped to report under index 6.
    const remapped = buildModel(
      status({
        values: {
          ...(valuesFixture as unknown as KohlerValues),
          valve1_outlet3_func: { func: 8, id: 6 },
        },
        system: {
          ...(systemFixture as unknown as KohlerSystemInfo),
          valve1outlet3: false,
          valve1outlet6: true,
        },
      }),
    );
    const handshower = remapped.valves[0].outlets[2];
    expect(handshower.position).toBe(3); // what quick_shower.cgi is sent
    expect(handshower.statusIndex).toBe(6); // where system_info reports it
    expect(handshower.selected).toBe(true);
  });

  it('falls back to the slot number when a func entry is absent', () => {
    // This valve reports six ports but only four are configured; slots 5 and 6
    // have no func key at all. Dereferencing them blindly is a live NPE in one
    // community driver.
    const valve = buildModel(status()).valves[0];
    expect(valve.outlets[4].statusIndex).toBe(5);
    expect(valve.outlets[5].statusIndex).toBe(6);
    expect(valve.outlets.map((o) => o.statusIndex)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('prefers live system_info over possibly-cached values for run state', () => {
    // The proxy serves values.cgi from a 30 s cache, so a stale shower_on must
    // not keep the UI claiming water is running.
    const model = buildModel(
      status({
        values: { ...(valuesFixture as unknown as KohlerValues), shower_on: true },
        valuesCached: true,
      }),
    );
    expect(model.showerOn).toBe(false);
  });
});

describe('outlet icons', () => {
  it('resolves per theme and selection state', () => {
    expect(outletIcon(8, true, 'dark')).toBe('/fittings/dark/8_on.png');
    expect(outletIcon(8, false, 'light')).toBe('/fittings/light/8_off.png');
  });

  it('has a label for every type the controller can report', () => {
    for (let i = 0; i <= 23; i++) {
      expect(OUTLET_TYPES[i], `missing type ${i}`).toBeDefined();
    }
  });
});

describe('toggleOutletSelection', () => {
  it('adds an outlet that is not selected', () => {
    const { selection, command } = toggleOutletSelection(new Set([3]), 1, false);
    expect([...selection].sort()).toEqual([1, 3]);
    expect(command).toBe(false);
  });

  it('removes an outlet that is selected', () => {
    const { selection } = toggleOutletSelection(new Set([1, 3]), 3, false);
    expect([...selection]).toEqual([1]);
  });

  it('asks for a command only while water is running', () => {
    expect(toggleOutletSelection(new Set([3]), 1, true).command).toBe(true);
    expect(toggleOutletSelection(new Set([3]), 1, false).command).toBe(false);
  });

  it('still asks for a command when the last outlet is turned off', () => {
    // An empty selection is a stop, not a no-op — the caller turns it into
    // stop_shower.cgi.
    const { selection, command } = toggleOutletSelection(new Set([3]), 3, true);
    expect([...selection]).toEqual([]);
    expect(command).toBe(true);
  });

  it('does not mutate the selection it is given', () => {
    const before = new Set([3]);
    toggleOutletSelection(before, 1, true);
    expect([...before]).toEqual([3]);
  });

  it('is pure: two identical calls give identical results and no side effects', () => {
    // This is the property StrictMode's double-invocation depends on. If this
    // function ever grows a dispatch, running it twice stops being free.
    const input = new Set([2, 4]);
    const first = toggleOutletSelection(input, 4, true);
    const second = toggleOutletSelection(input, 4, true);
    expect([...first.selection]).toEqual([...second.selection]);
    expect(first.command).toBe(second.command);
    expect([...input].sort()).toEqual([2, 4]);
  });
});
