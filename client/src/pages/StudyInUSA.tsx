import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PlaneIcon } from "../components/HeroOrbit";
import { Check, Arrow, Shot } from "../components/destinationBits";
import { armReveals } from "../lib/reveal";
import TypeStack from "../components/TypeStack";
import HelpVideo from "../components/HelpVideo";
import CallbackStrip from "../components/CallbackStrip";
import RelatedReading from "../components/RelatedReading";

/**
 * Study in the USA — the long-form guide, built from Lakehead's own master
 * draft rather than from a competitor page.
 *
 * It is deliberately long: twenty-one sections, because the argument the
 * copy makes is that choosing an American university is not one decision but
 * eight. What makes that readable rather than punishing is the furniture —
 * a sticky contents rail that tracks where you are, sections that arrive as
 * you reach them, and recurring callouts that give the eye somewhere to
 * rest. Take those away and this becomes a wall.
 *
 * Two prompts in the source are written as things to DO ("circle your top
 * three priorities"), so they are actually interactive here. The shortlist
 * check even keeps the joke: pick all eight and it tells you that you have
 * invented a wish list.
 *
 * The copy hedges carefully throughout — "can", "may", "often", "check the
 * current official requirements" — and that is not padding. Admission and
 * visa rules differ by institution and change yearly, and this page names no
 * fee, no score threshold and no success rate anywhere. Keep it that way.
 */

/* ---- section index, used for the contents rail and the anchors ---- */
const SECTIONS = [
  { id: "start", label: "Thinking about the USA?" },
  { id: "young", label: "A young country" },
  { id: "big", label: "America is big" },
  { id: "culture", label: "American culture" },
  { id: "types", label: "Types of university" },
  { id: "ivy", label: "Ivy League?" },
  { id: "choose", label: "How to choose" },
  { id: "subjects", label: "Popular study areas" },
  { id: "admissions", label: "Admissions" },
  { id: "timing", label: "When to start" },
  { id: "money", label: "Tuition" },
  { id: "scholarships", label: "Scholarships" },
  { id: "visa", label: "Student visa" },
  { id: "work", label: "Working while studying" },
  { id: "life", label: "Student life" },
  { id: "housing", label: "Accommodation" },
  { id: "safety", label: "Safety & health" },
  { id: "career", label: "Careers" },
  { id: "myths", label: "Myths" },
  { id: "faq", label: "Questions we get" },
  { id: "roadmap", label: "Your roadmap" },
];


const UNI_TYPES = [
  {
    name: "Public Research Universities",
    lead: "Think: big campus. Lots of programs. Lots of students. Lots happening.",
    text: "These universities often have extensive research facilities, libraries, laboratories, graduate programs, athletics and huge student communities. They can be a great fit if you enjoy variety and want that classic big-campus experience.",
    best: "Students who like plenty of choices and a busy campus.",
    examples: [
      "University of Texas at Arlington (UTA)", "University of South Florida (USF)",
      "Arizona State University (ASU)", "University of Texas at Austin (UT Austin)",
      "University of Illinois Urbana-Champaign (UIUC)", "Kent State University",
      "St. Cloud State University", "University of Nebraska at Kearney (UNK)",
      "University of Mississippi (Ole Miss)",
    ],
    image: "/usa/public-research.jpg",
  },
  {
    name: "Private Universities",
    lead: "From colleges where your professor might actually know your name to massive research universities.",
    text: "Some have smaller student populations, while others are very large. They may also offer institutional scholarships or financial aid, but prices can vary widely. So don't assume: private = expensive, public = cheap. Reality is a little more complicated.",
    examples: [
      "Northeastern University", "New York University (NYU)", "University of Southern California (USC)",
      "Amherst College", "Harvard University", "Massachusetts Institute of Technology (MIT)",
      "Stanford University", "Yale University", "Princeton University",
      "University of Pennsylvania (UPenn)", "Columbia University", "Dartmouth College",
      "Drexel University", "Rochester Institute of Technology (RIT)", "Caldwell University",
      "Arkansas State University", "Chadron State College", "Youngstown State University",
      "University of Central Missouri", "South Dakota State University",
    ],
    image: "/usa/private.jpg",
  },
  {
    name: "Liberal Arts Colleges",
    lead: "Think: fewer students, more interaction.",
    text: "These institutions often focus heavily on undergraduate education, broad learning and close interaction with faculty. They can be excellent for students who prefer smaller classes and a more personal academic environment.",
    examples: ["Williams College", "Amherst College", "Swarthmore College", "Pomona College", "Bowdoin College"],
    image: "/usa/liberal-arts.jpg",
  },
  {
    name: "Regional Universities",
    lead: "It doesn't need to be famous on Instagram to be great for your course.",
    text: "These universities often have strong undergraduate and professional programs and can offer a more community-focused campus experience. A university being less famous does not automatically mean it is less valuable for you.",
    examples: [
      "Rowan University", "Arcadia University", "Youngstown State University",
      "University of Central Missouri", "Arkansas State University", "Minot State University",
      "Eastern New Mexico University (ENMU)", "University of Wisconsin–Superior",
      "Bemidji State University", "Chadron State College", "Northwest Missouri State University",
      "West Texas A&M University", "Delta State University", "Morehead State University",
      "Boise State University", "Idaho State University", "Lewis-Clark State College",
    ],
    image: "/usa/regional.jpg",
  },
  {
    name: "Community Colleges",
    lead: "Two-year programs, and a pathway toward a bachelor's degree.",
    text: "Students considering this route should understand transfer agreements, academic requirements and total costs before enrolling.",
    examples: ["Foothill College", "De Anza College", "Green River College", "Santa Monica College"],
    image: "/usa/community.jpg",
  },
];

