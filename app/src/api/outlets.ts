/**
 * Outlet fitting types, 0-23. The controller stores these as the strings
 * "outlet_0" .. "outlet_23"; the interface renders each as an icon. Labels here
 * were derived by reading the controller's own icon set
 * (/images/outlets/N_on.png) — Kohler ships no text for them.
 */
export interface OutletType {
  id: number;
  label: string;
  /** Real Rain, and the multi-head types 9/10, cannot take part in massage. */
  massageCapable: boolean;
}

export const OUTLET_TYPES: Record<number, OutletType> = {
  0: { id: 0, label: 'Not assigned', massageCapable: false },
  1: { id: 1, label: 'Showerhead', massageCapable: true },
  2: { id: 2, label: 'Showerhead', massageCapable: true },
  3: { id: 3, label: 'Two showerheads', massageCapable: true },
  4: { id: 4, label: 'Two showerheads', massageCapable: true },
  5: { id: 5, label: 'Rainhead', massageCapable: true },
  6: { id: 6, label: 'Rainhead', massageCapable: true },
  7: { id: 7, label: 'Handshower', massageCapable: true },
  8: { id: 8, label: 'Handshower', massageCapable: true },
  9: { id: 9, label: 'Bath spout', massageCapable: false },
  10: { id: 10, label: 'Bath spout', massageCapable: false },
  11: { id: 11, label: 'Bodyspray', massageCapable: true },
  12: { id: 12, label: 'Bodyspray', massageCapable: true },
  13: { id: 13, label: 'Bodysprays (2)', massageCapable: true },
  14: { id: 14, label: 'Bodysprays (2)', massageCapable: true },
  15: { id: 15, label: 'Bodysprays (3)', massageCapable: true },
  16: { id: 16, label: 'Bodysprays (3)', massageCapable: true },
  17: { id: 17, label: 'Foot spray', massageCapable: true },
  18: { id: 18, label: 'Foot spray', massageCapable: true },
  19: { id: 19, label: 'Foot sprays (2)', massageCapable: true },
  20: { id: 20, label: 'Foot sprays (2)', massageCapable: true },
  21: { id: 21, label: 'Foot sprays (3)', massageCapable: true },
  22: { id: 22, label: 'Foot sprays (3)', massageCapable: true },
  23: { id: 23, label: 'Real Rain', massageCapable: false },
};

/** "outlet_12" -> 12. Returns 0 for anything unparseable. */
export function parseOutletType(raw: unknown): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return 0;
  const m = /^outlet_(\d+)$/.exec(raw.trim());
  return m ? Number(m[1]) : 0;
}

/**
 * Icon URL for a fitting. These are the controller's own icons rebuilt as flat
 * ink on transparency, one set per theme — see research/tools/make-fittings.py.
 * Unselected fittings come out at reduced opacity because the source "_off" art
 * is dim; selected ones are solid.
 */
export function outletIcon(typeId: number, selected: boolean, theme: 'light' | 'dark'): string {
  return `/fittings/${theme}/${typeId}_${selected ? 'on' : 'off'}.png`;
}
