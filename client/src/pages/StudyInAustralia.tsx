import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";

/**
 * Study in Australia — the first of the per-destination pages.
 *
 * The copy deliberately describes options and process rather than promising
 * outcomes: no student-numbers claims, no "recognised everywhere", no cost
 * ranges, and nothing that reads as a guarantee about a visa decision. Keep
 * that tone if you extend the page — it is the part that cannot be fixed
 * later.
 *
 * When you build the next destination, copy this file rather than
 * generalising it: the sections are shaped around what Australia actually
 * offers (VET, OSHC, subclass 500), and forcing eight countries through one
 * template is how these pages end up saying nothing.
 */

/* ------------------------------------------------------------------
   VOLATILE FACTS — everything on this page with a shelf life lives here.
   Visa charges and conditions move on the government's schedule, not ours:
   the student visa application charge changed again on 1 July 2026. Keeping
   them in one stamped block means the page can be brought up to date in a
   minute, and a reader can see how fresh it is. Do not restate these
   figures in the prose below — a number in two places is a number that will
   eventually disagree with itself.

   Re-check against the official source and move `lastReviewed` when you do.
   ------------------------------------------------------------------ */
const REQUIREMENTS = {
  lastReviewed: "August 2026",
  source: {
    label: "Department of Home Affairs",
    href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
  },
  items: [
    { label: "Visa", value: "Student visa (subclass 500)", note: "" },
    { label: "Application charge", value: "AUD 2,500", note: "From 1 July 2026" },
    { label: "Health cover", value: "OSHC for your full stay", note: "Unless an exemption applies" },
    { label: "Work rights", value: "While your course is in session", note: "Subject to your visa conditions" },
  ],
};

const REASONS = [
  {
    icon: "\u{1F393}",
    title: "Globally recognised education",
    text: "Australian institutions offer qualifications across undergraduate, postgraduate, vocational and English-language study. The Australian Qualifications Framework (AQF) provides a national framework for qualifications and supports recognition and pathways between different levels of education.",
  },
  {
    icon: "\u{1F30F}",
    title: "A truly international experience",
    text: "Australian campuses bring together students from different countries and cultural backgrounds, giving you the opportunity to develop communication skills, independence and international connections.",
  },
  {
    icon: "\u{1F4BC}",
    title: "Career-focused learning",
    text: "Many Australian programs combine academic learning with practical and industry-relevant skills. Depending on your chosen course, you may have opportunities to develop experience that complements your long-term career plans.",
  },
  {
    icon: "\u{1F4DA}",
    title: "Flexible study pathways",
    text: "You don't always have to enter university directly. Australia offers pathways through foundation programs, VET, TAFE and English-language courses that can help you work toward your preferred higher-education qualification.",
  },
  {
    icon: "\u{1F3D9}\u{FE0F}",
    title: "Diverse places to live and study",
    text: "From major cities to regional destinations, Australia offers different environments and lifestyles to suit different students and budgets.",
  },
];

const FIELDS = [
  "Business & Management",
  "Accounting & Finance",
  "Information Technology",
  "Engineering & Technology",
  "Health & Medicine",
  "Science & Mathematics",
  "Architecture & Construction",
  "Media & Communications",
  "Hospitality & Tourism",
  "Environmental Studies",
  "Law",
  "Creative Arts & Design",
];

const PATHWAYS = [
  {
    title: "Universities & higher education",
    text: "Choose from undergraduate degrees, graduate certificates, graduate diplomas, master's programs and doctoral studies across a wide range of disciplines.",
  },
  {
    title: "Vocational education & training",
    text: "VET programs focus on practical and industry-related skills, and can also provide pathways toward further higher education.",
  },
  {
    title: "English language programs",
    text: "English-language courses can help you strengthen your communication skills or prepare for further study in an English-speaking academic environment.",
  },
  {
    title: "Foundation & pathway programs",
    text: "If you don't immediately meet the entry requirements for your preferred degree, a pathway program may provide an alternative route into higher education.",
  },
];

const CITIES = [
  { name: "Sydney", text: "A vibrant, multicultural city with a wide range of education providers and career opportunities." },
  { name: "Melbourne", text: "Known for its cultural diversity, student lifestyle and extensive education options." },
  { name: "Brisbane", text: "A growing student destination offering a warmer climate and relaxed lifestyle." },
  { name: "Adelaide", text: "A student-friendly city with a strong education sector and a different living environment from Australia's larger metropolitan centres." },
  { name: "Perth", text: "A Western Australian city known for its beaches, outdoor lifestyle and growing education sector." },
  { name: "Canberra", text: "Australia's capital city, home to major institutions, government organisations and universities." },
  { name: "Hobart", text: "A smaller destination offering a different pace of life and access to Tasmania's unique natural environment." },
];

const COST_FACTORS = [
  "Your chosen course and institution",
  "Level of study",
  "Location",
  "Accommodation",
  "Transportation",
  "Daily lifestyle",
  "Course-related expenses",
  "Health insurance",
];

