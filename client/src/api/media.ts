/**
 * Where uploaded media actually lives.
 *
 * The server stores media paths as `/uploads/<file>` — relative, because in
 * development Vite proxies `/uploads` to the API. In production the client
 * and the API are usually on different hosts, and a bare `/uploads/x.jpg`
 * would then resolve against the *client's* domain and 404. This puts the
 * API's origin back in front of those paths.
 *
 * Set VITE_API_URL (e.g. https://api.example.com/api/v1) and the origin is
 * taken from it. Leave it unset — in development, or when the client host
 * proxies /api and /uploads through to the API — and this does nothing.
 *
 * Only `/uploads/...` is touched. Files in client/public such as /hero.jpg
 * belong to the client and must stay where they are.
 */

const MEDIA_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(
  /\/api\/v\d+\/?$/,
  ""
);

export function mediaSrc(url: string): string;
export function mediaSrc(url: string | undefined): string | undefined;
export function mediaSrc(url?: string): string | undefined {
  if (!url || !MEDIA_ORIGIN || !url.startsWith("/uploads/")) return url;
  return MEDIA_ORIGIN + url;
}
