import api from "./client";

/**
 * The curated YouTube rows, from the admin.
 *
 * These OUTRANK the playlist feed rather than replacing it: a row with picks
 * shows exactly those, in this order; a row with none falls back to the RSS
 * playlist in the environment, exactly as the site always did. So adding
 * nothing changes nothing, and deleting the last pick restores the playlist
 * instead of emptying the section.
 */

/** The two rows, and where each one appears. Must match FEEDS on the server. */
export const YOUTUBE_FEEDS = [
  {
    value: "stories",
    label: "Success stories",
    where: "Home page — the video row",
  },
  {
    value: "testimonials",
    label: "Student testimonials",
    where: "Study Abroad page",
  },
] as const;

export type YouTubeFeed = (typeof YOUTUBE_FEEDS)[number]["value"];

export interface YouTubeClip {
  _id: string;
  url: string;
  videoId: string;
  title: string;
  authorName: string;
  feed: YouTubeFeed;
  published: boolean;
  order: number;
  createdAt: string;
}

/** Always hqdefault: maxresdefault only exists for some videos and 404s. */
export const stillFor = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

export const fetchAllYouTube = async (): Promise<YouTubeClip[]> =>
  (await api.get<{ clips: YouTubeClip[] }>("/youtube/admin/all")).data.clips ?? [];

/** One video. */
export const addYouTubeVideo = async (
  url: string,
  feed: YouTubeFeed
): Promise<YouTubeClip> =>
  (await api.post<{ clip: YouTubeClip }>("/youtube", { url, feed, mode: "video" }))
    .data.clip;

/**
 * Every video in a playlist.
 *
 * `mode` is sent rather than left to the server to work out, because a URL
 * copied while watching a video inside a playlist carries both ids and the
 * address genuinely cannot say which was meant. See the controller.
 */
export const importYouTubePlaylist = async (
  url: string,
  feed: YouTubeFeed
): Promise<{ added: number; skipped: number }> =>
  (
    await api.post<{ added: number; skipped: number }>("/youtube", {
      url,
      feed,
      mode: "playlist",
    })
  ).data;

export const updateYouTube = async (
  id: string,
  input: Partial<Pick<YouTubeClip, "title" | "feed" | "published" | "order">>
): Promise<YouTubeClip> =>
  (await api.patch<{ clip: YouTubeClip }>(`/youtube/${id}`, input)).data.clip;

export const deleteYouTube = async (id: string): Promise<void> => {
  await api.delete(`/youtube/${id}`);
};
