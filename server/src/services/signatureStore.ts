import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { UPLOADS_DIR } from "../middleware/upload.js";
import { usingCloudinary } from "./storage.service.js";
import { ApiError } from "../utils/ApiError.js";
import { SIGNATURE_BYTES, bytesMatchMime, describe, extensionFor } from "../utils/fileSignature.js";
import type { SignatureRef } from "../models/TestBooking.js";

/**
 * Where candidates' signature images are kept — and, just as much, where
 * they are NOT.
 *
 * ------------------------------------------------------------------
 * WHY NOT storage.service, which already stores images on both backends.
 * Because everything it stores is PUBLIC, and named after the uploader:
 *
 *   · on disk, a file lands in UPLOADS_DIR, which Express serves to anyone
 *     at /uploads/<name>; on Cloudinary it is an ordinary public asset.
 *     That is right for a blog photograph and wrong for a signature that
 *     sits beside a passport number.
 *   · its names are derived from the original filename — so
 *     "aarav-sharma-signature.jpg" would put the candidate's name in the
 *     url, in access logs, and in anybody's browser history.
 *
 * SO, HERE:
 *
 *   · Names are 128 random bits. Nothing about the person is in them, and
 *     they cannot be guessed or enumerated.
 *   · On disk they go in UPLOADS_DIR/.signatures. INSIDE the uploads folder
 *     on purpose: render.yaml mounts the persistent disk AT that folder, so
 *     anywhere outside it is the container's own filesystem and would be
 *     wiped on the next deploy — which is exactly how the site once lost
 *     every image it had. The folder is then refused explicitly in app.ts
 *     before the static server can see it. Do NOT rely on express.static's
 *     dotfile handling for that: its default hides a dotfile but still
 *     serves files INSIDE a dot-directory.
 *   · On Cloudinary they are uploaded as `type: "authenticated"`, which
 *     Cloudinary will not deliver without a signed url.
 *   · Either way the ONLY way to see one is `read()`, called from an
 *     admin-only route that streams the bytes. No url is ever handed out —
 *     not even a signed one, which would work forever for whoever it was
 *     forwarded to.
 * ------------------------------------------------------------------
 */

/** Must match the explicit block in app.ts. */
export const SIGNATURES_DIRNAME = ".signatures";
export const SIGNATURES_DIR = path.join(UPLOADS_DIR, SIGNATURES_DIRNAME);

/** The candidate's image, not a document — no GIF, no video, no PDF. */
export const SIGNATURE_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
/** The limit asked for, and the one the form states. */
export const SIGNATURE_MAX_BYTES = 2 * 1024 * 1024;

const CLOUDINARY_FOLDER = "lakehead/signatures";

const randomKey = () => randomBytes(16).toString("hex");

/**
 * Refuse a file whose contents are not the picture it claims to be.
 *
 * The declared type is written by the browser and proves nothing; the first
 * bytes do. Same check the admin media upload uses — see utils/fileSignature.
 */
function verify(file: Express.Multer.File): void {
  if (!(SIGNATURE_MIMES as readonly string[]).includes(file.mimetype)) {
    throw ApiError.badRequest("Your signature must be a JPG, PNG or WebP image.");
  }
  if (!file.buffer || file.buffer.length === 0) {
    throw ApiError.badRequest("The signature image was empty.");
  }
  if (file.buffer.length > SIGNATURE_MAX_BYTES) {
    throw new ApiError(413, "Your signature image must be under 2 MB.");
  }
  const head = file.buffer.subarray(0, SIGNATURE_BYTES);
  if (!bytesMatchMime(head, file.mimetype)) {
    throw ApiError.badRequest(
      `That file is ${describe(head)}, not ${file.mimetype}. Upload the picture itself rather than a renamed file.`
    );
  }
}

/**
 * Keep one signature. Throws ApiError if the file is not acceptable, and
 * nothing is written in that case.
 */
async function save(file: Express.Multer.File): Promise<SignatureRef> {
  verify(file);

  if (usingCloudinary) {
    const publicId = randomKey();
    const result = await new Promise<{ public_id: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY_FOLDER,
          public_id: publicId,
          resource_type: "image",
          /* Not deliverable without a signature. See the note above. */
          type: "authenticated",
          overwrite: false,
        },
        (err, res) => {
          if (err || !res) return reject(err ?? new Error("Upload failed"));
          resolve({ public_id: res.public_id });
        }
      );
      upload.end(file.buffer);
    });
    return {
      backend: "cloudinary",
      key: result.public_id,
      mime: file.mimetype,
      bytes: file.buffer.length,
    };
  }

  await fs.mkdir(SIGNATURES_DIR, { recursive: true });
  /* The extension is derived from the verified type, never taken from the
     uploaded filename — see utils/fileSignature for what that prevents. */
  const key = `${randomKey()}${extensionFor(file.mimetype)}`;
  /* `wx`: fail rather than overwrite, however unlikely a collision of 128
     random bits is. */
  await fs.writeFile(path.join(SIGNATURES_DIR, key), file.buffer, { flag: "wx" });
  return { backend: "disk", key, mime: file.mimetype, bytes: file.buffer.length };
}

/**
 * The bytes of a stored signature, for the admin route to stream. Throws a
 * 404 ApiError if they are gone.
 */
async function read(ref: SignatureRef): Promise<Buffer> {
  if (ref.backend === "cloudinary") {
    if (!usingCloudinary) {
      throw ApiError.notFound(
        "This signature is stored on Cloudinary, which is not configured on this server."
      );
    }
    /* A signed url, used once, server-side, and never given to the browser. */
    const signed = cloudinary.url(ref.key, {
      type: "authenticated",
      resource_type: "image",
      sign_url: true,
      secure: true,
    });
    const res = await fetch(signed);
    if (!res.ok) throw ApiError.notFound("Signature image not found.");
    return Buffer.from(await res.arrayBuffer());
  }

  /* basename(): a key read back from the database is still not trusted to
     stay inside the folder. */
  try {
    return await fs.readFile(path.join(SIGNATURES_DIR, path.basename(ref.key)));
  } catch {
    throw ApiError.notFound("Signature image not found.");
  }
}

/**
 * Remove a stored signature. NEVER THROWS — the same bargain as
 * storage.service's discard: a booking that cannot be deleted because its
 * image is already gone would be a broken admin screen, and personal data
 * the office asked to delete must not survive because of it.
 */
async function discard(ref: SignatureRef | undefined): Promise<void> {
  if (!ref) return;
  try {
    if (ref.backend === "cloudinary") {
      if (usingCloudinary) {
        await cloudinary.uploader.destroy(ref.key, {
          type: "authenticated",
          resource_type: "image",
        });
      }
      return;
    }
    await fs.unlink(path.join(SIGNATURES_DIR, path.basename(ref.key)));
  } catch {
    /* Deliberately silent — see above. */
  }
}

export const signatureStore = { save, read, discard };
