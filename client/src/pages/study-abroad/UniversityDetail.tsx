import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Arrow } from "../../components/shared/destinationBits";
import {
  DESTINATIONS,
  UNIVERSITIES_ANCHOR,
  universityBySlug,
  universityPath,
} from "../../data/universities";
import CallbackStrip from "../../components/shared/CallbackStrip";

/**
 * One partner institution — /study-abroad/universities/<slug>.
 *
 * UNDER STUDY ABROAD because that is where the list of partners lives now.
 * It used to be /university-partners/<slug>, beneath a University Partners
 * page that has since been folded into /study-abroad; the old addresses
 * still work — see LegacyUniversityRedirect at the bottom of this file.
 *
 * ------------------------------------------------------------------
 * ONE LAYOUT, EVERY UNIVERSITY, and that is the requirement rather than a
 * shortcut: the office adds partners without a designer in the room, so the
 * page has to look finished whatever it is given. Which means it is built
 * around what is MISSING rather than what is present.
 *
 * A record is guaranteed a name and a logo and nothing else. So every block
 * below asks whether it has anything to say and renders nothing at all if it
 * does not — no empty "Intakes" heading over a blank row, no "Location: —".
 * A partner added the day the agreement is signed shows a mark, a name and a
 * way to ask about it, and that reads as a deliberate page. The same page
 * fills out on its own as the office gathers the rest, with no code change.
 *
 * NOTHING HERE IS INVENTED. No stock photograph standing in for a campus, no
 * placeholder ranking, no "world-class facilities" boilerplate under an
 * institution nobody has written about yet. Every page on this site is
 * careful not to assert what it has not been told, and a partner page is the
 * easiest place in the world to start.
 *
 * THE LOOKUP IS SYNCHRONOUS. The partners are a module constant in
 * data/universities.ts, so there is no request, no loading state and no
 * moment where this page has a slug but not a record. A bad slug is the only
 * failure it can have, and that is a rendered page rather than an error.
 * ------------------------------------------------------------------
 */

/** The destination guide for a partner's country, when it has one set. */
const guideFor = (country?: string) =>
  country ? DESTINATIONS.find((d) => d.name === country) : undefined;

export default function UniversityDetail() {
  const { slug = "" } = useParams();
  /* Undefined for a slug nobody has an entry for — a real answer with its
     own page below, not an error. */
  const uni = universityBySlug(slug);

  useEffect(() => {
    const previous = document.title;
    document.title = uni
      ? `${uni.name} | Lakehead Education`
      : "Partner universities | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, [uni]);

  if (!uni) {
    return (
      <article className="dpage uni">
        <div className="container uni-missing">
          <h1>We could not find that university</h1>
          <p>
            It may have been taken off our list of partners, or the address
            may be wrong. The full list is one click away.
          </p>
          <Link className="uni-back" to={UNIVERSITIES_ANCHOR}>
            All partner institutions <Arrow />
          </Link>
        </div>
      </article>
    );
  }

  const guide = guideFor(uni.country);
  const place = [uni.city, uni.country].filter(Boolean).join(", ");
  /* Both are optional in the file rather than empty arrays, so they are
     normalised once here instead of at each of the four places they are
     read. */
  const intakes = uni.intakes ?? [];
  const links = uni.links ?? [];
  /* Whether the facts rail has anything in it at all. Asked once so the rail
     and its heading appear and disappear together. */
  const hasFacts = Boolean(place || intakes.length || uni.website);

  return (
    <article className="dpage uni">
      <header className="uni-head">
        <div className="container uni-head-inner">
          <p className="uni-crumb">
            <Link to={UNIVERSITIES_ANCHOR}>Partner universities</Link>
          </p>

          <div className="uni-id">
            {/* The mark, on its own white card exactly as on the wall — a
                crest reproduced on a tinted ground is somebody's brand
                guideline broken. */}
            <div className="uni-mark">
              <img src={uni.logo} alt={uni.name} />
            </div>
            <div>
              <h1>{uni.name}</h1>
              {place ? <p className="uni-place">{place}</p> : null}
            </div>
          </div>

          <div className="uni-head-actions">
            {uni.website ? (
              <a
                className="btn btn-outline"
                href={uni.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit the university website →
              </a>
            ) : null}
            <Link className="dpage-jump" to="/contact">
              Ask about applying here <Arrow />
            </Link>
          </div>
        </div>
      </header>

      {hasFacts ? (
        <section className="dpage-section uni-facts-section">
          <div className="container">
            <dl className="uni-facts">
              {place ? (
                <div className="uni-fact">
                  <dt>Where</dt>
                  <dd>{place}</dd>
                </div>
              ) : null}
              {intakes.length ? (
                <div className="uni-fact">
                  <dt>Intakes</dt>
                  <dd>
                    <ul className="uni-intakes">
                      {intakes.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
              {uni.website ? (
                <div className="uni-fact">
                  <dt>Website</dt>
                  <dd>
                    <a
                      href={uni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {/* The bare host, not the full address — a wrapped URL
                          in a definition list reads as a paste accident. */}
                      {uni.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>
      ) : null}

      {links.length ? (
        <section className="dpage-section dpage-tint">
          <div className="container">
            <h2 className="dpage-title uni-h2">
              Useful <span className="h-accent">links</span>
            </h2>
            <p className="dpage-section-lead">
              Straight from the university. These open on their site, and what
              is on them is theirs to change.
            </p>
            <ul className="uni-links">
              {links.map((l) => (
                <li key={`${l.label}-${l.url}`}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    <span className="uni-link-label">{l.label}</span>
                    <span className="uni-link-go" aria-hidden="true">
                      <Arrow />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* The honest part: a partnership is a working relationship, not a
          recommendation. */}
      <section className="dpage-section">
        <div className="container uni-partnership">
          <h2 className="dpage-title uni-h2">
            What our partnership <span className="h-accent">means here</span>
          </h2>
          <p className="dpage-section-lead">
            We hold a direct agreement with {uni.name}, which means our
            applications go through their own channel rather than a public
            form, and there is somebody at the other end who can pick up the
            phone if a document is unclear. It does not make an offer more
            likely — nothing does but your file.
          </p>
          <p className="dpage-note">
            Every institution on our list of partners pays a commission, which is
            exactly why we say so here. Your shortlist is built from your
            profile first, and the partner list is checked afterwards.
            {guide ? (
              <>
                {" "}
                If you are still weighing up the country rather than the
                university, start with the{" "}
                <Link to={guide.to}>{guide.name} guide</Link>.
              </>
            ) : null}
          </p>
          <Link className="uni-back" to={UNIVERSITIES_ANCHOR}>
            All partner institutions <Arrow />
          </Link>
        </div>
      </section>

      <CallbackStrip service="study-abroad" />
    </article>
  );
}

/**
 * /university-partners/<slug> — the address these pages had before the
 * University Partners page was folded into /study-abroad. Sent on to the new
 * one, `replace`d so the old address does not sit in the history as a
 * back-button trap. Links in old emails, shared chats and search results
 * keep working this way.
 */
export function LegacyUniversityRedirect() {
  const { slug = "" } = useParams();
  return <Navigate to={universityPath(slug)} replace />;
}
