import { LottieLight } from "lottie-react";

/**
 * The Lottie half of Loader, in its own chunk.
 *
 * Kept apart because the animation engine is ~50 kB gzipped — more than the
 * rest of the page put together at first paint. Loader shows the CSS ring
 * immediately and swaps this in when it arrives, so the loading mark never
 * has to wait on its own download.
 *
 * The animation is read from client/src/assets/loading.json — export
 * "Lottie JSON" from LottieFiles and save it there. import.meta.glob is used
 * rather than a plain import so the build still succeeds when it is absent.
 *
 * LottieLight is the light engine: SVG only, no expressions, which is all a
 * loading loop needs.
 */

const files = import.meta.glob("../assets/loading.json", {
  eager: true,
  import: "default",
}) as Record<string, object>;

export const animation = Object.values(files)[0];

export default function LottieLoader({ size }: { size: number }) {
  if (!animation) throw new Error("no animation");
  return (
    <LottieLight
      src={animation}
      loop
      autoplay
      className="loader-lottie"
      style={{ width: size, height: size }}
    />
  );
}
