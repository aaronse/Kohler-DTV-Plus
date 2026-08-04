import { blendPose, type CameraPose } from './cameraFit';

// Animated camera moves for the view gizmo.
//
// Clicking a cube face used to teleport the camera. That is disorienting for
// the reason a cut is disorienting in film: the viewer has no way to connect
// the two framings, so they have to re-find the part every time. Turning to the
// new view keeps the relationship visible, and costs a third of a second.
//
// The tween owns no camera and no clock. It is handed poses and a timestamp and
// returns a pose, which is what makes the easing and the blend testable without
// a WebGL context — see cameraTween.test.ts.

/** How long a gizmo-driven move takes, in milliseconds. */
export const CAMERA_TWEEN_MS = 340;

/**
 * Easing, with the two ends independently adjustable.
 *
 *     f(t) = t^in / (t^in + (1-t)^out)
 *
 * A rational easing rather than a cubic Bezier: it needs no root-finding, is
 * monotonic for any positive exponents, and pins f(0)=0 and f(1)=1 exactly, so
 * a move always starts and ends where it should however these are tuned.
 *
 *   in  = out = 1   linear
 *   in  = out       symmetric S-curve, sharper as the numbers rise
 *   in  < out       leaves quickly, arrives gently   <- what is wanted here
 *   in  > out       creeps away, rushes the arrival
 *
 * Defaults lean that way on purpose. A move that hesitates before starting
 * reads as lag no matter how quick the rest of it is, so the ease-IN is kept
 * mild and the ease-OUT does the work of making the landing soft.
 */
export const CAMERA_EASE_IN = 1.35;
export const CAMERA_EASE_OUT = 2.6;

export function ease(t: number, easeIn: number, easeOut: number): number {
  if (!(t > 0)) return 0;
  if (t >= 1) return 1;
  const rise = Math.pow(t, easeIn);
  const fall = Math.pow(1 - t, easeOut);
  return rise / (rise + fall);
}

export interface CameraTweenOptions {
  durationMs?: number;
  easeIn?: number;
  easeOut?: number;
}

export interface CameraTween {
  /**
   * Aim at `to`, starting from `from`. Called again mid-flight, the move
   * restarts from wherever it currently is, so an impatient second click turns
   * from the current framing instead of snapping back to re-run the first move.
   */
  start(from: CameraPose, to: CameraPose, now: number): void;
  /** The pose for this frame, or null when nothing is running. */
  sample(now: number): CameraPose | null;
  cancel(): void;
  readonly active: boolean;
}

export function createCameraTween(options: CameraTweenOptions = {}): CameraTween {
  const duration = options.durationMs ?? CAMERA_TWEEN_MS;
  const easeIn = options.easeIn ?? CAMERA_EASE_IN;
  const easeOut = options.easeOut ?? CAMERA_EASE_OUT;

  let from: CameraPose | null = null;
  let to: CameraPose | null = null;
  let startedAt = 0;

  return {
    start(nextFrom, nextTo, now) {
      // Duration 0 is a supported setting, not an edge case: it is how reduced
      // motion turns the animation off without a second code path.
      if (duration <= 0) {
        from = null;
        to = nextTo;
        startedAt = now;
        return;
      }
      from = nextFrom;
      to = nextTo;
      startedAt = now;
    },
    sample(now) {
      if (!to) return null;
      if (!from || duration <= 0) {
        const landed = to;
        to = null;
        return landed;
      }
      const elapsed = (now - startedAt) / duration;
      if (elapsed >= 1) {
        const landed = to;
        from = null;
        to = null;
        // Return the destination itself, never a blend at t=1. Slerp and lerp
        // are exact at the endpoints, but returning the real pose means the
        // final frame cannot be off by a rounding error from the view the user
        // asked for — which would otherwise persist until they moved again.
        return landed;
      }
      return blendPose(from, to, ease(elapsed, easeIn, easeOut));
    },
    cancel() {
      from = null;
      to = null;
    },
    get active() {
      return to !== null;
    },
  };
}
