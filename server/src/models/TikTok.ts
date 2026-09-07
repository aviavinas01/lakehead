import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * One TikTok clip shown in the row on the home page.
 *
 * WHY THIS IS A COLLECTION AND NOT A FEED. Every other video source on this
 * site pulls itself: YouTube publishes an RSS feed that needs no key, so
 * youtube.service.ts just reads it and the row keeps itself current. TikTok
 * publishes nothing of the kind. Listing an account's videos needs their
 * Display API, which needs a registered application and an approved OAuth
 * flow — far more machinery than a row of four clips is worth. So the list
 * is kept here and curated from the admin instead.
 *
 * WHAT IS STORED AND WHAT IS NOT. `url` is the only thing a person types;
 * everything else is TikTok's own answer to an oEmbed lookup, cached here so
 * the public page never waits on their servers.
 *
 * `thumbnail` IS DELIBERATELY TREATED AS PERISHABLE. TikTok serves those
 * images from a signed CDN and the signature expires, so a URL saved today
 * returns 403 in a while and the row goes blank with no code having changed.
 * `fetchedAt` is what makes that survivable: the service re-asks oEmbed for
 * any record older than its refresh window and writes the new URL back. Do
 * not remove it on the grounds that the data "does not change" — the data
 * does not, but the URL does.
 */

/**
 * Which shelf a clip belongs on, and therefore where on the site it appears.
 *
 * FLAT, THOUGH IT READS AS A HIERARCHY. "Testimonials" and "general
 * information, which divides into three" is two levels in the telling and
 * four values in practice — and four values that each map to exactly one
 * page. A parent/child pair of fields would let a clip be filed under
 * "general" with no sub-section, which is a state no page could render.
 */
export const TIKTOK_CATEGORIES = [
  "testimonial",
  "study-abroad",
  "tests",
  "visas",
] as const;

export type TikTokCategory = (typeof TIKTOK_CATEGORIES)[number];

export interface ITikTok {
  /** The full tiktok.com URL, as pasted. The one human-entered field. */
  url: string;
  /** Parsed out of the URL — the id the /embed/v2/ player takes. */
  videoId: string;
  /** From oEmbed. Overridable, so a clip can be retitled for the site. */
  title: string;
  authorName: string;
  /** Signed and perishable — see the note above. */
  thumbnail: string;
  /** When oEmbed was last asked. Drives the refresh, not display. */
  fetchedAt?: Date;
  category: TikTokCategory;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TikTokDocument = HydratedDocument<ITikTok>;

const tiktokSchema = new Schema<ITikTok>(
  {
    url: { type: String, required: true, trim: true, maxlength: 500 },
    /* Unique, so pasting the same clip twice is refused by the database
       rather than by a check somebody can forget to write. */
    videoId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "", trim: true, maxlength: 300 },
    authorName: { type: String, default: "", trim: true, maxlength: 120 },
    thumbnail: { type: String, default: "" },
    fetchedAt: { type: Date },
    /* Testimonials by default: it is the shelf most clips belong on, and a
       clip filed wrongly shows up somewhere harmless rather than beside the
       visa rules. */
    category: {
      type: String,
      enum: TIKTOK_CATEGORIES,
      default: "testimonial",
      index: true,
    },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* The row's own order first, then newest — so an untouched list still reads
   sensibly and only the clips somebody has deliberately ranked move. */
tiktokSchema.index({ order: 1, createdAt: -1 });

export const TikTok: Model<ITikTok> = mongoose.model<ITikTok>("TikTok", tiktokSchema);
