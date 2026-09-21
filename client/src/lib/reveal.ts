/**
 * Scroll-reveal, for the pages that use it.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS NOT AN IntersectionObserver ANY MORE (for the guides)
 *
 * The destination guides left a ~670px white hole in the middle of the copy
 * where a photograph should have been. The photograph was present, the file
 * was on disk, and the CSS was correct — the element simply never received
 * its `is-in` class, so it kept `clip-path: inset(0 0 100% 0)` and stayed
 * invisible while still occupying its full height.
 *
 * An IntersectionObserver reports when an element's intersection with the
 * root CHANGES. Several ordinary things move an element from below the
 * viewport to above it between two frames — an anchor jump from the contents
 * rail, a fast scroll, a scrollbar drag, and ScrollManager restoring your
 * position on reload or Back. In those cases the intersection never changes
 * from zero, so no callback ever fires, so the element stays hidden for the
 * life of the page. Widening the observer's root upward helps with some of
 * those and is still used by the other pages, but it is a patch on a
 * mechanism whose failure mode is "content is permanently invisible" — and
 * that is the wrong failure mode to build a page out of.
 *
 * So the guides use a direct sweep instead: on every scroll frame, any
 * element still waiting whose top has come above the fold is revealed.
 * Elements are dropped from the pending list as they are revealed and the
 * listeners detach once it is empty, so this costs nothing after the first
 * read of the page. It cannot skip anything, because it asks "where is this
 * now" rather than "did something change".
 *
 * THE SECOND HALF MATTERS AS MUCH: nothing is hidden until this code runs.
 * The CSS that hides a revealable element is gated behind
 * `[data-reveal-armed]`, which is set here and only here. If this module
 * never runs — a JS error earlier in the page, an old browser, anything —
 * the content is simply visible. CSS should never hide something that only
 * JavaScript can bring back.
 * ------------------------------------------------------------------
 */

/**
 * How far down the viewport an element's top must come before it reveals.
 * Just short of the bottom edge, so a card starts moving as it appears
 * rather than after it has fully arrived.
 */
const TRIGGER = 0.94;

/**
 * Reveals `[data-reveal]` elements inside `root` as they come into view.
 * Returns a cleanup function.
 */
export function armReveals(root: HTMLElement, selector = "[data-reveal]"): () => void {
  let pending = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (pending.length === 0) return () => {};

  /* Only now does the CSS start hiding anything. */
  root.setAttribute("data-reveal-armed", "");

  const showAll = () => {
    pending.forEach((n) => n.classList.add("is-in"));
    pending = [];
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showAll();
    return () => root.removeAttribute("data-reveal-armed");
  }

  let frame = 0;

  const sweep = () => {
    frame = 0;
    const limit = window.innerHeight * TRIGGER;

    /* Every measurement first, then every class change. Interleaving them
       would force a layout per element instead of one for the batch. */
    const tops = pending.map((n) => n.getBoundingClientRect().top);
    const waiting: HTMLElement[] = [];
    pending.forEach((node, i) => {
      if (tops[i] < limit) node.classList.add("is-in");
      else waiting.push(node);
    });
    pending = waiting;

    if (pending.length === 0) detach();
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(sweep);
  };

  let attached = true;
  const detach = () => {
    if (!attached) return;
    attached = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  sweep();
  if (pending.length > 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  return () => {
    detach();
    root.removeAttribute("data-reveal-armed");
  };
}

/**
 * Observer settings for the pages that still use an IntersectionObserver —
 * About, Visa Guidance, Student Accommodation and Admission Guidance.
 *
 * The root is extended far upward so that anything already scrolled past
 * counts as intersecting and reveals on the first callback, which is what
 * stops an anchor jump or a restored scroll position leaving elements above
 * you hidden. Those pages reveal ordinary cards rather than a half-screen
 * photograph, so a missed one is a smaller failure than it is on a guide —
 * but the same sweep would suit them, and moving them over is a small job
 * whenever it is wanted.
 */
const ABOVE = "100000px";

export function revealInit(
  threshold: number,
  bottomMargin: string
): IntersectionObserverInit {
  return { threshold, rootMargin: `${ABOVE} 0px ${bottomMargin} 0px` };
}
