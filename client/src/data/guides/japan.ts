import type { Guide } from "./types";

/**
 * Study in Japan. Same voice as the other guides — see types.ts.
 *
 * NO FIGURES ANYWHERE IN HERE, and that is deliberate rather than
 * unfinished. Japan's numbers move and are set by different bodies: tuition
 * differs between national, public and private universities, the weekly
 * work-hours cap is set by immigration policy, and scholarship benefits are
 * revised per intake. Everything with a shelf life belongs in a `req` or
 * `table` block, which carries a review date and a link to the source that
 * published it — and neither block should be added until somebody has the
 * current figures from MEXT, JASSO and the Immigration Services Agency in
 * front of them. A guide that quotes a stale number confidently is worse
 * than one that tells you where to look.
 */
export const JAPAN_GUIDE: Guide = {
  page: "study-in-japan",
  name: "Study in Japan",
  hero: "/japan.jpg",
  head: ["Older than you think. ", { text: "Newer than you think.", as: "accent" }],
  lead:
    "Japan runs one of the largest higher-education systems in Asia, a research sector that has been world-class for a century, and a student experience that almost nobody predicts correctly before they arrive.",
  jump: { to: "#universities", label: "The universities" },

  sections: [
    {
      id: "start",
      label: "Thinking about Japan?",
      head: ["So you’re thinking about ", { text: "Japan?", as: "accent" }],
      blocks: [
        { t: "p", text: "Most students arrive with a picture assembled from anime, Tokyo street footage and a photograph of Mount Fuji. Some of that is real. What tends to surprise people is how much of Japan is not Tokyo, how seriously the universities take research, and how quickly a country that looked impenetrable from the outside becomes navigable once you are in it." },
        { t: "p", text: "Japan has been educating international students for a long time and has built the machinery to do it: dedicated admission examinations, a government scholarship programme, a support organisation whose entire job is international students, and a growing number of degrees taught in English." },
        { t: "pull", text: "The question is almost never “can I study in Japan”. It is “in which language, in which city, and starting in which month” — and those three answers change everything else." },
        {
          t: "dyk",
          text: [
            "Japan's academic year traditionally begins in April, not September. Cherry blossom and first day of term are the same photograph for a reason.",
            "A growing number of English-taught programmes run on an autumn intake instead, precisely so that international students are not asked to rearrange their lives around a different calendar. Which one your programme uses is one of the first things to check.",
          ],
        },
        { t: "quip", text: "You will learn the train system before you learn the language. Everybody does. It is also the single most useful thing you will learn in month one." },
      ],
    },

    {
      id: "why",
      label: "Why Japan",
      head: ["Why students ", { text: "choose Japan", as: "accent" }],
      blocks: [
        { t: "p", text: "The academic case is strongest in engineering, the physical sciences, robotics, materials, medicine and the environmental sciences — fields where Japanese universities and Japanese industry have been working alongside each other for decades, and where a laboratory place is a genuine apprenticeship rather than a line on a transcript." },
        { t: "p", text: "The seminar and laboratory culture is worth understanding before you choose. Undergraduate teaching is comparatively structured, and then a great deal of Japanese higher education happens inside a research group — you belong to a lab, you belong to a professor's group, and that group is your academic home for years. Students who want that find it unusually rewarding. Students who want to move between supervisors every term find it constraining. Neither is wrong; they are different things to want." },
        {
          t: "checks",
          two: true,
          items: [
            "Research depth in engineering and the sciences",
            "Long-established scholarship routes for international students",
            "Growing range of English-taught degrees",
            "Strong industry links, particularly in technical fields",
            "Public transport that makes distance almost irrelevant",
            "A student support system built specifically for international students",
          ],
        },
        { t: "p", text: "And then there is the part nobody puts in a prospectus: it is a country where the food, the seasons, the trains and the sheer ordinary competence of daily life become part of why you stayed. Students who go to Japan tend to talk about it differently afterwards." },
      ],
    },

    {
      id: "not-tokyo",
      label: "Japan is not Tokyo",
      head: ["Japan is ", { text: "not Tokyo", as: "shout" }],
      blocks: [
        { t: "p", text: "Roughly a third of the country lives in the greater Tokyo area, which means two thirds do not, and some of the strongest universities are deliberately elsewhere. Choosing your city is choosing your cost of living, your pace and, to a real extent, how much Japanese you will end up speaking." },
        { t: "p", text: "Tokyo has the most universities, the most part-time work, the most going on and the highest rents. Kyoto is smaller, older and dense with students — a university town in a way Tokyo is not. Osaka is the commercial counterweight with its own dialect and a reputation for being the friendliest city in the country. Sendai, Nagoya, Fukuoka and Sapporo are serious research cities that cost considerably less to live in, and Tsukuba is essentially a science city built on purpose." },
        { t: "pull", text: "The trains mean the rest of the country is closer than the map suggests. Choosing a smaller city is a lifestyle decision, not an isolation one." },
        { t: "quip", text: "Everyone budgets for Tokyo and then applies to a university in Sendai. Rebuild the budget. Your money goes considerably further outside the capital, and the labs are not worse." },
      ],
    },

    {
      id: "universities",
      label: "The universities",
      head: ["The ", { text: "universities", as: "accent" }],
      blocks: [
        { t: "p", text: "Japanese universities fall into three groups, and the distinction matters more here than in most countries because it drives both cost and character." },
        {
          t: "types",
          items: [
            {
              name: "National universities",
              lead: "The former imperial universities and their peers — research-heavy, competitive, and the cheapest of the three.",
              text: "Funded and overseen nationally, with tuition set on a common basis rather than by each institution. These are where much of Japan's research output comes from, and where most government scholarship holders end up. Admission is demanding and, for Japanese-taught programmes, usually runs through a national examination route.",
              best: "Students with strong academics who want research depth and lower fees.",
              examples: [
                "University of Tokyo", "Kyoto University", "Osaka University",
                "Tohoku University", "Nagoya University", "Kyushu University",
                "Hokkaido University", "University of Tsukuba",
              ],
              image: "/japan/national.jpg",
            },
            {
              name: "Public universities",
              lead: "Run by a prefecture or a city rather than the state. Smaller, regional, often excellent in a particular field.",
              text: "Local-government universities sit between the national and private groups on cost and size. They tend to be strongly connected to their region and its industries, which can make them an unusually direct route into work in that part of the country.",
              best: "Students who want a smaller institution and a strong regional connection.",
              examples: [
                "Tokyo Metropolitan University", "Osaka Metropolitan University",
                "Yokohama City University", "Nagoya City University",
              ],
              image: "/japan/public.jpg",
            },
            {
              name: "Private universities",
              lead: "The largest group by far, and the widest range — from globally known names to small specialist colleges.",
              text: "Most Japanese students attend a private university. Fees are higher and vary considerably between institutions and faculties, but so does everything else: private universities run many of the country's English-taught programmes, tend to have larger international offices, and are often more flexible about admission routes that do not involve the national examination.",
              best: "Students who want an English-taught degree or a more international campus.",
              examples: [
                "Waseda University", "Keio University", "Sophia University",
                "Ritsumeikan University", "Doshisha University",
                "International Christian University",
              ],
              image: "/japan/private.jpg",
            },
          ],
        },
        { t: "p", text: "Subject areas run across engineering and technology, computer science and artificial intelligence, robotics and mechatronics, the physical and life sciences, medicine and health, business and economics, architecture and design, environmental studies, and Japanese studies and the humanities." },
      ],
    },

    {
      id: "language",
      label: "Do I need Japanese?",
      head: ["Do you need to ", { text: "speak Japanese?", as: "accent" }],
      blocks: [
        { t: "p", text: "For the degree itself: often no. A substantial and growing number of programmes, particularly at master's level and in the sciences, are taught entirely in English, and those programmes do not require Japanese for admission." },
        { t: "p", text: "For everything around the degree: yes, and more than you expect. Japan is a country where daily life runs in Japanese — the city office where you register your address, the bank, the mobile contract, the lease, the part-time job. English is more common than it used to be and less common than most students assume." },
        { t: "pull", text: "Your course is perhaps fifteen hours a week. Your life is the other hundred and fifty. Japanese is the difference between visiting Japan and living in it." },
        { t: "p", text: "Where Japanese IS required for admission, the level is normally evidenced through the Japanese-Language Proficiency Test, and the level expected differs by university, faculty and programme. Some universities run a preparatory year of intensive Japanese before degree study begins. Confirm the exact requirement with the institution rather than assuming from what somebody else was asked for." },
        {
          t: "warn",
          tag: "Worth knowing",
          text: "Language schools and degree programmes are different things with different immigration treatment. A Japanese language course is a legitimate route into Japan and often a sensible first step — but it is not the same status as a university place, and it is not automatically a path to one.",
        },
        { t: "quip", text: "Hiragana and katakana take a fortnight. Kanji takes the rest of your life. Start the fortnight now — being able to read a station name changes your first month completely." },
      ],
    },

    {
      id: "apply",
      label: "How to apply",
      head: ["How to ", { text: "apply", as: "accent" }],
      blocks: [
        { t: "p", text: "There is no single national application portal of the kind the UK or Australia use. You apply to universities individually, and the route depends on the programme and the language of instruction." },
        {
          t: "roadmap",
          items: [
            "Decide the language of instruction first. It determines every step after it.",
            "Shortlist programmes, not just universities — Japanese admission is faculty by faculty.",
            "Check whether the programme uses the Examination for Japanese University Admission for International Students, and when it is held.",
            "Prepare academic transcripts and certificates, with certified translations where asked for.",
            "Sit the language and admission tests the programme requires.",
            "Submit each application to each university, on its own deadline and in its own format.",
            "Receive the offer, then let the university apply for your Certificate of Eligibility.",
            "Apply for the student visa at the embassy once the Certificate is issued.",
            "Arrange accommodation, insurance and your first month's money before you fly.",
          ],
        },
        { t: "p", text: "The Examination for Japanese University Admission for International Students — usually shortened to EJU — is the test many undergraduate programmes use in place of the domestic entrance examination. It is held at centres inside and outside Japan, and which subjects you sit depends on the faculty you are applying to. Not every programme uses it, and English-taught programmes frequently do not." },
        { t: "quip", text: "Every university has its own portal, its own document list, its own deadline and its own opinion about how a transcript should be certified. Keep a spreadsheet. This is not optional advice." },
      ],
    },

    {
      id: "scholarships",
      label: "Scholarships",
      head: ["Scholarships for ", { text: "international students", as: "accent" }],
      blocks: [
        { t: "p", text: "Japan funds international students more actively than most countries, through three broadly separate routes." },
        { t: "p", text: "The Japanese government scholarship, administered through the Ministry of Education, Culture, Sports, Science and Technology, is the best known. It can be applied for through a Japanese embassy or through a university that has been allocated places, and it covers study at undergraduate, master's and doctoral level as well as research student status. What it provides, who is eligible and when applications open are all set per cycle." },
        { t: "p", text: "The Japan Student Services Organization administers a separate scholarship for privately financed international students already studying in Japan, alongside a great deal of the practical support infrastructure — accommodation guidance, insurance guidance and the statistics everyone else quotes." },
        { t: "p", text: "University awards are the third route and the one students most often overlook. Many institutions offer their own tuition reductions and stipends for international students, some of them substantial, decided on academic record, on admission performance or on financial need. Which of them you are actually eligible for depends on your profile, and working that out is a large part of what we do." },
        {
          t: "warn",
          tag: "Check the source",
          hard: true,
          text: "Scholarship benefits, eligibility and application windows are revised between cycles, and the embassy route and the university route have different deadlines in the same year.",
          more: "Confirm the current position with MEXT and JASSO before planning a budget around any of it.",
        },
      ],
    },

    {
      id: "money",
      label: "Money",
      head: ["What it ", { text: "costs", as: "accent" }],
      blocks: [
        { t: "p", text: "Two numbers decide a Japanese budget, and only one of them is tuition." },
        { t: "p", text: "Tuition depends first on which of the three university groups you are in — national, public or private — and then on the faculty, with medicine and dentistry in a category of their own. National universities are set on a common basis and are the most predictable; private tuition varies widely between institutions." },
        { t: "p", text: "Living costs depend on the city, and the spread between Tokyo and a regional university town is large enough to change which programme is affordable. Rent is the biggest line, followed by food and transport. Japan's rental customs also add costs that do not exist in most countries — deposits, key money paid to the landlord and not returned, agency fees, and in many cases a guarantor or a guarantor company. University dormitories avoid most of that and are the reason to apply for one early." },
        {
          t: "checks",
          two: true,
          items: [
            "Tuition, and whether it is charged per year or per term",
            "Admission fee, usually one-off and payable on acceptance",
            "Rent, plus deposit, key money and agency fees",
            "National health insurance enrolment",
            "Food, transport and a commuter pass",
            "Study materials, and a laptop that meets the programme's needs",
          ],
        },
        { t: "quip", text: "The commuter pass is the one genuinely cheap thing. Students consistently over-budget transport and under-budget the move-in costs on an apartment." },
      ],
    },

    {
      id: "visa",
      label: "Student visa",
      head: ["Your ", { text: "student visa", as: "outline" }],
      blocks: [
        { t: "p", text: "Japan's student route has a step most countries do not, and it is the one that catches people out on timing: the university applies for your Certificate of Eligibility before you apply for the visa." },
        {
          t: "roadmap",
          items: [
            "Accept an offer from a school or university in Japan.",
            "The institution applies to the regional immigration bureau for your Certificate of Eligibility.",
            "The Certificate is issued and sent to you.",
            "You apply for the student visa at a Japanese embassy or consulate, with the Certificate.",
            "You travel, and receive a residence card on arrival at the airport.",
            "You register your address at the local municipal office within the required period.",
            "You enrol in national health insurance and, if you intend to work, apply for permission to do so.",
          ],
        },
        { t: "p", text: "The Certificate of Eligibility stage is why Japanese applications need to start earlier than students expect. It is processed by immigration, not by the university, and the time it takes is outside anybody's control." },
        {
          t: "warn",
          tag: "We are honest about this",
          text: "Immigration decisions are made by the Japanese authorities. We help you understand the process and prepare the documentation carefully — not predict the outcome.",
        },
      ],
    },

    {
      id: "work",
      label: "Working while studying",
      head: ["Working ", { text: "while studying", as: "accent" }],
      blocks: [
        { t: "p", text: "A student status of residence does not by itself allow you to work. Permission to engage in an activity other than that permitted under your status has to be applied for separately — it can be done at the airport on arrival, which is by far the easiest moment to do it — and once granted it allows part-time work up to a weekly cap, with longer hours permitted during official university holiday periods." },
        { t: "p", text: "The cap, the holiday allowance and the categories of work that are excluded are all set by immigration policy and are worth confirming rather than assuming. What does not change is the principle: the work is permitted because you are a student, and the study comes first." },
        { t: "pull", text: "Part-time work in Japan will improve your Japanese faster than any class. It will not pay your tuition. Plan the budget as though it does not exist and treat what you earn as the margin." },
      ],
    },

    {
      id: "life",
      label: "Life in Japan",
      head: ["Life as an ", { text: "international student", as: "accent" }],
      blocks: [
        { t: "p", text: "The practical things are unusually easy. Public transport is punctual and comprehensive, crime is low, healthcare is good and the insurance system is straightforward once you are enrolled, and convenience stores genuinely are a way of life rather than a joke about one." },
        { t: "p", text: "The social things take longer. Japanese university life runs substantially through circles and clubs, and joining one is the single most effective thing an international student can do in the first month — more effective than any language class, because it puts you in a room where Japanese is the medium rather than the subject." },
        { t: "p", text: "The seasons are a bigger part of daily life than students from Nepal expect. Summers are hot and humid, winters vary enormously between Kyushu and Hokkaido, and the academic calendar is built around a spring that the whole country pays attention to." },
        { t: "quip", text: "Two things every student says afterwards. You will be politely corrected on how to sort your rubbish. And you will miss the convenience stores more than you expect to." },
      ],
    },

    {
      id: "myths",
      label: "Myths",
      head: ["Japan myths we hear ", { text: "all the time", as: "accent" }],
      blocks: [
        {
          t: "myths",
          items: [
            {
              myth: "You cannot study in Japan without fluent Japanese.",
              truth: "A substantial number of degrees are taught entirely in English, particularly at master's level. Japanese is for your life, not necessarily for your degree.",
            },
            {
              myth: "Japan is unaffordable.",
              truth: "Tokyo is expensive. National universities outside the capital are among the better-value research educations anywhere, and the scholarship routes are real.",
            },
            {
              myth: "Everything starts in April, so I have missed it.",
              truth: "The traditional year starts in April, but many English-taught programmes run an autumn intake specifically for international students.",
            },
            {
              myth: "You cannot work as a student.",
              truth: "You can, once you hold the separate permission — which you can apply for on arrival at the airport.",
            },
            {
              myth: "Japanese universities do not want international students.",
              truth: "The government funds a scholarship programme, an entire support organisation and a dedicated admission examination for them. The intent is not subtle.",
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
              q: "Should I do a language school first, or apply straight to a degree?",
              a: "It depends on the language of instruction. For an English-taught degree, apply directly. For a Japanese-taught degree without the language yet, a preparatory year is the normal route — but treat it as a step with its own application, not as an automatic entry.",
            },
            {
              q: "How far ahead should I start?",
              a: "Earlier than for most countries, because of the Certificate of Eligibility. Work backwards from the intake and add the immigration processing time on top of the university's own deadline.",
            },
            {
              q: "Is the EJU compulsory?",
              a: "No. It is used by many Japanese-taught undergraduate programmes and frequently not used at all by English-taught ones. Check the specific programme.",
            },
            {
              q: "Can my family come with me?",
              a: "Dependants have their own status of residence with its own requirements and its own evidence of funds. It is possible and it is a separate application — plan it as one.",
            },
            {
              q: "What happens after I graduate?",
              a: "Japan has routes for graduates to move into work or job-seeking status, and the rules are set by immigration policy rather than by the university. It is worth understanding them before you choose a programme, not after.",
            },
          ],
        },
      ],
    },

    {
      id: "roadmap",
      label: "Your roadmap",
      head: ["Your Japan application ", { text: "roadmap", as: "outline" }],
      blocks: [
        {
          t: "roadmap",
          items: [
            "Decide English-taught or Japanese-taught. Everything follows from this.",
            "Pick the intake — April or autumn — and work backwards from it.",
            "Shortlist programmes by faculty and by research group, not by ranking.",
            "Start Japanese now, whatever the language of instruction.",
            "Prepare transcripts, certificates and certified translations.",
            "Sit the tests the programme requires.",
            "Apply to each university on its own terms and its own deadline.",
            "Accept the offer, then wait on the Certificate of Eligibility.",
            "Apply for the visa, arrange the dormitory, budget the move-in costs.",
            "Arrive, register your address, enrol in insurance, apply for work permission.",
            "Join a circle in the first month. It matters more than it sounds.",
          ],
        },
      ],
    },
  ],

  cta: {
    head: "Ready to look at Japan properly?",
    text: "Start with a conversation — we will help you compare programmes, languages of instruction and intakes.",
  },
};
