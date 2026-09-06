import { useEffect } from "react";

/**
 * Gives the page weight.
 *
 * The wheel stops moving the page directly. Instead it moves a TARGET, and
 * the page is drawn toward that target a fraction of the remaining distance
 * every frame. The result is mass: the page takes a moment to get going,
 * keeps coming for a moment after you stop, and a hard flick pulls against
 * something rather than teleporting. It is not the long, floaty glide of a
 * smooth-scroll library — the pull is short and firmly damped, so it reads
 * as something heavy being dragged rather than something light being
 * thrown.
 *
 * TWO NUMBERS ARE THE WHOLE FEEL, and they are the dial:
 *   PULL  — how much of the remaining distance is covered per frame. Lower
 *           is heavier and laggier. Below about 0.05 it starts to feel
 *           broken rather than weighty; above about 0.2 the weight is gone.
 *   GRIP  — how far one notch of wheel asks for, against what the browser
 *           would have done. Under 1 the page resists; much under 0.7 and
 *           people just think the site is slow.
 *
 * ------------------------------------------------------------------
 * WHAT IT REFUSES TO TOUCH, and why each one matters:
 *
 *   · TOUCH AND COARSE POINTERS. A finger already has real physics and the
 *     browser runs it off the main thread. Intercepting that makes a phone
 *     worse in every case, so this never starts there.
 *   · REDUCED MOTION. Someone who has asked for less movement is not asking
 *     for the page to keep moving after they stop.
 *   · ANY SCROLLER UNDER THE CURSOR THAT CAN STILL TAKE THE SCROLL. This is
 *     the important one. The page has inner scrollers — the form in the
 *     journey band, the text column in the "types of university" deck, the
 *     mega-panel on a short window — and swallowing the wheel over one of
 *     those would break them exactly the way `overscroll-behavior: contain`
 *     used to. So the ancestors of whatever is under the pointer are walked
 *     first, and if any of them can absorb the scroll in the direction
 *     asked for, this stands aside completely and the browser does its
 *     normal thing, chaining included.
 *   · ZOOM. ctrl+wheel is a browser zoom gesture, not a scroll.
 *   · THE KEYBOARD. Space, Page Down, Home, arrow keys and find-on-page all
 *     scroll natively and are left alone. They move the page, this notices
 *     (see the resync below) and adopts the new position rather than
 *     dragging it back.
 * ------------------------------------------------------------------
 *
 * Scroll-driven sections are unaffected: this sets a real scroll position on
 * a real frame, so `scroll` events, `position: sticky`, IntersectionObserver
 * and every getBoundingClientRect in the pinned bands all see exactly what
 * they would have seen anyway — just arriving on a gentler curve.
 */

/** Fraction of the remaining distance covered per frame. See above. */
const PULL = 0.085;
/** How far a notch of wheel asks for, against the browser's own step. */
const GRIP = 0.82;

/* Below this the page has arrived: sub-pixel chasing is invisible and would
   keep a frame loop alive forever. */
const SETTLED = 0.5;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Is there something under the pointer that should get this scroll instead?
 *
 * Walks up from the element the wheel landed on. An ancestor claims the
 * scroll if it is a scroll container, has more content than it can show, AND
 * is not already jammed against the end in the direction being asked for —
 * that last clause is what lets a scroller that has hit its bottom hand the
 * rest of the gesture on to the page.
 */
/* The walk costs a getComputedStyle and a layout read per ancestor, and a
   wheel fires upwards of sixty times a second — left uncached it was doing
   the one thing this component exists to avoid.
   ONLY "NOBODY CLAIMED IT" IS REMEMBERED, and only for the same element and
   the same direction. That answer can go stale only if the DOM changes under
   a stationary cursor, which is rare and self-corrects within the window. A
   claim is never cached: a scroller that has just reached its end has to be
   noticed on the very next notch, or the page would refuse to take over. */
const MEMO_MS = 120;
let memoEl: Element | null = null;
let memoDown = false;
let memoAt = 0;

function innerScrollerClaims(start: EventTarget | null, dy: number): boolean {
  const down = dy > 0;
  const now = performance.now();
  if (
    start === memoEl &&
    down === memoDown &&
    now - memoAt < MEMO_MS
  ) {
    return false;
  }

  let el = start instanceof Element ? start : null;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      const room = el.scrollHeight - el.clientHeight;
      const atTop = el.scrollTop <= 1;
      const atEnd = el.scrollTop >= room - 1;
      if (!((dy < 0 && atTop) || (dy > 0 && atEnd))) return true;
    }
    el = el.parentElement;
  }

  memoEl = start instanceof Element ? start : null;
  memoDown = down;
  memoAt = now;
  return false;
}

export default function HeavyScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /* A mouse or a trackpad, not a finger. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let target = window.scrollY;
    /* The last position we wrote. Anything else on the page moving the
       scroll — a restored position, a jump to an anchor, the keyboard —
       shows up as a scroll event that does not match this, which is how the
       resync below tells the two apart without a flag to keep in step. */
    let written = -1;
    let raf = 0;

    const limit = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const frame = () => {
      const now = window.scrollY;
      const left = target - now;
      if (Math.abs(left) < SETTLED) {
        raf = 0;
        return;
      }
      const next = now + left * PULL;
      written = Math.round(next);
      window.scrollTo(0, next);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      if (innerScrollerClaims(e.target, e.deltaY)) return;

      /* deltaMode is not always pixels: some mice report lines, and page-mode
         exists too. Normalising here is what stops one mouse feeling ten
         times heavier than another. */
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;

      e.preventDefault();
      target = clamp(target + e.deltaY * unit * GRIP, 0, limit());
      start();
    };

    /* Something other than us moved the page: adopt that position rather
       than hauling it back to a target set before the jump. */
    const onScroll = () => {
      if (Math.abs(window.scrollY - written) > 2) target = window.scrollY;
    };

    /* The page can get shorter — an image finishes loading, a section
       collapses — while the target still points past the new bottom. */
    const onResize = () => {
      target = clamp(target, 0, limit());
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
