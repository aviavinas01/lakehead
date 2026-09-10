import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ScrollManager from "./components/layout/ScrollManager";
import HeroKnockout from "./components/layout/HeroKnockout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
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
import StudyAbroad from "./pages/study-abroad/StudyAbroad";
import StudyInAustralia from "./pages/study-abroad/StudyInAustralia";
import StudyInCanada from "./pages/study-abroad/StudyInCanada";
import StudyInUK from "./pages/study-abroad/StudyInUK";
import StudyInUSA from "./pages/study-abroad/StudyInUSA";
import StudyInNewZealand from "./pages/study-abroad/StudyInNewZealand";
import StudyInSouthKorea from "./pages/study-abroad/StudyInSouthKorea";
import StudyInEurope from "./pages/study-abroad/StudyInEurope";
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
import Resources from "./pages/resources/Resources";
/* The five calculators behind /resources. One file each, and one route
   each below rather than a /resources/:slug that dispatches — a calculator
   is a page with its own inputs and its own copy, and a shared route would
   only push the dispatch one level down into a switch. */
import IeltsBandScore from "./pages/resources/calculators/IeltsBandScore";
import PteScore from "./pages/resources/calculators/PteScore";
import NebGpa from "./pages/resources/calculators/NebGpa";
import SeeGpa from "./pages/resources/calculators/SeeGpa";
import GpaToPercentage from "./pages/resources/calculators/GpaToPercentage";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Posts from "./pages/admin/Posts";
import PostEditor from "./pages/admin/PostEditor";
import Inquiries from "./pages/admin/Inquiries";
import Media from "./pages/admin/Media";
import Happenings from "./pages/admin/Happenings";
import People from "./pages/admin/People";

export default function App() {
  return (
    <>
      {/* Owns scroll position across every route — see the component */}
      <ScrollManager />
      {/* Cuts the hero headline out of the hero photo on study-abroad pages */}
      <HeroKnockout />
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
    </>
  );
}
