import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";

/**
 * Study in the UK — the third destination page. Section styles are shared
 * with Australia and Canada under .dpage; only the content lives here.
 *
 * Same editorial rules as the other two: describe options and process, never
 * promise an outcome, and keep anything with a shelf life out of the prose.
 *
 * One thing to watch if you edit this page: "Tier 4" is dead terminology.
 * The UK replaced it with the Student and Child Student routes in 2020, and
 * a lot of competitor pages still say Tier 4 because they were written
 * before that and never revisited. Saying it here would date the page by
 * half a decade at a glance.
 */

/* ------------------------------------------------------------------
   VOLATILE FACTS. UK visa fees, the health surcharge and maintenance
   thresholds are all set by the Home Office and reviewed regularly — the
   application fee alone has moved several times in recent years. None of
   them appear in the prose below; they live here, stamped and sourced.

   `value: "Confirm current fee"` is deliberate, not a placeholder we forgot:
   quoting a fee we cannot verify is worse than sending someone to the page
   that always has the right one. Fill it in once you have checked, and move
   `lastReviewed` when you do.
   ------------------------------------------------------------------ */
const REQUIREMENTS = {
  lastReviewed: "August 2026",
  source: {
    label: "UK Home Office",
    href: "https://www.gov.uk/student-visa",
  },
  items: [
    { label: "Route", value: "Student route", note: "Child Student route for ages 4–17" },
    { label: "You need a CAS", value: "From a licensed sponsor", note: "Your university must hold a student sponsor licence" },
    { label: "Application fee", value: "Confirm current fee", note: "Set by the Home Office and reviewed regularly" },
    { label: "Health surcharge", value: "Payable per year of your visa", note: "Separate from the application fee" },
    { label: "Maintenance funds", value: "Higher for London", note: "Held for a set period before you apply" },
  ],
};

/* Living costs vary by city and move with the rental market, so they are
   framed as indicative and stamped. Tuition is left out on purpose: it
   varies so widely by institution, course and level that a single range
   would mislead more than it helps — the page sends you to the university's
   own fee page instead, which is the only figure that is ever right. */
const LIVING = {
  lastReviewed: "August 2026",
  note: "Indicative monthly costs outside London, excluding tuition and visa fees. London runs considerably higher across every line. Use these to compare, not to budget.",
  rows: [
    { item: "Housing", cost: "500" },
    { item: "Food", cost: "150–200" },
    { item: "Transport", cost: "150–200" },
    { item: "Phone and internet", cost: "50" },
    { item: "Clothing and leisure", cost: "50" },
  ],
};

const REASONS = [
  {
    icon: "\u{1F3DB}\u{FE0F}",
    title: "Education on old foundations",
    text: "The UK builds its teaching on centuries of it, and the institutions have held their standing internationally for a long time. Four nations, each with its own character and its own universities, inside one small country.",
  },
  {
    icon: "\u{1F9E0}",
    title: "Teaching that argues back",
    text: "The teaching style is built to sharpen how you think rather than what you can recall — you are expected to take a position and defend it, and you are put in front of new and emerging technology while you do.",
  },
  {
    icon: "\u{1F52C}",
    title: "Research facilities to match",
    text: "Quality research infrastructure across the sciences, engineering and the humanities, much of it open to postgraduate students working on their own projects.",
  },
  {
    icon: "\u{1F30D}",
    title: "Genuinely mixed campuses",
    text: "A rich heritage and a lot of different backgrounds in the same room. You will develop and appreciate perspectives other than your own, which is a good deal of what the experience is for.",
  },
  {
    icon: "\u{1F91D}",
    title: "Support and space to use it",
    text: "If you want to study and work in the UK, the structures are there to support you — and community events run for most cultures, so staying connected to where you came from is straightforward.",
  },
];

const UNIVERSITIES = [
  "Imperial College London",
  "Birkbeck, University of London",
  "Coventry University",
  "Middlesex University",
  "UWE Bristol",
  "University of Plymouth",
  "University of Bradford",
  "University for the Creative Arts",
  "University of Wales Trinity Saint David",
  "University of Bedfordshire",
  "London Metropolitan University",
  "University of West London",
  "University of East London",
  "University of Northampton",
  "University of Sunderland (London Campus)",
  "Birmingham City University",
  "Royal Northern College of Music",
];

