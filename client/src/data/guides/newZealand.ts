import type { Guide } from "./types";

/**
 * Study in New Zealand. Same voice as the other guides — see types.ts.
 *
 * Two things to preserve. New Zealand has EIGHT universities — the source
 * this replaced claimed 400, which was the whole tertiary sector counted as
 * if it were universities. And the te reo Māori words carry macrons:
 * wānanga, Māori, Aotearoa. Dropping them is the kind of mistake a New
 * Zealand reader notices immediately.
 */
export const NEW_ZEALAND_GUIDE: Guide = {
  name: "Study in New Zealand",
  hero: "/newzealand.jpg",
  head: ["Small classes, ", { text: "by law", as: "accent" }],
  lead:
    "New Zealand maintains a government Code of Practice establishing that every international student deserves proper attention from their provider. In practice that means small classes and tutors who know your name — which is not something most destinations can claim, let alone legislate.",
  jump: { to: "#sector", label: "How the sector works" },

  sections: [
    {
      id: "start",
      label: "Thinking about NZ?",
      head: ["So you’re thinking about ", { text: "Aotearoa?", as: "accent" }],
      blocks: [
        { t: "p", text: "New Zealand does not try to be the biggest option, and that turns out to be the point. It offers strong programmes, unusually small classes, and post-study work rights of up to three years depending on the qualification you complete." },
        { t: "p", text: "That last part deserves emphasis, because it is the reason a lot of students choose it — and because the entitlement follows the qualification. Which means it is worth understanding before you pick a course, not after you finish one." },
        { t: "pull", text: "The work rights follow the qualification. Choose the course with the year after it in mind." },
        {
          t: "dyk",
          text: [
            "New Zealand has a population of about five million people — roughly one sixth of Nepal's — spread across a country nearly twice Nepal's size.",
            "There are also, still, more sheep than people. The ratio has fallen a long way from its peak, but it has not flipped.",
          ],
        },
        { t: "quip", text: "Nobody in New Zealand will call it New Zealand all the time. You will hear Aotearoa, and you will hear kia ora rather than hello, roughly from your first hour at the airport." },
      ],
    },
    {
      id: "size",
      label: "The scale of it",
      head: ["Bigger than Nepal. ", { text: "Emptier", as: "shout" }, " than you think."],
      blocks: [
        {
          t: "compare",
          a: { label: "Nepal", value: "147,516 km²" },
          x: "×1.8",
          b: { label: "New Zealand", value: "~268,000 km²" },
          note: "Nearly twice the land, about a sixth of the people. Two main islands, a handful of cities, and a great deal of space between them — which is a large part of why the country feels the way it does.",
        },
        { t: "p", text: "Practically, this means your city matters. Auckland is the largest and busiest and carries the highest rents; Wellington is the capital and the most compact; Christchurch and Dunedin are smaller, cheaper and more student-shaped. The distances between them are real but manageable." },
        {
          t: "choice",
          tag: "Quick choice",
          question: "What sort of place suits you?",
          resting: "This does not choose an institution. It narrows the list by cost and pace, which is most of the work.",
          options: [
            { key: "A", label: "Auckland — the biggest, the busiest", reply: "The largest job market and the most going on, with rents to match. Budget accommodation first." },
            { key: "B", label: "Wellington — the capital, but walkable", reply: "Compact, cultural, and small enough to cross on foot. Windy, and everyone will tell you so." },
            { key: "C", label: "Somewhere smaller and cheaper", reply: "Look at Christchurch, Dunedin, Hamilton and Palmerston North. Genuinely student cities, and your money lasts considerably longer." },
            { key: "D", label: "Wherever the right course is", reply: "The right instinct. Eight universities is a short enough list to compare properly on programme rather than postcode." },
          ],
        },
      ],
    },
    {
      id: "sector",
      label: "The tertiary sector",
      head: ["The tertiary ", { text: "sector", as: "accent" }],
      blocks: [
        { t: "p", text: "New Zealand's tertiary sector is wider than its eight universities, and the alternatives are worth knowing — several lead to the same qualifications by a different route, and many offer distance study. Everything they award is recognised by the New Zealand Qualifications Authority." },
        {
          t: "types",
          items: [
            {
              name: "Universities",
              lead: "Eight of them. Not four hundred.",
              text: "New Zealand has eight universities, offering undergraduate, postgraduate and doctoral study across the full range of disciplines. A short list is an advantage: you can genuinely compare all of them on the programme you want.",
              best: "Students aiming at degree-level study and research.",
              examples: ["University of Auckland", "University of Otago", "Victoria University of Wellington", "University of Canterbury", "Massey University", "University of Waikato", "Lincoln University", "Auckland University of Technology"],
              image: "/newzealand/universities.jpg",
            },
            {
              name: "Institutes of technology & polytechnics",
              lead: "Applied, practical, industry-facing.",
              text: "ITPs offer foundational, undergraduate and postgraduate courses with a practical emphasis. Frequently the better route if you want to be employable quickly, and often with pathways into degree study.",
              best: "Students who learn by doing rather than by reading about doing.",
              examples: ["Eastern Institute of Technology", "Wellington Institute of Technology"],
              image: "/newzealand/itp.jpg",
            },
            {
              name: "Wānanga",
              lead: "Tertiary education grounded in Māori knowledge.",
              text: "Institutions built on mātauranga Māori and tikanga — the right place to study if you want to learn within that tradition rather than merely about it.",
              best: "Students drawn to Māori knowledge as a framework, not a subject.",
              image: "/newzealand/wananga.jpg",
            },
            {
              name: "Private training establishments",
              lead: "Specialised, vocational, often flexible.",
              text: "A large number of PTEs deliver specialised vocational and professional training, and many offer distance study. Check NZQA recognition and the provider's track record before committing.",
              best: "Students after a specific professional qualification.",
              image: "/newzealand/pte.jpg",
            },
          ],
        },
        {
          t: "dyk",
          text: [
            "Doctoral study in New Zealand is unusually inexpensive for international students compared with most destinations — one of the few places where a PhD is genuinely affordable from abroad.",
            "If postgraduate research is where you are heading, that is worth building into the comparison early.",
          ],
        },
        { t: "band", src: "/newzealand/campus-band.jpg", caption: "Every student deserves proper attention. It is written down." },
      ],
    },
    {
      id: "intakes",
      label: "Intakes & timing",
      head: ["Intakes, and the ", { text: "six-month rule", as: "accent" }],
      blocks: [
        { t: "p", text: "Start roughly six months before your deadline. Sit your language and aptitude tests about three months out, leaving the final three months to complete the application accurately — and run the visa application alongside interviews rather than after them." },
        {
          t: "cards",
          items: [
            { title: "January", text: "The main intake. Start the admission process around six months ahead, and aim to have the visa application in by October or November." },
            { title: "July", text: "The second main intake, and a good option if you need longer to prepare your application or your English score." },
            { title: "September & November", text: "Offered by some universities for some programmes. Worth asking about if neither main intake suits you." },
            { title: "March – July", text: "Vocational courses often open admissions across these months rather than following the university calendar." },
          ],
        },
        { t: "quip", text: "Most universities set several deadlines within one intake, so there is usually a version of the timeline that fits. There is rarely a version that fits if you start in December for a January start." },
      ],
    },
    {
      id: "entry",
      label: "Entry requirements",
      head: ["What each level ", { text: "asks for", as: "accent" }],
      blocks: [
        {
          t: "cards",
          items: [
            { title: "Bachelor’s programmes", text: "Entry is comparatively straightforward and does not demand an exceptional secondary record. You will need an English proficiency score — we run preparation for IELTS and PTE." },
            { title: "Master’s programmes", text: "Generally around 50–60% in your bachelor's degree, plus a portfolio and certificates evidencing work relevant to your field. GMAT, GRE, IELTS or TOEFL as the programme requires." },
            { title: "Doctoral programmes", text: "A strong master's result, and often one to two years of documented experience. Business and management streams usually want a GRE or GMAT alongside IELTS or TOEFL." },
          ],
        },
        { t: "p", text: "Documents you will usually need, whichever level you are applying at:" },
        {
          t: "checks",
          two: true,
          items: [
            "Motivation letter",
            "Certified copy of your high school diploma or completed degree",
            "Translations of course modules and grades, if not in English",
            "Proof of language proficiency",
            "Passport copy and passport photograph",
            "Proof of payment of the application fee",
            "A résumé, where the university asks for one",
            "A sample of previous academic work",
          ],
        },
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
            "What am I studying, and at what level?",
            "Does this qualification carry post-study work rights, and for how long?",
            "University, ITP, wānanga or PTE — which suits how I actually learn?",
            "Which island, and which city?",
            "What does rent cost there, honestly?",
            "Is the qualification NZQA recognised?",
            "January or July — and can I be ready?",
            "What is the total cost across the whole course?",
            "What scholarships is this institution offering?",
            "What do I want to be doing the year after I graduate?",
          ],
        },
        {
          t: "priorities",
          tag: "60-second shortlist check",
          question: "What actually matters to you?",
          items: ["Programme strength", "Total cost", "Work rights after", "City", "Class size", "Scholarship", "Distance study", "Nepali community"],
        },
      ],
    },
    {
      id: "money",
      label: "Money",
      head: ["Let’s talk about ", { text: "money", as: "accent" }],
      blocks: [
        { t: "p", text: "Studying in New Zealand can be genuinely affordable, but that depends almost entirely on what you study and where. Medicine and veterinary science sit far above everything else. Doctoral study, as above, sits unusually low." },
        { t: "p", text: "We have not printed tuition ranges. The spread between a taught programme and a clinical one is so wide that a single range would be useless, and fees are revised annually — read the figure published for your specific programme instead." },
        {
          t: "table",
          title: "Typical monthly outgoings",
          stamp: "Indicative · reviewed August 2026",
          head: ["Expense", "Approx. monthly (NZ$)"],
          rows: [
            { k: "Accommodation", v: "800 – 1,000" },
            { k: "Food", v: "200" },
            { k: "Transport", v: "100 – 120" },
            { k: "Health expenses", v: "40 – 100" },
            { k: "Phone and internet", v: "50" },
            { k: "Day-to-day essentials", v: "40 – 50" },
            { k: "Other", v: "100" },
          ],
          note: "Indicative monthly costs, excluding tuition. Immigration New Zealand also sets a minimum funds figure you must evidence for your visa — confirm the current one before you apply.",
        },
        { t: "callout", title: "Work it out properly, early", text: "We will build a budget against your actual programme fee, the city you are moving to, insurance, and the funds you have to evidence for the visa — which is the number that catches people out.", cta: "Build my budget" },
      ],
    },
    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships in ", { text: "New Zealand", as: "accent" }],
      blocks: [
        { t: "p", text: "A considerable number of scholarships are open to international students, from government-funded programmes through to awards run by individual universities. Eligibility varies sharply." },
        {
          t: "cards",
          items: [
            { title: "Government scholarships", text: "New Zealand Development Scholarship, Regional Development Scholarship, Pacific Scholarship, ASEAN Scholar Awards, Short Term Training Scholarship, Commonwealth Scholarship." },
            { title: "Undergraduate awards", text: "Tongarewa Scholarship, International Student Excellence Scholarship, AUT International Excellence Scholarships, UC International First-Year Undergraduate Scholarship, Beca Engineering in Society Scholarships." },
            { title: "Also worth checking", text: "Scholarships for women, for minority students, sports scholarships, merit-based awards, and named memorial awards such as the Dr Russell Smith and Eamon Molloy scholarships." },
          ],
        },
        { t: "quip", text: "With only eight universities, you can realistically read every single one's scholarship page in an afternoon. Very few students do. Be one of them." },
      ],
    },
    {
      id: "visa",
      label: "Student visa",
      head: ["Your ", { text: "student visa", as: "outline" }],
      blocks: [
        { t: "p", text: "If your programme runs longer than three months you will need a student visa. You can apply online, and you should start at least three months before you intend to travel — processing times swing considerably by season and by where you are applying from, so treat that as a minimum rather than a plan." },
        {
          t: "req",
          lastReviewed: "August 2026",
          source: { label: "Immigration New Zealand", href: "https://www.immigration.govt.nz/new-zealand-visas/options/study" },
          items: [
            { label: "Visa", value: "Student visa", note: "Required for courses longer than three months" },
            { label: "Apply", value: "Online, well in advance", note: "Processing times vary — check before you book travel" },
            { label: "Insurance", value: "Health and travel cover", note: "For the full length of your visa" },
            { label: "Funds", value: "Evidence of living costs", note: "Per year of study, plus tuition" },
            { label: "After study", value: "Post Study Work Visa", note: "Up to three years, depending on your qualification" },
          ],
        },
        {
          t: "checks",
          two: true,
          items: [
            "A valid passport",
            "Letter of acceptance from a recognised institution",
            "Academic skills and qualifications",
            "English language test score",
            "Financial records",
            "Health and travel insurance",
            "Medical records",
            "Character and identity certificates",
          ],
        },
        {
          t: "warn",
          tag: "Health cover is a condition",
          text: "You must hold health and travel insurance meeting government standards, complying with the Code of Practice for the Pastoral Care of International Students, and accepted by your provider — for the full length of your visa, including travel to and from New Zealand.",
          more: "Premiums differ by provider and policy, so compare cover your institution will actually accept rather than the cheapest one you find.",
        },
        {
          t: "warn",
          tag: "Important",
          hard: true,
          text: "Visa decisions are made by Immigration New Zealand. Our role is to help you understand what is being asked for and prepare your application accurately — not to predict the outcome.",
        },
        { t: "band", src: "/newzealand/life-band.jpg", caption: "From the Southern Lights to the Nevis Swing." },
      ],
    },
    {
      id: "life",
      label: "Life in NZ",
      head: ["Living in ", { text: "New Zealand", as: "accent" }],
      blocks: [
        { t: "p", text: "You will not run out of things to do. Beautiful landscapes and genuinely adventurous places, alongside a culture shaped by Māori, European and East Asian traditions, and a population diverse enough that you will meet all of it." },
        {
          t: "chips",
          items: ["The Southern Lights", "Whale watching", "The Nevis Swing", "Bungee jumping", "Māori culture and tikanga", "Some of the world’s lowest crime rates", "Landscapes worth the flight alone", "A genuinely diverse population"],
        },
        { t: "quip", text: "New Zealanders are relaxed to a degree that can be disorienting in your first month. “She’ll be right” is not a figure of speech; it is a national operating principle." },
      ],
    },
    {
      id: "myths",
      label: "Myths",
      head: ["New Zealand myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            { myth: "New Zealand has hundreds of universities.", truth: "It has eight. The wider tertiary sector is large, but universities and tertiary providers are not the same thing." },
            { myth: "It is basically a smaller Australia.", truth: "Different system, different visa, different work rights, different culture. The flights between them are short; the similarities are shallower than they look." },
            { myth: "A PTE or ITP qualification will not be recognised.", truth: "If it is NZQA recognised, it is recognised. Check the qualification rather than assuming from the type of provider." },
            { myth: "Post-study work rights are automatic for three years.", truth: "Up to three years, depending on the qualification you complete. The entitlement follows the course, so check before you enrol." },
            { myth: "Health insurance is optional.", truth: "It is a visa condition, and it has to cover the full length of your stay." },
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
            { q: "Are the classes really smaller?", a: "Generally yes, and it is a genuine difference rather than marketing. The Code of Practice sets an expectation of proper attention from providers, and the sector is small enough for it to hold." },
            { q: "How long can I stay after graduating?", a: "Up to three years on a Post Study Work Visa, depending on your qualification level. It follows the course, so confirm eligibility before you enrol." },
            { q: "Is a PhD really that much cheaper?", a: "Doctoral study is unusually inexpensive for international students in New Zealand compared with most destinations. If research is your direction, factor that in early." },
            { q: "North Island or South Island?", a: "Auckland and Wellington are on the North; Christchurch and Dunedin on the South. The South is quieter, colder and cheaper, with the more dramatic landscape." },
            { q: "Do I need to speak te reo Māori?", a: "No. English is the working language of every university. Learning a little goes a long way socially, and you will pick up more than you expect." },
            { q: "How much money do I need to show?", a: "Immigration New Zealand sets a minimum funds figure per year of study, on top of tuition. It is revised, so confirm the current one rather than working from an older figure." },
            { q: "Can I work while studying?", a: "There is generally an allowance, subject to your visa conditions. Read your own visa rather than relying on what applied to somebody else's course." },
          ],
        },
      ],
    },
    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your New Zealand application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Decide your subject and level, and check the work rights that follow it.",
            "Compare all eight universities properly — the list is short enough.",
            "Consider whether an ITP, wānanga or PTE suits you better.",
            "Pick your intake — January or July — and work backwards six months.",
            "Sit your English test around three months before the deadline.",
            "Prepare transcripts, motivation letter and supporting documents.",
            "Apply online or on paper, and check scholarships at the same time.",
            "Compare offers on total cost, not headline tuition.",
            "Accept your place and get the letter of acceptance.",
            "Arrange health and travel insurance for the full visa length.",
            "Submit the student visa application at least three months before travel.",
            "Sort accommodation before you fly.",
            "Arrive, enrol, and use the international student support in week one.",
          ],
        },
      ],
    },
  ],
  cta: {
    head: "Ready to explore New Zealand?",
    text: "Tell us what you want to study, and we will map the rest out with you.",
  },
};