const SCHOLARSHIP_HELP = [
  "Identify suitable scholarship opportunities",
  "Understand eligibility requirements",
  "Prepare supporting documents",
  "Review scholarship applications",
  "Explore universities that fit your budget",
];

const VISA_STEPS = [
  { n: "01", title: "Document preparation", text: "Understand the documents and information required for your application." },
  { n: "02", title: "Application guidance", text: "Get support throughout the visa application process." },
  { n: "03", title: "Financial documentation", text: "Understand the financial evidence relevant to your application." },
  { n: "04", title: "Interview & preparation", text: "Prepare for questions and requirements that may apply to your application." },
  { n: "05", title: "Pre-departure guidance", text: "Get ready for your move once your visa is approved." },
];

const LIFE = [
  "Modern and diverse cities",
  "Beaches and coastal destinations",
  "Outdoor activities",
  "Multicultural communities",
  "Student clubs and social events",
  "Public transport networks",
  "Cafés, restaurants and entertainment",
  "Unique Australian landscapes",
];

const GALLERY = [
  { src: "/australia/sydney.jpg", alt: "Sydney Opera House and the harbour" },
  { src: "/australia/campus-life.jpg", alt: "Students on an Australian university campus" },
  { src: "/australia/beach.jpg", alt: "An Australian beach at golden hour" },
  { src: "/australia/outback.jpg", alt: "The Australian outback" },
];

const JOURNEY = [
  "Counselling",
  "Course selection",
  "University application",
  "Scholarship guidance",
  "Visa assistance",
  "Pre-departure support",
];

