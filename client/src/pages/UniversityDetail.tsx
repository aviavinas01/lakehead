import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Arrow } from "../components/destinationBits";
import { mediaSrc } from "../api/media";
import { fetchUniversity } from "../api/universities";
import { DESTINATIONS } from "../data/universities";
import CallbackStrip from "../components/CallbackStrip";
import type { University } from "../types/api";

/**
 * One partner institution — /university-partners/<slug>.
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
 * ------------------------------------------------------------------
 */

/** The destination guide for a partner's country, when it has one set. */
const guideFor = (country?: string) =>
  country ? DESTINATIONS.find((d) => d.name === country) : undefined;

export default function UniversityDetail() {
  const { slug = "" } = useParams();
  /* null while loading, and `notFound` separately — an unpublished or
     missing record is a real answer with its own page, not an error. */
  const [uni, setUni] = useState<University | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let off = false;
    setUni(null);
    setNotFound(false);
    fetchUniversity(slug)
      .then((u) => !off && setUni(u))
      .catch(() => !off && setNotFound(true));
    return () => {
      off = true;
    };
  }, [slug]);

  useEffect(() => {
    const previous = document.title;
    document.title = uni
      ? `${uni.name} | Lakehead Education`
      : "University Partners | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, [uni]);

  if (notFound) {
    return (
      <article className="dpage uni">
        <div className="container uni-missing">
          <h1>We could not find that university</h1>
          <p>
            It may have been taken off the partners page, or the address may
            be wrong. The full list is one click away.
          </p>
          <Link className="uni-back" to="/university-partners">
            All partner institutions <Arrow />
          </Link>
        </div>
      </article>
    );
  }

  /* Holds the page's shape rather than showing a spinner: the heading and
     the mark land in the same places a moment later, so nothing jumps. */
  if (!uni) {
    return (
      <article className="dpage uni">
        <div className="container uni-missing">
          <p className="adm-quiet">Loading…</p>
        </div>
      </article>
    );
  }

  const guide = guideFor(uni.country);
  const place = [uni.city, uni.country].filter(Boolean).join(", ");
  /* Whether the facts rail has anything in it at all. Asked once here so
     the rail and its heading appear and disappear together. */
  const hasFacts = Boolean(place || uni.intakes.length || uni.website);

  return (
    <article className="dpage uni">
      <header className="uni-head">
        <div className="container uni-head-inner">
          <p className="uni-crumb">
            <Link to="/university-partners">University Partners</Link>
          </p>

          <div className="uni-id">
            {/* The mark, on its own white card exactly as on the wall — a
                crest reproduced on a tinted ground is somebody's brand
                guideline broken. */}
            <div className="uni-mark">
              <img src={mediaSrc(uni.logo)} alt={uni.name} />
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
              {uni.intakes.length ? (
                <div className="uni-fact">
                  <dt>Intakes</dt>
                  <dd>
                    <ul className="uni-intakes">
                      {uni.intakes.map((m) => (
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

      {uni.links.length ? (
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
              {uni.links.map((l) => (
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

      {/* The honest part, and the same one the partners page makes: a
          partnership is a working relationship, not a recommendation. */}
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
            Every institution on our partners page pays a commission, which is
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
          <Link className="uni-back" to="/university-partners">
            All partner institutions <Arrow />
          </Link>
        </div>
      </section>

      <CallbackStrip service="study-abroad" />
    </article>
  );
}
