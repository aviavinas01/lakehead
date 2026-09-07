# -*- coding: utf-8 -*-
import io
import re

p = "client/src/styles.css"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert s.count(old) == 1, label + " -- %d" % s.count(old)
    s = s.replace(old, new)


# ---- the prose carries the page now, so it is set like it ---------------
swap(
    """.usa-body p { color: var(--color-muted); font-size: 1.03rem; line-height: 1.8; margin-bottom: 1.4rem; }""",
    """/* THESE PAGES ARE PROSE NOW. The card grids, the tap-to-answer prompts and
   the pick-your-priorities panels are gone, and what they said is said in
   paragraphs instead — so the paragraph has to carry weight it did not have
   to carry before. Larger, darker, and given a measure.

   `max-width` in ch is the important half. Without it the column ran the
   full width of the grid track, which at 1.03rem was around ninety
   characters a line — comfortably past the point where the eye starts
   losing its place on the return sweep. Sixty-eight is long for a magazine
   and about right for a reference page somebody is scanning as much as
   reading. */
.usa-body p {
  color: #3d4356;
  font-size: clamp(1.08rem, 1.35vw, 1.22rem);
  line-height: 1.78; margin-bottom: 1.55rem;
  max-width: 68ch;
}""",
    "prose",
)

swap(
    """.usa-body .usa-h2 + p:not([class]) {
  font-size: clamp(1.1rem, 1.5vw, 1.24rem); line-height: 1.65;
  color: var(--color-hero-ink); font-weight: 400;
  margin-bottom: 1.9rem; max-width: 60ch;
}""",
    """.usa-body .usa-h2 + p:not([class]) {
  font-size: clamp(1.22rem, 1.75vw, 1.45rem); line-height: 1.6;
  color: var(--color-hero-ink); font-weight: 400;
  letter-spacing: -0.012em;
  margin-bottom: 2.1rem; max-width: 56ch;
}""",
    "standfirst",
)

# ---- a run of paragraphs arrives in sequence, not as a slab ------------
swap(
    """/* A pulled line enters from the side, against the vertical grain of
   everything else, which is what makes it read as lifted out of the flow. */""",
    """/* A RUN OF PARAGRAPHS ARRIVES IN ORDER. With the page reduced to prose, a
   section is often four or five paragraphs that cross the trigger within a
   frame of each other and would otherwise all land at once — which reads as
   a block appearing rather than as text being set. Three steps, cycling, so
   the delay never grows past a fifth of a second however long the section
   runs; a genuinely staggered twelfth paragraph would just be late.

   Only paragraphs with no class of their own: a pull quote and a quip have
   their own entrances below and should not be dealt into this rhythm. */
.usa[data-reveal-armed] .usa-body p:not([class])[data-reveal]:nth-of-type(3n + 2) {
  transition-delay: 0.08s;
}
.usa[data-reveal-armed] .usa-body p:not([class])[data-reveal]:nth-of-type(3n + 3) {
  transition-delay: 0.16s;
}

/* A pulled line enters from the side, against the vertical grain of
   everything else, which is what makes it read as lifted out of the flow. */""",
    "stagger",
)

# ---- the cascade list loses the grid that no longer exists -------------
s = s.replace(".usa-cards, .usa-chips", ".usa-chips")
swap(
    """.usa :is(.usa-chips, .dpage-checks, .usa-questions, .usa-roadmap).is-in > * {""",
    """/* .usa-cards is no longer in this list because the block is gone — see the
   note on .usa-body p. The remaining four are still grids of small items. */
.usa :is(.usa-chips, .dpage-checks, .usa-questions, .usa-roadmap).is-in > * {""",
    "cascade note",
)

# ---- and the rules for the removed blocks go ---------------------------
def cut(start_marker, end_marker, label):
    global s
    a = s.index(start_marker)
    b = s.index(end_marker, a) + len(end_marker)
    s = s[:a] + s[b:]
    print("  cut", label)


cut("""/* ---- card grids ---- */
.usa-cards {""", ".usa-body .usa-card p { font-size: 0.95rem; line-height: 1.7; margin: 0; }\n", "usa-cards")

io.open(p, "w", encoding="utf-8").write(s)
print("typography ok")
