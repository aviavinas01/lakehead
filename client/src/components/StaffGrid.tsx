import { useEffect, useRef, useState } from "react";
import { fetchStaff } from "../api/people";
import { mediaSrc } from "../api/media";
import { armReveals } from "../lib/reveal";
import type { StaffMember } from "../types/api";

/**
 * The team, as cards — the "who we are" part of /about that is actual
 * people rather than principles.
 *
 * IT RENDERS NOTHING UNTIL THERE IS SOMEBODY TO SHOW. Not a heading over an
 * empty grid, not a "meet the team, coming soon" — the whole section,
 * heading included, is absent until a card exists. A new site should not
 * advertise the parts of itself that have not been filled in, and this one
 * sits in that state until the office adds its first person.
 *
 * The request is `quiet`, so it never raises the global loading veil: this
 * is one section a long way down a page that is already readable, and a
 * failure here should cost the section, not the page.
 *
 * THE QUOTE IS OPTIONAL, and the card is built so a missing one is not a
 * hole. Name and role sit directly under the photograph and the quote, when
 * there is one, follows underneath — so a grid mixing the two reads as a
 * grid of people rather than a grid with gaps in it.
 *
 * ------------------------------------------------------------------
 * IT REVEALS ITS OWN HEADING, and that is not belt-and-braces — without it
 * the heading is invisible.
 *
 * PageReveal arms the whole page once per navigation: it collects every
 * `.dpage-title` and `.dpage-section-lead` that exists AT THAT MOMENT and
 * puts `data-reveal-armed` on the article, which is what switches on the
 * stylesheet rule hiding them until they are marked `.is-in`. This section
 * arrives later, after its fetch — so its heading is matched by the hiding
 * rule but was never in the list of things to bring back, and sits at
 * opacity 0 for ever while the cards below it show normally.
 *
 * So it arms itself over its own subtree, using the same helper, once it
 * actually has something to show. Any other section that renders from a
 * request and uses those two classes on a `dpage-ruled` page needs the
 * same, and will look exactly this broken without it.
 * ------------------------------------------------------------------
 */
export default function StaffGrid() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStaff()
      .then((list) => {
        if (!cancelled) setStaff(list);
      })
      .catch(() => {
        /* No team section. The rest of the page is unaffected. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Runs once the section exists — see the note above. armReveals sweeps
     on scroll and marks each node as it comes into view, so the heading
     still arrives the same way every other heading on the page does. */
  useEffect(() => {
    if (!root.current) return;
    return armReveals(root.current, ".dpage-title, .dpage-section-lead");
  }, [staff.length]);

  if (staff.length === 0) return null;

  return (
    <section className="dpage-section stf" aria-labelledby="stf-h" ref={root}>
      <div className="container">
        <h2 className="dpage-title who-h2" id="stf-h">
          Meet <span className="h-accent">our staff</span>
        </h2>
        <p className="dpage-section-lead">
          The counsellors and specialists who take your file and stay with it
          — from the first conversation to the airport.
        </p>

        <ul className="stf-grid">
          {staff.map((m) => (
            <li className="stf-card" key={m._id}>
              <div className="stf-shot">
                {m.photo ? (
                  <img src={mediaSrc(m.photo)} alt={m.name} loading="lazy" decoding="async" />
                ) : (
                  /* Same treatment as every other card on the site with no
                     picture: an initial set large on a tint, so the grid
                     stays even instead of dropping a grey rectangle in. */
                  <span className="stf-noshot" aria-hidden="true">
                    {m.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="stf-copy">
                <h3>{m.name}</h3>
                <p className="stf-role">{m.title}</p>
                {/* The marks live in the markup rather than in CSS
                    ::before/::after, which is how every other quoted line on
                    the site does it — see usa-myth-claim. */}
                {m.quote ? (
                  <blockquote className="stf-quote">
                    &ldquo;{m.quote}&rdquo;
                  </blockquote>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
