import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDirector } from "../../api/people";
import { mediaSrc } from "../../api/media";
import { getErrorMessage } from "../../api/client";
import Loader from "../../components/shared/Loader";
import { Arrow } from "../../components/shared/destinationBits";
import { renderArticle } from "../../lib/richText";
import { directorHeading } from "../../lib/people";
import type { Director as DirectorRecord } from "../../types/api";

/**
 * A message from the director — /about/director.
 *
 * ------------------------------------------------------------------
 * THE SHAPE, AND WHY IT IS TWO PIECES OF TEXT RATHER THAN ONE:
 *
 *   headline          large, uppercase, across the top
 *   portrait   |  short statement      ← side by side
 *   ------------------------------------
 *   the long message, full width below
 *   name / role
 *
 * The short statement beside the photograph is the summary a reader gets
 * BEFORE committing to the whole letter; the long one underneath is the
 * letter. That is the whole reason `lead` and `statement` are separate
 * fields rather than one body of text with the first paragraph pulled out —
 * an editor writing this page is writing two different things for two
 * different readers, and a page that guessed which paragraph was the summary
 * would guess wrong the first time somebody opened with a short sentence.
 *
 * The photograph and the statement are bottom-aligned rather than top-
 * aligned. A portrait is taller than three or four sentences, so aligning
 * their tops leaves the text stranded against the subject's head; aligning
 * their bottoms sets it against the body of the picture, which is where the
 * reference this was built from puts it and where it reads.
 * ------------------------------------------------------------------
 *
 * EVERYTHING ON THE PAGE COMES FROM THE ADMIN SCREEN. There is no hard-coded
 * name, title, portrait or paragraph anywhere here — including the headline,
 * which is derived from the title so it cannot contradict the signature. See
 * lib/people.ts and /admin/people.
 *
 * THREE STATES, AND ALL THREE ARE ORDINARY:
 *
 *   · loading — a spinner, briefly.
 *   · nothing published yet — a short, calm placeholder. The API answers
 *     `director: null` rather than 404ing for this, because "not written
 *     yet" is not a broken address and the page should not look like one.
 *   · published — the message.
 *
 * The long message is drawn by the SAME function the blog uses, which
 * understands a small subset of Markdown and never sets HTML — so a
 * paragraph break is a paragraph break and there is nothing to sanitise.
 * See lib/richText.
 */
export default function Director() {
  const [director, setDirector] = useState<DirectorRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const heading = directorHeading(director?.title);

  useEffect(() => {
    const previous = document.title;
    document.title = director
      ? `${heading} | Lakehead Education`
      : "Message from the Director | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, [director, heading]);

  useEffect(() => {
    let cancelled = false;
    fetchDirector()
      .then((d) => {
        if (!cancelled) setDirector(d);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load the message."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const body = useMemo(
    () => (director ? renderArticle(director.statement) : null),
    [director]
  );

  if (loading) {
    return (
      <div className="loader-block">
        <Loader />
      </div>
    );
  }

  /* Nothing written yet, or the request failed. Both land here on purpose:
     from a reader's side they are the same thing — there is no message to
     read — and an error banner about a fetch tells them nothing they can act
     on. The error is still surfaced quietly for anyone looking. */
  if (!director) {
    return (
      <article className="dpage dpage-ruled dir">
        <div className="container section dir-empty">
          <p className="dpage-eyebrow-sm">Message from the Director</p>
          <h1>A message is on its way</h1>
          <p>
            Our director&rsquo;s message is being written and will appear here
            shortly. In the meantime, the About page covers who we are and how
            we work.
          </p>
          {error ? <p className="dir-empty-note">{error}</p> : null}
          <Link className="dir-back" to="/about">
            Read about Lakehead <Arrow />
          </Link>
        </div>
      </article>
    );
  }

  const photo = director.photo ? mediaSrc(director.photo) : undefined;

  return (
    <article className={`dpage dir${photo ? "" : " dir-nophoto"}`}>
      <header className="container dir-head">
        <h1>{heading}</h1>
      </header>

      <div className="container dir-top">
        {photo ? (
          <figure className="dir-portrait">
            {/* The angled block behind the picture. It is set to overhang the
                photograph on two sides, so it reads as a deliberate accent
                whether the upload is a cut-out on a transparent background —
                where it shows through and does the job it does in the
                reference — or an ordinary rectangular photograph, where it
                sits behind and to the side of it. */}
            <span className="dir-wedge" aria-hidden="true" />
            <img src={photo} alt={director.name} loading="eager" decoding="async" />
          </figure>
        ) : null}

        {director.lead ? <p className="dir-lead">{director.lead}</p> : null}
      </div>

      <div className="container dir-full">
        <div className="dir-body art-prose">{body}</div>

        <footer className="dir-sign">
          <p className="dir-name">{director.name}</p>
          <p className="dir-role">{director.title}</p>
        </footer>
      </div>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Want to talk it through?</h2>
            <p>Sit down with a counsellor. The first consultation is free.</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
