import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scroll behaviour across navigations — the thing a single-page app loses
 * that a plain website gets for free.
 *
 * React Router changes the URL without touching the scroll position, so
 * following a link from halfway down one page drops you halfway down the
 * next one. This restores the behaviour people already expect from the
 * browser, and it turns on the distinction that makes it feel right:
 *
 *   - Following a LINK to a page (PUSH) starts at the top. You asked for
 *     something new, so you get the beginning of it.
 *   - Going BACK or FORWARD (POP) returns you to where you were on that
 *     page. The history entry you are returning to is the one you left, and
 *     losing your place in it is the annoying part of a bad SPA.
 *
 * The two are told apart by `useNavigationType`. Positions are keyed on
 * `location.key`, which React Router mints per history entry, so two visits
 * to the same URL keep separate positions — correct, because they are
 * different moments in the history stack.
 *
 * The path is folded into that key as well, and not for tidiness. React
 * Router labels the FIRST entry of every freshly loaded document `"default"`
 * rather than a unique id, so a bare key would let one page's position be
 * restored onto a different page opened cold in the same tab. Pairing the
 * key with the path makes that collision impossible while leaving the
 * genuinely useful case — reloading a page and keeping your place — intact.
 */

/* Positions are held in memory for speed — this is written on every scroll
   frame — and mirrored to sessionStorage when leaving a page, so going back
   still works after a reload. sessionStorage is per-tab and cleared when the
   tab closes, which is exactly the lifetime a scroll position should have. */
const STORE_KEY = "lakehead:scroll";
const positions = new Map<string, number>();

/* Every storage call is wrapped: private windows, blocked site data and
   embedded contexts all throw on access rather than returning null, and a
   remembered scroll position is never worth breaking a page over. */
function loadStore(): void {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (!raw) return;
    for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, number>)) {
      positions.set(k, v);
    }
  } catch {
    /* no stored positions — everything simply starts at the top */
  }
}

function saveStore(): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(positions)));
  } catch {
    /* in-memory positions still work for this tab */
  }
}

loadStore();

/**
 * Restoring is not a single scrollTo: on arrival the page is often shorter
 * than it will be a moment later, because images and fetched content have
 * not landed yet, and scrolling to 900px in a 600px document silently lands
 * at the bottom instead. So the target is re-applied across a few frames
 * until the document is actually tall enough to hold it, then stopped.
 *
 * The budget matters as much as the retry: without it, a page that never
 * grows tall enough would fight the reader for every frame they scrolled.
 */
const RESTORE_BUDGET_MS = 600;

function restore(y: number): () => void {
  const deadline = performance.now() + RESTORE_BUDGET_MS;
  let frame = 0;

  const tick = () => {
    const reachable = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.min(y, Math.max(reachable, 0)));
    /* Done once the document can hold the position, or once the budget is
       spent — whichever comes first. */
    if (reachable >= y || performance.now() > deadline) return;
    frame = requestAnimationFrame(tick);
  };

  tick();
  return () => cancelAnimationFrame(frame);
}

/** Identifies one history entry ON one path — see the note above. */
const idFor = (key: string, pathname: string) => `${key}|${pathname}`;

export default function ScrollManager() {
  const { key, hash, pathname } = useLocation();
  const navigationType = useNavigationType();
  const id = idFor(key, pathname);
  const currentId = useRef(id);

  /* The browser's own restoration would fight ours on reload and on
     back/forward, so it is handed over explicitly. */
  useEffect(() => {
    if (!("scrollRestoration" in history)) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  /* Records where the reader is, against the entry they are on. Cheap enough
     to run on every scroll event: a Map write and nothing else.
   *
   * Mounted once and reading the key from a ref, rather than re-subscribing
   * per navigation. That is not a micro-optimisation — it is what makes the
   * ordering correct. React runs every layout-effect cleanup and body before
   * any passive-effect cleanup, so a per-key listener torn down in a passive
   * cleanup would record its position AFTER the layout effect below had
   * already scrolled the new page to the top, saving 0 for the page just
   * left and losing the reader's place. Reading from a ref that the layout
   * effect updates before it scrolls keeps every write on the right entry. */
  useEffect(() => {
    const onScroll = () => positions.set(currentId.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Positions only reach sessionStorage when the entry changes, which a
     reload never does — and because this component takes scrollRestoration
     off the browser, a reload without this flush would land at the top and
     be WORSE than doing nothing at all. `pagehide` is the reliable moment:
     it fires for reloads, for leaving the site, and unlike `beforeunload` it
     does not disqualify the page from the back/forward cache. */
  useEffect(() => {
    const flush = () => {
      positions.set(currentId.current, window.scrollY);
      saveStore();
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  /* Before paint, so the reader never sees the old position on the new page.
     useLayoutEffect is deliberate here — an ordinary effect runs after the
     browser has already painted, which is exactly the flicker being fixed. */
  useLayoutEffect(() => {
    /* Hand over to the new entry before scrolling anything, so the scroll
       events this effect is about to cause are recorded against the page
       arriving rather than the one being left. */
    if (currentId.current !== id) {
      saveStore();
      currentId.current = id;
    }

    /* An in-page anchor (#costs and the like) is asking for a specific
       element, not the top. scroll-margin-top on the target keeps it clear
       of the fixed header. */
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    if (navigationType === "POP") {
      const saved = positions.get(id);
      if (saved != null && saved > 0) return restore(saved);
    }

    window.scrollTo(0, 0);
  }, [id, hash, navigationType]);

  return null;
}
