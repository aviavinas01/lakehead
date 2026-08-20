import { Link } from "react-router-dom";
import { contact } from "../config/contact";

/**
 * Fixed contact bar pinned to the bottom of the viewport on phones.
 * Replaces the contact pills that sit in the desktop top bar — that
 * strip is hidden below 860px (see .topbar in styles.css).
 * Hidden on desktop via CSS.
 */

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const EnquireIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>
);

export default function MobileActionBar() {
  return (
    <nav className="mobile-actions" aria-label="Quick contact">
      <a className="mobile-action" href={contact.phoneHref}>
        <PhoneIcon />
        Talk
      </a>
      <a
        className="mobile-action"
        href={contact.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ChatIcon />
        Chat
      </a>
      <Link className="mobile-action" to="/contact">
        <EnquireIcon />
        Enquire
      </Link>
    </nav>
  );
}
