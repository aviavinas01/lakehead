// npx tsx src/scripts/checkTestBooking.ts
//
// The IELTS booking form, end to end through the REAL app: rate limiter,
// multipart parsing, validation, the private signature store, the response,
// and the two emails — on a real port, with real multipart bodies.
//
// Two things are swapped, and only two, so this can run anywhere without
// touching anything that matters:
//
//   · the database write (testBookingService.create / recordNotification)
//     is replaced with a recorder — no Mongo connection is made at all;
//   · mailService.send is replaced with a recorder — nothing can be emailed.
//
// Signatures are written to a throwaway UPLOADS_DIR, which is also where the
// "is it really unreachable" attacks are aimed.
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import type { AddressInfo } from "node:net";

/* BEFORE any app module loads: env.ts reads these once, at import. */
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "lh-booking-"));
process.env.UPLOADS_DIR = TMP;

const { createApp } = await import("../app.js");
const { testBookingService } = await import("../services/testBooking.service.js");
const { mailService } = await import("../services/mail.service.js");
const { usingCloudinary } = await import("../services/storage.service.js");
const { SIGNATURES_DIR } = await import("../services/signatureStore.js");
const { TestBooking } = await import("../models/TestBooking.js");
const { buildTestBookingEmail, buildTestBookingAck } = await import(
  "../emails/testBookingEmails.js"
);

let fails = 0;
const ok = (label: string, cond: boolean, detail = "") => {
  if (!cond) fails++;
  console.log(`${cond ? "ok  " : "FAIL"}  ${label}${detail && !cond ? `  — ${detail}` : ""}`);
};

/* ---------------------------------------------------------------- */
/* The two swaps                                                      */
/* ---------------------------------------------------------------- */
type Created = Record<string, unknown> & { signature: { key: string; backend: string } };
const created: Created[] = [];
let failNextCreate = false;

testBookingService.create = (async (input: Created) => {
  if (failNextCreate) {
    failNextCreate = false;
    throw new Error("simulated database failure");
  }
  created.push(input);
  return new TestBooking({ ...input, createdAt: new Date() });
}) as unknown as typeof testBookingService.create;
testBookingService.recordNotification = async () => {};

const sent: Array<{ subject: string; text: string; html: string; to?: string[] }> = [];
mailService.send = async (m) => {
  sent.push(m);
  return { ok: false, reason: "test recorder" };
};

/* ---------------------------------------------------------------- */
/* Fixtures                                                           */
/* ---------------------------------------------------------------- */
const pad = (head: number[], size: number) => {
  const b = Buffer.alloc(size, 0x20);
  Buffer.from(head).copy(b);
  return b;
};
const PNG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52], 4096);
const JPEG = pad([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1], 4096);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.alloc(4080)]);
const GIF = Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(100)]);
const TOO_BIG = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 2 * 1024 * 1024 + 1);
const JUST_UNDER = pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52], 2 * 1024 * 1024 - 1024);
/* An HTML page declared as a PNG — the attack the byte check exists for. */
const FAKE = Buffer.from("<html><script>alert(1)</script></html>".padEnd(64, " "));

const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

const VALID: Record<string, string> = {
  provider: "idp",
  fullName: "Aarav Sharma",
  passportNumber: "pa 765 4321",
  examDate: day(30),
  testCity: "Kathmandu",
  module: "academic",
  email: "aarav@example.com",
  phone: "+977 9841234567",
  confirm: "true",
};

let ipSeq = 0;
const post = async (
  base: string,
  fields: Record<string, string | undefined>,
  file?: { bytes: Buffer; type: string; name?: string } | null,
  ip?: string
) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) form.append(k, v);
  if (file) {
    form.append("signature", new Blob([new Uint8Array(file.bytes)], { type: file.type }), file.name ?? "signature.png");
  }
  const res = await fetch(`${base}/api/v1/test-bookings`, {
    method: "POST",
    body: form,
    headers: {
      "X-Requested-By": "lakehead-admin",
      /* A separate rate-limit bucket per request unless one is given — the
         limiter has its own section at the end. */
      "X-Forwarded-For": ip ?? `10.0.${Math.floor(++ipSeq / 250)}.${ipSeq % 250}`,
    },
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    /* empty body is checked by the assertions */
  }
  return { status: res.status, body };
};

const sigFiles = () => (fs.existsSync(SIGNATURES_DIR) ? fs.readdirSync(SIGNATURES_DIR) : []);
const message = (b: Record<string, unknown>) =>
  JSON.stringify(b.errors ?? b.message ?? b);

/* ---------------------------------------------------------------- */
const app = createApp();
const server = app.listen(0);
await new Promise<void>((r) => server.once("listening", () => r()));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

console.log("--- 0. the run is safe ---");
ok("disk mode, not Cloudinary", usingCloudinary === false);
ok("signatures go under the throwaway folder", SIGNATURES_DIR.startsWith(TMP));

