import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";

/**
 * Study in South Korea — the sixth destination page. Section styles are
 * shared with the others under .dpage; only the content lives here.
 *
 * Same editorial rules as the rest: describe options and process, never
 * promise an outcome, keep anything with a shelf life out of the prose.
 */

/* ------------------------------------------------------------------
   VOLATILE FACTS. Korean visa categories, TOPIK thresholds and the GKS
   application schedule are set by the Korean government and revised
   annually — GKS in particular changes its participating universities and
   benefits every cycle. Stamped and sourced here rather than in the prose.

   Re-check against Study in Korea and move `lastReviewed` when you do.
   ------------------------------------------------------------------ */
const REQUIREMENTS = {
  lastReviewed: "August 2026",
  source: {
    label: "Study in Korea (Korean government)",
    href: "https://www.studyinkorea.go.kr/",
  },
  items: [
    { label: "Visa", value: "D-2 for degree study", note: "Language training falls under a different category" },
    { label: "Language", value: "TOPIK, or an English-taught route", note: "The threshold is set by each university" },
    { label: "Apply through", value: "The university's own system", note: "Routes differ by institution" },
    { label: "Scholarships", value: "GKS and university awards", note: "Schedules and benefits change each year" },
    { label: "Confirm with", value: "Korean immigration", note: "And the relevant diplomatic mission" },
  ],
};

/* Both figures come from Korean government publications and are quoted as
   averages, which is what they are — the spread between a national
   university outside Seoul and a private one inside it is wide. Stamped so
   they get re-checked rather than quietly ageing in the copy. */
const COSTS = {
  lastReviewed: "August 2026",
  note: "Government-published averages. Actual costs depend heavily on the institution, the discipline and the city — Seoul generally requires a larger budget than elsewhere, and engineering, medicine and the arts often sit above the average.",
  rows: [
    { item: "Average undergraduate tuition", cost: "KRW 6.82 million / year" },
    { item: "Average living expenses", cost: "KRW 750,000 – 1,000,000 / month" },
  ],
};

const REASONS = [
  {
    icon: "\u{1F393}",
    title: "Strong academic opportunities",
    text: "Respected universities and specialised institutions offering programmes across engineering, technology, business, science, medicine, humanities and a great deal more — several of them internationally recognised.",
  },
  {
    icon: "\u{1F4BB}",
    title: "Technology and innovation",
    text: "Korea is recognised globally for its strength in technology, research, engineering and innovation. If you are drawn to IT, artificial intelligence, electronics, robotics or the sciences, there is real depth here.",
  },
  {
    icon: "\u{1F30F}",
    title: "An international student environment",
    text: "Korean universities take students from around the world, so you will study alongside people from a wide mix of cultures and backgrounds rather than in a bubble.",
  },
  {
    icon: "\u{1F4B0}",
    title: "Competitive study costs",
    text: "Compared with many major Western destinations, Korea can be relatively manageable on both tuition and living costs — though this varies significantly by university, course and city, and national or public institutions generally cost less than private ones.",
  },
  {
    icon: "\u{1F38E}",
    title: "A genuinely different culture",
    text: "Traditional temples and historic neighbourhoods alongside some of the most modern cities anywhere, plus the food, the music and the entertainment. It is a distinctive mix of tradition and modern life, and it is a large part of why students choose it.",
  },
];

const UNIVERSITIES = [
  { name: "Seoul National University", known: "Business, sciences, engineering, medicine, humanities" },
  { name: "Yonsei University", known: "Business, medicine, liberal arts, social sciences" },
  { name: "Korea University", known: "Business, law, engineering, social sciences" },
  { name: "KAIST", known: "Engineering, technology, computer science, research" },
  { name: "POSTECH", known: "Engineering, science, technology, research" },
  { name: "Sungkyunkwan University", known: "Business, engineering, sciences, humanities" },
  { name: "Hanyang University", known: "Engineering, business, technology, design" },
];

const FIELDS = [
  "Information Technology & Computer Science",
  "Artificial Intelligence & Data Science",
  "Engineering",
  "Business & Management",
  "Accounting & Finance",
  "Biotechnology & Life Sciences",
  "Medicine & Health Sciences",
  "Media & Communication",
  "Design & Creative Arts",
  "Hospitality & Tourism",
  "Social Sciences",
  "Humanities",
];

