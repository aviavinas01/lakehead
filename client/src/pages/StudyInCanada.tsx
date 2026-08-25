import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";

/**
 * Study in Canada — the second destination page. Section styles are shared
 * with Australia under .dpage; only the content lives here.
 *
 * Same editorial rules as the Australia page: describe options and process,
 * never promise an outcome, and keep anything with a shelf life out of the
 * prose. Canada needs that discipline more than most — study permit intake
 * caps, PGWP rules and spousal work-permit eligibility have all changed
 * inside the last two years, so a figure written into a paragraph here is a
 * figure that will be wrong by the next intake.
 */

/* ------------------------------------------------------------------
   VOLATILE FACTS. Canada's study permit settings are reviewed annually and
   have moved repeatedly — intake caps, PGWP eligibility and who may apply
   for a spousal work permit. Nothing below states a cap number or a policy
   date in the prose: the panel carries them, stamped and sourced, so the
   page can be corrected in one place.

   Re-check against IRCC and move `lastReviewed` when you do.
   ------------------------------------------------------------------ */
const REQUIREMENTS = {
  lastReviewed: "August 2026",
  source: {
    label: "Immigration, Refugees and Citizenship Canada",
    href: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html",
  },
  items: [
    { label: "Permit", value: "Study permit", note: "Plus a visitor visa or eTA, issued with it" },
    { label: "Attestation", value: "PAL or TAL", note: "From your province or territory" },
    { label: "Intake caps", value: "Reviewed each year", note: "Confirm the current year's settings" },
    { label: "After study", value: "PGWP eligibility varies", note: "By course, level and institution" },
  ],
};

/* Living costs move with the rental market, so they are stamped the same way
   and framed as indicative rather than quoted as fact. Tuition is left out
   deliberately: it varies so widely by institution and programme that a
   single figure would mislead more than it helps. */
const LIVING = {
  lastReviewed: "August 2026",
  note: "Indicative monthly living costs, excluding tuition. Treat them as a starting point for comparison between cities, not a budget.",
  cities: [
    { city: "Toronto", cost: "2,300" },
    { city: "Vancouver", cost: "2,300" },
    { city: "Victoria", cost: "2,100" },
    { city: "Halifax", cost: "2,000" },
    { city: "Ottawa", cost: "2,000" },
    { city: "Oshawa", cost: "1,950" },
    { city: "Calgary", cost: "1,900" },
    { city: "Edmonton", cost: "1,850" },
    { city: "Hamilton", cost: "1,850" },
    { city: "Montreal", cost: "1,800" },
    { city: "London", cost: "1,800" },
    { city: "Kitchener", cost: "1,800" },
    { city: "Winnipeg", cost: "1,800" },
    { city: "Windsor", cost: "1,700" },
    { city: "Quebec City", cost: "1,600" },
  ],
};

const REASONS = [
  {
    icon: "\u{1F393}",
    title: "Universities recognised worldwide",
    text: "Canada is home to universities and research institutions with international standing. The teaching combines cross-disciplinary study, transferable skills and well-equipped facilities, and programmes are built around experiential learning rather than lectures alone.",
  },
  {
    icon: "\u{1F331}",
    title: "Room to grow into yourself",
    text: "Students often say the thing that changed most was their confidence. The lifestyle and standard of living push you toward self-sufficiency — managing your own budget, your own time and your own decisions, a long way from home.",
  },
  {
    icon: "\u{1F4BC}",
    title: "Career-focused curricula",
    text: "Programmes across many fields are updated against current industry practice, so what you study stays close to what employers are actually asking for.",
  },
  {
    icon: "\u{1F91D}",
    title: "Open, approachable classrooms",
    text: "Lectures are run to draw people out rather than talk at them. Students consistently report being able to raise a complicated question without feeling awkward about it.",
  },
  {
    icon: "\u{1F3D4}\u{FE0F}",
    title: "A country worth living in",
    text: "One of the most peaceful countries in the world, with a low crime rate, dependable public services and a quality of life it takes real pride in — parks, museums, theatres and art centres in reach of most campuses.",
  },
];

const SYSTEM = [
  { title: "Primary education", text: "From roughly age six or seven through to age thirteen or fourteen — up to grade 8." },
  { title: "Secondary education", text: "High school, running from grade 9 through to grade 12." },
  { title: "Post-secondary education", text: "Where international students come in: you choose the institution and the programme, and the length depends on what you pick." },
];

const UNIVERSITIES = [
  "University of Toronto",
  "University of British Columbia",
  "University of Alberta",
  "Thompson Rivers University",
  "University Canada West",
  "Cape Breton University",
  "Nipissing University",
  "Acadia University",
  "Crandall University",
  "Mount Allison University",
  "Saint Mary's University",
  "University of New Brunswick",
  "Yorkville University",
];

const COURSE_GROUPS = [
  {
    title: "Fields of study",
    items: [
      "Biosciences, medicine and healthcare",
      "Media and journalism",
      "Agricultural science and forestry",
      "Mathematics, statistics and analytics",
      "Psychology and human resources",
    ],
  },
  {
    title: "Popular bachelor's degrees",
    items: [
      "Business Administration",
      "Environmental Sciences",
      "Computer Science",
      "Engineering",
      "Film, Photography & Media",
    ],
  },
  {
    title: "Popular master's degrees",
    items: [
      "Computer Science",
      "Civil Engineering",
      "Public Health",
      "Finance",
      "Human Resource Management",
    ],
  },
];

