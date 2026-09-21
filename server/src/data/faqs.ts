/**
 * What the Lakehead assistant knows.
 *
 * ------------------------------------------------------------------
 * IT LIVES ON THE SERVER, and that is the point of the arrangement. The
 * client never receives this file — it posts a question to /assistant/ask and
 * renders whatever comes back. So the knowledge base can grow, be corrected
 * or be re-worded without shipping a new front end, and none of the matching
 * logic is visible to anybody poking at the browser.
 *
 * WRITTEN IN LAKEHEAD'S VOICE, NOT LIFTED. The source material for the first
 * two dozen of these was another consultancy's FAQ page and still named them
 * throughout — their office, their Facebook page, their programmes, a
 * testimonial from a student who is not ours. None of that is here. The
 * substance is kept, the words are ours, and every "we" means Lakehead.
 * See the note on CREDENTIALS in the study-abroad page for the same rule.
 *
 * NO FIGURE HERE IS ASSERTED AS CURRENT. Fees, processing times and baggage
 * limits move on somebody else's schedule — the boards', the embassies', the
 * airlines' — so where a number genuinely helps, it is framed as indicative
 * and paired with "check the current position". The one number that was in
 * the source and is simply wrong (a 32kg cabin bag, which is a checked-bag
 * limit) has been removed rather than softened: a student who packs to it
 * pays for it at the gate.
 *
 * NOTHING PROMISES AN OUTCOME. Every page on this site is careful never to
 * predict a visa decision, and an assistant is the easiest place in the world
 * to slip. Answers about visas say what the process is and who decides it.
 *
 * NO OFFICE HOURS OR EMAIL ADDRESSES ARE QUOTED, deliberately: those are
 * still marked as placeholders in client/src/config/contact.ts. Anything
 * needing them points at /contact, which reads the real values.
 * ------------------------------------------------------------------
 */

export type FaqTopic =
  | "Getting started"
  | "Choosing a course"
  | "Passports & visas"
  | "Money"
  | "Applying"
  | "Before you go"
  | "Life abroad"
  | "About Lakehead";

export interface Faq {
  id: string;
  /** The canonical phrasing, shown as a suggestion and above the answer. */
  question: string;
  /**
   * Hand-picked, high-signal terms — the matcher weights these heaviest.
   *
   * WRITE THE WORDS A STUDENT WOULD USE, not the words in the question. A
   * question titled "What is a Certificate of Eligibility" is asked as "coe",
   * and one about money is asked as "expensive". Multi-word entries are
   * matched as phrases and score higher than their parts, which is what stops
   * "work" alone from claiming the post-study-work answer.
   */
  keywords: string[];
  answer: string;
  /**
   * A short second bubble, sent a beat after the answer.
   *
   * WHAT IT IS FOR: the thing a counsellor would say next. Usually the
   * question behind the question — somebody asking what a visa is is about
   * to ask whether theirs will be hard to get. Keep it to one or two
   * sentences; anything longer belongs in `answer`, and an entry with
   * nothing useful to add should simply not have one.
   */
  followUp?: string;
  /** Where to send someone who wants the long version. */
  link?: { label: string; to: string };
  topic: FaqTopic;
}

