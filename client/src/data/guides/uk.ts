import type { Guide } from "./types";

/**
 * Study in the UK. Same voice as the USA guide: informal, honest, and
 * carrying no figure that dates. See types.ts for the editorial rules.
 *
 * Two things to preserve if you edit this. "Tier 4" is dead terminology —
 * the UK replaced it with the Student route in 2020, and a lot of competitor
 * pages still say it. And the four nations genuinely have different systems;
 * flattening them into "the UK" is the single most common mistake made about
 * British higher education.
 */
export const UK_GUIDE: Guide = {
  name: "Study in the UK",
  hero: "/uk.jpg",
  head: ["Four nations. ", { text: "One small country.", as: "accent" }],
  lead:
    "You can drive from one end of England to the other in a day, and still find four education systems, five accents you have never heard, and a university older than most countries. The UK is small. It is not simple.",
  jump: { to: "#system", label: "How the system works" },

  sections: [
    {
      id: "start",
      label: "Thinking about the UK?",
      head: ["So you’re thinking about ", { text: "Britain?", as: "accent" }],
      blocks: [
        { t: "p", text: "Most students arrive with a picture in their head — red buses, grey skies, someone being extremely polite in a queue. Some of that is true. What tends to surprise people is how much the country changes in a two-hour train ride, and how different one university can be from another an hour down the road." },
        { t: "p", text: "The thing worth understanding first: the UK is four nations — England, Scotland, Wales and Northern Ireland — and they do not run the same education system. A Scottish undergraduate degree usually takes four years. An English one usually takes three. Nobody tells you this in the brochure." },
        { t: "pull", text: "The question is not “Which UK university?” It is “Which UK university, in which nation, for which length of degree?”" },
        {
          t: "dyk",
          text: [
            "Oxford has been teaching students since roughly 1096. That makes it older than the country it sits in — the United Kingdom as a political entity dates from 1707.",
            "So when someone says British universities have “centuries of tradition,” they are being modest. Some of them predate the union, the empire and the English language as you would recognise it.",
          ],
        },
        { t: "quip", text: "A warning from experience: you will open one university website, then a course page, then a fees page, then a city guide, and forty minutes later you will be reading about the weather in Aberdeen. This is normal. A shortlist is the cure." },
      ],
    },
    {
      id: "size",
      label: "It is small",
      head: ["The UK is ", { text: "small", as: "shout" }, ". Genuinely."],
      blocks: [
        { t: "p", text: "Coming from Nepal, this is the easy part to picture — because the scale is similar." },
        {
          t: "compare",
          a: { label: "Nepal", value: "147,516 km²" },
          x: "×1.7",
          b: { label: "United Kingdom", value: "~244,000 km²" },
          note: "The UK is only about one and a half times the size of Nepal. London to Edinburgh is roughly four and a half hours by train. That changes what “far from home” means: you can be studying in Wales and see friends in Manchester on a Saturday.",
        },
        { t: "p", text: "Small also means expensive in the places everyone wants to be. London is a different financial proposition from almost anywhere else in the country, and the maintenance funds you must show for your visa reflect that. Plenty of excellent universities sit in cities where your money goes considerably further." },
        {
          t: "choice",
          tag: "Quick choice",
          question: "Where do you actually want to be?",
          resting: "This does not pick a university for you. It narrows the list by cost and lifestyle, which is most of the work.",
          options: [
            { key: "A", label: "London — I want to be in the middle of it", reply: "Then budget honestly and early. London costs more on rent, transport and everything else, and the visa maintenance figure is higher for it. Worth it for some students; a real strain for others." },
            { key: "B", label: "A big city, but not London", reply: "Manchester, Glasgow, Birmingham, Leeds, Bristol. Serious universities, serious nightlife, and rent that does not eat your entire budget." },
            { key: "C", label: "A proper university town", reply: "Places where the university is the town. Cheaper, closer-knit, and you will know your lecturers. Quieter, which is either the appeal or the problem." },
            { key: "D", label: "No idea, I just want a good course", reply: "Honestly the right answer. Start with the course, then look at where it happens to be — you can filter for city afterwards." },
          ],
        },
      ],
    },
    { id: "system", label: "The four systems", head: ["Four nations, ", { text: "four systems", as: "accent" }],
      blocks: [
        { t: "p", text: "This catches people out more than anything else, so it is worth a minute." },
        {
          t: "cards",
          items: [
            { title: "England, Wales & Northern Ireland", text: "Undergraduate degrees usually take three years. You specialise from day one — you apply to study History, and you study History, not History plus three other subjects." },
            { title: "Scotland", text: "Undergraduate degrees usually take four years, and the first year is often broader before you narrow down. Useful if you are not completely certain of your subject." },
            { title: "Master’s degrees", text: "Typically one year taught, across the whole UK. This is one of the biggest draws: a full postgraduate qualification in twelve months rather than two years." },
            { title: "Doctoral study", text: "Usually three to four years, and generally more focused on your own research from the start than the taught-then-research model used elsewhere." },
          ],
        },
        { t: "pull", text: "That one-year master’s is the reason a lot of students choose Britain. One year of tuition and one year of living costs instead of two is a serious difference." },
        { t: "quip", text: "It also means the year moves fast. Students who arrive in September and “settle in for a bit” find themselves writing a dissertation proposal before they have found a favourite café." },
      ],
    },
    {
      id: "types",
      label: "Types of university",
      head: ["Types of UK university — ", { text: "which suits you?", as: "accent" }],
      blocks: [
        { t: "p", text: "The UK does not have one kind of university any more than the US does. The categories below are informal, but they describe real differences in how a place feels." },
        {
          t: "types",
          items: [
            {
              name: "Ancient & research-intensive",
              lead: "Centuries-old, research-heavy, globally known.",
              text: "Big research funding, extensive libraries, and reputations that travel. They are selective, and the workload assumes you are self-directed. If you want to be around people doing research at the edge of a field, this is where it happens.",
              best: "Students with strong records who want a research-led environment.",
              examples: ["University of Oxford", "University of Cambridge", "Imperial College London", "University of Edinburgh", "University of Manchester", "University of Bristol", "University of Glasgow", "King’s College London"],
              image: "/uk/ancient.jpg",
            },
            {
              name: "City universities",
              lead: "Large, modern, and woven into the city around them.",
              text: "Often strong on employability, industry links and professional courses. Campuses tend to be spread through the city rather than walled off from it, which suits students who want a life beyond the university.",
              best: "Students who want internships, part-time work and a city on the doorstep.",
              examples: ["Coventry University", "Birmingham City University", "London Metropolitan University", "University of West London", "University of East London", "Middlesex University", "UWE Bristol", "University of Northampton"],
              image: "/uk/city.jpg",
            },
            {
              name: "Campus universities",
              lead: "One site, everything on it.",
              text: "Accommodation, teaching, library, sports and social life within a walk of each other. Cheaper than city living, and easier for a first year abroad — you meet people because you cannot avoid them.",
              best: "Students who want a contained, sociable first year.",
              examples: ["University of Bath", "Lancaster University", "University of York", "University of Warwick", "Loughborough University", "University of Sussex"],
              image: "/uk/campus.jpg",
            },
            {
              name: "Specialist institutions",
              lead: "One field, done seriously.",
              text: "Art, music, drama, agriculture, business. Small, focused, and often with industry connections a general university cannot match. Entry is usually about portfolio or audition as much as grades.",
              best: "Students who already know exactly what they do.",
              examples: ["Royal Northern College of Music", "University for the Creative Arts", "Rochester Institute — UK partners", "University of Wales Trinity Saint David"],
              image: "/uk/specialist.jpg",
            },
          ],
        },
        { t: "quip", text: "A note on league tables: a university ranked twelfth overall might be second in your subject, and a university ranked fortieth might be first. Always check the subject table, never just the headline one." },
        { t: "band", src: "/uk/campus-band.jpg", caption: "Four nations. Four systems. One very small island." },
      ],
    },
    {
      id: "choose",
      label: "How to choose",
      head: ["How to actually ", { text: "choose", as: "accent" }],
      blocks: [
        { t: "p", text: "Before you build a list, answer these honestly. The ones people skip are usually the ones that matter most a year later." },
        {
          t: "questions",
          items: [
            "What am I actually studying, in detail — not just the subject name?",
            "Three years or four? Does a Scottish degree suit me better?",
            "Can I afford London, or am I pretending I can?",
            "Do I want a campus I can walk across or a city I can get lost in?",
            "How strong is this university in my subject, not overall?",
            "What is the graduate outcome data for this specific course?",
            "Does the course include a placement year or industry project?",
            "What support exists for international students in week one?",
            "What are the entry requirements, and am I honestly meeting them?",
            "What is my total budget — tuition, rent, food, travel, visa, everything?",
          ],
        },
        {
          t: "priorities",
          tag: "60-second shortlist check",
          question: "What actually matters to you?",
          items: ["Subject ranking", "Total cost", "Scholarship", "City", "Campus feel", "Placement year", "Graduate outcomes", "Nepali community"],
        },
      ],
    },
    {
      id: "admissions",
      label: "Admissions & UCAS",
      head: ["Admissions, and the ", { text: "UCAS calendar", as: "accent" }],
      blocks: [
        { t: "p", text: "Most undergraduate applications go through UCAS — one application, up to five choices, one personal statement. Postgraduate applications usually go directly to the university." },
        {
          t: "cards",
          items: [
            { title: "Mid-October", text: "Medicine, dentistry and veterinary courses, and any application to Oxford or Cambridge. This deadline is genuinely fixed." },
            { title: "Mid-January", text: "The main UCAS deadline. Apply by this date and your application gets equal consideration alongside everyone else’s." },
            { title: "End of June", text: "The final date to apply through UCAS before applications roll into Clearing." },
            { title: "July onward", text: "Clearing. Universities open whatever places remain. It is not a failure route — plenty of good students end up somewhere better through it." },
          ],
        },
        { t: "p", text: "Dates shift by a day or two year to year, and individual universities set their own deadlines on top. Check the course page for the one that actually applies to you." },
        {
          t: "checks",
          two: true,
          items: [
            "Academic transcripts and predicted or achieved grades",
            "A personal statement — for UCAS, one statement covers all five choices",
            "Evidence of English: IELTS, TOEFL iBT, PTE Academic or C1 Advanced",
            "Reference letters, where the course asks for them",
            "Passport and identity documents",
            "Portfolio or audition, for creative and performance courses",
          ],
        },
        {
          t: "warn",
          tag: "Golden rule",
          text: "Your personal statement goes to every university you apply to through UCAS. Naming one of them in it is the classic mistake, and it is very hard to un-send.",
          more: "Write about the subject, not the institution. That is what they are reading for anyway.",
        },
      ],
    },
    {
      id: "money",
      label: "Money",
      head: ["Let’s talk about ", { text: "money", as: "accent" }],
      blocks: [
        { t: "p", text: "Before you settle on anywhere, read the tuition fee published for your actual course at that actual university. It is the single most useful hour of research you will do, and it tells you the entry requirements at the same time." },
        { t: "p", text: "We have not printed tuition ranges here, and that is deliberate. A laboratory-based degree and a taught humanities course are not remotely the same number, fees are revised every year, and a range wide enough to be accurate would be too wide to be useful." },
        {
          t: "table",
          title: "Typical monthly outgoings",
          stamp: "Indicative · reviewed August 2026",
          head: ["Expense", "Approx. monthly (£)"],
          rows: [
            { k: "Housing", v: "500" },
            { k: "Food", v: "150–200" },
            { k: "Transport", v: "150–200" },
            { k: "Phone and internet", v: "50" },
            { k: "Clothing and leisure", v: "50" },
          ],
          note: "Indicative monthly costs outside London, excluding tuition and visa fees. London runs considerably higher across every line. Use these to compare, not to budget.",
        },
        { t: "quip", text: "One thing students consistently underestimate: a railcard. Trains in Britain are eye-wateringly expensive at full price and reasonable with the right card. Ask about it in your first week, not your second term." },
        { t: "callout", title: "Work it out against your actual course", text: "We will build a budget from the published fee for your programme, the city you are moving to, and the visa costs on top — rather than a national average that fits nobody.", cta: "Build my budget" },
      ],
    },
    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships and ", { text: "funding", as: "accent" }],
      blocks: [
        { t: "p", text: "There is no pretending the UK is cheap. There are, however, a considerable number of scholarships open to international students — and most universities publish theirs on their own site, which is the first place to look and the one most students skip." },
        {
          t: "cards",
          items: [
            { title: "GREAT Scholarships", text: "Aimed at postgraduate study, run with participating universities, with country-specific eligibility. Worth checking whether Nepal is included in the current cycle." },
            { title: "University awards", text: "Published on each institution’s own site, often merit or subject based, and frequently with deadlines that fall before enrolment." },
            { title: "Departmental studentships", text: "Especially at postgraduate level. These are often advertised by the department rather than the central scholarships page." },
            { title: "Country and global schemes", text: "Commonwealth and other funding programmes, each with their own eligibility and timeline." },
          ],
        },
        {
          t: "warn",
          tag: "Read it twice",
          text: "“Scholarships of up to £10,000” does not mean you are getting £10,000. Those two words — “up to” — do a great deal of work. Find the actual award bands before you factor anything into your budget.",
        },
      ],
    },
    {
      id: "visa",
      label: "Student visa",
      head: ["Your ", { text: "student visa", as: "outline" }],
      blocks: [
        { t: "p", text: "To study a full-time course you apply on the Student route. Your university must hold a student sponsor licence — that is what lets it issue you a Confirmation of Acceptance for Studies, the CAS your whole application is built around. Students aged 4 to 17 applying to an independent school use the Child Student route instead." },
        {
          t: "req",
          lastReviewed: "August 2026",
          source: { label: "the UK Home Office", href: "https://www.gov.uk/student-visa" },
          items: [
            { label: "Route", value: "Student route", note: "Child Student route for ages 4–17" },
            { label: "You need a CAS", value: "From a licensed sponsor", note: "Your university must hold a student sponsor licence" },
            { label: "Application fee", value: "Confirm current fee", note: "Set by the Home Office and reviewed regularly" },
            { label: "Health surcharge", value: "Payable per year of your visa", note: "Separate from the application fee" },
            { label: "Maintenance funds", value: "Higher for London", note: "Held for a set period before you apply" },
          ],
        },
        {
          t: "warn",
          tag: "Important",
          hard: true,
          text: "An offer from a university and a visa decision are separate things. One is not a guarantee of the other, and anyone telling you otherwise is selling you something.",
        },
        { t: "p", text: "Visa decisions are made by the Home Office. What we can do is make sure you understand what is being asked for and that your application gives them nothing to query." },
      ],
    },
    {
      id: "work",
      label: "Working & after",
      head: ["Working, and ", { text: "what comes after", as: "accent" }],
      blocks: [
        { t: "p", text: "Most students on the Student route can work a limited number of hours during term and more during holidays, but the exact allowance depends on your course level and is written on your visa. Read it rather than asking a friend." },
        { t: "p", text: "After you graduate, the Graduate route has allowed eligible students to stay and work for a period without needing a job offer first. Its duration has been under review, so confirm the current position before you build a plan around it." },
        {
          t: "warn",
          tag: "Check your own visa",
          text: "Work allowances differ by course level, and breaching them is one of the few mistakes with no recovery path. Your own visa vignette and your university’s international office are the two sources worth trusting.",
        },
        { t: "band", src: "/uk/life-band.jpg", caption: "You will start looking forward to the weekends." },
      ],
    },
    {
      id: "life",
      label: "Life in the UK",
      head: ["Life in ", { text: "Britain", as: "accent" }],
      blocks: [
        { t: "p", text: "Expect low humidity, mild winters, warm summers — and rain, distributed generously and without warning. Winters are dark rather than brutally cold; the sun sets alarmingly early in December and the whole country visibly perks up in March." },
        {
          t: "chips",
          items: ["A pint at the pub", "Tea, constantly", "World music, hip-hop to opera", "Snowdon, in Wales", "Lundy Island, off Devon", "The Essex countryside", "Part-time work alongside study", "Society freshers’ fairs", "Long, bright summer evenings"],
        },
        { t: "quip", text: "Join a society in your first fortnight. Not because you will stick with it — many people do not — but because it is the easiest way to meet people before everyone’s friendship groups set like concrete." },
        { t: "p", text: "Campuses are genuinely mixed, and community events run for most cultures, so staying connected to where you came from is straightforward. Nepali student societies exist at a good number of UK universities." },
      ],
    },
    {
      id: "myths",
      label: "Myths",
      head: ["UK myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            { myth: "Only Oxford and Cambridge count.", truth: "No. The UK has dozens of universities that are world-leading in specific subjects, and subject strength matters more to employers than the overall name." },
            { myth: "It is all Tier 4 visas.", truth: "That terminology has not existed since 2020. It is the Student route now, and a page still saying Tier 4 has not been updated in five years." },
            { myth: "A three-year degree is worth less than a four-year one.", truth: "No. English degrees are three years because they specialise from day one. Scottish degrees are four because they start broader." },
            { myth: "I have to study in London to get a good job.", truth: "Not remotely. Manchester, Edinburgh, Birmingham, Bristol and Glasgow all have serious graduate employers — and much lower rent." },
            { myth: "Everyone speaks like the BBC.", truth: "You will hear Geordie, Scouse, Glaswegian and Welsh accents within a few hours of each other. It takes a couple of weeks. You will be fine." },
            { myth: "If I get an offer, my visa is guaranteed.", truth: "No. Admission and visa decisions are made by completely different bodies on different criteria." },
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
            { q: "Is a one-year master’s taken seriously?", a: "Yes. It is the standard UK format and is well understood by employers and universities worldwide. It is intense rather than shortened — the same content, delivered across twelve months." },
            { q: "Do I need IELTS?", a: "Usually you need evidence of English, and IELTS is the most widely accepted. Some universities accept alternatives, and some students qualify for exemptions. Check the specific course page." },
            { q: "England or Scotland?", a: "Scotland’s four-year undergraduate degree suits students who want a broader first year. England’s three-year degree suits students who are certain of their subject. Neither is better; they are different products." },
            { q: "Can I work while studying?", a: "There is usually a term-time allowance, but it depends on your course level and is stated on your visa. Do not rely on what a friend on a different course was told." },
            { q: "Is London worth the extra cost?", a: "For some courses and career paths, genuinely yes. For many students it is a large amount of money for a postcode. Work out the total difference over the length of your degree before you decide." },
            { q: "How much money do I need to show?", a: "The maintenance requirement depends on your course length and whether you are studying in London. It changes, so confirm the current figure with the Home Office rather than an older blog post." },
            { q: "What if my grades are borderline?", a: "Talk to us before you apply. Foundation and pathway programmes exist for exactly this, and a well-chosen pathway is far better than five rejected applications." },
          ],
        },
      ],
    },
    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your UK application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Decide your subject, level and intake — and be honest about your budget.",
            "Research courses, not just universities. Check the subject league table.",
            "Work out whether a three-year or four-year degree suits you.",
            "Sit your English test early enough that a poor result is recoverable.",
            "Build a balanced shortlist — ambitious, realistic and safe.",
            "Write the personal statement about the subject, not the institution.",
            "Apply through UCAS, or directly for most postgraduate courses.",
            "Research scholarships at each university on your list.",
            "Compare offers on total cost, not headline fee.",
            "Accept your place and get your CAS from the university.",
            "Prepare and submit your Student route application.",
            "Sort accommodation before you fly.",
            "Arrive, join a society in the first fortnight, and use the international office.",
          ],
        },
      ],
    },
  ],
  cta: {
    head: "Ready to look at the UK properly?",
    text: "Bring your subject and your budget. We will handle the rest of the questions.",
  },
};
