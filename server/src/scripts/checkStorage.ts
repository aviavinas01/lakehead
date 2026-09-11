// npx tsx src/scripts/checkStorage.ts
//
// The storage backend's contract, without a database or a network call.
//
// The property that matters most is the NEGATIVE one: with no Cloudinary
// credentials set, every part of this must behave exactly as it did before
// the migration — same storage, same url shape, same delete path. That is
// what makes the change safe to deploy before the account exists, and what
// means removing Cloudinary later degrades rather than breaks.
import fs from "node:fs";
import path from "node:path";
import { usingCloudinary, store, discard } from "../services/storage.service.js";
import { upload, UPLOADS_DIR, uploadsState } from "../middleware/upload.js";
import { env } from "../config/env.js";

let fails = 0;
const ok = (label: string, cond: boolean, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "ok  " : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
};

const configured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

console.log(`--- backend in use: ${usingCloudinary ? "Cloudinary" : "local disk"} ---`);
ok("the flag matches the environment", usingCloudinary === configured);

console.log("\n--- all three credentials, or none ---");
ok(
  "a partially-filled environment falls back to the disk",
  configured ||
    !usingCloudinary,
  "(half-set is treated as unset, never as an error)"
);

console.log("\n--- multer's storage follows the same decision ---");
const engine = (upload as unknown as { storage: unknown }).storage;
const isMemory = engine?.constructor?.name === "MemoryStorage";
ok(
  usingCloudinary ? "memory storage when Cloudinary is on" : "disk storage when it is off",
  usingCloudinary ? isMemory : !isMemory,
  `(${engine?.constructor?.name})`
);

console.log("\n--- the disk path still resolves and is usable ---");
const state = uploadsState();
ok("uploads directory exists", state.exists, state.dir);
ok("and is writable", state.writable);
ok("UPLOADS_DIR is absolute", path.isAbsolute(UPLOADS_DIR));

if (!usingCloudinary) {
  console.log("\n--- disk mode: a stored file keeps the old url shape ---");
  const name = `checkstorage-${Date.now().toString(36)}.png`;
  const full = path.join(UPLOADS_DIR, name);
  /* A REAL PNG SIGNATURE, not a placeholder byte. store() verifies that a
     file's contents match its declared type (see utils/fileSignature), so a
     fixture of "x" is now correctly refused — which is the guard working,
     but it makes for a useless test of the storage path. */
  fs.writeFileSync(
    full,
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52])
  );

  const stored = await store({
    filename: name,
    originalname: name,
    mimetype: "image/png",
    size: 1,
  } as Express.Multer.File);

  ok("url is the relative /uploads path the client expects", stored.url === `/uploads/${name}`);
  ok("no publicId is invented for a disk file", stored.publicId === undefined);

  console.log("\n--- discard() removes it, and never throws ---");
  await discard(stored.url, undefined);
  ok("the file is gone", !fs.existsSync(full));

  let threw = false;
  try {
    await discard("/uploads/does-not-exist.png", undefined);
    await discard("/uploads/../../package.json", undefined);
    await discard("https://example.test/x.png", "some-id");
  } catch {
    threw = true;
  }
  ok("a missing file, a traversal attempt and a foreign url are all survivable", !threw);
  ok("the traversal did not escape the uploads folder", fs.existsSync("package.json"));
}

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILING`);
process.exit(fails === 0 ? 0 : 1);
