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
 * THE STYLESHEET MUST COVER IT. `.px-shot` scales the image up to hide the
 * edges, and that scale has to be more than this: at 8% drift the picture
 * moves 4% each way, and a scale of 1.12 gives 6% of overhang. Raise this
 * without raising the scale and the frame will show its own background at
 * the extremes.
 */
const DRIFT = 0.08;

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
  const pending: { el: HTMLElement; y: number }[] = [];
  for (const el of onScreen) {
    const frame = frames.get(el);
    if (!frame) continue;
    const r = frame.getBoundingClientRect();
    const span = vh + r.height;
    if (span <= 0) continue;
    /* 0 as the frame's top edge reaches the bottom of the window, 1 as its
       bottom edge leaves the top. */
    const t = Math.min(1, Math.max(0, (vh - r.top) / span));
    /* +half a drift at the start, -half at the end: the picture is pushed
       DOWN as it enters (showing its upper part) and travels UP as you go,
       which is the direction that reads as the scenery lagging behind. */
    pending.push({ el, y: (1 - 2 * t) * ((r.height * DRIFT) / 2) });
  }

  /* WRITE — and only now. */
  for (const { el, y } of pending) {
    el.style.setProperty("--px", `${y.toFixed(2)}px`);
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
 * Give a photograph its drift. Returns the undo, for the effect cleanup.
 *
 * Refuses quietly — returning a no-op — when the device or the reader has
 * asked not to have it, or when the image has no frame to move inside.
 */
export function registerParallax(img: HTMLElement | null): () => void {
  if (!img || !allowed()) return () => {};
  const frame = img.parentElement;
  if (!frame) return () => {};

  if (frames.size === 0) start();
  frames.set(img, frame);
  img.classList.add("px-shot");
  io?.observe(img);
  schedule();

  return () => {
    io?.unobserve(img);
    frames.delete(img);
    onScreen.delete(img);
    img.classList.remove("px-shot");
    img.style.removeProperty("--px");
    if (frames.size === 0) stop();
  };
}
