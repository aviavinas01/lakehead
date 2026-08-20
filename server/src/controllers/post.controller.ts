import { asyncHandler } from "../utils/asyncHandler.js";
import { postService } from "../services/post.service.js";
import { parsePagination } from "../utils/pagination.js";

export const listPublished = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { page: 1, limit: 9, maxLimit: 20 });
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
  res.json(await postService.listPublished(pagination, tag));
});

export const getBySlug = asyncHandler(async (req, res) => {
  res.json({ post: await postService.getPublishedBySlug(req.params.slug as string) });
});

export const listAll = asyncHandler(async (_req, res) => {
  res.json({ posts: await postService.listAll() });
});

export const getById = asyncHandler(async (req, res) => {
  res.json({ post: await postService.getById(req.params.id as string) });
});

export const create = asyncHandler(async (req, res) => {
  const post = await postService.create(req.body, req.user!._id.toString());
  res.status(201).json({ post });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ post: await postService.update(req.params.id as string, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await postService.remove(req.params.id as string);
  res.json({ message: "Post deleted" });
});
