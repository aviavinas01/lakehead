import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { TESTS } from "../data/tests";
import HelpVideo from "../components/HelpVideo";

/**
 * Test Preparation — /services/test-preparation, and the parent of the
 * per-test pages. A static route, so it wins over /services/:slug and
 * replaces what the generic service page would otherwise render here.
 *
 * The tests, their order and their links all come from data/tests.ts.
 *
 * The copy is deliberately informal — this is the page a nervous
 * seventeen-year-old lands on, and the register should sound like a person
 * rather than a prospectus. It stays clear of scores, fees and validity
 * periods for the reason set out in the data file: those move.
 */

const HOW_WE_TEACH = [
  {
    title: "We find out where you actually are",
    text: "Every student starts with a full mock under real timing. Not to grade you — to find out which section is quietly costing you the most, because it is almost never the one people expect.",
  },
  {
    title: "Then we work on that",
    text: "There is no point drilling reading if writing is what is holding your band down. Preparation is built around your weak sections, and it changes as they stop being weak.",
  },
  {
    title: "The format matters as much as the English",
    text: "Most of these tests are as much about knowing how they work as knowing the language. Where the traps are, how long to spend, when to move on. That is trainable, and it is often the quickest few points you will gain.",
  },
  {
    title: "Practice under pressure, not in comfort",
    text: "Timed papers, proper conditions, no pausing when it gets hard. Exam day should feel like something you have already done several times.",
  },
  {
    title: "We tell you when you are ready",
    text: "And, more usefully, when you are not. Booking a test you are three weeks away from passing is an expensive way to find that out.",
  },
];

export default function TestPreparation() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Test Preparation | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/services/test-prep.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services">Student Services</Link>
            </p>
            <h1>
              Test <span className="h-accent">Preparation</span>
            </h1>
            <p className="dpage-lead">
              Almost everything downstream hangs off a test score — your offer,
              your visa, sometimes your scholarship. Which is a lot of pressure
              to put on one morning, so it is worth walking in having already
              done it a dozen times.
            </p>
            <p>
              We coach IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, SAT and ACT.
              Pick the one your universities actually want — we will help with
              that too, because sitting the wrong test is more common than you
              would think.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Book a Consultation →</Link>
              <a className="dpage-jump" href="#tests">
                See the tests <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            How we <span className="h-outline">prepare you</span>
          </h2>
          <p className="dpage-section-lead">
            No two students need the same thing, so nobody gets a generic
            course. Roughly, it goes like this.
          </p>
          <div className="dpage-paths">
            {HOW_WE_TEACH.map((h, i) => (
              <div className="dpage-path" key={h.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
          <p className="dpage-note">
            One piece of advice we give everybody: sit it about three months
            before your deadline. That way a bad day is a setback rather than a
            lost intake — and it is why we will nudge you to{" "}
            <Link to="/services/test-booking">book the seat early</Link>, before
            the good dates go.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint" id="tests">
        <div className="container">
          <h2 className="dpage-title">
            Which test do you <span className="h-accent">need?</span>
          </h2>
          <p className="dpage-section-lead">
            It depends on where you are applying and what you are studying —
            and occasionally on which format simply suits you better. Have a
            look, and ask us if it is not obvious.
          </p>
          <div className="dpage-cards">
            {TESTS.map((t) => (
              <Link
                className="dpage-card"
                to={`/services/test-preparation/${t.slug}`}
                key={t.slug}
              >
                <div className="dpage-card-shot">
                  <Shot src={t.image} alt="" />
                </div>
                <div className="dpage-card-body">
                  <h3>{t.name}</h3>
                  <p className="test-full">{t.full}</p>
                  <p>{t.blurb}</p>
                  <span className="dpage-card-more">
                    Learn more <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              Still not sure which <span className="h-accent">one?</span>
            </h2>
            <p className="dpage-section-lead">
              Bring us your shortlist of universities and we will tell you what
              they accept. It takes about ten minutes and saves people a
              remarkable amount of money.
            </p>
            <ul className="dpage-checks">
              <li><span aria-hidden="true"><Check /></span>Which tests your universities and visa route accept</li>
              <li><span aria-hidden="true"><Check /></span>Which format is likely to suit how you work</li>
              <li><span aria-hidden="true"><Check /></span>How long you realistically need to prepare</li>
            </ul>
          </div>
          <aside className="dpage-callout">
            <h3>Start with a mock</h3>
            <p>
              Come in, sit one properly, and we will show you exactly where you
              stand. Everything else follows from that.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Book a consultation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to get started?</h2>
            <p>Tell us your target and your deadline, and we will build the rest around it.</p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />
    </article>
  );
}
