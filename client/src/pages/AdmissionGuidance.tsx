import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Arrow, Shot } from "../components/destinationBits";

/**
 * Admission Guidance — /services/admission-guidance. A static route, so it
 * takes over from the generic service page.
 *
 * The seven stages run down a dashed spine with numbered nodes on it,
 * alternating sides, each revealing as it reaches the viewport. The
 * documentation checklist below is a native <details> list: thirteen entries
 * with a paragraph each would be an enormous wall opened out, and a
 * disclosure element gets keyboard support and find-in-page for free.
 *
 * NOTE ON CLAIMS: the source copy carried a "99% visa success rate". It is
 * not here, and it should not come back. Every other page on this site is
 * explicit that visa and admission decisions belong to institutions and
 * governments — the visa page says so in as many words — and one page
 * claiming a success rate would undercut all of them.
 */

const STAGES = [
  {
    title: "Free expert counselling",
    text: "Our counsellors give you personal guidance rather than a script. They take the time to understand what you need and where your academic record actually stands, then recommend the courses and institutions that suit your profile — not the ones that are easiest to place you in.",
    image: "/services/admission/counselling.jpg",
  },
  {
    title: "Identify course, country and university",
    text: "We help you settle the three decisions that determine everything else: which country suits you, which institution, and which course. If you are undecided about the course, we run an assessment to establish where your interests and abilities actually lie before you commit.",
    image: "/services/admission/identify.jpg",
    link: { to: "/services/career-counselling", label: "About our aptitude testing" },
  },
  {
    title: "International test preparation",
    text: "Coaching for TOEFL, PTE, IELTS, GMAT, GRE, SAT and ACT, with guidance from faculty who teach these tests rather than generalists. Comprehensive courseware and regular internal testing, so you find out where you stand well before the real thing.",
    image: "/services/admission/test-prep.jpg",
    link: { to: "/services/test-preparation", label: "See the tests we coach" },
  },
  {
    title: "Document editing",
    text: "Every application is processed carefully to remove errors before it goes anywhere. We work through the areas that matter, give you feedback, and make sure everything is compiled and sealed properly. Our specialists check your documents against the specific requirements of the university you are applying to — which is where most avoidable delays come from.",
    image: "/services/admission/documents.jpg",
  },
  {
    title: "Application process",
    text: "Every application gets individual attention, on paper or online. You and your counsellor go through the documents together and improve them before submission. We also provide the institution with an assessment of your strengths and why you are a good match for the programme.",
    image: "/services/admission/application.jpg",
  },
  {
    title: "Interview preparation",
    text: "Interviews come up for admission, for visa eligibility and for the visa itself. We prepare you for the questions universities actually ask, in mock sessions led by people who know what those questions tend to be — and, just as usefully, how long an answer should be.",
    image: "/services/admission/interview.jpg",
  },
  {
    title: "Visa guidance",
    text: "Free for every Lakehead student, for every country we place in. Mock visa interviews, guidance on what to do and what not to, and support across the whole process from document preparation to submission — working from current consulate advice rather than last year's notes.",
    image: "/services/admission/visa.jpg",
    link: { to: "/services/visa-guidance", label: "More on visa guidance" },
  },
];

/* The checklist. `need` is what you have to produce; `text` is what we do
   about it. Kept as data so the order can be changed without touching JSX. */
