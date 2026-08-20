import { z } from "zod";
import { SERVICES, INQUIRY_STATUSES } from "../models/Inquiry.js";

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email(),
    phone: z.string().trim().max(20).optional(),
    service: z.enum(SERVICES).default("other"),
    message: z.string().trim().min(10).max(2000),
  }),
});

export const updateInquirySchema = z.object({
  body: z.object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    notes: z.string().max(2000).optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
