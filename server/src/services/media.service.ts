import { Media, type IMedia, type MediaDocument } from "../models/Media.js";
import { ApiError } from "../utils/ApiError.js";
import { mediaTypeFromMime } from "../middleware/upload.js";
import type { PaginatedResult, PaginationQuery } from "../types/common.js";
import { albumFor, isAlbumKey } from "./managedAlbums.js";
import { store, discard } from "./storage.service.js";

interface UploadMeta {
  title?: string;
  caption?: string;
  /** An album id, chosen explicitly. Wins over `albumKey`. */
  album?: string;
  /** "blogs" | "team" — resolved to a real album, created if needed. */
  albumKey?: string;
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
    /* An explicit album id wins; otherwise a managed key is resolved to one,
       creating it on first use. A key that cannot be resolved leaves the
       picture unfiled rather than failing the upload — see managedAlbums. */
    let album = meta.album || undefined;
    if (!album && isAlbumKey(meta.albumKey)) {
      const resolved = await albumFor(meta.albumKey);
      if (resolved) album = resolved._id.toString();
    }

    /* Cloudinary or the local disk, depending on configuration — see
       services/storage.service. Either way what comes back is a url the
       client can render and, for Cloudinary, the handle needed to delete it
       again later. */
    const stored = await store(file);

    return Media.create({
      type: mediaTypeFromMime(file.mimetype),
      url: stored.url,
      publicId: stored.publicId,
      mimeType: file.mimetype,
      size: file.size,
      title: meta.title,
      caption: meta.caption,
      album,
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
    const oldPublicId = media.publicId;

    const stored = await store(file);
    media.type = mediaTypeFromMime(file.mimetype);
    media.url = stored.url;
    media.set("publicId", stored.publicId ?? null);
    media.mimeType = file.mimetype;
    media.size = file.size;
    await media.save();

    /* Discarded only once the record points at the new file, and never in a
       way that can throw — see discard() in storage.service. The guard is
       for the case where the backend handed back the same address, which a
       disk write can do if the filename collides. */
    if (oldUrl !== media.url) await discard(oldUrl, oldPublicId);

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
    /* The record going is what matters; the bytes are best-effort. See the
       note on discard() — it never throws, so a file that has already gone
       cannot leave a deleted record half-deleted. */
    await discard(media.url, media.publicId);
  },

};
