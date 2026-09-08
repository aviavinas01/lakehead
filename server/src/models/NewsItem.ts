import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * A piece of news published somewhere else that is worth pointing at — a
 * visa rule change, an intake announcement, a partner university in the
 * papers.
 *
 * IT IS A POINTER, NOT A COPY. The article lives on the site that wrote it
 * and the link goes there. What is stored here is only what the card needs
 * to be worth clicking: a headline, a line of context, a picture and where
 * it came from. Reproducing somebody else's article would be a copyright
 * problem as well as a maintenance one.
 *
 * NOTHING IS FETCHED FROM THE URL, ON PURPOSE. Reading the page server-side
 * to lift its OpenGraph title and image would save typing, and would also
 * mean this server issues HTTP requests to arbitrary addresses on somebody
 * else's say-so — which is a request-forgery surface that has to be defended
 * with an allow-list, a redirect cap, a timeout and a private-address block.
 * That is a great deal of machinery for three fields somebody can paste in
 * ten seconds. If it is ever added, those four defences are the price.
 */

export interface INewsItem {
  /** The headline as it should read on the card. */
  title: string;
  /** The article. The whole point of the record. */
  url: string;
  /** `/uploads/<file>` from the media upload, or an external URL. */
  image?: string;
  /** A line or two of context — why this matters to a Lakehead student. */
  summary: string;
  /** Who published it: "The Kathmandu Post", "Study Australia". */
  source?: string;
  /** When THEY published it, which is not when we added it. */
  publishedAt?: Date;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NewsItemDocument = HydratedDocument<INewsItem>;

const newsSchema = new Schema<INewsItem>(
  {
    title: { type: String, required: true, trim: true, maxlength: 250 },
    url: { type: String, required: true, trim: true, maxlength: 800 },
    image: { type: String, trim: true, maxlength: 800 },
    summary: { type: String, required: true, trim: true, maxlength: 1000 },
    source: { type: String, trim: true, maxlength: 120 },
    publishedAt: { type: Date },
    /* Published by default, unlike an event: a link to a live article is
       either right or wrong the moment it is pasted, with no drafting stage
       in between. */
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* Hand-ranked first, then by the article's own date, then by when it was
   added — so a link with no date still lands somewhere sensible. */
newsSchema.index({ order: 1, publishedAt: -1, createdAt: -1 });

export const NewsItem: Model<INewsItem> = mongoose.model<INewsItem>(
  "NewsItem",
  newsSchema
);
