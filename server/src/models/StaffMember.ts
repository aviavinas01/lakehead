import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * One person on the team, as shown on /about.
 *
 * A card is a photograph, a name, what they do, and one line in their own
 * words. The quote is optional and the card is designed to look right
 * without it — half a team will not want to be quoted, and a grid where
 * three cards have a sentence and three have an empty gap is worse than a
 * grid with none.
 *
 * Deliberately NOT the same record as the director (models/Director.ts).
 * They look similar and are not: one is a singleton with a long statement
 * and a page of its own, the other is a list of short cards. Sharing a
 * collection would mean every staff card carrying an unused statement field
 * and every query remembering to exclude one row.
 */
export interface IStaffMember {
  name: string;
  /** Role, as it should read under the name. */
  title: string;
  /** `/uploads/<file>` from the media upload, or an external URL. */
  photo?: string;
  /** One line in their own words. Optional on purpose. */
  quote?: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StaffMemberDocument = HydratedDocument<IStaffMember>;

const staffSchema = new Schema<IStaffMember>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    photo: { type: String, trim: true, maxlength: 800 },
    quote: { type: String, trim: true, maxlength: 600 },
    /* Published by default: somebody added to the team list is on the team.
       The toggle is for taking a card down, not for a drafting stage. */
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* Hand-ranked first, then oldest first — so a new hire lands at the bottom
   rather than jumping to the front of a deliberately ordered team. Matches
   the sort in the service. */
staffSchema.index({ order: 1, createdAt: 1 });

export const StaffMember: Model<IStaffMember> = mongoose.model<IStaffMember>(
  "StaffMember",
  staffSchema
);
