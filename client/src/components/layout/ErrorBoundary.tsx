import { Component, type ErrorInfo, type ReactNode } from "react";
import { contact } from "../../config/contact";

/**
 * The last thing between a render error and a white screen.
 *
 * ------------------------------------------------------------------
 * WHY THIS EXISTS. React unmounts the entire tree when a render throws and
 * nothing catches it. Not the failing section — the whole application. So one
 * bad character in one piece of fetched content, or one undefined read in one
 * component, and a visitor gets a blank white page with no explanation, no
 * navigation and no way back. They leave, and nobody learns it happened.
 *
 * A CLASS COMPONENT, because `componentDidCatch` and
 * `getDerivedStateFromError` have no hook equivalent. This is the one place
 * in the codebase that needs one.
 *
 * IT REPORTS ONCE, AND FAILING TO REPORT CHANGES NOTHING. The fetch is fired
 * and forgotten: if the API is the thing that is down, the visitor still sees
 * this page rather than an error about the error. See the endpoint's own note
 * for why it logs rather than stores.
 *
 * RESETTING IS A FULL RELOAD, not a state reset. Clearing `error` would
 * re-render the same tree from the same props that just threw, which usually
 * throws again immediately — a button that visibly does nothing is worse than
 * one that is honest about what it does.
 * ------------------------------------------------------------------
 */

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    /* Kept out of the render path deliberately — this runs after React has
       already decided to show the fallback, so a slow or failing report
       cannot delay what the visitor sees. */
    void fetch("/api/v1/client-errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        /* The same header the shared axios instance sends. Without it the
           CSRF guard refuses the post — see server middleware/csrf. */
        "X-Requested-By": "lakehead-admin",
      },
      body: JSON.stringify({
        message: String(error?.message ?? "Unknown error").slice(0, 300),
        stack: `${error?.stack ?? ""}\n--- component stack ---${info?.componentStack ?? ""}`.slice(0, 4000),
        path: window.location.pathname.slice(0, 200),
      }),
      keepalive: true,
    }).catch(() => {
      /* If reporting fails there is nothing sensible left to do. The page
         below is already telling the visitor what to do next. */
    });
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="crashed">
        <div className="container crashed-inner">
          <p className="crashed-eyebrow">Something went wrong</p>
          <h1>This page did not load properly.</h1>
          <p className="crashed-lead">
            That is a fault at our end, not anything you did. It has been
            reported automatically. Reloading usually clears it — and if you
            were in the middle of something, a counsellor can pick it up from
            here.
          </p>
          <div className="crashed-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => window.location.reload()}
            >
              Reload the page
            </button>
            {/* Plain anchors, not react-router Links: the router lives inside
                the tree that has just failed, and asking it to navigate is
                asking the broken thing to fix itself. A full page load starts
                the application again from scratch. */}
            <a className="crashed-link" href="/">
              Go to the home page
            </a>
            <a
              className="crashed-link"
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message a counsellor
            </a>
          </div>
        </div>
      </div>
    );
  }
}
