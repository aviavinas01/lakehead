import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { FEEDS, type Feed } from "../services/youtube.service.js";

/**
 * A YouTube video chosen by hand, for one of the two rows on the site.
 *
 * ------------------------------------------------------------------
 * IT DOES NOT REPLACE THE PLAYLIST FEED — IT OUTRANKS IT.
 *
 * The rows have always read YouTube's public RSS feed, driven by the
 * playlist and channel ids in the environment. That still works and is still
 * there. What this adds is a curated list on top: if a feed has any
 * published picks, the row shows exactly those, in the order set here; if it
 * has none, the row falls back to the RSS feed exactly as before.
 *
 * So adding nothing changes nothing, and the fallback means a row can never
 * be emptied by mistake — deleting the last pick restores the playlist
 * rather than leaving a blank section. See youtube.controller for the
 * two-line switch that implements it.
 * ------------------------------------------------------------------
 *
 * THE THUMBNAIL IS NOT STORED FROM THE LOOKUP, unlike TikTok's. YouTube
 * serves stills from a stable, unsigned path derived from the video id, so
 * there is nothing to cache and nothing to expire — see thumbnailFor in the
 * service. TikTok's equivalent is a signed CDN URL that goes 403 in a while,
 * which is why that model has a `fetchedAt` and this one does not.
 */

export interface IYouTubeClip {
  /** The full URL, as pasted. The one thing a person types. */
  url: string;
  /** The 11-character id — all the embed and the still actually need. */
  videoId: string;
  /** From oEmbed, and overridable: YouTube titles are written for YouTube. */
  title: string;
  authorName: string;
  /** Which row it belongs in. Same two names the RSS service uses. */
  feed: Feed;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type YouTubeClipDocument = HydratedDocument<IYouTubeClip>;

const clipSchema = new Schema<IYouTubeClip>(
  {
    url: { type: String, required: true, trim: true, maxlength: 500 },
    videoId: { type: String, required: true, trim: true, index: true },
    title: { type: String, default: "", trim: true, maxlength: 300 },
    authorName: { type: String, default: "", trim: true, maxlength: 120 },
    feed: { type: String, enum: FEEDS, default: "stories", index: true },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* UNIQUE PER ROW, NOT GLOBALLY. The same video can legitimately be both a
   success story on the home page and a testimonial on the Study Abroad
   page; what makes no sense is the same video twice in one row. A compound
   index says exactly that, and lets the database refuse a duplicate rather
   than leaving it to a check somebody can forget to write. */
clipSchema.index({ feed: 1, videoId: 1 }, { unique: true });

/* The row's own order first, then newest — so an untouched list still reads
   sensibly and only the clips somebody has deliberately ranked move. */
clipSchema.index({ order: 1, createdAt: -1 });

export const YouTubeClip: Model<IYouTubeClip> = mongoose.model<IYouTubeClip>(
  "YouTubeClip",
  clipSchema
);