export default function StudyInAustralia() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study in Australia | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/australia.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in Australia
            </p>
            <h1>
              Turn your study abroad plans into a{" "}
              <span className="h-accent">global future</span>
            </h1>
            <p className="dpage-lead">
              Australia is one of the world&rsquo;s most popular destinations
              for international students, offering a wide range of
              universities, vocational institutions, English-language programs
              and study pathways — qualifications valued internationally,
              diverse study options and vibrant student cities.
            </p>
            <p>
              Whether you&rsquo;re planning to study business, IT, engineering,
              healthcare, hospitality, science or another field, you&rsquo;ll
              find courses designed for different academic backgrounds and
              career goals. At Lakehead Education we help you make informed
              decisions at every stage — from choosing a suitable course and
              institution to preparing your application and getting ready for
              life in Australia.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Talk to Our Counsellors →</Link>
              <a className="dpage-jump" href="#costs">
                See what it costs <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Why study in <span className="h-outline">Australia?</span>
          </h2>
          <div className="dpage-reasons">
            {REASONS.map((r) => (
              <div className="dpage-reason" key={r.title}>
                <span className="dpage-reason-icon" aria-hidden="true">{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/australia/campus.jpg" alt="An Australian university campus" />
        <figcaption>
          <p>Campuses that bring the whole world into one room.</p>
          <span>Qualifications valued internationally, taught somewhere you will actually want to spend three years.</span>
        </figcaption>
      </figure>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            What can you <span className="h-accent">study?</span>
          </h2>
          <p className="dpage-section-lead">
            Australia offers programs across a wide range of academic and
            professional fields. Your choice of course should be based on your
            academic background, career plans, budget and preferred study
            destination.
          </p>
          <ul className="dpage-fields">
            {FIELDS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="dpage-note">
            Not sure which course is right for you?{" "}
            <Link to="/contact">
              Our counsellors can help you explore your options <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Study options &amp; <span className="h-accent">pathways</span>
          </h2>
          <p className="dpage-section-lead">
            Australia&rsquo;s education system gives students several ways to
            reach their academic goals.
          </p>
          <div className="dpage-paths">
            {PATHWAYS.map((p, i) => (
              <div className="dpage-path" key={p.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Popular study <span className="h-accent">destinations</span>
          </h2>
          <p className="dpage-section-lead">
            You can choose from a variety of Australian cities and regions
            depending on your course, lifestyle and budget.
          </p>
          <div className="dpage-cities">
            {CITIES.map((c) => (
              <div className="dpage-city" key={c.name}>
                <h3>
                  <span className="dpage-city-pin" aria-hidden="true"><Pin /></span>
                  {c.name}
                </h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <p className="dpage-note">
            The best destination depends on more than just the city — we&rsquo;ll
            help you compare your options based on your course, budget and
            future plans.
          </p>
        </div>
      </section>

      <div className="dpage-pair">
        <figure><Shot src="/australia/city.jpg" alt="An Australian city street" /></figure>
        <figure><Shot src="/australia/coast.jpg" alt="The Australian coastline" /></figure>
      </div>

      <section className="dpage-section" id="costs">
        <div className="container">
          <h2 className="dpage-title">
            Understanding the <span className="h-accent">cost</span>
          </h2>
          <div className="dpage-split">
            <div>
              <p className="dpage-section-lead">
                Planning your finances before applying is an important part of
                your study-abroad journey. Your overall expenses can depend on:
              </p>
              <ul className="dpage-checks">
                {COST_FACTORS.map((f) => (
                  <li key={f}>
                    <span aria-hidden="true"><Check /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="dpage-fineprint">
                International tuition fees vary considerably between
                institutions, courses and locations, so check the current fees
                for your specific program rather than relying on a single
                average figure. Study Australia also publishes a cost-of-living
                calculator to help you estimate your expenses.
              </p>
            </div>
            <aside className="dpage-callout">
              <h3>Plan your budget before you apply</h3>
              <p>
                We can help you build a realistic study budget covering
                tuition, living expenses, insurance and other expected costs
                before you make your decision.
              </p>
              <Link className="dpage-callout-btn" to="/contact">
                Build my budget <Arrow />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              Scholarships &amp; <span className="h-accent">financial support</span>
            </h2>
            <p className="dpage-section-lead">
              Studying overseas is a significant investment, but scholarships
              and other funding opportunities may be available depending on
              your academic profile, chosen institution and course. Eligibility
              and benefits vary, so it&rsquo;s important to check the
              requirements of each opportunity carefully.
            </p>
          </div>
          <div>
            <p className="dpage-eyebrow-sm">Our counsellors can help you</p>
            <ul className="dpage-checks">
              {SCHOLARSHIP_HELP.map((s) => (
                <li key={s}>
                  <span aria-hidden="true"><Check /></span>
                  {s}
                </li>
              ))}
            </ul>
            <Link className="dpage-jump" to="/contact">
              Find opportunities that match your profile <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/australia/student-life.jpg" alt="Students together in an Australian city" />
        <figcaption>
          <p>Strong post-study work rights, in every state.</p>
          <span>The part of the plan that starts the day you graduate — worth understanding before you choose a course.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Australia <span className="h-outline">student visa</span>
          </h2>
          <p className="dpage-section-lead">
            Once you&rsquo;ve selected your course and received the necessary
            enrolment documentation, the next step is preparing your student
            visa application. The Student visa allows eligible international
            students to study in Australia and, subject to visa conditions,
            work while their course is in session. Applicants must meet the
            relevant requirements, including enrolment and health-insurance
            obligations.
          </p>

          {/* Its own panel on purpose: these are the facts most likely to go
              out of date, so they are stamped and sourced rather than folded
              into the prose where nobody would think to check them. */}
          <div className="dpage-req">
            <div className="dpage-req-head">
              <h3>Latest requirements at a glance</h3>
              <span className="dpage-req-stamp">
                Last reviewed {REQUIREMENTS.lastReviewed}
              </span>
            </div>
            <dl className="dpage-req-grid">
              {REQUIREMENTS.items.map((it) => (
                <div key={it.label}>
                  <dt>{it.label}</dt>
                  <dd>
                    {it.value}
                    {it.note && <span className="dpage-req-note">{it.note}</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="dpage-req-source">
              Requirements and charges change. Always confirm the current
              details with the{" "}
              <a href={REQUIREMENTS.source.href} target="_blank" rel="noopener noreferrer">
                {REQUIREMENTS.source.label}
              </a>{" "}
              before you apply.
            </p>
          </div>

          <h3 className="dpage-sub">Our visa support includes</h3>
          <ol className="dpage-steps">
            {VISA_STEPS.map((s) => (
              <li key={s.n}>
                <span className="dpage-step-n" aria-hidden="true">{s.n}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="dpage-fineprint">
            Visa decisions are made by the Australian Government. Our role is to
            help you understand the process and prepare your application
            accurately.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              Health <span className="h-accent">insurance</span>
            </h2>
            <p className="dpage-section-lead">
              International students generally need Overseas Student Health
              Cover (OSHC) for the duration of their stay, unless an applicable
              exemption applies. We can guide you through the insurance
              requirements and help you understand what coverage you need
              before travelling to Australia.
            </p>
          </div>
          <div>
            <h2 className="dpage-title">
              What is <span className="h-accent">life</span> like?
            </h2>
            <p className="dpage-section-lead">
              Studying in Australia is about more than attending classes — your
              experience will depend greatly on the city and community you
              choose.
            </p>
            <ul className="dpage-fields dpage-fields-sm">
              {LIFE.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint dpage-section-tight">
        <div className="container">
          <div className="dpage-gallery">
            {GALLERY.map((g) => (
              <figure key={g.src}>
                <Shot src={g.src} alt={g.alt} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Your journey starts with the{" "}
            <span className="h-accent">right plan</span>
          </h2>
          <p className="dpage-section-lead">
            Choosing a course and university can feel overwhelming when
            you&rsquo;re making decisions from Nepal. You don&rsquo;t have to
            figure everything out on your own — we support students through
            every major stage.
          </p>
          <ol className="dpage-journey">
            {JOURNEY.map((j) => (
              <li key={j}>{j}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to explore Australia?</h2>
            <p>
              We&rsquo;ll help you understand your options, make informed
              decisions and prepare for your next step.
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
