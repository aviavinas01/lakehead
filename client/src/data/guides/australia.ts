import type { Guide } from "./types";

/**
 * Study in Australia. Same voice as the other guides — see types.ts.
 *
 * The southern-hemisphere calendar is the thing most Nepali students get
 * wrong about Australia, so it leads. The visa charge in the `req` block was
 * supplied by Lakehead and should be re-verified against Home Affairs before
 * launch; it is the one figure on this page with a shelf life.
 */
export const AUSTRALIA_GUIDE: Guide = {
  name: "Study in Australia",
  hero: "/australia.jpg",
  head: ["The academic year starts in ", { text: "February", as: "accent" }],
  lead:
    "That one sentence catches out more students than anything else about Australia. It is in the southern hemisphere, so the seasons are upside down, the school year runs February to November, and the main intake is at the start of the calendar year rather than the end.",
  jump: { to: "#intakes", label: "Intakes and timing" },

  sections: [
    {
      id: "start",
      label: "Thinking about Australia?",
      head: ["So you’re thinking about ", { text: "Australia?", as: "accent" }],
      blocks: [
        { t: "p", text: "Australia has become one of the most popular destinations for students from Nepal, and the reasons people give are consistent: qualifications that travel, strong post-study work rights in every state, and cities that are genuinely pleasant to live in rather than merely functional." },
        { t: "p", text: "It also has a system that is easier to understand than most. One national qualifications framework covers everything from a certificate to a doctorate, which means you can see exactly how one qualification connects to the next." },
        { t: "pull", text: "Whether you study business, IT, engineering, healthcare, hospitality or science, there is a pathway built for your academic background — not just for the students who already have perfect grades." },
        {
          t: "dyk",
          text: [
            "Australia is roughly the same size as the continental United States, but has about one-eighth of the population — and the vast majority of Australians live within fifty kilometres of the coast.",
            "So while the map looks enormous and empty, student life happens in a handful of coastal cities that are, by international standards, very liveable.",
          ],
        },
        { t: "quip", text: "A note on the wildlife jokes you have definitely seen online. Yes, the animals are unusual. No, you will not encounter most of them in Melbourne. The most dangerous thing on campus is the coffee snobbery." },
      ],
    },
    {
      id: "intakes",
      label: "Intakes & timing",
      head: ["The year runs ", { text: "upside down", as: "shout" }],
      blocks: [
        { t: "p", text: "This is the single most useful thing to understand about applying to Australia from Nepal, so it gets its own section." },
        {
          t: "cards",
          items: [
            { title: "February — the main intake", text: "The big one. Most programmes, most scholarships, most places. If you can make this work, make it work." },
            { title: "July — the second intake", text: "Widely available and completely legitimate. Fewer programmes offer it, but it is a real option if February is too soon." },
            { title: "Some September and November starts", text: "Available at certain institutions for certain programmes. Worth asking about if neither main intake suits you." },
            { title: "Vocational courses", text: "Often run rolling or multiple intakes across the year rather than following the university calendar." },
          ],
        },
        { t: "pull", text: "Work backwards from your intake, not forwards from today. A February start means your visa application should be well underway by the previous October." },
        {
          t: "choice",
          tag: "Quick choice",
          question: "When are you realistically ready?",
          resting: "There is no wrong answer here. There is only an answer that has been thought about and one that has not.",
          options: [
            { key: "A", label: "Next February — I want to move", reply: "Then everything needs to be moving now: English test, documents, applications, then the visa. Tight but very doable if you start this month." },
            { key: "B", label: "July gives me more room", reply: "Sensible. It buys you a proper run at your English score and lets you apply without rushing the parts that matter." },
            { key: "C", label: "A year out — I want to do this properly", reply: "The best position to be in. You can sit the test twice if needed, apply for competitive scholarships, and choose rather than settle." },
            { key: "D", label: "I genuinely do not know yet", reply: "Fine. Start with the course and the budget; the intake will pick itself once you know what you are applying for." },
          ],
        },
      ],
    },
    {
      id: "system",
      label: "Study pathways",
      head: ["Study options and ", { text: "pathways", as: "accent" }],
      blocks: [
        { t: "p", text: "Australia's system gives you several ways to reach the same qualification, and the alternatives are worth knowing — particularly if your current grades are not where you want them." },
        {
          t: "types",
          items: [
            {
              name: "Universities & higher education",
              lead: "Undergraduate through to doctoral study.",
              text: "Bachelor's degrees, graduate certificates, graduate diplomas, master's programmes and doctoral study across a wide range of disciplines. Most international students end up here, whether directly or through a pathway.",
              best: "Students whose academic record already meets direct entry requirements.",
              image: "/australia/university.jpg",
            },
            {
              name: "Vocational education & training",
              lead: "VET and TAFE — practical, industry-facing, respected.",
              text: "Focused on skills employers are actually asking for, and often shorter and cheaper than a degree. Many VET qualifications also provide credit toward a bachelor's degree, so this is a route rather than a dead end.",
              best: "Students who want to be employable quickly, or who need a step toward university.",
              image: "/australia/vet.jpg",
            },
            {
              name: "English language programmes",
              lead: "For building the language before the degree.",
              text: "ELICOS courses strengthen your English or prepare you for study in an English-speaking academic environment. Frequently packaged with a conditional offer from a university.",
              best: "Students whose English score is close but not quite there.",
              image: "/australia/english.jpg",
            },
            {
              name: "Foundation & pathway programmes",
              lead: "If you do not meet direct entry, yet.",
              text: "A structured route into a degree for students whose qualifications do not map directly onto Australian entry requirements. Usually one year, usually with guaranteed progression if you pass.",
              best: "Students with a good record that does not translate cleanly.",
              image: "/australia/pathway.jpg",
            },
          ],
        },
        {
          t: "dyk",
          text: [
            "The Australian Qualifications Framework covers every qualification in the country on a single ten-level scale — from a Certificate I right up to a doctoral degree.",
            "That means you can see exactly how a VET qualification connects to a diploma, and a diploma to a degree. Very few countries make the ladder this legible.",
          ],
        },
        { t: "band", src: "/australia/campus-band.jpg", caption: "One framework, ten levels, and a clear route between them." },
      ],
    },
    {
      id: "where",
      label: "Where to study",
      head: ["Where you study ", { text: "changes everything", as: "accent" }],
      blocks: [
        { t: "p", text: "The cities are genuinely different from one another, and the differences matter more than the map suggests." },
        {
          t: "cards",
          items: [
            { title: "Sydney", text: "The biggest, the busiest and the most expensive. A wide range of providers and the deepest job market in the country." },
            { title: "Melbourne", text: "Culturally dense, student-heavy, and the city most students describe as the easiest to feel at home in. Four seasons in an afternoon." },
            { title: "Brisbane", text: "Warmer, more relaxed, and growing fast as a student destination. Noticeably cheaper than Sydney." },
            { title: "Adelaide", text: "A student-friendly city with a strong education sector and a very different pace from the eastern capitals." },
            { title: "Perth", text: "Beaches, an outdoor life, and a genuinely isolated position — which some students love and others find hard." },
            { title: "Canberra & Hobart", text: "The capital, home to major institutions and government; and a smaller island city with access to Tasmania's landscape." },
          ],
        },
        { t: "quip", text: "One thing nobody mentions: some states offer additional post-study work time for graduates of regional institutions. If your plan extends past graduation, that is worth more than a slightly shinier city." },
      ],
    },
    {
      id: "choose",
      label: "How to choose",
      head: ["How to actually ", { text: "choose", as: "accent" }],
      blocks: [
        {
          t: "questions",
          items: [
            "What exactly am I studying, and at what AQF level?",
            "Do I meet direct entry, or do I need a pathway?",
            "February or July — and can I realistically be ready?",
            "Which city, and what does rent cost there?",
            "Does this institution offer the course in the state I want to be in?",
            "What are the post-study work rights for this qualification and location?",
            "Is my provider registered to teach international students?",
            "What is the total cost — tuition, rent, OSHC, travel?",
            "What scholarships is this institution actually offering?",
            "What does the graduate outcome data say for this programme?",
          ],
        },
        {
          t: "priorities",
          tag: "60-second shortlist check",
          question: "What actually matters to you?",
          items: ["Course strength", "Total cost", "City", "Post-study work rights", "Scholarship", "Pathway available", "Climate", "Nepali community"],
        },
      ],
    },
    {
      id: "money",
      label: "Money",
      head: ["Let’s talk about ", { text: "money", as: "accent" }],
      blocks: [
        { t: "p", text: "Planning your finances before you apply is a real part of the process, not an afterthought. Your total cost depends on the course, the institution, the level, the city, your accommodation and how you live." },
        {
          t: "checks",
          two: true,
          items: [
            "Your chosen course and institution",
            "Level of study",
            "Location — the city changes this more than anything",
            "Accommodation",
            "Transport",
            "Daily living",
            "Course-related expenses",
            "Overseas Student Health Cover",
          ],
        },
        { t: "p", text: "International tuition varies considerably between institutions, courses and locations, so check the current fees published for your specific programme rather than relying on an average figure. Study Australia also publishes a cost-of-living calculator worth running before you commit." },
        { t: "callout", title: "Plan your budget before you apply", text: "We will help you build a realistic study budget covering tuition, living costs, insurance and the visa charge before you make a decision you cannot easily reverse.", cta: "Build my budget" },
      ],
    },
    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships and ", { text: "financial support", as: "accent" }],
      blocks: [
        { t: "p", text: "Studying overseas is a significant investment, and scholarships may be available depending on your academic profile, chosen institution and course. Eligibility and benefits vary sharply, so the useful question is not which exist but which you could actually win." },
        {
          t: "checks",
          items: [
            "Identify scholarships that suit your profile rather than every one you can find",
            "Understand the eligibility requirements before you spend time on an application",
            "Prepare the supporting documents properly",
            "Have someone review the application before you submit it",
            "Look at universities that fit your budget in the first place",
          ],
        },
        { t: "quip", text: "Students routinely apply for the three famous scholarships and none of the twelve institution-specific ones they would actually have a chance at. Start with your shortlist's own pages." },
      ],
    },
    {
      id: "visa",
      label: "Student visa",
      head: ["Your ", { text: "student visa", as: "outline" }],
      blocks: [
        { t: "p", text: "Once you have chosen your course and received your enrolment documentation, the next step is the visa. The Student visa allows eligible international students to study in Australia and, subject to visa conditions, work while the course is in session. You will need to meet enrolment and health-insurance obligations." },
        {
          t: "req",
          lastReviewed: "August 2026",
          source: { label: "the Department of Home Affairs", href: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" },
          items: [
            { label: "Visa", value: "Student visa (subclass 500)" },
            { label: "Application charge", value: "AUD 2,500", note: "From 1 July 2026 — re-verify before relying on it" },
            { label: "Health cover", value: "OSHC for your full stay", note: "Unless an exemption applies" },
            { label: "Work rights", value: "While your course is in session", note: "Subject to your visa conditions" },
          ],
        },
        {
          t: "cards",
          items: [
            { title: "01 — Document preparation", text: "Understand exactly what your application needs, and get it into the right form the first time." },
            { title: "02 — Application guidance", text: "Support through the process itself, so nothing is submitted half-answered." },
            { title: "03 — Financial documentation", text: "Understanding the financial evidence relevant to your application, and how it must be presented." },
            { title: "04 — Interview preparation", text: "Preparing for the questions and requirements that may apply to your circumstances." },
            { title: "05 — Pre-departure guidance", text: "Getting ready for the move once your visa is approved." },
          ],
        },
        {
          t: "warn",
          tag: "Important",
          hard: true,
          text: "Visa decisions are made by the Australian Government. Our role is to help you understand the process and prepare your application accurately — not to predict the outcome.",
        },
      ],
    },
    {
      id: "health",
      label: "Health cover",
      head: ["Health cover is ", { text: "not optional", as: "accent" }],
      blocks: [
        { t: "p", text: "International students generally need Overseas Student Health Cover for the duration of their stay, unless an exemption applies. It is a condition of the visa rather than a nice-to-have, and it needs to be in place before you travel." },
        { t: "p", text: "We will take you through the requirements and what coverage you actually need, so it is budgeted for from the start rather than discovered at enrolment." },
        { t: "band", src: "/australia/life-band.jpg", caption: "Strong post-study work rights, in every state." },
      ],
    },
    {
      id: "life",
      label: "Life in Australia",
      head: ["Life in ", { text: "Australia", as: "accent" }],
      blocks: [
        { t: "p", text: "Studying in Australia is about more than attending classes. You get a genuinely multicultural society, people from every background in the same lecture theatre, and a lifestyle that manages to combine study, work and actually going outside." },
        {
          t: "chips",
          items: ["Modern, diverse cities", "Beaches and coastal towns", "Outdoor everything", "Multicultural communities", "Student clubs and societies", "Reliable public transport", "Cafés and a serious coffee culture", "Landscape unlike anywhere else"],
        },
        { t: "quip", text: "Australians will shorten any word that will hold still. Breakfast is brekkie, afternoon is arvo, and your name will be shortened within a week whether you like it or not." },
        { t: "p", text: "Your experience will depend enormously on the city and community you choose, which is exactly why picking the destination is a real part of the decision rather than a detail." },
      ],
    },
    {
      id: "myths",
      label: "Myths",
      head: ["Australia myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            { myth: "The academic year starts in September.", truth: "It does not. Australia is in the southern hemisphere — the main intake is February, with a second in July." },
            { myth: "A VET qualification is a lesser option.", truth: "No. VET is practical, respected by employers, and often carries credit toward a degree." },
            { myth: "Sydney is the only serious choice.", truth: "It is the most expensive one. Melbourne, Brisbane, Adelaide and Perth all have strong institutions and lower costs." },
            { myth: "OSHC is optional if I am healthy.", truth: "No. It is a visa condition, not a personal choice about risk." },
            { myth: "I can work unlimited hours.", truth: "Work rights are subject to your visa conditions and to whether your course is in session. Read your own grant notice." },
            { myth: "If I get an offer, my visa is guaranteed.", truth: "No. Admission and visa decisions are made by different bodies on different criteria." },
          ],
        },
      ],
    },
    {
      id: "faq",
      label: "Questions we get",
      head: ["Questions Nepali students ", { text: "often ask us", as: "accent" }],
      blocks: [
        {
          t: "faq",
          items: [
            { q: "February or July?", a: "February has more programmes, more scholarships and more places. July is a genuine alternative if you need the extra months to prepare properly — which is better than rushing February." },
            { q: "Is a pathway programme a bad sign?", a: "Not at all. Pathways exist because qualifications do not translate cleanly between countries. A year through a pathway into the right degree beats a direct entry into the wrong one." },
            { q: "How much can I work?", a: "There is an allowance while your course is in session and it is subject to your visa conditions. It changes, so check your own grant notice rather than a forum post." },
            { q: "What are post-study work rights actually worth?", a: "They vary by qualification level and, in some cases, by where you studied. Some regional institutions carry additional entitlement. Worth checking before you pick, not after." },
            { q: "Do I need IELTS?", a: "Usually you need evidence of English, and several tests are accepted. The score you need depends on the institution and the course level, so check both." },
            { q: "Is OSHC expensive?", a: "It is a real line in the budget and it runs for the length of your visa. Prices differ by provider, so compare rather than accepting the first policy offered." },
            { q: "What if my grades are borderline?", a: "Talk to us. Between VET, foundation programmes and English pathways, Australia has more routes in than almost anywhere else." },
          ],
        },
      ],
    },
    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your Australia application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Pick your intake — February or July — and work backwards from it.",
            "Decide your course and the AQF level you are aiming at.",
            "Check whether you meet direct entry, or need a pathway.",
            "Choose a city, and check what rent costs there.",
            "Sit your English test with enough time to retake it.",
            "Apply, and check that provider is registered for international students.",
            "Research scholarships at each institution on your shortlist.",
            "Compare offers on total cost, including OSHC and the visa charge.",
            "Accept your place and get your enrolment confirmation.",
            "Arrange OSHC before the visa application.",
            "Prepare and submit the subclass 500 application.",
            "Sort accommodation before you fly.",
            "Arrive, enrol, and use the international student office in week one.",
          ],
        },
      ],
    },
  ],
  cta: {
    head: "Ready to explore Australia?",
    text: "Tell us your intake and your subject. We will map the rest of it out.",
  },
};