const CHECKLIST = [
  {
    label: "Identity",
    need: "Valid passport, previous passports, photographs",
    text: "Valid identification is the foundation of both the application and the visa. We advise on passport validity and the photo specifications each country sets, and catch inconsistencies early — they are trivial to fix months out and expensive to fix weeks out.",
  },
  {
    label: "Academics",
    need: "Mark sheets, degrees, transcripts, certificates",
    text: "Every educational record needs compiling properly. We help you organise and check them, obtain official transcripts from your institution where that is needed, and make sure the formatting and submission meet the university's own requirements.",
  },
  {
    label: "English tests",
    need: "TOEFL, IELTS, PTE or Duolingo, as required",
    text: "Proof of English is compulsory almost everywhere. We help you pick the test your destination and university actually accept, and advise on the score criteria and what preparation it will realistically take.",
  },
  {
    label: "Entrance exams",
    need: "GRE, GMAT, SAT or ACT, if required",
    text: "Depending on the programme, a standardised test may be expected. We advise whether yours needs one, what a competitive score looks like for your target institutions, and how to schedule preparation around your other deadlines.",
  },
  {
    label: "Work experience",
    need: "Résumé, experience letters, salary slips, achievements",
    text: "Relevant professional experience strengthens an application considerably. We help you structure your profile so the achievements line up with the programme you are applying to, and make sure the paperwork is precise and consistent.",
  },
  {
    label: "Statement of Purpose",
    need: "Academic background, goals, programme rationale — plagiarism-free",
    text: "The SOP sets out where you have come from, what you intend to do, and why this programme. We help you write something engaging and specific to you, and polish it against what the university is looking for. It has to be your own work, and we treat that as non-negotiable.",
  },
  {
    label: "Letters of Recommendation",
    need: "One to three signed LORs from academic or professional referees",
    text: "Strong letters from professors or employers carry real weight. We help you choose referees who can genuinely speak to your ability and character, and give them guidance on structure — while making sure the letters are authentic and written by the person signing them.",
  },
  {
    label: "Express admission",
    need: "Faster admission letters, where the institution offers it",
    text: "Some institutions can decide more quickly. We identify where that is available and make sure everything is submitted on time and complete, which is the only part of the timeline anybody on this side actually controls.",
  },
  {
    label: "Institution interview prep",
    need: "Admission interview, Genuine Student test, CAS checks",
    text: "Some universities interview or run their own assessments before confirming a place. We run mock sessions and coaching so you go in with clarity rather than nerves, and know what the assessment is actually looking for.",
  },
  {
    label: "Scholarships",
    need: "Application assistance and guidance",
    text: "Scholarships can change what a degree costs by a great deal. We help you find the ones you are genuinely eligible for, and advise on writing essays that stand up next to everyone else's.",
  },
  {
    label: "Financial proof",
    need: "Bank statements, tax returns, loan and sponsor documents",
    text: "You will need to evidence sufficient funds. We help organise and verify the documents against the visa rules for your destination, and advise on which funding sources are accepted and how they must be presented.",
  },
  {
    label: "Document integrity",
    need: "Original, accurate and verifiable throughout",
    text: "Everything submitted has to be authentic and checkable. We go through the set thoroughly for inconsistencies and errors — misrepresentation, even accidental, is one of the few problems that cannot be recovered from later.",
  },
  {
    label: "Visa and compliance",
    need: "Visa processing, interview prep, medical and police clearance",
    text: "Visa applications need thorough documentation, medical examinations and police clearance certificates. We take you through form completion and interview preparation, and make sure you are meeting the immigration requirements as they currently stand.",
  },
];

export default function AdmissionGuidance() {
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Admission Guidance | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const nodes = items.current.filter((n): n is HTMLLIElement => !!n);
    if (!nodes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <article className="dpage">
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/services/interview.jpg" alt="" />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              <Link className="svc-crumb" to="/services">Student Services</Link>
            </p>
            <h1>
              Admission <span className="h-accent">Guidance</span>
            </h1>
            <p className="dpage-lead">
              From the first conversation to the day your visa is decided,
              handled as one sequence rather than a series of separate errands.
              Personal guidance, honest assessment of where you stand, and
              paperwork that gives nobody a reason to come back with questions.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Free Expert Consultation →</Link>
              <a className="dpage-jump" href="#checklist">
                Documentation checklist <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="dpage-section">
        <div className="container">
          <h2 className="dpage-title">
            The whole process,{" "}
            <span className="h-outline">step by step</span>
          </h2>
          <p className="dpage-section-lead">
            Seven stages. Most students come to us at the first and stay to the
            last, but you can join at any point in it.
          </p>

          <ol className="tl">
            {STAGES.map((s, i) => (
              <li
                className="tl-item"
                key={s.title}
                ref={(el) => {
                  items.current[i] = el;
                }}
              >
                <figure className="tl-shot">
                  <Shot src={s.image} alt="" />
                </figure>
                {/* The node sits on the spine; the spine itself is drawn by
                    .tl::before, so it is one line rather than seven joins. */}
                <span className="tl-node" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="tl-body">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  {s.link && (
                    <Link className="tl-link" to={s.link.to}>
                      {s.link.label} <Arrow />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="dpage-section dpage-tint" id="checklist">
        <div className="container">
          <h2 className="dpage-title">
            Documentation <span className="h-accent">checklist</span>
          </h2>
          <p className="dpage-section-lead">
            What you will need, and what we do about each of it. Open any of
            them — nothing here is a surprise if you start early enough.
          </p>
          <div className="ck">
            {CHECKLIST.map((c, i) => (
              <details className="ck-item" key={c.label}>
                <summary>
                  <span className="ck-n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ck-head">
                    <strong>{c.label}</strong>
                    <span className="ck-need">{c.need}</span>
                  </span>
                  <span className="ck-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p>{c.text}</p>
              </details>
            ))}
          </div>
          <p className="dpage-fineprint">
            Requirements differ by country, by institution and by programme,
            and they are revised regularly. We confirm what your specific
            application needs against the official source rather than working
            from a general list.
          </p>
        </div>
      </section>

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Start at the beginning</h2>
            <p>
              Or wherever you happen to be. Tell us how far along you are and
              we will pick it up from there.
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