const SUBJECTS = [
  "Business",
  "Engineering",
  "Law",
  "Medicine",
  "Social Science",
  "Media & Communication",
  "Accounting",
  "Economics",
  "Finance",
  "Social Studies",
  "Humanities",
  "Journalism",
  "Environmental Studies",
];

const APPLY_STEPS = [
  { title: "Choose", text: "Settle on the university, college or course. Compare the fee published for that specific course, at that specific institution — this is the number everything else is built on." },
  { title: "Register", text: "Set up your application, through UCAS for most undergraduate courses or directly with the institution for many postgraduate ones." },
  { title: "Apply", text: "Submit with your documents and references, and wait on the offer." },
  { title: "Fund and travel", text: "Once you have your place, arrange the funds, then apply for your visa and prepare for the move." },
];

const DOCUMENTS = [
  "Photo ID and your academic history",
  "Birth certificate",
  "Academic transcripts",
  "Passport or national identity card",
  "Copies of degree and diploma certificates",
  "Reference letters, where the course asks for them",
  "Evidence of English — IELTS, TOEFL iBT, C1 Advanced or PTE Academic",
  "A research proposal, for some postgraduate applications",
];

/* UCAS dates, not visa dates — they shift by a day or two year to year but
   the shape of the cycle is stable. Deliberately no EU/EEA split: since
   Brexit, EU students apply on the same terms as everyone else, and a lot
   of older pages still carry that distinction. */
const DEADLINES = [
  { when: "Mid-October", what: "Medicine, dentistry and veterinary courses, and applications to Oxford and Cambridge." },
  { when: "Mid-January", what: "The main UCAS deadline — apply by this date and your application gets equal consideration." },
  { when: "End of June", what: "The final date to apply through UCAS before applications roll into Clearing." },
  { when: "July onward", what: "Clearing. Universities open up whatever places remain for the coming academic year." },
];

const LIFE = [
  "A pint at the pub, a cup of tea in a café",
  "World music, hip-hop through to opera",
  "Snowdon, in Wales",
  "Lundy Island, off Devon",
  "The Essex countryside",
  "Part-time work alongside study",
  "Community events for most cultures",
  "Long, bright summer evenings",
];

const GALLERY = [
  { src: "/uk/london.jpg", alt: "The London skyline along the Thames" },
  { src: "/uk/snowdon.jpg", alt: "The summit of Snowdon in Wales" },
  { src: "/uk/campus-life.jpg", alt: "Students on a UK university campus" },
  { src: "/uk/countryside.jpg", alt: "Rolling English countryside" },
];

