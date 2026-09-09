import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * The director's message — one photograph and one statement, shown at
 * /about/director.
 *
 * IT IS A SINGLETON, AND THE DATABASE ENFORCES THAT rather than the code
 * remembering to. `key` is fixed to "director" and uniquely indexed, so a
 * second record cannot be created even by a stray POST or a seed script run
 * twice; the service upserts against it. The alternative — findOne() and
 * trust everything to only ever call it once — is the kind of rule that
 * holds until the first concurrent request.
 *
 * The statement is stored as text in the small markup lib/richText.tsx
 * understands, the same as a blog post: blank lines separate paragraphs and
 * nothing is HTML, so there is nothing to sanitise on the way out. See
 * PostEditor for the reasoning.
 */
export interface IDirector {
  /** Always "director". The uniqueness of this is what makes it a singleton. */
  key: string;
  name: string;
  title: string;
  /** `/uploads/<file>` from the media upload, or an external URL. */
  photo?: string;
  /**
   * The short statement that sits BESIDE the photograph, above the long
   * message. Not a subtitle — it is the summary a reader gets before they
   * commit to the whole letter, and the page is built around having one.
   */
  lead?: string;
  statement: string;
  /** Off until somebody has actually written it — see the service. */
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DirectorDocument = HydratedDocument<IDirector>;

const directorSchema = new Schema<IDirector>(
  {
    key: { type: String, required: true, unique: true, default: "director" },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    photo: { type: String, trim: true, maxlength: 800 },
    /* 700 rather than a tidier 400: a short statement of this kind runs to
       three or four sentences, and the first real one written for this page
       came to just over 400 characters. A limit that the first genuine piece
       of content trips over is the wrong limit. */
    lead: { type: String, trim: true, maxlength: 700 },
    statement: { type: String, required: true, maxlength: 20000 },
    /* Unpublished until someone says otherwise. A director's message is the
       one page on this site where a half-written draft going live is
       genuinely embarrassing, so it takes a deliberate act. */
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Director: Model<IDirector> = mongoose.model<IDirector>(
  "Director",
  directorSchema
);
