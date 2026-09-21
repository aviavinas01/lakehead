import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import { INQUIRY_STATUSES, NOTIFY_STATES, type InquiryStatus, type NotifyRecord } from "./Inquiry.js";

/**
 * An IELTS test booking request — the online version of the paper
 * declaration IDP and the British Council each ask candidates to sign.
 *
 * ------------------------------------------------------------------
 * ITS OWN COLLECTION, NOT AN INQUIRY WITH EXTRA TEXT. Every other form on the
 * site folds its answers into `Inquiry.message`, which is fine for "tell us
 * about yourself" and wrong here: a booking is a dozen structured fields the
 * office copies into a provider's system one by one, and one of them is a
 * passport number. Flattened into free text it could not be sorted by exam
 * date, filtered by provider, or kept out of places a passport number should
 * not go — the notification email, for one.
 *
 * It SHARES the inquiry workflow on purpose: the same three statuses and the
 * same two delivery records, so the admin reads both tabs the same way and
 * nobody has to learn a second vocabulary for "we've called them back".
 *
 * THE PASSPORT NUMBER AND THE SIGNATURE ARE THE SENSITIVE PART. Neither is
 * emailed anywhere, and the signature is never publicly reachable — see
 * services/signatureStore.ts. Deleting a booking deletes its signature.
 * ------------------------------------------------------------------
 */

export const TEST_PROVIDERS = ["idp", "british-council"] as const;
export type TestProvider = (typeof TEST_PROVIDERS)[number];

export const TEST_MODULES = ["academic", "general-training"] as const;
export type TestModule = (typeof TEST_MODULES)[number];

/** Where a signature's bytes are, recorded at write time. See SignatureRef. */
export const SIGNATURE_BACKENDS = ["disk", "cloudinary"] as const;
export type SignatureBackend = (typeof SIGNATURE_BACKENDS)[number];

/**
 * How to find a stored signature again.
 *
 * THE BACKEND IS WRITTEN DOWN, not inferred from today's configuration.
 * Signatures taken on disk before Cloudinary was switched on must still be
 * readable afterwards — and the reverse — so the record says where its own
 * bytes went rather than trusting whichever store is configured now.
 *
 * There is deliberately NO url. A url would be a way in; this is only a
 * handle that the admin-only endpoint resolves.
 */
export interface SignatureRef {
  backend: SignatureBackend;
  /** Random filename on disk, or the Cloudinary public id. */
  key: string;
  /** Served back as the Content-Type. */
  mime: string;
  bytes: number;
}

export interface ITestBooking {
  provider: TestProvider;
  /** Exactly as printed in the passport — the thing the test centre checks. */
  fullName: string;
  passportNumber: string;
  examDate: Date;
  testCity: string;
  module: TestModule;
  email: string;
  /** Asked for on the British Council form only. */
  alternateEmail?: string;
  phone: string;
  signature: SignatureRef;
  status: InquiryStatus;
  notes?: string;
  notified?: NotifyRecord;
  acknowledged?: NotifyRecord;
  /** The "date of signature" on the paper form: when they submitted it. Set
      by the server — a client-supplied date is a claim, this is a fact. */
  createdAt: Date;
  updatedAt: Date;
}

export type TestBookingDocument = HydratedDocument<ITestBooking>;

const notifySchema = new Schema<NotifyRecord>(
  {
    state: { type: String, enum: NOTIFY_STATES, required: true },
    at: { type: Date, required: true },
    reason: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const testBookingSchema = new Schema<ITestBooking>(
  {
    provider: { type: String, enum: TEST_PROVIDERS, required: true },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    passportNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
    examDate: { type: Date, required: true },
    testCity: { type: String, required: true, trim: true, maxlength: 60 },
    module: { type: String, enum: TEST_MODULES, required: true },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    alternateEmail: { type: String, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    signature: {
      type: new Schema<SignatureRef>(
        {
          backend: { type: String, enum: SIGNATURE_BACKENDS, required: true },
          key: { type: String, required: true },
          mime: { type: String, required: true },
          bytes: { type: Number, required: true },
        },
        { _id: false }
      ),
      required: true,
    },
    status: { type: String, enum: INQUIRY_STATUSES, default: "new" },
    notes: { type: String, maxlength: 2000 },
    notified: { type: notifySchema, required: false },
    acknowledged: { type: notifySchema, required: false },
  },
  {
    timestamps: true,
    /* THE STORAGE KEY NEVER LEAVES THE SERVER. Knowing it would not open
       anything — the folder is blocked and Cloudinary wants a signature — but
       it is an address, and nothing outside this process needs one. The
       admin sees the image through /test-bookings/:id/signature instead.
       On toJSON, so it holds for every response rather than for whichever
       controller remembered to strip it. */
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        const sig = ret.signature as Partial<SignatureRef> | undefined;
        if (sig) ret.signature = { mime: sig.mime, bytes: sig.bytes };
        return ret;
      },
    },
  }
);

/* The admin list is newest first, filtered by status and by provider. */
testBookingSchema.index({ createdAt: -1 });
testBookingSchema.index({ status: 1, provider: 1, createdAt: -1 });

export const TestBooking: Model<ITestBooking> = mongoose.model<ITestBooking>(
  "TestBooking",
  testBookingSchema
);
