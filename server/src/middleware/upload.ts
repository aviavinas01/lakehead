import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import {
  ACCEPTED_MIMES,
  extensionFor,
  kindFor,
} from "../utils/fileSignature.js";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where uploaded media lives. Created on boot if missing.
 *
 * Defaults to <server>/uploads, which is the path render.yaml mounts its
 * persistent disk over. UPLOADS_DIR overrides it, for when the mount is
 * somewhere else — see the note on that variable in config/env.
 */
export const UPLOADS_DIR = env.UPLOADS_DIR
  ? path.resolve(env.UPLOADS_DIR)
  : path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/**
 * The state of the upload directory, for /api/health.
 *
 * MEASURED, NEVER INFERRED, like everything else on that endpoint. The bug
 * this exists for is one where every piece of code is correct and the disk
 * underneath is not: records in the database, 404s on every file, and no way
 * to tell from outside whether the directory is missing, read-only, or
 * simply a fresh empty folder because the mount never happened.
 *
 * `files` is the decisive number. A server that has been up for a day with
 * media in the database and zero files here has lost them, and that is a
 * disk that is not persisting rather than anything in this repo.
 */
export function uploadsState(): {
  dir: string;
  exists: boolean;
  writable: boolean;
  files: number | null;
} {
  const exists = fs.existsSync(UPLOADS_DIR);
  let writable = false;
  let files: number | null = null;

  if (exists) {
    try {
      fs.accessSync(UPLOADS_DIR, fs.constants.W_OK);
      writable = true;
    } catch {
      writable = false;
    }
    try {
      files = fs.readdirSync(UPLOADS_DIR).length;
    } catch {
      files = null;
    }
  }

  return { dir: UPLOADS_DIR, exists, writable, files };
}

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB (videos)

/**
 * WHICH STORAGE MULTER USES, decided by whether Cloudinary is configured.
 *
 * Memory when it is — the buffer is streamed straight up and never touches
 * this container's filesystem, which is the whole point of moving off the
 * disk. The 200MB cap below then bounds memory rather than bounding disk, so
 * it is worth knowing that a large video upload is briefly held in RAM.
 *
 * Disk when it is not, exactly as before. Read lazily rather than imported
 * from storage.service, because that module imports UPLOADS_DIR from this one
 * and a static import would be a cycle.
 */
const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    /* THE EXTENSION IS DERIVED, NOT ACCEPTED. Taking it from the original
       filename is what let `evil.html` — declared as `image/png` — be stored
       as a .html file and served as HTML from this origin. It now comes from
       the type table, so a stored file can only ever carry one of the seven
       extensions we serve. See utils/fileSignature. */
    const ext = extensionFor(file.mimetype);
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60);
    cb(null, `${Date.now().toString(36)}-${base || "file"}${ext}`);
  },
});

export const upload = multer({
  storage: cloudinaryConfigured ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  /* A first pass on the DECLARED type, which is only a claim — the multipart
     Content-Type is written by the client. It is worth doing anyway because
     it refuses an obviously wrong upload before a byte is written. The bytes
     themselves are checked in storage.service, once there is a file to look
     at. */
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIMES.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  },
});

export const mediaTypeFromMime = (mimeType: string): "image" | "video" =>
  kindFor(mimeType);
