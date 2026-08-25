import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";

/**
 * Study in New Zealand — the fifth destination page. Section styles are
 * shared with the others under .dpage; only the content lives here.
 *
 * Same editorial rules as the rest: describe options and process, never
 * promise an outcome, keep anything with a shelf life out of the prose.
 *
 * Two things to preserve if you edit this page. New Zealand has EIGHT
 * universities — the source copy this was written from claimed 400, which is
 * the whole tertiary sector counted as if it were universities. And the te
 * reo Māori words carry macrons: wānanga, Māori. Dropping them is the kind
 * of mistake a New Zealand reader notices immediately.
 */

/* ------------------------------------------------------------------
   VOLATILE FACTS. Visa processing times, funds thresholds and post-study
   work entitlements are all set by Immigration New Zealand and revised;
   processing in particular swings by season and by post, so no figure for it
   appears in the prose. Insurance premiums are deliberately absent too — the
   source quoted 2022 rates, which is exactly how a page ages badly.

   Re-check against Immigration NZ and move `lastReviewed` when you do.
   ------------------------------------------------------------------ */
const REQUIREMENTS = {
  lastReviewed: "August 2026",
  source: {
    label: "Immigration New Zealand",
    href: "https://www.immigration.govt.nz/new-zealand-visas/options/study",
  },
  items: [
    { label: "Visa", value: "Student visa", note: "Required for courses longer than three months" },
    { label: "Apply", value: "Online, well in advance", note: "Processing times vary — check before you book travel" },
    { label: "Insurance", value: "Health and travel cover", note: "For the full length of your visa" },
    { label: "Funds", value: "Evidence of living costs", note: "Per year of study, plus tuition" },
    { label: "After study", value: "Post Study Work Visa", note: "Up to three years, depending on your qualification" },
  ],
};

/* Living costs are indicative and stamped for the same reason as everywhere
   else — these are rents and groceries, and both move. Tuition is left out:
   see the note in the cost section. */
const LIVING = {
  lastReviewed: "August 2026",
  note: "Indicative monthly costs, excluding tuition. Immigration New Zealand also sets a minimum funds figure you must evidence for your visa — confirm the current one before you apply.",
  rows: [
    { item: "Accommodation", cost: "800 – 1,000" },
    { item: "Food", cost: "200" },
    { item: "Transport", cost: "100 – 120" },
    { item: "Health expenses", cost: "40 – 100" },
    { item: "Phone and internet", cost: "50" },
    { item: "Day-to-day essentials", cost: "40 – 50" },
    { item: "Other", cost: "100" },
  ],
};

const REASONS = [
  {
    icon: "\u{1F4BC}",
    title: "Post-study work rights",
    text: "New Zealand offers a Post Study Work Visa of up to three years, depending on the level of qualification you complete. It is one of the clearest reasons students choose it — but the entitlement follows the qualification, so it is worth understanding before you pick a course, not after.",
  },
  {
    icon: "\u{1F9D1}\u{200D}\u{1F3EB}",
    title: "Small classes, by rule",
    text: "The government maintains a Code of Practice establishing that every student deserves proper attention from their provider. In practice that means low class sizes and tutors who know who you are — which is not something most destinations can claim.",
  },
  {
    icon: "\u{1F4DC}",
    title: "Every qualification recognised",
    text: "Qualifications from New Zealand institutions are recognised by the New Zealand Qualifications Authority (NZQA), which covers distance and on-campus study alike.",
  },
  {
    icon: "\u{1F54A}\u{FE0F}",
    title: "One of the world's most peaceful countries",
    text: "Low crime rates and a genuine reputation for safety, which matters a great deal when you are moving somewhere alone for the first time.",
  },
  {
    icon: "\u{1F30F}",
    title: "A culture built from several",
    text: "A diverse population shaped by Māori, European and East Asian traditions — you will meet people from all of it, and the country takes its own cultural roots seriously.",
  },
];

const PROVIDERS = [
  {
    title: "Universities",
    text: "New Zealand has eight universities, offering undergraduate, postgraduate and doctoral study across the full range of disciplines.",
  },
  {
    title: "Institutes of technology and polytechnics",
    text: "ITPs offer foundational, undergraduate and postgraduate courses with a practical, applied emphasis.",
  },
  {
    title: "Wānanga",
    text: "Tertiary institutions grounded in Māori knowledge and tikanga — the right place to study if you want to learn within that tradition rather than about it.",
  },
  {
    title: "Private training establishments",
    text: "A large number of PTEs deliver specialised vocational and professional training, and many offer distance study.",
  },
];

