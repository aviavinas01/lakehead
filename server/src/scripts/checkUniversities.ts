// npx tsx src/scripts/checkUniversities.ts
//
// The parts of the university slice that can be checked without a database:
// the order Express will match its routes in, and what the validators accept.
// Both have caught real faults in this shape of code before — see the notes
// on each block.
import universityRouter from "../routes/v1/university.routes.js";
import {
  createUniversitySchema,
  updateUniversitySchema,
} from "../validators/university.schema.js";

let fails = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
};

/* ---------------------------------------------------------------
   ROUTE ORDER.

   "/admin" has to be matched before "/:slug", or Express treats "admin" as a
   slug and the admin listing 404s as an institution nobody has heard of.
   The staff routes carry a note about the same trap; this asserts it rather
   than trusting the comment.
   --------------------------------------------------------------- */
console.log("--- route table, in match order ---");

interface Layer {
  route?: { path: string; methods: Record<string, boolean> };
}
const layers = (universityRouter as unknown as { stack: Layer[] }).stack;
/* flatMap rather than filter().map(): it narrows `route` for the compiler in
   one step, where the two-call version leaves it optional in the second and
   needs a non-null assertion to get past `noUncheckedIndexedAccess`. A route
   registered with no method would be an Express bug rather than ours, so it
   is simply dropped rather than reported. */
const routes = layers.flatMap((l) => {
  if (!l.route) return [];
  const method = Object.keys(l.route.methods)[0];
  return method ? [{ method: method.toUpperCase(), path: l.route.path }] : [];
});

for (const r of routes) console.log(`      ${r.method.padEnd(6)} ${r.path}`);

const getPaths = routes.filter((r) => r.method === "GET").map((r) => r.path);
check(
  '"/admin" is matched before "/:slug"',
  getPaths.indexOf("/admin") !== -1 &&
    getPaths.indexOf("/admin") < getPaths.indexOf("/:slug"),
  `(GET order: ${getPaths.join(", ")})`
);
check('the public list is at "/"', getPaths.includes("/"));
check(
  "every write route exists",
  routes.some((r) => r.method === "POST" && r.path === "/") &&
    routes.some((r) => r.method === "PATCH" && r.path === "/:id") &&
    routes.some((r) => r.method === "DELETE" && r.path === "/:id")
);

/* ---------------------------------------------------------------
   VALIDATORS.

   The protocol checks are the ones that matter: `website` and every entry in
   `links` end up in an href on a public page, and `javascript:alert(1)` is a
   perfectly valid URL as far as a string is concerned. The rest is shape.
   --------------------------------------------------------------- */
console.log("\n--- create: what is accepted ---");

const create = (body: unknown) => createUniversitySchema.safeParse({ body });

const ok = create({ name: "Deakin University", logo: "/uploads/deakin.png" });
check("name + uploaded logo is enough", ok.success);

check(
  "an external logo URL is allowed",
  create({ name: "Deakin University", logo: "https://x.test/a.png" }).success
);
check(
  "a full record passes",
  create({
    name: "Deakin University",
    logo: "/uploads/deakin.png",
    country: "Australia",
    city: "Melbourne",
    website: "https://deakin.edu.au",
    intakes: ["March", "July"],
    links: [{ label: "Prospectus", url: "https://deakin.edu.au/prospectus" }],
    published: true,
    order: 3,
  }).success
);

console.log("\n--- create: what is refused ---");
check("no logo is refused", !create({ name: "Deakin University" }).success);
check(
  "a one-character name is refused",
  !create({ name: "D", logo: "/uploads/a.png" }).success
);
check(
  "a javascript: logo is refused",
  !create({ name: "Deakin University", logo: "javascript:alert(1)" }).success
);
check(
  "a javascript: website is refused",
  !create({
    name: "Deakin University",
    logo: "/uploads/a.png",
    website: "javascript:alert(1)",
  }).success
);
check(
  "a javascript: link is refused",
  !create({
    name: "Deakin University",
    logo: "/uploads/a.png",
    links: [{ label: "Apply", url: "javascript:alert(1)" }],
  }).success
);
check(
  "a link with no label is refused",
  !create({
    name: "Deakin University",
    logo: "/uploads/a.png",
    links: [{ label: "", url: "https://x.test" }],
  }).success
);
check(
  "a slug sent by a client is ignored, never stored",
  (() => {
    const r = create({
      name: "Deakin University",
      logo: "/uploads/a.png",
      slug: "somebody-elses-address",
    });
    return r.success && !("slug" in (r.data.body as Record<string, unknown>));
  })(),
  "(the service derives it)"
);

/* Clearing has to survive the round trip: "" must arrive as null, or an
   emptied box can never remove a saved value. See utils/patch.ts. */
console.log("\n--- clearing an optional field ---");
const cleared = create({
  name: "Deakin University",
  logo: "/uploads/a.png",
  city: "",
  website: "",
});
check(
  '"" becomes null so the field can be cleared',
  cleared.success &&
    (cleared.data.body as Record<string, unknown>).city === null &&
    (cleared.data.body as Record<string, unknown>).website === null
);

console.log("\n--- update: every field optional, id checked ---");
const update = (body: unknown, id = "0123456789abcdef01234567") =>
  updateUniversitySchema.safeParse({ body, params: { id } });

check("a single-field patch passes", update({ published: false }).success);
check("an empty patch passes", update({}).success);
check("a short id is refused", !update({ published: false }, "abc").success);
check(
  "a javascript: link is refused on update too",
  !update({ links: [{ label: "Apply", url: "javascript:alert(1)" }] }).success
);

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILING`);
process.exit(fails === 0 ? 0 : 1);
