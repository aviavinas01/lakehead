import { Director, type IDirector, type DirectorDocument } from "../models/Director.js";
import {
  StaffMember,
  type IStaffMember,
  type StaffMemberDocument,
} from "../models/StaffMember.js";
import { ApiError } from "../utils/ApiError.js";
import { toPatch, toCreate } from "../utils/patch.js";

/** Every property optional, and every optional one clearable. */
type Nullable<T> = { [K in keyof T]?: T[K] | null };

export type DirectorInput = Nullable<
  Pick<IDirector, "name" | "title" | "photo" | "lead" | "statement" | "published">
>;

export type StaffInput = Nullable<
  Pick<IStaffMember, "name" | "title" | "photo" | "quote" | "published" | "order">
>;

/* Hand-ranked first, then oldest first, so a new hire lands at the bottom of
   a deliberately ordered team rather than at the top. Matches the index. */
const STAFF_ORDER = { order: 1, createdAt: 1 } as const;

export const peopleService = {
  /**
   * The message as the public site sees it — or null.
   *
   * Null is a normal answer, not an error: until somebody writes and
   * publishes one there is no message, and the page says so rather than
   * 404ing. A 404 here would also be a worse answer for the router, which
   * would have to distinguish "no message yet" from "bad address".
   */
  async getPublishedDirector(): Promise<DirectorDocument | null> {
    return Director.findOne({ key: "director", published: true });
  },

  /** The record as the admin sees it, published or not. */
  async getDirector(): Promise<DirectorDocument | null> {
    return Director.findOne({ key: "director" });
  },

  /**
   * Write the message, creating it the first time.
   *
   * An upsert rather than a create-or-update pair, because "does it exist
   * yet" is a question the admin screen should never have to ask and the
   * answer can change between asking and writing. `key` is uniquely indexed,
   * so two simultaneous saves settle into one record instead of two.
   */
  async saveDirector(input: DirectorInput): Promise<DirectorDocument> {
    const doc = await Director.findOneAndUpdate(
      { key: "director" },
      { ...toPatch(input), $setOnInsert: { key: "director" } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return doc;
  },

  async listPublishedStaff(): Promise<StaffMemberDocument[]> {
    return StaffMember.find({ published: true }).sort(STAFF_ORDER);
  },

  async listAllStaff(): Promise<StaffMemberDocument[]> {
    return StaffMember.find().sort(STAFF_ORDER);
  },

  async createStaff(input: StaffInput): Promise<StaffMemberDocument> {
    return StaffMember.create(toCreate(input));
  },

  async updateStaff(id: string, input: StaffInput): Promise<StaffMemberDocument> {
    /* See the note in news.service: without runValidators a PATCH skips
       maxlength and every other schema rule. */
    const member = await StaffMember.findByIdAndUpdate(id, toPatch(input), {
      new: true,
      runValidators: true,
    });
    if (!member) throw ApiError.notFound("Staff member not found");
    return member;
  },

  async removeStaff(id: string): Promise<void> {
    const member = await StaffMember.findByIdAndDelete(id);
    if (!member) throw ApiError.notFound("Staff member not found");
  },
};
