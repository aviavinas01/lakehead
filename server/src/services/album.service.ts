import { Album, type IAlbum, type AlbumDocument } from "../models/Album.js";
import { Media, type MediaDocument } from "../models/Media.js";
import { mediaService } from "./media.service.js";
import { ApiError } from "../utils/ApiError.js";

type CreateAlbumInput = Pick<IAlbum, "title"> &
  Partial<Pick<IAlbum, "description" | "coverImage" | "published" | "order">>;

export const albumService = {
  async listPublished(): Promise<AlbumDocument[]> {
    return Album.find({ published: true }).sort({ order: 1, createdAt: -1 });
  },

  async getPublishedBySlug(
    slug: string
  ): Promise<{ album: AlbumDocument; media: MediaDocument[] }> {
    const album = await Album.findOne({ slug, published: true });
    if (!album) throw ApiError.notFound("Album not found");
    const media = await Media.find({ album: album._id }).sort({ order: 1, createdAt: 1 });
    return { album, media };
  },

  async listAll(): Promise<AlbumDocument[]> {
    return Album.find().sort({ order: 1, createdAt: -1 });
  },

  async getById(id: string): Promise<AlbumDocument> {
    const album = await Album.findById(id);
    if (!album) throw ApiError.notFound("Album not found");
    return album;
  },

  async create(input: CreateAlbumInput): Promise<AlbumDocument> {
    return Album.create(input);
  },

  async update(id: string, input: Partial<CreateAlbumInput>): Promise<AlbumDocument> {
    const album = await this.getById(id);
    Object.assign(album, input);
    await album.save(); // triggers slug hook
    return album;
  },

  /** Deletes the album and all media (files included) inside it. */
  async remove(id: string): Promise<void> {
    const album = await Album.findByIdAndDelete(id);
    if (!album) throw ApiError.notFound("Album not found");
    const media = await Media.find({ album: album._id });
    await Promise.all(media.map((m) => mediaService.remove(m._id.toString())));
  },
};
