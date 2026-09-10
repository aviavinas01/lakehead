import { useEffect, useRef, useState } from "react";
import { contact } from "../../config/contact";
import ChatPanel from "./ChatPanel";
import { BotHead } from "./assistantMark";

/**
 * The floating dock in the bottom-right corner: a stack of two circles. The
 * lower one carries a headset counsellor at rest and turns into a bot's head;
 * the WhatsApp circle slides up out from behind it.
 *
 * Two ways to reach a person, one control:
 *
 *  - The upper circle goes to WhatsApp, using the same number as everywhere
 *    else on the site (config/contact.ts). It slides out on hover, on focus,
 *    and — since neither of those exists on a touch screen — it simply stays
 *    out on a coarse pointer, which is handled in the stylesheet.
 *  - The lower circle opens the assistant, which is live: it answers from
 *    the FAQ knowledge base on the server (see server/src/data/faqs.ts) and
 *    hands anything it cannot answer to a counsellor. The conversation
 *    itself is ChatPanel; everything here is the dock around it.
 *
 * Only the hover state lives in CSS (:hover / :focus-within); React holds
 * nothing but whether the panel is open, so there is no mouse bookkeeping to
 * fall out of step with the pointer.
 *
 * Mounted in Layout.tsx, which covers the public site only — the admin routes
 * sit outside that layout and get no dock, which is what we want.
 */

/* The resting face: a counsellor in a headset. It is the state the dock sits
   in almost all of the time, so it says "a person is on the other end of
   this" rather than naming the software. */
const AgentMark = () => (
  <svg
    className="chatdock-icon chatdock-icon-rest"
    viewBox="0 0 44 44"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 26v-4a13 13 0 0 1 26 0v4" />
    <rect x="5.5" y="24" width="7" height="10" rx="3.5" fill="currentColor" stroke="none" />
    <rect x="31.5" y="24" width="7" height="10" rx="3.5" fill="currentColor" stroke="none" />
    <circle cx="22" cy="20" r="5.2" />
    <path d="M13.5 34.5a8.5 8.5 0 0 1 17 0" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 1.83c2.16 0 4.19.84 5.72 2.37a8.04 8.04 0 012.36 5.72c0 4.46-3.63 8.08-8.09 8.08a8.2 8.2 0 01-4.17-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.05 8.05 0 01-1.23-4.29c0-4.46 3.63-8.08 8.09-8.08zm-4.4 4.3c-.2 0-.53.08-.81.38-.28.3-1.07 1.04-1.07 2.54s1.1 2.95 1.25 3.15c.15.2 2.15 3.28 5.22 4.47.73.28 1.3.45 1.74.58.73.23 1.4.2 1.93.12.59-.09 1.81-.74 2.07-1.46.26-.72.26-1.33.18-1.46-.08-.13-.28-.2-.58-.35s-1.81-.89-2.09-.99c-.28-.1-.48-.15-.68.15s-.79.99-.96 1.19c-.18.2-.36.23-.66.08s-1.29-.47-2.45-1.51c-.91-.81-1.52-1.81-1.7-2.11-.18-.3-.02-.47.13-.62.14-.14.3-.36.46-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.66-.94-2.27-.24-.58-.48-.5-.67-.51h-.57z" />
  </svg>
);

export default function ChatDock() {
  const [open, setOpen] = useState(false);
  const dock = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  /* Escape closes and hands focus back to the button; a click anywhere else
     closes without moving focus. Both listeners exist only while the panel is
     open, so the closed dock costs the page nothing. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!dock.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div className="chatdock" ref={dock} data-chat={open ? "open" : "closed"}>
      <button
        className="chatdock-btn"
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close the chat assistant" : "Open the chat assistant"}
      >
        <AgentMark />
        <BotHead className="chatdock-icon chatdock-icon-bot" />
      </button>

      {/* Hidden while the panel is open — the panel takes the space it slides
          into, and it carries a WhatsApp link of its own. The label is on the
          link rather than beside the glyph: the stack is two circles, and a
          word next to one of them would unbalance it. */}
      <a
        className="chatdock-wa"
        href={contact.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        title="Message us on WhatsApp"
      >
        <WhatsAppIcon />
      </a>

      {/* After the button in the document, so a keyboard reaches the panel by
          carrying on from the control that opened it. Not a modal: the page
          behind stays live and focus is not trapped. */}
      {open && (
        <div className="chatdock-panel" role="dialog" aria-label="Chat assistant">
          <div className="chatdock-head">
            <span className="chatdock-head-mark" aria-hidden="true">
              <BotHead className="chatdock-icon chatdock-icon-bot" />
            </span>
            <span className="chatdock-head-text">
              <strong>Lakehead assistant</strong>
              {/* A LIVE DOT, BUT AN HONEST LABEL. The reference this layout
                  follows says "Online", which on a chat with a named person
                  means somebody is at their desk. Nobody is: the dot means
                  the assistant is up, and the words say only what is true.
                  Anything it cannot answer is handed to a counsellor, which
                  is a person, and the reply says so when it happens. */}
              <small className="chatdock-status">
                <span className="chatdock-dot" aria-hidden="true" />
                Replies instantly
              </small>
            </span>
            <button
              type="button"
              className="chatdock-close"
              onClick={() => {
                setOpen(false);
                button.current?.focus();
              }}
              aria-label="Close the chat assistant"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {/* Closing on a link keeps the dock from hanging over the page
              it just sent somebody to. */}
          <ChatPanel onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
