import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
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
  );
}
