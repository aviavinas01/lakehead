import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Pin, Arrow, Shot } from "../components/destinationBits";

/**
 * Study in the USA — the fourth destination page. Section styles are shared
 * with the others under .dpage; only the content lives here.
 *
 * Same editorial rules as the rest: describe options and process, never
 * promise an outcome, and keep anything with a shelf life out of the prose.
 *
 * The visa panel below was written from scratch rather than from the source
 * copy, which talked about "the USA student visa process" repeatedly without
 * once naming F-1, the I-20 or SEVIS. Those are the three things a student
 * actually has to understand, so they lead.
 */

/* ------------------------------------------------------------------
   VOLATILE FACTS. US visa fees, SEVIS charges and interview requirements are
   set federally and change; institutional insurance requirements change per
   school. None of it is stated in the prose — it lives here, stamped and
   sourced, so the page is corrected in one place.

   Re-check against the State Department and move `lastReviewed` when you do.
   ------------------------------------------------------------------ */
const REQUIREMENTS = {
  lastReviewed: "August 2026",
  source: {
    label: "U.S. Department of State",
    href: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
  },
  items: [
    { label: "Visa", value: "F-1 student visa", note: "M-1 for vocational and technical study" },
    { label: "You need an I-20", value: "From an SEVP-certified school", note: "Issued once you accept your place" },
    { label: "SEVIS fee", value: "Paid before your interview", note: "Separate from the visa fee" },
    { label: "Application", value: "DS-160, then an interview", note: "In person at an embassy or consulate" },
    { label: "Health insurance", value: "Required by most institutions", note: "Often a condition of enrolment" },
  ],
};

/* Living costs are given as ranges because they genuinely are ranges — the
   gap between a shared dorm in the Midwest and a studio in Boston is the
   whole point. Tuition is left out deliberately: see the note in the cost
   section for why. */
const LIVING = {
  lastReviewed: "August 2026",
  note: "Indicative annual costs, excluding tuition. Location moves every one of these lines considerably, so use them to compare options rather than as a budget.",
  rows: [
    { item: "General living — food, utilities, books, essentials", cost: "10,000 – 12,000 / year" },
    { item: "On-campus accommodation (dorm)", cost: "5,000 – 8,000 / year" },
    { item: "Off-campus accommodation", cost: "6,000 – 15,000 / year" },
    { item: "Transport pass — bus and train", cost: "30 – 50 / month" },
    { item: "Transport in total, all types", cost: "100 – 300 / month" },
    { item: "Student health insurance", cost: "30 – 140 / month" },
  ],
};

const REASONS = [
  {
    icon: "\u{1F3C6}",
    title: "Universities near the top of every list",
    text: "The US is home to a great many of the world's leading institutions, and a degree from one tends to set you apart from people who came up the same way you did. Highly accredited faculty, advanced technology and research facilities that are genuinely open to students.",
  },
  {
    icon: "\u{1F3DF}\u{FE0F}",
    title: "Campus life is a place, not a timetable",
    text: "American campuses run like small student towns — socialising and skill-building under the same roof as the teaching. It is not about burying yourself in books; appreciating the life outside the classroom is treated as part of the education.",
  },
  {
    icon: "\u{1F9D1}\u{200D}\u{1F3EB}",
    title: "Professors you can actually reach",
    text: "Faculty are generally available after class — for academic help, for advice, or simply to take the weight off a course that has started to feel heavy. That accessibility surprises most international students.",
  },
  {
    icon: "\u{1F6DF}",
    title: "Support built into the campus",
    text: "Student mentoring programmes, free shuttle services, team sports, health centres, career advisory services and accommodation officers. The infrastructure for settling in is already there, which makes integrating far less daunting.",
  },
  {
    icon: "\u{1F3AC}",
    title: "A culture you already know",
    text: "American fashion, music and film have shaped a good deal of the world, and living inside that vibrant, active lifestyle is a large part of why students choose it. You will generally find Americans curious, friendly and funny.",
  },
];

const UNIVERSITIES = [
  "University of Southern California",
  "New York University",
  "Boston University",
  "Michigan State University",
  "Ohio State University",
  "Purdue University",
  "Northwood University",
  "Strayer University",
  "National University",
];

const COURSES = [
  "Computer Science & IT",
  "Engineering",
  "Medicine",
  "Business Management",
  "Social Science",
  "Life Science",
  "Liberal Arts",
  "Biotechnology",
  "Architecture",
];

const INSTITUTION_TYPES = [
  {
    title: "Public universities",
    text: "State-funded institutions, generally the larger campuses. Fees differ for international students and vary a great deal between states.",
  },
  {
    title: "Private colleges",
    text: "Independently funded, often smaller, and typically the most expensive option — though also the ones with the deepest financial-aid budgets.",
  },
  {
    title: "Community colleges",
    text: "Two-year institutions awarding certificates and associate degrees rather than bachelor's degrees. Substantially cheaper, and a serious option worth understanding properly.",
  },
  {
    title: "The transfer route",
    text: "An associate degree from a community college can count as the first half of a bachelor's degree, which you finish at a university — and go on to a master's from there. It is the single most effective way to cut the cost of a US degree.",
  },
];

