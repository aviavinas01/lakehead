import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export const SERVICES = [
  "study-abroad",
  "test-preparation",
  "visa-guidance",
  "career-counselling",
  "other",
] as const;
export type ServiceType = (typeof SERVICES)[number];

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

/**
 * Which form this came from.
 *
 * Every form on the site posts the same four fields and folds its own extra
 * answers into `message`, which is fine for storage and useless for telling
 * a booked consultation apart from a general question. This says which one
 * it was, so the dashboard can filter and the notification email can put it
 * in the subject line.
 *
 * "unknown" is the default and covers two real cases: a submission from a
 * browser running a copy of the site built before this field existed, and
 * anything posted to the API directly.
 */
export const INQUIRY_SOURCES = [
  "consultation",
  "contact",
  "about",
  "study-abroad",
  "unknown",
] as const;
export type InquirySource = (typeof INQUIRY_SOURCES)[number];

/** Whether the notification email got out, and why not if it did not. */
export const NOTIFY_STATES = ["sent", "failed", "skipped"] as const;
export type NotifyState = (typeof NOTIFY_STATES)[number];

export interface NotifyRecord {
  state: NotifyState;
  at: Date;
  /** Present on "failed" and "skipped" — shown in the admin. */
  reason?: string;
}

export interface IInquiry {
  name: string;
  email: string;
  phone?: string;
  service: ServiceType;
  message: string;
  status: InquiryStatus;
  source: InquirySource;
  notes?: string;
  /* Optional because it is written after the document is created, and is
     absent entirely on every inquiry taken before mail existed. */
  notified?: NotifyRecord;
  createdAt: Date;
  updatedAt: Date;
}

export type InquiryDocument = HydratedDocument<IInquiry>;

const inquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 20 },
    service: { type: String, enum: SERVICES, default: "other" },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: INQUIRY_STATUSES, default: "new" },
    source: { type: String, enum: INQUIRY_SOURCES, default: "unknown" },
    notes: { type: String, maxlength: 2000 },
    /* _id: false — this is one embedded record, not a collection of them,
       and an id on it would be noise in every API response. */
    notified: {
      type: new Schema<NotifyRecord>(
        {
          state: { type: String, enum: NOTIFY_STATES, required: true },
          at: { type: Date, required: true },
          reason: { type: String, maxlength: 300 },
        },
        { _id: false }
      ),
      required: false,
    },
  },
  { timestamps: true }
);

export const Inquiry: Model<IInquiry> = mongoose.model<IInquiry>("Inquiry", inquirySchema);