export default function StudyInUK() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study in the UK | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/uk.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in the UK
            </p>
            <h1>
              Four nations, one small country,{" "}
              <span className="h-accent">a great deal to take from it</span>
            </h1>
            <p className="dpage-lead">
              The UK gives international students room to enjoy themselves, to
              develop perspectives other than the ones they arrived with, and
              to make friends they keep. Excellent educational infrastructure,
              distinguished teaching, quality research facilities and a rich
              heritage — inside a country you can cross in a day.
            </p>
            <p>
              The teaching style is what most students end up talking about: it
              is built to strengthen how you think rather than what you can
              recall, and it puts you in front of emerging technology while it
              does. At Lakehead Education we help you prepare your Student
              route application, and find the scholarships worth your time.
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
            Why study in the <span className="h-outline">UK?</span>
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
        <Shot src="/uk/campus.jpg" alt="A university quadrangle in the UK" />
        <figcaption>
          <p>The more you experience here, the more ambition you gain.</p>
          <span>Education built on robust historical foundations, taught by people who expect you to argue with them.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Universities &amp; <span className="h-accent">courses</span>
          </h2>
          <p className="dpage-section-lead">
            Institutions across the UK offer everything from undergraduate
            through to doctoral study. A short list of those we work with —
            there are a great many more:
          </p>
          <ul className="dpage-fields">
            {UNIVERSITIES.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <h3 className="dpage-sub">Popular study areas</h3>
          <ul className="dpage-fields dpage-fields-sm">
            {SUBJECTS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="dpage-note">
            Narrowing this down is the hard part.{" "}
            <Link to="/contact">
              Let our counsellors help you shortlist <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <div className="dpage-pair">
        <figure><Shot src="/uk/city.jpg" alt="A UK city street" /></figure>
        <figure><Shot src="/uk/student-life.jpg" alt="Students in a UK university library" /></figure>
      </div>

      <section className="dpage-section" id="costs">
        <div className="container">
          <h2 className="dpage-title">
            The cost of <span className="h-accent">studying here</span>
          </h2>
          <div className="dpage-split">
            <div>
              <p className="dpage-section-lead">
                Before you settle on where to study, go through the university
                websites and read the tuition fee published for your actual
                course. That comparison is the single most useful hour you can
                spend — it tells you the cost and the entry requirements at the
                same time. What you pay turns on:
              </p>
              <ul className="dpage-checks">
                <li><span aria-hidden="true"><Check /></span>The institution you choose</li>
                <li><span aria-hidden="true"><Check /></span>The course itself</li>
                <li><span aria-hidden="true"><Check /></span>Level — undergraduate, master&rsquo;s or doctoral</li>
                <li><span aria-hidden="true"><Check /></span>How long the course runs</li>
                <li><span aria-hidden="true"><Check /></span>Whether you are in London or outside it</li>
                <li><span aria-hidden="true"><Check /></span>Visa fees and the health surcharge</li>
                <li><span aria-hidden="true"><Check /></span>Accommodation and daily living</li>
              </ul>
              <p className="dpage-fineprint">
                Tuition ranges vary so widely between institutions, courses and
                levels that quoting one here would mislead more than it helps —
                a laboratory-based degree and a taught humanities course are not
                remotely the same number. London is consistently the most
                expensive place to study and live, and the maintenance funds
                you must show reflect that.
              </p>
            </div>
            <aside className="dpage-callout">
              <h3>Work it out against your actual course</h3>
              <p>
                We&rsquo;ll help you build a budget from the published fee for
                your programme, the city you are moving to, and the visa costs
                that sit on top — rather than a national average that fits
                nobody.
              </p>
              <Link className="dpage-callout-btn" to="/contact">
                Build my budget <Arrow />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Living costs, <span className="h-accent">month to month</span>
          </h2>
          <p className="dpage-section-lead">
            Living expenses swing considerably from one city to another, so
            there is no single honest figure. These are the lines your budget
            will actually have on it.
          </p>

          <div className="dpage-table-wrap">
            <div className="dpage-req-head">
              <h3>Typical monthly outgoings</h3>
              <span className="dpage-req-stamp">
                Indicative &middot; reviewed {LIVING.lastReviewed}
              </span>
            </div>
            <div className="dpage-table-scroll">
              <table className="dpage-table">
                <caption className="dpage-visually-hidden">
                  Approximate monthly living costs in pounds, outside London
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Expense</th>
                    <th scope="col">Approx. monthly (£)</th>
                  </tr>
                </thead>
                <tbody>
                  {LIVING.rows.map((r) => (
                    <tr key={r.item}>
                      <th scope="row">{r.item}</th>
                      <td>{r.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dpage-table-note">{LIVING.note}</p>
          </div>

          <h3 className="dpage-sub">Budget for these too</h3>
          <ul className="dpage-checks dpage-checks-2">
            <li><span aria-hidden="true"><Check /></span>University halls or private accommodation deposits</li>
            <li><span aria-hidden="true"><Check /></span>Rail and intercity coach travel</li>
            <li><span aria-hidden="true"><Check /></span>Utilities — electricity, gas, water</li>
            <li><span aria-hidden="true"><Check /></span>Books and stationery</li>
            <li><span aria-hidden="true"><Check /></span>Clothes and toiletries</li>
            <li><span aria-hidden="true"><Check /></span>Eating out, versus cooking at home</li>
          </ul>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Scholarships to{" "}
            <span className="h-accent">study in the UK</span>
          </h2>
          <p className="dpage-section-lead">
            There is no pretending the UK is cheap. There are, however, a
            considerable number of scholarships open to international students,
            and most universities publish theirs on their own site — that is
            the first place to look.
          </p>
          <div className="dpage-courses">
            <div className="dpage-course-group">
              <h3>GREAT Scholarships</h3>
              <ul className="dpage-checks">
                <li><span aria-hidden="true"><Check /></span>Aimed at postgraduate study</li>
                <li><span aria-hidden="true"><Check /></span>Runs with participating universities</li>
                <li><span aria-hidden="true"><Check /></span>Country-specific eligibility</li>
              </ul>
            </div>
            <div className="dpage-course-group">
              <h3>University awards</h3>
              <ul className="dpage-checks">
                <li><span aria-hidden="true"><Check /></span>Published on each institution&rsquo;s site</li>
                <li><span aria-hidden="true"><Check /></span>Often merit or subject based</li>
                <li><span aria-hidden="true"><Check /></span>Deadlines usually precede enrolment</li>
              </ul>
            </div>
            <div className="dpage-course-group">
              <h3>Other funding</h3>
              <ul className="dpage-checks">
                <li><span aria-hidden="true"><Check /></span>Global and country-specific schemes</li>
                <li><span aria-hidden="true"><Check /></span>Science and research funding</li>
                <li><span aria-hidden="true"><Check /></span>Departmental studentships</li>
              </ul>
            </div>
          </div>
          <p className="dpage-note">
            Eligibility differs from one to the next.{" "}
            <Link to="/contact">
              Talk to us about which are realistically worth applying for{" "}
              <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/uk/pub-culture.jpg" alt="A traditional British pub in the evening" />
        <figcaption>
          <p>You will start looking forward to the weekends.</p>
          <span>Between the projects, the assignments and the part-time job, there is a whole country to get into.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            The admission <span className="h-accent">process</span>
          </h2>
          <p className="dpage-section-lead">
            Applying to study in the UK as an international student is a fairly
            straightforward sequence.
          </p>
          <div className="dpage-paths">
            {APPLY_STEPS.map((s, i) => (
              <div className="dpage-path" key={s.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>

          <h3 className="dpage-sub">Documents you will usually need</h3>
          <ul className="dpage-checks dpage-checks-2">
            {DOCUMENTS.map((d) => (
              <li key={d}>
                <span aria-hidden="true"><Check /></span>
                {d}
              </li>
            ))}
          </ul>

          <h3 className="dpage-sub">The application cycle</h3>
          <div className="dpage-cities dpage-cities-auto">
            {DEADLINES.map((d) => (
              <div className="dpage-city" key={d.when}>
                <h3>
                  <span className="dpage-city-pin" aria-hidden="true"><Pin /></span>
                  {d.when}
                </h3>
                <p>{d.what}</p>
              </div>
            ))}
          </div>
          <p className="dpage-note">
            Dates shift slightly year to year, and individual universities set
            their own deadlines on top of these — check the course page for the
            one that actually applies to you.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Your <span className="h-outline">student visa</span>
          </h2>
          <p className="dpage-section-lead">
            To study a full-time course you apply on the Student route, and
            your university must hold a student sponsor licence — that is what
            lets it issue you a Confirmation of Acceptance for Studies, the CAS
            your application is built around. Students aged 4 to 17 applying to
            an independent school use the Child Student route instead.
          </p>

          {/* Its own panel on purpose: fees, the health surcharge and
              maintenance thresholds are reviewed regularly, and a figure
              buried in a paragraph is a figure nobody thinks to re-check. */}
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
              Fees, the health surcharge and maintenance thresholds change.
              Always confirm the current position with the{" "}
              <a href={REQUIREMENTS.source.href} target="_blank" rel="noopener noreferrer">
                {REQUIREMENTS.source.label}
              </a>{" "}
              before you apply.
            </p>
          </div>

          <p className="dpage-fineprint">
            Visa decisions are made by the Home Office. Our role is to help you
            understand what is being asked for and to prepare your application
            accurately — not to predict the outcome.
          </p>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Life in the <span className="h-accent">UK</span>
          </h2>
          <p className="dpage-section-lead">
            Expect low humidity, warm summers and mild winters — alongside
            rain, the occasional heatwave and some snow. Winters are cold and
            wet, so a warm coat and something waterproof will earn their keep.
            Summers are rarely fierce, but the days are long and bright, and
            the entire country visibly cheers up the moment the sun appears.
          </p>
          <ul className="dpage-fields dpage-fields-sm">
            {LIFE.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <div className="dpage-gallery">
            {GALLERY.map((g) => (
              <figure key={g.src}>
                <Shot src={g.src} alt={g.alt} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Ready to explore the UK?</h2>
            <p>
              Academic opportunities and a bright future are waiting. Let&rsquo;s
              get your application started.
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