const GKS_BENEFITS = [
  "Tuition support",
  "Korean language training",
  "Airfare",
  "Study or academic allowances",
  "Other scholarship benefits",
];

const APPLY_STEPS = [
  { n: "01", title: "Choose your course & university", text: "Identify programmes that match your academic background, interests, budget and future career plans." },
  { n: "02", title: "Check the entry requirements", text: "Review academic qualifications, language requirements, application deadlines and supporting documents." },
  { n: "03", title: "Prepare your application", text: "Organise your academic records, passport, recommendation letters, personal statements and language scores." },
  { n: "04", title: "Apply to your chosen university", text: "Submit through the university's designated application system or the relevant admission route." },
  { n: "05", title: "Explore scholarships", text: "Check whether you qualify for GKS or university-specific awards, and prepare those materials too." },
  { n: "06", title: "Receive your admission", text: "Once accepted, review your admission documents and prepare for the next stage." },
  { n: "07", title: "Apply for your student visa", text: "With admission secured, prepare the documents required for the appropriate Korean student visa." },
  { n: "08", title: "Prepare for departure", text: "Arrange accommodation, insurance, travel, finances and the rest before leaving Nepal." },
];

const BUDGET_LINES = [
  "Tuition fees",
  "Accommodation",
  "Food",
  "Transportation",
  "Health insurance",
  "Visa-related expenses",
  "Study materials",
  "Personal expenses",
  "Travel",
];

const VISA_SUPPORT = [
  "Document preparation guidance",
  "Application assistance",
  "Financial-document guidance",
  "Admission-document review",
  "Visa preparation",
  "Pre-departure counselling",
];

const LIFE = [
  { icon: "\u{1F306}", title: "Vibrant cities", text: "Seoul offers an energetic student lifestyle, while Busan, Daejeon, Daegu and Pohang each provide a different environment and their own education opportunities." },
  { icon: "\u{1F687}", title: "Getting around", text: "Korea's public transport network is extensive and genuinely easy to use, which makes exploring the rest of the country straightforward." },
  { icon: "\u{1F35C}", title: "Korean culture", text: "Food and traditional markets through to K-pop, festivals, museums and historic sites — there is a great deal beyond university life." },
  { icon: "\u{1F91D}", title: "An international network", text: "Studying alongside people from many countries builds friendships, cultural awareness, communication skills and a network that outlasts the degree." },
];

const OUR_SUPPORT = [
  { title: "Course & career counselling", text: "Find programmes that fit your academic background and your future plans." },
  { title: "University selection", text: "Compare institutions on course, budget, location and goals." },
  { title: "Application assistance", text: "Support preparing and submitting your university application." },
  { title: "Scholarship guidance", text: "Explore GKS and university-specific funding opportunities." },
  { title: "Visa assistance", text: "Understand the documentation and the application process for your student visa." },
  { title: "Pre-departure support", text: "Accommodation, travel, finances and the transition to life in Korea." },
];

const GALLERY = [
  { src: "/southkorea/seoul.jpg", alt: "The Seoul skyline at night" },
  { src: "/southkorea/campus-life.jpg", alt: "Students on a Korean university campus" },
  { src: "/southkorea/temple.jpg", alt: "A traditional Korean temple" },
  { src: "/southkorea/street-food.jpg", alt: "A Korean street food market" },
];

