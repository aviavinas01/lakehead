/**
 * Dates between the API, the form controls and the page.
 *
 * Three representations, and mixing them up is the usual source of a date
 * that shows up a day early:
 *
 *   ISO      what the API sends and takes — always UTC ("…T05:15:00.000Z")
 *   input    what <input type="datetime-local"> uses — LOCAL, no zone
 *   display  what a reader sees
 *
 * The conversions below are deliberate about the middle one. `toISOString()`
 * on its own is fine going out, but coming back, slicing an ISO string to
 * get "YYYY-MM-DDTHH:mm" is not: that hands the control a UTC clock time and
 * labels it local, so an event at 11am in Kathmandu is offered back to the
 * office as 5:15am. Each part is read off the local getters instead.
 */

const pad = (n: number) => String(n).padStart(2, "0");

const valid = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** ISO → "YYYY-MM-DDTHH:mm" for <input type="datetime-local">. */
export const toLocalInput = (iso?: string | null): string => {
  const d = valid(iso);
  if (!d) return "";
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
};

/** ISO → "YYYY-MM-DD" for <input type="date">. */
export const toDateInput = (iso?: string | null): string => {
  const d = valid(iso);
  if (!d) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * What either input gives back → ISO, or "" for empty.
 *
 * "" AND NOT undefined: an emptied box has to reach the server as a value,
 * because that is how it says "clear this date". See server/utils/patch.
 */
export const fromInput = (value: string): string => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

/** "Saturday 14 March 2026, 11:00" — the long form, for an event card. */
export const formatWhen = (iso?: string | null): string => {
  const d = valid(iso);
  if (!d) return "";
  return d.toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** "14 March 2026" — no clock, for a news item. */
export const formatDay = (iso?: string | null): string => {
  const d = valid(iso);
  if (!d) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** The hostname of a link, for the "where this came from" line. */
export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
