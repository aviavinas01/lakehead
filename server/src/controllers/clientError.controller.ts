import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Record that a visitor's browser crashed.
 *
 * ------------------------------------------------------------------
 * IT LOGS AND NOTHING ELSE. No database write, deliberately: an endpoint
 * anybody can post to, writing rows nobody prunes, is a slow way to fill a
 * cluster. The platform already captures stdout and keeps it searchable, so
 * `console.error` is the store.
 *
 * WHAT IT IS FOR. Before this, a render error blanked the page and the first
 * anybody knew was somebody mentioning it — which is exactly how the missing
 * images were found, weeks late. One line in the log with the path and the
 * message turns that into something you can go and look at.
 *
 * The user agent is read from the request rather than sent by the client, so
 * a caller cannot claim to be a browser it is not. Nothing identifying the
 * person is recorded.
 * ------------------------------------------------------------------
 */
export const report = asyncHandler(async (req, res) => {
  const { message, stack, path } = req.body as {
    message: string;
    stack?: string;
    path?: string;
  };

  console.error(
    "[client] crash",
    JSON.stringify({
      path: path ?? "unknown",
      message,
      agent: req.get("user-agent")?.slice(0, 200) ?? "unknown",
      at: new Date().toISOString(),
    })
  );
  if (stack) console.error(stack);

  /* Nothing to say back. The page that sent this is already showing the
     visitor an apology, and a body here would only be something to parse in
     a component that has just crashed. */
  res.status(204).end();
});
