/**
 * Parallax for the editorial photographs — the picture drifts inside its
 * frame as the frame crosses the window, so scrolling down slides the image
 * gently upward and scrolling back reverses it.
 *
 * ONE ENGINE FOR EVERY PICTURE ON THE PAGE. Not one listener each. A page
 * carries up to eight of these, and eight scroll handlers each running their
 * own requestAnimationFrame is eight times the work for the same result —
 * on a site where scroll cost is already the thing we keep chasing. Images
 * register here; the first one to arrive starts the single listener and the
 * last one to leave stops it.
 *
 * ------------------------------------------------------------------
 * WHAT KEEPS IT CHEAP, in order of how much it matters:
 *
 *  1. ONLY WHAT IS ON SCREEN MOVES. An IntersectionObserver keeps the
 *     active set; a photograph three sections down is not measured at all.
 *     In practice that means one or two images per frame, not eight.
 *
 *  2. ALL READS, THEN ALL WRITES. Every getBoundingClientRect happens
 *     first and the results are held; only then is a style touched. Reading
 *     a rect after writing a style forces the browser to redo layout there
 *     and then, so a naive read-write-read-write loop costs one forced
 *     reflow PER IMAGE. This costs none.
 *
 *  3. THE FRAME IS MEASURED, NOT THE PICTURE. The picture carries the
 *     transform, so its own rect already includes the offset we gave it —
 *     feeding that back in would make the drift compound and run away. Its
 *     parent has no transform, so it is the honest ruler.
 *
 *  4. ONE CUSTOM PROPERTY PER IMAGE PER FRAME. The stylesheet composes the
 *     translate with the scale; nothing here builds a transform string.
 * ------------------------------------------------------------------
 *
 * IT DOES NOT RUN ON TOUCH. Touch scrolling is handled off the main thread,
 * and pulling it back on to move a photograph is the classic way to make a
 * phone stutter. Nor under `prefers-reduced-motion` — drifting scenery is
 * exactly what that setting is asking us not to do. In both cases the
 * pictures simply sit still, which is what they did before any of this.
 */

/**
 * Total drift as a share of the frame's height — the picture travels half
 * this above centre and half below across a full pass through the window.
 *
 * THE ZOOM BELOW MUST COVER IT. The picture is enlarged to hide its edges,
 * and that enlargement has to be more than this: at 20% drift the picture
 * moves 10% each way, and a zoom of 1.3 leaves 15% of overhang. Raise this
 * without raising the zoom and the frame will show its own background at
 * the extremes.
 *
 * It started at 8% against a 1.12 zoom, which was too polite to see —
 * about sixteen pixels on a normal photograph, across a whole screen of
 * scrolling. The point of the effect is that the picture visibly lags the
 * page, and at that size nobody could tell it was moving at all.
 */
export const DRIFT = 0.2;

/**
 * How far the picture is enlarged to make room for that drift, and the
 * number the stylesheet's `.px-shot` scale must match.
 *
 * Exported because HeroKnockout has to reproduce this transform exactly —
 * it cuts the headline out of the hero photograph, and a photograph that
 * moves under a cut-out that does not is worse than no effect at all.
 */
export const ZOOM = 1.3;

/** The image, and the untransformed box it is measured against. */
const frames = new Map<HTMLElement, HTMLElement>();
const onScreen = new Set<HTMLElement>();

let io: IntersectionObserver | null = null;
let raf = 0;

function allowed(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function paint() {
  raf = 0;
  const vh = window.innerHeight;

  /* READ — every measurement first, nothing written yet. */
  const pending: { el: HTMLElement; p: number; y: number }[] = [];
  for (const el of onScreen) {
    const frame = frames.get(el);
    if (!frame) continue;
    const r = frame.getBoundingClientRect();
    const span = vh + r.height;
    if (span <= 0) continue;
    /* 0 as the frame's top edge reaches the bottom of the window, 1 as its
       bottom edge leaves the top. */
    const t = Math.min(1, Math.max(0, (vh - r.top) / span));
    /* +1 as the frame enters, 0 dead centre, -1 as it leaves. The drift is
       this times half a drift's worth of pixels: the picture is pushed DOWN
       as it enters (showing its upper part) and travels UP as you go, which
       is the direction that reads as the scenery lagging behind. */
    const p = 1 - 2 * t;
    pending.push({ el, p, y: p * ((r.height * DRIFT) / 2) });
  }

  /* WRITE — and only now. */
  for (const { el, p, y } of pending) {
    el.style.setProperty("--px", `${y.toFixed(2)}px`);
    /* The same number unscaled, for anything that wants to lean on the
       picture's progress without being in pixels. The stylesheet multiplies
       it by an angle to tilt the frame — see --px-tilt on .px-shot. It is
       written for every picture and costs a property set; whether it does
       anything is decided entirely in CSS, per element. */
    el.style.setProperty("--px-t", p.toFixed(4));
  }
}

const schedule = () => {
  if (!raf) raf = requestAnimationFrame(paint);
};

function start() {
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const img = e.target as HTMLElement;
        if (e.isIntersecting) onScreen.add(img);
        else onScreen.delete(img);
      }
      schedule();
    },
    /* A little slack, so a picture is already in position by the time its
       first pixel shows rather than snapping into its offset on arrival. */
    { rootMargin: "120px 0px" }
  );
}

function stop() {
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  io?.disconnect();
  io = null;
  onScreen.clear();
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

/**
 * Give a photograph its drift. Returns the undo, or NULL if it declined —
 * because the device or the reader has asked not to have it, or the image
 * has no frame to move inside.
 *
 * THE CALLER PUTS `px-shot` ON THE ELEMENT, NOT THIS. That is why the answer
 * is null rather than a no-op: the caller has to be able to tell.
 *
 * This used to add the class itself, with `classList.add`, and that was a
 * real bug rather than a matter of taste. React owns the `className`
 * attribute of an element it renders, and it does not merge — when the
 * attribute's value changes between renders it WRITES THE WHOLE STRING. Any
 * class added imperatively is gone at that moment. The Shot component gained
 * a loading shimmer that lives in its className, so every picture dropped
 * `px-shot` the instant it finished loading, silently, everywhere, and kept
 * receiving `--px` updates for a transform rule that no longer matched it.
 */
export function registerParallax(img: HTMLElement | null): (() => void) | null {
  if (!img || !allowed()) return null;
  const frame = img.parentElement;
  if (!frame) return null;

  if (frames.size === 0) start();
  frames.set(img, frame);
  io?.observe(img);
  schedule();

  return () => {
    io?.unobserve(img);
    frames.delete(img);
    onScreen.delete(img);
    img.style.removeProperty("--px");
    img.style.removeProperty("--px-t");
    if (frames.size === 0) stop();
  };
}
