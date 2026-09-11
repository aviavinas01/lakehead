/**
 * Run something once an element exists, rather than only if it already does.
 *
 * ------------------------------------------------------------------
 * WHY THIS IS NEEDED. Several effects here react to a navigation by reaching
 * into the DOM for the page that navigation landed on — PageReveal looks for
 * `.dpage-ruled`, HeroKnockout for `.dpage-hero`. Both were written when
 * every route was in the main bundle, so by the time an effect keyed on
 * `pathname` ran, the page was already mounted and the query always found it.
 *
 * Route-level code splitting breaks that assumption. On the first visit to a
 * lazily-loaded route the effect runs while the Suspense fallback is on
 * screen, the query returns null, and the effect gives up — so the reveal
 * animation and the hero knockout silently stop happening on exactly the
 * pages that have them. Not a crash; a feature that quietly disappears,
 * which is worse because nobody notices for months.
 *
 * So the query is retried across a few frames instead of being asked once.
 * The same shape as `restore()` in ScrollManager, and for the same reason:
 * the DOM a moment after a navigation is not the DOM a moment later.
 *
 * THE BUDGET IS THE POINT. Without one this would poll forever on every page
 * that legitimately has no such element — which is most of them — burning a
 * frame callback for the life of the visit. With one, a page that never
 * grows the element costs a few frames and stops.
 * ------------------------------------------------------------------
 */

/** How long to keep looking. Generous next to a cached chunk, brief next to
    a visit. A slow first load past this simply renders without the effect,
    which is the same graceful degradation as before. */
const DEFAULT_BUDGET_MS = 3000;

export function whenElement<T extends Element>(
  selector: string,
  /** Run once the element appears. May return its own cleanup. */
  run: (el: T) => (() => void) | void,
  budgetMs: number = DEFAULT_BUDGET_MS
): () => void {
  /* Nothing to look in — the effect is a no-op rather than a crash. */
  if (typeof document === "undefined") return () => {};

  let frame = 0;
  let stopped = false;
  let inner: (() => void) | void;

  const deadline =
    (typeof performance !== "undefined" ? performance.now() : Date.now()) +
    budgetMs;

  const look = () => {
    if (stopped) return;

    const found = document.querySelector<T>(selector);
    if (found) {
      inner = run(found);
      return;
    }

    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    if (now > deadline) return;

    frame = requestAnimationFrame(look);
  };

  /* Synchronously first, so a route that is already mounted behaves exactly
     as it did before this existed — no extra frame, no visible difference. */
  look();

  return () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    inner?.();
  };
}
