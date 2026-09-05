import { z } from "zod";
import { SERVICES, INQUIRY_STATUSES, INQUIRY_SOURCES } from "../models/Inquiry.js";

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email(),
    phone: z.string().trim().max(20).optional(),
    service: z.enum(SERVICES).default("other"),
    message: z.string().trim().min(10).max(2000),
    /* Which form sent this. Defaulted rather than required so that a browser
       still running a build from before this field existed keeps working —
       and note this object is not .strict(), so an unrecognised key from a
       newer client is stripped rather than rejected. Between the two, the
       client and the server can deploy in either order. */
    source: z.enum(INQUIRY_SOURCES).default("unknown"),
  }),
});

export const updateInquirySchema = z.object({
  body: z.object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    notes: z.string().max(2000).optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
