import path from "node:path";
import fs from "node:fs/promises";
import { Media, type IMedia, type MediaDocument } from "../models/Media.js";
import { ApiError } from "../utils/ApiError.js";
import { UPLOADS_DIR, mediaTypeFromMime } from "../middleware/upload.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";

interface UploadMeta {
  title?: string;
  caption?: string;
  album?: string;
  order?: number;
}

export const mediaService = {
  async list(
    { page, limit }: PaginationQuery,
    filters: { album?: string; type?: string } = {}
  ): Promise<PaginatedResult<MediaDocument>> {
    const filter: Record<string, unknown> = {};
    if (filters.album) filter.album = filters.album;
    if (filters.type) filter.type = filters.type;

    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("album", "title slug"),
      Media.countDocuments(filter),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async getById(id: string): Promise<MediaDocument> {
    const media = await Media.findById(id);
    if (!media) throw ApiError.notFound("Media not found");
    return media;
  },

  async createFromUpload(
    file: Express.Multer.File,
    meta: UploadMeta,
    uploadedBy: string
  ): Promise<MediaDocument> {
    return Media.create({
      type: mediaTypeFromMime(file.mimetype),
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      title: meta.title,
      caption: meta.caption,
      album: meta.album || undefined,
      order: meta.order ?? 0,
      uploadedBy,
    });
  },

  /**
   * Put a new file behind an existing record.
   *
   * THE RECORD SURVIVES, AND THAT IS THE POINT. Deleting and re-uploading
   * would give the picture a new id, drop it to the end of its album and
   * lose its title, caption and position — so "replace this one" would
   * silently mean "remove this and add another somewhere else". Here the
   * document keeps its identity and only the bytes behind it change, so a
   * photograph swapped in a published gallery lands exactly where the old
   * one was.
   *
   * The old file is unlinked AFTER the record is saved, never before: if the
   * write fails, the record still points at a file that exists. The reverse
   * order would leave a live gallery pointing at nothing.
   */
  async replaceFile(id: string, file: Express.Multer.File): Promise<MediaDocument> {
    const media = await this.getById(id);
    const oldUrl = media.url;

    media.type = mediaTypeFromMime(file.mimetype);
    media.url = `/uploads/${file.filename}`;
    media.mimeType = file.mimetype;
    media.size = file.size;
    await media.save();

    /* basename() and a join into UPLOADS_DIR, so a url that has been
       tampered with in the database cannot walk this unlink out of the
       uploads folder. */
    const old = path.basename(oldUrl);
    if (old && old !== path.basename(media.url)) {
      await fs.unlink(path.join(UPLOADS_DIR, old)).catch(() => {
        /* Already gone, or never on disk. The record is correct either way,
           and a stale file is a housekeeping problem, not a broken page. */
      });
    }
    return media;
  },

  async update(
    id: string,
    input: Partial<Pick<IMedia, "title" | "caption" | "order">> & { album?: string | null }
  ): Promise<MediaDocument> {
    const media = await this.getById(id);
    const { album, ...rest } = input;
    Object.assign(media, rest);
    if (album !== undefined) media.set("album", album); // null detaches from album
    await media.save();
    return media;
  },

  /** Deletes the DB record and the file on disk. */
  async remove(id: string): Promise<void> {
    const media = await Media.findByIdAndDelete(id);
    if (!media) throw ApiError.notFound("Media not found");
    const filename = path.basename(media.url);
    await fs.unlink(path.join(UPLOADS_DIR, filename)).catch(() => {
      /* file already gone — DB record removed is what matters */
    });
  },
};
