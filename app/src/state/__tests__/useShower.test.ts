import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Why this file exists: `<StrictMode>` double-invokes every function passed to
 * a state setter, so a state updater that also *sends a command* sends it
 * twice. On this hardware that is not cosmetic — the controller's documented
 * failure mode is going unreachable for hours after rapid successive valve
 * commands (research/FIELD-NOTES.md §1). One tap must mean one command.
 *
 * `react` is replaced by test/hookHarness.ts, which answers the five hooks
 * `useShower` uses and reproduces StrictMode's updater double-invocation. See
 * that file for what it deliberately does not model.
 */

const stub = vi.hoisted(() => ({
  calls: [] as Array<{ name: string; params: unknown; insideUpdater: boolean }>,
  showerOn: true,
}));

vi.mock('react', () => import('../../../test/hookHarness'));

vi.mock('../../api/client', async () => {
  const { isInsideUpdater } = await import('../../../test/hookHarness');
  const values = (await import('../../../test/fixtures/values.json')).default;
  const system = (await import('../../../test/fixtures/system_info.json')).default;

  const record = (name: string, params?: unknown) => {
    stub.calls.push({ name, params, insideUpdater: isInsideUpdater() });
    return Promise.resolve({ ok: true });
  };

  return {
    getStatus: () =>
      Promise.resolve({
        ok: true,
        ts: 1_700_000_000_000,
        host: '192.168.0.115',
        values,
        system: {
          ...system,
          ui_shower_on: stub.showerOn,
          valve1_Currentstatus: stub.showerOn ? 'On' : 'Off',
        },
      }),
    quickShower: (cmd: unknown) => record('quick_shower.cgi', cmd),
    stopShower: () => record('stop_shower.cgi'),
    startPreset: (user: number) => record('start_user.cgi', user),
    stopPreset: () => record('stop_user.cgi'),
    command: (name: string, params: unknown) => record(name, params),
  };
});

const { mountHook } = await import('../../../test/hookHarness');
const { useShower } = await import('../useShower');

/** Mount, let the first poll land and seed the defaults, then start counting. */
async function mountShower(options: { strict?: boolean } = {}) {
  const harness = mountHook(() => useShower(), options);
  await harness.flush();
  stub.calls.length = 0;
  return harness;
}

const names = () => stub.calls.map((c) => c.name);

describe('toggleOutlet', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stub.calls.length = 0;
    stub.showerOn = true;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('seeds the selection from the controller before any tap', async () => {
    const harness = await mountShower();
    // The live capture has outlet 3 armed and no other.
    expect([...harness.current.selection]).toEqual([3]);
    expect(harness.current.model.showerOn).toBe(true);
    harness.unmount();
  });

  it('issues no command from inside a state updater', async () => {
    const harness = await mountShower();
    await harness.flush(() => harness.current.actions.toggleOutlet(1));

    // B01.T01 — the purity check. A dispatch recorded here means a state
    // updater is doing I/O, which StrictMode will run twice.
    expect(stub.calls.filter((c) => c.insideUpdater)).toEqual([]);
    harness.unmount();
  });

  it('sends exactly one quick_shower.cgi per tap under StrictMode', async () => {
    const harness = await mountShower({ strict: true });
    await harness.flush(() => harness.current.actions.toggleOutlet(1));

    expect(names()).toEqual(['quick_shower.cgi']);
    harness.unmount();
  });

  it('sends the same single command without StrictMode double-invocation', async () => {
    const harness = await mountShower({ strict: false });
    await harness.flush(() => harness.current.actions.toggleOutlet(1));

    expect(names()).toEqual(['quick_shower.cgi']);
    harness.unmount();
  });

  it('sends the tapped outlet added to the armed selection', async () => {
    const harness = await mountShower();
    await harness.flush(() => harness.current.actions.toggleOutlet(1));

    expect([...harness.current.selection].sort()).toEqual([1, 3]);
    expect(stub.calls[0]?.params).toMatchObject({ valveNum: 1, valve1Outlets: '13' });
    harness.unmount();
  });

  it('stops the shower when the last outlet is turned off', async () => {
    const harness = await mountShower();
    await harness.flush(() => harness.current.actions.toggleOutlet(3));

    expect(names()).toEqual(['stop_shower.cgi']);
    expect([...harness.current.selection]).toEqual([]);
    harness.unmount();
  });

  it('sends nothing while the shower is idle', async () => {
    stub.showerOn = false;
    const harness = await mountShower();
    await harness.flush(() => harness.current.actions.toggleOutlet(1));

    expect(names()).toEqual([]);
    expect([...harness.current.selection].sort()).toEqual([1, 3]);
    harness.unmount();
  });
});
