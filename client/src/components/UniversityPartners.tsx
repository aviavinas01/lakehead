import { useState } from "react";

/**
 * Partner logo marquee — the logo cards glide continuously right-to-left.
 * Hovering a card pauses the marquee, highlights it, and overlays that
 * university's campus photos on the other cards on screen; moving the
 * mouse away reverts them to logos and resumes the scroll.
 *
 * Files live in client/public/universities/. Each university lists its
 * `photos` below — drop images in using these names (or edit the paths).
 * Missing photo files are detected and simply skipped, so the hover effect
 * activates per-university as soon as its images exist.
 */
const photoSet = (n: number) => [
  `/universities/photos/uni-${n}-1.jpeg`,
  `/universities/photos/uni-${n}-2.jpeg`,
  `/universities/photos/uni-${n}-3.jpeg`,
];

const UNIVERSITIES: { name: string; logo: string; photos: string[] }[] = [
  { name: "University 1", logo: "/universities/uni-1.jpeg", photos: photoSet(1) },
  { name: "University 2", logo: "/universities/uni-2.jpeg", photos: photoSet(2) },
  { name: "University 3", logo: "/universities/uni-3.jpeg", photos: photoSet(3) },
  { name: "University 4", logo: "/universities/uni-4.jpeg", photos: photoSet(4) },
  { name: "University 5", logo: "/universities/uni-5.jpeg", photos: photoSet(5) },
  { name: "University 6", logo: "/universities/uni-6.jpeg", photos: photoSet(6) },
  { name: "University 7", logo: "/universities/uni-7.jpeg", photos: photoSet(7) },
  { name: "University 8", logo: "/universities/uni-8.jpeg", photos: photoSet(8) },
  { name: "University 9", logo: "/universities/uni-9.jpeg", photos: photoSet(9) },
  { name: "University 10", logo: "/universities/uni-10.jpeg", photos: photoSet(10) },
];

/* The list is rendered twice back-to-back; the CSS animation translates the
   track by -50%, so the second copy slides in exactly where the first began
   and the loop is seamless. */
const TRACK = [...UNIVERSITIES, ...UNIVERSITIES];

export default function UniversityPartners() {
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<number | null>(null);

  const markBroken = (url: string) =>
    setBroken((b) => ({ ...b, [url]: true }));

  /* Photo shown on card `j` while card `hovered` is held: the hovered
     university's photos, spread over the following cards in track order.
     The hovered card itself and its duplicate keep showing the logo. */
  const photoFor = (j: number): string | null => {
    if (hovered === null || j === hovered) return null;
    const uni = TRACK[hovered];
    if (TRACK[j].name === uni.name) return null;
    const photos = uni.photos.filter((p) => !broken[p]);
    if (photos.length === 0) return null;
    const dist = (j - hovered + TRACK.length) % TRACK.length;
    return photos[(dist - 1) % photos.length];
  };

  return (
    <section className="universities">
      <div className="container">
        <h2 className="universities-title">Our University Partnerships</h2>
      </div>
      <div className="uni-marquee">
        <div className="uni-track">
          {TRACK.map((u, j) => {
            const photo = photoFor(j);
            return (
              <div
                className="uni-card"
                key={j}
                onMouseEnter={() => setHovered(j)}
                onMouseLeave={() => setHovered(null)}
              >
                {broken[u.logo] ? (
                  <span className="uni-fallback">{u.name}</span>
                ) : (
                  <img
                    src={u.logo}
                    alt={u.name}
                    title={u.name}
                    loading="lazy"
                    onError={() => markBroken(u.logo)}
                  />
                )}
                {photo && (
                  <div className="uni-photo">
                    <img
                      src={photo}
                      alt={`${TRACK[hovered!].name} campus`}
                      onError={() => markBroken(photo)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
