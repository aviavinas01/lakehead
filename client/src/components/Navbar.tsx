import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { contact } from "../config/contact";

interface NavItem {
  label: string;
  to: string;
  /** When present, a caret appears beside the label that opens this panel. */
  menu?: NavMenu;
}

interface NavMenu {
  /** Panel heading, split so the second half gets the blue→red treatment. */
  title: string;
  titleAccent: string;
  lead: string;
  links: { label: string; to: string }[];
}

/* Nav links — repoint each `to` as dedicated pages are added. Add a `menu`
   to any entry to give it a caret and a dropdown panel; entries without one
   stay plain links. */
const links: NavItem[] = [
  {
    label: "Study Abroad",
    to: "/services",
    menu: {
      title: "Study",
      titleAccent: "Abroad",
      lead: "Lakehead offers student-focused international education services designed to support every step of your journey through expert guidance, preparation support, and global academic opportunities.",
      links: [
        { label: "Study in USA", to: "/services" },
        { label: "Study in UK", to: "/services" },
        { label: "Study in Australia", to: "/services" },
        { label: "Study in Canada", to: "/services" },
        { label: "Study in Germany", to: "/services" },
        { label: "Study in New Zealand", to: "/services" },
      ],
    },
  },
  {
    label: "Student Services",
    to: "/services",
    menu: {
      title: "Our",
      titleAccent: "Services",
      lead: "From your first counselling session to the day you land, our qualified consultants handle the paperwork, the preparation, and everything in between.",
      links: [
        { label: "Study Abroad Counselling", to: "/services" },
        { label: "Test Preparation", to: "/services" },
        { label: "Visa Guidance", to: "/services" },
        { label: "Career Counselling", to: "/services" },
        { label: "Student Accommodation", to: "/services" },
        { label: "Interview Preparation", to: "/services" },
      ],
    },
  },
  {
    label: "What We Do",
    to: "/about",
    menu: {
      title: "About",
      titleAccent: "Lakehead",
      lead: "A team of certified consultants guiding students to the right university, the right course, and the right country.",
      links: [
        { label: "Who We Are", to: "/about" },
        { label: "Success Stories", to: "/about" },
        { label: "Testimonials & Reviews", to: "/about" },
        { label: "University Partners", to: "/about" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
  },
  { label: "Events", to: "/blog" },
  {
    label: "Resources",
    to: "/blog",
    menu: {
      title: "Student",
      titleAccent: "Resources",
      lead: "Guides, documents, and updates to help you prepare with confidence.",
      links: [
        { label: "Blog & Articles", to: "/blog" },
        { label: "News", to: "/blog" },
        { label: "Useful Documents", to: "/blog" },
        { label: "Events", to: "/blog" },
      ],
    },
  },
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

/** Nav label → id-safe slug, for wiring aria-controls to the panel. */
const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const CaretIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
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
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  /* Label of the nav item whose dropdown panel is open, or null for none */
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  /* The progress bars are driven straight through these refs — see below */
  const trackH = useRef<HTMLDivElement>(null);
  const trackV = useRef<HTMLDivElement>(null);
  const barH = useRef<HTMLSpanElement>(null);
  const barV = useRef<HTMLSpanElement>(null);

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

  /* Close an open dropdown on Escape or on a click outside the header. */
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [openMenu]);

  /* Scroll progress for the bar under the header: 0→1 across the page,
     switching to the footer color once the footer scrolls into view.
     Two rules keep this off the critical path of every scroll frame:
     the page's measurements are taken only when they can actually change
     (resize / content growth), never inside the frame; and the frame writes
     to the DOM through refs instead of setting state, so scrolling never
     re-renders the navbar. Both were costing a forced layout plus a React
     render on every single frame, which is what made scrolling stutter. */
  useEffect(() => {
    let raf = 0;
    let max = 0;
    let footerTop = Number.POSITIVE_INFINITY;

    /* Every layout read lives here */
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
      const footer = document.querySelector<HTMLElement>("footer.footer");
      footerTop = footer ? footer.offsetTop : Number.POSITIVE_INFINITY;
      /* The vertical bar starts where the sticky header ends */
      if (trackV.current) {
        trackV.current.style.top = `${headerRef.current?.offsetHeight ?? 0}px`;
      }
      paint();
    };

    /* …and only writes live here */
    const paint = () => {
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barH.current) barH.current.style.transform = `scaleX(${p})`;
      if (barV.current) barV.current.style.transform = `scaleY(${p})`;
      const atFooter = window.scrollY + window.innerHeight >= footerTop + 40;
      trackH.current?.classList.toggle("at-footer", atFooter);
      trackV.current?.classList.toggle("at-footer", atFooter);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    /* Content loading in (images, posts) changes the page height */
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  /* The open item, narrowed so `menu` is defined inside the panel markup */
  const activeMenu = links.find(
    (l): l is NavItem & { menu: NavMenu } => l.label === openMenu && !!l.menu
  );

  /* A navigation always dismisses the menus */
  useEffect(() => {
    setOpenMenu(null);
    setOpen(false);
  }, [pathname]);

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
                {item.menu && (
                  <button
                    type="button"
                    className={`nav-caret${openMenu === item.label ? " open" : ""}`}
                    aria-expanded={openMenu === item.label}
                    aria-controls={`menu-${slug(item.label)}`}
                    aria-label={`${item.label} menu`}
                    onClick={() =>
                      setOpenMenu(openMenu === item.label ? null : item.label)
                    }
                  >
                    <CaretIcon />
                  </button>
                )}
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
        {/* Dropdown panel — full-width band under the nav strip, showing the
            open item's heading and blurb beside its list of sections. */}
        {activeMenu && (
          <div className="mega-panel" id={`menu-${slug(activeMenu.label)}`}>
            <div className="container mega-inner">
              <div className="mega-copy">
                <h3 className="mega-title">
                  {activeMenu.menu.title}{" "}
                  <span className="mega-title-accent">
                    {activeMenu.menu.titleAccent}
                  </span>
                </h3>
                <p>{activeMenu.menu.lead}</p>
              </div>
              <ul className="mega-list">
                {activeMenu.menu.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} onClick={() => setOpenMenu(null)}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div className="scroll-progress" ref={trackH}>
        <span ref={barH} />
      </div>
      {/* Vertical twin of the bar above: fills bottom-to-top along the right
          edge and meets the horizontal bar at the top-right corner. */}
      <div className="scroll-progress-v" ref={trackV} aria-hidden="true">
        <span ref={barV} />
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
