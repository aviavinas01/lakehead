import { z } from "zod";
import { SERVICES, INQUIRY_STATUSES, INQUIRY_SOURCES } from "../models/Inquiry.js";

/**
 * The full forms and the two-field callback strip, in one schema.
 *
 * `email` and `message` are optional HERE and re-required by the refinement
 * below for every source except "callback". Doing it that way rather than
 * simply relaxing them keeps the contact and consultation forms exactly as
 * strict as they were — a blank message on those is still rejected — while
 * letting the strip send the only two fields it asks for.
 */
export const createInquirySchema = z.object({
  body: z
    .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email().optional(),
    phone: z.string().trim().max(20).optional(),
    service: z.enum(SERVICES).default("other"),
    message: z.string().trim().max(2000).optional(),
    /* Which form sent this. Defaulted rather than required so that a browser
       still running a build from before this field existed keeps working —
       and note this object is not .strict(), so an unrecognised key from a
       newer client is stripped rather than rejected. Between the two, the
       client and the server can deploy in either order. */
    source: z.enum(INQUIRY_SOURCES).default("unknown"),
    })
    .superRefine((body, ctx) => {
      /* Mirrors the guard on the model: a row with neither is an enquiry
         nobody can answer. */
      if (!body.email && !body.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Enter a phone number or an email address",
        });
      }
      /* The callback strip has no message box. Every other form does, and
         keeps the ten-character minimum it always had. */
      if (body.source !== "callback") {
        const written = body.message?.trim() ?? "";
        if (written.length < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["message"],
            message: "Message must be at least 10 characters",
          });
        }
      }
    }),
});

export const updateInquirySchema = z.object({
  body: z.object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    notes: z.string().max(2000).optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
