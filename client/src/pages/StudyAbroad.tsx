import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { useYouTubeFeed } from "../hooks/useYouTubeFeed";

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

/* Destinations offered in the form. Kept in step with DESTINATIONS above. */
const FORM_DESTINATIONS = DESTINATIONS.map((d) => d.name);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const YEARS = ["2026", "2027", "2028", "2029"];

interface EnquiryForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  month: string;
  year: string;
}

const EMPTY: EnquiryForm = {
  firstName: "", lastName: "", email: "", phone: "", course: "", month: "", year: "",
};

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent"; message: string }
  | { state: "error"; message: string };

function EnquirySection() {
  const [form, setForm] = useState<EnquiryForm>(EMPTY);
  const [picked, setPicked] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const set = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]));

  /* Posts to the same /inquiries endpoint as every other form on the site,
     with the extra answers folded into the message — the endpoint takes a
     name, an email, a service and a message, and adding columns to it for
     one form would not be worth the migration. */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (status.state === "sending") return;
    setStatus({ state: "sending" });

    const detail = [
      picked.length ? `Destinations: ${picked.join(", ")}` : "Destinations: not specified",
      form.course ? `Course: ${form.course}` : null,
      form.month || form.year ? `Planned intake: ${[form.month, form.year].filter(Boolean).join(" ")}` : null,
    ].filter(Boolean);

    try {
      const res = await api.post<{ message: string }>("/inquiries", {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone ? `+977 ${form.phone}` : undefined,
        service: "study-abroad",
        source: "study-abroad",
        message: `Study abroad enquiry — ${detail.join("; ")}.`,
      });
      setStatus({ state: "sent", message: res.data.message });
      setForm(EMPTY);
      setPicked([]);
    } catch (err) {
      setStatus({ state: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <section className="dpage-section sa-form-section" id="enquiry">
      <div className="container sa-form-wrap">
        <div className="sa-form-intro">
          <p className="dpage-eyebrow-sm">Study Abroad</p>
          <h2 className="dpage-title">
            Let our team <span className="h-accent">reach out to you</span>
          </h2>
          <p className="dpage-section-lead">
            Tell us roughly where you are heading and when. You do not need to
            have it worked out — that is what the first conversation is for.
          </p>
          <ul className="dpage-checks">
            <li><span aria-hidden="true"><Check /></span>A counsellor replies within one working day</li>
            <li><span aria-hidden="true"><Check /></span>No charge for the first consultation</li>
            <li><span aria-hidden="true"><Check /></span>Your details are never passed to anyone else</li>
          </ul>
        </div>

        <form className="sa-form" onSubmit={submit} noValidate>
          <div className="sa-field-row">
            <label className="sa-field">
              <span>First name</span>
              <input name="firstName" value={form.firstName} onChange={set} required autoComplete="given-name" />
            </label>
            <label className="sa-field">
              <span>Last name</span>
              <input name="lastName" value={form.lastName} onChange={set} required autoComplete="family-name" />
            </label>
          </div>
          <div className="sa-field-row">
            <label className="sa-field">
              <span>Email</span>
              <input type="email" name="email" value={form.email} onChange={set} required autoComplete="email" />
            </label>
            <label className="sa-field">
              <span>Mobile</span>
              <div className="sa-phone">
                <span aria-hidden="true">+977</span>
                <input
                  name="phone" value={form.phone} onChange={set}
                  inputMode="tel" autoComplete="tel-national" placeholder="98XXXXXXXX"
                />
              </div>
            </label>
          </div>

          <fieldset className="sa-field sa-destinations">
            <legend>Preferred destination</legend>
            <p className="sa-hint">Choose as many as you like</p>
            <div className="sa-chips">
              {FORM_DESTINATIONS.map((name) => (
                <label key={name} className={picked.includes(name) ? "is-on" : undefined}>
                  <input
                    type="checkbox"
                    checked={picked.includes(name)}
                    onChange={() => toggle(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="sa-field">
            <span>Course you have in mind</span>
            <input
              name="course" value={form.course} onChange={set}
              placeholder="Business, engineering, nursing…"
            />
          </label>

          <div className="sa-field-row">
            <label className="sa-field">
              <span>When do you plan to study?</span>
              <select name="month" value={form.month} onChange={set}>
                <option value="">Select month</option>
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="sa-field">
              <span>Preferred year</span>
              <select name="year" value={form.year} onChange={set}>
                <option value="">Select year</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </label>
          </div>

          <button className="sa-submit" type="submit" disabled={status.state === "sending"}>
            {status.state === "sending" ? "Sending…" : "Request my consultation"}
            <Arrow />
          </button>

          {/* aria-live so the outcome is announced, not just shown */}
          <p className="sa-status" role="status" aria-live="polite">
            {status.state === "sent" && <span className="is-good">{status.message}</span>}
            {status.state === "error" && <span className="is-bad">{status.message}</span>}
          </p>
        </form>
      </div>
    </section>
  );
}

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
          <Shot src="/hero-study-abroad.jpg" alt="" />
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
              <Link className="dpage-jump" to="/contact">
                Talk to a counsellor <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Why students choose{" "}
            <span className="h-outline">Lakehead</span>
          </h2>
          <p className="dpage-section-lead">
            Guidance built around where you actually want to end up, from
            people who know each destination properly rather than generally.
          </p>
          <div className="sa-credentials">
            {CREDENTIALS.map((c) => (
              <div className="sa-credential" key={c.label}>
                <strong>{c.figure}</strong>
                <span className="sa-credential-label">{c.label}</span>
                <span className="sa-credential-note">{c.note}</span>
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

      <EnquirySection />

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Not sure where to start?</h2>
            <p>
              Most students aren&rsquo;t. Start with a conversation and
              we&rsquo;ll work out the rest together.
            </p>
          </div>
          <Link className="dpage-cta-btn" to="/contact">
            Talk to Our Counsellors <Arrow />
          </Link>
        </div>
      </section>
    </article>
  );
}