const IVY = [
  "Brown University", "Columbia University", "Cornell University", "Dartmouth College",
  "Harvard University", "Princeton University", "University of Pennsylvania", "Yale University",
];

const NEPALI_PICKS = [
  "University of Texas at Arlington (UTA)", "St. Cloud State University",
  "Minnesota State University, Mankato", "Arizona State University (ASU)",
  "University of Texas at Dallas (UT Dallas)", "University of Idaho",
  "University of Kansas", "Northern Arizona University",
];

const WHY_THESE = [
  "Existing Nepali or South Asian student communities can make the first few months feel less unfamiliar.",
  "Many students compare scholarships and overall cost, not just rankings.",
  "STEM, business, engineering, computing and other career-focused programs attract a lot of interest.",
  "Location matters too — some students prefer Texas or Arizona; others like quieter college towns or Midwestern campuses.",
];

const CHOOSE_QUESTIONS = [
  "What exactly do I want to study?",
  "Do I need a specific specialisation?",
  "Do I prefer a huge campus or a smaller community?",
  "Do I want a big city, suburb, or college town?",
  "What weather can I realistically handle?",
  "What is my maximum realistic annual budget?",
  "How much scholarship support would I need?",
  "How strong is the university in my intended subject?",
  "What internships, research, co-op or practical-learning opportunities are available?",
  "What support does the university provide to international students?",
  "What are the admission requirements and deadlines?",
  "Does the university's location make sense for my career goals?",
];


const ADMISSIONS = [
  "Academic transcripts and qualifications.",
  "English-language proficiency evidence when required.",
  "Standardised tests when required or considered.",
  "Personal statements or essays for many applications.",
  "Letters of recommendation for many programs.",
  "Résumé/CV, portfolio or additional materials for certain programs.",
  "Application fees where applicable.",
];



const LIFE = [
  "Student clubs and organisations", "Sports and fitness", "Cultural and international groups",
  "Research projects", "Volunteer work", "Career fairs and professional events",
  "Campus jobs where permitted", "Academic tutoring and support", "Community activities",
];

const MYTHS = [
  { myth: "I must attend an Ivy League university.", truth: "No. There are many excellent U.S. universities outside the Ivy League." },
  { myth: "A higher ranking automatically means a better university for me.", truth: "No. Subject strength, cost, location, support and career opportunities may matter more." },
  { myth: "The cheapest tuition means the cheapest university.", truth: "Not necessarily. Compare the total cost of attendance." },
  { myth: "I can work as much as I want on an F-1 visa.", truth: "No. Employment and authorisation rules apply." },
  { myth: "All American universities are basically the same.", truth: "Definitely not. A rural college town and a major-city campus can feel like different worlds." },
  { myth: "If I get admission, my visa is guaranteed.", truth: "No. Admission and visa decisions are separate." },
  { myth: "I must know exactly what I will do for the rest of my life before applying.", truth: "Not necessarily. Many students refine their interests — although you should still have a sensible academic direction." },
];

const FAQ = [
  { q: "Is the USA good for undergraduate study?", a: "It can be. The USA offers a huge range of undergraduate pathways. The key is comparing academic fit, cost, location, admission requirements and support." },
  { q: "Can I get a scholarship?", a: "Possibly. Scholarship availability and eligibility vary widely. Start early and check the exact rules and deadlines." },
  { q: "Do I need the SAT or ACT?", a: "It depends on the university and program. Some are test-optional; others may require or consider scores. Check each university's current policy." },
  { q: "Is an English test required?", a: "Many universities require or accept proof of English proficiency, while some students may qualify for exemptions. Policies vary." },
  { q: "Big city or college town?", a: "That depends on your budget and personality. Big cities may offer more transport, activities and employers but can cost more. College towns can offer a more campus-centred experience." },
  { q: "Can I work while studying?", a: "There may be permitted employment or practical-training options for eligible F-1 students, but authorisation rules apply." },
  { q: "How much money do I need to show?", a: "There is no single figure for every student. Financial-document requirements depend on the school and visa circumstances. Follow current university and official U.S. government instructions." },
  { q: "What if I don't know which university is right for me?", a: "That is completely normal. Start with your subject, budget, preferred location and career direction. Then compare a balanced shortlist." },
];

