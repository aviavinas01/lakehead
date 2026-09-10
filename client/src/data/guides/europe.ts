import type { Guide } from "./types";

/**
 * Study in Europe. Same voice as the other guides — see types.ts.
 *
 * THIS ONE IS A REGION, NOT A COUNTRY, and that changes what it is allowed
 * to say. Every other guide here can describe one immigration system and one
 * set of universities. Europe has as many of both as it has countries, so
 * the honest job of this page is to explain what genuinely IS shared — the
 * degree structure, the credit system, the way English-taught programmes
 * work, the way Schengen movement works — and to be explicit that tuition,
 * visas and post-study work are decided nationally and have to be checked
 * country by country.
 *
 * NO FIGURES ANYWHERE IN HERE, and for two reasons. The first is the one
 * every guide on this site follows: a fee, a threshold or a processing time
 * goes stale on somebody else's schedule, not ours. The second belongs to
 * this page alone — a tuition or visa number that is true in one European
 * country is actively misleading about the next one. Anything with a shelf
 * life belongs in a `req` or `table` block with a review date and a source,
 * added per country once somebody has the current position in front of them.
 */
export const EUROPE_GUIDE: Guide = {
  page: "study-in-europe",
  name: "Study in Europe",
  /* GERMANY STANDS IN FOR THE CONTINENT. A region has no single skyline,
     and this is the European destination most of our students mean when
     they say "Europe". The card on /study-abroad points at the same file —
     change the two together, or the grid and the guide disagree. */
  hero: "/germany.jpg",
  head: ["One continent. ", { text: "Thirty systems.", as: "accent" }],
  lead:
    "Europe is the only destination on this list that is not a country. That is its great advantage and the thing students most often get wrong — the degrees are comparable across borders, and almost nothing else is.",
  jump: { to: "#choose", label: "Choosing a country" },

  sections: [
    {
      id: "start",
      label: "Thinking about Europe?",
      head: ["So you’re thinking about ", { text: "Europe?", as: "accent" }],
      blocks: [
        { t: "p", text: "Students usually arrive at Europe from one of two directions. Either they have heard that several countries charge little or nothing for a public university education and want to know whether that is really true, or they have found one specific programme in one specific city and want to know how to get there." },
        { t: "p", text: "Both are reasonable starting points. Both run into the same fact: “Europe” is not an admissions system, a visa route or a fee level. It is roughly thirty of each, and choosing the country is the decision that determines all of them." },
        { t: "pull", text: "You do not apply to Europe. You apply to a programme, in a country, under that country's rules. Everything on this page exists to help you pick which one." },
        {
          t: "dyk",
          text: [
            "A bachelor's degree from a university in the European Higher Education Area is built to be readable by every other university in it. That is not an accident — it is what the Bologna Process was for.",
            "It is why a Dutch bachelor's can lead to a German master's without anybody having to argue about what the degree was worth. For an international student, that portability is one of Europe's genuine structural advantages.",
          ],
        },
        { t: "quip", text: "Everyone starts by asking which European country is cheapest. It is the wrong first question, and you will get a better answer to it after you have asked the other three." },
      ],
    },

    {
      id: "bologna",
      label: "What is actually shared",
      head: ["What Europe ", { text: "actually shares", as: "accent" }],
      blocks: [
        { t: "p", text: "Under the Bologna Process, most European countries structure higher education the same way: a first-cycle bachelor's degree, a second-cycle master's, and a third-cycle doctorate. Study is measured in ECTS credits, and a credit means broadly the same amount of work in Lisbon as it does in Helsinki." },
        { t: "p", text: "The practical effect is that European degrees are designed to be compared and transferred. A qualification earned in one member country is recognised in the others without a separate equivalence fight, and moving between countries between cycles — bachelor's in one, master's in another — is a normal path rather than an exotic one." },
        {
          t: "checks",
          two: true,
          items: [
            "A common three-cycle degree structure",
            "ECTS credits, comparable across borders",
            "The Diploma Supplement, explaining your degree to any employer",
            "Quality assurance frameworks across the area",
            "Erasmus+ mobility between institutions",
            "Schengen movement, for most but not all of the area",
          ],
        },
        {
          t: "warn",
          tag: "And what is not",
          text: "Tuition fees, student visas, residence permits, health insurance and post-study work rights are set NATIONALLY. None of them is a European rule, and advice about one country tells you nothing reliable about another.",
        },
      ],
    },

    {
      id: "english",
      label: "Studying in English",
      head: ["Studying in ", { text: "English", as: "accent" }],
      blocks: [
        { t: "p", text: "This is the part that surprises students most. A very large number of degrees across Europe are taught entirely in English, in countries where English is not an official language — and the concentration is highest exactly where students assume it would be lowest." },
        { t: "p", text: "At master's level in particular, English-taught programmes are the norm rather than the exception in a good number of countries. At bachelor's level they are more limited, though far from rare, and are concentrated in the Netherlands, the Nordic countries, Ireland and parts of Central Europe." },
        { t: "p", text: "Ireland and Malta are English-speaking members of the European Union, which makes them a different proposition again: the whole system runs in English, not just your programme." },
        { t: "pull", text: "You can take an entire degree in English in a country whose language you do not speak. You cannot live there in English — and the gap between those two facts is where most of the surprises live." },
        { t: "p", text: "Learning the local language remains worth doing, and in several countries it is the difference between a student visa and a career. Many universities offer free or subsidised language classes to their own international students; taking them is close to free money." },
      ],
    },

    {
      id: "money",
      label: "What it costs",
      head: ["What it ", { text: "costs", as: "shout" }],
      blocks: [
        { t: "p", text: "The spread in European tuition is wider than in any other destination on this site, and it is the single biggest variable in the decision." },
        { t: "p", text: "At one end, several countries charge no tuition, or only an administrative contribution per term, at their public universities — including for international students in some cases and for European students only in others. At the other end, private institutions and business schools charge fees comparable with anywhere in the world. Between the two sit countries with modest national fees that vary by level and by subject." },
        { t: "p", text: "Because the rules differ by country, by institution type and frequently by the student's own nationality, there is no European tuition figure to quote and anybody who quotes you one is describing a single country." },
        {
          t: "warn",
          tag: "The real number",
          hard: true,
          text: "Low tuition does not mean low cost. In the countries where public university is cheapest, the cost of living is often high, and the visa itself usually requires proof that you can cover a year of it.",
          more: "Budget the living costs and the blocked-account or proof-of-funds requirement first, and treat tuition as the smaller line it frequently is.",
        },
        {
          t: "checks",
          two: true,
          items: [
            "Tuition, or the semester contribution where there is no tuition",
            "Proof of funds for the residence permit",
            "Rent and a deposit, in a market that is tight in most student cities",
            "Health insurance, which is usually mandatory and sometimes state-run",
            "Residence permit and registration fees",
            "Local transport, often heavily discounted for students",
          ],
        },
      ],
    },

    {
      id: "choose",
      label: "Choosing a country",
      head: ["Choosing ", { text: "a country", as: "accent" }],
      blocks: [
        { t: "p", text: "This is the decision the rest of the process hangs on, and it is worth making deliberately rather than by whichever prospectus arrived first. Four questions get most students to a shortlist." },
        {
          t: "questions",
          items: [
            "Is my programme taught in English there, at my level?",
            "What does that country actually require me to prove financially?",
            "How long may I stay after graduating, and on what terms?",
            "Do I want a large international student population, or immersion?",
            "Can I afford the living costs, separately from the tuition?",
            "Is the language one I am willing to learn for the sake of working there?",
          ],
        },
        { t: "p", text: "Post-study work is the question students ask last and should ask second. Several European countries offer a period after graduation to look for skilled work, and the length and conditions vary considerably; the European Blue Card exists as a route into skilled employment across much of the union, with its own requirements. If your plan involves working in Europe afterwards, that should shape the country you choose, not be discovered after you arrive." },
        { t: "quip", text: "The country with the cheapest tuition, the country with the best programme for you and the country you would actually enjoy living in are rarely the same country. Pick two and be honest about which one you dropped." },
      ],
    },

    {
      id: "apply",
      label: "How to apply",
      head: ["How to ", { text: "apply", as: "accent" }],
      blocks: [
        { t: "p", text: "There is no single European application. Some countries run a national portal, some route applications through a shared evaluation service, and in others you apply to each university directly. Which of the three you are dealing with is one of the first things to establish." },
        {
          t: "roadmap",
          items: [
            "Shortlist countries first, then programmes inside them.",
            "Establish how that country's applications are made — national portal, shared service, or direct.",
            "Check the language requirement, and whether the programme accepts your English test.",
            "Have your qualifications recognised or evaluated if the country requires it.",
            "Prepare transcripts, certificates and certified translations.",
            "Apply by the country's deadline, which may be much earlier than the term start.",
            "Accept the offer and pay any deposit or first instalment.",
            "Arrange proof of funds in whatever form that country accepts.",
            "Apply for the national student visa or residence permit.",
            "Arrange housing before you travel — this is the hard part in most European cities.",
          ],
        },
        {
          t: "warn",
          tag: "Start with housing",
          text: "In a good number of European student cities, accommodation is harder to secure than the university place. Students are routinely admitted and then unable to find a room within reach of the campus.",
          more: "Apply for university housing the day it opens, and treat a private lease as the fallback rather than the plan.",
        },
      ],
    },

    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships and ", { text: "funding", as: "accent" }],
      blocks: [
        { t: "p", text: "Funding in Europe comes from three levels, and students usually only find the first one." },
        { t: "p", text: "European Union programmes are the most visible. Erasmus Mundus Joint Masters are full degree programmes run by consortiums of universities in different countries, taught in English, with scholarships attached that are among the more generous available anywhere — and correspondingly competitive. Erasmus+ also funds exchange periods for students already enrolled at a participating institution." },
        { t: "p", text: "National scholarship programmes are the second level. Several countries run their own schemes for international students, administered by a government agency or an academic exchange body, with their own eligibility rules and their own calendars." },
        { t: "p", text: "University awards are the third and the most overlooked. Individual institutions run tuition waivers, merit awards and need-based support for international students, and because they are decided institution by institution, they are where a strong but not exceptional application often does best. Which of them you are eligible for depends on your profile, and working that out is a large part of what we do." },
      ],
    },

    {
      id: "visa",
      label: "Visas and Schengen",
      head: ["Visas, permits ", { text: "and Schengen", as: "outline" }],
      blocks: [
        { t: "p", text: "Two things are commonly confused here, and it is worth separating them clearly." },
        { t: "p", text: "Schengen is about movement. Most European countries participate in an area without routine internal border checks, so once you are lawfully resident in one of them, travelling to the others for short visits is straightforward. It is one of the genuine pleasures of studying in Europe." },
        { t: "p", text: "Your right to be there is national. You hold a student visa or residence permit issued by one specific country, under that country's rules, with that country's requirements for funds, insurance, accommodation and enrolment. Schengen lets you visit the others; it does not let you study or work in them." },
        {
          t: "checks",
          items: [
            "Apply through the embassy or consulate of the country you will study in",
            "Expect a proof-of-funds requirement, in that country's required form",
            "Expect mandatory health insurance, state or private depending on the country",
            "Expect to register your address locally after arriving",
            "Check the work allowance — it is national, and it varies",
          ],
        },
        {
          t: "warn",
          tag: "We are honest about this",
          text: "Immigration decisions are made by the national authorities of the country you apply to. We help you understand the process and prepare the documentation carefully — not predict the outcome.",
        },
      ],
    },

    {
      id: "life",
      label: "Life in Europe",
      head: ["Life as an ", { text: "international student", as: "accent" }],
      blocks: [
        { t: "p", text: "The student experience is genuinely different from country to country, but a few things hold almost everywhere. Public transport is good and usually discounted for students. Universities have large international offices because they have large international populations. And the continent is small enough, and well enough connected, that a weekend somewhere else is an ordinary thing to do rather than an expedition." },
        { t: "p", text: "Teaching styles vary more than students expect. Some systems are seminar-led and expect you to argue; some are lecture-led and expect you to have read everything before you arrive; some assess almost entirely by a single examination at the end. None of these is harder than the others, but arriving expecting the wrong one costs you a term." },
        { t: "quip", text: "The cliché about Europe is that you will travel constantly. The truth is that you will travel a lot in the first term, then discover your own city, then travel again in the last one." },
      ],
    },

    {
      id: "myths",
      label: "Myths",
      head: ["Europe myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            {
              myth: "Studying in Europe is free.",
              truth: "Public university tuition is low or nil in several countries and substantial in others. Living costs are never nil, and the visa will ask you to prove you can cover them.",
            },
            {
              myth: "I need to speak the local language to study there.",
              truth: "A great many programmes are taught entirely in English, particularly at master's level. You will still want the local language for your life and for working there afterwards.",
            },
            {
              myth: "A student visa for one European country lets me study in any of them.",
              truth: "It lets you travel to most of them. Studying or working means that country's own permission.",
            },
            {
              myth: "European degrees are not recognised back home.",
              truth: "The Bologna structure and the Diploma Supplement exist specifically to make these degrees readable anywhere. Recognition is one of Europe's strongest points.",
            },
            {
              myth: "Finding accommodation is the easy part.",
              truth: "In several of the most popular student cities it is the hardest part, and harder than getting admitted. Start it early.",
            },
          ],
        },
      ],
    },

    {
      id: "faq",
      label: "Questions we get",
      head: ["Questions we ", { text: "actually get", as: "accent" }],
      blocks: [
        {
          t: "faq",
          items: [
            {
              q: "Which European country should I pick?",
              a: "The one where your programme is taught in a language you have, whose funds requirement you can genuinely meet, and whose post-study rules match what you want afterwards. If those three point at different countries, the third usually deserves the most weight.",
            },
            {
              q: "Can I move to another European country after my degree?",
              a: "Often, but not automatically — it needs that country's permission, and the route depends on whether you are moving to study or to work. The European Blue Card is one such route for skilled employment.",
            },
            {
              q: "Do I need my qualifications formally recognised?",
              a: "In some countries yes, through a designated evaluation service, and in others the university does it itself. Establish which before you assume your transcripts are enough.",
            },
            {
              q: "Is a master's in Europe shorter than elsewhere?",
              a: "Frequently, yes — one to two years depending on the country and the subject. That is a real cost advantage and worth factoring into the comparison.",
            },
            {
              q: "Can I work while studying?",
              a: "Usually, within a limit set nationally rather than Europe-wide. Check the specific country, and plan your budget as though the work does not exist.",
            },
          ],
        },
      ],
    },

    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your Europe application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Decide what you want after the degree. In Europe this genuinely picks the country.",
            "Shortlist two or three countries against language, funds and post-study rules.",
            "Find the programmes inside them, at your level and in your language.",
            "Establish how each country takes applications, and its real deadline.",
            "Prepare transcripts, translations and any required recognition.",
            "Sit your English test, and start the local language regardless.",
            "Apply, and apply for university housing the same week.",
            "Accept, pay the deposit, arrange the proof of funds in the required form.",
            "Apply for the national student visa or residence permit.",
            "Arrive, register your address, enrol, and get the student transport pass.",
          ],
        },
      ],
    },
  ],

  cta: {
    head: "Ready to narrow Europe down?",
    text: "Start with a conversation — we will help you turn thirty countries into a shortlist of two.",
  },
};