export const FAQS: Faq[] = [
  /* ---------- Getting started ---------- */
  {
    id: "why-study-abroad",
    question: "Why should I study abroad?",
    keywords: [
      "why study abroad", "why go abroad", "worth it", "benefits", "advantage",
      "point of studying abroad", "should i study abroad", "reasons",
    ],
    answer:
      "Because the learning does not stop at the classroom door. You pick up a qualification, but you also pick up another culture from the inside, often another language, and a way of looking at problems that is hard to acquire without leaving home. Most students tell us afterwards that the part that changed them was not the degree — it was managing a life somewhere unfamiliar and finding they could. It is a genuine stretch, and that is rather the point.",
    followUp:
      "If you have a country in mind already, tell me which and I will say what it is actually like to study there.",
    link: { label: "Where we place students", to: "/study-abroad" },
    topic: "Getting started",
  },
  {
    id: "employability",
    question: "Will studying abroad help me get a job afterwards?",
    keywords: [
      "job", "employability", "employer", "career", "hire", "cv", "resume",
      "after i graduate", "job prospects", "work after study", "recruiters",
    ],
    answer:
      "It helps, and employers are fairly specific about why. What they tend to value is not the stamp on the degree but what you had to do to get it — working across cultures, making yourself understood in a second language, adapting when things do not go to plan. Those show up on a CV as international experience and in an interview as composure. It is not a guarantee of a job; very little is. It is a genuine advantage.",
    followUp:
      "Worth knowing that post-study work rights differ a lot by country — ask me about those if that is part of the plan.",
    link: { label: "Choosing the right course", to: "/services/admission-guidance" },
    topic: "Getting started",
  },
  {
    id: "when-to-start",
    question: "When should I start planning?",
    keywords: [
      "when should i start", "how early", "planning", "timeline", "how long before",
      "start preparing", "when to begin", "lead time",
      /* "…start the process" was being taken by the how-do-I-apply entry,
         which owns the word `process`. This is the timing question. */
      "start the process", "when to start the process", "how soon",
    ],
    answer:
      "Earlier than most people expect — as a rule, start at least one full intake ahead of the one you want to join. There are a great many programmes out there and they differ in country, length, language, cost and entry requirements, so finding the one that actually fits you takes time. Starting early is also what leaves room for a test to be re-sat or a document to be re-issued without losing the intake.",
    followUp:
      "If you tell me which intake you are aiming for, I can tell you whether it is realistic from where you are now.",
    link: { label: "Talk to a counsellor", to: "/contact" },
    topic: "Getting started",
  },
  {
    id: "talk-to-parents",
    question: "How do I talk to my parents about studying abroad?",
    keywords: [
      "parents", "family", "convince", "mother", "father", "guardian",
      "talk to my parents", "they are worried", "permission",
    ],
    answer:
      "Bring them with you. Honestly — the conversation goes better when they can ask their questions directly rather than through you, and they will have good ones: who we are, where you would go, what it costs, what happens if something goes wrong. You are welcome to sit down with a counsellor together, and plenty of families do exactly that before anything is decided.",
    followUp:
      "Most of what they will want to know is on this site already — costs, countries and what we actually do. Ask me and I will point you at it.",
    link: { label: "Book a time to come in", to: "/contact" },
    topic: "Getting started",
  },

  /* ---------- Choosing a course ---------- */
  {
    id: "choose-programme",
    question: "How do I choose the right programme?",
    keywords: [
      "choose", "which course", "which programme", "right program", "decide",
      "what should i study", "pick a course", "suitable", "which university",
      "which country", "where should i go",
    ],
    answer:
      "Start with an honest look at three things: your academic record as it actually is, what you want to be doing in five years, and what your family can fund. A shortlist built from those tends to be shorter and much better than one built from rankings. That is the conversation a first counselling session is for — we will tell you where you are competitive and where you are not.",
    followUp:
      "If it helps, tell me your subject and roughly your grades, and I will tell you which destinations are worth a look.",
    link: { label: "How we help you choose", to: "/services/admission-guidance" },
    topic: "Choosing a course",
  },
  {
    id: "countries",
    question: "Which countries do you work with?",
    keywords: [
      "which countries", "countries", "destinations", "where can i go", "what countries",
      "australia", "canada", "uk", "usa", "america", "new zealand", "korea", "europe",
      "germany", "list of countries",
    ],
    answer:
      "We place students in the UK, the United States, Canada, Australia, New Zealand, South Korea and across Europe, and each one has a full guide on the site covering universities, costs, scholarships and the visa route. If the country you have in mind is not on that list, still ask — we apply well beyond the places we have written up.",
    followUp:
      "Each one has a full guide on the site. Say the word and I will take you straight to it.",
    link: { label: "All destination guides", to: "/study-abroad" },
    topic: "Choosing a course",
  },
  {
    id: "credit-transfer",
    question: "Can I transfer credits from my studies in Nepal?",
    keywords: [
      "credit transfer", "transfer credits", "credits", "exemption", "advanced standing",
      "previous study", "rpl", "semester transfer", "will my credits count",
    ],
    answer:
      "Often, yes — credits already earned here can sometimes count toward a major, a minor or general requirements abroad. It is decided institution by institution rather than country by country, so the same transcript can be accepted in one place and declined in another. Bring your transcript and course outlines to a counsellor and we will find out which of your shortlist will recognise them.",
    followUp:
      "Bring the course outlines as well as the transcript — that is what an institution actually assesses, and it speeds the answer up considerably.",
    link: { label: "Admission guidance", to: "/services/admission-guidance" },
    topic: "Choosing a course",
  },
  {
    id: "entry-requirements",
    question: "What grades or GPA do I need?",
    keywords: [
      "gpa", "grades", "percentage", "marks", "requirement", "eligibility",
      "what score do i need", "minimum", "cgpa", "qualify", "am i eligible",
    ],
    answer:
      "It varies a great deal — by country, by university and by the specific programme, and a course can want a higher grade in one subject than in your overall average. Rather than quote a number that may not apply to you, bring your marksheet in and we will tell you plainly which of your choices you are competitive for. If you want to see where your GPA lands as a percentage first, there is a calculator on the site.",
    followUp:
      "If your marksheet is in GPA and the form wants a percentage, there is a calculator on the site that shows its working.",
    link: { label: "GPA to percentage calculator", to: "/resources/gpa-to-percentage-calculator" },
    topic: "Choosing a course",
  },
  {
    id: "study-gap",
    question: "Does a study gap affect my chances?",
    keywords: [
      "study gap", "gap year", "gap", "break in studies", "years off",
      "backlog", "old marksheet", "left studies",
    ],
    answer:
      "A gap is not a bar in itself, and plenty of students with one are admitted every intake. What matters is being able to account for it — work, family responsibilities, a business, further study. Different countries take different views on how long a gap they are comfortable with, so it is worth raising early rather than at the visa stage.",
    followUp:
      "If you have been working during the gap, keep any letters or contracts — they are the evidence that makes it a non-issue.",
    link: { label: "Talk it through", to: "/contact" },
    topic: "Choosing a course",
  },
  {
    id: "intakes",
    question: "When are the intakes?",
    keywords: [
      "intake", "intakes", "when can i start", "semester", "january intake",
      "september intake", "fall", "spring", "admission dates", "deadline",
    ],
    answer:
      "Most of our destinations run two or three intakes a year, and the exact months differ by country and often by university. The intake you should aim for is usually the one that leaves you enough time for the test, the application and the visa without rushing any of them — which is often not the next one. A counsellor can map the dates against where you are now.",
    link: { label: "Ask about intake dates", to: "/contact" },
    topic: "Choosing a course",
  },

  /* ---------- Tests ---------- */
  {
    id: "which-test",
    question: "Which English test should I take — IELTS, PTE or TOEFL?",
    keywords: [
      "ielts", "pte", "toefl", "duolingo", "english test", "which test",
      "language test", "sat", "english exam", "test preparation", "coaching",
    ],
    answer:
      "Take the one your universities and your visa route actually accept, which is a question worth settling before you book anything — sitting the wrong test is more common than you would think. IELTS is the most widely accepted, PTE is computer-marked with quick results and is popular for Australia, TOEFL is strong for the United States. We prepare students for all of them, and we will help you pick.",
    followUp:
      "Once you have picked one, we run preparation for all of them, timed so a poor first result is still recoverable.",
    link: { label: "Test preparation", to: "/services/test-preparation" },
    topic: "Choosing a course",
  },
  {
    id: "test-score-needed",
    question: "What IELTS or PTE score do I need?",
    keywords: [
      "band score", "what band", "ielts score", "pte score", "6.5", "7 bands",
      "minimum score", "english requirement", "score needed",
    ],
    answer:
      "Each university sets its own, and the visa route for your country may set a separate one on top — so the honest answer is that it depends on your shortlist. If you already have your four skill bands and want your overall, or you hold a PTE score and need to know what it compares to in IELTS, there are calculators on the site that show their working.",
    followUp:
      "Tell me the country and level you are aiming at and I can be more specific about what is usually asked for.",
    link: { label: "IELTS band calculator", to: "/resources/ielts-band-score-calculator" },
    topic: "Choosing a course",
  },
  {
    id: "test-waiver",
    question: "Can I study abroad without IELTS?",
    keywords: [
      "without ielts", "no ielts", "waiver", "exemption", "skip ielts",
      "medium of instruction", "moi", "english waiver",
    ],
    answer:
      "Sometimes. Some institutions accept a medium-of-instruction letter, an internal test, or your school English marks in place of a formal test — but a visa office may still want one even where a university does not, and that catches people out. Ask before you assume it, and we will check the position for the specific places you are applying to.",
    link: { label: "Ask a counsellor", to: "/contact" },
    topic: "Choosing a course",
  },

  /* ---------- Passports & visas ---------- */
  {
    id: "what-is-passport",
    question: "What is a passport and do I need one?",
    keywords: [
      "passport", "what is a passport", "need a passport", "travel document",
    ],
    answer:
      "It is your international proof of identity and nationality, and yes — nobody travels internationally without one. If you do not hold one yet, start that now rather than later: it is also the document your visa is issued into, so everything downstream waits on it.",
    topic: "Passports & visas",
  },
  {
    id: "passport-when",
    question: "When should I apply for my passport?",
    keywords: [
      "apply for passport", "when passport", "passport application", "get a passport",
      "how long passport", "passport time",
      /* Without these, "how long does a passport take" was won by the
         how-long-is-the-whole-process entry on the phrase "how long". */
      "how long does a passport take", "passport processing time",
      "passport delay", "passport take",
    ],
    answer:
      "Today, if you have not already. Issuing takes a few weeks in the ordinary course and the visa application cannot begin without it, so it is the single easiest thing to be blocked by. You can apply from your home district or in Kathmandu. Processing times do change, so check the current position with the passport department rather than relying on what a friend experienced last year.",
    topic: "Passports & visas",
  },
  {
    id: "what-is-visa",
    question: "What is a visa and will I need one?",
    keywords: [
      "what is a visa", "visa", "student visa", "need a visa", "permit",
      "study permit",
    ],
    answer:
      "A visa is the permission a country gives you to enter and stay for a set purpose and period — for you, to study. It is placed in your passport, and yes, you will need one for any full-length programme in every destination we work with. Some short summer courses are the exception.",
    followUp:
      "The part that catches people out is timing rather than difficulty. Ask me how long the whole process takes if you are working to a deadline.",
    link: { label: "Visa guidance", to: "/services/visa-guidance" },
    topic: "Passports & visas",
  },
  {
    id: "visa-difficulty",
    question: "Are student visas hard to get?",
    keywords: [
      "hard to get", "difficult", "visa difficult", "chances", "success rate",
      "easy visa", "rejection rate", "how tough",
    ],
    answer:
      "It depends almost entirely on the country. Some routes are quick and largely administrative; others take months, cost a good deal and want documents that themselves take time to obtain. What is true everywhere is that a well-prepared, internally consistent file is the part you control — and the decision itself belongs to the government concerned, not to us.",
    followUp:
      "The single biggest thing in your control is a file that is complete and consistent. That is the part we do with you.",
    link: { label: "How we help with visas", to: "/services/visa-guidance" },
    topic: "Passports & visas",
  },
  {
    id: "visa-where",
    question: "Where do I apply for the visa?",
    keywords: [
      "where do i apply", "embassy", "consulate", "visa office", "apply visa",
      "submit", "submit visa", "where to submit", "vfs", "lodge",
    ],
    answer:
      "Through the embassy or consulate of the country you are going to, and the route differs by destination — some accept applications in Kathmandu, some are handled through a regional office abroad with your documents sent by an authorised courier, and a few require you to attend in person. We will tell you which applies to your country and prepare the file with you.",
    link: { label: "Visa guidance", to: "/services/visa-guidance" },
    topic: "Passports & visas",
  },
  {
    id: "visa-refused",
    question: "What happens if my visa is refused or delayed?",
    keywords: [
      "refused", "rejected", "denied", "refusal", "visa not issued", "delayed",
      "what if visa", "reapply", "appeal",
    ],
    answer:
      "It does happen, and we will not pretend otherwise. Visas are issued by consular officials and neither we nor your university has any say in the decision. If it goes against you through no fault of your own, we work through it with you — usually that means deferring to a later intake or looking at an alternative programme, and where a refusal can be answered we help you prepare a stronger file. What we will never do is tell you a decision is certain before it is made.",
    followUp:
      "If this has already happened to you, bring the refusal letter to a counsellor — what it says determines what can be done next.",
    link: { label: "Talk to us about it", to: "/contact" },
    topic: "Passports & visas",
  },
  {
    id: "visa-guarantee",
    question: "Can you guarantee me a visa?",
    keywords: [
      "guarantee", "guaranteed visa", "sure visa", "100%", "promise",
      "assured", "confirm visa",
    ],
    answer:
      "No, and you should be wary of anyone who says they can. A visa is a government decision made on your file, and no consultancy anywhere has the power to promise one. What we can do is make sure your application is accurate, complete and consistent, that you understand what is being asked and why, and that nothing goes in that we have not checked with you.",
    followUp:
      "If anybody has promised you a visa, that is worth being wary of. Ask us anything you have been told and we will tell you straight.",
    link: { label: "How we work", to: "/services/visa-guidance" },
    topic: "Passports & visas",
  },
  {
    id: "visa-interview",
    question: "Will there be a visa interview?",
    keywords: [
      "interview", "visa interview", "questions asked", "embassy interview",
      "credibility interview", "prepare interview",
    ],
    answer:
      "For some countries, yes — and where there is one it usually turns on whether you can explain your own choices: why this course, why this university, how it is funded and what you intend afterwards. We run practice sessions for the routes that interview. The advice that matters most is simple: know your own file, and answer honestly.",
    link: { label: "Visa guidance", to: "/services/visa-guidance" },
    topic: "Passports & visas",
  },
  {
    id: "noc",
    question: "Do I need a No Objection Certificate?",
    keywords: [
      "noc", "no objection certificate", "ministry of education", "moe",
      "certificate from government",
    ],
    answer:
      "Students leaving Nepal for study generally need one from the Ministry of Education, and it is usually asked for alongside your offer and your financial documents. It is a step we handle with you as part of the documentation, so it does not become the thing that holds up your departure.",
    link: { label: "Ask about documentation", to: "/contact" },
    topic: "Passports & visas",
  },

  /* ---------- Money ---------- */
  {
    id: "passport-visa-cost",
    question: "How much do the passport and visa cost?",
    keywords: [
      "cost", "how much", "fee", "fees", "price", "passport cost", "visa fee",
      "expensive", "charges", "application fee",
    ],
    answer:
      "The passport is a fixed government fee, higher if you want it faster. Visa fees vary widely by destination, and the fee itself is rarely the whole cost — many applications also need documents translated, notarised or legalised, and each of those carries its own charge. Rates change, so ask a counsellor for the current figures for your country rather than budgeting from an old number.",
    followUp:
      "Budget for the translations and notarisations as well as the fees themselves — they are small individually and add up.",
    link: { label: "Ask about costs", to: "/contact" },
    topic: "Money",
  },
  {
    id: "tuition-when",
    question: "When do I have to pay the tuition fee?",
    keywords: [
      "tuition", "when to pay", "pay fees", "payment", "deposit", "advance",
      "pay before visa", "fee payment",
    ],
    answer:
      "That depends on the country, and the two patterns are opposite. Some routes — New Zealand and the UK among them — want the fee, or part of it, paid to secure your place before the visa is applied for. Others, the United States commonly, expect the visa first and payment afterwards. We will tell you which order applies to you before you commit anything.",
    link: { label: "Ask about your country", to: "/contact" },
    topic: "Money",
  },
  {
    id: "living-costs",
    question: "How much money will I need to live on?",
    keywords: [
      "living costs", "spending money", "how much money", "monthly expenses",
      "budget", "cost of living", "expenses", "pocket money", "survive",
    ],
    answer:
      "It depends heavily on the city and on how you live — the gap between a capital and a regional university town is large enough to change which programme is affordable. Whatever the figure, carry enough for your first few weeks in case a local bank account takes time to open. A counsellor can give you a realistic monthly range for the specific place you are going.",
    followUp:
      "The city matters more than the country here. Tell me where you are looking and I can be more useful.",
    link: { label: "Ask for a realistic budget", to: "/contact" },
    topic: "Money",
  },
  {
    id: "financial-proof",
    question: "How much do I need to show in the bank?",
    keywords: [
      "bank balance", "financial proof", "funds", "sponsor", "income source",
      "bank statement", "show money", "proof of funds", "financial documents",
    ],
    answer:
      "Every student route asks you to show you can pay for tuition and living costs, and each country sets its own figure and its own rules about whose money counts, how long it must have been held and what evidence of its source is needed. Those rules change, so this is one to check with a counsellor for your destination rather than work from a number someone quoted you.",
    followUp:
      "Start this early. The rules about how long money must have been held are what turn a fixable problem into a missed intake.",
    link: { label: "Ask about financial documents", to: "/contact" },
    topic: "Money",
  },
  {
    id: "scholarships",
    question: "Are there scholarships available?",
    keywords: [
      "scholarship", "scholarships", "funding", "financial aid", "grant",
      "fee waiver", "discount", "free study", "bursary",
    ],
    answer:
      "Yes, and more of them than most students look for — university merit awards, country scholarship schemes and programme-specific funding all exist. What they have in common is early deadlines and real competition. We will tell you which ones you could realistically win rather than the full list, because a shortlist you can actually pursue is worth more than a long one.",
    followUp:
      "Deadlines for these are often months before the course starts, so it is worth asking about them at your first session rather than your last.",
    link: { label: "Scholarship guidance", to: "/study-abroad" },
    topic: "Money",
  },
  {
    id: "education-loan",
    question: "Can I take an education loan?",
    keywords: [
      "loan", "education loan", "bank loan", "finance", "borrow", "emi",
      "loan for study",
    ],
    answer:
      "Education loans are commonly used for study abroad and most major banks here offer them. What a lender wants and what a visa office accepts as evidence of funds are not always the same thing, though, which is worth understanding before you arrange anything. Bring your plan to a counsellor and we will look at it alongside your visa requirements.",
    link: { label: "Ask about funding", to: "/contact" },
    topic: "Money",
  },
  {
    id: "consultancy-fees",
    question: "Do you charge for counselling?",
    keywords: [
      "your fees", "do you charge", "consultancy fee", "service charge",
      "free counselling", "commission", "what do you cost",
    ],
    answer:
      "The first counselling session is where we work out whether we can help you at all, and you should come to it without worrying about a bill. What any particular service costs depends on what you need, and a counsellor will set it out plainly before anything starts — no charge appears that you have not agreed to. We are also open that partner institutions pay us a commission, which is why your shortlist is built from your profile first and the partner list checked afterwards.",
    link: { label: "Talk to us", to: "/contact" },
    topic: "About Lakehead",
  },
  {
    id: "banking-abroad",
    question: "How do I manage money once I am abroad?",
    keywords: [
      "bank account", "banking", "debit card", "atm", "exchange money",
      "currency", "transfer money", "open account",
    ],
    answer:
      "Most students do one of two things: use a debit card from their bank here — checking the ATM and foreign-transaction charges first, which can be significant — or open a local account after they arrive. Opening one locally often needs an address and a student ID, so it can take a couple of weeks. Carry enough to cover that gap comfortably.",
    topic: "Money",
  },

  /* ---------- Applying ---------- */
  {
    id: "how-to-apply",
    question: "How do I apply through Lakehead?",
    keywords: [
      "how to apply", "apply", "process", "steps", "get started", "procedure",
      "start application", "what is the process", "how does it work",
    ],
    answer:
      "Come and talk to us first — there is no form to fill in before that. A counsellor goes through your academic record, your budget and what you want out of it, and from that you get a shortlist worth applying to. After that we handle the applications, the documents and the visa file with you, step by step. You can book a time on the contact page, or message us on WhatsApp if that is easier.",
    followUp:
      "You do not need anything prepared for a first conversation — bring your marksheets if you have them and we will go from there.",
    link: { label: "Book a counselling session", to: "/contact" },
    topic: "Applying",
  },
  {
    id: "documents",
    question: "What documents will I need?",
    keywords: [
      "documents", "paperwork", "what to bring", "certificates", "transcript",
      "marksheet", "checklist", "required documents",
    ],
    answer:
      "The core of it is your academic records — marksheets, transcripts and certificates — your passport, your English test result and your financial documents. Beyond that it varies by country and by university, and some need translating or notarising, which takes time. Bring what you have to a first session and we will give you the exact list for your shortlist.",
    followUp:
      "If anything needs translating or notarising, that is the part that takes time. Ask a counsellor early which of yours will.",
    link: { label: "Admission guidance", to: "/services/admission-guidance" },
    topic: "Applying",
  },
  {
    id: "offer-letter",
    question: "What is an offer letter, CAS, COE or I-20?",
    keywords: [
      "offer letter", "cas", "coe", "i20", "i-20", "confirmation of enrolment",
      "unconditional offer", "conditional offer", "admission letter",
    ],
    answer:
      "They are all the same idea under different names: the document your university issues confirming you have a place, which the visa application is then built on. The UK calls it a CAS, Australia a CoE, the United States an I-20. An offer may be conditional — meaning there is still something to satisfy, usually a grade or a test score — before it becomes the version your visa needs.",
    link: { label: "Admission guidance", to: "/services/admission-guidance" },
    topic: "Applying",
  },
  {
    id: "how-long-process",
    question: "How long does the whole process take?",
    keywords: [
      "how long", "duration", "timeline", "how much time", "total time",
      "process time", "when will i go",
    ],
    answer:
      "From first conversation to departure is usually several months, and occasionally longer. The parts that take the longest are rarely the ones people expect — the test, the document that has to be re-issued, and the visa processing at the end are what set the pace, not the application itself. Which is the whole argument for starting a full intake earlier than you think you need to.",
    link: { label: "Ask about your timeline", to: "/contact" },
    topic: "Applying",
  },

  /* ---------- Before you go ---------- */
  {
    id: "luggage",
    question: "How much luggage can I take?",
    keywords: [
      "luggage", "baggage", "how much can i take", "suitcase", "cabin bag",
      "carry on", "hand luggage", "weight limit", "allowance",
    ],
    answer:
      "Your allowance is set by the airline and is printed on your ticket — cabin and checked limits differ a good deal between carriers, so check yours rather than a general figure. One piece of advice that holds everywhere: keep a change of clothes, a towel and your toiletries in your cabin bag. Access to checked luggage is sometimes restricted during arrival and orientation, and you will be glad of them.",
    followUp:
      "Airlines differ more than you would expect, so check the allowance on your own ticket rather than a general figure.",
    topic: "Before you go",
  },
  {
    id: "packing",
    question: "What should I pack?",
    keywords: [
      "pack", "packing", "what to bring", "clothes", "what to take",
      "packing list", "winter clothes",
    ],
    answer:
      "Read up on the climate where you are going first — students consistently under-pack for cold and over-pack for occasions that never come. Take clothes you are genuinely comfortable in rather than a new wardrobe; anything specialised is usually cheaper and better chosen once you are there. Your counsellor can give you a sensible list for your particular destination.",
    topic: "Before you go",
  },
  {
    id: "insurance",
    question: "Do I need health insurance?",
    keywords: [
      "insurance", "health cover", "medical", "health insurance", "cover",
      "family plan", "treatment", "hospital",
    ],
    answer:
      "Yes, and in most destinations it is a condition of the visa rather than an option. A family medical plan from here will rarely be accepted or useful abroad — the point of the local cover is that you can be treated quickly, where you are, without paying up front. It is one of the things we sort out with you before departure.",
    followUp:
      "It is usually a visa condition rather than an optional extra, so treat it as part of the cost from the start.",
    link: { label: "Pre-departure support", to: "/study-abroad" },
    topic: "Before you go",
  },
  {
    id: "medical-police",
    question: "Do I need a medical check or police clearance?",
    keywords: [
      "medical test", "health check", "police clearance", "police report",
      "chest x-ray", "tb test", "character certificate",
    ],
    answer:
      "Several destinations require a medical examination at an approved clinic, and some ask for a police clearance certificate as well. Both have to be done in a particular order and are only valid for a limited period, so doing them at the wrong moment means doing them twice. We will tell you when each one is due in your timeline.",
    link: { label: "Ask about the steps", to: "/contact" },
    topic: "Before you go",
  },
  {
    id: "arrival",
    question: "What happens when I land?",
    keywords: [
      "arrive", "arrival", "landing", "airport", "pickup", "when i land",
      "immigration", "customs", "first day",
    ],
    answer:
      "You collect your luggage, clear immigration and customs, and come out into arrivals. If you have arranged an airport pickup through your institution, someone will be waiting to take you to your accommodation and point you at orientation. If not, have your address written down and know which bus, train or taxi you are taking — the airport information desk is used to being asked.",
    topic: "Before you go",
  },
  {
    id: "accommodation",
    question: "Where will I live?",
    keywords: [
      "accommodation", "housing", "where to live", "hostel", "dormitory",
      "rent", "homestay", "room", "stay",
    ],
    answer:
      "Most students start in university accommodation or a homestay and move into shared private housing once they know the city — which is usually the sensible order. University halls are often the least complicated first step and tend to fill early, so apply as soon as your place is confirmed. We help you arrange something before you fly rather than after you land.",
    followUp:
      "University halls tend to fill early. If you have an offer, it is worth applying for a room in the same week.",
    link: { label: "Student accommodation", to: "/services/student-accommodation" },
    topic: "Before you go",
  },

  /* ---------- Life abroad ---------- */
  {
    id: "support-abroad",
    question: "Who will support me while I am abroad?",
    keywords: [
      "support", "help abroad", "who will help", "alone", "if something goes wrong",
      "student services", "someone to call",
    ],
    answer:
      "More people than you would expect. Your university has an international student office whose entire job this is, alongside academic advisers and student services. There are Nepali student associations in most of the cities we send people to. And we do not stop at the airport — if something is not going to plan, tell us and we will help you work out who to speak to.",
    topic: "Life abroad",
  },
  {
    id: "work-while-studying",
    question: "Can I work while I study?",
    keywords: [
      "work", "part time", "job while studying", "part-time work", "earn",
      "work hours", "can i work", "20 hours",
    ],
    answer:
      "Most student visas allow some part-time work, with a cap on hours during term that varies by country — and exceeding it is a visa breach, not a minor matter. Treat what you earn as margin rather than as part of the plan: part-time work will improve your language and your confidence, but it will not pay your tuition. Budget as though it does not exist.",
    followUp:
      "The hour cap is a visa condition, not a guideline — going over it puts your status at risk, so check yours before you take anything on.",
    link: { label: "Ask about your country's rules", to: "/contact" },
    topic: "Life abroad",
  },
  {
    id: "post-study-work",
    question: "Can I stay and work after I graduate?",
    keywords: [
      "post study work", "after graduation", "stay back", "psw", "opt",
      "graduate route", "work permit after", "pr", "permanent residency", "settle",
    ],
    answer:
      "Several destinations offer a post-study work route, and the length and conditions differ considerably between them — it is one of the things genuinely worth weighing when you choose a country. These rules are also revised more often than most, so check the current position rather than what applied to someone who went two years ago. Each destination guide on the site covers the route as it stands.",
    followUp:
      "These rules change more often than most, so check the current position rather than what applied to someone who went a couple of years ago.",
    link: { label: "Compare the destinations", to: "/study-abroad" },
    topic: "Life abroad",
  },
  {
    id: "rules-abroad",
    question: "Is there anything I will not be allowed to do?",
    keywords: [
      "rules", "not allowed", "restrictions", "law", "prohibited", "banned",
      "sent home", "conduct",
    ],
    answer:
      "You are bound by the law of the country you are in, and by your university's own rules and your visa's conditions — the work-hour cap being the one students most often trip over without meaning to. Beyond the formal rules, a little extra care is worth it in an unfamiliar place: you are, whether it feels like it or not, representing rather more than yourself.",
    topic: "Life abroad",
  },
  {
    id: "fitting-in",
    question: "Will I fit in? I am worried about making friends.",
    keywords: [
      "fit in", "friends", "lonely", "make friends", "social", "shy",
      "people my age", "will i fit",
    ],
    answer:
      "Almost everybody worries about this and almost nobody finds it as hard as they feared. The single most effective thing you can do in your first month is join something — a club, a society, a sports team — because it puts you in a room where you have a reason to talk to people. And remember the students around you are just as curious about where you have come from as you are about where you have landed.",
    topic: "Life abroad",
  },
  {
    id: "homesick",
    question: "Is it normal to feel homesick?",
    keywords: [
      "homesick", "miss home", "lonely", "sad", "depressed", "emotional",
      "want to come home", "missing family", "struggling",
    ],
    answer:
      "Completely normal, and so is the opposite — falling for the place so thoroughly you cannot imagine leaving. Most students feel both, sometimes in the same week. Expect the ups and downs rather than being alarmed by them, use your university's student support if a low patch lasts, and know that very few people look back on the experience as anything other than worth it. Be kind to yourself in the first month.",
    followUp:
      "Your university will have student support for exactly this, and using it early is normal rather than a last resort.",
    topic: "Life abroad",
  },
  {
    id: "visit-home",
    question: "Can I come back to Nepal for the holidays?",
    keywords: [
      "come home", "visit nepal", "holidays", "vacation", "return home",
      "go back", "multiple entry",
    ],
    answer:
      "Usually yes — student visas are generally multiple-entry, so you can travel home and return. Worth saying, though: students who spend at least one long holiday where they are studying almost always say it was the point at which the place stopped feeling foreign. Check your own visa conditions before booking anything.",
    topic: "Life abroad",
  },
  {
    id: "family-visit",
    question: "Can my family visit me?",
    keywords: [
      "family visit", "parents visit", "visitor visa", "can my family come",
      "friends visit", "graduation ceremony",
    ],
    answer:
      "They can, on a visitor visa applied for in the ordinary way. Many families choose to come for graduation, which makes for a considerably better trip than a visit in your first anxious month. They will need their own documents and their own appointment, so it is worth planning a few months ahead.",
    topic: "Life abroad",
  },
  {
    id: "dependents",
    question: "Can I take my spouse or children with me?",
    keywords: [
      "dependent", "dependants", "spouse", "wife", "husband", "children",
      "family with me", "partner", "bring my family",
    ],
    answer:
      "Some countries and some levels of study allow dependants; others have restricted or removed that in recent years, and it is an area where rules change quickly. If bringing your family matters to you, say so at the very first conversation — it can change which country and which course make sense, and that is much easier to plan for at the start than to discover later.",
    link: { label: "Talk to a counsellor", to: "/contact" },
    topic: "Life abroad",
  },
  {
    id: "travel-other-countries",
    question: "Can I travel to other countries from where I am studying?",
    keywords: [
      "travel", "other countries", "visit europe", "schengen", "trips",
      "tourism", "cross border",
    ],
    answer:
      "Generally yes, but each country you want to enter has its own entry rules for someone holding your visa — being a student in one European country, for instance, is not automatically permission to travel across all of them. Check the requirements for anywhere you plan to go before you book, and be careful that a trip does not clash with your own visa's re-entry conditions.",
    topic: "Life abroad",
  },

  /* ---------- About Lakehead ---------- */
  {
    id: "what-lakehead-does",
    question: "What can Lakehead do for me?",
    keywords: [
      "what do you do", "services", "how can you help", "what can lakehead",
      "help me", "about you", "who are you", "what you offer",
    ],
    answer:
      "We take you from the first conversation to the week after you land. That means career and course counselling, choosing universities that fit your profile and your budget, preparing and submitting the applications, test preparation, scholarship guidance, the visa documentation, and the practical business of accommodation, insurance and travel before you fly. Visa decisions themselves rest with the government concerned — everything up to that point, we do with you.",
    followUp:
      "The best place to start is a conversation — there is no form to fill in first and nothing to pay for finding out where you stand.",
    link: { label: "All our services", to: "/services" },
    topic: "About Lakehead",
  },
  {
    id: "where-are-you",
    question: "Where is your office and how do I contact you?",
    keywords: [
      "office", "address", "location", "where are you", "contact", "phone",
      "email", "visit", "branch", "kathmandu", "opening hours", "timing",
    ],
    answer:
      "Our head office is in Kamalpokhari, Kathmandu, with branches elsewhere in the country. The contact page has the addresses, the current phone numbers and a map for each, and you are welcome to walk in or book a time first. If you would rather just ask something quickly, WhatsApp reaches a counsellor.",
    link: { label: "Find us and get in touch", to: "/contact" },
    topic: "About Lakehead",
  },
  {
    id: "partner-universities",
    question: "Which universities do you have partnerships with?",
    keywords: [
      "partner", "partnership", "universities you work with", "tie up",
      "affiliated", "direct agreement", "your universities",
    ],
    answer:
      "We hold direct agreements with institutions across every destination we work in, and the full list is on the site. A partnership means our applications go through a named admissions channel rather than a public form, which usually means a faster decision — it does not mean an offer is more likely. If the university you want is not a partner, we will still apply.",
    link: { label: "See the partner list", to: "/study-abroad#universities" },
    topic: "About Lakehead",
  },
];
