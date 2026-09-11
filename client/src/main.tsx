import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import AppLoading from "./components/layout/AppLoading";
import ErrorBoundary from "./components/layout/ErrorBoundary";
import "@fontsource-variable/outfit"; // self-hosted Outfit font (all weights)
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* OUTSIDE THE ROUTER, and that placement is the point: a render error
        anywhere — including in the router itself, or in a lazily-loaded
        chunk that fails to parse — is caught here rather than blanking the
        page. Inside the router it could only catch what the router
        successfully rendered, which is not where the worst failures are.

        It wraps AppLoading too, so a crash cannot leave the loading veil
        stuck over an empty document. */}
    <ErrorBoundary>
      <BrowserRouter>
        <LoadingProvider>
          <AuthProvider>
            <App />
            {/* Splash on first load, and the veil during any request */}
            <AppLoading />
          </AuthProvider>
        </LoadingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
