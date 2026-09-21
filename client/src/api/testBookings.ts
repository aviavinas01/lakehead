import api from "./client";
import type { InquiryStatus, NotifyRecord, Paginated } from "../types/api";

/**
 * IELTS booking requests — the IDP and British Council forms, and the admin
 * tab that lists them. Server side: routes/v1/testBooking.routes.ts.
 */

export type TestProvider = "idp" | "british-council";
export type TestModule = "academic" | "general-training";

export interface TestBooking {
  _id: string;
  provider: TestProvider;
  fullName: string;
  passportNumber: string;
  /** ISO string at UTC midnight — a calendar day. See formatExamDay. */
  examDate: string;
  testCity: string;
  module: TestModule;
  email: string;
  alternateEmail?: string;
  phone: string;
  /** Only the type and size. The image itself is behind signatureSrc(). */
  signature: { mime: string; bytes: number };
  status: InquiryStatus;
  notes?: string;
  notified?: NotifyRecord;
  acknowledged?: NotifyRecord;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sends the form. It is multipart because it carries the signature image —
 * axios sets the boundary itself when handed a FormData, so no Content-Type
 * is given here (setting one by hand would drop the boundary and the server
 * could not read a single field).
 */
export const submitTestBooking = async (form: FormData) =>
  (await api.post<{ message: string; id: string }>("/test-bookings", form)).data;

export const fetchTestBookings = async (params: {
  page: number;
  status?: InquiryStatus;
  provider?: TestProvider;
}) => {
  const q = new URLSearchParams({ page: String(params.page), limit: "20" });
  if (params.status) q.set("status", params.status);
  if (params.provider) q.set("provider", params.provider);
  return (await api.get<Paginated<TestBooking>>(`/test-bookings?${q}`)).data;
};

export const updateTestBooking = async (id: string, input: { status?: InquiryStatus; notes?: string }) =>
  (await api.patch<{ booking: TestBooking }>(`/test-bookings/${id}`, input)).data.booking;

export const deleteTestBooking = async (id: string) => {
  await api.delete(`/test-bookings/${id}`);
};

/**
 * Where the admin's browser fetches a signature from — an admin-only route
 * that streams the image, never a public address. Built from the same base
 * as every other call, so the session cookie goes with it and the
 * /api rewrite keeps it first-party.
 */
export const signatureSrc = (id: string) =>
  api.getUri({ url: `/test-bookings/${id}/signature` });

/** The exam date is a calendar day stored at UTC midnight, so it is shown in
    UTC. In local time it would read as the day before for anyone west of
    Greenwich. */
export const formatExamDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
