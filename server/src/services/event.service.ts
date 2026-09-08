import { Event, type EventDocument, type IEvent } from "../models/Event.js";
import { ApiError } from "../utils/ApiError.js";
import { toCreate, toPatch } from "../utils/patch.js";

/**
 * What a caller is allowed to set.
 *
 * `null` is a value here and not an accident: it is how an emptied form field
 * says "clear this". See utils/patch.
 */
export type EventInput = Nullable<
  Pick<
    IEvent,
    | "title"
    | "blurb"
    | "image"
    | "startsAt"
    | "when"
    | "kind"
    | "where"
    | "registerUrl"
    | "published"
    | "order"
  >
>;

/** Every property optional, and every optional one clearable. */
type Nullable<T> = { [K in keyof T]?: T[K] | null };

/* The order the public page reads them in: hand-ranked first, then soonest,
   then most recently added. Matches the compound index on the model. */
const ORDER = { order: 1, startsAt: 1, createdAt: -1 } as const;

export const eventService = {
  /** The public list. Drafts never leave the building. */
  async listPublished(): Promise<EventDocument[]> {
    return Event.find({ published: true }).sort(ORDER);
  },

  /** The admin list — drafts included, which is the whole difference. */
  async listAll(): Promise<EventDocument[]> {
    return Event.find().sort(ORDER);
  },

  async create(input: EventInput): Promise<EventDocument> {
    /* Clears are meaningless on a record that does not exist yet, and
       writing an explicit null would store the key rather than omit it. */
    return Event.create(toCreate(input));
  },

  async update(id: string, input: EventInput): Promise<EventDocument> {
    /* `runValidators` because a PATCH bypasses schema validation otherwise —
       maxlength and the `kind` enum are enforced on create and would be
       silently skipped on every edit without it. */
    const event = await Event.findByIdAndUpdate(id, toPatch(input), {
      new: true,
      runValidators: true,
    });
    if (!event) throw ApiError.notFound("Event not found");
    return event;
  },

  async remove(id: string): Promise<void> {
    const event = await Event.findByIdAndDelete(id);
    if (!event) throw ApiError.notFound("Event not found");
    /* The image is deliberately NOT unlinked. It came from the media
       library, may be used elsewhere, and is deletable there — removing the
       file here would punch a hole in whatever else points at it. */
  },
};
