import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GoogleReviews from "./GoogleReviews";
import ChatDock from "./ChatDock";
import HeavyScroll from "./HeavyScroll";
import PageReveal from "./PageReveal";

export default function Layout() {
  return (
    <>
      {/* Gives the wheel weight on every public page. Renders nothing, and
          stands aside entirely on touch, under reduced motion, and over any
          inner scroller that can take the scroll itself — see the component. */}
      <HeavyScroll />
      {/* Fades section headings in on the pages that carry `dpage-ruled`.
          Renders nothing and does nothing anywhere else. */}
      <PageReveal />
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
      {/* The fixed bottom contact bar (components/layout/MobileActionBar.tsx) used
          to sit here on small screens. Removed at the client's request; the
          component is left in the tree, unmounted, so putting it back — here
          for every page, or inside one page — is a single line. */}
    </>
  );
}
