/**
 * The site's loading mark: one rotating circle, one size, everywhere.
 *
 * IT TAKES NO SIZE. That is the whole point of this version. The previous
 * one had a `size` prop and was called at 260 on the splash, 140 on the
 * veil and 72 in the blog lists — three different marks for one meaning,
 * and the reader had no way to know they were the same thing. A prop that
 * every call site is free to answer differently is a prop that guarantees
 * they will. The size now lives in one place, `--loader-size` in the
 * stylesheet, and nothing can override it by passing a number.
 *
 * IT IS DRAWN, NOT LOADED. This used to be a Lottie animation played by
 * `lottie-react` out of a JSON file — an animation engine of about fifty
 * kilobytes gzipped, in its own chunk, to draw a circle going round. It had
 * to be lazily loaded to keep it off the first paint, which meant the space
 * sat empty for a moment before the loading mark itself appeared. A border
 * and a keyframe do the same job with no bytes, no chunk and no wait.
 */
export default function Loader() {
  return <span className="loader" role="status" aria-label="Loading" />;
}