const ROADMAP = [
  "Know your goal: degree level, subject, intake and budget.",
  "Research universities and locations.",
  "Build a shortlist based on fit — not fame alone.",
  "Check current admission requirements and deadlines.",
  "Prepare English tests or other required exams.",
  "Prepare transcripts, recommendations, essays, résumé and any program-specific materials.",
  "Research scholarships and financial aid.",
  "Submit applications carefully and on time.",
  "Compare offers and total costs.",
  "Complete the university's international-student process.",
  "Follow the current student-visa process.",
  "Prepare housing, travel, finances and arrival documents.",
  "Arrive, settle in and actually use the support your university provides.",
];

/* ---- small pieces used throughout ---- */

const DidYouKnow = ({ children }: { children: ReactNode }) => (
  <aside className="dyk" data-reveal>
    <p className="dyk-tag">Did you know?</p>
    {children}
  </aside>
);

/** The asides and jokes the draft uses to break up a long read. */
const Quip = ({ children }: { children: ReactNode }) => (
  <p className="quip" data-reveal>{children}</p>
);

const Band = ({ src, caption }: { src: string; caption?: string }) => (
  <figure className="usa-band" data-reveal>
    {/* `still`: the band already scales its own photograph from 1.14 down to
        1 as it reveals, and that rule is a class-plus-tag selector, so it
        outranks the drift and would swallow it silently. One motion per
        picture — same rule as the TypeStack shots. */}
    <Shot src={src} alt="" still />
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
);

