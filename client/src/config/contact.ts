/**
 * Single source of truth for how to reach Lakehead.
 *
 * `OFFICES` is the list the contact page switches between and the About
 * page's "find us" section summarises. `contact` below it is the head
 * office's details flattened out, because the top bar and the mobile action
 * bar need one number to put on a button and cannot ask which city you are
 * in. Everything there is derived from OFFICES[0], so there is no second
 * copy of the Kathmandu number to keep in step.
 *
 * TODO — WHAT IS REAL AND WHAT IS NOT.
 *   - Kathmandu's two numbers are real: the landline, the mobile, and the
 *     WhatsApp thread that runs on that mobile. So are the coordinates —
 *     they come from Lakehead's own pin on Google Maps, the listing the
 *     footer's rating links to. So are the three social profiles below.
 *   - Birtamod's and Butwal's phone numbers are still placeholders, as are
 *     every email address and street line on this page. Replace them before
 *     this goes live.
 *   - Birtamod's and Butwal's coordinates are the town centres, not our
 *     doors. Replace them with the real pins.
 *   - Hours are Nepal's working week (Sunday to Friday) and are a sensible
 *     guess, not a confirmed schedule.
 */

import { GOOGLE_MAPS_URL } from "../api/googleRating";

export interface Office {
  id: string;
  city: string;
  /** "Head office", "Branch" — shown as a small tag beside the city. */
  kind: string;
  /** One line of character, so three offices do not read as three addresses. */
  blurb: string;
  addressLines: string[];
  phoneDisplay: string;
  phoneHref: string;
  /* The mobile, where an office has one to give out. Optional because only
     the head office does today; every place that shows it checks first. */
  mobileDisplay?: string;
  mobileHref?: string;
  emailDisplay: string;
  emailHref: string;
  hours: { days: string; time: string }[];
  /** [latitude, longitude] — drives both the embed and the "open in" link. */
  at: [number, number];
}

const NEPAL_HOURS = [
  { days: "Sunday – Friday", time: "6:30 am – 5:30 pm" },
  { days: "Saturday", time: "Closed" },
];

export const OFFICES: Office[] = [
  {
    id: "kathmandu",
    city: "Kathmandu",
    kind: "Head office",
    blurb:
      "The counselling floor, the classrooms and the documentation desk, all in one building. Most files are opened here.",
    addressLines: ["Lakehead Education", "Kalikasthan", "Kathmandu 44600"],
    phoneDisplay: "+977-1-4547294",
    phoneHref: "tel:+97714547294",
    mobileDisplay: "+977-9841486735",
    mobileHref: "tel:+9779841486735",
    emailDisplay: "info@lakehead.edu.np",
    emailHref: "mailto:info@lakehead.edu.np",
    hours: NEPAL_HOURS,
    at: [27.7042975, 85.3268654],
  },
  {
    id: "birtamod",
    city: "Birtamod",
    kind: "Branch",
    blurb:
      "Jhapa and the eastern districts, without the flight to Kathmandu. Counselling and test preparation both run here.",
    addressLines: ["Lakehead Education", "Birtamod", "Jhapa"],
    phoneDisplay: "+977-23-555555",
    phoneHref: "tel:+97723555555",
    emailDisplay: "info@lakehead.edu.np",
    emailHref: "mailto:info@lakehead.edu.np",
    hours: NEPAL_HOURS,
    at: [26.6483, 87.9821],
  },
  {
    id: "butwal",
    city: "Butwal",
    kind: "Branch",
    blurb:
      "The western hub — Rupandehi, Kapilvastu and the hill districts above them. Same counsellors, same files, closer to home.",
    addressLines: ["Lakehead Education", "Butwal", "Rupandehi"],
    phoneDisplay: "+977-71-555555",
    phoneHref: "tel:+97771555555",
    emailDisplay: "info@lakehead.edu.np",
    emailHref: "mailto:info@lakehead.edu.np",
    hours: NEPAL_HOURS,
    at: [27.7006, 83.4482],
  },
];

/**
 * The `output=embed` form of Google Maps needs no API key and no script,
 * which is the whole reason the map on the contact page is free to switch
 * cities without any of Google's JavaScript being on the site.
 */
export const mapEmbedFor = ([lat, lng]: [number, number]) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=16&hl=en&output=embed`;

/** Where "open in Google Maps" goes — the app on a phone, the site elsewhere. */
export const mapLinkFor = ([lat, lng]: [number, number]) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

const head = OFFICES[0];

/**
 * The head office, flattened — for the places that need one number and one
 * address without asking the visitor to choose a city first.
 */
export const contact = {
  phoneDisplay: head.phoneDisplay,
  phoneHref: head.phoneHref,
  mobileDisplay: head.mobileDisplay,
  mobileHref: head.mobileHref,
  /* The same mobile as above, without the punctuation — wa.me wants the
     country code and digits only, no plus and no dashes. */
  whatsappHref: "https://wa.me/9779841486735",
  emailDisplay: "info@lakehead.edu.np",
  emailHref: "mailto:info@lakehead.edu.np",
  addressLines: head.addressLines,
  hours: head.hours,
  mapEmbed: mapEmbedFor(head.at),
  mapLink: GOOGLE_MAPS_URL,
};

/**
 * The profiles the footer links to.
 *
 * Kept here rather than in the footer because this file is where "how to
 * reach Lakehead" lives, and the footer is not the only place that will
 * eventually want them. The icons stay in the component — a config file is
 * the wrong home for SVG paths.
 *
 * There is no LinkedIn or YouTube row: the footer used to carry both, each
 * pointing at the service's own front page rather than at an account of
 * ours, which is a link that promises a profile and delivers a login screen.
 * Add a row here the day an account exists and the icon appears with it.
 */
export interface SocialLink {
  /** Matches a key in the footer's icon map. */
  id: "instagram" | "facebook" | "tiktok";
  label: string;
  href: string;
}

export const SOCIALS: SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/lakeheadeducation/",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/LakeheadEducation/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@nepalbishwa",
  },
];