export default function StudyInSouthKorea() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study in South Korea | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/southkorea.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in South Korea
            </p>
            <h1>
              Discover new opportunities in the{" "}
              <span className="h-accent">heart of Asia</span>
            </h1>
            <p className="dpage-lead">
              South Korea has grown into an exciting destination for
              international students, combining strong academic institutions,
              modern technology, vibrant cities and a genuinely different
              cultural experience. Internationally recognised universities,
              advanced research facilities, and a growing number of
              English-taught programmes.
            </p>
            <p>
              Beyond the classroom, there is the energy of Seoul, Korean food
              and traditions, K-pop and K-drama culture, and connections built
              in one of Asia&rsquo;s most dynamic countries. At Lakehead
              Education we help students from Nepal explore suitable
              universities, courses, scholarships and admission pathways.
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
            Why choose <span className="h-outline">South Korea?</span>
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
        <Shot src="/southkorea/campus.jpg" alt="A university campus in South Korea" />
        <figcaption>
          <p>Tradition and modern innovation, side by side.</p>
          <span>Temples and historic neighbourhoods within reach of some of the most advanced research facilities anywhere.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Popular <span className="h-accent">universities</span>
          </h2>
          <p className="dpage-section-lead">
            South Korea has institutions suited to a wide range of academic
            interests and career goals.
          </p>
          <div className="dpage-table-wrap dpage-table-plain">
            <div className="dpage-table-scroll">
              <table className="dpage-table">
                <caption className="dpage-visually-hidden">
                  Popular Korean universities and the fields they are known for
                </caption>
                <thead>
                  <tr>
                    <th scope="col">University</th>
                    <th scope="col">Known for</th>
                  </tr>
                </thead>
                <tbody>
                  {UNIVERSITIES.map((u) => (
                    <tr key={u.name}>
                      <th scope="row">{u.name}</th>
                      <td className="dpage-table-text">{u.known}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dpage-table-note">
              Rankings change from year to year, and current positions should
              always be checked against the latest university and QS data
              before you apply. Weigh course content, tuition, location,
              admission requirements, scholarships and your career goals —
              not rankings alone.
            </p>
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            What can you <span className="h-accent">study?</span>
          </h2>
          <p className="dpage-section-lead">
            Korean institutions offer programmes across a broad range of
            disciplines:
          </p>
          <ul className="dpage-fields">
            {FIELDS.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="dpage-note">
            You will find both Korean-language programmes and universities
            teaching in English.{" "}
            <Link to="/contact">
              Let us help you find the right fit <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <div className="dpage-pair">
        <figure><Shot src="/southkorea/city.jpg" alt="A busy street in Seoul" /></figure>
        <figure><Shot src="/southkorea/student-life.jpg" alt="Students studying together in Korea" /></figure>
      </div>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Scholarships for{" "}
            <span className="h-accent">international students</span>
          </h2>
          <p className="dpage-section-lead">
            One of the real attractions of studying in Korea is the range of
            scholarships open to international students.
          </p>
          <div className="dpage-split">
            <div>
              <h3 className="dpage-sub">Global Korea Scholarship (GKS)</h3>
              <p className="dpage-section-lead">
                A Korean government programme supporting international students
                studying in Korea. Depending on the specific programme and
                level of study, GKS may provide:
              </p>
              <ul className="dpage-checks">
                {GKS_BENEFITS.map((b) => (
                  <li key={b}>
                    <span aria-hidden="true"><Check /></span>
                    {b}
                  </li>
                ))}
              </ul>
              <p className="dpage-fineprint">
                The exact benefits, eligibility requirements, participating
                universities and application schedule vary by programme and by
                year — the Korean government publishes the current
                requirements through its official Study in Korea system.
              </p>
            </div>
            <aside className="dpage-callout">
              <h3>University scholarships</h3>
              <p>
                Many Korean universities run their own awards for international
                students, based on academic performance, admission results,
                language proficiency or their own criteria. Some offer
                substantial tuition reductions — but eligibility varies a great
                deal between institutions.
              </p>
              <Link className="dpage-callout-btn" to="/contact">
                Find ones that match me <Arrow />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            How to <span className="h-accent">apply</span>
          </h2>
          <p className="dpage-section-lead">
            Requirements differ between universities and programmes, but the
            general process runs through these stages.
          </p>
          <ol className="dpage-steps">
            {APPLY_STEPS.map((s) => (
              <li key={s.n}>
                <span className="dpage-step-n" aria-hidden="true">{s.n}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container dpage-split">
          <div>
            <h2 className="dpage-title">
              Do you need to know{" "}
              <span className="h-accent">Korean?</span>
            </h2>
            <p className="dpage-section-lead">
              Not necessarily. It depends on the university, the degree and the
              programme you choose. Korean-taught programmes may require a
              certain level of TOPIK proficiency, while a growing number of
              programmes are available in English.
            </p>
            <p className="dpage-fineprint">
              The Korean government notes that TOPIK requirements vary by
              university and programme, so confirm the exact requirement with
              your chosen institution rather than assuming.
            </p>
          </div>
          <aside className="dpage-callout">
            <h3>Learn some anyway</h3>
            <p>
              Even if your course is taught entirely in English, basic Korean
              makes everyday life considerably easier and helps you communicate
              comfortably outside the classroom. It is the difference between
              visiting a country and living in one.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Ask about preparation <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-section dpage-tint" id="costs">
        <div className="container">
          <h2 className="dpage-title">
            What does it <span className="h-accent">cost?</span>
          </h2>
          <p className="dpage-section-lead">
            Your total budget depends on your university, course, city,
            accommodation and lifestyle. These are the government-published
            averages to start from.
          </p>

          <div className="dpage-table-wrap">
            <div className="dpage-req-head">
              <h3>Published averages</h3>
              <span className="dpage-req-stamp">
                Indicative &middot; reviewed {COSTS.lastReviewed}
              </span>
            </div>
            <div className="dpage-table-scroll">
              <table className="dpage-table">
                <caption className="dpage-visually-hidden">
                  Average tuition and living costs in Korean won
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {COSTS.rows.map((r) => (
                    <tr key={r.item}>
                      <th scope="row">{r.item}</th>
                      <td>{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dpage-table-note">{COSTS.note}</p>
          </div>

          <h3 className="dpage-sub">Plan your finances carefully</h3>
          <p className="dpage-section-lead">
            Before you apply, build a realistic budget covering:
          </p>
          <ul className="dpage-checks dpage-checks-2">
            {BUDGET_LINES.map((b) => (
              <li key={b}>
                <span aria-hidden="true"><Check /></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/southkorea/street-life.jpg" alt="An evening street scene in Korea" />
        <figcaption>
          <p>The energy of Seoul, and everywhere it connects to.</p>
          <span>Busan, Daejeon, Daegu and Pohang each offer a different environment — and the transport network makes all of it reachable.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Your <span className="h-outline">student visa</span>
          </h2>
          <p className="dpage-section-lead">
            International students generally need the Korean visa matching the
            type and level of study they intend to undertake. For degree-level
            academic programmes the D-2 category is commonly used, while
            language-training programmes fall under different classifications.
          </p>

          {/* Its own panel on purpose: categories, thresholds and the GKS
              schedule are revised annually. */}
          <div className="dpage-req">
            <div className="dpage-req-head">
              <h3>Latest requirements at a glance</h3>
              <span className="dpage-req-stamp">
                Last reviewed {REQUIREMENTS.lastReviewed}
              </span>
            </div>
            <dl className="dpage-req-grid dpage-req-grid-5">
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
              Visa requirements vary with your course and circumstances, and
              they change. Always check the latest position with the Korean
              immigration authorities, the relevant Korean diplomatic mission,
              and{" "}
              <a href={REQUIREMENTS.source.href} target="_blank" rel="noopener noreferrer">
                {REQUIREMENTS.source.label}
              </a>{" "}
              before you apply.
            </p>
          </div>

          <h3 className="dpage-sub">We can help you prepare</h3>
          <ul className="dpage-checks dpage-checks-2">
            {VISA_SUPPORT.map((v) => (
              <li key={v}>
                <span aria-hidden="true"><Check /></span>
                {v}
              </li>
            ))}
          </ul>
          <p className="dpage-fineprint">
            We help you understand the process and prepare your application
            carefully. Visa decisions are made by the relevant Korean
            authorities.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Life as an <span className="h-accent">international student</span>
          </h2>
          <p className="dpage-section-lead">
            Studying in Korea gives you a country where traditional culture and
            modern innovation genuinely sit side by side.
          </p>
          <div className="dpage-reasons dpage-reasons-4">
            {LIFE.map((l) => (
              <div className="dpage-reason" key={l.title}>
                <span className="dpage-reason-icon" aria-hidden="true">{l.icon}</span>
                <h3>{l.title}</h3>
                <p>{l.text}</p>
              </div>
            ))}
          </div>
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
            Why choose{" "}
            <span className="h-accent">Lakehead Education?</span>
          </h2>
          <p className="dpage-section-lead">
            Planning to study in another country can feel complicated,
            especially when you are comparing universities, scholarships, costs
            and visa requirements at the same time. We make it easier with
            guidance built around your goals.
          </p>
          <div className="dpage-cities dpage-cities-auto">
            {OUR_SUPPORT.map((s) => (
              <div className="dpage-city" key={s.title}>
                <h3>
                  <span className="dpage-city-pin" aria-hidden="true"><Pin /></span>
                  {s.title}
                </h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to explore South Korea?</h2>
            <p>
              Your journey doesn&rsquo;t have to begin with knowing exactly what
              you want. Start with a conversation — we&rsquo;ll help you
              compare universities and plan your next steps.
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
