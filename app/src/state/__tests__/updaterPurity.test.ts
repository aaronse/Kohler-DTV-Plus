import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * B01.T06 — a structural guard, not a behavioural one.
 *
 * The runtime tests in useShower.test.ts prove one tap sends one command
 * *today*. This one fails the moment a dispatch is written back inside a state
 * updater anywhere in useShower.ts, including in a code path no test happens to
 * exercise. React invokes those updaters twice under `<StrictMode>`, so a
 * dispatch in one is a doubled valve command, and this controller answers
 * rapid successive valve commands by dropping off the network for hours
 * (research/FIELD-NOTES.md §1).
 */

const source = readFileSync(new URL('../useShower.ts', import.meta.url), 'utf8');

/** Anything that reaches the controller, directly or through the run wrapper. */
const DISPATCH = /\bapi\.|\bsend\s*\(|\brun\s*\(|\brefreshSoon\s*\(/;

/** The setters this file actually owns, taken from its own useState calls. */
function stateSetters(src: string): string[] {
  const names: string[] = [];
  const decl = /const\s*\[\s*\w+\s*,\s*(set\w+)\s*\]\s*=\s*useState/g;
  for (const m of src.matchAll(decl)) names.push(m[1]);
  return names;
}

/** The text of the first argument of the call whose `(` sits at `open`. */
function firstArgument(src: string, open: number): string {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  throw new Error(`unbalanced call starting at ${open}`);
}

interface Updater {
  setter: string;
  body: string;
}

function updaters(src: string): Updater[] {
  const found: Updater[] = [];
  for (const setter of stateSetters(src)) {
    const call = new RegExp(`\\b${setter}\\s*\\(`, 'g');
    for (const m of src.matchAll(call)) {
      const arg = firstArgument(src, (m.index ?? 0) + m[0].length - 1);
      // A value argument is fine — only the function form gets double-invoked.
      if (/=>|\bfunction\b/.test(arg)) found.push({ setter, body: arg });
    }
  }
  return found;
}

describe('useShower state updaters', () => {
  it('finds the setters it is meant to be checking', () => {
    // Guards the guard: if useState is ever destructured differently this test
    // would silently pass by checking nothing.
    expect(stateSetters(source)).toEqual(
      expect.arrayContaining(['setStatus', 'setSelection', 'setTargetTemp', 'setMassage']),
    );
  });

  it('issue no commands', () => {
    const impure = updaters(source).filter((u) => DISPATCH.test(u.body));
    expect(
      impure.map((u) => `${u.setter}: ${u.body.trim().replace(/\s+/g, ' ').slice(0, 120)}`),
    ).toEqual([]);
  });
});
