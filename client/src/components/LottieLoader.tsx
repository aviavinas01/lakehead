import { LottieLight } from "lottie-react";

/**
 * The Lottie half of Loader, in its own chunk.
 *
 * Kept apart because the animation engine is ~50 kB gzipped — more than the
 * rest of the page put together at first paint, and no reason to hold up
 * everything else while it downloads.
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

export const animation = Object.values(files)[0] as
  | { w?: number; h?: number }
  | undefined;

export default function LottieLoader({ size }: { size: number }) {
  if (!animation) return null;
  /* `size` is the width; the height follows the artboard's own proportions,
     so the box hugs the artwork instead of letterboxing it. */
  const { w = 1, h = 1 } = animation;
  return (
    <LottieLight
      src={animation}
      loop
      autoplay
      className="loader-lottie"
      style={{ width: size, height: Math.round((size * h) / w) }}
    />
  );
}
