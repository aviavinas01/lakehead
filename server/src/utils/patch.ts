/**
 * Turn a partial body into a Mongo update that can also REMOVE things.
 *
 * ------------------------------------------------------------------
 * THE BUG THIS EXISTS TO PREVENT. `findByIdAndUpdate(id, { startsAt:
 * undefined })` does not clear the date — Mongoose drops undefined keys and
 * writes nothing at all. So a form that let you set a date could never let
 * you take one off again: the field would go blank in the browser, save
 * without error, and come back on the next load. Every optional field on a
 * record you can edit has this shape, so it is worth one helper rather than
 * one bug per field.
 * ------------------------------------------------------------------
 *
 * The three states have to stay distinguishable all the way from the form:
 *
 *   key absent   leave whatever is there alone   (a PATCH of one field)
 *   key = null   clear it                        (an emptied input)
 *   key = value  write it
 *
 * Which is why the validators normalise "" to null rather than to undefined:
 * JSON has no way to send undefined, so an emptied box and an untouched one
 * would otherwise arrive identical.
 */
export interface MongoPatch {
  $set?: Record<string, unknown>;
  $unset?: Record<string, 1>;
}

export function toPatch(input: Record<string, unknown>): MongoPatch {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, 1> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (value === null) $unset[key] = 1;
    else $set[key] = value;
  }

  const patch: MongoPatch = {};
  /* Empty operators are omitted: Mongo rejects `{ $unset: {} }` outright,
     and a save that changed one field would fail for the fields it did not
     touch. */
  if (Object.keys($set).length) patch.$set = $set;
  if (Object.keys($unset).length) patch.$unset = $unset;
  return patch;
}

/** The same input as a plain object for `create`, with the clears dropped. */
export function toCreate(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}
