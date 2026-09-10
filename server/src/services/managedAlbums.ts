import { Album, type AlbumDocument } from "../models/Album.js";

/**
 * The two albums the admin files pictures into by itself.
 *
 * ------------------------------------------------------------------
 * WHY THE SERVER OWNS THIS. A picture added while writing a blog post
 * belongs in "Blogs", and a staff photograph belongs in "Team" — but the
 * screens that upload them are four different panels, and asking each one to
 * name its album in a string is asking for "Blogs", "blogs" and "Blog" to
 * exist side by side within a month. The client sends a fixed KEY instead,
 * this file turns the key into a real album, and there is exactly one place
 * the title is written down.
 *
 * FOUND OR CREATED, never assumed. The album may not exist — a fresh
 * database, or somebody deleted it — and the alternative to creating it is an
 * upload that fails for a reason the person uploading cannot act on. So the
 * first blog image on a new deployment brings "Blogs" into being, and
 * nothing has to be seeded.
 *
 * MATCHED ON TITLE, NOT SLUG. Album slugs carry a random suffix (see the
 * model), so `blogs-k3f9` is not derivable and looking one up by slug would
 * create a second album every time. The title is the stable identity.
 *
 * CREATED UNPUBLISHED. These are working albums — somewhere for the pictures
 * used across the site to live — not galleries anybody chose to show. The
 * public gallery only lists published albums, so they stay out of it until
 * somebody deliberately publishes one.
 *
 * Every other album is still made by hand in the admin and is untouched by
 * any of this.
 * ------------------------------------------------------------------
 */

/** The keys an upload may ask for. Anything else is ignored. */
export const ALBUM_KEYS = ["blogs", "team"] as const;
export type AlbumKey = (typeof ALBUM_KEYS)[number];

const MANAGED: Record<AlbumKey, { title: string; description: string }> = {
  blogs: {
    title: "Blogs",
    description:
      "Pictures used in blog posts — covers and images placed in the body. Filed here automatically as posts are written.",
  },
  team: {
    title: "Team",
    description:
      "Staff photographs and the director's portrait. Filed here automatically from the People screen.",
  },
};

export const isAlbumKey = (v: unknown): v is AlbumKey =>
  typeof v === "string" && (ALBUM_KEYS as readonly string[]).includes(v);

/**
 * The album for a key, creating it the first time.
 *
 * A FAILURE HERE MUST NOT LOSE THE UPLOAD. The file is already on disk and
 * the record is about to be written; if the album cannot be resolved for any
 * reason, the picture is still saved — just unfiled, which somebody can fix
 * in the media library in two clicks. Refusing the upload over a filing
 * problem would be the wrong trade, so the caller treats null as "no album".
 */
export async function albumFor(key: AlbumKey): Promise<AlbumDocument | null> {
  const spec = MANAGED[key];
  try {
    const existing = await Album.findOne({ title: spec.title });
    if (existing) return existing;
    return await Album.create({
      title: spec.title,
      description: spec.description,
      published: false,
      /* Sorted after whatever the office has arranged deliberately. */
      order: 100,
    });
  } catch {
    return null;
  }
}
