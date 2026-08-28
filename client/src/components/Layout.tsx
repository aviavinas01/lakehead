import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GoogleReviews from "./GoogleReviews";

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
      {/* The fixed bottom contact bar (components/MobileActionBar.tsx) used
          to sit here on small screens. Removed at the client's request; the
          component is left in the tree, unmounted, so putting it back — here
          for every page, or inside one page — is a single line. */}
    </>
  );
}