const UNIVERSITIES = [
  "University of Auckland",
  "University of Otago",
  "Victoria University of Wellington",
  "University of Canterbury",
  "Massey University",
  "University of Waikato",
  "Lincoln University",
  "Auckland University of Technology",
  "Eastern Institute of Technology",
  "Wellington Institute of Technology",
];

const COURSES = [
  "Civil Engineering",
  "Computer Science and IT",
  "Electrical Engineering",
  "Environmental Engineering",
  "Construction Project Management",
  "Nursing",
  "Finance",
  "Marketing",
  "Hospitality and Tourism Management",
  "Media Studies",
];

const ENTRY = [
  {
    title: "Bachelor's programmes",
    text: "Entry is comparatively straightforward and does not demand an exceptional secondary record. You will need an English proficiency score — we run preparation for IELTS and PTE.",
  },
  {
    title: "Master's programmes",
    text: "Generally around 50–60% in your bachelor's degree, plus a portfolio and certificates evidencing work relevant to your field. GMAT, GRE, IELTS or TOEFL scores as the programme requires.",
  },
  {
    title: "Doctoral programmes",
    text: "A strong master's result, and often one to two years of documented experience. Business and management streams usually want a GRE or GMAT score alongside IELTS or TOEFL.",
  },
];

const APPLY_STEPS = [
  { title: "Research", text: "Compare several universities properly before settling on one, and check the fee published for your actual programme." },
  { title: "Sit your English test", text: "Book and sit IELTS, PTE or TOEFL early — three months before the deadline, so a poor result is recoverable." },
  { title: "Apply", text: "Submit online or on paper with your documents, and check whether you qualify for any scholarship while you do." },
  { title: "Then the visa", text: "Once your letter of acceptance arrives, start the student visa application — allow at least three months before you intend to travel." },
];

const DOCUMENTS = [
  "Motivation letter",
  "Certified copy of your high school diploma or completed degree",
  "Translations of course modules and grades, if not in English",
  "Proof of language proficiency",
  "Passport copy and passport photograph",
  "Proof of payment of the application fee",
  "A résumé, where the university asks for one",
  "A sample of previous academic work",
];

const VISA_DOCUMENTS = [
  "A valid passport",
  "Letter of acceptance from a recognised institution",
  "Academic skills and qualifications",
  "English language test score",
  "Financial records",
  "Health and travel insurance",
  "Medical records",
  "Character and identity certificates",
];

const SCHOLARSHIP_GROUPS = [
  {
    title: "Government scholarships",
    items: [
      "New Zealand Development Scholarship",
      "New Zealand Regional Development Scholarship",
      "New Zealand Pacific Scholarship",
      "New Zealand ASEAN Scholar Awards",
      "Short Term Training Scholarship",
      "Commonwealth Scholarship",
    ],
  },
  {
    title: "Undergraduate awards",
    items: [
      "Tongarewa Scholarship",
      "International Student Excellence Scholarship",
      "AUT International Excellence Scholarships",
      "UC International First-Year Undergraduate Scholarship",
      "New Zealand International Scholarships",
      "Beca Engineering in Society Scholarships",
    ],
  },
  {
    title: "Also worth checking",
    items: [
      "Scholarships for women",
      "Scholarships for minority students",
      "Sports scholarships",
      "Merit-based awards",
      "Dr Russell Smith Memorial Scholarship",
      "Eamon Molloy Memorial Scholarship",
    ],
  },
];

const INTAKES = [
  { when: "January", what: "The main intake. Start your admission process around six months ahead, and aim to have the visa application in by October or November." },
  { when: "July", what: "The second main intake, and a good option if you need longer to prepare your application or your English score." },
  { when: "September & November", what: "Offered by some universities for some programmes — worth asking about if the main intakes do not suit you." },
  { when: "March – July", what: "Vocational courses often open admissions across these months rather than following the university calendar." },
];

const LIFE = [
  "The Southern Lights",
  "Whale watching",
  "The Nevis Swing",
  "Bungee jumping",
  "Māori culture and tikanga",
  "Some of the world's lowest crime rates",
  "Landscapes worth the flight on their own",
  "A genuinely diverse population",
];

const GALLERY = [
  { src: "/newzealand/mountains.jpg", alt: "Mountains and a lake in the South Island" },
  { src: "/newzealand/campus-life.jpg", alt: "Students on a New Zealand university campus" },
  { src: "/newzealand/coast.jpg", alt: "The New Zealand coastline" },
  { src: "/newzealand/adventure.jpg", alt: "Bungee jumping over a river gorge" },
];

