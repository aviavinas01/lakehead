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
 *     used to. So the pointer's nearest scroll container is consulted
 *     first, and if it can absorb the scroll in the direction asked for,
 *     this stands aside completely and the browser does its normal thing,
 *     chaining included. That lookup is cached per element — see
 *     nearestScroller for why that mattered more than it sounds.
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
 * The nearest scrollable ancestor of an element — remembered, per element,
 * for as long as the element lives.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS A CACHE AND NOT A WALK. The first version walked the ancestor
 * chain on every wheel event, calling getComputedStyle at each level, with a
 * short time-based memo in front of it. The memo was keyed on the exact
 * element under the pointer — and that is the one thing that does not hold
 * still while you scroll, because the page is moving underneath a stationary
 * cursor. Crossing a card, its body and its paragraph are three different
 * targets, so the memo missed on almost every event and the full walk ran
 * again.
 *
 * On a page like /services/test-preparation that came to roughly ten
 * getComputedStyle calls per wheel event, at up to a hundred events a
 * second. Worse, the parallax writes a style every frame, so the style tree
 * was always dirty when those calls landed — and getComputedStyle against a
 * dirty tree forces a full style recalculation then and there. That is a
 * thousand forced recalculations a second, spent proving something the page
 * could have answered once: that page has no scroll containers on it at all,
 * so not one of those walks could ever have claimed anything.
 *
 * Now the answer is computed once per element and kept. The hot path is a
 * WeakMap lookup. The walk that fills it also caches every node it passes,
 * so once one card has been crossed its whole ancestor chain is known and
 * the next element terminates after a step or two.
 * ------------------------------------------------------------------
 *
 * WeakMap, so nothing here keeps a detached node alive after a navigation.
 * `undefined` means "not looked at yet"; `null` means "looked, found none".
 */
let scrollerOf = new WeakMap<Element, Element | null>();

function nearestScroller(start: Element): Element | null {
  const known = scrollerOf.get(start);
  if (known !== undefined) return known;

  const chain: Element[] = [];
  let el: Element | null = start;
  let found: Element | null = null;

  while (el && el !== document.body && el !== document.documentElement) {
    const cached = scrollerOf.get(el);
    if (cached !== undefined) {
      found = cached;
      break;
    }
    chain.push(el);
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") {
      found = el;
      break;
    }
    el = el.parentElement;
  }

  /* Everything passed on the way up shares the answer — including, when the
     loop stopped on one, the scroller itself, whose nearest scroller is
     itself. */
  for (const node of chain) scrollerOf.set(node, found);
  return found;
}

/** Can this container still take scroll in this direction? */
function canTake(el: Element, dy: number): boolean {
  const room = el.scrollHeight - el.clientHeight;
  if (room <= 1) return false;
  return dy < 0 ? el.scrollTop > 1 : el.scrollTop < room - 1;
}

/**
 * Is there something under the pointer that should get this scroll instead?
 *
 * Layout is read only where a scroll container actually exists — on most of
 * the site that is nowhere, and the whole check costs one WeakMap hit. When
 * the nearest container is jammed against its end the search carries on
 * outward, so a scroller that has hit its bottom hands the rest of the
 * gesture on rather than swallowing it.
 */
function innerScrollerClaims(start: EventTarget | null, dy: number): boolean {
  let el: Element | null = start instanceof Element ? start : null;
  while (el) {
    const scroller = nearestScroller(el);
    if (!scroller) return false;
    if (canTake(scroller, dy)) return true;
    el = scroller.parentElement;
  }
  return false;
}

export default function HeavyScroll() {
  /* ------------------------------------------------------------------
     FLAGGING THE PAGE WHILE IT MOVES, so hover effects stop firing at a
     cursor that is not choosing anything.

     Scrolling drags a stationary pointer across card after card, and each
     one it crosses starts its hover transition. On the home page that
     includes a 7px blur on a full-size photograph — animating a blur is
     among the most expensive things CSS can be asked to do, it repaints the
     element on every frame at a new radius, and three or four tiles can be
     mid-animation at once. That is the drag.

     `data-scrolling` on <html> lets the stylesheet turn pointer events off
     across <main> for as long as the page is moving. No hover matches, so
     nothing transitions and nothing repaints; the flag clears a moment
     after the page settles and hover behaves normally again.

     It is a SEPARATE EFFECT from the damping below because it must run even
     where the damping does not: someone on reduced motion still has a
     pointer and still scrolls past cards. Only the fine-pointer test is
     shared, and for the same reason — a finger has no hover to suppress.
     ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    let idle = 0;

    const onScroll = () => {
      root.dataset.scrolling = "";
      clearTimeout(idle);
      /* Long enough that a slow, continuous scroll does not flicker the
         flag off between events, short enough that hover feels immediate
         again once you stop. */
      idle = window.setTimeout(() => delete root.dataset.scrolling, 140);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
      delete root.dataset.scrolling;
    };
  }, []);

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

    /* A breakpoint can turn a plain box into a scroll container — .tst-body
       and .nsx-consult only scroll above 981px — so the remembered answers
       cannot outlive a resize. Throwing the whole map away is right: it
       refills itself lazily, and a resize is not a moment anyone is judging
       scroll smoothness. */
    const onResizeAll = () => {
      scrollerOf = new WeakMap();
      onResize();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResizeAll);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResizeAll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
