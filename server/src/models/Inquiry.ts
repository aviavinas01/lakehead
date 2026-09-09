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
  /* The "Drop us a line" section above the footer on the home page. Its own
     value rather than "unknown": that one means we genuinely do not know,
     and spending it on a source we DO know would make the honest case
     unreadable. */
  "home",
  /* The two-field strip that appears under several sections: a name and a
     phone number and nothing else. It is the only source that arrives with
     no email address and no message, which is why both of those stopped
     being required below. */
  "callback",
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
  /**
   * OPTIONAL, and the schema below enforces "email or phone, at least one".
   *
   * It was required until the callback strip existed, which asks for a name
   * and a number and nothing else — the shortest form that is still worth
   * submitting. Requiring an address there would mean either turning a
   * two-field ask into a three-field one, or writing a fake address into the
   * database, and a column of `noreply@` rows is worse than an empty one.
   */
  email?: string;
  phone?: string;
  service: ServiceType;
  /** Empty for a callback request — there is no box to type one in. */
  message: string;
  status: InquiryStatus;
  source: InquirySource;
  notes?: string;
  /* Optional because it is written after the document is created, and is
     absent entirely on every inquiry taken before mail existed. */
  notified?: NotifyRecord;
  /**
   * The acknowledgement sent to the ENQUIRER, tracked separately from the
   * office notification above.
   *
   * Two records rather than one because they can genuinely differ, and the
   * difference is the useful part: the office copy going out while the
   * student's bounces is a wrong address, and the reverse is a problem with
   * our own inbox. Collapsing them into one state would hide whichever
   * failed. "skipped" here is the ordinary case for a call-back request,
   * which leaves a phone number and no address.
   */
  acknowledged?: NotifyRecord;
  createdAt: Date;
  updatedAt: Date;
}

export type InquiryDocument = HydratedDocument<IInquiry>;

const inquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 20 },
    service: { type: String, enum: SERVICES, default: "other" },
    message: { type: String, default: "", maxlength: 2000 },
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
    /* Same shape, different question — see the note on the interface. */
    acknowledged: {
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

/**
 * AT LEAST ONE WAY TO REACH THEM. Neither field is required on its own any
 * more, which without this would allow a row with a name and no contact
 * details at all — an enquiry nobody can answer, which is worse than a
 * rejected submission because it looks like work waiting to be done.
 *
 * On the schema rather than only in the request validator, so it also holds
 * for anything written by a script or a future endpoint.
 */
inquirySchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    next(new Error("An inquiry needs either an email address or a phone number"));
    return;
  }
  next();
});

export const Inquiry: Model<IInquiry> = mongoose.model<IInquiry>("Inquiry", inquirySchema);
