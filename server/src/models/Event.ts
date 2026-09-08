import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

/**
 * One event the office is running — an information session, a university
 * visit, a mock test day.
 *
 * ENTIRELY OURS. Unlike the TikTok and YouTube rows there is nothing to
 * fetch and nobody else's API to depend on: an event exists because somebody
 * in the office typed it in, so every field here is written by hand and none
 * of it goes stale on its own.
 *
 * EMPTY IS THE NORMAL STATE. Lakehead runs events in bursts — around intake
 * deadlines, when a partner sends a delegation, before a departure season —
 * and is quiet in between. The public page is built around having nothing
 * on, so an empty collection is the expected answer and not a fault.
 */

/** Must stay in step with EventKind in client/src/data/events.ts. */
export const EVENT_KINDS = [
  "Information session",
  "University visit",
  "Workshop",
  "Mock test",
  "Pre-departure",
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export interface IEvent {
  title: string;
  /** The paragraph on the card. */
  blurb: string;
  /** `/uploads/<file>` from the media upload, or an external URL. Optional —
      the card lays out without one. */
  image?: string;
  /**
   * When it starts, as a real instant, for ordering and for the date on the
   * card. Optional because not every event has one yet.
   */
  startsAt?: Date;
  /**
   * FREE TEXT THAT WINS OVER `startsAt` WHEN IT IS SET, and the reason both
   * exist. A university visit is often "late March" and a class is often
   * "every Friday" — neither is a timestamp, and forcing one would make the
   * page state something more precise than the truth. `startsAt` still does
   * the sorting when it is there.
   */
  when?: string;
  kind?: EventKind;
  /** Which office, or "Online". */
  where?: string;
  /** Where to sign up, if it is not simply the contact form. */
  registerUrl?: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    blurb: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, trim: true, maxlength: 600 },
    startsAt: { type: Date },
    when: { type: String, trim: true, maxlength: 120 },
    kind: { type: String, enum: EVENT_KINDS },
    where: { type: String, trim: true, maxlength: 160 },
    registerUrl: { type: String, trim: true, maxlength: 600 },
    /* Drafted by default. An event is typed up before it is confirmed far
       more often than the reverse, and a half-written listing appearing on
       the public page the moment it is saved is the worse mistake. */
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* Hand-ranked first, then soonest, then newest. An untouched list reads
   sensibly on its own and only what somebody deliberately ordered moves. */
eventSchema.index({ order: 1, startsAt: 1, createdAt: -1 });

export const Event: Model<IEvent> = mongoose.model<IEvent>("Event", eventSchema);
