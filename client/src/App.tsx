import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ScrollManager from "./components/layout/ScrollManager";
import Loader from "./components/shared/Loader";
import HeroKnockout from "./components/layout/HeroKnockout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminTheme from "./context/AdminTheme";
import Home from "./pages/Home";
import About from "./pages/about/About";
import Services from "./pages/services/Services";
import ServiceDetail from "./pages/services/ServiceDetail";
import TestPreparation from "./pages/services/TestPreparation";
import TestDetail from "./pages/services/TestDetail";
import VisaGuidance from "./pages/services/VisaGuidance";
import CareerCounselling from "./pages/services/CareerCounselling";
import StudentAccommodation from "./pages/services/StudentAccommodation";
import AdmissionGuidance from "./pages/services/AdmissionGuidance";
import Testimonials from "./pages/about/Testimonials";
import UniversityPartners from "./pages/about/UniversityPartners";
import UniversityDetail from "./pages/about/UniversityDetail";
import Gallery from "./pages/about/Gallery";
import Events from "./pages/happenings/Events";
import News from "./pages/happenings/News";
import Blog from "./pages/blog/Blog";
import BlogPost from "./pages/blog/BlogPost";
import Director from "./pages/about/Director";
import Contact from "./pages/Contact";
/* The five calculators behind /resources. One file each, and one route
   each below rather than a /resources/:slug that dispatches — a calculator
   is a page with its own inputs and its own copy, and a shared route would
   only push the dispatch one level down into a switch. */

/**
 * ROUTES THAT MOST VISITORS NEVER OPEN, fetched when they are.
 *
 * Three groups, and together roughly 40% of the source: the admin dashboard,
 * the seven destination guides, and the calculators. Before this they were
 * all in the single entry bundle, so somebody reading the home page on a
 * phone downloaded the post editor and the media library to do it.
 *
 * WHAT THIS COST ELSEWHERE. Two effects reach into the DOM on navigation —
 * PageReveal for `.dpage-ruled` and HeroKnockout for `.dpage-hero`, the
 * latter on exactly these destination routes. Both asked once, which was
 * safe only while every route was already mounted; with a chunk still in
 * flight they would have found nothing and quietly stopped working. Both now
 * wait — see lib/whenElement, which runs synchronously when the element is
 * already there, so nothing about the unsplit routes changed.
 *
 * ScrollManager needed nothing: its restore already retries across frames
 * for the same reason, because a page is often shorter on arrival than it is
 * a moment later.
 */