export default function StudyInUSA() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Study in the USA | Lakehead Education";
    return () => {
      document.title = previous;
    };
  }, []);

  /* Everything marked data-reveal arrives as it reaches the viewport, then
     stays put — a page this long would otherwise replay itself at anyone
     scrolling back for something they half-read.

     A direct sweep, not an IntersectionObserver: an observer never fires for
     an element that goes from below the viewport to above it in one jump —
     which is what the contents rail, a fast scroll, and a restored scroll
     position all do — and such an element then stays hidden forever while
     still holding its full height. That is where the white gaps in the
     middle of these pages came from. See lib/reveal.ts. */
  useEffect(() => {
    if (!root.current) return;
    return armReveals(root.current);
  }, []);

  /* Which section the contents rail should highlight. A generous negative
     bottom margin means the active entry changes when a heading reaches the
     upper third, which is where people actually read from. */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <article className="dpage usa" ref={root}>
      <header className="dpage-hero">
        <div className="dpage-hero-bg">
          <Shot src="/usa.jpg" alt="" priority />
        </div>
        <div className="container dpage-hero-inner">
          <div className="dpage-hero-copy">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-icon"><PlaneIcon /></span>
              Study in the USA
            </p>
            <h1>
              Hey — you&rsquo;re thinking about{" "}
              <span className="h-accent">the USA?</span>
            </h1>
            <p className="dpage-lead">
              You&rsquo;ve probably seen America in movies, on YouTube, in
              sports, on Instagram or in the news. But the USA is much more
              than New York, Hollywood and Silicon Valley.
            </p>
            <div className="dpage-hero-actions">
              <Link className="btn btn-outline" to="/contact">Talk to Our Counsellors →</Link>
              <a className="dpage-jump" href="#types">
                Types of university <Arrow />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="usa-shell container">
        {/* Contents rail. A twenty-one section page without one is a wall.
            Under it, what else we have written about the USA — the same
            block the data-driven guides carry, see GuidePage.tsx. */}
        <div className="usa-rail">
          <nav className="usa-toc" aria-label="On this page">
            <p className="usa-toc-tag">On this page</p>
            <ol>
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className={active === s.id ? "is-here" : undefined}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <RelatedReading page="study-in-usa" />
        </div>

        <div className="usa-body">
          {/* 1 */}
          <section id="start" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              There is no single <span className="h-accent">American university experience</span>
            </h2>
            <p data-reveal>
              The country has thousands of higher-education institutions,
              ranging from huge public universities to small private colleges.
              That means you are not simply choosing a university. You&rsquo;re
              choosing a course, a campus, a city, a climate, a budget and a
              lifestyle.
            </p>
            <p className="usa-pull" data-reveal>
              The better question is not &ldquo;What is the most famous
              university?&rdquo; It is &ldquo;Which U.S. university is right
              for me?&rdquo;
            </p>
            <Quip>
              Tiny warning: researching U.S. universities has a mysterious
              ability to turn 3 browser tabs into 37. That is why having a
              clear shortlist matters.
            </Quip>
            <DidYouKnow>
              <p>
                In Nepal, when someone asks &ldquo;Which university should I
                join?&rdquo;, names like Tribhuvan University and Kathmandu
                University may come to mind pretty quickly. In the U.S., you
                can spend an afternoon researching universities and still
                discover several you&rsquo;ve never heard of — and honestly,
                that can be a good thing.
              </p>
              <p>
                You get to compare your course, budget, city, scholarships,
                career goals, campus and student life — not just the university
                name.
              </p>
            </DidYouKnow>
          </section>

          <Band src="/usa/campus-life.jpg" caption="Thousands of institutions. No two the same." />

          {/* 2 */}
          <section id="young" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              A young country, a{" "}
              <span className="h-outline">huge</span> education system
            </h2>
            <DidYouKnow>
              <p>
                Here&rsquo;s a fun way to put America&rsquo;s age into
                perspective: the United States declared independence in 1776,
                while Oxford had already been teaching students for roughly
                680 years.
              </p>
            </DidYouKnow>
            <p data-reveal>
              Think about that for a moment. When Oxford was already a
              centuries-old centre of learning, the country we now know as the
              United States didn&rsquo;t even exist yet. And yet, in less than
              250 years, the U.S. developed one of the world&rsquo;s largest
              and most influential higher-education systems. Pretty incredible
              for such a young country, right?
            </p>
          </section>

          {/* 3 */}
          <section id="big" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              America is <span className="usa-shout">BIG</span>. Seriously.
            </h2>
            <p data-reveal>
              Coming from Nepal, it can be difficult to picture the scale of
              the United States. So let&rsquo;s make it simple.
            </p>

            <div className="usa-compare" data-reveal>
              <div>
                <span className="usa-compare-label">Nepal</span>
                <strong>147,516 km²</strong>
              </div>
              <div className="usa-compare-x" aria-hidden="true">×67</div>
              <div>
                <span className="usa-compare-label">United States</span>
                <strong>~9.87 million km²</strong>
              </div>
            </div>
            <p className="usa-compare-note" data-reveal>
              The United States is roughly 67 times larger than Nepal by total
              area. And here&rsquo;s a comparison that is easier to imagine:
              Texas alone is roughly five times the size of Nepal. Suddenly
              &ldquo;a little far from campus&rdquo; can mean something very
              different.
            </p>

            <p data-reveal>
              The size of the country matters because your location can change
              your entire student experience. A university in a major city can
              feel completely different from one in a small college town.
              Weather, rent, public transport, part-time opportunities,
              internships and even your weekend plans can depend heavily on
              where you study.
            </p>
            <p className="usa-pull" data-reveal>
              So don&rsquo;t just ask &ldquo;Which university?&rdquo; Ask
              &ldquo;Which university <em>and which place</em>?&rdquo;
            </p>

            <p data-reveal>
              It is worth asking yourself early which of these sounds most
              like you, because the answer filters more of the list than any
              ranking will. A big city, with everything on the doorstep and a
              cost of living to match. A proper campus town, where the
              university is the place and you will know your professors.
              Somewhere warm, because climate shapes four years of your life
              and your jacket has suffered enough. Or no idea at all —
              which is completely fine, and more common than the other three
              put together. None of it chooses a university for you. All of it
              narrows the field by location, cost and lifestyle, which is most
              of the decision.
            </p>
          </section>

          {/* 4 */}
          <section id="culture" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              What should a Nepali student expect in{" "}
              <span className="h-accent">American culture?</span>
            </h2>
            <p data-reveal>
              One of the biggest adjustments may not happen in your lecture
              hall. It may happen in the way people communicate, study and
              manage everyday life.
            </p>
            <Quip>
              A little independence feels great. A deadline at 11:59 PM still
              remains a deadline at 11:59 PM.
            </Quip>
            <p data-reveal>
              A few habits are worth knowing before you arrive. Speak up:
              at many U.S. universities students are expected to ask
              questions, share opinions and take part in discussion rather
              than listen quietly. Talk to your professors — office hours
              are a normal, expected way to ask questions or seek guidance,
              not an imposition. Expect a genuinely multicultural room, with
              classmates from many countries. Expect more independence than
              you are used to, and the responsibility for deadlines that comes
              with it. Take academic integrity seriously, and understand
              plagiarism, citation, collaboration rules and exam policy before
              you start rather than after. And ask for help: academic
              advisers, tutoring and writing centres and the international
              student office exist for exactly that.
            </p>

            <p className="usa-pull" data-reveal>
              The goal is not to become &ldquo;American.&rdquo; The goal is to
              understand the environment well enough to feel confident in it.
            </p>
            <DidYouKnow>
              <p>
                <strong>Office hours are not detention.</strong> If a professor
                says &ldquo;Come see me during office hours,&rdquo; that is
                usually an invitation to ask questions — not a sign that you
                are in trouble.
              </p>
            </DidYouKnow>
            <p data-reveal>
              But &lsquo;USA&rsquo; is not automatically the best choice for
              everyone. A strong decision starts with your course, budget,
              academic profile, career goals and preferred lifestyle.
            </p>
            <p className="usa-pull" data-reveal>
              Finish this sentence before you read on. &ldquo;I am considering
              the USA because&hellip;&rdquo; If the only answer is because
              everyone is going, keep reading. We can do better than that.
            </p>
          </section>

          <Band src="/usa/classroom.jpg" caption="Ask questions. It is expected of you." />

          {/* 5 */}
          <section id="types" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Types of U.S. university —{" "}
              <span className="h-accent">which one sounds like you?</span>
            </h2>
            <p data-reveal>
              The U.S. doesn&rsquo;t have just one type of university. There are
              huge campuses, small colleges, research powerhouses, community
              colleges and everything in between. So before you start chasing
              rankings, let&rsquo;s figure out what kind of university actually
              fits you.
            </p>

            {/* A pinned stack rather than a column of rows — the same
                component the other five guides use for this block. */}
            <TypeStack items={UNI_TYPES} />

            <div className="usa-nepali" data-reveal>
              <h3>Commonly explored by Nepali students</h3>
              <p>
                If you&rsquo;re wondering &ldquo;Okay, but where do Nepali
                students actually go?&rdquo; — fair question. There is no
                single official Nepal-only popularity ranking that stays the
                same every year. But some universities have visible Nepali
                student communities, while others are repeatedly explored by
                students from Nepal because of programs, scholarships, costs,
                location or existing student networks.
              </p>
              <ul className="usa-chips">
                {NEPALI_PICKS.map((n) => <li key={n}>{n}</li>)}
              </ul>
              <h4>Why do these names come up?</h4>
              <ul className="dpage-checks">
                {WHY_THESE.map((w) => (
                  <li key={w}><span aria-hidden="true"><Check /></span>{w}</li>
                ))}
              </ul>
              <Quip>
                Tiny reality check: &ldquo;My cousin studies there&rdquo; is
                useful information. It is not a university ranking system.
                Compare the course, cost, scholarship, location and support
                before you decide.
              </Quip>
              <p>
                <strong>Ask yourself:</strong> would I prefer a university with
                an established Nepali community, or a campus where I am pushed
                to build a completely new circle? Neither answer is wrong — but
                knowing yourself helps.
              </p>
              <p className="usa-note">
                This list is illustrative — not a ranking, and not a list of
                Lakehead partner institutions. Student flows, scholarships,
                tuition and admission patterns change, so treat it as a
                starting point for research rather than a shortlist.
              </p>
            </div>
          </section>

          {/* 6 */}
          <section id="ivy" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Ivy League? <span className="h-outline">Or maybe not.</span>
            </h2>
            <p data-reveal>
              Let&rsquo;s settle this early. You do <strong>not</strong> need an
              Ivy League university to succeed in America. The Ivy League is a
              group of eight private universities — and the myth-buster is
              this: it does not mean &ldquo;the eight best universities in
              America.&rdquo; The Ivy League is actually an athletic conference.
            </p>
            <ul className="usa-chips usa-chips-ivy" data-reveal>
              {IVY.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <DidYouKnow>
              <p>
                <strong>MIT is not an Ivy League university.</strong> Yep. MIT
                is one of the world&rsquo;s best-known universities —
                especially for engineering, technology, science and innovation
                — but it isn&rsquo;t part of the Ivy League. The U.S. has many
                highly respected universities outside it, including MIT,
                Stanford, Caltech and many others.
              </p>
            </DidYouKnow>
            <p className="usa-pull" data-reveal>
              Don&rsquo;t chase the label. Chase the right university for{" "}
              <em>you</em>. If your dream university is not Ivy League, your
              career will not collapse. Promise.
            </p>
          </section>

          {/* 7 */}
          <section id="choose" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              How to <span className="h-accent">choose</span> your university
            </h2>
            <p data-reveal>
              Before you build a university list, ask yourself a few honest
              questions.
            </p>
            <ol className="usa-questions" data-reveal>
              {CHOOSE_QUESTIONS.map((q, i) => (
                <li key={q}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {q}
                </li>
              ))}
            </ol>
            <p className="usa-pull" data-reveal>
              A ranking can be one data point. It should not be your entire
              decision.
            </p>
            <p data-reveal>
              Before a shortlist means anything, name what actually matters to
              you: program strength, total cost, a scholarship, the city,
              campus size, research, internship opportunities, the support an
              institution gives international students. Nobody wants all eight
              equally — and if you find yourself insisting you do, that is
              the answer telling you the shortlist has not been thought about
              yet. The two or three you would not trade away are the ones to
              build from.
            </p>
          </section>

          {/* 8 */}
          <section id="subjects" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Popular <span className="h-accent">study areas</span>
            </h2>
            <p data-reveal>
              From Business and Engineering to Computer Science, AI, Design,
              Health, Psychology and more, the USA offers a huge range of study
              options.
            </p>
            <DidYouKnow>
              <p>
                A degree in Computer Science doesn&rsquo;t always mean just
                programming. You could explore areas such as AI, Cybersecurity,
                Data Science or Game Development.
              </p>
            </DidYouKnow>
            <p data-reveal>
              So don&rsquo;t just ask &ldquo;Which course is popular?&rdquo; Ask
              &ldquo;Which one actually interests me?&rdquo; Check what you will
              study, explore your options and choose wisely.
            </p>
            <Quip>
              After all, changing your Netflix show is easy. Changing your
              major? A little more complicated.
            </Quip>
          </section>

          {/* 9 */}
          <section id="admissions" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Admissions: what will universities{" "}
              <span className="h-accent">look at?</span>
            </h2>
            <p data-reveal>
              There is no single application formula for every U.S. university.
              Requirements can differ by university, degree level and program.
            </p>
            <ul className="dpage-checks dpage-checks-2" data-reveal>
              {ADMISSIONS.map((a) => (
                <li key={a}><span aria-hidden="true"><Check /></span>{a}</li>
              ))}
            </ul>
            <p data-reveal>
              Some universities use holistic admissions, meaning they may
              consider multiple parts of an application rather than one score
              alone. Policies differ, so always read the current official
              requirements for each institution.
            </p>
            <div className="usa-warn" data-reveal>
              <p className="usa-warn-tag">Golden rule</p>
              <p>
                Never build your application around a requirement you saw in a
                random TikTok, Facebook post or old blog. Check the university.
              </p>
              <p className="usa-warn-more">
                If a reel says &ldquo;This university needs no English test, no
                documents, no money and basically no application&rdquo; —
                please give your eyebrows permission to rise. Then check the
                official university page.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section id="timing" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              How early should you <span className="h-accent">start?</span>
            </h2>
            <p data-reveal>
              Earlier is better. For many students, beginning roughly{" "}
              <strong>9–12 months</strong> or more before the intended intake
              gives enough time to research universities, prepare tests if
              required, gather documents, apply for scholarships, submit
              applications, receive decisions and prepare for the visa process.
            </p>
            <p data-reveal>
              Some students begin even earlier, especially when they need
              competitive scholarships, standardised tests, portfolios or
              additional academic preparation.
            </p>
            <Quip>
              Create a simple calendar. Put every deadline in one place.
              Future-you will be grateful.
            </Quip>
          </section>

          <Band src="/usa/money.jpg" caption="Never look only at the tuition figure." />

          {/* 11 */}
          <section id="money" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Tuition: let&rsquo;s talk <span className="h-accent">money</span>
            </h2>
            <p data-reveal>
              Okay, now the part nobody wants to ignore. The cost of studying in
              the USA can vary dramatically by university, program, location,
              housing and lifestyle. Never look only at the tuition figure.
            </p>
            <p data-reveal>
              Your budget should consider tuition and fees, housing, food,
              health insurance, books and supplies, transportation, personal
              expenses and travel. Some locations are much more expensive than
              others.
            </p>
            <div className="dpage-callout" data-reveal>
              <h3>Work out your real total</h3>
              <p>
                Tuition is one line of many. We&rsquo;ll help you build a full
                cost-of-attendance figure for the universities on your
                shortlist, so you are comparing like with like.
              </p>
              <Link className="dpage-callout-btn" to="/contact">
                Build my budget <Arrow />
              </Link>
            </div>
          </section>

          {/* 12 */}
          <section id="scholarships" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Scholarships &amp; <span className="h-accent">financial aid</span>
            </h2>
            <p data-reveal>
              Yes, scholarships exist. And no, they&rsquo;re not all awarded for
              the same reason.
            </p>
            <p data-reveal>
              The funding falls into a few kinds. Merit-based awards turn on
              academic performance, where a strong GPA helps and some
              universities also weigh standardised scores such as the SAT
              where they apply. Need-based aid turns instead on your or your
              family's financial situation, with its own eligibility rules and
              documentation. Talent and achievement scholarships exist for
              sport, music, art, leadership or whatever else makes an
              application stand out. And then there is the essay, which is
              worth treating as its own piece of work — your numbers get
              you noticed, but the essay is where achievements, goals,
              experience and how you present yourself actually do their work.
            </p>
            <DidYouKnow>
              <p>
                A high SAT score, strong GPA, excellent English test score,
                impressive achievements or a great essay can strengthen your
                application — but there is usually no universal score that
                guarantees a scholarship. One university might award
                scholarships automatically based on GPA or test scores, while
                another may review your entire application.
              </p>
            </DidYouKnow>
            <h3 className="usa-h3" data-reveal>Before you apply, ask</h3>
            <ul className="dpage-checks dpage-checks-2" data-reveal>
              <li><span aria-hidden="true"><Check /></span>What are the requirements?</li>
              <li><span aria-hidden="true"><Check /></span>Is there a minimum GPA or test score?</li>
              <li><span aria-hidden="true"><Check /></span>Do I need a separate application or essay?</li>
              <li><span aria-hidden="true"><Check /></span>Is the scholarship renewable each year?</li>
            </ul>
            <div className="usa-warn" data-reveal>
              <p className="usa-warn-tag">Read it twice</p>
              <p>
                &ldquo;Up to $30,000 scholarship&rdquo; does not mean you&rsquo;re
                automatically getting $30,000. Those two little words —
                &ldquo;up to&rdquo; — can do a lot of work. Read them twice
                before mentally spending the scholarship.
              </p>
            </div>
          </section>

          {/* 13 */}
          <section id="visa" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Student visa: the <span className="h-accent">big picture</span>
            </h2>
            <p data-reveal>
              For many students pursuing academic study in the United States,
              the <strong>F-1</strong> student classification is the relevant
              category. Visa preparation is separate from university admission.
            </p>
            <p data-reveal>
              A typical journey involves choosing a school, being admitted,
              completing the school&rsquo;s international-student process,
              receiving the required documentation, completing the visa
              application process, attending an interview if required, and
              preparing for travel.
            </p>
            <p data-reveal>
              Visa rules and procedures can change. Use current official U.S.
              government instructions and guidance from your university&rsquo;s
              international student office.
            </p>
            {/* The dated facts, kept out of the prose for the reason every
                guide on this site keeps them out: fees and interview
                requirements are set federally and revised, and a figure
                buried in a paragraph is one nobody thinks to re-check. */}
            <div className="dpage-req" data-reveal>
              <div className="dpage-req-head">
                <h3>Latest requirements at a glance</h3>
                <span className="dpage-req-stamp">Last reviewed August 2026</span>
              </div>
              <dl className="dpage-req-grid dpage-req-grid-5">
                <div><dt>Visa</dt><dd>F-1 student visa<span className="dpage-req-note">M-1 for vocational and technical study</span></dd></div>
                <div><dt>You need an I-20</dt><dd>From an SEVP-certified school<span className="dpage-req-note">Issued once you accept your place</span></dd></div>
                <div><dt>SEVIS fee</dt><dd>Paid before your interview<span className="dpage-req-note">Separate from the visa fee</span></dd></div>
                <div><dt>Application</dt><dd>DS-160, then an interview<span className="dpage-req-note">In person at an embassy or consulate</span></dd></div>
                <div><dt>Health insurance</dt><dd>Required by most institutions<span className="dpage-req-note">Often a condition of enrolment</span></dd></div>
              </dl>
              <p className="dpage-req-source">
                Fees, processing times and interview requirements change, and
                appointment waits vary considerably by post. Always confirm the
                current position with the{" "}
                <a href="https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html"
                  target="_blank" rel="noopener noreferrer">
                  U.S. Department of State
                </a>{" "}
                before you apply.
              </p>
            </div>
            <div className="usa-warn usa-warn-hard" data-reveal>
              <p className="usa-warn-tag">Important</p>
              <p>
                Admission to a university and approval for a U.S. visa are
                <strong> separate decisions</strong>. Do not treat one as a
                guarantee of the other.
              </p>
            </div>
          </section>

          {/* 14 */}
          <section id="work" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Can I <span className="h-accent">work</span> while studying?
            </h2>
            <p data-reveal>
              Yes — F-1 students can have certain opportunities to work and gain
              practical experience. But there are rules.
            </p>
            <p data-reveal>
              There are four routes worth understanding, and all of them are
              governed by rules that change. Eligible F-1 students can
              generally work on campus up to twenty hours a week while classes
              are in session, and sometimes more during official breaks —
              the library, dining hall, a campus office. CPT, Curricular
              Practical Training, allows practical experience related to your
              course through qualifying internships or cooperative education
              while you study; a computer science student might use it for an
              eligible internship in their field. OPT, Optional Practical
              Training, allows work experience related to your field of study,
              generally up to twelve months per qualifying education level.
              And graduates with eligible STEM degrees may qualify for a
              further twenty-four months on top, potentially thirty-six months
              of post-completion OPT in total.
            </p>
            <div className="usa-warn usa-warn-hard" data-reveal>
              <p className="usa-warn-tag">Important</p>
              <p>
                CPT and OPT require eligibility and proper authorisation. You
                cannot simply start working because you found an internship.
              </p>
              <p className="usa-warn-more">
                Think of it this way: opportunities exist — but the paperwork
                likes to be involved.
              </p>
            </div>
          </section>

          <Band src="/usa/student-life.jpg" caption="Much more than lectures and exams." />

          {/* 15 */}
          <section id="life" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Student life: <span className="h-accent">beyond the classroom</span>
            </h2>
            <ul className="usa-chips" data-reveal>
              {LIFE.map((l) => <li key={l}>{l}</li>)}
            </ul>
            <p data-reveal>
              You may also learn practical adult skills: budgeting for
              groceries, cooking, using public transport, communicating with
              professors, managing deadlines, dealing with winter, making
              friends from different cultures and asking for help when you need
              it.
            </p>
            <Quip>Yes, adulthood comes with assignments too.</Quip>
          </section>

          {/* 16 */}
          <section id="housing" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Accommodation &amp; <span className="h-accent">everyday life</span>
            </h2>
            <p data-reveal>
              Students may live in university residence halls, apartments,
              shared housing or other arrangements depending on the university
              and local market. Before choosing, compare distance to campus,
              rent, utilities, food, transportation, lease terms, safety,
              furniture, internet and whether you will have roommates.
            </p>
            <p data-reveal>
              Do not assume the cheapest rent is the cheapest overall option. A
              low-rent apartment far from campus can become expensive once
              transportation and time are added.
            </p>
            <Quip>
              A cheap room can become an expensive commute. Your rent and your
              bus pass are on the same team, whether you like it or not.
            </Quip>
            <Quip>
              And yes — &ldquo;five-minute walk to campus&rdquo; is a very
              different sentence from &ldquo;five-minute drive to campus&rdquo;
              when you do not own a car.
            </Quip>
            <p data-reveal>
              Ask the university what housing support is available to
              international students, especially for your first arrival.
            </p>
          </section>

          {/* 17 */}
          <section id="safety" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Safety, health &amp; <span className="h-accent">insurance</span>
            </h2>
            <p data-reveal>
              Understand your university&rsquo;s campus-safety resources,
              emergency procedures and health services before arrival.
            </p>
            <p data-reveal>
              Health insurance is another major part of the budget. Universities
              may require students to enrol in a specific plan or meet defined
              coverage standards. Requirements vary, so check your
              institution&rsquo;s current policy.
            </p>
            <p data-reveal>
              Keep important documents secure, know who to contact in an
              emergency, and save your university&rsquo;s international student
              office and campus safety contacts in your phone.
            </p>
          </section>

          {/* 18 */}
          <section id="career" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Career <span className="h-accent">opportunities</span>
            </h2>
            <p data-reveal>
              One of the biggest advantages of studying in the U.S. can be the
              opportunity to build professional experience alongside your
              education. Depending on the university and program, students may
              find internships, research opportunities, career fairs, alumni
              networks, projects with employers and other forms of professional
              development.
            </p>
            <p data-reveal>
              But don&rsquo;t wait until graduation. Start using career services
              early — build a résumé, practise interviews, meet professors,
              attend career events, explore internships and learn what employers
              in your field actually look for.
            </p>
            <Quip>
              Meeting the career office during your final week is better than
              never meeting them — but only just. Start early.
            </Quip>
            <p className="usa-pull" data-reveal>
              Your degree is important. Your experience, skills, network and
              ability to communicate those skills matter too.
            </p>
            <p className="usa-pull" data-reveal>
              Ask yourself once a semester: &ldquo;What did I add to my CV this
              term besides another semester?&rdquo; A project, a club role, a
              research task, volunteering, an internship, a competition or a
              new skill all count.
            </p>
          </section>

          {/* 19 */}
          <section id="myths" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              USA myths we hear <span className="h-accent">all the time</span>
            </h2>
            <div className="usa-myths" data-reveal>
              {MYTHS.map((m) => (
                <div className="usa-myth" key={m.myth}>
                  <p className="usa-myth-claim">&ldquo;{m.myth}&rdquo;</p>
                  <p className="usa-myth-truth">{m.truth}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 20 */}
          <section id="faq" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Questions Nepali students{" "}
              <span className="h-accent">often ask us</span>
            </h2>
            <div className="ck" data-reveal>
              {FAQ.map((f) => (
                <details className="ck-item" key={f.q}>
                  <summary>
                    <span className="ck-head">
                      <strong>{f.q}</strong>
                    </span>
                    <span className="ck-chevron" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 21 */}
          <section id="roadmap" className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Your USA application <span className="h-outline">roadmap</span>
            </h2>
            <ol className="usa-roadmap" data-reveal>
              {ROADMAP.map((r, i) => (
                <li key={r}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <p>{r}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Where we come in */}
          <section className="usa-sec">
            <h2 className="usa-h2" data-reveal>
              Where <span className="h-accent">Lakehead</span> comes in
            </h2>
            <p data-reveal>
              You can research all of this yourself — and we actually want you
              to understand your own decisions. Our job is not to choose your
              future for you. Our job is to help you ask better questions,
              understand your options and move through the process with a
              clearer plan.
            </p>
            <p data-reveal>
              A Lakehead counsellor helps you look beyond a university name and
              think about subject fit, affordability, location, admission
              requirements, scholarships, application preparation, visa
              documentation and pre-departure planning.
            </p>
            <p className="usa-pull" data-reveal>
              Not sure where to start? Sit down with us and let&rsquo;s build
              your USA study plan together.
            </p>
          </section>
        </div>
      </div>

      <CallbackStrip service="study-abroad" />

      <section className="dpage-cta">
        <div className="container dpage-cta-inner">
          <div>
            <h2>Let&rsquo;s build your USA plan</h2>
            <p>Bring your questions — especially the ones you think are too basic.</p>
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
