import type { ReviewSource, SocialPlatform } from "../../data/testimonials";

/**
 * The marks and the star row shared by the reviews page.
 *
 * Every card on the wall says where it came from, and it says so with the
 * platform's own logo rather than a coloured word. That is partly honesty —
 * a Google review and a comment we typed in ourselves should not look alike —
 * and partly the whole reason the page works: six sources in one column only
 * reads as one conversation if you can tell at a glance which is which.
 *
 * Google's G is reproduced in its brand colours, as their terms require
 * wherever review content is shown. The rest are single-path glyphs tinted
 * by CSS, so they take the card's own colour when a card is inverted.
 */

export const StarRow = ({ score, size = 15 }: { score: number; size?: number }) => (
  <span className="rev-stars" aria-label={`${score} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"
        fill={n <= Math.round(score) ? "#f5b301" : "currentColor"}
        opacity={n <= Math.round(score) ? 1 : 0.22}>
        <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
      </svg>
    ))}
  </span>
);

export const GoogleG = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z" />
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z" />
    <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
  </svg>
);

const YouTubeMark = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M21.6 7.2a2.5 2.5 0 00-1.75-1.77C18.3 5 12 5 12 5s-6.3 0-7.85.43A2.5 2.5 0 002.4 7.2 26.3 26.3 0 002 12c0 1.6.13 3.22.4 4.8a2.5 2.5 0 001.75 1.77C5.7 19 12 19 12 19s6.3 0 7.85-.43a2.5 2.5 0 001.75-1.77c.27-1.58.4-3.2.4-4.8s-.13-3.22-.4-4.8zM10 15.2V8.8l5.4 3.2-5.4 3.2z" />
  </svg>
);

const FacebookMark = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M13.5 22v-8.1h2.7l.4-3.2h-3.1V8.7c0-.9.26-1.55 1.6-1.55h1.7V4.3c-.3-.04-1.3-.13-2.5-.13-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.2h2.7V22h3.4z" />
  </svg>
);

const InstagramMark = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.9" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedInMark = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M6.4 8.6H3.2V21h3.2V8.6zM4.8 3a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM13 8.6H9.9V21H13v-6.5c0-1.8.8-2.9 2.3-2.9 1.4 0 2 1 2 2.9V21h3.2v-7.2c0-3.2-1.7-5.4-4.5-5.4-1.6 0-2.6.7-3 1.6V8.6z" />
  </svg>
);

const TikTokMark = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M16.5 2h-3v13.1a2.6 2.6 0 11-2.2-2.57V9.4a5.7 5.7 0 105.2 5.68V8.9a6.9 6.9 0 004 1.28V7.1a4 4 0 01-4-4V2z" />
  </svg>
);

/** The quote mark standing in for a source with no logo of its own. */
const QuoteMark = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M9.4 5C6 6.6 4 9.6 4 13.4V19h6.3v-6.2H7.5c0-2.4 1-4 3-5L9.4 5zm10 0C16 6.6 14 9.6 14 13.4V19h6.3v-6.2h-2.8c0-2.4 1-4 3-5L19.4 5z" />
  </svg>
);

const PLATFORM_MARKS: Record<SocialPlatform, (p: { size?: number }) => JSX.Element> = {
  facebook: FacebookMark,
  instagram: InstagramMark,
  linkedin: LinkedInMark,
  tiktok: TikTokMark,
};

const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

/**
 * The little source tag in a card's corner. `platform` narrows a social item
 * to the network it was posted on; without one, a social card falls back to
 * the generic quote mark.
 */
export function SourceBadge({
  source,
  platform,
  size = 16,
}: {
  source: ReviewSource;
  platform?: SocialPlatform;
  size?: number;
}) {
  if (source === "google") {
    return (
      <span className="rev-badge rev-badge-google" title="Review on Google">
        <GoogleG size={size} />
        <span>Google</span>
      </span>
    );
  }
  if (source === "video") {
    return (
      <span className="rev-badge rev-badge-video" title="Video testimonial">
        <YouTubeMark size={size} />
        <span>Video</span>
      </span>
    );
  }
  if (source === "social" && platform) {
    const Mark = PLATFORM_MARKS[platform];
    return (
      <span className={`rev-badge rev-badge-${platform}`} title={PLATFORM_NAMES[platform]}>
        <Mark size={size} />
        <span>{PLATFORM_NAMES[platform]}</span>
      </span>
    );
  }
  return (
    <span className="rev-badge rev-badge-written" title="Sent to us directly">
      <QuoteMark size={size} />
      <span>Student</span>
    </span>
  );
}
