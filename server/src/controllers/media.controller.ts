import { asyncHandler } from "../utils/asyncHandler.js";
import { mediaService } from "../services/media.service.js";
import { parsePagination } from "../utils/pagination.js";
import { ApiError } from "../utils/ApiError.js";

export const list = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { page: 1, limit: 24, maxLimit: 100 });
  const album = typeof req.query.album === "string" ? req.query.album : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  res.json(await mediaService.list(pagination, { album, type }));
});

export const upload = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded (expected field name: file)");
  const media = await mediaService.createFromUpload(
    req.file,
    req.body,
    req.user!._id.toString()
  );
  res.status(201).json({ media });
});

export const replaceFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Choose a file to replace it with");
  res.json({
    media: await mediaService.replaceFile(req.params.id as string, req.file),
  });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ media: await mediaService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await mediaService.remove(req.params.id as string);
  res.json({ message: "Media deleted" });
});