console.log("\n--- 1. a valid IDP booking ---");
let r = await post(base, VALID, { bytes: PNG, type: "image/png", name: "aarav-sharma-signature.png" });
ok("201", r.status === 201, `got ${r.status} ${message(r.body)}`);
ok("says it is received, promises contact", String(r.body.message).includes("within 24 hours"));
let rec = created.at(-1)!;
ok("passport number normalised (spaces out, upper case)", rec?.passportNumber === "PA7654321", String(rec?.passportNumber));
ok("exam date stored as a real Date", rec?.examDate instanceof Date);
ok("the confirmation box is not stored", !("confirm" in (rec ?? {})));
ok("stored on disk", rec?.signature.backend === "disk");
ok("key is 32 random hex chars + .png", /^[0-9a-f]{32}\.png$/.test(rec?.signature.key ?? ""), rec?.signature.key);
ok("the candidate's name is NOT in the stored filename", !rec?.signature.key.includes("aarav"));
ok("the file really exists in the private folder", sigFiles().includes(rec?.signature.key ?? "?"));
ok("and NOT loose in the public uploads folder", !fs.readdirSync(TMP).includes(rec?.signature.key ?? "?"));

/* Emails are fired after the response; give the microtasks a moment. */
await new Promise((res) => setTimeout(res, 150));
const office = sent.find((m) => m.subject.includes("booking request —"));
const ack = sent.find((m) => m.subject.startsWith("Your IDP IELTS booking request"));
ok("the office was notified", Boolean(office));
ok("the candidate was sent a receipt", Boolean(ack));
ok("receipt goes to the candidate", ack?.to?.[0] === "aarav@example.com");
for (const [name, m] of [["office email", office], ["receipt", ack]] as const) {
  const all = `${m?.subject}\n${m?.text}\n${m?.html}`;
  ok(`${name} does NOT contain the passport number`, !all.includes("PA7654321") && !all.includes("7654321"));
  ok(`${name} does NOT contain the signature key`, !all.includes(rec.signature.key));
}
ok("receipt says it is a request, not a booking", Boolean(ack?.text.includes("This is a request, not a confirmed booking")));
ok("office email points at the dashboard", Boolean(office?.text.includes("Inquiries → Test bookings")));

console.log("\n--- 2. British Council, with the alternative email ---");
r = await post(
  base,
  { ...VALID, provider: "british-council", alternateEmail: "aarav.alt@example.com", module: "general-training" },
  { bytes: JPEG, type: "image/jpeg", name: "sig.jpg" }
);
ok("201", r.status === 201, `got ${r.status} ${message(r.body)}`);
rec = created.at(-1)!;
ok("alternative email kept for British Council", rec.alternateEmail === "aarav.alt@example.com");
ok("jpeg stored as .jpg", /^[0-9a-f]{32}\.jpg$/.test(rec.signature.key), rec.signature.key);

r = await post(base, { ...VALID, alternateEmail: "aarav.alt@example.com" }, { bytes: WEBP, type: "image/webp" });
ok("IDP with an alternative email still succeeds", r.status === 201, `got ${r.status} ${message(r.body)}`);
ok("…but IDP does not keep it (not on its form)", created.at(-1)!.alternateEmail === undefined);
ok("webp accepted", /\.webp$/.test(created.at(-1)!.signature.key));

console.log("\n--- 3. the signature image ---");
let before = sigFiles().length;
r = await post(base, VALID, null);
ok("no signature → 400", r.status === 400, `got ${r.status}`);
ok("says to attach one", message(r.body).includes("signature"));

r = await post(base, VALID, { bytes: TOO_BIG, type: "image/png" });
ok("over 2 MB → 413", r.status === 413, `got ${r.status}`);
ok("says 2 MB — NOT the admin's 200 MB", message(r.body).includes("2 MB") && !message(r.body).includes("200"), message(r.body));

r = await post(base, VALID, { bytes: JUST_UNDER, type: "image/png" });
ok("just under 2 MB is accepted", r.status === 201, `got ${r.status} ${message(r.body)}`);
before = sigFiles().length;

r = await post(base, VALID, { bytes: GIF, type: "image/gif" });
ok("a GIF → 400", r.status === 400, `got ${r.status}`);
ok("names the allowed types", message(r.body).includes("JPG, PNG or WebP"));

r = await post(base, VALID, { bytes: FAKE, type: "image/png", name: "evil.png" });
ok("an HTML file declared as PNG → 400", r.status === 400, `got ${r.status}`);
ok("says what it really is", message(r.body).includes("not image/png"), message(r.body));
ok("…and nothing was written for any of those", sigFiles().length === before);

