import type { Guide } from "./types";

/**
 * Study in South Korea. Same voice as the other guides — see types.ts.
 *
 * Korea's figures move more than most: the D-2 category, TOPIK thresholds
 * and the GKS schedule are all revised, and GKS changes its participating
 * universities every cycle. The published tuition and living averages come
 * from Korean government sources and are stamped as such.
 */
export const SOUTH_KOREA_GUIDE: Guide = {
  name: "Study in South Korea",
  hero: "/southkorea.jpg",
  head: ["Smaller than Nepal. ", { text: "Considerably busier.", as: "accent" }],
  lead:
    "South Korea is one of the few study destinations that is physically smaller than the country you are leaving — and it packs a world-leading research sector, some of the fastest internet on earth and roughly half its population into the top half of a peninsula.",
  jump: { to: "#universities", label: "The universities" },

  sections: [
    {
      id: "start",
      label: "Thinking about Korea?",
      head: ["So you’re thinking about ", { text: "Korea?", as: "accent" }],
      blocks: [
        { t: "p", text: "Korea has grown into a serious destination for international students in a remarkably short time: strong academic institutions, advanced research facilities, a growing number of programmes taught in English, and living costs that compare favourably with most Western options." },
        { t: "p", text: "And then there is everything outside the classroom — the energy of Seoul, the food, the traditions, K-pop and K-drama culture, and connections built in one of Asia's most dynamic countries. Students who go tend to come back changed by the pace of it." },
        { t: "pull", text: "It is one of the few places where “I want to study somewhere completely different” and “I want a world-class research environment” are the same answer." },
        {
          t: "dyk",
          text: [
            "Hangul, the Korean alphabet, was deliberately invented in the fifteenth century rather than evolving over time — commissioned specifically so ordinary people could become literate quickly.",
            "It worked. Most learners can read Korean script, if not understand it, within a few days. Very few writing systems can claim that.",
          ],
        },
        { t: "quip", text: "You will be able to read a menu before you can order from it. This is a strange and slightly frustrating stage that every student passes through in about week two." },
      ],
    },
    {
      id: "size",
      label: "The scale of it",
      head: ["Small country. ", { text: "Dense", as: "shout" }, " country."],
      blocks: [
        {
          t: "compare",
          a: { label: "Nepal", value: "147,516 km²" },
          x: "×0.7",
          b: { label: "South Korea", value: "~100,000 km²" },
          note: "South Korea is smaller than Nepal — and holds about 52 million people, roughly one and a half times Nepal's population. Around half of them live in the Seoul metropolitan area.",
        },
        { t: "p", text: "That density is why the transport works the way it does. Korea's rail and metro network is extensive, fast and genuinely cheap, which means a student in Daejeon can be in Seoul for the afternoon without it being an expedition. Distance is not the obstacle it is in Canada or Australia." },
        { t: "p", text: "Seoul or somewhere else is worth thinking about early, though the transport means the rest of the country is closer than you think whichever you choose. Seoul has the most universities, the most going on and the highest rents — half the country lives there for a reason, but budget accordingly. Busan is the coastal second city and a completely different feel: beaches, a slower pace, and considerably cheaper than the capital. Daejeon, Daegu and Pohang are research-heavy cities with strong technical institutions — quieter, cheaper, and often where the serious labs are. And if your instinct is to follow your programme wherever it is, the country is small enough that location is a lifestyle question rather than a logistical one." },
      ],
    },
    {
      id: "why",
      label: "Why Korea",
      head: ["Why students ", { text: "choose Korea", as: "accent" }],
      blocks: [
        { t: "p", text: "The academic case is strong across engineering, technology, business, science, medicine and the humanities, at respected universities and specialised institutions alike. Korea is recognised globally for research and innovation in particular, so if IT, artificial intelligence, electronics, robotics or the sciences interest you, there is real depth here. Korean universities take students from around the world, so you study alongside a wide mix rather than in a bubble; costs compare well with many Western destinations, with national and public institutions generally cheaper than private ones; and both government and university funding is open to international students, the Global Korea Scholarship among the more generous programmes in Asia. Beyond any of that, it is a genuinely different culture — traditional temples and historic neighbourhoods alongside some of the most modern cities anywhere, and that mix is a large part of why students choose it." },
      ],
    },
    {
      id: "universities",
      label: "The universities",
      head: ["The ", { text: "universities", as: "accent" }],
      blocks: [
        { t: "p", text: "Korea has institutions suited to a wide range of academic interests and career goals. These are the names that come up most often with international students." },
        {
          t: "table",
          title: "Universities and what they are known for",
          stamp: "Reviewed August 2026",
          head: ["University", "Known for"],
          rows: [
            { k: "Seoul National University", v: "Business, sciences, engineering, medicine, humanities" },
            { k: "Yonsei University", v: "Business, medicine, liberal arts, social sciences" },
            { k: "Korea University", v: "Business, law, engineering, social sciences" },
            { k: "KAIST", v: "Engineering, technology, computer science, research" },
            { k: "POSTECH", v: "Engineering, science, technology, research" },
            { k: "Sungkyunkwan University", v: "Business, engineering, sciences, humanities" },
            { k: "Hanyang University", v: "Engineering, business, technology, design" },
          ],
          note: "Rankings change from year to year, and current positions should always be checked against the latest university and QS data before you apply. Weigh course content, tuition, location, admission requirements, scholarships and your career goals — not rankings alone.",
        },
        { t: "p", text: "Programmes run across information technology and computer science, artificial intelligence and data science, engineering, business and management, accounting and finance, biotechnology and life sciences, medicine and health sciences, media and communication, design and creative arts, hospitality and tourism, social sciences and humanities." },
        { t: "band", src: "/southkorea/campus-band.jpg", caption: "Tradition and modern innovation, side by side." },
      ],
    },
    {
      id: "language",
      label: "Do I need Korean?",
      head: ["Do you need to ", { text: "speak Korean?", as: "accent" }],
      blocks: [
        { t: "p", text: "Not necessarily. It depends on the university, the degree and the programme. Korean-taught programmes may require a certain level of TOPIK proficiency, while a growing number of programmes are taught entirely in English." },
        { t: "p", text: "The Korean government notes that TOPIK requirements vary by university and programme, so confirm the exact requirement with your chosen institution rather than assuming from what a friend was told." },
        { t: "pull", text: "You can study entirely in English, so it is fair to ask why bother with Korean. Because your course is maybe thirty hours a week and your life is the other hundred and thirty. Basic Korean is the difference between visiting a country and living in one, and Hangul takes days rather than months." },
      ],
    },
    {
      id: "apply",
      label: "How to apply",
      head: ["How to ", { text: "apply", as: "accent" }],
      blocks: [
        { t: "p", text: "Requirements differ between universities and programmes, but the general process runs through these stages." },
        {
          t: "roadmap",
          items: [
            "Choose your course and university — matching your background, interests, budget and career plans.",
            "Check the entry requirements: qualifications, language, deadlines, supporting documents.",
            "Prepare your application: academic records, passport, recommendation letters, personal statement, language scores.",
            "Apply through the university's own application system or the relevant admission route.",
            "Explore scholarships — check whether you qualify for GKS or university-specific awards.",
            "Receive your admission, and review the documents carefully.",
            "Apply for your student visa with the documentation your route requires.",
            "Prepare for departure: accommodation, insurance, travel, finances.",
          ],
        },
        { t: "quip", text: "Korean universities generally apply directly rather than through a central system, which means every institution has its own portal, its own deadline and its own document list. Keep a spreadsheet. Genuinely." },
      ],
    },
    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships for ", { text: "international students", as: "accent" }],
      blocks: [
        { t: "p", text: "One of the real attractions of studying in Korea is the range of scholarships open to international students." },
        { t: "p", text: "The Global Korea Scholarship is a Korean government programme supporting international students. Depending on the specific programme and level of study, it may provide tuition support, Korean language training, airfare, study or academic allowances and other benefits." },
        {
          t: "warn",
          tag: "Changes every cycle",
          text: "The exact benefits, eligibility requirements, participating universities and application schedule vary by programme and by year. The Korean government publishes the current requirements through its official Study in Korea system.",
          more: "Do not plan around last year's GKS terms. Check the current cycle before you build a budget on it.",
        },
        { t: "p", text: "University awards are worth as much attention as the government ones. Many Korean universities run their own scholarships for international students, based on academic performance, admission results, language proficiency or criteria of their own, and some offer substantial reductions in tuition. Which of them you are actually eligible for depends on your profile, and working that out is a large part of what we do." },
      ],
    },
    {
      id: "money",
      label: "Money",
      head: ["What does it ", { text: "cost?", as: "accent" }],
      blocks: [
        { t: "p", text: "Your total budget depends on your university, course, city, accommodation and lifestyle. These are the government-published averages to start from — and averages are all they are." },
        {
          t: "table",
          title: "Published averages",
          stamp: "Indicative · reviewed August 2026",
          head: ["Item", "Average"],
          rows: [
            { k: "Average undergraduate tuition", v: "KRW 6.82 million / year" },
            { k: "Average living expenses", v: "KRW 750,000 – 1,000,000 / month" },
          ],
          note: "Government-published averages. Actual costs depend heavily on the institution, the discipline and the city — Seoul generally requires a larger budget than elsewhere, and engineering, medicine and the arts often sit above the average.",
        },
        { t: "p", text: "Before you apply, build a realistic budget covering tuition, accommodation, food, transport, health insurance, visa-related expenses, study materials, personal expenses and travel." },
        { t: "quip", text: "One genuine saving: Korean public transport is fast, extensive and remarkably cheap. Students who budget Western transport costs consistently over-estimate this line by a wide margin." },
      ],
    },
    {
      id: "visa",
      label: "Student visa",
      head: ["Your ", { text: "student visa", as: "outline" }],
      blocks: [
        { t: "p", text: "International students generally need the Korean visa matching the type and level of study they intend to undertake. For degree-level academic programmes the D-2 category is commonly used, while language-training programmes fall under different classifications." },
        {
          t: "req",
          lastReviewed: "August 2026",
          source: { label: "Study in Korea", href: "https://www.studyinkorea.go.kr/" },
          items: [
            { label: "Visa", value: "D-2 for degree study", note: "Language training falls under a different category" },
            { label: "Language", value: "TOPIK, or an English-taught route", note: "The threshold is set by each university" },
            { label: "Apply through", value: "The university's own system", note: "Routes differ by institution" },
            { label: "Scholarships", value: "GKS and university awards", note: "Schedules and benefits change each year" },
            { label: "Confirm with", value: "Korean immigration", note: "And the relevant diplomatic mission" },
          ],
        },
        {
          t: "checks",
          two: true,
          items: [
            "Document preparation guidance",
            "Application assistance",
            "Financial-document guidance",
            "Admission-document review",
            "Visa preparation",
            "Pre-departure counselling",
          ],
        },
        {
          t: "warn",
          tag: "Important",
          hard: true,
          text: "Visa decisions are made by the relevant Korean authorities. We help you understand the process and prepare your application carefully — not predict the outcome.",
        },
        { t: "band", src: "/southkorea/street-band.jpg", caption: "The energy of Seoul, and everywhere it connects to." },
      ],
    },
    {
      id: "life",
      label: "Life in Korea",
      head: ["Life as an ", { text: "international student", as: "accent" }],
      blocks: [
        { t: "p", text: "Studying in Korea gives you a country where traditional culture and modern innovation genuinely sit side by side." },
        { t: "p", text: "Seoul offers an energetic student lifestyle, while Busan, Daejeon, Daegu and Pohang each provide a different environment and their own opportunities. The public transport network is extensive and genuinely easy to use, which makes exploring the rest of the country straightforward and cheap. There is a great deal beyond university life — food and traditional markets through to K-pop, festivals, museums and historic sites — and studying alongside people from many countries builds friendships, cultural awareness and a network that outlasts the degree." },
        { t: "quip", text: "Two things every student mentions. The food is better and cheaper than you expect. And the country genuinely does not sleep — which is wonderful in month one and something you learn to manage by month three." },
      ],
    },
    {
      id: "myths",
      label: "Myths",
      head: ["Korea myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            { myth: "I need fluent Korean to study there.", truth: "Not necessarily. A growing number of programmes are taught entirely in English. Korean-taught ones may require TOPIK, and the threshold is set by each university." },
            { myth: "Everything happens in Seoul.", truth: "About half the population is in the Seoul area, but KAIST is in Daejeon and POSTECH is in Pohang. Some of the strongest technical research is outside the capital." },
            { myth: "It is as expensive as Japan or Singapore.", truth: "Generally not. Tuition and living costs compare favourably with most Western destinations, and public institutions cost less than private ones." },
            { myth: "GKS terms are the same every year.", truth: "They are not. Benefits, eligibility and participating universities change each cycle. Check the current one." },
            { myth: "Korean degrees are not recognised internationally.", truth: "Korean universities are well regarded, particularly in engineering, technology and the sciences. Several are consistently ranked among the world's best." },
            { myth: "If I get admission, my visa is guaranteed.", truth: "No. Admission and visa decisions are made by different bodies on different criteria." },
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
            { q: "Can I study entirely in English?", a: "At a growing number of universities and programmes, yes. Confirm with the specific institution — it varies by department as well as by university." },
            { q: "What is TOPIK, and do I need it?", a: "The Test of Proficiency in Korean. Korean-taught programmes usually require a level of it; English-taught ones usually do not. The threshold is set by each university." },
            { q: "Is GKS realistic for a Nepali student?", a: "It is competitive but genuinely open to students from Nepal. Start early — the application cycle is long and the document requirements are substantial." },
            { q: "How hard is it to find part-time work?", a: "Work is subject to your visa conditions and generally requires permission. Korean-language ability makes a substantial difference to what is available." },
            { q: "Public or private university?", a: "National and public institutions generally cost less. Private universities are not automatically better or worse — compare the specific programme rather than the category." },
            { q: "How different is the culture, really?", a: "Genuinely different, and that is most of the appeal. Academic hierarchy, social norms and pace all take adjusting to. Most students describe the first two months as steep and the rest as the best part." },
            { q: "When does the academic year start?", a: "Korean universities generally run a spring semester starting in March and a fall semester starting in September, so plan your application backwards from whichever you are targeting." },
          ],
        },
      ],
    },
    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your Korea application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Decide your subject and level, and whether you want an English-taught or Korean-taught programme.",
            "Target a semester — March or September — and work backwards from it.",
            "Shortlist universities on programme, cost, city and language of instruction.",
            "Check each institution's own entry requirements and deadlines. They differ.",
            "Sit TOPIK or your English test, depending on the route.",
            "Prepare academic records, passport, recommendations and personal statement.",
            "Apply through each university's own system — keep track of the deadlines.",
            "Apply for GKS and university scholarships in parallel, not afterwards.",
            "Receive and review your admission documents.",
            "Prepare and submit the D-2 application with the required documentation.",
            "Arrange accommodation and insurance.",
            "Learn Hangul before you fly. It takes days and changes your first week.",
            "Arrive, register, and use the international student office immediately.",
          ],
        },
      ],
    },
  ],
  cta: {
    head: "Ready to explore South Korea?",
    text: "Start with a conversation — we will help you compare universities and plan your next steps.",
  },
};
