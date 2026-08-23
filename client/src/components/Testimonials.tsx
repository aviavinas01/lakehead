import { useRef, useState } from "react";

/**
 * Student testimonials — one story is shown at a time, with the neighbouring
 * students' photos faded out on either side. Add entries here; `image` is a
 * path under client/public (e.g. "/testimonials/aarav.jpg") and is optional —
 * without one the student's initial is drawn in the circle instead.
 */
const TESTIMONIALS: {
  quote: string;
  name: string;
  country: string;
  image?: string;
}[] = [
  {
    quote:
      "I’m truly grateful for the guidance and support I received throughout my USA visa process. The team helped me understand each step clearly and prepared me thoroughly for my visa interview. What I appreciated most was the honest advice and practical guidance—I always knew what to expect and how to prepare. Their patience, professionalism, and willingness to answer every question made the entire process much less stressful. I would definitely recommend their guidance to anyone planning to study in the USA.",
    name: "Aarav",
    country: "USA",
  },
  {
    quote:
      "I had a great experience with the team throughout my study-abroad and visa application journey. A special thanks to the entire counseling team for their continuous support, clear guidance, and professional service at every stage. They were always approachable and made sure my questions were answered and my application was prepared properly. I truly appreciate their dedication and would happily recommend their services to other students planning to study abroad.",
    name: "Sanjay",
    country: "Australia",
  },
  {
    quote:
      "I had a really positive experience with the consultancy throughout my study-abroad application. From selecting the right university to preparing my documents, the team was supportive and easy to communicate with. They explained each step clearly and helped me feel confident about my application. I’m very thankful for their guidance and would definitely recommend them to other students.",
    name: "Nisha",
    country: "Australia",
  },
  {
    quote:
      "The entire process was much easier than I expected, thanks to the guidance I received from the counseling team. They helped me shortlist suitable universities, understand the requirements, and prepare my application properly. Whenever I had questions, the team was quick to respond and provide clear answers. I really appreciate their professionalism and support throughout my journey.",
    name: "Rohan",
    country: "Uk",
  },
  {
    quote:
      "I’m extremely happy with the support I received during my study-abroad journey. The counselors were patient, approachable, and genuinely focused on helping me make the right decisions. They guided me through the documentation and application process and kept me informed at every stage. It was reassuring to have a team I could rely on throughout the process.",
    name: "Sneha",
    country: "New Zealand",
  },
  {
    quote:
      "I had a smooth and positive experience with the team from the beginning of my application journey. They helped me understand the admission requirements, guided me through the documentation, and kept the process well organized. Their quick responses and friendly approach made everything much easier. I’m grateful for their support and would recommend them to anyone planning to study abroad.",
    name: "Aayush",
    country: "Canada",
  },
  {
    quote:
      "The guidance I received throughout my application process was excellent. The counselors took the time to understand my goals and helped me choose an option that suited my academic plans. They were always available to clarify my doubts and provided helpful advice whenever I needed it. I truly appreciate their dedication and support in helping me take the next step toward studying abroad.",
    name: "Srijana",
    country: "Denmark",
  },
];

/** How many faded photos sit either side of the student being read. */
const SIDE_COUNT = 2;

/** Distance (px) a swipe must cover before it counts as prev/next. */
const SWIPE_THRESHOLD = 45;

/**
 * Where one student's photo sits relative to the story being read. Every
 * photo stays mounted at all times and only its slot changes, so the whole
 * row glides between stories instead of snapping to a new set of circles.
 *
 * `depth` is how far out from the middle the photo sits (0 = active) and
 * `dir` which side it is on. Photos past the visible ring are marked
 * `hidden`: they wait just off the row at zero opacity and fade in as they
 * come round, so nothing ever appears or disappears on the spot.
 */
function slotFor(index: number, active: number, total: number) {
  const ring = Math.min(SIDE_COUNT, Math.floor((total - 1) / 2));
  const half = Math.floor(total / 2);

  /* Shortest way round the loop, so a photo always drifts toward the
     nearer edge rather than travelling the length of the row. */
  let offset = index - active;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  const distance = Math.abs(offset);
  return {
    depth: Math.min(distance, ring),
    dir: offset === 0 ? "c" : offset < 0 ? "l" : "r",
    hidden: distance > ring,
  };
}

function Arrow({ dir }: { dir: -1 | 1 }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <path d={dir === -1 ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const total = TESTIMONIALS.length;
  const step = (dir: -1 | 1) => setActive((i) => (i + dir + total) % total);
  const current = TESTIMONIALS[active];

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1);
  };

  if (total === 0) return null;

  return (
    <section className="testimonials section">
      {/* Watermark: a dashed flight path looping its way off to the left,
          behind the content. The viewBox is cropped to the path's own bounds
          so the artwork fills the box the CSS gives it. */}
      <svg
        className="testimonials-decor"
        viewBox="0 84 300 92"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          {/* Solid through the loops, easing off at either tail */}
          <linearGradient id="testimonials-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="0.15" stopColor="currentColor" stopOpacity="1" />
            <stop offset="0.87" stopColor="currentColor" stopOpacity="1" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M296 170c-28-2-46-6-60-16-22-14-34-44-18-60 14-14 38-4 34 22-4 24-36 38-62 42-24 4-44 2-64-8-20-10-26-34-13-45 11-9 27 0 23 18-4 16-26 25-48 27-30 3-60-2-84-12"
          stroke="url(#testimonials-trail)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="7 9"
        />
      </svg>
      <div className="container">
        <div className="testimonials-head">
          <h2 className="testimonials-title">
            What Our <span className="h-teal">Students</span> Say
          </h2>
          <p className="testimonials-lead">
            Every student has a unique journey. Hear from those who have trusted
            us to guide their study-abroad plans and take the next step toward
            their international education goals.
          </p>
        </div>

        <div
          className="testimonial-stage"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="testimonial-arrow testimonial-arrow-prev"
            onClick={() => step(-1)}
            aria-label="Previous student"
          >
            <Arrow dir={-1} />
          </button>

          <div className="testimonial-faces">
            {TESTIMONIALS.map((t, index) => {
              const { depth, dir, hidden } = slotFor(index, active, total);
              const isActive = index === active;
              return (
                <button
                  key={t.name}
                  type="button"
                  className="testimonial-face"
                  data-depth={depth}
                  data-dir={dir}
                  data-hidden={hidden || undefined}
                  onClick={() => setActive(index)}
                  aria-label={`Read the story from ${t.name}`}
                  aria-current={isActive || undefined}
                  aria-hidden={hidden || undefined}
                  tabIndex={isActive || hidden ? -1 : 0}
                >
                  {t.image ? (
                    <img src={t.image} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="testimonial-initial" aria-hidden="true">
                      {t.name.charAt(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="testimonial-arrow testimonial-arrow-next"
            onClick={() => step(1)}
            aria-label="Next student"
          >
            <Arrow dir={1} />
          </button>
        </div>

        {/* The wrapper stays put so screen readers announce each new story;
            the figure inside is remounted so the copy fades in with the photo */}
        <div aria-live="polite">
          <figure className="testimonial-story" key={active}>
            <figcaption className="testimonial-who">
              <strong>{current.name}</strong>
              <span>{current.country}</span>
            </figcaption>
            <blockquote>{current.quote}</blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
}
