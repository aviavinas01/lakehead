/**
 * The four steps in "Your Journey to Global Education Starts Here", on the
 * home page.
 *
 * Each step owns a photograph, the words that sit on it, and where tapping
 * it goes. Add a fifth step and everything adapts on its own: the scroll
 * length, the rail, the panel stack and the mobile list are all derived from
 * this array's length — there is no count written down anywhere else.
 *
 * THE IMAGES DO NOT EXIST YET. Drop files at the paths below into
 * client/public/journey/ and they appear with no code change. Until then
 * each panel renders as a deliberate colour field carrying the same words,
 * so the section is complete and legible either way — see `JourneyPanel` in
 * components/NextSteps.tsx.
 *
 * The panel shows the photograph as a card, cropped to 4:3, riding in a reel
 * that slides one card at a time. Landscape suits it best; these are cards
 * now rather than full-bleed backdrops, so the subject wants to read at
 * about a third of the screen's width.
 */

export interface JourneyStep {
  id: string;
  /** Shown large in the left column. */
  title: string;
  /** The paragraph under it. */
  text: string;
  /** This step's accent — carries the numeral, the title and the rail. */
  color: string;
  /** Path under client/public. */
  image: string;
  /** One line under the photograph. Keep it short. */
  caption: string;
  /** Where the panel links to. */
  to: string;
  /** The words on the panel's button. */
  linkLabel: string;
}

export const JOURNEY: JourneyStep[] = [
  {
    id: "counselling",
    title: "Education Counselling",
    text: "Get personalised guidance to choose the right course, university and destination — based on your academic record and where you actually want to end up.",
    color: "#4f46e5",
    image: "/journey/step-1.jpg",
    caption: "An hour with a counsellor, before any decision is made",
    to: "/services/study-abroad-counselling",
    linkLabel: "How counselling works",
  },
  {
    id: "applications",
    title: "University Applications",
    text: "We manage your applications end to end — shortlisting, documents, statements and deadlines — so an offer is the only thing you have to think about.",
    color: "#e0234e",
    image: "/journey/step-2.jpg",
    caption: "Shortlist, apply, and track every deadline in one place",
    to: "/services/admission-guidance",
    linkLabel: "See admission guidance",
  },
  {
    id: "funding",
    title: "Loans & Scholarships",
    text: "Explore what you can actually afford. We work through education loans, scholarship options and the paperwork each of them wants.",
    color: "#0d9488",
    image: "/journey/step-3.jpg",
    caption: "What it costs, and how students actually pay for it",
    /* TODO: repoint at a dedicated scholarships page when one exists —
       today the services index is the closest thing we have. */
    to: "/services",
    linkLabel: "Explore your options",
  },
  {
    id: "visa",
    title: "Visa Processing",
    text: "Lodge with a file built to be believed. Our visa team prepares the documents, runs the interview practice, and checks everything before it is submitted.",
    color: "#ea580c",
    image: "/journey/step-4.jpg",
    caption: "A file built to be believed, checked before it is lodged",
    to: "/services/visa-guidance",
    linkLabel: "Read the visa guide",
  },
];

/**
 * The block shown in the left column once the steps are done and the
 * consultation form has taken the panel's place. It is the fifth state of a
 * four-step section, which is why it lives here rather than in JOURNEY.
 */
export const JOURNEY_CLOSER = {
  title: "Ready when you are",
  text: "That is the whole route, start to finish. It begins with one conversation, it is free, and it commits you to nothing.",
  color: "#17275c",
};
