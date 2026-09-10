import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
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

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB (videos)

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 60);
    cb(null, `${Date.now().toString(36)}-${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if ([...IMAGE_TYPES, ...VIDEO_TYPES].includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  },
});

export const mediaTypeFromMime = (mimeType: string): "image" | "video" =>
  VIDEO_TYPES.includes(mimeType) ? "video" : "image";
