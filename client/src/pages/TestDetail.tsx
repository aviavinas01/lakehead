import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Arrow, Shot } from "../components/destinationBits";
import { TESTS, findTest } from "../data/tests";
import HelpVideo from "../components/HelpVideo";
import CallbackStrip from "../components/CallbackStrip";

/**
 * One page, eight tests — /services/test-preparation/:test.
 *
 * This is a holding page on purpose. It carries what we can say about each
 * test without risking anything that dates: what it is for, and how our
 * preparation works. Full per-test content is still to come; when it does,
 * extend the Test interface in data/tests.ts and render it here rather than
 * writing eight separate components.
 *
 * An unrecognised slug goes back to the Test Preparation hub rather than
 * showing an empty page.
 */
export default function TestDetail() {
  const { test: slug } = useParams();
  const test = findTest(slug);

  useEffect(() => {
    if (!test) return;
    const previous = document.title;
    document.title = `${test.name} Preparation | Lakehead Education`;
    return () => {
      document.title = previous;
    };
  }, [test]);

  if (!test) return <Navigate to="/services/test-preparation" replace />;

  const others = TESTS.filter((t) => t.slug !== test.slug);

  return (
    <article className="dpage dpage-ruled">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src={test.image} alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services/test-preparation">
                Test Preparation
              </Link>
            </p>
            <h1>{test.name}</h1>
            <p className="test-full-hero">{test.full}</p>
            <p className="dpage-lead">{test.intro}</p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Book a Consultation →</Link>
              <Link className="dpage-jump" to="/services/test-preparation">
                All tests <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              Preparing for <span className="h-accent">{test.name}</span>
            </h2>
            <p className="dpage-section-lead">
              We start with a full mock under real timing, work out which
              section is actually costing you marks, and build the preparation
              around that. The format gets as much attention as the content —
              on most of these tests, knowing how the paper behaves is worth
              as much as knowing the material.
            </p>
            <p className="dpage-fineprint">
              Scores, fees and how long a result stays valid are set by the
              test board and change from time to time, so we have deliberately
              not printed them here. Ask us and we will check the current
              position with you.
            </p>
          </div>
          <aside className="dpage-callout">
            <h3>Start with a mock</h3>
            <p>
              Sit one properly and you will know where you stand within an
              afternoon. Everything we plan after that is based on the result.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Book a consultation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Other <span className="h-accent">tests</span>
          </h2>
          <div className="dpage-cards">
            {others.map((t) => (
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

      <CallbackStrip service="test-preparation" />

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to get started?</h2>
            <p>Tell us your target score and your deadline, and we will work backwards.</p>
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