const COST_FACTORS = [
  "The programme you choose",
  "How long the course runs",
  "Level of study",
  "Your institution and its province",
  "Accommodation",
  "Transport and daily living",
  "Health cover",
  "Course-related expenses",
];

/* Provinces where students commonly find lower rents than the big three. */
const AFFORDABLE = [
  { region: "Quebec", places: "Quebec City, Montréal, Lévis, Longueuil, Saint-Jean-sur-Richelieu, Val-d'Or, Drummondville" },
  { region: "Ontario", places: "Brockville, Sarnia, Hamilton" },
  { region: "Saskatchewan", places: "Weyburn" },
  { region: "British Columbia", places: "Prince George" },
  { region: "Alberta", places: "Wetaskiwin, Edmonton" },
];

const SCHOLARSHIP_DOCS = [
  { title: "Proof of identity", text: "A passport or national identity card, in date and with a usable photo." },
  { title: "Proof of enrolment", text: "The official confirmation from the institution where you have a full-time place." },
  { title: "Letter of intent", text: "In English or French: the programme or research you have chosen, why Canada and why that institution, and how it fits the career you are working toward." },
  { title: "Letter of support", text: "From a professor, instructor or director on official letterhead, describing your work and what the scholarship would let you do." },
];

const PERMIT_DOCS = [
  "Proof of acceptance from your institution",
  "Provincial or territorial attestation letter (PAL / TAL)",
  "Proof of identity",
  "Proof of financial support",
  "Letter of explanation — why Canada, and what your responsibilities as a student are",
  "Medical exam, where your course length, recent travel or intended work calls for one",
  "Custodian declaration, for minors",
  "Proof of immigration status, depending on where you are applying from",
];

const LIFE = [
  "Skiing at Whistler",
  "Niagara Falls",
  "Banff National Park",
  "Prince Edward Island",
  "Festivals from every culture",
  "Camping and the outdoors",
  "Concerts and live music",
  "Museums, theatres and art centres",
];

const GALLERY = [
  { src: "/canada/banff.jpg", alt: "Mountains and a lake in Banff National Park" },
  { src: "/canada/niagara.jpg", alt: "Niagara Falls" },
  { src: "/canada/whistler.jpg", alt: "Ski slopes at Whistler" },
  { src: "/canada/campus-life.jpg", alt: "Students together on a Canadian campus" },
];

