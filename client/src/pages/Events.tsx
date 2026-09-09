import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "../components/destinationBits";
import { EVENT_KINDS } from "../data/events";
import { fetchEvents, type LakeheadEvent } from "../api/happenings";
import { mediaSrc } from "../api/media";
import { formatWhen } from "../lib/datetime";
import { contact } from "../config/contact";
import HelpVideo from "../components/HelpVideo";
import CallbackStrip from "../components/CallbackStrip";

/**
 * Events — /events.
 *
 * THIS PAGE IS DESIGNED AROUND HAVING NOTHING ON. Lakehead runs events in
 * bursts — around intake deadlines, when a university sends a delegation,
 * before a departure season — and is quiet in between, so "nothing
 * scheduled" is the normal state rather than an error to apologise for. The
 * empty state is therefore the finished design, not a placeholder: it says
 * plainly that there is nothing on, explains what usually appears here so a
 * visitor knows what they would be waiting for, and gives them two ways to
 * hear about the next one.
 *
 * WHEN SOMETHING IS SCHEDULED, publishing it in the admin replaces the empty
 * state with a listing. The "what we usually run" section stays underneath as
 * context either way — it is editorial, not a schedule, so it is still a
 * constant in data/events.ts rather than something to maintain in a form.
 */

export default function Events() {
  /* null while the list is still being fetched — distinct from an empty
     array, which is a real answer this page is designed around. */
  const [events, setEvents] = useState<LakeheadEvent[] | null>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Events | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    let off = false;
    /* A failure reads as "nothing scheduled" rather than as an error. The
       page already has a complete, useful design for having nothing on, and
       showing it beats an apology for a fetch a visitor cannot act on. */
    fetchEvents()
      .then((list) => !off && setEvents(list))
      .catch(() => !off && setEvents([]));
    return () => {
      off = true;
    };
  }, []);

  /* Empty is the assumption until told otherwise, which is the right way
     round here: it is by far the commoner answer, so the headline does not
     flicker through "Coming up" on its way to the truth. */
  const nothingOn = (events?.length ?? 0) === 0;

  return (
    <article className="dpage dpage-ruled evt">
      <header className="evt-head">
        <div className="container">
          <p className="dpage-eyebrow-sm">Events</p>
          {nothingOn ? (
            <h1 className="evt-title">
              <span className="evt-thin">Nothing on</span>
              <span className="evt-fat">right now.</span>
            </h1>
          ) : (
            <h1 className="evt-title">
              <span className="evt-thin">Coming up</span>
              <span className="evt-fat">at Lakehead.</span>
            </h1>
          )}
          <p className="evt-lead">
            {nothingOn ? (
              <>
                We run events in bursts — around intake deadlines, when a
                partner university sends someone to Nepal, and before each
                departure season. There is nothing scheduled at the moment,
                and rather than pad this page with something that isn&rsquo;t
                happening, here is what usually appears on it and how to hear
                when the next one is set.
              </>
            ) : (
              <>
                Information sessions, university visits and workshops. All of
                them are free, and none of them require you to be a client.
              </>
            )}
          </p>
        </div>
      </header>

      {nothingOn ? (
        <section className="evt-empty">
          <div className="container">
            <div className="evt-empty-card">
              {/* A drawn mark rather than an emoji: an empty calendar page,
                  with the one torn-off leaf that makes it read as "nothing
                  here yet" instead of "calendar". Decorative throughout. */}
              <svg
                className="evt-empty-mark"
                viewBox="0 0 120 96"
                fill="none"
                aria-hidden="true"
              >
                <rect x="10" y="18" width="100" height="70" rx="10"
                  stroke="currentColor" strokeWidth="2.5" opacity="0.28" />
                <path d="M10 38h100" stroke="currentColor" strokeWidth="2.5" opacity="0.28" />
                <path d="M34 10v16M86 10v16" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" opacity="0.28" />
                <path d="M44 62h32" stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round" opacity="0.5" />
              </svg>
              <h2>No events scheduled</h2>
              <p>
                The calendar is genuinely empty — this is not a page waiting
                to be filled in. When something is booked it will be here, and
                we will say where, when, and whether you need to register.
              </p>
              <div className="evt-empty-actions">
                <Link className="evt-btn" to="/contact">
                  Tell us to let you know <Arrow />
                </Link>
                <Link className="evt-btn evt-btn-quiet" to="/blog">
                  Read the blog instead <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="evt-list-section">
          <div className="container">
            <ul className="evt-list">
              {(events ?? []).map((e) => (
                <li className="evt-card" key={e._id}>
                  <div className="evt-card-when">
                    {/* Words win over the timestamp when both are set — a
                        university visit is often "late March", and saying
                        so is more honest than inventing an hour for it. */}
                    <span>{e.when || formatWhen(e.startsAt)}</span>
                    {e.kind ? <em>{e.kind}</em> : null}
                  </div>
                  <div className="evt-card-body">
                    {e.image ? (
                      <img
                        className="evt-card-shot"
                        src={mediaSrc(e.image)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <h2>{e.title}</h2>
                    <p>{e.blurb}</p>
                    {e.where ? <p className="evt-card-where">{e.where}</p> : null}
                    {e.registerUrl ? (
                      <a
                        className="evt-card-link"
                        href={e.registerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Register <Arrow />
                      </a>
                    ) : (
                      <Link className="evt-card-link" to="/contact">
                        Ask us about it <Arrow />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Context either way — an empty page that explains what it would
          contain is far more use than one that only says "no events". */}
      <section className="evt-kinds-section">
        <div className="container">
          <h2 className="evt-h2">
            What we <span className="evt-h2-accent">usually run</span>
          </h2>
          <p className="evt-kinds-lead">
            Not a schedule, and nothing below is currently booked. It is here
            so you know what you would be waiting for.
          </p>
          <ol className="evt-kinds">
            {EVENT_KINDS.map((k, i) => (
              <li key={k.name}>
                <span className="evt-kind-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{k.name}</h3>
                <p>{k.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CallbackStrip service="other" />

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Do not wait for an event.</h2>
            <p>
              A counselling session covers more than a room of fifty people
              ever could, and you can book one today.
            </p>
          </div>
          <a className="dpage-cta-btn" href={contact.phoneHref}>
            {contact.phoneDisplay} <Arrow />
          </a>
        </div>
      </section>
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />
    </article>
  );
}
