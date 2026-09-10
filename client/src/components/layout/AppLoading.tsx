import { useEffect, useState } from "react";
import Loader from "../shared/Loader";
import { useLoading } from "../../context/LoadingContext";

/**
 * The two places the loading mark appears — the SAME mark at the SAME size
 * in both, which is why neither passes a size any more. See Loader.
 *
 *
 *  · a splash over the whole page on the very first visit, held until the
 *    page's own assets have finished loading;
 *  · a lighter veil afterwards, whenever a request is in flight.
 *
 * The veil waits SHOW_DELAY before appearing and then stays for at least
 * MIN_VISIBLE. Most calls to a warm API return in well under a tenth of a
 * second, and a mark that flicks on and straight back off reads as a glitch —
 * so a quick request shows nothing at all, and a slow one shows something
 * that sits still long enough to be read.
 */

const SHOW_DELAY = 300;
const MIN_VISIBLE = 500;
/** The splash stays at least this long, even on a warm cache */
const MIN_SPLASH = 5000;
/** …but never longer than this, however slow an asset is */
const SPLASH_LIMIT = 9000;
/** Time the splash takes to fade off the page */
const FADE = 450;

export default function AppLoading() {
  const { busy } = useLoading();
  /* on → holding, out → fading away, done → gone */
  const [phase, setPhase] = useState<"on" | "out" | "done">("on");
  const [veil, setVeil] = useState(false);

  /* The splash lifts when BOTH are true: the window has finished loading
     (fonts, images, everything in the markup) and the minimum has elapsed.
     Whichever finishes last decides — so a slow connection is waited for,
     and a fast one still gets the full hold. The cap is the backstop. */
  useEffect(() => {
    let loaded = document.readyState === "complete";
    let waited = false;
    let closed = false;

    const lift = () => {
      if (closed || !loaded || !waited) return;
      closed = true;
      setPhase("out");
      window.setTimeout(() => setPhase("done"), FADE);
    };

    const onLoad = () => {
      loaded = true;
      lift();
    };
    if (!loaded) window.addEventListener("load", onLoad);

    const min = window.setTimeout(() => {
      waited = true;
      lift();
    }, MIN_SPLASH);

    /* Something never loaded — show the site anyway */
    const cap = window.setTimeout(() => {
      loaded = true;
      waited = true;
      lift();
    }, SPLASH_LIMIT);

    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(min);
      clearTimeout(cap);
    };
  }, []);

  /* Delayed on, minimum-duration off */
  useEffect(() => {
    if (busy) {
      const t = setTimeout(() => setVeil(true), SHOW_DELAY);
      return () => clearTimeout(t);
    }
    if (!veil) return;
    const t = setTimeout(() => setVeil(false), MIN_VISIBLE);
    return () => clearTimeout(t);
  }, [busy, veil]);

  if (phase !== "done") {
    return (
      <div className={`app-splash${phase === "out" ? " out" : ""}`} aria-live="polite">
        <Loader />
      </div>
    );
  }

  return (
    <div className={`app-veil${veil ? " on" : ""}`} aria-hidden={!veil}>
      <Loader />
    </div>
  );
}
