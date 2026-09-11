// npx tsx src/scripts/checkUploadSafety.ts
//
// The two defences on the upload path, against the attack they exist for and
// against the legitimate files they must not refuse.
//
// The attack: `evil.html` uploaded with a declared Content-Type of image/png.
// Multer believes the header, and the OLD code took the extension from the
// filename — so it was stored as a .html file and served as text/html from
// the API's own origin. Both halves of the fix are asserted below, and so is
// the more important negative: that a real JPEG, PNG, GIF, WebP, MP4 or WebM
// still goes through untouched.
import fs from "node:fs";
import path from "node:path";
import {
  ACCEPTED_MIMES,
  extensionFor,
  kindFor,
  bytesMatchMime,
  describe,
  SIGNATURE_BYTES,
} from "../utils/fileSignature.js";
import { store } from "../services/storage.service.js";
import { UPLOADS_DIR } from "../middleware/upload.js";

let fails = 0;
const ok = (label: string, cond: boolean, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "ok  " : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
};

/* Real leading bytes for each format we accept. */
const HEADS: Record<string, Buffer> = {
  "image/jpeg": Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 0, 0, 0, 1]),
  "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52]),
  "image/gif": Buffer.concat([Buffer.from("GIF89a", "latin1"), Buffer.alloc(10)]),
  "image/webp": Buffer.concat([
    Buffer.from("RIFF", "latin1"), Buffer.from([0x24, 0, 0, 0]),
    Buffer.from("WEBPVP8 ", "latin1"),
  ]),
  "video/mp4": Buffer.concat([
    Buffer.from([0, 0, 0, 0x20]), Buffer.from("ftypisom", "latin1"), Buffer.alloc(4),
  ]),
  "video/webm": Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(12)]),
  "video/quicktime": Buffer.concat([
    Buffer.from([0, 0, 0, 0x14]), Buffer.from("ftypqt  ", "latin1"), Buffer.alloc(4),
  ]),
};

console.log("--- the extension is derived, never taken from the filename ---");
ok("seven formats accepted", ACCEPTED_MIMES.length === 7, ACCEPTED_MIMES.join(" "));
ok("image/png stores as .png", extensionFor("image/png") === ".png");
ok("image/jpeg canonicalises to .jpg", extensionFor("image/jpeg") === ".jpg");
ok("video/quicktime stores as .mov", extensionFor("video/quicktime") === ".mov");
ok(
  "a type we do not accept yields no extension",
  ["text/html", "image/svg+xml", "application/javascript", "application/pdf"].every(
    (m) => extensionFor(m) === ""
  )
);
ok("kinds are right", kindFor("image/png") === "image" && kindFor("video/mp4") === "video");

console.log("\n--- every real file is recognised as itself ---");
for (const [mime, head] of Object.entries(HEADS)) {
  ok(`${mime} accepted`, bytesMatchMime(head, mime), `(${describe(head)})`);
}

console.log("\n--- and is NOT accepted as something else ---");
ok("a real PNG declared as JPEG is refused", !bytesMatchMime(HEADS["image/png"]!, "image/jpeg"));
ok("a real GIF declared as WebP is refused", !bytesMatchMime(HEADS["image/gif"]!, "image/webp"));
ok(
  "MP4 and QuickTime are interchangeable, deliberately",
  bytesMatchMime(HEADS["video/mp4"]!, "video/quicktime") &&
    bytesMatchMime(HEADS["video/quicktime"]!, "video/mp4"),
  "(both are ISO base media — indistinguishable at the signature)"
);

console.log("\n--- the attack itself ---");
const HTML = Buffer.from("<html><script>alert(1)</script></html>", "latin1");
ok("HTML declared as image/png is refused", !bytesMatchMime(HTML, "image/png"));
ok("...and is described honestly", describe(HTML) === "not a recognised image or video");
ok(
  "an SVG declared as an image is refused",
  !bytesMatchMime(Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\">", "latin1"), "image/png")
);
ok(
  "a PHP file declared as a JPEG is refused",
  !bytesMatchMime(Buffer.from("<?php system($_GET[0]); ?>", "latin1"), "image/jpeg")
);
ok("an empty file is refused", !bytesMatchMime(Buffer.alloc(0), "image/png"));
ok("a truncated signature is refused", !bytesMatchMime(Buffer.from([0x89, 0x50]), "image/png"));
ok(
  "RIFF alone is not WebP",
  !bytesMatchMime(Buffer.concat([Buffer.from("RIFF", "latin1"), Buffer.alloc(12)]), "image/webp"),
  "(a WAV would otherwise pass)"
);

console.log("\n--- end to end through store(), on disk ---");

/** Write a file the way multer would, then hand it to store(). */
async function tryStore(name: string, mime: string, body: Buffer) {
  const filename = `checkupload-${Date.now().toString(36)}-${name}`;
  const full = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(full, body);
  try {
    const r = await store({ filename, originalname: name, mimetype: mime, size: body.length } as Express.Multer.File);
    return { ok: true as const, url: r.url, full };
  } catch (e) {
    return { ok: false as const, message: (e as Error).message, full };
  }
}

const good = await tryStore("photo.png", "image/png", HEADS["image/png"]!);
ok("a genuine PNG is stored", good.ok, good.ok ? good.url : good.message);
if (good.ok) fs.unlinkSync(good.full);

const bad = await tryStore("evil.png", "image/png", HTML);
ok("HTML wearing a .png name is rejected", !bad.ok);
ok("...and the written file is deleted, not left on the disk", !fs.existsSync(bad.full));
if (!bad.ok) console.log(`        message: ${bad.message}`);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILING`);
process.exit(fails === 0 ? 0 : 1);
