import { Post, type IPost, type PostDocument, type PostPage } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";

type CreatePostInput = Pick<IPost, "title" | "content"> &
  Partial<Pick<IPost, "excerpt" | "coverImage" | "tags" | "pages" | "status">>;

/** The optional narrowings on the public list. Both are simple equality. */
export interface PostFilters {
  /** A free-text tag, as written by the author. */
  tag?: string;
  /** A page key from POST_PAGES — where the post has been placed. */
  on?: PostPage;
}

export const postService = {
  /**
   * The public list. Two narrowings, and they compose: `on` is placement
   * (which page asked), `tag` is subject (what the piece is about).
   *
   * `pages` is an array in the document, so `{ pages: "study-in-usa" }` is
   * mongo's array-contains — the same shape the `tags` filter has always
   * used. Nothing here needs $in.
   *
   * The projection carries `pages` as well as `tags` so a card can say where
   * else a post lives without a second round trip.
   */
  async listPublished(
    { page, limit }: PaginationQuery,
    { tag, on }: PostFilters = {}
  ): Promise<PaginatedResult<Partial<PostDocument>>> {
    const filter: Record<string, unknown> = { status: "published" };
    if (tag) filter.tags = tag;
    if (on) filter.pages = on;

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title slug excerpt coverImage tags pages publishedAt"),
      Post.countDocuments(filter),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async getPublishedBySlug(slug: string): Promise<PostDocument> {
    const post = await Post.findOne({ slug, status: "published" }).populate("author", "name");
    if (!post) throw ApiError.notFound("Post not found");
    return post;
  },

  async listAll(): Promise<PostDocument[]> {
    return Post.find().sort({ createdAt: -1 }).populate("author", "name");
  },

  async getById(id: string): Promise<PostDocument> {
    const post = await Post.findById(id);
    if (!post) throw ApiError.notFound("Post not found");
    return post;
  },

  async create(input: CreatePostInput, authorId: string): Promise<PostDocument> {
    return Post.create({ ...input, author: authorId });
  },

  async update(id: string, input: Partial<CreatePostInput>): Promise<PostDocument> {
    const post = await this.getById(id);
    Object.assign(post, input);
    await post.save(); // triggers slug/publishedAt hooks
    return post;
  },

  async remove(id: string): Promise<void> {
    const result = await Post.findByIdAndDelete(id);
    if (!result) throw ApiError.notFound("Post not found");
  },
};
