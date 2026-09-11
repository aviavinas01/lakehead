import { useEffect } from "react";
import { whenElement } from "../../lib/whenElement";
import { useLocation } from "react-router-dom";
import { armReveals } from "../../lib/reveal";

/**
 * Fades section headings and their lead paragraphs up as they arrive, on
 * every page that has opted into the ruled treatment.
 *
 * ONE COMPONENT FOR THE WHOLE SITE, mounted once in Layout. The alternative
 * was the same fifteen-line effect copied into sixteen pages, which is
 * fifteen chances for one of them to drift — and the thing it would drift
 * into is content that never appears.
 *
 * A page opts in by putting `dpage-ruled` on its <article>; this looks for
 * that and does nothing if it is not there. That is how the study-abroad
 * pages stay out of it: they simply never carry the class.
 *
 * WHY IT RE-RUNS ON EVERY NAVIGATION. React Router swaps the article
 * wholesale, so the element this armed last time is gone and the new one has
 * never been looked at. Keyed on `pathname` for exactly that.
 *
 * WHAT IT DOES NOT TOUCH. Headings and leads only — not cards, lists or
 * body copy. Four of these pages already run reveals of their own over that
 * content, and a second pass would have the same elements arriving twice.
 *
 * The hiding CSS is gated behind `data-reveal-armed`, which armReveals sets
 * and nothing else does. If this component never runs — an error earlier in
 * the tree, an old browser — every heading is simply visible.
 */
export default function PageReveal() {
  const { pathname } = useLocation();

  /* WAITS FOR THE PAGE rather than asking once. Route-level code splitting
     means that on the first visit to a lazily-loaded route this effect runs
     while the Suspense fallback is still on screen — the query would find
     nothing and the reveal would silently never happen again on exactly the
     pages that have one. When the element is already there, whenElement runs
     synchronously and this behaves exactly as it did before. */
  useEffect(
    () =>
      whenElement<HTMLElement>(".dpage-ruled", (root) =>
        armReveals(root, ".dpage-title, .dpage-section-lead")
      ),
    [pathname]
  );

  return null;
}
