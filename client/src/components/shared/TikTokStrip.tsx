import { useEffect, useState, type ReactNode } from "react";
import api from "../../api/client";
import Filmstrip, { type StripItem } from "./Filmstrip";

/**
 * One shelf of TikTok clips, on the page its category belongs to.
 *
 * FOUR SHELVES, FOUR PAGES. Student testimonials sit on the reviews page;
 * the three general ones sit beside the writing they explain — study-abroad
 * clips on the study-abroad landing page, test clips on test preparation,
 * visa clips on visa guidance. Somebody with a visa question is already on
 * the visa page, which is where a two-minute answer to it is worth most.
 *
 * The shelf renders nothing at all until that category has a published clip,
 * so every one of these pages is unchanged until the admin fills it. There
 * is no empty state and no heading over a blank row.
 *
 * NOTHING FROM TIKTOK LOADS UNTIL PLAY IS PRESSED — the still comes from our
 * own API, and the player is the plain `/embed/v2/` iframe rather than
 * TikTok's blockquote script, which would set tracking cookies on page load
 * whether or not anyone watched. See Filmstrip for the rest.
 */

export type TikTokCategory = "testimonial" | "study-abroad" | "tests" | "visas";

interface Clip {
  id: string;
  videoId: string;
  title: string;
  authorName: string;
  thumbnail: string;
}

export default function TikTokStrip({
  category,
  eyebrow,
  heading,
  link,
}: {
  category: TikTokCategory;
  eyebrow: string;
  heading: ReactNode;
  link?: ReactNode;
}) {
  const [clips, setClips] = useState<Clip[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ clips: Clip[] }>("/tiktok", { params: { category } })
      .then((res) => {
        if (!cancelled) setClips(res.data.clips ?? []);
      })
      /* A shelf that is briefly absent beats one that shows an error. */
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [category]);

  const items: StripItem[] = clips.map((c) => ({
    id: c.id,
    title: c.title || c.authorName || "TikTok",
    author: c.authorName || undefined,
    /* Signed and perishable; the server keeps it fresh. A still whose
       signature has expired falls back to the card's colour field rather
       than a torn image — see Filmstrip's Poster. */
    poster: c.thumbnail,
    embed: `https://www.tiktok.com/embed/v2/${c.videoId}`,
  }));

  return (
    <Filmstrip
      items={items}
      eyebrow={eyebrow}
      heading={heading}
      link={link}
      className="vt-tiktok"
    />
  );
}
