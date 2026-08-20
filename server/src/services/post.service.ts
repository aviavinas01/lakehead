import { Post, type IPost, type PostDocument } from "../models/Post.js";
import { ApiError } from "../utils/ApiError.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";

type CreatePostInput = Pick<IPost, "title" | "content"> &
  Partial<Pick<IPost, "excerpt" | "coverImage" | "tags" | "status">>;

export const postService = {
  async listPublished(
    { page, limit }: PaginationQuery,
    tag?: string
  ): Promise<PaginatedResult<Partial<PostDocument>>> {
    const filter: Record<string, unknown> = { status: "published" };
    if (tag) filter.tags = tag;

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("title slug excerpt coverImage tags publishedAt"),
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
