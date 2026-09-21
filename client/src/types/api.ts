export type UserRole = "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
  createdAt?: string;
}

export type PostStatus = "draft" | "published";

/**
 * WHERE A POST APPEARS, beyond the blog itself.
 *
 * The keys are the site's own route paths without the leading slash, so
 * `study-in-usa` is the page a post is placed on AND the address that page
 * lives at. /blog?on=study-in-usa therefore shows exactly what the USA
 * guide's sidebar shows, in full, with no lookup table in between.
 *
 * This list must stay in step with POST_PAGES in server/src/models/Post.ts:
 * that one decides what the API will store, this one decides what the admin
 * offers and what the guides ask for. A key in one and not the other is a
 * placement that can be chosen and never rendered, or asked for and never
 * choosable.
 *
 * `label` is what the editor sees in the checkbox list; `group` only sorts
 * that list into two columns. Neither is sent to the server.
 */
export const POST_PAGES = [
  { key: "study-abroad", label: "Study abroad (hub)", group: "Destinations" },
  { key: "study-in-usa", label: "Study in the USA", group: "Destinations" },
  { key: "study-in-uk", label: "Study in the UK", group: "Destinations" },
  { key: "study-in-canada", label: "Study in Canada", group: "Destinations" },
  { key: "study-in-australia", label: "Study in Australia", group: "Destinations" },
  { key: "study-in-new-zealand", label: "Study in New Zealand", group: "Destinations" },
  { key: "study-in-south-korea", label: "Study in South Korea", group: "Destinations" },
  /* RETIRED, NOT DELETED. The Japan guide is gone, but posts placed on it
     are still in the database and the server still accepts the key (see
     POST_PAGES in server/src/models/Post.ts, where removing it would make
     every such post fail validation the next time anybody saved it).
     Keeping the entry means `postPageLabel` still has a readable name for
     it; `retired` is what takes it out of the editor's checkbox list, so
     nothing new can be placed there. Delete both entries together once no
     post carries the key. */
  { key: "study-in-japan", label: "Study in Japan", group: "Destinations", retired: true },
  { key: "study-in-europe", label: "Study in Europe", group: "Destinations" },
  { key: "test-preparation", label: "Test preparation", group: "Services" },
  { key: "visa-guidance", label: "Visa guidance", group: "Services" },
  /* RETIRED, like Japan above and for the same reason: the page and the
     service are gone, but posts already placed here keep the key, and the
     server must go on accepting it or those posts could not be saved. */
  { key: "career-counselling", label: "Career counselling", group: "Services", retired: true },
  { key: "admission-guidance", label: "Admission guidance", group: "Services" },
  { key: "student-accommodation", label: "Student accommodation", group: "Services" },
  /* RETIRED. Its content moved into the Study Abroad page, which has its
     own placement above; there is no separate page left to place on. */
  { key: "university-partners", label: "University partners", group: "Services", retired: true },
] as const;

export type PostPage = (typeof POST_PAGES)[number]["key"];

/**
 * The placements an editor may still choose — everything above that has not
 * been retired. The full list stays available for reading old posts back;
 * this is the one the "Appears on" panel offers.
 */
export const LIVE_POST_PAGES = POST_PAGES.filter((p) => !("retired" in p));

/** The editor's label for a page key, falling back to the key itself. */
export const postPageLabel = (key: string): string =>
  POST_PAGES.find((p) => p.key === key)?.label ?? key;

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  /** Placement. Empty means the post shows on /blog and nowhere else. */
  pages: PostPage[];
  status: PostStatus;
  author?: { _id: string; name: string };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PostSummary = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "tags" | "pages" | "publishedAt"
>;

export const SERVICES = [
  "study-abroad",
  "test-preparation",
  "visa-guidance",
  "other",
] as const;
export type ServiceType = (typeof SERVICES)[number];

export type InquiryStatus = "new" | "contacted" | "closed";

/** Which form an inquiry came from — see server/src/models/Inquiry.ts. */
export type InquirySource =
  | "consultation"
  | "contact"
  | "about"
  | "study-abroad"
  | "home"
  | "callback"
  | "unknown";

/** Whether the notification email got out. Written by the server. */
export interface NotifyRecord {
  state: "sent" | "failed" | "skipped";
  at: string;
  reason?: string;
}

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service: ServiceType;
  message: string;
  status: InquiryStatus;
  /* Optional on the client even though the server defaults it: inquiries
     taken before this field existed have neither, and the admin has to
     render them all the same. */
  source?: InquirySource;
  /** Did the office notification go out? Written by the server. */
  notified?: NotifyRecord;
  /**
   * Did the enquirer's acknowledgement go out? Tracked separately, because
   * the two can differ and the difference is the useful part — see the note
   * on the field in server/src/models/Inquiry.ts.
   */
  acknowledged?: NotifyRecord;
  notes?: string;
  createdAt: string;
}

/**
 * The director's message — a singleton on the server, so the API answers
 * with `director: null` rather than 404ing when nothing has been written
 * yet. See server/src/models/Director.ts.
 */
export interface Director {
  _id: string;
  name: string;
  title: string;
  photo?: string;
  /** A short line set large above the body, if there is one. */
  lead?: string;
  /** Stored in the same small markup as a blog post — see lib/richText. */
  statement: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One person on the team, as shown on /about. */
export interface StaffMember {
  _id: string;
  name: string;
  title: string;
  photo?: string;
  /** One line in their own words. Optional, and cards are built to sit
      correctly without it. */
  quote?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = "image" | "video";

export interface Media {
  _id: string;
  type: MediaType;
  url: string;
  title?: string;
  caption?: string;
  album?: string | { _id: string; title: string; slug: string };
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * A video from the YouTube feed the server proxies (GET /youtube/videos).
 * `id` is the 11-character video id — everything the embed needs.
 */
export interface YouTubeVideo {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  thumbnail: string;
}

/** One Google review, as the server hands it over (see googleRating.service). */
export interface GoogleReview {
  id: string;
  author: string;
  photo?: string;
  profileUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
}

/** The consultancy's Google rating summary, plus up to five reviews. */
export interface GoogleRating {
  rating: number;
  total: number;
  url?: string;
  /** False when the server fell back to its static score */
  live: boolean;
  reviews: GoogleReview[];
}
