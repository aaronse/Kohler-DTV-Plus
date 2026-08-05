/**
 * A minimal stand-in for React's hook dispatcher.
 *
 * `useShower` can only be exercised by calling it, and calling it needs
 * something to answer `useState`/`useEffect`/`useMemo`/`useRef`/`useCallback`.
 * A React renderer would do that, but adding one is a new dependency this work
 * is not authorised to take, so this is the smallest thing that does the job:
 * ~120 lines, no DOM, no scheduler, no concurrent rendering.
 *
 * The one behaviour it models deliberately is the one under test.
 * `<StrictMode>` in a development build invokes every function passed to a
 * state setter **twice** with the same previous value and keeps the second
 * result — React does this precisely to make an impure updater visible. With
 * `strict: true` (the default) this harness does the same, and
 * `isInsideUpdater()` reports whether the caller is currently running inside
 * such an updater, which is how the purity check is made.
 *
 * What it does NOT model: double-invoked component bodies, double-mounted
 * effects, batching, priorities, or suspense. Anything relying on those is
 * outside what this harness can honestly prove.
 */

type Deps = readonly unknown[] | undefined;

interface Slot {
  value?: unknown;
  deps?: Deps;
  ran?: boolean;
  cleanup?: (() => void) | undefined;
}

let slots: Slot[] = [];
let cursor = 0;
let pendingEffects: Array<() => void> = [];
let dirty = false;
let strict = true;
let updaterDepth = 0;

/** True while a function passed to a state setter is executing. */
export function isInsideUpdater(): boolean {
  return updaterDepth > 0;
}

function slotAt(create: () => Slot): Slot {
  const i = cursor++;
  const existing = slots[i] as Slot | undefined;
  if (existing) return existing;
  const slot = create();
  slots[i] = slot;
  return slot;
}

function changed(prev: Deps, next: Deps): boolean {
  if (!prev || !next) return true;
  if (prev.length !== next.length) return true;
  return next.some((d, i) => !Object.is(d, prev[i]));
}

export function useState<S>(initial: S | (() => S)): [S, (next: S | ((prev: S) => S)) => void] {
  const slot = slotAt(() => ({
    value: typeof initial === 'function' ? (initial as () => S)() : initial,
  }));

  const set = (next: S | ((prev: S) => S)) => {
    let value: S;
    if (typeof next === 'function') {
      const update = next as (prev: S) => S;
      const prev = slot.value as S;
      updaterDepth++;
      try {
        value = update(prev);
        // StrictMode's double-invocation: same input, second result wins.
        if (strict) value = update(prev);
      } finally {
        updaterDepth--;
      }
    } else {
      value = next;
    }
    if (!Object.is(value, slot.value)) {
      slot.value = value;
      dirty = true;
    }
  };

  return [slot.value as S, set];
}

export function useRef<T>(initial: T): { current: T } {
  return slotAt(() => ({ value: { current: initial } })).value as { current: T };
}

export function useMemo<T>(factory: () => T, deps: Deps): T {
  const slot = slotAt(() => ({}));
  if (!slot.ran || changed(slot.deps, deps)) {
    slot.ran = true;
    slot.deps = deps;
    slot.value = factory();
  }
  return slot.value as T;
}

export function useCallback<T>(fn: T, deps: Deps): T {
  return useMemo(() => fn, deps);
}

export function useEffect(effect: () => void | (() => void), deps?: Deps): void {
  const slot = slotAt(() => ({}));
  if (!slot.ran || changed(slot.deps, deps)) {
    slot.ran = true;
    slot.deps = deps;
    pendingEffects.push(() => {
      slot.cleanup?.();
      const cleanup = effect();
      slot.cleanup = typeof cleanup === 'function' ? cleanup : undefined;
    });
  }
}

export interface Harness<T> {
  /** The hook's most recent return value. */
  readonly current: T;
  /**
   * Run `fn` (typically an action), then re-render and drain effects and
   * promise callbacks until the hook settles.
   */
  flush(fn?: () => void): Promise<void>;
  unmount(): void;
}

export function mountHook<T>(hook: () => T, options: { strict?: boolean } = {}): Harness<T> {
  slots = [];
  cursor = 0;
  pendingEffects = [];
  dirty = false;
  strict = options.strict ?? true;

  let current!: T;
  const pass = () => {
    cursor = 0;
    current = hook();
  };

  const settle = () => {
    for (let i = 0; i < 100; i++) {
      if (pendingEffects.length) {
        const effects = pendingEffects;
        pendingEffects = [];
        for (const run of effects) run();
        continue;
      }
      if (dirty) {
        dirty = false;
        pass();
        continue;
      }
      return;
    }
    throw new Error('hook harness did not settle after 100 passes');
  };

  pass();
  settle();

  return {
    get current() {
      return current;
    },
    async flush(fn) {
      fn?.();
      settle();
      // Actions and the poll are async; drain the microtask queue between
      // passes so their continuations land before the next render.
      for (let i = 0; i < 20; i++) {
        await Promise.resolve();
        settle();
      }
    },
    unmount() {
      for (const slot of slots) slot.cleanup?.();
      slots = [];
      pendingEffects = [];
    },
  };
}
