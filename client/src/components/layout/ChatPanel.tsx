import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  askAssistant,
  askById,
  fetchStart,
  type AssistantReply,
  type Suggestion,
} from "../../api/assistant";
import { contact } from "../../config/contact";
import { BotHead } from "./assistantMark";

/**
 * The conversation inside the chat dock.
 *
 * ------------------------------------------------------------------
 * IT KNOWS NOTHING. Every word it says comes back from /assistant — the
 * greeting, the answers, the suggestions and the "I cannot help with that"
 * are all written on the server in data/faqs.ts. This file renders a thread
 * and nothing else, which is what stops the assistant developing a second
 * personality in the front end the first time somebody edits a string here.
 *
 * IT ALWAYS OFFERS A PERSON. When the server says it could not answer, the
 * reply carries `offerContact` and a WhatsApp button appears under it. That
 * is the whole point of the feature: a student who asks something we have not
 * written down should end up talking to a counsellor, not staring at an
 * apology.
 *
 * THE PAUSE BEFORE A REPLY IS DELIBERATE. The answer is a lookup and comes
 * back in single-digit milliseconds, which reads as the panel ignoring you —
 * text appearing in the same frame as the button press does not feel like a
 * response, it feels like a page load. A short typing indicator gives the
 * exchange a rhythm. It is a floor, not a delay added to a slow request: a
 * reply that genuinely takes longer is not held back.
 * ------------------------------------------------------------------
 */

/**
 * How long the assistant appears to think, in ms.
 *
 * A LOOKUP RETURNS IN SINGLE-DIGIT MILLISECONDS, which reads as the panel
 * ignoring you: text that appears in the same frame as the button press does
 * not feel like a reply, it feels like a page that finished loading. Two
 * seconds is long enough to read as considered and short enough not to
 * annoy.
 *
 * The small per-character increment is what stops every reply arriving after
 * exactly the same beat, which is the thing that gives a bot away fastest.
 * A one-line answer comes back a little quicker than a six-line one, as it
 * would from a person typing. Capped, so a long answer never feels stuck.
 */
const THINK_BASE_MS = 1900;
const THINK_PER_CHAR_MS = 1.4;
const THINK_MAX_MS = 2900;

const thinkingTime = (answer: string) =>
  Math.min(THINK_MAX_MS, THINK_BASE_MS + answer.length * THINK_PER_CHAR_MS);

/** A follow-up lands shortly after the answer it belongs to, not after
    another full pause — it is the same turn, said in two breaths. */
const FOLLOW_UP_MS = 700;

/* The visitor's own locale and clock — a 24-hour country sees 14:05 and a
   12-hour one sees 2:05 pm, without this file deciding which. */
const clock = (at: number) =>
  new Date(at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

const dayLabel = (at: number) =>
  new Date(at).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

interface Message {
  key: number;
  from: "them" | "us";
  text: string;
  /** When it was said. Rendered as a time under each bubble, as in any
      messaging app — it is what makes a thread read as a conversation
      rather than as a list of paragraphs. */
  at: number;
  link?: { label: string; to: string };
  suggestions?: Suggestion[];
  offerContact?: boolean;
}

const WhatsAppGlyph = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm0 1.83c2.16 0 4.19.84 5.72 2.37a8.04 8.04 0 012.36 5.72c0 4.46-3.63 8.08-8.09 8.08a8.2 8.2 0 01-4.17-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.05 8.05 0 01-1.23-4.29c0-4.46 3.63-8.08 8.09-8.08zm-4.4 4.3c-.2 0-.53.08-.81.38-.28.3-1.07 1.04-1.07 2.54s1.1 2.95 1.25 3.15c.15.2 2.15 3.28 5.22 4.47.73.28 1.3.45 1.74.58.73.23 1.4.2 1.93.12.59-.09 1.81-.74 2.07-1.46.26-.72.26-1.33.18-1.46-.08-.13-.28-.2-.58-.35s-1.81-.89-2.09-.99c-.28-.1-.48-.15-.68.15s-.79.99-.96 1.19c-.18.2-.36.23-.66.08s-1.29-.47-2.45-1.51c-.91-.81-1.52-1.81-1.7-2.11-.18-.3-.02-.47.13-.62.14-.14.3-.36.46-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.66-.94-2.27-.24-.58-.48-.5-.67-.51h-.57z" />
  </svg>
);

const SendGlyph = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12l16-8-5.5 16L11 14z" />
  </svg>
);

