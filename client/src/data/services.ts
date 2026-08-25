/**
 * The student services, and the single source of truth for them.
 *
 * Everything reads from here: the hub page at /services, each detail page at
 * /services/<slug>, and the navbar's Student Services dropdown. Adding a
 * service is one entry in this array — a card, a page and a route all appear
 * on their own, with no other file to remember.
 *
 * IMAGES are referenced but not yet supplied. Drop a file at the path each
 * entry names into client/public/services/ and it appears; until then the
 * card and hero show a tinted panel rather than a broken image (see Shot in
 * components/destinationBits.tsx). Nothing needs re-deploying but the file.
 *
 * The `detail` copy below is deliberately short and factual — what the
 * service covers, in plain terms. It carries no success rates, no promises
 * about a visa or an admission decision, and no borrowed statistics, for the
 * same reasons as every other page on this site. Replace it with fuller copy
 * whenever you have it; keep the tone.
 */

export interface Service {
  slug: string;
  title: string;
  /** One line, shown on the hub card */
  summary: string;
  /** client/public/services/<file> — supply manually */
  image: string;
  /** Opening paragraph of the detail page */
  intro: string;
  /** What the service actually covers */
  includes: string[];
  /** Sits above the closing call to action */
  closing: string;
  /** Set false to keep a service out of the navbar dropdown. The page and
      its card on the hub stay — this only affects the nav. */
  inNav?: boolean;
}