const SCHOLARSHIPS = [
  "Fulbright Foreign Student Program",
  "QS Undergraduate Scholarship",
  "QS Leadership Scholarship",
  "QS Leadership Scholarship for Excellence",
  "Golden Key Graduate Scholar Award",
  "IEFA Non-Government Scholarship",
];

const APPLICATION_TYPES = [
  {
    title: "Early Decision",
    text: "Binding. Deadlines usually fall between 1 and 15 November, roughly ten months before the course starts. It can improve your chances at some universities — but if you are accepted, you withdraw every other application.",
  },
  {
    title: "Early Action",
    text: "Not binding. The same early-November window, and you may apply to several colleges this way. You get an answer sooner without committing to anything.",
  },
  {
    title: "Common Application",
    text: "One online application submitted to hundreds of US colleges. It opens on 1 August, with deadlines running through January and sometimes as late as March.",
  },
  {
    title: "Regular Application",
    text: "Each university sets its own dates and you can apply to as many as you like within them. Decisions typically arrive between 1 January and 1 March.",
  },
];

const CHOOSING = [
  "Talk to admissions representatives, tour guides and faculty",
  "Reach out to current students and ask what it is really like",
  "Take a virtual campus tour where one is offered",
  "Sit in on a class if you can, and see if the teaching style suits you",
  "Read the student newspaper — activities, and what is being argued about",
  "Check what health insurance the institution requires",
];

const LIFE = [
  "The Grand Canyon",
  "Great Smoky Mountains",
  "Times Square",
  "The Statue of Liberty",
  "The Eastern Seaboard",
  "The West Coast",
  "The Southwest",
  "The Hawaiian Islands",
];

const GALLERY = [
  { src: "/usa/campus-life.jpg", alt: "Students on a US university campus" },
  { src: "/usa/new-york.jpg", alt: "The New York City skyline" },
  { src: "/usa/grand-canyon.jpg", alt: "The Grand Canyon at sunset" },
  { src: "/usa/west-coast.jpg", alt: "The Pacific coastline in California" },
];

