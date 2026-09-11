/**
 * What a file actually is, as opposed to what it says it is.
 *
 * ------------------------------------------------------------------
 * THE HOLE THIS CLOSES. Multer reports `file.mimetype` from the multipart
 * Content-Type header — which the client writes, so it is a claim, not a
 * fact. The old upload path checked that claim against an allow-list and then
 * took the file EXTENSION verbatim from the original filename. So
 * `evil.html`, uploaded with a Content-Type of `image/png`, passed the filter
 * and was stored as `<timestamp>-evil.html` — and `express.static` serves a
 * `.html` file as `text/html` from the API's own origin.
 *
 * Two independent defences, either of which closes it:
 *
 *   1. THE EXTENSION IS DERIVED, NEVER ACCEPTED. It comes from this table,
 *      keyed on the verified type. A stored file can only ever end in one of
 *      the seven extensions below, whatever it was called on the way in.
 *
 *   2. THE BYTES ARE CHECKED. Every format here has a signature in its first
 *      few bytes, and the declared type has to be consistent with what is
 *      actually there. A text file claiming to be a PNG is refused rather
 *      than stored under a harmless-looking name.
 *
 * Belt and braces on purpose: (1) alone means a spoofed file is served as an
 * image with `nosniff` and cannot execute, which is enough. (2) means it does
 * not get stored at all.
 *
 * NO DEPENDENCY. `file-type` is the usual answer and covers a hundred
 * formats; this codebase allows seven, and seven signatures is forty lines
 * that cannot break on an upgrade.
 * ------------------------------------------------------------------
 */

export type MediaKind = "image" | "video";

interface Format {
  /** The MIME type a client may declare for this format. */
  mime: string;
  /** The extension it is STORED with. Never read from the upload. */
  ext: string;
  kind: MediaKind;
}

/**
 * Everything accepted, and nothing else.
 *
 * `.jpg` rather than `.jpeg` and `.mov` for quicktime: one canonical
 * extension per type, so the same picture uploaded twice cannot end up with
 * two different names for the same format.
 */
const FORMATS: Format[] = [
  { mime: "image/jpeg", ext: ".jpg", kind: "image" },
  { mime: "image/png", ext: ".png", kind: "image" },
  { mime: "image/webp", ext: ".webp", kind: "image" },
  { mime: "image/gif", ext: ".gif", kind: "image" },
  { mime: "video/mp4", ext: ".mp4", kind: "video" },
  { mime: "video/webm", ext: ".webm", kind: "video" },
  { mime: "video/quicktime", ext: ".mov", kind: "video" },
];

export const ACCEPTED_MIMES = FORMATS.map((f) => f.mime);

export const formatFor = (mime: string): Format | undefined =>
  FORMATS.find((f) => f.mime === mime);

/** The extension a file of this type is stored with, or "" if not allowed. */
export const extensionFor = (mime: string): string => formatFor(mime)?.ext ?? "";

export const kindFor = (mime: string): MediaKind =>
  formatFor(mime)?.kind ?? "image";

/**
 * The MIME types a run of leading bytes could legitimately be.
 *
 * Returns a LIST rather than one type because two of the formats here are
 * genuinely indistinguishable at this level: MP4 and QuickTime are both ISO
 * base media files and both begin `....ftyp`. Rather than guess a brand and
 * be wrong about somebody's camera output, the check below asks only whether
 * the declared type is among the possibilities — which is all that is needed
 * to catch a text file claiming to be an image.
 *
 * An empty list means the bytes match nothing we accept.
 */
function possibleMimes(head: Buffer): string[] {
  const at = (i: number) => head[i];
  const ascii = (start: number, text: string) =>
    head.length >= start + text.length &&
    head.subarray(start, start + text.length).toString("latin1") === text;

  /* JPEG — FF D8 FF, every variant. */
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return ["image/jpeg"];

  /* PNG — the 8-byte signature, including the CRLF trap that detects a file
     mangled by a text-mode transfer. */
  if (
    at(0) === 0x89 && ascii(1, "PNG") &&
    at(4) === 0x0d && at(5) === 0x0a && at(6) === 0x1a && at(7) === 0x0a
  ) {
    return ["image/png"];
  }

  /* GIF — "GIF87a" or "GIF89a". */
  if (ascii(0, "GIF8")) return ["image/gif"];

  /* WebP — a RIFF container whose form type is WEBP. Both halves matter:
     RIFF alone is also WAV and AVI. */
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return ["image/webp"];

  /* Matroska/WebM — the EBML header. */
  if (at(0) === 0x1a && at(1) === 0x45 && at(2) === 0xdf && at(3) === 0xa3) {
    return ["video/webm"];
  }

  /* ISO base media — MP4 and QuickTime both. The box size occupies the first
     four bytes, so the type marker starts at offset 4. */
  if (ascii(4, "ftyp")) return ["video/mp4", "video/quicktime"];

  return [];
}

/** How many leading bytes `describes` needs. Cheap to read, ample for all
    seven signatures — the furthest is WebP's form type at offset 8. */
export const SIGNATURE_BYTES = 16;

/**
 * Is this really the type it claims to be?
 *
 * False for a type we do not accept, for bytes matching nothing, and for
 * bytes matching something other than what was declared.
 */
export function bytesMatchMime(head: Buffer, declared: string): boolean {
  if (!formatFor(declared)) return false;
  return possibleMimes(head).includes(declared);
}

/** For error messages: what the bytes look like, in words. */
export function describe(head: Buffer): string {
  const found = possibleMimes(head);
  return found.length ? found.join(" or ") : "not a recognised image or video";
}
