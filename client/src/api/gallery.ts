import api from "./client";
import { mediaSrc } from "./media";
import type { Album, Media, Paginated } from "../types/api";

/**
 * Reads the gallery out of the albums and media the admin has published.
 *
 * WHAT THE ADMIN ALREADY CONTROLS. The backing model is the one that has
 * been there all along — server/src/models/Album.ts and Media.ts, exposed
 * publicly as `GET /albums` (published only) and `GET /media`. So the page
 * below is not waiting on a feature: an editor creating an album, publishing
 * it and uploading files into it changes this page today. Every section on
 * the gallery is one album, in the album's own `order`, with the album's
 * `title` as the display heading and its `description` as the standfirst.
 *
 * WHAT IS STILL TO COME. `description` and `order` exist on the model but
 * the media library screen does not yet offer fields for them, so today they
 * arrive empty and zero. The page is written to honour both the moment those
 * inputs are added — an album with no description simply renders without a
 * standfirst rather than with a gap.
 *
 * WHY TWO REQUESTS AND NOT N+1. `GET /albums/slug/:slug` returns one album
 * with its media, which would mean a request per album. `GET /media` instead
 * returns every image at once with its album populated, so the whole gallery
 * is two requests however many albums there are, and the grouping happens
 * here.
 */

/** Media pages to walk at most, so a runaway library cannot hang the page. */
const MAX_PAGES = 5;
const PAGE_SIZE = 100;

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  images: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  src: string;
  title?: string;
  caption?: string;
  /** The album it belongs to, for the lightbox's caption line. */
  album?: string;
}

async function fetchAllMedia(): Promise<Media[]> {
  const items: Media[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await api.get<Paginated<Media>>("/media", {
      params: { page, limit: PAGE_SIZE, type: "image" },
      quiet: true,
    });
    items.push(...data.items);
    if (page >= data.totalPages) break;
  }
  return items;
}

/**
 * Every published album that has at least one image in it.
 *
 * An album with nothing in it yet is dropped rather than rendered as a
 * heading over empty space — publishing an album before uploading to it is a
 * normal thing to do, and it should not put a hole in the page.
 */
export async function fetchGallery(): Promise<GalleryAlbum[]> {
  const [albumsRes, media] = await Promise.all([
    api.get<{ albums: Album[] }>("/albums", { quiet: true }),
    fetchAllMedia(),
  ]);

  const albums = albumsRes.data.albums;
  const byAlbum = new Map<string, GalleryImage[]>();

  for (const m of media) {
    /* `album` comes back populated as an object, or as a bare id, or absent
       for media uploaded outside any album. The last of those is not part of
       the gallery — it is the loose media the blog editor picks from. */
    const albumId =
      typeof m.album === "string" ? m.album : m.album?._id ?? undefined;
    if (!albumId) continue;

    const list = byAlbum.get(albumId) ?? [];
    list.push({
      id: m._id,
      src: mediaSrc(m.url),
      title: m.title,
      caption: m.caption,
    });
    byAlbum.set(albumId, list);
  }

  return albums
    .map((a) => ({
      id: a._id,
      title: a.title,
      description: a.description,
      images: (byAlbum.get(a._id) ?? []).map((img) => ({ ...img, album: a.title })),
    }))
    .filter((a) => a.images.length > 0);
}