console.log("\n--- 4. field validation runs BEFORE anything is stored ---");
const bad: Array<[string, Record<string, string | undefined>, string]> = [
  ["exam date in the past", { examDate: day(-5) }, "examDate"],
  ["exam date not a date", { examDate: "next tuesday" }, "examDate"],
  ["exam date 3 years away", { examDate: day(365 * 3) }, "examDate"],
  ["passport with symbols", { passportNumber: "PA-12#345" }, "passportNumber"],
  ["passport too short", { passportNumber: "A12" }, "passportNumber"],
  ["name with digits", { fullName: "Aarav 2 Sharma" }, "fullName"],
  ["name missing", { fullName: "" }, "fullName"],
  ["unknown provider", { provider: "pearson" }, "provider"],
  ["unknown module", { module: "business" }, "module"],
  ["bad email", { email: "not-an-email" }, "email"],
  ["bad phone", { phone: "call me" }, "phone"],
  ["phone too short", { phone: "12345" }, "phone"],
  ["city missing", { testCity: "" }, "testCity"],
  ["confirmation unticked", { confirm: undefined }, "confirm"],
];
for (const [label, patch, field] of bad) {
  const n = sigFiles().length;
  r = await post(base, { ...VALID, ...patch }, { bytes: PNG, type: "image/png" });
  const errs = (r.body.errors as Array<{ path: string }> | undefined) ?? [];
  ok(`${label} → 400 on ${field}`, r.status === 400 && errs.some((e) => e.path.endsWith(field)), `got ${r.status} ${message(r.body)}`);
  ok(`  …and no signature was kept`, sigFiles().length === n);
}
r = await post(
  base,
  { ...VALID, provider: "british-council", alternateEmail: "AARAV@example.com" },
  { bytes: PNG, type: "image/png" }
);
ok("alt email same as main email → 400", r.status === 400 && message(r.body).includes("different address"), message(r.body));

console.log("\n--- 5. a database failure does not strand the signature ---");
before = sigFiles().length;
failNextCreate = true;
r = await post(base, VALID, { bytes: PNG, type: "image/png" });
ok("the request fails", r.status === 500, `got ${r.status}`);
ok("…and the image it had already stored is removed", sigFiles().length === before, `${sigFiles().length} vs ${before}`);

console.log("\n--- 6. a signature is unreachable through /uploads ---");
const target = created[0]!.signature.key;
fs.writeFileSync(path.join(TMP, "public-photo.png"), PNG);
const get = async (p: string) => (await fetch(`${base}${p}`)).status;
ok("an ordinary upload is still served", (await get("/uploads/public-photo.png")) === 200);
const attacks = [
  `/uploads/.signatures/${target}`,
  `/uploads/%2Esignatures/${target}`,
  `/uploads/%2esignatures/${target}`,
  `/uploads/.SIGNATURES/${target}`,
  `/uploads/x/../.signatures/${target}`,
  `/uploads/x/%2E%2E/.signatures/${target}`,
  `/uploads/.signatures/`,
  `/uploads/.signatures`,
];
for (const p of attacks) {
  const s = await get(p);
  ok(`refused: ${p.replace(target, "<key>")}`, s === 404 || s === 400, `got ${s}`);
}

console.log("\n--- 7. the admin endpoints need a sign-in ---");
ok("list → 401", (await get("/api/v1/test-bookings")) === 401);
ok("signature image → 401", (await get("/api/v1/test-bookings/aaaaaaaaaaaaaaaaaaaaaaaa/signature")) === 401);
const del = await fetch(`${base}/api/v1/test-bookings/aaaaaaaaaaaaaaaaaaaaaaaa`, {
  method: "DELETE",
  headers: { "X-Requested-By": "lakehead-admin" },
});
ok("delete → 401", del.status === 401, `got ${del.status}`);

console.log("\n--- 8. the storage key never appears in a response ---");
const json = new TestBooking({ ...created[0]!, createdAt: new Date() }).toJSON() as Record<string, unknown>;
const sigJson = json.signature as Record<string, unknown>;
ok("toJSON keeps mime and size", sigJson.mime === "image/png" && typeof sigJson.bytes === "number");
ok("toJSON drops the key", !("key" in sigJson) && !JSON.stringify(json).includes(target));
ok("toJSON drops the backend", !("backend" in sigJson));
ok("passport number IS present for the admin", json.passportNumber === "PA7654321");

console.log("\n--- 9. emails escape what candidates type ---");
const nasty = new TestBooking({
  ...created[0]!,
  fullName: "Aarav <img src=x onerror=alert(1)>",
  testCity: "<script>x</script>",
  createdAt: new Date(),
});
const o = buildTestBookingEmail(nasty);
const a = buildTestBookingAck(nasty, "office@example.com");
ok("office html escapes markup", !o.html.includes("<img src=x") && !o.html.includes("<script>x"));
ok("receipt html escapes markup", !a.html.includes("<img src=x") && !a.html.includes("<script>x"));

console.log("\n--- 10. the rate limit ---");
const one = "203.0.113.7";
const statuses: number[] = [];
for (let i = 0; i < 11; i++) {
  statuses.push((await post(base, { ...VALID, fullName: "" }, { bytes: PNG, type: "image/png" }, one)).status);
}
ok("the first ten are answered", statuses.slice(0, 10).every((s) => s === 400), statuses.join(","));
ok("the eleventh is refused", statuses[10] === 429, `got ${statuses[10]}`);
r = await post(base, VALID, { bytes: PNG, type: "image/png" }, "203.0.113.8");
ok("a different connection is unaffected", r.status === 201, `got ${r.status}`);

await new Promise<void>((res) => server.close(() => res()));
fs.rmSync(TMP, { recursive: true, force: true });

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILED`);
process.exit(fails === 0 ? 0 : 1);
