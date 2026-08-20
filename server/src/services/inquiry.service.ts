import {
  Inquiry,
  type IInquiry,
  type InquiryDocument,
  type InquiryStatus,
} from "../models/Inquiry.js";
import { ApiError } from "../utils/ApiError.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";

type CreateInquiryInput = Pick<IInquiry, "name" | "email" | "message"> &
  Partial<Pick<IInquiry, "phone" | "service">>;

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
