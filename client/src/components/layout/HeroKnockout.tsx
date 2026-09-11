import { useEffect } from "react";
import { whenElement } from "../../lib/whenElement";
import { useLocation } from "react-router-dom";
import { ZOOM } from "../../lib/parallax";

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
 *
 * ------------------------------------------------------------------
 * IT HAS TO FOLLOW THE PARALLAX. The hero photograph drifts inside its frame
 * as the page scrolls (see lib/parallax), and a cut-out that stays put while
 * the picture behind it moves is worse than no cut-out at all — the letters
 * fill with a piece of sky that is visibly not the sky around them.
 *
 * So the geometry is split in two. `sync` does the measuring and runs only
 * when something has actually changed size. `place` takes those cached
 * numbers, adds however far the picture has drifted, and writes two custom
 * properties — no layout read at all, which is what makes it safe to run on
 * every scrolled frame.
 *
 * The drift is read straight off the image's own inline style, where the
 * parallax engine puts it. That is a string read from an inline declaration,
 * not a computed style, so it forces nothing. When the parallax is not
 * running — touch, reduced motion — the class is absent, the offset reads
 * empty, and this falls back to exactly the geometry it always used.
 * ------------------------------------------------------------------
 */

/* Where the effect belongs: the study-abroad landing page and the six
   per-country pages. The service pages are left alone — Career Counselling
   in particular has a headline built from three deliberately different
   treatments, and knocking it out would flatten all of them into one. */
const APPLIES_TO = /^\/study-(abroad|in-)/;

export default function HeroKnockout() {
  const { pathname } = useLocation();

  /* WAITS FOR THE HERO rather than asking once — the destination pages this
     applies to are lazily loaded, so on a first visit this effect runs while
     the Suspense fallback is on screen and a single query would find nothing.
     When the hero is already mounted, whenElement runs synchronously and the
     behaviour is identical to before. */
  useEffect(() => {
    if (!APPLIES_TO.test(pathname)) return;

    return whenElement<HTMLElement>(".dpage-hero", (hero) => {
    const heading = hero.querySelector<HTMLElement>("h1");
    const img = hero.querySelector<HTMLImageElement>(".dpage-hero-bg img");
    /* No photo, no knockout. Pages whose image has not been supplied yet
       render a flat panel, and cutting white text out of a flat panel would
       simply delete the headline. */
    if (!heading || !img) return;

    const clear = () => {
      heading.classList.remove("is-knockout");
    };

    /* Everything `place` needs, measured once and kept. */
    let box = { w: 0, h: 0, dx: 0, dy: 0 };

    /* No layout read in here — only arithmetic on the cached box plus the
       drift the parallax has already written. Cheap enough for every frame. */
    const place = () => {
      if (!box.w) return;
      /* The picture is enlarged about its own centre and then slid, so the
         cut-out has to be enlarged about the same centre and slid to match.
         With zoom 1 and no drift this reduces to the plain centred cover
         crop, which is what it was before any of this. */
      const zoom = img.classList.contains("px-shot") ? ZOOM : 1;
      const drift = parseFloat(img.style.getPropertyValue("--px")) || 0;

      const w = box.w * zoom;
      const height = box.h * zoom;

      /* The enlargement is about the picture's own centre, which is the
         hero's centre — so its left edge is the centre less half the
         enlarged width, and likewise vertically, plus the drift. With zoom 1
         and no drift this is the plain centred cover crop the effect always
         used. */
      const px = box.dx - w / 2;
      const py = box.dy - height / 2 + drift;

      heading.style.setProperty("--ko-size", `${w}px ${height}px`);
      heading.style.setProperty("--ko-pos", `${px}px ${py}px`);
    };

    const sync = () => {
      const { naturalWidth: nw, naturalHeight: nh } = img;
      if (!nw || !nh) return clear();

      const h = hero.getBoundingClientRect();
      const t = heading.getBoundingClientRect();
      if (!h.width || !t.width) return clear();

      /* object-fit: cover, longhand — the picture at zoom 1. */
      const scale = Math.max(h.width / nw, h.height / nh);
      box = {
        w: nw * scale,
        h: nh * scale,
        /* The hero's centre, expressed relative to the heading — so `place`
           can work entirely in the heading's own coordinates. */
        dx: h.width / 2 - (t.left - h.left),
        dy: h.height / 2 - (t.top - h.top),
      };

      heading.style.setProperty("--ko-image", `url("${img.currentSrc || img.src}")`);
      place();
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

    /* Re-place on scroll, because that is when the picture drifts. One
       frame's work is two property writes; the measuring stays in `sync`. */
    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          place();
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      img.removeEventListener("load", sync);
      img.removeEventListener("error", clear);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      clear();
    };
    });
  }, [pathname]);

  return null;
}
