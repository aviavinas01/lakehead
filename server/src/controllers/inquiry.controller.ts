import { asyncHandler } from "../utils/asyncHandler.js";
import { inquiryService } from "../services/inquiry.service.js";
import { parsePagination } from "../utils/pagination.js";
import { INQUIRY_STATUSES, type InquiryStatus } from "../models/Inquiry.js";

export const create = asyncHandler(async (req, res) => {
  const inquiry = await inquiryService.create(req.body);
  res.status(201).json({
    message: "Thank you! We'll get back to you within 24 hours.",
    id: inquiry._id,
  });
});

export const list = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { page: 1, limit: 20, maxLimit: 100 });
  const raw = req.query.status;
  const status =
    typeof raw === "string" && (INQUIRY_STATUSES as readonly string[]).includes(raw)
      ? (raw as InquiryStatus)
      : undefined;
  res.json(await inquiryService.list(pagination, status));
});

export const update = asyncHandler(async (req, res) => {
  res.json({ inquiry: await inquiryService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await inquiryService.remove(req.params.id as string);
  res.json({ message: "Inquiry deleted" });
});

export const stats = asyncHandler(async (_req, res) => {
  res.json({ stats: await inquiryService.stats() });
});
