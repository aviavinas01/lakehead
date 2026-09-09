/**
 * The page headline for the director's message.
 *
 * THE HEADING IS DERIVED FROM THE TITLE rather than typed separately or
 * hard-coded, because those are the two ways it goes wrong. Hard-coded, a
 * page headed "MESSAGE FROM THE DIRECTOR" sits above a signature reading
 * "Founder & CEO" the moment the role is anything but director. Typed
 * separately, it is a third field that says almost the same thing as the
 * second one and drifts out of step with it the first time a title changes.
 *
 * Only the part before the first comma is used, because a title is written
 * for the signature at the foot of the page — "Founder & CEO, Lakehead
 * Education" reads correctly there and would give a headline of
 * "MESSAGE FROM FOUNDER & CEO, LAKEHEAD EDUCATION", which does not.
 *
 * The admin screen shows the result live under the title field, so nobody
 * has to know this rule exists to predict what they will get.
 */
export function directorHeading(title: string | undefined): string {
  const role = (title ?? "").split(",")[0]?.trim();
  if (!role) return "Message from the Director";
  return `Message from ${role}`;
}
