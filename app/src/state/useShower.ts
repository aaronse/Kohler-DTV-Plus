import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../api/client';
import { buildModel, encodeOutlets, usableOutlets, type ShowerModel } from '../api/model';
import type { StatusResponse } from '../api/types';

const POLL_MS = 2500;
/**
 * After we send a command the controller takes a moment to reflect it, and a
 * poll landing inside that window would yank the UI back to the old state. So
 * for this long after any command we keep showing what the user asked for.
 */
const GRACE_MS = 5000;

export interface ShowerState {
  model: ShowerModel;
  /** Positions (1-6) the user has selected on valve 1. */
  selection: Set<number>;
  targetTemp: number;
  massage: number;
  busy: boolean;
  lastError: string | null;
}

export function useShower() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [targetTemp, setTargetTemp] = useState<number>(100);
  const [massage, setMassage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const graceUntil = useRef(0);
  const seeded = useRef(false);
  const tempSendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const model = useMemo(() => buildModel(status), [status]);
  const valve1 = model.valves[0];

  // --- Polling ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    const tick = async () => {
      try {
        const res = await api.getStatus(controller.signal);
        if (!cancelled) {
          setStatus(res);
          setLastError(null);
        }
      } catch (err) {
        if (!cancelled && !controller.signal.aborted) {
          setLastError(err instanceof Error ? err.message : String(err));
          setStatus((prev) => (prev ? { ...prev, ok: false } : prev));
        }
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_MS);
      }
    };
    tick();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  // --- Reconcile local intent with the controller ------------------------
  useEffect(() => {
    if (!model.online) return;
    const inGrace = Date.now() < graceUntil.current;

    // First successful read: adopt the configured defaults.
    if (!seeded.current) {
      seeded.current = true;
      const armed = valve1.outlets
        .filter((o) => o.selected && o.configured)
        .map((o) => o.position);
      const def = valve1.outlets.filter((o) => o.isDefault && o.configured).map((o) => o.position);
      setSelection(new Set(armed.length ? armed : def));
      setTargetTemp(valve1.targetTemp || 100);
      setMassage(valve1.massage);
      return;
    }

    if (inGrace) return;

    // While water is running the controller is the authority on what is open.
    if (model.showerOn) {
      const open = valve1.outlets.filter((o) => o.selected && o.configured).map((o) => o.position);
      if (open.length) setSelection(new Set(open));
      setMassage(valve1.massage);
    }
    if (valve1.targetTemp) setTargetTemp(valve1.targetTemp);
  }, [model, valve1]);

  const refreshSoon = useCallback(() => {
    graceUntil.current = Date.now() + GRACE_MS;
  }, []);

  const run = useCallback(
    async (fn: () => Promise<unknown>) => {
      setBusy(true);
      refreshSoon();
      try {
        await fn();
        setLastError(null);
      } catch (err) {
        setLastError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [refreshSoon],
  );

  /** Push the complete desired state to the controller. */
  const send = useCallback(
    (positions: Set<number>, temp: number, massageMode: number) => {
      const v2 = model.valves[1];
      if (positions.size === 0) return run(() => api.stopShower());
      return run(() =>
        api.quickShower({
          valveNum: 1,
          valve1Outlets: encodeOutlets(positions),
          valve1Massage: massageMode,
          valve1Temp: temp,
          valve2Outlets: '',
          valve2Massage: 0,
          valve2Temp: v2?.targetTemp || temp,
        }),
      );
    },
    [model.valves, run],
  );

  // --- Actions ----------------------------------------------------------
  const toggleOutlet = useCallback(
    (position: number) => {
      setSelection((prev) => {
        const next = new Set(prev);
        next.has(position) ? next.delete(position) : next.add(position);
        // While water is flowing, toggling takes effect immediately — this is
        // how the real interface behaves.
        if (model.showerOn) void send(next, targetTemp, massage);
        else refreshSoon();
        return next;
      });
    },
    [model.showerOn, send, targetTemp, massage, refreshSoon],
  );

  const start = useCallback(() => {
    const positions = selection.size
      ? selection
      : new Set(usableOutlets(valve1).filter((o) => o.isDefault).map((o) => o.position));
    if (!positions.size) {
      setLastError('Select at least one outlet first.');
      return;
    }
    setSelection(positions);
    void send(positions, targetTemp, massage);
  }, [selection, valve1, send, targetTemp, massage]);

  const stop = useCallback(() => {
    void run(() => api.stopShower());
  }, [run]);

  const adjustTemp = useCallback(
    (next: number) => {
      const clamped = Math.min(valve1.maxTemp, Math.max(valve1.minTemp, next));
      setTargetTemp(clamped);
      refreshSoon();
      // Debounced: arrow taps come in bursts and this controller does not enjoy
      // a request per tap.
      if (tempSendTimer.current) clearTimeout(tempSendTimer.current);
      if (model.showerOn) {
        tempSendTimer.current = setTimeout(() => {
          void send(selection, clamped, massage);
        }, 450);
      }
    },
    [valve1.maxTemp, valve1.minTemp, refreshSoon, model.showerOn, send, selection, massage],
  );

  const changeMassage = useCallback(
    (mode: number) => {
      setMassage(mode);
      refreshSoon();
      if (model.showerOn) void send(selection, targetTemp, mode);
    },
    [model.showerOn, send, selection, targetTemp, refreshSoon],
  );

  const startPreset = useCallback(
    (id: number) => {
      void run(() => api.startPreset(id));
    },
    [run],
  );

  const stopPreset = useCallback(() => {
    void run(() => api.stopPreset());
  }, [run]);

  useEffect(() => () => {
    if (tempSendTimer.current) clearTimeout(tempSendTimer.current);
  }, []);

  return {
    model,
    selection,
    targetTemp,
    massage,
    busy,
    lastError,
    actions: {
      toggleOutlet,
      start,
      stop,
      adjustTemp,
      changeMassage,
      startPreset,
      stopPreset,
    },
  };
}
