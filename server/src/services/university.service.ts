import slugify from "slugify";
import {
  University,
  type IUniversity,
  type UniversityDocument,
} from "../models/University.js";
import { ApiError } from "../utils/ApiError.js";
import { toPatch, toCreate } from "../utils/patch.js";

/** Every property optional, and every optional one clearable. */
type Nullable<T> = { [K in keyof T]?: T[K] | null };

export type UniversityInput = Nullable<
  Pick<
    IUniversity,
    | "name"
    | "logo"
    | "country"
    | "city"
    | "website"
    | "intakes"
    | "links"
    | "published"
    | "order"
  >
>;

/* Hand-ranked first, then oldest first, so a new partner joins the bottom of
   a deliberately ordered wall. Matches the index on the model. */
const ORDER = { order: 1, createdAt: 1 } as const;

/**
 * A free address for this institution.
 *
 * READABLE, NOT RANDOM. Posts append four characters of the clock to every
 * slug (see models/Post.ts), which is right for them: two articles may
 * genuinely share a title, and nobody types a blog URL. A university's page
 * is a link somebody may put in an email, so `/university-partners/deakin`
 * beats `/university-partners/deakin-k3f9` — and duplicate names are rare
 * enough to be worth a lookup rather than a permanent suffix on every record.
 *
 * The counter only appears on an actual collision. `excludeId` is what lets
 * a rename keep its own slug instead of colliding with itself and becoming
 * "-2" the first time somebody fixes a typo in the name.
 *
 * THE LOOP IS BOUNDED. Fifty attempts is far beyond any real collision, and
 * past that a timestamp settles it rather than spinning — a slug is not
 * worth an unbounded query loop holding a request open.
 */
async function freeSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name, { lower: true, strict: true }) || "university";

  for (let n = 1; n <= 50; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const clash = await University.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).select("_id");
    if (!clash) return slug;
  }

  return `${base}-${Date.now().toString(36).slice(-4)}`;
}

export const universityService = {
  /** The wall as the public site sees it. */
  async listPublished(): Promise<UniversityDocument[]> {
    return University.find({ published: true }).sort(ORDER);
  },

  /** Everything, published or not, for the admin. */
  async listAll(): Promise<UniversityDocument[]> {
    return University.find().sort(ORDER);
  },

  /**
   * One institution's page.
   *
   * Published only, and a 404 otherwise — an unpublished record is not
   * "hidden from the list but readable if you know the address", it is off
   * the site. A 404 rather than a 403 for the same reason: the public has no
   * business learning that a draft exists.
   */
  async getPublishedBySlug(slug: string): Promise<UniversityDocument> {
    const uni = await University.findOne({ slug, published: true });
    if (!uni) throw ApiError.notFound("University not found");
    return uni;
  },

  async create(input: UniversityInput): Promise<UniversityDocument> {
    const name = (input.name ?? "").trim();
    return University.create({
      ...toCreate(input),
      slug: await freeSlug(name),
    });
  },

  /**
   * A rename moves the address, and everything else leaves it alone.
   *
   * That is a real trade and worth naming: an existing link to the old slug
   * will 404 after a rename. The alternative — pinning the slug at creation
   * — means a typo in a name is permanent in the URL forever, which is worse
   * for a list that is typed in by hand and corrected later. Renames are
   * rare; typos on first entry are not.
   */
  async update(id: string, input: UniversityInput): Promise<UniversityDocument> {
    const patch = toPatch(input);
    if (typeof input.name === "string" && input.name.trim()) {
      patch.$set = { ...patch.$set, slug: await freeSlug(input.name, id) };
    }

    /* runValidators, or a PATCH silently skips maxlength and every other
       schema rule — see the note in news.service. */
    const uni = await University.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });
    if (!uni) throw ApiError.notFound("University not found");
    return uni;
  },

  async remove(id: string): Promise<void> {
    const uni = await University.findByIdAndDelete(id);
    if (!uni) throw ApiError.notFound("University not found");
  },
};