export default function ChatPanel({ onNavigate }: { onNavigate: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  /* Opening chips live beside the thread rather than inside a bubble, so they
     stay reachable after the first exchange has scrolled past. */
  const [openers, setOpeners] = useState<Suggestion[]>([]);
  const thread = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const nextKey = useRef(0);
  /* Guards every setState after an await: the panel unmounts the moment
     somebody presses Escape, and a reply landing afterwards would otherwise
     be a React warning and a leak. */
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const push = useCallback((m: Omit<Message, "key" | "at">) => {
    setMessages((prev) => [
      ...prev,
      { ...m, key: nextKey.current++, at: Date.now() },
    ]);
  }, []);

  /* The opening. A failure here is not worth an error message — the panel
     still works, so it says hello in its own words and carries on. */
  useEffect(() => {
    let off = false;
    fetchStart()
      .then((s) => {
        if (off) return;
        push({ from: "them", text: s.greeting, suggestions: s.suggestions });
        setOpeners(s.suggestions);
      })
      .catch(() => {
        if (off) return;
        push({
          from: "them",
          text: "Hello, and welcome to Lakehead. Ask me anything about studying abroad — or message a counsellor directly if you would rather.",
          offerContact: true,
        });
      });
    return () => {
      off = true;
    };
  }, [push]);

  /* Newest message into view. `block: "nearest"` keeps the page behind the
     panel exactly where it was — the dock is not a modal. */
  useEffect(() => {
    const el = thread.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const receive = useCallback(
    async (get: () => Promise<AssistantReply>) => {
      setThinking(true);
      const started = Date.now();
      try {
        const reply = await get();
        /* A floor, not an added delay: a reply that genuinely took longer
           than this is not held back any further. */
        const held = Math.max(
          0,
          thinkingTime(reply.text) - (Date.now() - started)
        );
        await new Promise((r) => setTimeout(r, held));
        if (!alive.current) return;

        /* THE FOLLOW-UP IS A SECOND BUBBLE, not a longer first one. Where an
           entry has one it is a short nudge — "would you like me to explain
           X" — and running it onto the end of the answer turns a helpful
           aside into a wall. The chips and the link ride on the last bubble
           of the turn, whichever that is, so they always sit at the bottom. */
        const hasFollowUp = Boolean(reply.followUp);
        push({
          from: "them",
          text: reply.text,
          link: hasFollowUp ? undefined : reply.link,
          suggestions: hasFollowUp ? undefined : reply.suggestions,
          offerContact: hasFollowUp ? false : reply.offerContact,
        });

        if (reply.followUp) {
          setThinking(true);
          await new Promise((r) => setTimeout(r, FOLLOW_UP_MS));
          if (!alive.current) return;
          push({
            from: "them",
            text: reply.followUp,
            link: reply.link,
            suggestions: reply.suggestions,
            offerContact: reply.offerContact,
          });
        }
      } catch {
        if (!alive.current) return;
        push({
          from: "them",
          text: "Something went wrong at my end — that is my fault, not yours. A counsellor can answer straight away in the meantime.",
          offerContact: true,
        });
      } finally {
        if (alive.current) setThinking(false);
      }
    },
    [push]
  );

  const send = (e: FormEvent) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question || thinking) return;
    push({ from: "us", text: question });
    setDraft("");
    void receive(() => askAssistant(question));
  };

  const tapChip = (s: Suggestion) => {
    if (thinking) return;
    /* The chip's own text goes in as the visitor's message, so the thread
       reads as a conversation rather than as an answer with no question. */
    push({ from: "us", text: s.question });
    void receive(() => askById(s.id));
    field.current?.focus();
  };

  return (
    <>
      <div
        className="chatdock-thread"
        ref={thread}
        role="log"
        aria-live="polite"
        aria-label="Conversation with the Lakehead assistant"
      >
        {/* The day, once, at the top. A session is always today, so there is
            never a second one to draw — it is here because a thread that
            opens straight onto a bubble reads as a notification, and a dated
            conversation reads as a conversation. */}
        {messages.length > 0 ? (
          <p className="chatday">{dayLabel(messages[0].at)}</p>
        ) : null}

        {messages.map((m) => (
          <div key={m.key} className={`chatmsg chatmsg-${m.from}`}>
            {/* The assistant has a face beside every reply; the visitor does
                not need one to know which messages are theirs — the side of
                the panel and the colour already say it. */}
            {m.from === "them" ? (
              <span className="chatmsg-avatar" aria-hidden="true">
                <BotHead />
              </span>
            ) : null}

            <div className="chatmsg-body">
              <p className="chatdock-bubble">
                {m.text}
                {/* Floated, so it tucks onto the end of the last line when
                    there is room and drops to its own line when there is
                    not — which is what stops a one-word reply becoming two
                    lines tall. */}
                <time className="chatmsg-time" dateTime={new Date(m.at).toISOString()}>
                  {clock(m.at)}
                </time>
              </p>

              {m.link ? (
                <Link className="chatmsg-link" to={m.link.to} onClick={onNavigate}>
                  {m.link.label}
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h13M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ) : null}

              {m.offerContact ? (
                <a
                  className="chatdock-cta chatmsg-cta"
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppGlyph />
                  Talk to a counsellor
                </a>
              ) : null}

              {m.suggestions?.length ? (
                <ul className="chatchips">
                  {m.suggestions.map((sug) => (
                    <li key={sug.id}>
                      <button type="button" onClick={() => tapChip(sug)} disabled={thinking}>
                        {sug.question}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}

        {thinking ? (
          /* Carries the avatar too, so the reply lands in the space the dots
             were already occupying rather than shunting the thread sideways. */
          <div className="chatmsg chatmsg-them">
            <span className="chatmsg-avatar" aria-hidden="true">
              <BotHead />
            </span>
            <div className="chatmsg-body">
              <p className="chatdock-bubble chattyping" aria-label="Thinking">
                <span /> <span /> <span />
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <form className="chatdock-compose" onSubmit={send}>
        <input
          ref={field}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about courses, visas, costs…"
          aria-label="Ask the Lakehead assistant a question"
          maxLength={500}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!draft.trim() || thinking}
          aria-label="Send"
          title="Send"
        >
          <SendGlyph />
        </button>
      </form>

      {/* A quiet way back to the opening questions once the thread has moved
          on. Rendered only when there is a thread to have moved on from. */}
      {openers.length > 0 && messages.length > 3 ? (
        <p className="chatdock-note chatdock-reset">
          <button type="button" onClick={() => tapChip(openers[0])}>
            Not what you were after? Start again
          </button>
        </p>
      ) : null}
    </>
  );
}
