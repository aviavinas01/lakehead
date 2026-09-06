import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { YouTubeVideo } from "../types/api";
import { useYouTubeFeed } from "../hooks/useYouTubeFeed";

/**
 * "Your Success Story Starts Here" — the student videos, as a filmstrip with
 * one card pulled forward.
 *
 * HOW IT READS. Copy down the left: the label, the heading, a button, and at
 * the foot of the column the counter and its two arrows. The strip runs off
 * the right edge of the screen from there. One card is featured — taller and
 * wider than the rest, standing above and below their line, with its title
 * at the top — and the others queue to its right at their smaller size with
 * their titles at the foot. The arrows move the feature along and the strip
 * slides to keep it against the left edge of its own frame.
 *
 * WHY THE LIST IS RENDERED TWICE. The strip slides by exactly one small card
 * for each step, so by the last video there would be nothing but white to
 * the right of the feature — the section would look like it had run out. A
 * second pass of the same cards fills that space. They are decoration for
 * the tail of the strip and nothing else: never featured, never clickable,
 * and aria-hidden so the list is announced once.
 *
 * WHY THE ARITHMETIC WORKS. Every card before the featured one is a small
 * card — the feature is the only large one, and everything ahead of it is
 * still to come. So the distance to slide is the index times one small card
 * plus one gap, which is a sum CSS can do on its own from --vt-i. Nothing is
 * measured, so there is nothing to re-measure on resize and no layout read
 * on the way through a transition.
 *
 * YOUTUBE IS THE ONLY SOURCE, and there is deliberately no fallback content.
 * Placeholder clips used to sit behind this row, and every redeploy that
 * caught the feed at a bad moment put them back on the live site; a section
 * that is briefly absent is far better than one that confidently shows the
 * wrong thing. If the feed is unreachable this renders nothing at all and
 * the page closes up around it.
 *
 * A card stays a thumbnail until its play button is pressed. An embedded
 * player pulls in around a megabyte of YouTube's own code, and mounting
 * several on a page nobody has clicked yet is the quickest way to ruin the
 * home page — so only the featured card ever mounts one, and moving the
 * feature takes it back down.
 */

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

const Chevron = ({ back }: { back?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={back ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
  </svg>
);

/** 1 becomes "01" — the counter reads "04 of 06", not "4 of 6". */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The thumbnail.
 *
 * maxresdefault is a true 16:9 file, but YouTube only has it for some
 * uploads. hqdefault always exists — it is a 4:3 file with the wide frame
 * letterboxed inside it, so when we fall back to it the CSS zooms past those
 * black bars (.is-letterboxed).
 *
 * Asking for a maxresdefault that does not exist does not fail: YouTube
 * answers 200 with a grey placeholder, so onError never fires. The width is
 * what gives it away — the real file is 1280 across, the placeholder a
 * fraction of that.
 */
function Thumb({ video }: { video: YouTubeVideo }) {
  const [hd, setHd] = useState(true);
  return (
    <img
      className={`vt-thumb${hd ? "" : " is-letterboxed"}`}
      src={hd ? `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg` : video.thumbnail}
      onError={() => setHd(false)}
      onLoad={(e) => {
        if (hd && e.currentTarget.naturalWidth < 800) setHd(false);
      }}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

export default function VideoTestimonials() {
  /* Shared with the testimonial row on the Study Abroad page — same retry
     behaviour, same no-fallback rule. */
  const tube = useYouTubeFeed("stories");
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  const count = tube.length;

  /* Moving the feature takes the player down with it. Without this, stepping
     along would leave an iframe playing inside a card that had shrunk back
     into the queue. */
  useEffect(() => {
    setPlaying(false);
  }, [i]);

  /* The feed arrives after the first render and can come back shorter when
     it refreshes, which would strand the index past the end of the list. */
  useEffect(() => {
    setI((v) => (count === 0 ? 0 : Math.min(v, count - 1)));
  }, [count]);

  /* No videos, no section. */
  if (count === 0) return null;

  const at = Math.min(i, count - 1);

  return (
    <section className="vt">
      {/* Not a .container: the left column keeps the container's gutter so
          the copy lines up with every other heading on the page, while the
          right column runs on to the edge of the screen. */}
      <div className="vt-inner">
        <div className="vt-copy">
          <p className="vt-eyebrow">Student stories</p>
          <h2 className="vt-title">
            Your <span className="h-accent">Success Story</span> Starts Here
          </h2>
          <Link className="vt-btn" to="/testimonials">
            Watch their stories
          </Link>

          {/* Sits at the foot of the column, under whatever height the copy
              above happens to take. */}
          <div className="vt-nav">
            <button
              type="button"
              className="vt-arrow"
              onClick={() => setI(at - 1)}
              disabled={at === 0}
              aria-label="Previous story"
            >
              <Chevron back />
            </button>
            <p className="vt-count" aria-live="polite">
              <span className="vt-count-now">{pad(at + 1)}</span> of {pad(count)}
            </p>
            <button
              type="button"
              className="vt-arrow"
              onClick={() => setI(at + 1)}
              disabled={at === count - 1}
              aria-label="Next story"
            >
              <Chevron />
            </button>
          </div>
        </div>

        {/* The frame the strip slides inside. */}
        <div className="vt-stage">
          <div className="vt-track" style={{ "--vt-i": at } as CSSProperties}>
            {tube.map((v, n) => {
              const featured = n === at;
              return (
                <figure
                  className="vt-card"
                  key={v.id}
                  data-featured={featured || undefined}
                  /* Stated rather than inferred with :has(iframe). Every
                     other state in this codebase is a data- attribute the
                     component sets, and a selector that reads the card's
                     contents would quietly restyle it the day anything else
                     is put inside one. */
                  data-playing={(featured && playing) || undefined}
                >
                  {featured && playing ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Thumb video={v} />
                      <figcaption className="vt-name">{v.title}</figcaption>
                      {/* The featured card offers the player; the others
                          offer to become the featured card. One control per
                          card either way, so the whole strip is reachable
                          from the keyboard with no stray tab stops. */}
                      {featured ? (
                        <button
                          type="button"
                          className="vt-play"
                          onClick={() => setPlaying(true)}
                          aria-label={`Play ${v.title}`}
                        >
                          <PlayIcon />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="vt-pick"
                          onClick={() => setI(n)}
                          aria-label={`Show ${v.title}`}
                        />
                      )}
                    </>
                  )}
                </figure>
              );
            })}

            {/* The tail. See the note at the top: these are here so the right
                of the strip is never white space, and they are inert. */}
            <div className="vt-tail" aria-hidden="true">
              {tube.map((v) => (
                <figure className="vt-card" key={`tail-${v.id}`}>
                  <Thumb video={v} />
                  <figcaption className="vt-name">{v.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
