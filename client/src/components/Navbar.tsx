import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { SERVICES } from "../data/services";
import { TESTS } from "../data/tests";

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
  links: MegaLink[];
}

interface MegaLink {
  label: string;
  to: string;
  /** Present on an entry that opens a second panel beside the first. */
  children?: { label: string; to: string }[];
}

/* Nav links — repoint each `to` as dedicated pages are added. Add a `menu`
   to any entry to give it a caret and a dropdown panel; entries without one
   stay plain links. */
const links: NavItem[] = [
  {
    label: "Study Abroad",
    to: "/study-abroad",
    menu: {
      title: "Study",
      titleAccent: "Abroad",
      lead: "Lakehead offers student-focused international education services designed to support every step of your journey through expert guidance, preparation support, and global academic opportunities.",
      links: [
        { label: "Study in South Korea", to: "/study-in-south-korea" },
        { label: "Study in USA", to: "/study-in-usa" },
        { label: "Study in UK", to: "/study-in-uk" },
        { label: "Study in Australia", to: "/study-in-australia" },
        { label: "Study in Canada", to: "/study-in-canada" },
        { label: "Study in New Zealand", to: "/study-in-new-zealand" },
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
        ...SERVICES.filter((s) => s.inNav !== false).map((s) => ({
          label: s.title,
          to: `/services/${s.slug}`,
          /* Test Preparation is the one service with a second level: the
             individual tests hang off it rather than cluttering this list. */
          children:
            s.slug === "test-preparation"
              ? [
                  { label: "All Tests", to: "/services/test-preparation" },
                  ...TESTS.map((t) => ({
                    label: t.name,
                    to: `/services/test-preparation/${t.slug}`,
                  })),
                ]
              : undefined,
        })),
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
        /* Success Stories used to sit here pointing at /about as well. The
           video stories it meant are now cards on the reviews wall, so the
           entry below is the only one that leads to them. */
        { label: "Testimonials & Reviews", to: "/testimonials" },
        { label: "University Partners", to: "/university-partners" },
        { label: "Gallery", to: "/gallery" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
  },
  { label: "Events", to: "/events" },
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
        /* Events had an entry here as well as its own top-level nav item.
           One route, one way in — the top-level link is the one that stays. */
      ],
    },
  },
];

/** Nav label → id-safe slug, for wiring aria-controls to the panel. */
const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  /* Label of the nav item whose dropdown panel is open, or null for none */
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  /* Label of the second-level panel that is open, or null. Only one entry
     has children today (Test Preparation), but nothing here assumes that. */
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [logoMissing, setLogoMissing] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  /* The progress bars are driven straight through these refs — see below */
  const trackH = useRef<HTMLDivElement>(null);
  const trackV = useRef<HTMLDivElement>(null);
  const barH = useRef<HTMLSpanElement>(null);
  const barV = useRef<HTMLSpanElement>(null);

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
      const headerH = headerRef.current?.offsetHeight ?? 0;
      if (trackV.current) {
        trackV.current.style.top = `${headerH}px`;
      }
      /* Published for the destination pages, whose hero reaches up behind
         this bar by exactly this much. Measured rather than guessed: the bar
         is shorter on mobile, where the logo shrinks. */
      document.documentElement.style.setProperty("--navbar-h", `${headerH}px`);
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
  /* ...and the entry inside it whose children are showing, if any */
  const activeSub = activeMenu?.menu.links.find(
    (l) => l.label === openSub && !!l.children?.length
  );
  /* Whether this panel has a second level AT ALL — not whether one is open.
     The column it needs is reserved from the moment the panel appears, so
     the list beside it never shifts when the second level comes and goes.
     Panels with no children keep the original two-column layout. */
  const canSub = !!activeMenu?.menu.links.some((l) => l.children?.length);

  /* A navigation always dismisses the menus */
  useEffect(() => {
    setOpenMenu(null);
    setOpenSub(null);
    setOpen(false);
  }, [pathname]);

  /* A second-level panel belongs to its parent — when the parent closes or
     changes, it goes with it rather than hanging over the next one. */
  useEffect(() => {
    setOpenSub(null);
  }, [openMenu]);

  /* The destination pages open on a full-bleed photograph and the bar sits
     over it rather than on a white strip above it. It goes solid again as
     soon as you scroll, because a transparent bar over white body copy is
     unreadable — and it goes solid the moment a menu opens, so a white panel
     never hangs off a bar you can see through.

     setAtTop is called on every scroll event but passes the same boolean
     almost every time, and React bails on an unchanged value — so this
     re-renders only when the threshold is actually crossed. */
  const overHero = /^\/(study-(abroad|in-)|services)/.test(pathname);
  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const seeThrough = overHero && atTop && !openMenu && !open;

  return (
    <header className={`navbar${seeThrough ? " is-over" : ""}`} ref={headerRef}>
      {/* Leaving the bar closes any open panel. It lives here rather than on
          the nav item because the panel is a sibling below the strip — closing
          on the item's own mouseleave would snatch it away as the pointer
          travelled down into it. */}
      <div className="navbar-main" onMouseLeave={() => setOpenMenu(null)}>
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
              <div
                className="nav-item"
                key={item.label}
                /* Hovering an item with a panel opens it; hovering one without
                   closes whatever was open, so the bar never leaves a panel
                   hanging under an unrelated label. */
                onMouseEnter={() => setOpenMenu(item.menu ? item.label : null)}
              >
                <NavLink
                  to={item.to}
                  onClick={() => setOpen(false)}
                  /* Keyboard users get the same panel on focus, since there is
                     no longer a caret button to press. */
                  onFocus={() => setOpenMenu(item.menu ? item.label : null)}
                  aria-expanded={item.menu ? openMenu === item.label : undefined}
                  aria-controls={
                    item.menu ? `menu-${slug(item.label)}` : undefined
                  }
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {item.label}
                </NavLink>
              </div>
            ))}
          </nav>
        </div>
        {/* Dropdown panel — full-width band under the nav strip, showing the
            open item's heading and blurb beside its list of sections. */}
        {activeMenu && (
          <div className="mega-panel" id={`menu-${slug(activeMenu.label)}`}>
            <div className={`container mega-inner${canSub ? " can-sub" : ""}`}>
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
                    <Link
                      to={l.to}
                      className={openSub === l.label ? "is-open" : undefined}
                      /* Hovering any entry opens its children and closes
                         whatever else was open, so the second panel never
                         sits under an unrelated label. Focus does the same,
                         so this is reachable without a mouse. */
                      onMouseEnter={() => setOpenSub(l.children ? l.label : null)}
                      onFocus={() => setOpenSub(l.children ? l.label : null)}
                      onClick={() => setOpenMenu(null)}
                      aria-haspopup={l.children ? "true" : undefined}
                      aria-expanded={l.children ? openSub === l.label : undefined}
                    >
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
              {/* The second level, rendered beside the first rather than
                  floating over it — the panel is already full width, so
                  there is room, and a column cannot be knocked off screen
                  the way an absolutely positioned flyout can. */}
              {activeSub && (
                <ul className="mega-sub">
                  {activeSub.children?.map((s) => (
                    <li key={s.label}>
                      <Link to={s.to} onClick={() => setOpenMenu(null)}>
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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

    </header>
  );
}
