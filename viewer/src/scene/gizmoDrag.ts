// Click-versus-drag for the view cube.
//
// Every CAD view cube people already know — Fusion 360, Onshape, SolidWorks —
// can be dragged to orbit as well as clicked to snap. Ours could not: a
// `pointerdown` anywhere on the cube was claimed and turned into a snap, which
// made a 26-region orientation widget into 26 buttons. The tell was that
// dragging the EMPTY corner beside the cube already orbited, because the hit
// test returned nothing there and the event fell through to OrbitControls. Same
// widget, two behaviours, and no way to guess which you would get.
//
// Distinguishing the two is a matter of travel, and travel is arithmetic — no
// camera, no renderer, no DOM. It lives here so it can be tested directly; the
// wiring that feeds it pointer events is in `viewer.ts`.

/**
 * How far a fine pointer may travel and still count as a click, in CSS pixels.
 *
 * Four is the usual figure (Chromium's own drag threshold, and what most
 * canvas UIs settle on). It is small enough that a deliberate drag is a drag
 * from the first few pixels, and large enough to absorb the shake a mouse
 * picks up between press and release.
 */
export const CLICK_SLOP_PX = 4;
/**
 * The same, for a coarse pointer. A finger has no single position — the contact
 * patch's centroid wanders several pixels while the pressure changes, and a
 * stylus adds parallax on top. At 4 px, a good half of taps on a touchscreen
 * come out as one-frame orbits: the view lurches a couple of degrees and the
 * face you asked for never arrives.
 */
export const COARSE_CLICK_SLOP_PX = 10;

/** The slop to allow for the pointer that started the gesture. */
export function dragThresholdPx(pointerType: string | undefined): number {
  return pointerType === 'mouse' || pointerType === undefined
    ? CLICK_SLOP_PX
    : COARSE_CLICK_SLOP_PX;
}

export interface DragProbe {
  /**
   * Feed the pointer's current position. Returns true once the gesture has
   * committed to being a drag.
   */
  moved(x: number, y: number): boolean;
  /** True while the gesture could still end as a click. */
  readonly isClick: boolean;
  /** Furthest the pointer has been from where it started, in CSS pixels. */
  readonly travelPx: number;
}

/**
 * Watch a gesture from where it started and decide, once, whether it is a drag.
 *
 * LATCHING, and that is the whole subtlety. The decision is made against the
 * FURTHEST the pointer has been, never against where it happens to be at
 * release — otherwise a long orbit that finishes back near its start would be
 * treated as a click, and the camera would snap away from the view the user had
 * just spent the drag arriving at. Once a drag, always a drag.
 *
 * Distances are compared squared: same ordering, no square root per move event,
 * and no chance of a rounding difference between the compare and the reported
 * travel.
 */
export function createDragProbe(startX: number, startY: number, thresholdPx: number): DragProbe {
  const limit = thresholdPx * thresholdPx;
  let furthest = 0;
  let dragging = false;

  return {
    moved(x, y) {
      const dx = x - startX;
      const dy = y - startY;
      const distance = dx * dx + dy * dy;
      if (distance > furthest) furthest = distance;
      // `>`, not `>=`: a pointer exactly on the threshold has not passed it, so
      // the boundary belongs to the click.
      if (furthest > limit) dragging = true;
      return dragging;
    },
    get isClick() {
      return !dragging;
    },
    get travelPx() {
      return Math.sqrt(furthest);
    },
  };
}
