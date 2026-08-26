import type { Guide } from "./types";

/**
 * Study in Canada. Same voice as the other guides — see types.ts.
 *
 * The thing to keep an eye on here is that Canada's study permit settings
 * move more than almost anywhere else: intake caps, PGWP eligibility and
 * spousal work permits have all changed inside the last two years. Nothing
 * in the prose states a cap number or a policy date; the `req` block carries
 * the current position and gets re-checked.
 */
export const CANADA_GUIDE: Guide = {
  name: "Study in Canada",
  hero: "/canada.jpg",
  head: ["A very large country, ", { text: "and a very polite one", as: "accent" }],
  lead:
    "Canada is the second-largest country on earth and one of the emptiest. Ten provinces, three territories, two official languages, and a winter that people will warn you about for months before it arrives. They are not exaggerating.",
  jump: { to: "#system", label: "How the system works" },

  sections: [
    {
      id: "start",
      label: "Thinking about Canada?",
      head: ["So you’re thinking about ", { text: "Canada?", as: "accent" }],
      blocks: [
        { t: "p", text: "Students who go to Canada tend to say the same two things when they come back. The first is about the teaching: practical, applied, closer to the work you actually want to do than they expected. The second is about themselves — that they came back more capable, more independent, better at handling their own life." },
        { t: "p", text: "That second one is not a marketing line. Managing your own budget, your own time and your own laundry in a country where nobody knows you changes people." },
        { t: "pull", text: "Canada is not one decision. It is a province, a city, a climate and a study permit — and they are all connected." },
        {
          t: "dyk",
          text: [
            "Canada has the longest coastline of any country in the world — over 200,000 kilometres of it. That is more than the next several countries put together.",
            "Which is a fun fact until you realise what it means practically: “nearby” is a relative term. Two Canadian cities in the same province can be a full day’s drive apart.",
          ],
        },
        { t: "quip", text: "A genuine warning about winter. It is not that it gets cold; it is that it stays cold, for months. Every student who buys a proper coat in October is fine. Every student who decides to “see how bad it really is” buys one in December anyway, at a worse price." },
      ],
    },
    {
      id: "size",
      label: "The scale of it",
      head: ["Canada is ", { text: "enormous", as: "shout" }, ". And empty."],
      blocks: [
        {
          t: "compare",
          a: { label: "Nepal", value: "147,516 km²" },
          x: "×68",
          b: { label: "Canada", value: "~9.98 million km²" },
          note: "Canada is roughly 68 times the size of Nepal — with a population of about 40 million, against Nepal's 30 million. Most of those people live in a thin band near the southern border, which is why a country this size can feel surprisingly empty.",
        },
        { t: "p", text: "The practical consequence is that your province matters as much as your university. Tuition differs by province. Rent differs enormously. Post-graduation opportunities differ. And a city like Vancouver has a completely different climate from a city like Winnipeg — same country, entirely different winter." },
        {
          t: "choice",
          tag: "Quick choice",
          question: "What sort of Canada are you imagining?",
          resting: "None of these picks a university. All of them narrow the list by cost, weather and lifestyle — which is most of the decision.",
          options: [
            { key: "A", label: "Toronto or Vancouver — the big ones", reply: "Great cities, serious job markets, and the highest rents in the country by a distance. Budget for accommodation first and everything else second." },
            { key: "B", label: "A mid-sized city — Calgary, Ottawa, Halifax", reply: "Often the sweet spot. Real cities with real employers, and rent that leaves you money to live on." },
            { key: "C", label: "Somewhere I can actually afford", reply: "Look at Quebec, Saskatchewan, Manitoba and smaller Ontario cities. Your money goes considerably further, and the universities are not lesser for it." },
            { key: "D", label: "Wherever the right course is", reply: "The correct instinct. Find the programme first, then check what living there actually costs before you commit." },
          ],
        },
      ],
    },
    {
      id: "system",
      label: "The system",
      head: ["How Canadian education ", { text: "actually works", as: "accent" }],
      blocks: [
        { t: "p", text: "Education in Canada is run by the provinces, not the federal government. There is no single national system, and that is worth knowing before you start comparing." },
        {
          t: "cards",
          items: [
            { title: "Universities", text: "Degree-granting institutions offering bachelor’s, master’s and doctoral study. Research-heavy at the larger ones, and often with co-op programmes built into the degree." },
            { title: "Colleges & institutes", text: "Practical, career-focused, often two or three years. Frequently the better choice if you want to be employable quickly, and many have transfer agreements into degree programmes." },
            { title: "Co-op programmes", text: "Paid work terms alternating with study terms, built into the degree itself. Canada does this better than almost anywhere, and it is the single most useful thing on a graduate CV." },
            { title: "Quebec’s CEGEP", text: "Quebec runs a two-year pre-university stage between school and university. If you are looking at Quebec, this changes the shape of your whole application." },
          ],
        },
        { t: "pull", text: "If a programme offers a co-op option, take it seriously. Paid, credited, relevant work experience before you graduate is worth more than most people realise at eighteen." },
        { t: "band", src: "/canada/campus-band.jpg", caption: "Ten provinces, three territories, two official languages." },
      ],
    },
    {
      id: "choose",
      label: "How to choose",
      head: ["How to actually ", { text: "choose", as: "accent" }],
      blocks: [
        { t: "p", text: "Before you build a list, work through these. The province questions are the ones people skip and then regret." },
        {
          t: "questions",
          items: [
            "What exactly am I studying — and does this programme include a co-op?",
            "Which province, and what does tuition cost there for international students?",
            "What is rent actually like in that city, not that country?",
            "Can I handle that winter, honestly?",
            "Is the institution designated to host international students?",
            "How strong is this programme in my field, not the university overall?",
            "What are the graduate outcomes for this specific programme?",
            "What is my total budget across the whole course?",
            "What support exists for international students in my first month?",
            "What do I want to be doing the year after I graduate?",
          ],
        },
        {
          t: "priorities",
          tag: "60-second shortlist check",
          question: "What actually matters to you?",
          items: ["Programme strength", "Total cost", "Co-op option", "City", "Climate", "Scholarship", "Nepali community", "After-study options"],
        },
      ],
    },
    {
      id: "admissions",
      label: "Admissions",
      head: ["What Canadian universities ", { text: "look at", as: "accent" }],
      blocks: [
        { t: "p", text: "Requirements differ by institution, by province and by programme, so read the actual course page rather than a general guide — including this one." },
        {
          t: "checks",
          two: true,
          items: [
            "Academic transcripts and completed qualifications",
            "Evidence of English: IELTS, TOEFL, PTE or Duolingo, where accepted",
            "A statement of purpose, for many programmes",
            "Letters of recommendation, where the programme asks",
            "Résumé or portfolio for certain programmes",
            "Proof of funds — this one matters for the permit as well",
          ],
        },
        {
          t: "warn",
          tag: "Golden rule",
          text: "Check that your institution is designated to host international students before you pay anything. It is a short check and it is the foundation of your whole study permit application.",
          more: "If a page cannot tell you this clearly, that is information too.",
        },
      ],
    },
    {
      id: "money",
      label: "Money",
      head: ["Let’s talk about ", { text: "money", as: "accent" }],
      blocks: [
        { t: "p", text: "Studying and living in Canada generally costs less than the other big destinations, and the teaching you get for it holds up. What you will actually pay turns on the programme, the institution and — more than anything — the city." },
        { t: "p", text: "We have not printed tuition ranges. Fees vary enormously between provinces and programmes, they are revised annually, and a professional degree can cost several times what a taught programme does. Read the figure published for your specific programme." },
        {
          t: "table",
          title: "Monthly living costs by city",
          stamp: "Indicative · reviewed August 2026",
          head: ["City", "Approx. monthly (C$)"],
          rows: [
            { k: "Toronto", v: "2,300" }, { k: "Vancouver", v: "2,300" },
            { k: "Victoria", v: "2,100" }, { k: "Halifax", v: "2,000" },
            { k: "Ottawa", v: "2,000" }, { k: "Oshawa", v: "1,950" },
            { k: "Calgary", v: "1,900" }, { k: "Edmonton", v: "1,850" },
            { k: "Hamilton", v: "1,850" }, { k: "Montreal", v: "1,800" },
            { k: "London", v: "1,800" }, { k: "Kitchener", v: "1,800" },
            { k: "Winnipeg", v: "1,800" }, { k: "Windsor", v: "1,700" },
            { k: "Quebec City", v: "1,600" },
          ],
          note: "Indicative monthly living costs, excluding tuition. Treat them as a starting point for comparison between cities, not a budget.",
        },
        { t: "quip", text: "Look at that table again. The gap between Toronto and Quebec City is about C$700 a month — roughly C$8,400 a year. Over a four-year degree that is more than most scholarships are worth." },
        { t: "callout", title: "Get a real number before you commit", text: "We will help you build a budget against the actual fees for your programme, the city you are moving to, and the cover you are required to hold — not a national average.", cta: "Build my budget" },
      ],
    },
    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships and ", { text: "funding", as: "accent" }],
      blocks: [
        { t: "p", text: "Universities and federal programmes both offer scholarships to international students — Canada-ASEAN and Canada-CARICOM among them, alongside a great many institution-specific awards. Requirements and selection differ from one to the next, but most ask for some version of the same four documents." },
        {
          t: "cards",
          items: [
            { title: "Proof of identity", text: "A passport or national identity card, in date and with a usable photo." },
            { title: "Proof of enrolment", text: "The official confirmation from the institution where you hold a full-time place." },
            { title: "Letter of intent", text: "In English or French: the programme you have chosen, why Canada, why that institution, and how it fits the career you are working toward." },
            { title: "Letter of support", text: "From a professor, instructor or director on official letterhead, describing your work and what the scholarship would let you do." },
          ],
        },
        { t: "quip", text: "Most students look only at the big national scholarships and miss the departmental ones, which are smaller, far less competitive, and frequently unclaimed. Check the department page, not just the university’s scholarship portal." },
      ],
    },
    {
      id: "visa",
      label: "Study permit",
      head: ["Your ", { text: "study permit", as: "outline" }],
      blocks: [
        { t: "p", text: "To study here you need a Canadian study permit — a document issued by the Government of Canada — alongside the visa or travel authorisation issued with it. You will also need a provincial or territorial attestation letter from the province you plan to study in." },
        { t: "p", text: "Canada reforms its immigration system regularly, and study permit settings have all moved within the last two years. Anything we printed here about caps or post-graduation work rights would age badly, so the current position lives in one panel and gets re-checked." },
        {
          t: "req",
          lastReviewed: "August 2026",
          source: { label: "Immigration, Refugees and Citizenship Canada", href: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html" },
          items: [
            { label: "Permit", value: "Study permit", note: "Plus a visitor visa or eTA, issued with it" },
            { label: "Attestation", value: "PAL or TAL", note: "From your province or territory" },
            { label: "Intake caps", value: "Reviewed each year", note: "Confirm the current year's settings" },
            { label: "After study", value: "PGWP eligibility varies", note: "By course, level and institution" },
          ],
        },
        {
          t: "checks",
          two: true,
          items: [
            "Proof of acceptance from your institution",
            "Provincial or territorial attestation letter (PAL / TAL)",
            "Proof of identity",
            "Proof of financial support",
            "Letter of explanation — why Canada, and your responsibilities as a student",
            "Medical exam, where your course length or intended work calls for one",
            "Custodian declaration, for minors",
            "Proof of immigration status, depending on where you apply from",
          ],
        },
        {
          t: "warn",
          tag: "Important",
          hard: true,
          text: "Permit decisions are made by the Government of Canada. Our role is to help you understand what is being asked for and prepare your application accurately — not to predict the outcome.",
        },
      ],
    },
    {
      id: "work",
      label: "Working & after",
      head: ["Working, and ", { text: "what comes after", as: "accent" }],
      blocks: [
        { t: "p", text: "Study permits generally allow some work during study, and co-op programmes have their own work permit route. Both come with conditions written into your own permit, so read it rather than relying on what a friend was told last year." },
        { t: "p", text: "The Post-Graduation Work Permit is the reason many students choose Canada — but eligibility depends on your course, your level and your institution, and it has been tightened. Check whether your specific programme qualifies before you enrol, not after." },
        {
          t: "warn",
          tag: "Check before you enrol",
          text: "PGWP eligibility is decided by the programme you choose. A student who picks a course without checking can complete it and discover the work permit was never available to them.",
        },
        { t: "band", src: "/canada/life-band.jpg", caption: "Gorgeous landscapes, a varied climate, and a very low crime rate." },
      ],
    },
    {
      id: "life",
      label: "Life in Canada",
      head: ["Life in ", { text: "Canada", as: "accent" }],
      blocks: [
        { t: "p", text: "Canada is known for friendly people, dramatic landscapes and a climate that changes completely depending on where you land. It is consistently ranked among the most peaceful countries in the world, and the quality of life is something the country takes visible pride in." },
        {
          t: "chips",
          items: ["Skiing at Whistler", "Niagara Falls", "Banff National Park", "Prince Edward Island", "Festivals from every culture", "Camping and the outdoors", "Ice hockey, obviously", "Museums, theatres and art centres", "Actual four-season weather"],
        },
        { t: "quip", text: "The politeness is real, and it is contagious. Give it three months and you will be apologising to furniture." },
        { t: "p", text: "Classrooms are run to draw people out rather than talk at them, and students consistently say they could raise a complicated question without feeling awkward about it. Lectures are built around engaging with the material rather than transcribing it." },
      ],
    },
    {
      id: "myths",
      label: "Myths",
      head: ["Canada myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            { myth: "A study permit is basically permanent residency.", truth: "No. They are separate processes with separate criteria, and one does not automatically lead to the other." },
            { myth: "Colleges are a lesser option than universities.", truth: "Not at all. College programmes are practical and career-focused, and for many fields they get you employed faster." },
            { myth: "It is cold everywhere, all the time.", truth: "Vancouver's winter is mild and wet. Winnipeg's is not. Same country, entirely different coat." },
            { myth: "Toronto is the only place worth studying.", truth: "It is also the most expensive. Excellent institutions exist in every province, at a fraction of the rent." },
            { myth: "I can work unlimited hours on a study permit.", truth: "No. Work conditions are written into your permit and they change. Read yours." },
            { myth: "If I get admission, my permit is guaranteed.", truth: "No. Admission and permit decisions are made by different bodies on different criteria." },
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
            { q: "College or university?", a: "It depends what you want afterwards. University suits research, professional registration and academic careers. College is practical, shorter and often gets you into work sooner. Neither is the lesser choice." },
            { q: "Is a co-op programme worth the extra time?", a: "Almost always. Paid, credited work experience in your field before graduation is the single most useful thing you can put on a Canadian CV." },
            { q: "How much money do I need to show?", a: "It depends on your province, your course length and your circumstances. The figure is set federally and is revised, so confirm the current one with IRCC rather than an older blog." },
            { q: "Do I need French for Quebec?", a: "For most English-taught programmes, no. For daily life in Montreal or Quebec City it helps enormously, and for some provincial pathways afterwards it matters a great deal." },
            { q: "Can my spouse work?", a: "Spousal work permit eligibility has been narrowed and now depends on your level of study. Check the current rules before making family plans around it." },
            { q: "Which province is cheapest?", a: "Quebec, Manitoba and Saskatchewan generally come out lower on both tuition and rent. Look at the living cost table above — the spread between cities is wider than most students expect." },
            { q: "What if my grades are borderline?", a: "Talk to us. Pathway and foundation options exist, and a well-chosen college programme with a transfer agreement is often a better route than a rejected university application." },
          ],
        },
      ],
    },
    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your Canada application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Decide your subject, level and intake, and set an honest budget.",
            "Choose a province — tuition, rent and after-study options all follow from it.",
            "Check the institution is designated to host international students.",
            "Check whether the programme qualifies for a post-graduation work permit.",
            "Sit your English test early enough to retake it if needed.",
            "Prepare transcripts, statement of purpose and recommendations.",
            "Apply, and research scholarships at the same time — not afterwards.",
            "Compare offers on total cost including rent, not headline tuition.",
            "Accept, pay the deposit, and request your attestation letter.",
            "Prepare and submit the study permit application with proof of funds.",
            "Arrange accommodation before you fly.",
            "Buy a proper winter coat. This is not a joke.",
            "Arrive, register, and use the international student office in week one.",
          ],
        },
      ],
    },
  ],
  cta: {
    head: "Ready to look at Canada properly?",
    text: "Tell us your subject and your budget, and we will start with the province.",
  },
};
