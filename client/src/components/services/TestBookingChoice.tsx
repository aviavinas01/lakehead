import { Link } from "react-router-dom";
import { Arrow, Shot } from "../shared/destinationBits";
import { PROVIDER_LIST, bookingPath } from "../../data/testBooking";

/**
 * "Which IELTS?" — the fork at the top of /services/test-booking.
 *
 * Two cards, one per provider, each opening that provider's own form. The
 * choice comes first because the two forms genuinely differ (the British
 * Council one asks for an alternative email, and each names the test in its
 * own words), and because a candidate usually already knows which one their
 * university or visa route wants.
 *
 * Only rendered on the Test Booking service page — see ServiceDetail.
 */
export default function TestBookingChoice() {
  return (
    <section className="dpage-section tbk-choice" aria-labelledby="tbk-choice-h">
      <div className="container">
        <h2 className="dpage-title" id="tbk-choice-h">
          Book your <span className="h-accent">IELTS test</span>
        </h2>
        <p className="tbk-choice-lead">
          Choose who runs the test you want to sit. Fill in the form exactly
          as your passport reads, attach your signature, and a counsellor will
          confirm the date, the fee and your seat within 24 hours.
        </p>

        <div className="tbk-options">
          {PROVIDER_LIST.map((p) => (
            <Link key={p.slug} className="tbk-option" to={bookingPath(p.slug)}>
              {/* The same photograph as the top of that provider's form, so
                  the card and the page it opens look like one thing. Until
                  the file is added this is the site's usual pale
                  placeholder — see data/testBooking.ts for the paths. */}
              <span className="tbk-option-shot">
                <Shot src={p.image} alt="" />
              </span>
              <span className="tbk-option-body">
                <span className="tbk-option-kicker">{p.runBy}</span>
                <span className="tbk-option-name">{p.name}</span>
                <span className="tbk-option-meta">Academic or General Training</span>
                <span className="tbk-option-go">
                  Fill in the {p.name} form <Arrow />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
