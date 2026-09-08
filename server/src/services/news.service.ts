import { NewsItem, type INewsItem, type NewsItemDocument } from "../models/NewsItem.js";
import { ApiError } from "../utils/ApiError.js";
import { toCreate, toPatch } from "../utils/patch.js";

/** `null` clears a field — see utils/patch. */
export type NewsInput = Nullable<
  Pick<
    INewsItem,
    | "title"
    | "url"
    | "image"
    | "summary"
    | "source"
    | "publishedAt"
    | "published"
    | "order"
  >
>;

/** Every property optional, and every optional one clearable. */
type Nullable<T> = { [K in keyof T]?: T[K] | null };

/* Hand-ranked first, then by the article's own date, then by when it was
   added — so a link with no date still lands somewhere sensible rather than
   at the very bottom for ever. Matches the compound index on the model. */
const ORDER = { order: 1, publishedAt: -1, createdAt: -1 } as const;

export const newsService = {
  async listPublished(limit?: number): Promise<NewsItemDocument[]> {
    const q = NewsItem.find({ published: true }).sort(ORDER);
    return limit ? q.limit(limit) : q;
  },

  async listAll(): Promise<NewsItemDocument[]> {
    return NewsItem.find().sort(ORDER);
  },

  async create(input: NewsInput): Promise<NewsItemDocument> {
    return NewsItem.create(toCreate(input));
  },

  async update(id: string, input: NewsInput): Promise<NewsItemDocument> {
    /* See the note in event.service: without this a PATCH skips maxlength
       and every other schema rule. */
    const item = await NewsItem.findByIdAndUpdate(id, toPatch(input), {
      new: true,
      runValidators: true,
    });
    if (!item) throw ApiError.notFound("News item not found");
    return item;
  },

  async remove(id: string): Promise<void> {
    const item = await NewsItem.findByIdAndDelete(id);
    if (!item) throw ApiError.notFound("News item not found");
  },
};