export const SERVICES: Service[] = [
  {
    slug: "study-abroad-counselling",
    title: "Study Abroad Counselling",
    /* Kept out of the dropdown: the Study Abroad section covers this ground
       already, and listing it twice in the nav invites the question of how
       the two differ. The page itself still exists and is still linked from
       the services hub. */
    inNav: false,
    summary: "Where to go, what to study, and whether it fits the life you want after.",
    image: "/services/counselling.jpg",
    intro:
      "The first and most consequential conversation. Before any application is written, it is worth being honest about your academic record, your budget and what you want the degree to do for you — because those three things decide the shortlist far more than any ranking table does.",
    includes: [
      "An honest read of your academic profile and where it will be competitive",
      "Course and university shortlists built around your budget, not around brochures",
      "Destination comparison — entry requirements, costs, and work rights after study",
      "Intake planning, so deadlines are worked backwards from rather than discovered",
      "A realistic view of what each option will actually cost you, end to end",
    ],
    closing:
      "Most students arrive without knowing exactly what they want. That is entirely normal, and it is what the first session is for.",
  },
  {
    slug: "test-preparation",
    title: "Test Preparation",
    summary: "IELTS, PTE, TOEFL and the rest — prepared for properly, and early.",
    image: "/services/test-prep.jpg",
    intro:
      "Language and aptitude scores gate almost everything else: your offer, your visa, and sometimes your scholarship. The single most common mistake is leaving the test until the application is already late, which turns a recoverable result into a lost intake.",
    includes: [
      "IELTS, PTE and TOEFL preparation, with the format practised as well as the content",
      "A diagnostic first, so preparation targets the sections that are actually weak",
      "Timed practice under real conditions, not just exercises",
      "Guidance on which test your chosen institutions and visa route accept",
      "Booking timed so a disappointing first attempt can still be retaken",
    ],
    closing:
      "Sit the test roughly three months before your deadline. That single decision leaves room for everything else to go slightly wrong.",
  },
  {
    slug: "test-booking",
    title: "Test Booking",
    summary: "Getting you a seat, on the right date, at the right centre.",
    image: "/services/test-booking.jpg",
    intro:
      "Preparing is one job; actually getting a seat is another. Slots at the Kathmandu centres go quickly in the run-up to the big intakes, and students who wait until they feel ready often find the next available date is well past their application deadline. We book it for you, and we book it early.",
    includes: [
      "Choosing a test date that works backwards from your application deadline",
      "Finding an available slot at a centre you can reach",
      "Completing the registration and confirming your booking",
      "Checking your ID details match the booking exactly, character for character",
      "Sending your results to the institutions that need them",
      "Rescheduling or transferring a booking when plans change",
    ],
    closing:
      "One detail catches more students than anything else here: the name on your booking has to match your passport exactly. Get that wrong and you can be turned away at the door on the morning of the test, with the fee gone.",
  },
  {
    slug: "visa-guidance",
    title: "Visa Guidance",
    /* Has a page of its own (pages/VisaGuidance.tsx) that outranks the
       generic route, so only `title`, `summary` and `image` are read from
       here — the fields below feed the hub card, not the page. */
    summary: "Documentation, financial evidence and preparation — handled carefully.",
    image: "/services/visa.jpg",
    intro:
      "Every destination runs its own route, its own thresholds and its own paperwork, and all of them are revised regularly. Our role is to make sure you understand exactly what is being asked for and that what you submit is accurate and complete.",
    includes: [
      "The documents your specific route requires, checked before submission",
      "Financial evidence — what counts, how much, and how long it must be held",
      "Health cover and insurance requirements for your destination",
      "Application review, so avoidable mistakes are caught early",
      "Current requirements confirmed against the official source, not last year's notes",
    ],
    closing:
      "Visa decisions are made by the government concerned. What we can do is make sure your application gives them nothing to query.",
  },
  {
    slug: "career-counselling",
    title: "Career Counselling",
    /* Has a page of its own (pages/CareerCounselling.tsx) that outranks the
       generic route, so only `title`, `summary` and `image` are read from
       here — the fields below feed the hub card, not the page. */
    summary: "Choosing a course with the ten years after it in view, not just the three.",
    image: "/services/career.jpg",
    intro:
      "A degree is a means to something. Working out what that something is — and which courses and countries actually lead there — is worth doing before you commit several years and a great deal of money to a decision.",
    includes: [
      "Mapping your interests and strengths against real career paths",
      "Which qualifications employers in your field actually recognise",
      "How post-study work rights differ by destination, course and level",
      "Industry and internship exposure built into the programmes you consider",
      "Long-term planning, including further study and professional registration",
    ],
    closing:
      "The right course is the one you can still justify in five years. That is the question we start from.",
  },
  {
    slug: "student-accommodation",
    title: "Student Accommodation",
    /* Has a page of its own (pages/StudentAccommodation.tsx) that outranks
       the generic route, so only `title`, `summary` and `image` are read
       from here — the fields below feed the hub card, not the page. */
    summary: "Somewhere to live from day one, arranged before you fly.",
    image: "/services/accommodation.jpg",
    intro:
      "Arriving in a new country without a confirmed address is a bad way to start. Accommodation also moves your budget more than almost any other line, and the gap between cities — and between halls and private renting — is wide enough to change which offer you accept.",
    includes: [
      "University halls, homestays and private renting compared honestly",
      "What each option costs, including deposits, bills and what is bundled",
      "Applying within the institution's own accommodation deadlines",
      "Understanding a tenancy agreement before you sign it",
      "Location and commute weighed against price",
    ],
    closing:
      "Sort this before you fly. Looking for a room in a city you have never been to, in your first week of term, is the hardest way to do it.",
  },
  {
    slug: "admission-guidance",
    title: "Admission Guidance",
    /* Has a page of its own (pages/AdmissionGuidance.tsx) that outranks the
       generic route, so only `title`, `summary` and `image` are read from
       here — the fields below feed the hub card, not the page.

       This replaced a separate "Interview Preparation" service: interview
       prep is stage 06 of admission guidance, and listing both made the same
       work look like two things. */
    summary: "The whole application, from first conversation to visa decision.",
    image: "/services/interview.jpg",
    intro:
      "From choosing the course to submitting the visa application, handled as one sequence rather than a series of separate errands.",
    includes: [
      "Counselling, and identifying the right course, country and university",
      "Test preparation and document editing",
      "The application itself, paper or online",
      "Interview preparation for admission and for the visa",
      "Visa guidance, free for every Lakehead student",
    ],
    closing:
      "Most students come to us at the first stage and stay to the last, but you can join at any point.",
  },
];

/** Used by the detail route; returns undefined for an unknown slug. */
export const findService = (slug?: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);
