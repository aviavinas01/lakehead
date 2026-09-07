import { useEffect, useState, type FormEvent } from "react";
import AdminNav from "./AdminNav";
import api, { getErrorMessage } from "../../api/client";

/**
 * The TikTok shelves, managed.
 *
 * Paste a link, pick a shelf, and the clip appears on that shelf's page.
 * This is a screen at all for one reason: TikTok publishes no feed. The
 * YouTube row keeps itself current because YouTube hands out RSS with no
 * key; listing a TikTok account's videos needs their Display API, a
 * registered application and an approved OAuth flow. Curating four links by
 * hand is a great deal less machinery than that, and the office can do it
 * without a deploy.
 *
 * Everything except the link is TikTok's own answer to an oEmbed lookup, so
 * there is nothing else to fill in — the title and the still arrive with it.
 * The title can be overridden here, because their captions are written for
 * TikTok's audience and not always for a consultancy's home page.
 */

/* The four shelves, and the page each one appears on. Written here so the
   admin says where a clip will end up rather than leaving somebody to guess
   what "tests" means. Must stay in step with TIKTOK_CATEGORIES on the
   server, which is the list the API validates against. */
const CATEGORIES = [
  { value: "testimonial", label: "Student testimonials", where: "Testimonials & reviews page" },
  { value: "study-abroad", label: "Study abroad", where: "Study Abroad page" },
  { value: "tests", label: "Test booking & tests", where: "Test Preparation page" },
  { value: "visas", label: "Visas", where: "Visa Guidance page" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

interface Clip {
  id: string;
  videoId: string;
  url: string;
  title: string;
  authorName: string;
  thumbnail: string;
  category: Category;
  published: boolean;
  order: number;
}

type Status = { kind: "idle" | "busy" | "error"; message: string };

export default function TikTokClips() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<Category>("testimonial");
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get<{ clips: Clip[] }>("/tiktok/admin/all");
      setClips(res.data.clips ?? []);
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus({ kind: "busy", message: "" });
    try {
      await api.post("/tiktok", { url: url.trim(), category });
      setUrl("");
      setStatus({ kind: "idle", message: "" });
      await load();
    } catch (err) {
      /* The server's message is the useful one here — it distinguishes a
         short link from a duplicate from a bad address. */
      setStatus({ kind: "error", message: getErrorMessage(err) });
    }
  };

  const patch = async (id: string, body: Partial<Clip>) => {
    try {
      await api.put(`/tiktok/${id}`, body);
      await load();
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this clip from the site?")) return;
    try {
      await api.delete(`/tiktok/${id}`);
      await load();
    } catch (err) {
      setStatus({ kind: "error", message: getErrorMessage(err) });
    }
  };

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <h1>TikTok clips</h1>
        <p className="admin-lead">
          Paste the address of a TikTok video and choose the shelf it belongs
          on. Each shelf appears on one page:{" "}
          {CATEGORIES.map((c, i) => (
            <span key={c.value}>
              {i > 0 ? " · " : ""}
              <strong>{c.label}</strong> → {c.where}
            </span>
          ))}
          . Open the video on tiktok.com and copy the address from the
          browser bar — a short <code>vm.tiktok.com</code> link will not work,
          because it is a redirect rather than the video&rsquo;s own address.
        </p>

        <form className="tta-add" onSubmit={add}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@lakehead/video/7301234567890123456"
            aria-label="TikTok video address"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            aria-label="Which shelf this clip belongs on"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button type="submit" disabled={status.kind === "busy"}>
            {status.kind === "busy" ? "Adding…" : "Add clip"}
          </button>
        </form>
        {status.kind === "error" ? (
          <p className="form-error" role="status">{status.message}</p>
        ) : null}

        {loading ? (
          <p className="admin-lead">Loading…</p>
        ) : clips.length === 0 ? (
          <p className="admin-lead">
            No clips yet. Each shelf stays hidden on its page until it has at
            least one published clip, so nothing is broken in the meantime.
          </p>
        ) : (
          <ul className="tta-list">
            {clips.map((c) => (
              <li className="tta-item" key={c.id} data-off={!c.published || undefined}>
                <span className="tta-thumb">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt="" loading="lazy" />
                  ) : (
                    <span className="tta-thumb-empty" aria-hidden="true" />
                  )}
                </span>
                <span className="tta-body">
                  {/* Editable, because TikTok captions are written for
                      TikTok. Saved on blur — there is no save button because
                      there is one field. */}
                  <input
                    className="tta-title"
                    defaultValue={c.title}
                    aria-label="Title shown on the site"
                    onBlur={(e) => {
                      if (e.target.value !== c.title) {
                        void patch(c.id, { title: e.target.value });
                      }
                    }}
                  />
                  <span className="tta-meta">
                    <select
                      value={c.category}
                      aria-label="Move this clip to another shelf"
                      onChange={(e) =>
                        void patch(c.id, { category: e.target.value as Category })
                      }
                    >
                      {CATEGORIES.map((k) => (
                        <option key={k.value} value={k.value}>{k.label}</option>
                      ))}
                    </select>
                    <a className="tta-url" href={c.url} target="_blank" rel="noreferrer">
                      {c.authorName || c.videoId}
                    </a>
                  </span>
                </span>
                <span className="tta-actions">
                  <button type="button" onClick={() => void patch(c.id, { published: !c.published })}>
                    {c.published ? "Hide" : "Show"}
                  </button>
                  <button type="button" className="tta-del" onClick={() => void remove(c.id)}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
