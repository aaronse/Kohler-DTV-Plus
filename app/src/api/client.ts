import { apiUrl } from './config';
import type { StatusResponse } from './types';

export class KohlerError extends Error {}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new KohlerError(`Bad response from ${url}: ${text.slice(0, 120)}`);
  }
  if (!res.ok) {
    const msg = (data as { error?: string })?.error ?? res.statusText;
    throw new KohlerError(msg);
  }
  return data as T;
}

export function getStatus(signal?: AbortSignal): Promise<StatusResponse> {
  return jsonFetch<StatusResponse>(apiUrl('/api/status'), { signal });
}

/** Fire an allowlisted .cgi command through the proxy. */
export function command(
  name: string,
  params: Record<string, string | number> = {},
): Promise<{ ok: boolean; body?: string }> {
  return jsonFetch(apiUrl(`/api/command/${name}`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export interface ShowerCommand {
  valveNum: 1 | 2;
  valve1Outlets: string;
  valve1Massage: number;
  valve1Temp: number;
  valve2Outlets: string;
  valve2Massage: number;
  valve2Temp: number;
}

/**
 * Start / update water flow.
 *
 * The controller takes the *complete* desired state on every call — outlets,
 * massage mode and temperature for both valves — so this is equally the "start",
 * "change outlets" and "change temperature" command. Mirrors quick_shower() in
 * the controller's own js/control.js.
 */
export function quickShower(cmd: ShowerCommand) {
  return command('quick_shower.cgi', {
    valve_num: cmd.valveNum,
    valve1_outlet: cmd.valve1Outlets,
    valve1_massage: cmd.valve1Massage,
    valve1_temp: cmd.valve1Temp,
    valve2_outlet: cmd.valve2Outlets,
    valve2_massage: cmd.valve2Massage,
    valve2_temp: cmd.valve2Temp,
  });
}

export const stopShower = () => command('stop_shower.cgi');
export const startPreset = (user: number) => command('start_user.cgi', { user });
export const stopPreset = () => command('stop_user.cgi');
export const steamOn = (temp: number, time: number) => command('steam_on.cgi', { temp, time });
export const steamOff = () => command('steam_off.cgi');
export const musicOn = (volume: number) => command('music_on.cgi', { volume });
export const musicOff = (volume: number) => command('music_off.cgi', { volume });
export const lightOn = (module: number, intensity: number) =>
  command('light_on.cgi', { module, intensity });
export const lightOff = (module: number) => command('light_off.cgi', { module });

/** save_variable.cgi index 43 — the amplifier's stored volume. */
export const setVolume = (value: number) => command('save_variable.cgi', { index: 43, value });
