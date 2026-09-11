import path from "node:path";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { UPLOADS_DIR } from "../middleware/upload.js";
import { ApiError } from "../utils/ApiError.js";
import {
  SIGNATURE_BYTES,
  bytesMatchMime,
  describe,
} from "../utils/fileSignature.js";

/**
 * Where uploaded files actually go.
 *
 * ------------------------------------------------------------------
 * TWO BACKENDS, ONE INTERFACE, CHOSEN BY WHETHER CLOUDINARY IS CONFIGURED.
 *
 * With the three CLOUDINARY_* variables set, files go to Cloudinary and the
 * stored url is an absolute https one. Without them, files go to the local
 * disk exactly as they always have and the stored url is `/uploads/<file>`.
 *
 * THE FALLBACK IS THE POINT, not a leftover. It means a developer can clone
 * this repo and run it with no Cloudinary account, it means the change can be
 * deployed before the account exists, and it means that if Cloudinary is ever
 * removed the system degrades to what it did before rather than breaking.
 * Nothing else in the codebase asks which backend is in use.
 *
 * WHY CLOUDINARY AT ALL. The local disk lost every file it was given: the
 * records were in Mongo and the bytes were on a container filesystem that did
 * not survive a deploy, so every image on the site 404'd while the database
 * looked healthy. A disk fixes that only for as long as nobody misconfigures
 * the mount again. Object storage cannot be misconfigured in that way, and
 * it comes with a CDN — which matters here, because the API is in Singapore
 * and the audience is in Nepal.
 *
 * THE CLIENT NEEDED NO CHANGES. `mediaSrc()` only prefixes paths beginning
 * `/uploads/`; an absolute url passes through untouched. So records written
 * by either backend render correctly everywhere, and the two can coexist in
 * one collection indefinitely.
 * ------------------------------------------------------------------
 */

/** True when all three credentials are present. Checked once at load. */
export const usingCloudinary = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (usingCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/** Everything the media record needs to know about a stored file. */
export interface StoredFile {
  /** What goes in `Media.url` — absolute for Cloudinary, `/uploads/x` for disk. */
  url: string;
  /**
   * Cloudinary's own handle for the file, stored alongside the url.
   *
   * KEPT SO THE URL IS NOT THE ONLY RECORD OF WHAT THIS IS. Deleting and
   * replacing need it, and holding it means a future migration away from
   * Cloudinary can rebuild every address from the id rather than parsing it
   * back out of a url. Absent for disk-stored files.
   */
  publicId?: string;
}

/** The folder uploads land in, so the Cloudinary console is not a flat list. */
const FOLDER = "lakehead";

/**
 * Refuse a file whose contents do not match the type it was uploaded as.
 *
 * WHY IT LIVES HERE rather than in multer's fileFilter: that filter runs
 * before a byte has been written, so there is nothing to inspect. By the time
 * this runs there is either a buffer in memory (Cloudinary mode) or a file on
 * disk (disk mode), and both can be read cheaply — only the first sixteen
 * bytes are needed.
 *
 * A REJECTED DISK FILE IS DELETED. Multer has already written it by then, and
 * leaving it would mean a refused upload still consuming the disk it was
 * refused from.
 *
 * This is the second of the two defences; the first is that the stored
 * extension is derived rather than accepted. See utils/fileSignature.
 */
async function verify(file: Express.Multer.File): Promise<void> {
  let head: Buffer;

  if (file.buffer) {
    head = file.buffer.subarray(0, SIGNATURE_BYTES);
  } else {
    const onDisk = path.join(UPLOADS_DIR, path.basename(file.filename));
    let handle;
    try {
      handle = await fs.open(onDisk, "r");
      const buf = Buffer.alloc(SIGNATURE_BYTES);
      const { bytesRead } = await handle.read(buf, 0, SIGNATURE_BYTES, 0);
      head = buf.subarray(0, bytesRead);
    } catch {
      /* Unreadable is not the same as malicious — a disk problem should not
         be reported to the uploader as a bad file. Let it through; the write
         either succeeded or the request has already failed. */
      return;
    } finally {
      await handle?.close();
    }

    if (!bytesMatchMime(head, file.mimetype)) {
      await fs.unlink(onDisk).catch(() => {});
      throw ApiError.badRequest(
        `That file is ${describe(head)}, not ${file.mimetype}. Upload the picture itself rather than a renamed file.`
      );
    }
    return;
  }

  if (!bytesMatchMime(head, file.mimetype)) {
    throw ApiError.badRequest(
      `That file is ${describe(head)}, not ${file.mimetype}. Upload the picture itself rather than a renamed file.`
    );
  }
}

/**
 * Store one uploaded file.
 *
 * Multer gives us a buffer in Cloudinary mode and a file on disk otherwise —
 * see the storage selection in middleware/upload.
 */
export async function store(file: Express.Multer.File): Promise<StoredFile> {
  /* Before anything is kept or uploaded. Throws on a mismatch. */
  await verify(file);

  if (!usingCloudinary) {
    /* Multer has already written it. The filename it chose is the record. */
    return { url: `/uploads/${file.filename}` };
  }

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: FOLDER,
          /* "auto" so a video is stored as a video rather than being refused
             as a malformed image. */
          resource_type: "auto",
          /* Cloudinary derives the public id from this, so the same readable
             names the disk backend produces carry over. */
          public_id: path.parse(file.originalname).name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 60),
          unique_filename: true,
          overwrite: false,
        },
        (err, res) => {
          if (err || !res) return reject(err ?? new Error("Upload failed"));
          resolve({ secure_url: res.secure_url, public_id: res.public_id });
        }
      );
      upload.end(file.buffer);
    }
  );

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Remove a stored file.
 *
 * NEVER THROWS. A record being deleted should not survive because its bytes
 * could not be reached — the file may already be gone, the credentials may
 * have changed, the disk may have been remounted. Losing an orphaned file is
 * a tidiness problem; a record that cannot be deleted is a broken admin
 * screen. Both backends behave the same way here, and both did before.
 */
export async function discard(url: string, publicId?: string): Promise<void> {
  try {
    if (publicId && usingCloudinary) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      return;
    }
    if (url.startsWith("/uploads/")) {
      /* basename() and a join into UPLOADS_DIR, so a url that has been
         tampered with cannot reach outside the upload directory. */
      await fs.unlink(path.join(UPLOADS_DIR, path.basename(url)));
    }
  } catch {
    /* Deliberately silent — see above. */
  }
}
