import { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router-dom";

interface NavItem {
  label: string;
  to: string;
}

/* Contact details shown in the top bar — replace placeholders with real numbers. */
const contact = {
  phoneDisplay: "+977-1-5555555",
  phoneHref: "tel:+97715555555",
  whatsappHref: "https://wa.me/9779800000000",
};

/* Plain nav links — repoint each `to` as dedicated pages are added. */
const links: NavItem[] = [
  { label: "Study Abroad", to: "/services" },
  { label: "Student Services", to: "/services" },
  { label: "What We Do", to: "/about" },
  { label: "Events", to: "/blog" },
  { label: "Resources", to: "/blog" },
];

/* Sections listed in the side drawer opened by the dashboard icon —
   repoint each `to` as dedicated pages are added. */
const drawerLinks: NavItem[] = [
  { label: "Gallery", to: "/" },
  { label: "Testimonials & Reviews", to: "/" },
  { label: "Success Stories", to: "/" },
  { label: "Resources", to: "/blog" },
  { label: "Events", to: "/blog" },
  { label: "News", to: "/blog" },
  { label: "Useful Documents", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </svg>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atFooter, setAtFooter] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(0);

  /* Lock page scroll and close on Escape while the side drawer is open. */
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  /* Scroll progress for the bar under the header: 0→1 across the page,
     switching to the footer color once the footer scrolls into view. */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      const footer = document.querySelector<HTMLElement>("footer.footer");
      setAtFooter(
        !!footer && window.scrollY + window.innerHeight >= footer.offsetTop + 40
      );
      /* The vertical bar starts where the sticky header ends */
      setHeaderH(headerRef.current?.offsetHeight ?? 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="navbar" ref={headerRef}>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-right">
            <Link to="/blog" className="topbar-link">Info</Link>
            <Link to="/contact" className="topbar-link">About</Link>
            <a className="topbar-pill" href={contact.phoneHref}>
              <PhoneIcon />
              {contact.phoneDisplay}
            </a>
            <a
              className="topbar-pill topbar-pill-whatsapp"
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="navbar-main">
        <div className="container navbar-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            {!logoMissing && (
              <img
                src="/logo.png"
                alt=""
                className="brand-logo"
                onError={() => setLogoMissing(true)}
              />
            )}
            <span className="brand-wordmark">
              <strong>Lakehead</strong>
              <span>Education</span>
            </span>
          </Link>
          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
          <nav className={`nav-links ${open ? "open" : ""}`}>
            {links.map((item) => (
              <div className="nav-item" key={item.label}>
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {item.label}
                </NavLink>
              </div>
            ))}
            <button
              type="button"
              className="drawer-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="More sections"
            >
              <DashboardIcon />
            </button>
          </nav>
        </div>
      </div>
      <div className={`scroll-progress${atFooter ? " at-footer" : ""}`}>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      {/* Vertical twin of the bar above: fills bottom-to-top along the right
          edge and meets the horizontal bar at the top-right corner. */}
      <div
        className={`scroll-progress-v${atFooter ? " at-footer" : ""}`}
        style={{ top: headerH }}
        aria-hidden="true"
      >
        <span style={{ transform: `scaleY(${progress})` }} />
      </div>

      {drawerOpen && (
        <div
          className="side-drawer-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerOpen(false);
          }}
        >
          <aside className="side-drawer" role="dialog" aria-label="More sections">
            <button
              type="button"
              className="side-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <nav>
              {drawerLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
