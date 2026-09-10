import { useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Arrow, Shot } from "../components/destinationBits";
import { useYouTubeFeed } from "../hooks/useYouTubeFeed";
import RollingFigure from "../components/RollingFigure";
import HelpVideo from "../components/HelpVideo";
import TikTokStrip from "../components/TikTokStrip";
import ContactForm from "../components/ContactForm";

/**
 * Study Abroad — the landing page behind the navbar's "Study Abroad" item,
 * and the parent of the six per-country pages.
 *
 * Two rules carried over from those pages, for the same reasons:
 *
 *  - Every destination card routes to a page that exists. The source copy
 *    this was written from listed eighteen countries; we offer six, and a
 *    card that goes nowhere is worse than no card. Add a country here only
 *    when its page is built.
 *  - No borrowed credentials. See CREDENTIALS below.
 */

/**
 * What we tell people about ourselves.
 *
 * The source copy came with a block of figures — "since 1991", "24 branches
 * across India", "99% visa success rate", an AIRC award — that belong to the
 * Indian consultancy the text was lifted from, not to a Kathmandu business.
 * None of them are repeated here. The numbers below are the ones already
 * published on our own home page (see StatsStrip.tsx); keep the two in step,
 * and put nothing here that we could not evidence if a student asked.
 *
 * Note there is no visa-success-rate claim, deliberately: an approval rate
 * is a promise about someone else's decision, and every page on this site
 * is careful not to make one.
 */
const CREDENTIALS = [
  { figure: "1,100+", label: "Institution partners", note: "Universities and colleges we place students with" },
  { figure: "760,000+", label: "Students assisted", note: "Across our counselling and preparation services" },
  { figure: "200,000+", label: "Courses offered", note: "Undergraduate through to doctoral study" },
  { figure: "6", label: "Destinations covered", note: "Each with a dedicated team who know it properly" },
];

/* Only countries with a page behind them. */
const DESTINATIONS = [
  { name: "United Kingdom", to: "/study-in-uk", image: "/uk.jpg", blurb: "One-year master's degrees and a two-year graduate route." },
  { name: "United States", to: "/study-in-usa", image: "/usa.jpg", blurb: "World-ranked universities and campus life as a place, not a timetable." },
  { name: "Canada", to: "/study-in-canada", image: "/canada.jpg", blurb: "Affordable tuition, and a study permit route worth understanding early." },
  { name: "Australia", to: "/study-in-australia", image: "/australia.jpg", blurb: "Strong post-study work rights in every state." },
  { name: "New Zealand", to: "/study-in-new-zealand", image: "/newzealand.jpg", blurb: "Small classes by law, and up to three years of work rights after." },
  { name: "South Korea", to: "/study-in-south-korea", image: "/southkorea.jpg", blurb: "Technology, research, and a growing number of English-taught programmes." },
  /* EUROPE IS A REGION, so there is no one skyline that stands for it the
     way Sydney stands for Australia. Germany is the stand-in: it is the
     European destination most students arriving on this page actually mean,
     and it is the one photograph we hold. Swap it for a /europe.jpg the day
     somebody supplies one — the guide's own hero reads from the same file,
     so the two want changing together. */
  { name: "Europe", to: "/study-in-europe", image: "/germany.jpg", blurb: "Comparable degrees across thirty systems — and tuition that ranges from nothing to a great deal." },
];

const SUPPORT = [
  { title: "Course & career counselling", text: "Programmes that fit your academic background and the career you are actually working toward." },
  { title: "University selection", text: "Institutions compared on course, budget, location and entry requirements — not on rankings alone." },
  { title: "Application assistance", text: "Preparing and submitting your application, with the documents each institution actually asks for." },
  { title: "Test preparation", text: "IELTS, PTE and TOEFL preparation, timed so a poor first result is still recoverable." },
  { title: "Scholarship guidance", text: "Which awards you could realistically win, and what each one needs from you." },
  { title: "Visa assistance", text: "Understanding the process and preparing your application accurately. Decisions rest with the government concerned." },
  { title: "Pre-departure support", text: "Accommodation, insurance, travel and finances, before you leave Nepal." },
  { title: "After you arrive", text: "Settling in, and knowing who to call when something does not go to plan." },
];

/**
 * Student testimonials, from their own YouTube playlist — set
 * YOUTUBE_TESTIMONIALS_PLAYLIST_ID on the server and they appear here.
 * Until then the section renders nothing at all rather than showing
 * placeholder faces, which is the only honest way to hold space for a
 * testimonial you do not have yet.
 */
