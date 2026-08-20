import { Suspense, lazy } from "react";

/**
 * The site's loading mark: a CSS ring, replaced by the Lottie animation as
 * soon as its chunk has loaded (and left in place if there is no animation
 * file — see LottieLoader for where to save it).
 */

const LottieLoader = lazy(() => import("./LottieLoader"));

/* Whether an animation file exists is known without pulling in the engine */
const present = Object.keys(
  import.meta.glob("../assets/loading.json")
).length > 0;

const Ring = ({ size }: { size: number }) => (
  <span className="loader-ring" style={{ width: size, height: size }} />
);

export default function Loader({ size = 96 }: { size?: number }) {
  return (
    <span className="loader" role="status" aria-label="Loading">
      {present ? (
        <Suspense fallback={<Ring size={size} />}>
          <LottieLoader size={size} />
        </Suspense>
      ) : (
        <Ring size={size} />
      )}
    </span>
  );
}