const StudyAbroad = lazy(() => import("./pages/study-abroad/StudyAbroad"));
const StudyInAustralia = lazy(() => import("./pages/study-abroad/StudyInAustralia"));
const StudyInCanada = lazy(() => import("./pages/study-abroad/StudyInCanada"));
const StudyInUK = lazy(() => import("./pages/study-abroad/StudyInUK"));
const StudyInUSA = lazy(() => import("./pages/study-abroad/StudyInUSA"));
const StudyInNewZealand = lazy(() => import("./pages/study-abroad/StudyInNewZealand"));
const StudyInSouthKorea = lazy(() => import("./pages/study-abroad/StudyInSouthKorea"));
const StudyInEurope = lazy(() => import("./pages/study-abroad/StudyInEurope"));
const Resources = lazy(() => import("./pages/resources/Resources"));
const IeltsBandScore = lazy(() => import("./pages/resources/calculators/IeltsBandScore"));
const PteScore = lazy(() => import("./pages/resources/calculators/PteScore"));
const NebGpa = lazy(() => import("./pages/resources/calculators/NebGpa"));
const SeeGpa = lazy(() => import("./pages/resources/calculators/SeeGpa"));
const GpaToPercentage = lazy(() => import("./pages/resources/calculators/GpaToPercentage"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Posts = lazy(() => import("./pages/admin/Posts"));
const PostEditor = lazy(() => import("./pages/admin/PostEditor"));
const Inquiries = lazy(() => import("./pages/admin/Inquiries"));
const Media = lazy(() => import("./pages/admin/Media"));
const Happenings = lazy(() => import("./pages/admin/Happenings"));
const People = lazy(() => import("./pages/admin/People"));

export default function App() {
  return (
    <>
      {/* Owns scroll position across every route — see the component */}
      <ScrollManager />
      {/* Cuts the hero headline out of the hero photo on study-abroad pages */}
      <HeroKnockout />
      {/* THE BOUNDARY FOR EVERY LAZY ROUTE, and one boundary rather than one
          per route: a route's chunk is fetched once and cached, so what this
          shows is a brief first-visit state, not a recurring one. Placed
          outside <Routes> so a chunk arriving does not remount the layout —
          the navbar, footer and chat dock stay put while a page loads.

          The fallback is the site's own loading mark in the same centred
          block the blog uses, so a page arriving looks like the rest of the
          site rather than like a different application. */}
      <Suspense
        fallback={
          <div className="loader-block">
            <Loader />
          </div>
        }
      >
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          {/* Static paths outrank /services/:slug in React Router's ranking,
              so these win for test-preparation regardless of order here. */}
          <Route path="/services/test-preparation" element={<TestPreparation />} />
          <Route path="/services/test-preparation/:test" element={<TestDetail />} />
          <Route path="/services/visa-guidance" element={<VisaGuidance />} />
          <Route path="/services/career-counselling" element={<CareerCounselling />} />
          <Route path="/services/student-accommodation" element={<StudentAccommodation />} />
          <Route path="/services/admission-guidance" element={<AdmissionGuidance />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/study-abroad" element={<StudyAbroad />} />
          <Route path="/study-in-australia" element={<StudyInAustralia />} />
          <Route path="/study-in-canada" element={<StudyInCanada />} />
          <Route path="/study-in-uk" element={<StudyInUK />} />
          <Route path="/study-in-usa" element={<StudyInUSA />} />
          <Route path="/study-in-new-zealand" element={<StudyInNewZealand />} />
          <Route path="/study-in-south-korea" element={<StudyInSouthKorea />} />
          <Route path="/study-in-europe" element={<StudyInEurope />} />
          {/* The director's message sits under /about because it is part of
              the about cluster, not a section of its own. */}
          <Route path="/about/director" element={<Director />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/university-partners" element={<UniversityPartners />} />
          {/* One page per partner, behind its logo on the wall above.
              The slug is built from the name by the server — see
              universityService.freeSlug for why it is readable rather
              than suffixed the way a post's is. */}
          <Route
            path="/university-partners/:slug"
            element={<UniversityDetail />}
          />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />
          <Route path="/news" element={<News />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          {/* Student resources. The hub is what the navbar's "Resources"
              item finally points at; the five below are the calculators,
              named in data/calculators.ts and routed here. Keep the two in
              step — an entry there with no route is a dead link in the
              navbar, on the hub and on the other four pages at once. */}
          <Route path="/resources" element={<Resources />} />
          <Route
            path="/resources/ielts-band-score-calculator"
            element={<IeltsBandScore />}
          />
          <Route
            path="/resources/pte-score-calculator"
            element={<PteScore />}
          />
          <Route
            path="/resources/neb-to-gpa-calculator"
            element={<NebGpa />}
          />
          <Route
            path="/resources/see-to-gpa-calculator"
            element={<SeeGpa />}
          />
          <Route
            path="/resources/gpa-to-percentage-calculator"
            element={<GpaToPercentage />}
          />
        </Route>

        {/* A LAYOUT ROUTE AROUND THE WHOLE ADMIN, and nothing else, so the
            light/dark attribute it puts on <html> exists only while an admin
            page is mounted and is removed the moment one is not. That is what
            keeps the public site out of it entirely — see context/AdminTheme.
            The sign-in page is inside it too, so the theme applies before
            anybody has signed in. */}
        <Route element={<AdminTheme />}>
        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/posts" element={<Posts />} />
          <Route path="/admin/posts/new" element={<PostEditor />} />
          <Route path="/admin/posts/:id/edit" element={<PostEditor />} />
          {/* One section, two tabs — both addresses land on it so older
              links keep working. See pages/admin/Media.tsx. */}
          <Route path="/admin/media" element={<Media />} />
          <Route path="/admin/tiktok" element={<Media />} />
          <Route path="/admin/youtube" element={<Media />} />
          {/* One section, two tabs — as with media above. */}
          <Route path="/admin/events" element={<Happenings />} />
          <Route path="/admin/news" element={<Happenings />} />
          {/* One section, two tabs — as with media and events above. */}
          <Route path="/admin/people" element={<People />} />
          <Route path="/admin/people/staff" element={<People />} />
          <Route path="/admin/inquiries" element={<Inquiries />} />
        </Route>
        </Route>


        {/* GONE, BUT NOT DEAD. /study-in-japan was a live page with a guide
            behind it, so it is in search results, in whatever anybody
            bookmarked and quite possibly in print. The catch-all below
            renders outside the layout — no navigation, no footer, nothing to
            click — which is a poor thing to hand somebody following an old
            link, so this sends them to the destinations hub instead.
            `replace` keeps the dead address out of the back button. */}
        <Route
          path="/study-in-japan"
          element={<Navigate to="/study-abroad" replace />}
        />

        <Route
          path="*"
          element={
            <div className="container section">
              <h1>404 — Page not found</h1>
            </div>
          }
        />
      </Routes>
      </Suspense>
    </>
  );
}