export default function StudyInNewZealand() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study in New Zealand | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/newzealand.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in New Zealand
            </p>
            <h1>
              Strong programmes, small classes, and{" "}
              <span className="h-accent">three years to use them</span>
            </h1>
            <p className="dpage-lead">
              New Zealand does not just offer good study programmes — it offers
              post-study work rights of up to three years, depending on the
              qualification you complete. That combination is why thousands of
              international students apply here every year, and it is worth
              understanding before you choose a course rather than after.
            </p>
            <p>
              At Lakehead Education we advise on the courses and student visas
              that actually suit you. What applies depends on where you are
              applying from, so our education and migration counsellors take
              you through it properly — studying in New Zealand is not a
              faraway dream.
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
            Why study in <span className="h-outline">New Zealand?</span>
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
        <Shot src="/newzealand/campus.jpg" alt="A university campus in New Zealand" />
        <figcaption>
          <p>Every student deserves proper attention.</p>
          <span>The government&rsquo;s Code of Practice is the reason class sizes stay small and tutors know your name.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            The tertiary <span className="h-accent">sector</span>
          </h2>
          <p className="dpage-section-lead">
            New Zealand&rsquo;s tertiary sector is wider than its eight
            universities, and the alternatives are worth knowing — several of
            them lead to the same qualifications by a different route, and many
            offer distance study. Everything they award is recognised by NZQA.
          </p>
          <div className="dpage-paths">
            {PROVIDERS.map((p, i) => (
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
            Universities &amp; <span className="h-accent">courses</span>
          </h2>
          <p className="dpage-section-lead">
            Institutions international students most often choose, across
            undergraduate, postgraduate and doctoral study:
          </p>
          <ul className="dpage-fields">
            {UNIVERSITIES.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <h3 className="dpage-sub">Popular courses</h3>
          <ul className="dpage-fields dpage-fields-sm">
            {COURSES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="dpage-note">
            Course choice drives your work rights afterwards.{" "}
            <Link to="/contact">
              Let us help you pick with that in mind <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <div className="dpage-pair">
        <figure><Shot src="/newzealand/city.jpg" alt="A New Zealand city waterfront" /></figure>
        <figure><Shot src="/newzealand/student-life.jpg" alt="Students working together indoors" /></figure>
      </div>

      <section className="dpage-section" id="costs">
        <div className="container">
          <h2 className="dpage-title">
            The cost of <span className="h-accent">studying here</span>
          </h2>
          <div className="dpage-split">
            <div>
              <p className="dpage-section-lead">
                Studying in New Zealand can be genuinely affordable, but that
                depends almost entirely on what you study and where. Medicine
                and veterinary science sit far above everything else; doctoral
                study is unusually inexpensive for international students
                compared with most destinations. What you pay turns on:
              </p>
              <ul className="dpage-checks">
                <li><span aria-hidden="true"><Check /></span>The programme you choose</li>
                <li><span aria-hidden="true"><Check /></span>Public institution or private</li>
                <li><span aria-hidden="true"><Check /></span>Level — bachelor&rsquo;s, master&rsquo;s or doctoral</li>
                <li><span aria-hidden="true"><Check /></span>How long the course runs</li>
                <li><span aria-hidden="true"><Check /></span>Which city you live in</li>
                <li><span aria-hidden="true"><Check /></span>Health and travel insurance</li>
              </ul>
              <p className="dpage-fineprint">
                We have not printed tuition ranges. The spread between a taught
                programme and a clinical one is so wide that a single range
                would be useless, and fees are revised annually — read the
                figure published for your specific programme instead.
              </p>
            </div>
            <aside className="dpage-callout">
              <h3>Work it out properly, early</h3>
              <p>
                We&rsquo;ll build a budget against your actual programme fee,
                the city you are moving to, insurance, and the funds you have
                to evidence for the visa — which is the number that catches
                people out.
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
            These are the lines your budget will actually carry. They fluctuate
            year to year, and Auckland and Wellington run higher than most.
          </p>

          <div className="dpage-table-wrap">
            <div className="dpage-req-head">
              <h3>Typical monthly outgoings (NZ$)</h3>
              <span className="dpage-req-stamp">
                Indicative &middot; reviewed {LIVING.lastReviewed}
              </span>
            </div>
            <div className="dpage-table-scroll">
              <table className="dpage-table">
                <caption className="dpage-visually-hidden">
                  Approximate monthly living costs in New Zealand dollars
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Expense</th>
                    <th scope="col">Approx. monthly (NZ$)</th>
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
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Scholarships in{" "}
            <span className="h-accent">New Zealand</span>
          </h2>
          <p className="dpage-section-lead">
            A considerable number of scholarships are open to international
            students, from government-funded programmes through to awards run
            by individual universities. Eligibility varies sharply, so the
            useful question is not which exist but which you could actually
            win.
          </p>
          <div className="dpage-courses">
            {SCHOLARSHIP_GROUPS.map((g) => (
              <div className="dpage-course-group" key={g.title}>
                <h3>{g.title}</h3>
                <ul className="dpage-checks">
                  {g.items.map((it) => (
                    <li key={it}>
                      <span aria-hidden="true"><Check /></span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="dpage-note">
            Most universities also run their own awards, published on their own
            sites.{" "}
            <Link to="/contact">
              Talk to us about where to put your effort <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/newzealand/landscape.jpg" alt="A dramatic New Zealand landscape" />
        <figcaption>
          <p>From the Southern Lights to the Nevis Swing.</p>
          <span>One of the most peaceful countries in the world, and one of the more thrilling ones to live in.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Intakes &amp; the{" "}
            <span className="h-accent">admission process</span>
          </h2>
          <p className="dpage-section-lead">
            Start roughly six months before your deadline. Sit your language
            and aptitude tests about three months out, leaving the final three
            months to complete the application accurately — and run the visa
            application alongside interviews rather than after them. Most
            universities set several deadlines within one intake, so there is
            usually a version of the timeline that fits.
          </p>
          <div className="dpage-cities dpage-cities-auto">
            {INTAKES.map((i) => (
              <div className="dpage-city" key={i.when}>
                <h3>
                  <span className="dpage-city-pin" aria-hidden="true"><Pin /></span>
                  {i.when}
                </h3>
                <p>{i.what}</p>
              </div>
            ))}
          </div>

          <h3 className="dpage-sub">What each level asks for</h3>
          <div className="dpage-paths dpage-paths-3">
            {ENTRY.map((e, i) => (
              <div className="dpage-path" key={e.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{e.title}</h3>
                <p>{e.text}</p>
              </div>
            ))}
          </div>

          <h3 className="dpage-sub">How the application runs</h3>
          <ol className="dpage-steps">
            {APPLY_STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="dpage-step-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="dpage-sub">Documents you will usually need</h3>
          <ul className="dpage-checks dpage-checks-2">
            {DOCUMENTS.map((d) => (
              <li key={d}>
                <span aria-hidden="true"><Check /></span>
                {d}
              </li>
            ))}
          </ul>
          <p className="dpage-fineprint">
            Once everything is submitted, keep an eye on the university&rsquo;s
            website for your admission status — most also confirm the outcome
            by email.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Your <span className="h-outline">student visa</span>
          </h2>
          <p className="dpage-section-lead">
            If your programme runs longer than three months you will need a
            student visa. You can apply online, and you should start at least
            three months before you intend to travel — processing times swing
            considerably by season and by where you are applying from, so
            treat that as a minimum rather than a plan.
          </p>

          {/* Its own panel on purpose: processing times, funds thresholds and
              work entitlements are all revised, and the source copy this page
              replaced quoted 2022 insurance premiums in running text. */}
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
              Requirements, funds thresholds and processing times change.
              Always confirm the current position with{" "}
              <a href={REQUIREMENTS.source.href} target="_blank" rel="noopener noreferrer">
                {REQUIREMENTS.source.label}
              </a>{" "}
              before you apply.
            </p>
          </div>

          <h3 className="dpage-sub">Documents for the visa application</h3>
          <ul className="dpage-checks dpage-checks-2">
            {VISA_DOCUMENTS.map((d) => (
              <li key={d}>
                <span aria-hidden="true"><Check /></span>
                {d}
              </li>
            ))}
          </ul>

          <aside className="dpage-callout dpage-callout-wide">
            <h3>Health cover is a condition, not a suggestion</h3>
            <p>
              You must hold health and travel insurance meeting government
              standards, complying with the Code of Practice for the Pastoral
              Care of International Students, and accepted by your education
              provider. It has to cover the full length of your visa, including
              travel to and from New Zealand. Premiums differ by provider and
              policy, so we will help you compare cover that your institution
              will actually accept.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Check what I&rsquo;ll need <Arrow />
            </Link>
          </aside>

          <p className="dpage-fineprint">
            Visa decisions are made by Immigration New Zealand. Our role is to
            help you understand what is being asked for and to prepare your
            application accurately — not to predict the outcome.
          </p>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Living in <span className="h-accent">New Zealand</span>
          </h2>
          <p className="dpage-section-lead">
            You will not run out of things to do. Beautiful landscapes and
            genuinely adventurous places — the Southern Lights, whale watching,
            the Nevis Swing, bungee jumping — alongside a culture shaped by
            Māori, European and East Asian traditions, and a population diverse
            enough that you will meet all of it.
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
            <h2>Ready to explore New Zealand?</h2>
            <p>
              Tell us what you want to study, and we&rsquo;ll map the rest of
              it out with you.
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
