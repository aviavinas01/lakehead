import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GoogleReviews from "./GoogleReviews";
import MobileActionBar from "./MobileActionBar";

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
      <MobileActionBar />
    </>
  );
}
