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
 *   - Kathmandu's `at` coordinates are genuine: they come from Lakehead's own
 *     pin on Google Maps, the listing the footer's rating links to.
 *   - Birtamod's and Butwal's coordinates are the town centres, not our
 *     doors. Replace them with the real pins.
 *   - Every phone number, email address and street line on this page is a
 *     placeholder. Replace them all before this goes live.
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
  emailDisplay: string;
  emailHref: string;
  hours: { days: string; time: string }[];
  /** [latitude, longitude] — drives both the embed and the "open in" link. */
  at: [number, number];
}

const NEPAL_HOURS = [
  { days: "Sunday – Friday", time: "9:30 am – 5:30 pm" },
  { days: "Saturday", time: "Closed" },
];

export const OFFICES: Office[] = [
  {
    id: "kathmandu",
    city: "Kathmandu",
    kind: "Head office",
    blurb:
      "The counselling floor, the classrooms and the documentation desk, all in one building. Most files are opened here.",
    addressLines: ["Lakehead Education", "Kamalpokhari", "Kathmandu 44600"],
    phoneDisplay: "+977-1-5555555",
    phoneHref: "tel:+97715555555",
    emailDisplay: "kathmandu@lakeheadeducation.com",
    emailHref: "mailto:kathmandu@lakeheadeducation.com",
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
    emailDisplay: "birtamod@lakeheadeducation.com",
    emailHref: "mailto:birtamod@lakeheadeducation.com",
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
    emailDisplay: "butwal@lakeheadeducation.com",
    emailHref: "mailto:butwal@lakeheadeducation.com",
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
  whatsappHref: "https://wa.me/9779800000000",
  emailDisplay: "hello@lakeheadeducation.com",
  emailHref: "mailto:hello@lakeheadeducation.com",
  addressLines: head.addressLines,
  hours: head.hours,
  mapEmbed: mapEmbedFor(head.at),
  mapLink: GOOGLE_MAPS_URL,
};
