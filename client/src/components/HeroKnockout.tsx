import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Cuts the hero headline out of the hero photograph, so the picture shows
 * through the letterforms and the words read as a hole in the scrim.
 *
 * WHY THIS NEEDS JAVASCRIPT AT ALL
 *
 * `background-clip: text` paints an element's own background inside its
 * glyphs — but the headline's box is a small rectangle part-way down the
 * hero, while the photo covers the whole section. Give the heading the same
 * image and it gets its own, differently-cropped copy, and the illusion
 * collapses: the letters show a piece of sky that is nowhere near the sky
 * behind them.
 *
 * So the photo's rendered geometry is reproduced exactly and then shifted by
 * the heading's offset inside the hero. `object-fit: cover` is replicated by
 * hand — scale to whichever axis needs more, centre the overflow — because
 * `background-size: cover` on the heading would cover the HEADING, which is
 * the wrong box.
 *
 * `background-attachment: fixed` is the usual shortcut for this and is not
 * used here on purpose: it anchors to the viewport rather than the section,
 * so it only lines up while the hero happens to fill the screen and drifts
 * out of register the moment anything scrolls or the section is not exactly
 * viewport-height.
 *
 * Applied only to the study-abroad pages, and only to the H1 — the body copy
 * stays plain white, where it is legible.
 */

/* Where the effect belongs: the study-abroad landing page and the six
   per-country pages. The service pages are left alone — Career Counselling
   in particular has a headline built from three deliberately different
   treatments, and knocking it out would flatten all of them into one. */
const APPLIES_TO = /^\/study-(abroad|in-)/;

export default function HeroKnockout() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!APPLIES_TO.test(pathname)) return;

    const hero = document.querySelector<HTMLElement>(".dpage-hero");
    const heading = hero?.querySelector<HTMLElement>("h1");
    const img = hero?.querySelector<HTMLImageElement>(".dpage-hero-bg img");
    /* No photo, no knockout. Pages whose image has not been supplied yet
       render a flat panel, and cutting white text out of a flat panel would
       simply delete the headline. */
    if (!hero || !heading || !img) return;

    const clear = () => {
      heading.classList.remove("is-knockout");
    };

    const sync = () => {
      const { naturalWidth: nw, naturalHeight: nh } = img;
      if (!nw || !nh) return clear();

      const h = hero.getBoundingClientRect();
      const t = heading.getBoundingClientRect();
      if (!h.width || !t.width) return clear();

      /* object-fit: cover, longhand */
      const scale = Math.max(h.width / nw, h.height / nh);
      const w = nw * scale;
      const height = nh * scale;
      /* Centre the overflow, then shift by where the heading sits inside
         the hero — that second term is the whole trick. */
      const x = (h.width - w) / 2 - (t.left - h.left);
      const y = (h.height - height) / 2 - (t.top - h.top);

      heading.style.setProperty("--ko-image", `url("${img.currentSrc || img.src}")`);
      heading.style.setProperty("--ko-size", `${w}px ${height}px`);
      heading.style.setProperty("--ko-pos", `${x}px ${y}px`);
      heading.classList.add("is-knockout");
    };

    if (img.complete) sync();
    img.addEventListener("load", sync);
    img.addEventListener("error", clear);

    /* Web fonts land after first paint and change the heading's height and
       line breaks, which moves its top edge — so the geometry is taken
       again once they are in. */
    void document.fonts?.ready.then(sync);

    /* The hero is fluid and the heading rewraps at almost every width, so
       both are watched rather than listening for resize. */
    const ro = new ResizeObserver(sync);
    ro.observe(hero);
    ro.observe(heading);

    return () => {
      img.removeEventListener("load", sync);
      img.removeEventListener("error", clear);
      ro.disconnect();
      clear();
    };
  }, [pathname]);

  return null;
}
