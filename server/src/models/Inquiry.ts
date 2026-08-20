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

export interface IInquiry {
  name: string;
  email: string;
  phone?: string;
  service: ServiceType;
  message: string;
  status: InquiryStatus;
  notes?: string;
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
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Inquiry: Model<IInquiry> = mongoose.model<IInquiry>("Inquiry", inquirySchema);
