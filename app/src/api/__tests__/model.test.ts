import { describe, expect, it } from 'vitest';
import valuesFixture from '../../../test/fixtures/values.json';
import systemFixture from '../../../test/fixtures/system_info.json';
import { buildModel, encodeOutlets, usableOutlets, isFlowing } from '../model';
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
