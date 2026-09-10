import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A row of portrait cards with one pulled forward — the shelf the student
 * stories use, and now the TikTok shelves too.
 *
 * IT WAS PULLED OUT OF VideoTestimonials RATHER THAN COPIED. The carousel is
 * a hundred lines of index arithmetic and about as much stylesheet, and none
 * of it was ever about YouTube: the only YouTube-shaped parts were where a
 * still comes from and what URL the player takes. Those are now two fields
 * on an item. A second copy would have been a second place for the slide
 * arithmetic to be fixed in.
 *
 * ------------------------------------------------------------------
 * HOW IT READS. Copy down the left: the label, the heading, an optional
 * link, and at the foot of the column the counter and its two arrows. The
 * strip runs off the right edge of the screen. One card is featured — taller
 * and wider than the rest, standing above and below their line, title at the
 * top — and the others queue to its right at their smaller size.
 *
 * WHY THE LIST IS RENDERED TWICE. The strip slides by exactly one small card
 * per step, so by the last item there would be nothing but white to the
 * right of the feature. A second pass fills that space. Those copies are
 * decoration: never featured, never clickable, and aria-hidden so the list
 * is announced once.
 *
 * WHY THE ARITHMETIC WORKS. Every card before the featured one is a small
 * card — the feature is the only large one and everything ahead of it is
 * still to come. So the distance to slide is the index times one small card
 * plus one gap, a sum CSS does itself from --vt-i. Nothing is measured, so
 * nothing needs re-measuring on resize.
 *
 * NOTHING LOADS FROM THE PROVIDER UNTIL PLAY IS PRESSED. Only the featured
 * card ever mounts a player, and moving the feature takes it down again.
 * ------------------------------------------------------------------
 */

export interface StripItem {
  id: string;
  title: string;
  /** Shown small under the title, where there is one. */
  author?: string;
  /** The still. */
  poster: string;
  /**
   * Tried when `poster` fails, or comes back too small to be the real thing.
   *
   * YouTube is the reason this exists: asking for a maxresdefault that does
   * not exist does not fail — it answers 200 with a grey placeholder — so the
   * only tell is the width. TikTok has no equivalent and simply leaves this
   * unset.
   */
  posterFallback?: string;
  /** The player's src, mounted on play and not before. */
  embed: string;
}

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

function Poster({ item }: { item: StripItem }) {
  const [src, setSrc] = useState(item.poster);
  const [dead, setDead] = useState(!item.poster);
  const usingFallback = src !== item.poster;

  if (dead) return <span className="vt-blank" aria-hidden="true" />;

  return (
    <img
      className="vt-thumb"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => {
        if (item.posterFallback && !usingFallback) setSrc(item.posterFallback);
        else setDead(true);
      }}
      onLoad={(e) => {
        /* A still narrower than this is a provider's placeholder rather than
           the frame we asked for. */
        if (!usingFallback && item.posterFallback && e.currentTarget.naturalWidth < 800) {
          setSrc(item.posterFallback);
        }
      }}
    />
  );
}

export default function Filmstrip({
  items,
  eyebrow,
  heading,
  link,
  className,
}: {
  items: StripItem[];
  eyebrow: string;
  heading: ReactNode;
  /** Optional call to action under the heading. */
  link?: ReactNode;
  /** An extra class on the section, for per-shelf spacing or tinting. */
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const count = items.length;

  /* Moving the feature takes the player down with it — otherwise stepping
     along leaves a video playing inside a card that has shrunk back into the
     queue. */
  useEffect(() => setPlaying(false), [i]);

  /* The list can come back shorter when it refreshes, stranding the index
     past the end. */
  useEffect(() => {
    setI((v) => (count === 0 ? 0 : Math.min(v, count - 1)));
  }, [count]);

  if (count === 0) return null;
  const at = Math.min(i, count - 1);

  return (
    <section className={`vt${className ? ` ${className}` : ""}`}>
      <div className="vt-inner">
        <div className="vt-copy">
          <p className="vt-eyebrow">{eyebrow}</p>
          <h2 className="vt-title">{heading}</h2>
          {link}
          <div className="vt-nav">
            <button
              type="button" className="vt-arrow"
              onClick={() => setI(at - 1)} disabled={at === 0}
              aria-label="Previous"
            >
              <Chevron back />
            </button>
            <p className="vt-count" aria-live="polite">
              <span className="vt-count-now">{pad(at + 1)}</span> of {pad(count)}
            </p>
            <button
              type="button" className="vt-arrow"
              onClick={() => setI(at + 1)} disabled={at === count - 1}
              aria-label="Next"
            >
              <Chevron />
            </button>
          </div>
        </div>

        <div className="vt-stage">
          <div className="vt-track" style={{ "--vt-i": at } as CSSProperties}>
            {items.map((item, n) => {
              const featured = n === at;
              return (
                <figure
                  className="vt-card"
                  key={item.id}
                  data-featured={featured || undefined}
                  data-playing={(featured && playing) || undefined}
                >
                  {featured && playing ? (
                    <iframe
                      src={item.embed}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Poster item={item} />
                      <figcaption className="vt-name">
                        {item.title}
                        {item.author ? (
                          <span className="vt-by">{item.author}</span>
                        ) : null}
                      </figcaption>
                      {/* The featured card offers the player; the others offer
                          to become the featured card. One control per card
                          either way, so the strip is reachable from the
                          keyboard with no stray tab stops. */}
                      {featured ? (
                        <button
                          type="button" className="vt-play"
                          onClick={() => setPlaying(true)}
                          aria-label={`Play ${item.title}`}
                        >
                          <PlayIcon />
                        </button>
                      ) : (
                        <button
                          type="button" className="vt-pick"
                          onClick={() => setI(n)}
                          aria-label={`Show ${item.title}`}
                        />
                      )}
                    </>
                  )}
                </figure>
              );
            })}

            {/* The tail — there so the right of the strip is never white
                space, and inert. */}
            <div className="vt-tail" aria-hidden="true">
              {items.map((item) => (
                <figure className="vt-card" key={`tail-${item.id}`}>
                  <Poster item={item} />
                  <figcaption className="vt-name">{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
