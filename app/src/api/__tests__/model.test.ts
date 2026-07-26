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
