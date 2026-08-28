import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GoogleReviews from "./GoogleReviews";
import ChatDock from "./ChatDock";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      {/* Renders nothing until the server has real reviews to give */}
      <GoogleReviews />
      <Footer />
      {/* Fixed to the bottom-right corner of every public page. It sits in
          the layout rather than in App.tsx so the admin routes, which are
          outside this layout, do not get a visitor chat widget. */}
      <ChatDock />
      {/* The fixed bottom contact bar (components/MobileActionBar.tsx) used
          to sit here on small screens. Removed at the client's request; the
          component is left in the tree, unmounted, so putting it back — here
          for every page, or inside one page — is a single line. */}
    </>
  );
}
