import mongoose, { Schema, type HydratedDocument, type Model, Types } from "mongoose";
import slugify from "slugify";

export type PostStatus = "draft" | "published";

/**
 * THE PAGES A POST CAN BE ATTACHED TO — the controlled vocabulary behind the
 * "Related reading" rail on the destination guides.
 *
 * These are deliberately the site's own route paths minus the leading slash,
 * so `study-in-usa` is both the key stored here and the address it appears
 * on. That is not a coincidence to be tidied away later: it means a reader
 * can be sent to /blog?on=study-in-usa and get exactly the list that page's
 * sidebar shows, without a second lookup table to keep in step.
 *
 * IT IS NOT `tags`, AND THAT SEPARATION IS THE POINT. Tags are free text
 * written by whoever is writing the article; they drive the filter chips on
 * /blog and the "keep reading" strip under an article, and a typo there
 * costs nothing. This list is placement — it decides which page a post shows
 * up on — so it is closed, validated on the way in, and picked from
 * checkboxes rather than typed. A misspelt tag is a bit of untidiness; a
 * misspelt placement is an article that silently never appears anywhere.
 *
 * Adding a destination or a service page means adding its key here and to
 * the matching list on the client (client/src/types/api.ts). Both are
 * needed: this one is what the API will accept, that one is what the admin
 * offers and what the pages ask for.
 */
export const POST_PAGES = [
  "study-abroad",
  "study-in-usa",
  "study-in-uk",
  "study-in-canada",
  "study-in-australia",
  "study-in-new-zealand",
  "study-in-south-korea",
  "study-in-japan",
  "study-in-europe",
  "test-preparation",
  "visa-guidance",
  /* RETIRED — the page and the service are gone. Kept so posts already
     placed here can still be saved; the admin no longer offers it (see
     `retired` in client/src/types/api.ts). Remove once no post carries it. */
  "career-counselling",
  "admission-guidance",
  "student-accommodation",
  /* RETIRED — the page's content moved into /study-abroad. Kept for the
     same reason as the one above. */
  "university-partners",
] as const;

export type PostPage = (typeof POST_PAGES)[number];

export interface IPost {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  /** Which site pages this post surfaces on. Empty means "the blog only". */
  pages: PostPage[];
  status: PostStatus;
  author?: Types.ObjectId;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    /* Indexed because the destination guides query it on every page view,
       and a multikey index over a short array is cheap. */
    pages: { type: [{ type: String, enum: POST_PAGES }], default: [], index: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.pre("validate", function (next) {
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) +
      "-" +
      Date.now().toString(36).slice(-4);
  }
  next();
});

postSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);
