import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollManager from "./components/ScrollManager";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import TestPreparation from "./pages/TestPreparation";
import TestDetail from "./pages/TestDetail";
import VisaGuidance from "./pages/VisaGuidance";
import CareerCounselling from "./pages/CareerCounselling";
import StudentAccommodation from "./pages/StudentAccommodation";
import AdmissionGuidance from "./pages/AdmissionGuidance";
import StudyAbroad from "./pages/StudyAbroad";
import StudyInAustralia from "./pages/StudyInAustralia";
import StudyInCanada from "./pages/StudyInCanada";
import StudyInUK from "./pages/StudyInUK";
import StudyInUSA from "./pages/StudyInUSA";
import StudyInNewZealand from "./pages/StudyInNewZealand";
import StudyInSouthKorea from "./pages/StudyInSouthKorea";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import PostEditor from "./pages/admin/PostEditor";
import Inquiries from "./pages/admin/Inquiries";
import Users from "./pages/admin/Users";
import MediaLibrary from "./pages/admin/MediaLibrary";

export default function App() {
  return (
    <>
      {/* Owns scroll position across every route — see the component */}
      <ScrollManager />
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/posts/new" element={<PostEditor />} />
          <Route path="/admin/posts/:id/edit" element={<PostEditor />} />
          <Route path="/admin/media" element={<MediaLibrary />} />
          <Route path="/admin/inquiries" element={<Inquiries />} />
          <Route path="/admin/users" element={<Users />} />
        </Route>

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
