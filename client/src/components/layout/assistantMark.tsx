/**
 * The assistant's face, defined once.
 *
 * Drawn in two places at two sizes — the dock's button, where it cross-fades
 * in over the resting counsellor mark, and beside every reply in the thread.
 * One definition rather than two, for the same reason the site has one arrow:
 * two versions of one face read as an oversight, not a decision, and these
 * two sit a few centimetres apart.
 *
 * `className` is passed through because the button's copy carries the
 * cross-fade classes and the avatar's does not.
 */
export const BotHead = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 44 44"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 7.5v4" />
    <circle cx="22" cy="5" r="2.3" fill="currentColor" stroke="none" />
    <rect x="9" y="11.5" width="26" height="21" rx="7" />
    <path d="M6.5 19v5M37.5 19v5" />
    <circle cx="16.5" cy="21" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="27.5" cy="21" r="2.4" fill="currentColor" stroke="none" />
    <path d="M17.5 27.5h9" />
  </svg>
);
