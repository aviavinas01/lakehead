# -*- coding: utf-8 -*-
import io

# ---- Home.tsx: drop the band between the hero and the figures ----------
p = "client/src/pages/Home.tsx"
s = io.open(p, encoding="utf-8").read()
s = s.replace(
    'import StatsStrip from "../components/StatsStrip";',
    'import StatsStrip from "../components/StatsStrip";\nimport LegacyBand from "../components/LegacyBand";',
)
old = "      <StatsStrip />"
new = """      {/* Who we are, with a frosted shape that starts inside the hero above
          and finishes on the white down here — see the component. It sits
          between the film and the figures deliberately: the film says what
          we do, this says who is doing it, and only then do the numbers
          mean anything. */}
      <LegacyBand />

      <StatsStrip />"""
assert s.count(old) == 1, "home"
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8").write(s)
print("Home ok")

# ---- styles ------------------------------------------------------------
p = "client/src/styles.css"
s = io.open(p, encoding="utf-8").read()

anchor = "/* Stats strip below the hero"
assert s.count(anchor) == 1

block = '''/* ============================================================
   The legacy band (components/LegacyBand.tsx) — who we are, sitting between
   the hero film and the figures, with a frosted shape bridging the two.
   ============================================================ */
.legacy {
  position: relative;
  background: var(--color-bg);
  padding: clamp(4rem, 10vh, 7rem) 0 clamp(1rem, 3vh, 2.5rem);
}

/* ---- the shape ----
   HOW IT BRIDGES TWO SECTIONS. It is a child of this band but pulled UP by
   more than the band's own top edge, so its head sits inside the hero. The
   hero cannot clip it — `overflow: clip` there governs the hero's own
   children, and this is a sibling's child — and the page cannot scroll
   sideways because of it, because html and body are already `overflow-x:
   clip`.

   ONE FILL DOES BOTH JOBS. A pale blue-grey at just over half opacity: over
   the dark film it lightens to frosted glass, and over the white below it
   settles into a barely-there panel. A pure white would have vanished on
   the lower half and a solid grey would have blocked the film on the upper.

   z-index 1 IS THE WHOLE SAFETY ARGUMENT. .hero-media is 0 and .hero-inner
   is 2, and neither the hero nor this band opens a stacking context of its
   own — so this lands between them by construction. It is over the film and
   under the headline at every window size, with nothing measured. */
.legacy-glass {
  position: absolute; z-index: 1; pointer-events: none;
  left: clamp(-180px, -7vw, -60px);
  top: calc(-1 * clamp(150px, 24vh, 300px));
  width: clamp(300px, 40vw, 660px);
  height: clamp(380px, 58vh, 720px);
  /* Not a circle and not a box — three round corners and one soft one, so
     it reads as a drawn form rather than as a div that got a radius. */
  border-radius: 999px 999px 22% 999px;
  background: rgba(238, 242, 249, 0.55);
  -webkit-backdrop-filter: blur(14px) saturate(1.08);
  backdrop-filter: blur(14px) saturate(1.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
/* A backdrop-filter is re-evaluated as the page moves, which is why this one
   is allowed: it lives in the first screen and a half and is off-screen for
   the whole of the rest of the page, so the cost is paid where a visitor has
   not started scrolling in earnest yet. Do not reach for the same effect
   further down. */

/* ---- the copy ----
   Centred, because the shape owns the left. Words set flush left here would
   spend the whole band dodging it. */
.legacy-inner {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
.legacy-eyebrow {
  color: var(--color-hero-red); font-family: var(--font-display);
  font-weight: 700; font-size: 0.78rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  margin-bottom: 1.1rem;
}
/* Light for the setup, heavy for the claim — the same two-weight line the
   rest of the site uses for a headline with a figure in it. The global
   h1-h3 rule sets 700, hence the override on the light half. */
.legacy-title {
  color: var(--color-hero-ink);
  font-size: clamp(1.9rem, 4vw, 3.4rem); font-weight: 400;
  letter-spacing: -0.03em; line-height: 1.14;
  max-width: 22ch; margin: 0 0 1.5rem;
}
.legacy-title strong { font-weight: 700; }
.legacy-lead {
  color: var(--color-muted); max-width: 62ch;
  font-size: clamp(0.98rem, 1.15vw, 1.08rem); line-height: 1.8;
  margin: 0;
}
.legacy-link {
  display: inline-flex; align-items: center; gap: 1rem;
  margin-top: 2rem; color: var(--color-text);
  font-family: var(--font-display); font-weight: 700;
  font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase;
}
.legacy-link svg { color: var(--color-hero-red); transition: transform 0.25s ease; }
.legacy-link:hover svg { transform: translateX(6px); }

/* On a phone the hero is not pinned to the window's height and the film is
   short, so a shape reaching a third of a screen upward would sit over the
   headline rather than under it. It is pulled in and pushed down to clear
   the copy, and the blur goes with the size — a large radius over a small
   area is expensive for something nobody can see much of. */
@media (max-width: 860px) {
  .legacy-glass {
    left: -30vw; top: calc(-1 * clamp(60px, 9vh, 110px));
    width: 78vw; height: clamp(260px, 40vh, 420px);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  }
}
/* Nothing is animated here, but the blur is a heavy, continuous effect and
   somebody asking for less motion is usually asking for less of everything.
   The panel stays; it simply stops sampling what is behind it. */
@media (prefers-reduced-motion: reduce) {
  .legacy-glass {
    -webkit-backdrop-filter: none; backdrop-filter: none;
    background: rgba(238, 242, 249, 0.75);
  }
}

'''

s = s.replace(anchor, block + anchor)
io.open(p, "w", encoding="utf-8").write(s)
print("styles ok")
