import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * A partner institution, as shown on /university-partners and on a page of
 * its own at /university-partners/<slug>.
 *
 * ------------------------------------------------------------------
 * THIS REPLACED A HARD-CODED LIST. The partners used to live in
 * client/src/data/universities.ts — ten entries, edited by a developer, in a
 * file that had to be rebuilt and redeployed to add a logo. That is the
 * wrong home for something the office adds to several times a year, so it is
 * a collection now, edited in the admin like everything else the site
 * publishes. The ten that were in the file were seeded across; see
 * server/src/config/seedUniversities.ts.
 * ------------------------------------------------------------------
 *
 * ONLY `name` AND `logo` ARE REQUIRED, and that is deliberate rather than
 * lax. A partnership is usually announced before anybody has gathered the
 * intake months and the prospectus link, and the useful thing is to get the
 * institution on the wall the day the agreement is signed. Every optional
 * field is left out of the page entirely when it is unset, so a thin record
 * renders as a finished card rather than as a form with gaps in it.
 *
 * NOTHING HERE IS FETCHED FROM THE INSTITUTION'S OWN SITE. Same rule as the
 * news items next door, and the same reason — see the note in NewsItem.ts.
 * Everything in this record was typed in by somebody who checked it.
 */

/** One extra link on the detail page: a prospectus, an apply page, fees. */
export interface IUniversityLink {
  label: string;
  url: string;
}

export interface IUniversity {
  name: string;
  /** Derived from `name`, unique, and the address of the detail page. */
  slug: string;
  /** `/uploads/<file>` from the media upload, or an external URL. */
  logo: string;
  /** Must match a destination name on the client to be counted or filtered. */
  country?: string;
  city?: string;
  /** The institution's own site. */
  website?: string;
  /** Intake months, as the office writes them: "January", "September". */
  intakes: string[];
  /** Prospectus, apply page, scholarships — whatever is worth linking. */
  links: IUniversityLink[];
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type UniversityDocument = HydratedDocument<IUniversity>;

const linkSchema = new Schema<IUniversityLink>(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    url: { type: String, required: true, trim: true, maxlength: 800 },
  },
  { _id: false }
);

const universitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    /* Written by the service, never by the client — see universityService.
       Unique so two institutions cannot claim one address; indexed because
       the detail page looks a record up by it on every view. */
    slug: { type: String, required: true, unique: true, index: true },
    logo: { type: String, required: true, trim: true, maxlength: 800 },
    /* Indexed: the public list filters on it and the counts group by it. */
    country: { type: String, trim: true, maxlength: 80, index: true },
    city: { type: String, trim: true, maxlength: 120 },
    website: { type: String, trim: true, maxlength: 800 },
    intakes: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    links: { type: [linkSchema], default: [] },
    /* Published by default: an institution added to the partner list is a
       partner. The toggle is for taking one down, not for a drafting stage —
       the same rule the staff cards follow. */
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* Hand-ranked first, then oldest first, so a new partner lands at the bottom
   of a deliberately ordered wall rather than at the front of it. Matches the
   sort in the service. */
universitySchema.index({ order: 1, createdAt: 1 });

export const University: Model<IUniversity> = mongoose.model<IUniversity>(
  "University",
  universitySchema
);
