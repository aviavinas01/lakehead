import { Link } from "react-router-dom";
import { useYouTubeFeed } from "../../hooks/useYouTubeFeed";
import Filmstrip, { type StripItem } from "../shared/Filmstrip";

/**
 * "Your Success Story Starts Here" — the student videos from YouTube.
 *
 * The shelf itself is Filmstrip; this supplies the feed and the two
 * YouTube-shaped facts about an item: where the still comes from and what
 * the player's URL looks like. Everything about sliding, featuring and
 * counting lives in the shared component.
 *
 * YOUTUBE IS THE ONLY SOURCE, and there is deliberately no fallback content.
 * Placeholder clips used to sit behind this row, and every redeploy that
 * caught the feed at a bad moment put them back on the live site; a section
 * that is briefly absent is far better than one that confidently shows the
 * wrong thing. Filmstrip renders nothing for an empty list, so the page
 * simply closes up.
 */

/* maxresdefault is a true 16:9 file, but YouTube only has it for some
   uploads. hqdefault always exists — a 4:3 file with the wide frame
   letterboxed inside it, which the CSS zooms past.

   Asking for a maxresdefault that does not exist does not fail: YouTube
   answers 200 with a grey placeholder, so onError never fires. The width is
   the only tell, which is what Filmstrip's poster fallback checks. */
const hi = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export default function VideoTestimonials() {
  /* Shared with the testimonial row on the Study Abroad page — same retry
     behaviour, same no-fallback rule. */
  const tube = useYouTubeFeed("stories");

  const items: StripItem[] = tube.map((v) => ({
    id: v.id,
    title: v.title,
    poster: hi(v.id),
    posterFallback: v.thumbnail,
    /* -nocookie, and nothing is requested until the play button is pressed. */
    embed: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
  }));

  return (
    <Filmstrip
      items={items}
      eyebrow="Student stories"
      heading={
        <>
          Your <span className="h-accent">Success Story</span> Starts Here
        </>
      }
      link={
        <Link className="vt-btn" to="/testimonials">
          Watch their stories
        </Link>
      }
    />
  );
}
