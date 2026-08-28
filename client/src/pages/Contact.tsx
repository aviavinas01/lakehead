import { useEffect, useState } from "react";
import { Arrow, Pin, Check } from "../components/destinationBits";
import InquiryForm from "../components/InquiryForm";
import { OFFICES, contact, mapEmbedFor, mapLinkFor } from "../config/contact";

/**
 * Contact — /contact.
 *
 * Three offices, one map. The obvious build is three maps stacked down the
 * page, and it is the wrong one: a visitor is choosing between cities, and a
 * choice is easier to make when the thing being chosen changes in place
 * rather than when you scroll past all three.
 *
 * SO THE CITY NAMES ARE THE CONTROL. They are set large enough to be the
 * furniture rather than a row of tabs, and the whole panel underneath —
 * map, address, hours, number — swaps beneath them.
 *
 * HOW THE MAP SWITCHES WITHOUT RELOADING. An iframe is mounted for each
 * office the FIRST time that city is selected, and then kept. So the first
 * switch to Birtamod costs one map load and every switch after that is a
 * cross-fade between frames that are already there. Mounting all three up
 * front would load three maps for a visitor who probably wants one; keying
 * a single iframe on the city would reload the map on every click, which is
 * the flicker this is designed to avoid.
 *
 * No Google JavaScript is involved. The `output=embed` map is a plain iframe
 * and needs no API key, which is what makes switching cities free.
 */

export default function Contact() {
  const [active, setActive] = useState(OFFICES[0].id);
  /* Which cities have been looked at, and therefore have a map mounted. */
  const [mounted, setMounted] = useState<string[]>([OFFICES[0].id]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Contact Us | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  const select = (id: string) => {
    setActive(id);
    setMounted((cur) => (cur.includes(id) ? cur : [...cur, id]));
  };

  const office = OFFICES.find((o) => o.id === active) ?? OFFICES[0];
  const index = OFFICES.findIndex((o) => o.id === office.id);

  return (
    <article className="dpage ctc">
      {/* ---- header ---- */}
      <header className="ctc-head">
        <div className="container">
          <p className="dpage-eyebrow-sm">Contact us</p>
          <h1 className="ctc-title">
            <span className="ctc-thin">Three offices,</span>
            <span className="ctc-fat">one conversation.</span>
          </h1>
          <p className="ctc-lead">
            Kathmandu, Birtamod and Butwal — whichever you walk into, the same
            counsellors and the same file. Pick a city below for the map and
            the number, or send the form and let us come to you.
          </p>
        </div>
      </header>

      {/* ---- the offices ---- */}
      <section className="ctc-offices">
        <div className="container">
          <div className="ctc-switch" role="tablist" aria-label="Our offices">
            {OFFICES.map((o, i) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                id={`ctc-tab-${o.id}`}
                aria-selected={o.id === active}
                aria-controls={`ctc-panel-${o.id}`}
                className={`ctc-city${o.id === active ? " is-on" : ""}`}
                onClick={() => select(o.id)}
              >
                <span className="ctc-city-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ctc-city-name">{o.city}</span>
                <span className="ctc-city-kind">{o.kind}</span>
              </button>
            ))}
            {/* One bar that slides between the three, rather than a border
                appearing and disappearing under each. */}
            <span
              className="ctc-switch-bar"
              aria-hidden="true"
              style={{
                width: `${100 / OFFICES.length}%`,
                transform: `translateX(${index * 100}%)`,
              }}
            />
          </div>

          <div
            className="ctc-panel"
            role="tabpanel"
            id={`ctc-panel-${office.id}`}
            aria-labelledby={`ctc-tab-${office.id}`}
          >
            <div className="ctc-map">
              {OFFICES.filter((o) => mounted.includes(o.id)).map((o) => (
                <div
                  className="ctc-map-layer"
                  key={o.id}
                  data-on={o.id === office.id || undefined}
                  aria-hidden={o.id !== office.id}
                >
                  <iframe
                    src={mapEmbedFor(o.at)}
                    title={`Lakehead Education, ${o.city}, on Google Maps`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>

            {/* Keyed on the office so the details re-mount and re-run their
                staggered entrance every time the city changes. */}
            <div className="ctc-details" key={office.id}>
              <p className="ctc-detail-blurb">{office.blurb}</p>

              <address className="ctc-address">
                <span className="ctc-address-pin" aria-hidden="true"><Pin /></span>
                <span>
                  {office.addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              </address>

              <dl className="ctc-lines">
                <div>
                  <dt>Phone</dt>
                  <dd><a href={office.phoneHref}>{office.phoneDisplay}</a></dd>
                </div>
                {/* Only the head office has a mobile to give out today */}
                {office.mobileHref && office.mobileDisplay && (
                  <div>
                    <dt>Mobile</dt>
                    <dd><a href={office.mobileHref}>{office.mobileDisplay}</a></dd>
                  </div>
                )}
                <div>
                  <dt>Email</dt>
                  <dd><a href={office.emailHref}>{office.emailDisplay}</a></dd>
                </div>
                <div>
                  <dt>WhatsApp</dt>
                  <dd>
                    <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                      Message us
                    </a>
                  </dd>
                </div>
              </dl>

              <dl className="ctc-hours">
                {office.hours.map((h) => (
                  <div key={h.days}>
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>

              <a
                className="ctc-map-btn"
                href={mapLinkFor(office.at)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open {office.city} in Google Maps <Arrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- the form ---- */}
      <section className="ctc-form-section" id="enquire">
        <div className="container ctc-form-split">
          <div className="ctc-form-intro">
            <h2 className="ctc-h2">
              Or just <span className="ctc-h2-accent">tell us where you are</span>
            </h2>
            <p>
              A country in mind, a score you need, or nothing at all beyond
              wanting to go. A counsellor replies within one working day, from
              whichever office is nearest you.
            </p>
            <ul className="dpage-checks ctc-promises">
              <li>
                <span aria-hidden="true"><Check /></span>
                One working day, every working day
              </li>
              <li>
                <span aria-hidden="true"><Check /></span>
                A counsellor replies, not an autoresponder
              </li>
              <li>
                <span aria-hidden="true"><Check /></span>
                Nothing you send is passed to an institution
              </li>
            </ul>
          </div>

          <div className="ctc-form-panel">
            <InquiryForm
              className="form ctc-form"
              submitLabel="Send enquiry"
              submitClassName="ctc-submit"
            />
          </div>
        </div>
      </section>
    </article>
  );
}