export default function StudyInUSA() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Study in the USA | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/usa.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in the USA
            </p>
            <h1>
              Academic prowess, and{" "}
              <span className="h-accent">a life outside the classroom</span>
            </h1>
            <p className="dpage-lead">
              The USA is home to a great many of the world&rsquo;s leading
              universities — highly accredited faculty, advanced technology and
              research facilities that students actually get their hands on. A
              degree from one tends to distinguish you from people who came up
              the same way you did.
            </p>
            <p>
              What most students end up describing, though, is the campus.
              American universities run like small student towns, with
              socialising and skill-building under the same roof as the
              teaching. At Lakehead Education we help you through the
              applications, the documentation and the F-1 process — the part
              that looks most overwhelming from the outside.
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
            Why study in the <span className="h-outline">USA?</span>
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
        <Shot src="/usa/campus.jpg" alt="A US university campus in the afternoon" />
        <figcaption>
          <p>Small student towns, with the learning built in.</p>
          <span>Mentoring programmes, shuttle services, team sports, health centres and career advisors — the infrastructure for settling in is already there.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Universities &amp; <span className="h-accent">courses</span>
          </h2>
          <p className="dpage-section-lead">
            A short list of institutions we work with — there are a great many
            more, across every state:
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
            The list of programmes is genuinely vast.{" "}
            <Link to="/contact">
              Let us help you narrow it to a realistic shortlist <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <div className="dpage-pair">
        <figure><Shot src="/usa/city.jpg" alt="A downtown street in an American city" /></figure>
        <figure><Shot src="/usa/library.jpg" alt="Students studying in a university library" /></figure>
      </div>

      <section className="dpage-section" id="costs">
        <div className="container">
          <h2 className="dpage-title">
            The cost of <span className="h-accent">studying here</span>
          </h2>
          <p className="dpage-section-lead">
            There is no standardised government fee system in the US — what you
            pay depends on the institution and the course, and the spread is
            enormous. Understanding the four kinds of institution is what
            actually lets you compare, and it is where the real savings are.
          </p>
          <div className="dpage-paths">
            {INSTITUTION_TYPES.map((t, i) => (
              <div className="dpage-path" key={t.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
          <p className="dpage-fineprint">
            We have deliberately not printed tuition ranges. US fees differ by
            institution, state, course and residency status, they are revised
            every year, and a single range wide enough to be accurate would be
            too wide to be useful. Read the figure published for your specific
            programme — it is the only number that will be right.
          </p>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            What it costs to <span className="h-accent">live there</span>
          </h2>
          <p className="dpage-section-lead">
            Living costs shift considerably from one location to another, so
            securing savings against your day-to-day needs matters as much as
            the tuition. Most colleges offer on-campus dorms — usually a room
            shared with two or three others, with utilities and internet
            included — and going off campus generally costs more.
          </p>

          <div className="dpage-table-wrap">
            <div className="dpage-req-head">
              <h3>Indicative living costs (US$)</h3>
              <span className="dpage-req-stamp">
                Indicative &middot; reviewed {LIVING.lastReviewed}
              </span>
            </div>
            <div className="dpage-table-scroll">
              <table className="dpage-table">
                <caption className="dpage-visually-hidden">
                  Approximate living costs in US dollars for international students
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Expense</th>
                    <th scope="col">Approx. (US$)</th>
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

          <aside className="dpage-callout dpage-callout-wide">
            <h3>Health insurance is not optional</h3>
            <p>
              Most US institutions require international students to hold
              student health insurance as a condition of enrolment, and the
              cover they accept differs from one to the next. Budget for it
              from the start rather than discovering it at registration — we
              will tell you what your shortlist actually requires.
            </p>
            <Link className="dpage-callout-btn" to="/contact">
              Check what I&rsquo;ll need <Arrow />
            </Link>
          </aside>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Scholarships to{" "}
            <span className="h-accent">study in the US</span>
          </h2>
          <p className="dpage-section-lead">
            A scholarship can make a real difference to a US degree. Be aware
            that they are competitive and slow — approvals take time, so this
            is something to start early rather than alongside your application.
            Strong grades help; so does being athletically inclined, and awards
            exist for art, dance and music too.
          </p>
          <ul className="dpage-fields">
            {SCHOLARSHIPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="dpage-note">
            Which of these you could realistically win depends on your profile.{" "}
            <Link to="/contact">
              Let&rsquo;s work out where to put your effort <Arrow />
            </Link>
          </p>
        </div>
      </section>

      <figure className="dpage-band">
        <Shot src="/usa/student-life.jpg" alt="Students together outside on a US campus" />
        <figcaption>
          <p>They want you to go beyond the book.</p>
          <span>American universities look at the last four years of your schooling — extracurriculars, leadership and character alongside the grades.</span>
        </figcaption>
      </figure>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            The admission <span className="h-accent">process</span>
          </h2>
          <p className="dpage-section-lead">
            American universities do not believe in a one-track academic focus.
            They assess your past academic record across the last four years of
            schooling, alongside extracurricular activities, leadership
            positions and personal characteristics — so plan early and gather
            more than your transcripts. Which cycle you apply in is a real
            strategic choice:
          </p>
          <div className="dpage-paths">
            {APPLICATION_TYPES.map((a, i) => (
              <div className="dpage-path" key={a.title}>
                <span className="dpage-path-n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </div>
            ))}
          </div>
          <p className="dpage-fineprint">
            Other cycles exist beyond these four — rolling admissions among
            them — and which are available depends on the course and whether
            you are applying to a college or a university. Check the specific
            institution, or ask us.
          </p>

          <h3 className="dpage-sub">Choosing where to apply</h3>
          <ul className="dpage-checks dpage-checks-2">
            {CHOOSING.map((c) => (
              <li key={c}>
                <span aria-hidden="true"><Check /></span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dpage-section dpage-tint">
        <div className="container">
          <h2 className="dpage-title">
            Your <span className="h-outline">student visa</span>
          </h2>
          <p className="dpage-section-lead">
            Most international students study on an F-1 visa. The sequence runs:
            accept your place, receive an I-20 from your SEVP-certified school,
            pay the SEVIS fee, complete the DS-160, and attend an interview at
            a US embassy or consulate. Each step depends on the one before it,
            which is why starting late is the most common way this goes wrong.
          </p>

          {/* Its own panel on purpose: fees and interview requirements are set
              federally and revised, and a figure buried in prose is one nobody
              thinks to re-check. */}
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
              Fees, processing times and interview requirements change, and
              appointment waits vary considerably by post. Always confirm the
              current position with the{" "}
              <a href={REQUIREMENTS.source.href} target="_blank" rel="noopener noreferrer">
                {REQUIREMENTS.source.label}
              </a>{" "}
              before you apply.
            </p>
          </div>

          <p className="dpage-fineprint">
            Visa decisions are made by the US government. Our role is to help
            you understand what is being asked for and to prepare your
            application accurately — not to predict the outcome.
          </p>
        </div>
      </section>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            Life in the <span className="h-accent">US</span>
          </h2>
          <p className="dpage-section-lead">
            Expect a genuine cross-section — you will meet Americans and people
            from a great many other places, and you will develop a sense of
            independence you did not arrive with. Americans are generally
            friendly and helpful, which makes settling in easier than most
            newcomers expect. Every holiday is a proper celebration, and those
            are the best way into your new community.
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
            <h2>Ready to explore the USA?</h2>
            <p>
              We&rsquo;ll take you through everything there is to do and know
              before you go.
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
