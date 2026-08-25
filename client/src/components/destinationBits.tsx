import { useState } from "react";

/**
 * The small shared pieces every destination page uses — the three icons and
 * the photo wrapper. Only genuinely generic things belong here: the sections
 * themselves stay in each country's own page, because Australia's pathways
 * and Canada's study permit are not the same shape and pretending otherwise
 * is how these pages end up saying nothing.
 */

export const Check = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const Pin = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * A photo that degrades to a plain tinted panel instead of a broken image.
 *
 * The destination pages are laid out around their photography before the
 * photography exists, so a page referencing a file nobody has uploaded yet
 * still looks finished — drop the file into client/public at the same path
 * and it appears on its own, with no code change. Missing shots are hidden
 * from screen readers, since an empty panel has nothing to describe.
 */
export function Shot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return <div className={`dpage-shot-empty ${className ?? ""}`} aria-hidden="true" />;
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setMissing(true)}
    />
  );
}
