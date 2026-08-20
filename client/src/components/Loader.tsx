import { Suspense, lazy } from "react";

/**
 * The site's loading mark — the Lottie animation in
 * client/src/assets/loading.json, and nothing else. The engine arrives in
 * its own chunk (see LottieLoader), so the space is simply empty for the
 * moment it takes to load rather than being filled by a stand-in.
 */

const LottieLoader = lazy(() => import("./LottieLoader"));

/* Whether the file exists is known without pulling in the engine */
const present = Object.keys(import.meta.glob("../assets/loading.json")).length > 0;

export default function Loader({ size = 96 }: { size?: number }) {
  if (!present) return null;
  return (
    <span className="loader" role="status" aria-label="Loading">
      <Suspense fallback={null}>
        <LottieLoader size={size} />
      </Suspense>
    </span>
  );
}
