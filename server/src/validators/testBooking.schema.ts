import { z } from "zod";
import { INQUIRY_STATUSES } from "../models/Inquiry.js";
import { TEST_MODULES, TEST_PROVIDERS } from "../models/TestBooking.js";

/**
 * The test-booking form.
 *
 * It arrives as multipart (it carries the signature image), so every field
 * here is a STRING on the wire, whatever it means — the date, the checkbox,
 * all of it. Hence the coercions.
 *
 * The object is not .strict(): an unrecognised field from a newer client is
 * stripped rather than rejected, so the two can deploy in either order.
 */

/** Blank inputs arrive as "", which is "not given" rather than "invalid". */
const blankToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

/* "YYYY-MM-DD", which is what <input type="date"> sends on every browser. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const DAY_MS = 24 * 60 * 60 * 1000;

export const createTestBookingSchema = z.object({
  body: z
    .object({
      provider: z.enum(TEST_PROVIDERS),

      /* The name the test centre will check against the passport. Letters
         in any script, spaces, and the punctuation real names carry —
         nothing else, because a digit or a symbol in here is always a typo
         and the one typo that gets a candidate turned away on the day. */
      fullName: z
        .string()
        .trim()
        .min(2, "Enter your full name as it appears in your passport")
        .max(100)
        .regex(/^[\p{L}\p{M} .'-]+$/u, "Use your name exactly as it is printed in your passport"),

      /* Spaces removed and upper-cased before checking, because people copy
         it from the photo page with gaps in it. */
      passportNumber: z
        .string()
        .transform((v) => v.replace(/\s+/g, "").toUpperCase())
        .pipe(
          z
            .string()
            .regex(/^[A-Z0-9]{6,12}$/, "Check your passport number — letters and digits only")
        ),

      /* The exam date must be one that has not passed. Compared against
         YESTERDAY in UTC rather than today, so a candidate in Nepal
         (UTC+5:45) choosing today's date just after midnight is not refused
         because the server's day has not turned over yet. */
      examDate: z
        .string()
        .regex(ISO_DAY, "Choose an exam date")
        .transform((v) => new Date(`${v}T00:00:00Z`))
        .refine((d) => !Number.isNaN(d.getTime()), "Choose a valid exam date")
        .refine((d) => d.getTime() >= Date.now() - DAY_MS, "The exam date has already passed")
        .refine(
          (d) => d.getTime() <= Date.now() + 2 * 365 * DAY_MS,
          "Choose an exam date within the next two years"
        ),

      testCity: z.string().trim().min(2, "Enter the city you want to sit the test in").max(60),

      module: z.enum(TEST_MODULES, {
        errorMap: () => ({ message: "Choose Academic or General Training" }),
      }),

      email: z.string().trim().email("Enter a valid email address").max(254),

      alternateEmail: z.preprocess(
        blankToUndefined,
        z.string().trim().email("Enter a valid alternative email address").max(254).optional()
      ),

      /* Seven to fifteen digits, with the spaces, dashes and leading + that
         people actually type. */
      phone: z
        .string()
        .trim()
        .regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid phone number")
        .refine((v) => {
          const digits = v.replace(/\D/g, "").length;
          return digits >= 7 && digits <= 15;
        }, "Enter a valid phone number"),

      /* The "I confirm these match my passport" box. A checkbox sends the
         string "true", or nothing at all when it is unticked. */
      confirm: z.literal("true", {
        errorMap: () => ({ message: "Please confirm your details match your passport" }),
      }),
    })
    .superRefine((body, ctx) => {
      if (
        body.alternateEmail &&
        body.alternateEmail.toLowerCase() === body.email.toLowerCase()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["alternateEmail"],
          message: "Use a different address from your main email, or leave it blank",
        });
      }
    })
    /* The alternative email belongs to the British Council form only. An IDP
       booking that somehow sends one has it dropped rather than refused —
       it is harmless, just not ours to keep. The confirmation box is
       dropped once checked: it is a condition of submitting, not data. */
    .transform(({ confirm: _confirm, ...body }) => ({
      ...body,
      alternateEmail: body.provider === "british-council" ? body.alternateEmail : undefined,
    })),
});

export const updateTestBookingSchema = z.object({
  body: z.object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    notes: z.string().max(2000).optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});

export const testBookingIdSchema = z.object({
  params: z.object({ id: z.string().length(24) }),
});
