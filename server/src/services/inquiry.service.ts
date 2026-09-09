import {
  Inquiry,
  type IInquiry,
  type InquiryDocument,
  type InquiryStatus,
  type NotifyRecord,
} from "../models/Inquiry.js";
import { ApiError } from "../utils/ApiError.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";

/* Only the name is always there. A call-back request has a phone and no
   email or message; every other form has an email and a message. The model
   enforces "at least one way to reach them" — see the pre-validate hook. */
type CreateInquiryInput = Pick<IInquiry, "name"> &
  Partial<Pick<IInquiry, "email" | "message" | "phone" | "service" | "source">>;

export const inquiryService = {
  async create(input: CreateInquiryInput): Promise<InquiryDocument> {
    return Inquiry.create(input);
  },

  async list(
    { page, limit }: PaginationQuery,
    status?: InquiryStatus
  ): Promise<PaginatedResult<InquiryDocument>> {
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Inquiry.countDocuments(filter),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async update(
    id: string,
    input: Partial<Pick<IInquiry, "status" | "notes">>
  ): Promise<InquiryDocument> {
    const inquiry = await Inquiry.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!inquiry) throw ApiError.notFound("Inquiry not found");
    return inquiry;
  },

  /**
   * Writes the outcome of the notification email onto the inquiry.
   *
   * Deliberately separate from `update`, which is the admin's endpoint and
   * only accepts status and notes — the delivery record is written by the
   * server about itself and must not be settable over the API.
   *
   * A failure here is swallowed: this is called after the visitor's response
   * has already gone out, so there is nobody left to tell, and losing the
   * record of a sent email must not become a second error in the log.
   */
  async recordNotification(id: string, record: NotifyRecord): Promise<void> {
    try {
      await Inquiry.updateOne({ _id: id }, { $set: { notified: record } });
    } catch (err) {
      console.error("[inquiry] Could not record mail result:", err);
    }
  },

  async remove(id: string): Promise<void> {
    const result = await Inquiry.findByIdAndDelete(id);
    if (!result) throw ApiError.notFound("Inquiry not found");
  },

  async stats(): Promise<Record<string, number>> {
    const agg = await Inquiry.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(agg.map((r) => [r._id, r.count]));
  },
};
