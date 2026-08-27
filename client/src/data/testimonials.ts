/**
 * Everything a student has said about us that does not come from an API.
 *
 * Four sources feed the reviews page, and only two of them are live:
 *
 *   google   — the Places API, via the server (api/googleRating.ts)
 *   video    — the YouTube "testimonials" playlist, via the server
 *   written  — this file
 *   social   — this file
 *
 * The written and social entries are curated by hand because there is no
 * API worth having for either. Facebook and Instagram both retired the
 * public feed endpoints a site like this could use, so a "social wall" that
 * fetches anything is a Graph API app, a review, and a token to keep alive —
 * for content that changes a few times a year. Pasting the post in and
 * linking back to it is honest, faster, and does not break on a Tuesday.
 *
 * TO ADD A TESTIMONIAL: append to WRITTEN. `image` is a path under
 * client/public (e.g. "/testimonials/aarav.jpg") and is optional — without
 * one the student's initial is drawn in the circle instead.
 *
 * TO ADD A SOCIAL POST: append to SOCIAL, with the permalink in `url` so the
 * card can link back to the original. Quote the post as written.
 *
 * When these outgrow hand-editing, both arrays are the shape a `Review`
 * collection would return — move them behind an endpoint and the page needs
 * one import changed.
 */

export type ReviewSource = "google" | "video" | "written" | "social";

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "tiktok";

export interface WrittenTestimonial {
  id: string;
  quote: string;
  name: string;
  /** Where they went — doubles as the destination filter's value. */
  country: string;
  image?: string;
  /** Out of 5. Omitted where the student did not leave one. */
  rating?: number;
  /** Free text, shown under the name. */
  when?: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  author: string;
  /** Without the @; the card adds it. */
  handle?: string;
  text: string;
  /** Permalink to the original post. */
  url?: string;
  image?: string;
  country?: string;
  when?: string;
}

export const WRITTEN: WrittenTestimonial[] = [
  {
    id: "w-aarav",
    quote:
      "I’m truly grateful for the guidance and support I received throughout my USA visa process. The team helped me understand each step clearly and prepared me thoroughly for my visa interview. What I appreciated most was the honest advice and practical guidance—I always knew what to expect and how to prepare. Their patience, professionalism, and willingness to answer every question made the entire process much less stressful. I would definitely recommend their guidance to anyone planning to study in the USA.",
    name: "Aarav",
    country: "USA",
    rating: 5,
  },
  {
    id: "w-sanjay",
    quote:
      "I had a great experience with the team throughout my study-abroad and visa application journey. A special thanks to the entire counseling team for their continuous support, clear guidance, and professional service at every stage. They were always approachable and made sure my questions were answered and my application was prepared properly. I truly appreciate their dedication and would happily recommend their services to other students planning to study abroad.",
    name: "Sanjay",
    country: "Australia",
    rating: 5,
  },
  {
    id: "w-nisha",
    quote:
      "I had a really positive experience with the consultancy throughout my study-abroad application. From selecting the right university to preparing my documents, the team was supportive and easy to communicate with. They explained each step clearly and helped me feel confident about my application. I’m very thankful for their guidance and would definitely recommend them to other students.",
    name: "Nisha",
    country: "Australia",
    rating: 5,
  },
  {
    id: "w-rohan",
    quote:
      "The entire process was much easier than I expected, thanks to the guidance I received from the counseling team. They helped me shortlist suitable universities, understand the requirements, and prepare my application properly. Whenever I had questions, the team was quick to respond and provide clear answers. I really appreciate their professionalism and support throughout my journey.",
    name: "Rohan",
    country: "UK",
    rating: 5,
  },
  {
    id: "w-sneha",
    quote:
      "I’m extremely happy with the support I received during my study-abroad journey. The counselors were patient, approachable, and genuinely focused on helping me make the right decisions. They guided me through the documentation and application process and kept me informed at every stage. It was reassuring to have a team I could rely on throughout the process.",
    name: "Sneha",
    country: "New Zealand",
    rating: 5,
  },
  {
    id: "w-aayush",
    quote:
      "I had a smooth and positive experience with the team from the beginning of my application journey. They helped me understand the admission requirements, guided me through the documentation, and kept the process well organized. Their quick responses and friendly approach made everything much easier. I’m grateful for their support and would recommend them to anyone planning to study abroad.",
    name: "Aayush",
    country: "Canada",
    rating: 5,
  },
  {
    id: "w-srijana",
    quote:
      "The guidance I received throughout my application process was excellent. The counselors took the time to understand my goals and helped me choose an option that suited my academic plans. They were always available to clarify my doubts and provided helpful advice whenever I needed it. I truly appreciate their dedication and support in helping me take the next step toward studying abroad.",
    name: "Srijana",
    country: "Denmark",
    rating: 5,
  },
];

/**
 * PLACEHOLDERS. These are written in the shape and register of the real
 * thing so the wall can be designed and reviewed, but not one of them is an
 * actual post. Replace each with a genuine one — quoted as published, with
 * its permalink in `url` — before this page goes live. Delete any that have
 * no real counterpart rather than leaving them in.
 */
export const SOCIAL: SocialPost[] = [
  {
    id: "s-1",
    platform: "facebook",
    author: "Prasamsa Adhikari",
    text: "Offer letter from Melbourne came through this morning — six weeks from the first counselling session to this. Thank you to the whole Lakehead team for keeping me calm through the document stage. ✈️",
    country: "Australia",
    when: "Posted in March",
  },
  {
    id: "s-2",
    platform: "instagram",
    author: "Bibek Thapa",
    handle: "bibek.tpa",
    text: "PTE 79 on the first attempt. Two months of evening classes at Lakehead and a lot of mock tests. Still can’t quite believe it.",
    country: "Australia",
    when: "Posted in January",
  },
  {
    id: "s-3",
    platform: "instagram",
    author: "Aastha K.C.",
    handle: "aastha.kc",
    text: "First week in Toronto. The pre-departure session covered nearly everything — SIN number, bank account, transit pass — so the only surprise left was the cold. ❄️",
    country: "Canada",
    when: "Posted in September",
  },
  {
    id: "s-4",
    platform: "linkedin",
    author: "Nirajan Shrestha",
    text: "Graduated from the University of Otago this week. Four years ago I walked into Lakehead with a transcript I was embarrassed about and no idea what a SOP was. Grateful to the counsellors who told me the truth about my chances instead of what I wanted to hear.",
    country: "New Zealand",
    when: "Posted in December",
  },
  {
    id: "s-5",
    platform: "tiktok",
    author: "Sujata Rai",
    handle: "sujata.rai",
    text: "Visa interview prep at Lakehead vs my actual interview — they asked me almost exactly what we practised. Genuinely.",
    country: "USA",
    when: "Posted in June",
  },
  {
    id: "s-6",
    platform: "facebook",
    author: "Manish Gurung",
    text: "CAS issued! Sheffield in September. Whole family came to the office today to say thank you in person — the counsellors have been answering my mother’s questions for a year.",
    country: "UK",
    when: "Posted in July",
  },
];

/** Every destination that appears across the curated sources, in order. */
export const DESTINATIONS = Array.from(
  new Set([
    ...WRITTEN.map((w) => w.country),
    ...SOCIAL.map((s) => s.country).filter((c): c is string => !!c),
  ])
).sort();