function StudentStories() {
  const videos = useYouTubeFeed("testimonials");
  const track = useRef<HTMLDivElement>(null);

  if (videos.length === 0) return null;

  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : el.clientWidth;
    const perView = Math.max(1, Math.round(el.clientWidth / step));
    el.scrollBy({ left: dir * step * perView, behavior: "smooth" });
  };

  return (
    <section className="dpage-section dpage-tint">
      <div className="container">
        <div className="success-head">
          <div>
            <h2 className="dpage-title">
              Meet our <span className="h-accent">students</span>
            </h2>
            <p className="dpage-section-lead">
              The people who have already made the move, in their own words.
            </p>
          </div>
          <div className="success-nav">
            <button type="button" onClick={() => scroll(-1)} aria-label="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
        <div className="video-track-wrap">
          <div className="video-track" ref={track}>
            {videos.map((v) => (
              <a
                className="video-card video-card-yt"
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={v.thumbnail} alt="" loading="lazy" decoding="async" />
                <figcaption>{v.title}</figcaption>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StudyAbroad() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study Abroad | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/hero-study-abroad.jpg" alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study Abroad
            </p>
            <h1>
              Your overseas education journey,{" "}
              <span className="h-accent">planned properly</span>
            </h1>
            <p className="dpage-lead">
              Studying abroad is more than earning a degree. It is a stretch —
              personal growth, genuine global exposure, and a career that
              starts from a wider base than it otherwise would.
            </p>
            <p>
              At Lakehead Education we help students from Nepal build
              cross-cultural confidence, widen their network and weigh
              international opportunities clearly. Experienced counsellors,
              honest advice, and the kind of guidance that turns a vague
              intention into an application with a date on it.
            </p>
            <div className="dpage-hero-actions">
              <a className="btn btn-outline" href="#enquiry">Free Expert Consultation →</a>
            </div>
          </div>
        </div>
      </header>

      {/* The figures as a band of their own: full width, one flat colour,
          the copy on the left and the numbers on the right. They used to be
          four columns of body-sized type under a heading, in among
          everything else on the page — read straight through, they went
          past as another paragraph. A band stops the page for them.

          The numbers roll up into place the first time they are scrolled
          to; see RollingFigure. */}
      <section className="sa-figures">
        <div className="container sa-figures-inner">
          <div className="sa-figures-copy">
            <h2 className="sa-figures-title">
              Why students choose Lakehead
            </h2>
            <p className="sa-figures-lead">
              Guidance built around where you actually want to end up, from
              people who know each destination properly rather than
              generally.
            </p>
          </div>

          <div className="sa-figures-grid">
            {CREDENTIALS.map((c) => (
              <div className="sa-figure" key={c.label}>
                <strong className="sa-figure-value">
                  <RollingFigure text={c.figure} />
                </strong>
                <span className="sa-figure-label">{c.label}</span>
                <span className="sa-figure-note">{c.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Your dream destination{" "}
            <span className="h-accent">awaits</span>
          </h2>
          <p className="dpage-section-lead">
            Explore the countries we place students in. Each page covers the
            universities, the courses, what it costs, the scholarships worth
            applying for, and the visa route in full.
          </p>
          <div className="dpage-cards">
            {DESTINATIONS.map((d) => (
              <Link className="dpage-card" to={d.to} key={d.name}>
                <div className="dpage-card-shot">
                  <Shot src={d.image} alt="" />
                </div>
                <div className="dpage-card-body">
                  <h3>Study in {d.name}</h3>
                  <p>{d.blurb}</p>
                  <span className="dpage-card-more">
                    Explore <Arrow />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            What our support <span className="h-accent">covers</span>
          </h2>
          <p className="dpage-section-lead">
            End to end, from the first conversation to the week after you land.
          </p>
          <div className="sa-support">
            {SUPPORT.map((s, i) => (
              <div className="sa-support-item" key={s.title}>
                <span className="sa-support-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StudentStories />


      {/* Beside the writing it explains rather than on the home page —
          somebody with this question is already here. Renders nothing until
          a clip in this category is published. */}
      <TikTokStrip
        category="study-abroad"
        eyebrow="On TikTok"
        heading={<>Studying abroad, <span className="h-accent">explained</span></>}
      />

      {/* The shared form, in place of the band that used to sit here. That
          one asked a question and then sent you to another page to answer
          it; this one takes the answer where it is asked. */}
      {/* `id="enquiry"` inherited from the form this replaced, so the
          hero's "Free Expert Consultation" button still has somewhere to
          go. */}
      <ContactForm
        id="enquiry"
        source="study-abroad"
        heading="Not sure where to start?"
        lead="Most students aren't. Tell us roughly where you are — a country in mind, a score you need, or nothing at all beyond wanting to go — and we will work out the rest together."
      />
      {/* The one video for the whole site. Renders nothing until an id
          is set in config/video.ts. */}
      <HelpVideo />
    </article>
  );
}
