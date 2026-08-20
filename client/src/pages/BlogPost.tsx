import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import type { Post } from "../types/api";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api
      .get<{ post: Post }>(`/posts/slug/${slug}`)
      .then((res) => setPost(res.data.post))
      .catch((err) => setError(getErrorMessage(err, "Post not found.")));
  }, [slug]);

  if (error)
    return (
      <div className="container section">
        <p>{error}</p>
        <Link to="/blog">← Back to blog</Link>
      </div>
    );
  if (!post) return <div className="container section">Loading…</div>;

  return (
    <article className="section container article">
      <Link to="/blog">← All posts</Link>
      <h1>{post.title}</h1>
      {post.publishedAt && <time>{new Date(post.publishedAt).toLocaleDateString()}</time>}
      {post.coverImage && <img src={post.coverImage} alt="" className="cover" />}
      {post.content.split("\n\n").map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </article>
  );
}
