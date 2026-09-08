import type { Inquiry, InquiryStatus, ServiceType } from "../types/api";

/**
 * What the enquiries actually say, worked out once and drawn elsewhere.
 *
 * Pure functions over the list the dashboard already fetches — no extra
 * requests, no server-side aggregation. At the few hundred records this site
 * deals with, counting in the browser is instant and costs one round trip
 * fewer than asking the API to group for us. If the list ever outgrows that,
 * these are the shapes an aggregation pipeline would have to return, and the
 * dashboard would not have to change.
 *
 * TWO QUESTIONS, WHICH IS WHY THERE ARE TWO HALVES:
 *
 *   DEMAND — how much is coming in, whether that is rising or falling, and
 *            what people are asking for. `byMonth`, `movement`, `byService`.
 *   SUPPLY — how much of it has actually been answered, and what is still
 *            sitting there. `backlog`, `oldestWaiting`.
 *
 * A dashboard that shows only the first flatters you: enquiries can climb
 * every month while the pile of unanswered ones climbs with them.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MonthBucket {
  key: string;
  label: string;
  year: number;
  count: number;
}

/** A valid date, or null. Guards against a malformed createdAt. */
const at = (iso: string): Date | null => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * The last `months` calendar months, oldest first, with what fell in each.
 *
 * Buckets are built first and filled second, so a month with no enquiries is
 * a zero in the middle of the line rather than a gap the chart skips over —
 * a quiet March has to be visible as a quiet March.
 */
export function byMonth(items: Inquiry[], months: number): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let back = months - 1; back >= 0; back--) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTHS[d.getMonth()],
      year: d.getFullYear(),
      count: 0,
    });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const it of items) {
    const d = at(it.createdAt);
    if (!d) continue;
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].count += 1;
  }
  return buckets;
}

/** The same buckets as a running total — the "growth" reading of the data. */
export function cumulative(buckets: MonthBucket[]): MonthBucket[] {
  let total = 0;
  return buckets.map((b) => {
    total += b.count;
    return { ...b, count: total };
  });
}

export interface Movement {
  now: number;
  before: number;
  /**
   * Fractional change, or null when there is nothing to compare against.
   *
   * NULL IS NOT ZERO. Going from no enquiries to five is not a 500% rise and
   * not a flat month either — it is a change with no percentage, and saying
   * so is more useful than printing an infinity.
   */
  delta: number | null;
}

/** The last `days` against the `days` before them. */
export function movement(items: Inquiry[], days: number): Movement {
  const cut = Date.now() - days * DAY_MS;
  const prior = cut - days * DAY_MS;
  let now = 0;
  let before = 0;
  for (const it of items) {
    const d = at(it.createdAt);
    if (!d) continue;
    const t = d.getTime();
    if (t >= cut) now += 1;
    else if (t >= prior) before += 1;
  }
  return { now, before, delta: before === 0 ? null : (now - before) / before };
}

export interface ServiceDemand {
  service: ServiceType;
  label: string;
  count: number;
  /** 0–1, of the whole period. */
  share: number;
  /** Against the previous window of the same length. Null: see Movement. */
  delta: number | null;
}

/** "study-abroad" → "Study abroad". */
export const serviceLabel = (s: string) => {
  const words = s.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * What people are asking for, commonest first, with each one's own trend.
 *
 * The trend is per service and not just overall, because that is the reading
 * that changes a decision: a quiet month whose visa enquiries have doubled
 * is a different month from a quiet one where everything fell together.
 */
export function byService(items: Inquiry[], days = 90): ServiceDemand[] {
  const cut = Date.now() - days * DAY_MS;
  const prior = cut - days * DAY_MS;

  const now = new Map<string, number>();
  const before = new Map<string, number>();
  let total = 0;

  for (const it of items) {
    const d = at(it.createdAt);
    if (!d) continue;
    const t = d.getTime();
    const key = it.service ?? "other";
    if (t >= cut) {
      now.set(key, (now.get(key) ?? 0) + 1);
      total += 1;
    } else if (t >= prior) {
      before.set(key, (before.get(key) ?? 0) + 1);
    }
  }

  return [...now.entries()]
    .map(([service, count]) => {
      const was = before.get(service) ?? 0;
      return {
        service: service as ServiceType,
        label: serviceLabel(service),
        count,
        share: total === 0 ? 0 : count / total,
        delta: was === 0 ? null : (count - was) / was,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export interface Backlog {
  counts: Record<InquiryStatus, number>;
  total: number;
  /** 0–1. Anything not still "new" has been picked up by somebody. */
  answeredShare: number;
}

export function backlog(items: Inquiry[]): Backlog {
  const counts: Record<InquiryStatus, number> = { new: 0, contacted: 0, closed: 0 };
  for (const it of items) {
    if (it.status in counts) counts[it.status] += 1;
  }
  const total = items.length;
  return {
    counts,
    total,
    answeredShare: total === 0 ? 1 : (counts.contacted + counts.closed) / total,
  };
}

/** The oldest enquiry nobody has touched — the one that matters most. */
export function oldestWaiting(items: Inquiry[]): Inquiry | null {
  let oldest: Inquiry | null = null;
  let oldestAt = Infinity;
  for (const it of items) {
    if (it.status !== "new") continue;
    const d = at(it.createdAt);
    if (!d || d.getTime() >= oldestAt) continue;
    oldest = it;
    oldestAt = d.getTime();
  }
  return oldest;
}

/** Whole days since an ISO date, floored. */
export const daysSince = (iso: string): number => {
  const d = at(iso);
  if (!d) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / DAY_MS));
};

/** 0.184 → "+18%", -0.5 → "−50%", null → "—". */
export const asPercent = (delta: number | null): string => {
  if (delta === null) return "—";
  const pct = Math.round(delta * 100);
  /* A true minus sign, not a hyphen: at this size a hyphen reads as a dash
     joining the number to the word before it. */
  return pct > 0 ? `+${pct}%` : pct < 0 ? `−${Math.abs(pct)}%` : "0%";
};
