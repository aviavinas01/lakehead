import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { SERVICES, findService } from "../data/services";
import HelpVideo from "../components/HelpVideo";

/**
 * One page, every service. The route is /services/:slug and everything on the
 * page comes from data/services.ts — so a new service needs an entry there
 * and nothing else.
 *
 * An unrecognised slug sends the visitor back to the hub rather than showing
 * an empty page: these URLs are short and guessable, and someone mistyping
 * one should land somewhere useful.
 */
export default function ServiceDetail() {
  const { slug } = useParams();
  const service = findService(slug);

  useEffect(() => {
    if (!service) return;
    const previous = document.title;
    document.title = `${service.title} | Lakehead Education`;
    return () => {
      document.title = previous;
    };
  }, [service]);

  if (!service) return <Navigate to="/services" replace />;

  const others = SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <article className="dpage dpage-ruled">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src={service.image} alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services">Student Services</Link>
            </p>
            <h1>{service.title}</h1>
            <p className="dpage-lead">{service.intro}</p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Book a Consultation →</Link>
              <Link className="dpage-jump" to="/services">
                All services <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              What this <span className="h-accent">covers</span>
            </h2>
            <ul className="dpage-checks">
              {service.includes.map((item) => (
                <li key={item}>
                  <span aria-hidden="true"><Check /></span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="dpage-fineprint">{service.closing}</p>
          </div>
          <aside className="dpage-callout">
            <h3>Talk it through first</h3>
            <p>
              The first consultation costs nothing and carries no obligation to
              use anything else. Come with questions.
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
            Our other <span className="h-accent">services</span>
          </h2>
          <div className="dpage-cards">
            {others.map((s) => (
              <Link className="dpage-card" to={`/services/${s.slug}`} key={s.slug}>
                <div className="dpage-card-shot">
                  <Shot src={s.image} alt="" />
                </div>
                <div className="dpage-card-body">
                  <h3>{s.title}</h3>
                  <p>{s.summary}</p>
                  <span className="dpage-card-more">
                    Learn more <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to get started?</h2>
            <p>Tell us where you are, and we will tell you what comes next.</p>
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
