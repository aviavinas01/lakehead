import api from "./client";

/**
 * Events and news — the two things the office announces.
 *
 * They share a file because they share a screen and nothing else: an event
 * is ours and is written here, a news item is somebody else's and is only
 * linked to. Neither fetches anything from the address it holds; see the
 * models on the server for why the news side deliberately does not read the
 * page it points at.
 */

/** Must stay in step with EVENT_KINDS in server/src/models/Event.ts. */
export const EVENT_KINDS = [
  "Information session",
  "University visit",
  "Workshop",
  "Mock test",
  "Pre-departure",
] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export interface LakeheadEvent {
  _id: string;
  title: string;
  blurb: string;
  image?: string;
  /** ISO string. Sorts the list and dates the card. */
  startsAt?: string;
  /** Free text that wins over `startsAt` when set — "Late March". */
  when?: string;
  kind?: EventKind;
  where?: string;
  registerUrl?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  url: string;
  image?: string;
  summary: string;
  source?: string;
  /** ISO string — when THEY published it, not when we added it. */
  publishedAt?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** What the forms send. Everything optional; the server validates. */
export type EventInput = Partial<Omit<LakeheadEvent, "_id" | "createdAt" | "updatedAt">>;
export type NewsInput = Partial<Omit<NewsItem, "_id" | "createdAt" | "updatedAt">>;

/* ---- events ---- */

export const fetchEvents = async (): Promise<LakeheadEvent[]> =>
  (await api.get<{ events: LakeheadEvent[] }>("/events")).data.events ?? [];

export const fetchAllEvents = async (): Promise<LakeheadEvent[]> =>
  (await api.get<{ events: LakeheadEvent[] }>("/events/admin/all")).data.events ?? [];

export const createEvent = async (input: EventInput): Promise<LakeheadEvent> =>
  (await api.post<{ event: LakeheadEvent }>("/events", input)).data.event;

export const updateEvent = async (id: string, input: EventInput): Promise<LakeheadEvent> =>
  (await api.patch<{ event: LakeheadEvent }>(`/events/${id}`, input)).data.event;

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`);
};

/* ---- news ---- */

export const fetchNews = async (limit?: number): Promise<NewsItem[]> =>
  (await api.get<{ news: NewsItem[] }>("/news", { params: limit ? { limit } : undefined }))
    .data.news ?? [];

export const fetchAllNews = async (): Promise<NewsItem[]> =>
  (await api.get<{ news: NewsItem[] }>("/news/admin/all")).data.news ?? [];

export const createNews = async (input: NewsInput): Promise<NewsItem> =>
  (await api.post<{ item: NewsItem }>("/news", input)).data.item;

export const updateNews = async (id: string, input: NewsInput): Promise<NewsItem> =>
  (await api.patch<{ item: NewsItem }>(`/news/${id}`, input)).data.item;

export const deleteNews = async (id: string): Promise<void> => {
  await api.delete(`/news/${id}`);
};

/**
 * Put a picture in the uploads store and hand back its path.
 *
 * IT GOES THROUGH THE MEDIA ENDPOINT ON PURPOSE, rather than gaining an
 * upload route of its own. That one already has the multer limits, the mime
 * checks, the disk that Render mounts and a screen for deleting what is no
 * longer wanted — all of which would have to be duplicated, and kept in step,
 * for a second way to put a file on the same disk. The cost is that event and
 * news pictures also appear in the media library, which is where somebody
 * looking to delete one would think to look anyway.
 */
export const uploadImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ media: { url: string } }>("/media", form);
  return data.media.url;
};