export default function StudyInCanada() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study in Canada | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/canada.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in Canada
            </p>
            <h1>
              Where education becomes the bedrock of{" "}
              <span className="h-accent">brighter prospects</span>
            </h1>
            <p className="dpage-lead">
              Home to some of the most polite people on the planet, Canada is a
              country you don&rsquo;t want to rule out. For decades
              international students have moved here for higher education, and
              the reason they give is rarely just the teaching — it is what a
              few years of it does to them.
            </p>
            <p>
              Canada is home to universities and research institutions with
              genuine international standing, offering a considered mix of
              cross-disciplinary study, transferable skills and world-class
              facilities. At Lakehead Education we provide honest education and
              migration counselling — including the study permit process — so
              you can plan the move with your eyes open.
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
            Why study in <span className="h-outline">Canada?</span>
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

      {/* A wide breath between the argument and the detail. */}
      <figure className="dpage-band">
        <Shot src="/canada/campus.jpg" alt="A university campus in Canada" />
        <figcaption>
          <p>&ldquo;From where the world looks amazing.&rdquo;</p>
          <span>Gorgeous landscapes, a varied climate, and one of the lowest crime rates anywhere.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            The Canadian <span className="h-accent">education system</span>
          </h2>
          <p className="dpage-section-lead">
            To study here as an international student you need a Canadian study
            permit — a document issued by the Government of Canada — alongside
            the visa or travel authorisation that comes with it. Our
            counsellors handle both processes with you. The system itself runs
            in three levels.
          </p>
          <div className="dpage-paths">
            {SYSTEM.map((s, i) => (
              <div className="dpage-path" key={s.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
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
            Canadian universities offer a wide spread of programmes, and the
            length depends on what you choose. A short list of the institutions
            we work with — there are many more:
          </p>
          <ul className="dpage-fields">
            {UNIVERSITIES.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
          <div className="dpage-courses">
            {COURSE_GROUPS.map((g) => (
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
            Not sure which programme fits?{" "}
            <Link to="/contact">
              We&rsquo;d love to hear from you <Arrow />
            </Link>
          </p>
        </div>
      </section>

      {/* Two shots side by side — the country and the campus. */}
      <div className="dpage-pair">
        <figure><Shot src="/canada/city.jpg" alt="Downtown streets in a Canadian city" /></figure>
        <figure><Shot src="/canada/nature.jpg" alt="Lakes and forest in the Canadian wilderness" /></figure>
      </div>

      <section className="dpage-section" id="costs">
        <div className="container">
          <h2 className="dpage-title">
            The cost of <span className="h-accent">studying here</span>
          </h2>
          <div className="dpage-split">
            <div>
              <p className="dpage-section-lead">
                Studying and living in Canada generally costs less than in the
                other top destinations, and the teaching you get for it holds
                up. What you will actually pay depends on:
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
                Tuition varies enormously between institutions, provinces and
                programmes — a professional degree can cost several times what
                a taught programme does. Check the current fees published for
                your specific programme rather than working from an average,
                and build the rest of the budget around that number.
              </p>
            </div>
            <aside className="dpage-callout">
              <h3>Get a real number before you commit</h3>
              <p>
                We&rsquo;ll help you build a budget against the actual fees for
                your programme, the city you are moving to, and the cover you
                are required to hold — not a national average.
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
            Where you live changes{" "}
            <span className="h-accent">what you spend</span>
          </h2>
          <p className="dpage-section-lead">
            Canada is not the cheapest country in the world, but it sits on the
            gentler side of expensive, and the gap between cities is wide
            enough to be worth planning around.
          </p>

          <div className="dpage-table-wrap">
            <div className="dpage-req-head">
              <h3>Monthly living costs by city</h3>
              <span className="dpage-req-stamp">
                Indicative &middot; reviewed {LIVING.lastReviewed}
              </span>
            </div>
            <div className="dpage-table-scroll">
              <table className="dpage-table">
                <caption className="dpage-visually-hidden">
                  Approximate monthly living costs in Canadian dollars, by city
                </caption>
                <thead>
                  <tr>
                    <th scope="col">City</th>
                    <th scope="col">Approx. monthly (C$)</th>
                  </tr>
                </thead>
                <tbody>
                  {LIVING.cities.map((c) => (
                    <tr key={c.city}>
                      <th scope="row">{c.city}</th>
                      <td>{c.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="dpage-table-note">{LIVING.note}</p>
          </div>

          <h3 className="dpage-sub">If you are watching the rent</h3>
          <div className="dpage-cities dpage-cities-auto">
            {AFFORDABLE.map((a) => (
              <div className="dpage-city" key={a.region}>
                <h3>
                  <span className="dpage-city-pin" aria-hidden="true"><Pin /></span>
                  {a.region}
                </h3>
                <p>{a.places}</p>
              </div>
            ))}
          </div>
          <p className="dpage-note">
            Vancouver, Toronto and Calgary are all excellent places to study if
            accommodation prices are not the deciding factor for you.
          </p>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Scholarships to <span className="h-accent">study in Canada</span>
          </h2>
          <p className="dpage-section-lead">
            Universities and federal programmes both offer scholarships to
            international students — Canada-ASEAN and Canada-CARICOM among
            them. Requirements and selection processes differ from one to the
            next, but most ask for some version of these four documents.
          </p>
          <div className="dpage-paths">
            {SCHOLARSHIP_DOCS.map((d, i) => (
              <div className="dpage-path" key={d.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
            ))}
          </div>
          <p className="dpage-note">
            There is more to it than the paperwork.{" "}
            <Link to="/contact">
              Talk to our team about which ones you could realistically win{" "}
              <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/canada/student-life.jpg" alt="Students walking together in a Canadian city" />
        <figcaption>
          <p>Academic opportunities that make you job-ready.</p>
          <span>Thousands of programmes across Canadian universities and colleges, with the curriculum kept close to what the job market is actually asking for.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Your <span className="h-outline">study permit</span>
          </h2>
          <p className="dpage-section-lead">
            Canada reforms its immigration system regularly, and study permit
            settings — intake caps, post-graduation work rights, who may apply
            for a spousal work permit — have all changed within the last two
            years. Anything we print here about them would age badly, so the
            current position lives in one panel and gets re-checked.
          </p>

          {/* Its own panel on purpose: the facts most likely to go out of
              date, stamped and sourced rather than buried in prose. */}
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
              Caps, eligibility and processing rules change every year. Always
              confirm the current position with{" "}
              <a href={REQUIREMENTS.source.href} target="_blank" rel="noopener noreferrer">
                {REQUIREMENTS.source.label}
              </a>{" "}
              before you apply.
            </p>
          </div>

          <h3 className="dpage-sub">Documents to submit</h3>
          <ul className="dpage-checks dpage-checks-2">
            {PERMIT_DOCS.map((d) => (
              <li key={d}>
                <span aria-hidden="true"><Check /></span>
                {d}
              </li>
            ))}
          </ul>
          <p className="dpage-fineprint">
            Permit decisions are made by the Government of Canada. Our role is
            to help you understand what is being asked for and to prepare your
            application accurately — not to predict the outcome.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Life in <span className="h-accent">Canada</span>
          </h2>
          <p className="dpage-section-lead">
            Canada is an immensely large country, known for friendly people,
            gorgeous landscapes and a climate that changes completely
            depending on where you land. There is plenty to see, and rather
            more to actually do.
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
            <h2>Ready to explore Canada?</h2>
            <p>
              A bright future is a few steps away. We&rsquo;ll walk you through
              every one of them.
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
