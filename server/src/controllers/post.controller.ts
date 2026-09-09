import { asyncHandler } from "../utils/asyncHandler.js";
import { postService } from "../services/post.service.js";
import { parsePagination } from "../utils/pagination.js";
import { POST_PAGES, type PostPage } from "../models/Post.js";

/**
 * `?on=` is the placement filter — the destination guides use it to ask for
 * their own related reading, and /blog?on=study-in-usa shows the same list
 * in full.
 *
 * An unrecognised value is dropped rather than refused. This is a public
 * read on a page anyone can link to: `?on=study-in-mars` should quietly be
 * "no filter" and return the blog, not a 400 that a reader who followed a
 * stale link has no way to act on. Placement is validated where it is
 * written (validators/post.schema.ts), which is where a mistake can still
 * be corrected.
 */
const parsePage = (value: unknown): PostPage | undefined =>
  typeof value === "string" && (POST_PAGES as readonly string[]).includes(value)
    ? (value as PostPage)
    : undefined;

export const listPublished = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query, { page: 1, limit: 9, maxLimit: 20 });
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;
  res.json(await postService.listPublished(pagination, { tag, on: parsePage(req.query.on) }));
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
