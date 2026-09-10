import { useEffect, useRef, useState } from "react";

/**
 * A figure whose DIGITS roll up into place, once, the first time it is
 * scrolled to — the numerals turning over the way they do on a desk
 * calendar.
 *
 * Each digit is its own one-line window with a tall strip of numerals behind
 * it; the strip is slid up until the right numeral is the one showing in the
 * window. Only digits get a window. A comma, a plus, a currency mark or a
 * space is printed as itself and never moves, so "1,100+" rolls its four
 * numerals and leaves the punctuation standing — a comma that spins is the
 * thing that makes an effect like this look like a slot machine.
 *
 * GENTLE, ON PURPOSE. The strip carries ONE spare run of 0-9 rather than
 * three, so a digit turns over about once on its way rather than blurring
 * through thirty numerals; the travel is short, the curve is a plain
 * decelerate, and the stagger between neighbouring digits is small enough to
 * read as one movement rather than as a cascade. The whole thing is over in
 * a little under a second and is meant to be noticed only just.
 *
 * ACCESSIBILITY. The rolling numerals are hidden from assistive tech — a
 * strip of twenty digits is nonsense read aloud — and the real figure is
 * rendered beside them as ordinary text, taken out of the layout. Anyone who
 * has asked for reduced motion is given the landed state immediately and
 * nothing ever moves.
 */

/** Full turns a digit takes before it lands. One: this is a settle, not a spin. */
const SPINS = 1;

/* 0-9 laid out SPINS+1 times. The last run holds the digit that is landed
   on; the run before it is what there is to see on the way there. */
const STRIP = Array.from({ length: (SPINS + 1) * 10 }, (_, i) => i % 10);

/** Milliseconds each digit waits behind the one to its left. */
const STAGGER = 70;

export default function RollingFigure({ text }: { text: string }) {
  const host = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);

  /* Rolls once, the first time it comes into view — and never again. A
     figure that re-rolls every time it is scrolled past stops being a
     detail and becomes a tic. */
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGo(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setGo(true);
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span className="rollf-host" ref={host}>
      {/* The figure as text, for screen readers and for anything that reads
          the page rather than looks at it. Out of the layout, so it neither
          shows nor takes up room. */}
      <span className="rollf-real">{text}</span>
      <span className="rollf" aria-hidden="true">
        {text.split("").map((ch, i) => {
          if (!/\d/.test(ch)) {
            return (
              <span className="rollf-fixed" key={i}>
                {ch}
              </span>
            );
          }
          /* Land on this digit in the FINAL run, so the run above it is what
             travels past the window on the way down. */
          const stop = SPINS * 10 + Number(ch);
          return (
            <span className="rollf-digit" key={i}>
              <span
                className="rollf-strip"
                style={{
                  /* One cell per numeral passed. The cell height lives in
                     the stylesheet as --rollf-h because the window, the
                     cells and this distance all have to agree — an `em`
                     hardcoded here would quietly stop landing on the right
                     numeral the moment that value changed. */
                  transform: go
                    ? `translateY(calc(var(--rollf-h, 1.16em) * ${-stop}))`
                    : "translateY(0)",
                  transitionDelay: `${i * STAGGER}ms`,
                }}
              >
                {STRIP.map((d, n) => (
                  <span key={n}>{d}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
