import {
  TestBooking,
  type ITestBooking,
  type TestBookingDocument,
  type TestProvider,
} from "../models/TestBooking.js";
import type { InquiryStatus, NotifyRecord } from "../models/Inquiry.js";
import { ApiError } from "../utils/ApiError.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";

type CreateInput = Pick<
  ITestBooking,
  | "provider"
  | "fullName"
  | "passportNumber"
  | "examDate"
  | "testCity"
  | "module"
  | "email"
  | "phone"
  | "signature"
> &
  Partial<Pick<ITestBooking, "alternateEmail">>;

export const testBookingService = {
  async create(input: CreateInput): Promise<TestBookingDocument> {
    return TestBooking.create(input);
  },

  async list(
    { page, limit }: PaginationQuery,
    filter: { status?: InquiryStatus; provider?: TestProvider } = {}
  ): Promise<PaginatedResult<TestBookingDocument>> {
    const query: Record<string, string> = {};
    if (filter.status) query.status = filter.status;
    if (filter.provider) query.provider = filter.provider;
    const [items, total] = await Promise.all([
      TestBooking.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      TestBooking.countDocuments(query),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async get(id: string): Promise<TestBookingDocument> {
    const booking = await TestBooking.findById(id);
    if (!booking) throw ApiError.notFound("Test booking not found");
    return booking;
  },

  async update(
    id: string,
    input: Partial<Pick<ITestBooking, "status" | "notes">>
  ): Promise<TestBookingDocument> {
    const booking = await TestBooking.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!booking) throw ApiError.notFound("Test booking not found");
    return booking;
  },

  /**
   * The delivery record for one of the two emails. Written by the server
   * about itself, never settable over the API, and never throws — see the
   * identical note in inquiry.service.
   */
  async recordNotification(
    id: string,
    record: NotifyRecord,
    field: "notified" | "acknowledged" = "notified"
  ): Promise<void> {
    try {
      await TestBooking.updateOne({ _id: id }, { $set: { [field]: record } });
    } catch (err) {
      console.error("[test-booking] Could not record mail result:", err);
    }
  },

  /** Returns the deleted record so the caller can remove its signature. */
  async remove(id: string): Promise<TestBookingDocument> {
    const booking = await TestBooking.findByIdAndDelete(id);
    if (!booking) throw ApiError.notFound("Test booking not found");
    return booking;
  },
};
