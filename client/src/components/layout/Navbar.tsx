import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { SERVICES } from "../../data/services";
import { TESTS } from "../../data/tests";
import { CALCULATORS, calculatorPath } from "../../data/calculators";

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
        { label: "Study in Europe", to: "/study-in-europe" },
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
        { label: "Message from Director", to: "/about/director" },
        /* Success Stories used to sit here pointing at /about as well. The
           video stories it meant are now cards on the reviews wall, so the
           entry below is the only one that leads to them. */
        { label: "Testimonials & Reviews", to: "/testimonials" },
        /* No University Partners entry: that page was folded into Study
           Abroad, where the partner list is now a section. The Study Abroad
           item above is the way in. */
        { label: "Gallery", to: "/gallery" },
        { label: "Contact Us", to: "/contact" },
      ],
    },
  },
  { label: "Events", to: "/events" },
  {
    label: "Resources",
    /* Points at /resources, not /blog. This item promised a section and
       delivered the blog for as long as it existed, and its own panel then
       listed "Useful Documents" pointing at the blog a second time. There is
       a real page behind it now. */
    to: "/resources",
    menu: {
      title: "Student",
      titleAccent: "Resources",
      lead: "Calculators that answer the questions we are asked most often, and the guides, documents and updates behind them.",
      links: [
        {
          label: "Calculators",
          to: "/resources",
          /* The second level, as under Test Preparation — five calculators
             flat in this list would crowd out everything else in the panel.
             Read from data/calculators.ts, so adding one appears here named
             and routed with no edit to this file. */
          children: [
            { label: "All resources", to: "/resources" },
            ...CALCULATORS.map((c) => ({
              label: c.name,
              to: calculatorPath(c.slug),
            })),
          ],
        },
        { label: "Blog & Articles", to: "/blog" },
        { label: "News", to: "/news" },
        /* Events had an entry here as well as its own top-level nav item.
           One route, one way in — the top-level link is the one that stays. */
      ],
    },
  },
];

/** Nav label → id-safe slug, for wiring aria-controls to the panel. */
const slug = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * WHICH PATHS A NAV ITEM COVERS — its own address, plus every address in its
 * panel, plus every address in the second level under that.
 *
 * This exists because `NavLink`'s own `isActive` only knows about the item's
 * `to`. "Student Services" lights up on /services/visa-guidance because that
 * path happens to sit under /services, but "Study Abroad" never lit up on
 * /study-in-canada — the destination guides live at the top level, so as far
 * as the router was concerned they had nothing to do with the item that
 * lists them. Seven guides, and none of them underlined the nav item you
 * used to get there.
 *
 * DERIVED FROM THE PANEL RATHER THAN HAND-LISTED. The alternative was a
 * `match: string[]` on each item — which is what the admin bar does, and is
 * fine there because it covers two aliases of one screen. Here it would be a
 * second copy of the destination list, kept in step by hand, and the failure
 * mode is silent: add a country, forget the match list, and the underline is
 * missing on exactly one page. The panel already says which pages belong to
 * the section. That IS the answer, so it is the thing that gets asked.
 */
const sectionPaths = (item: NavItem): string[] => [
  item.to,
  ...(item.menu?.links.flatMap((l) => [
    l.to,
    ...(l.children?.map((c) => c.to) ?? []),
  ]) ?? []),
];

/* A path is inside a section if it IS one of those addresses or sits under
   one — so /blog/a-post lights "Resources" the way /blog does. Exact-or-
   descendant rather than a bare `startsWith`, which would have /services
   claim a hypothetical /services-something-else. */
const covers = (item: NavItem, pathname: string): boolean =>
  sectionPaths(item).some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  /* Label of the nav item whose dropdown panel is open, or null for none */
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  /* Label of the second-level panel that is open, or null. Only one entry
     has children today (Test Preparation), but nothing here assumes that. */
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [logoMissing, setLogoMissing] = useState(false);
  /* WHICH SECTION IS EXPANDED IN THE PHONE DRAWER, and deliberately not the
     same piece of state as `openMenu` above.
     `openMenu` is driven by hover and describes the wide bar's panel; this
     is driven by a tap and describes an accordion that only exists below the
     breakpoint. Sharing one value would mean a phone tap leaving a desktop
     panel open behind the drawer, and a window resized from narrow to wide
     showing a panel nobody asked for. Two behaviours, two states. */
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);

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

  /* PUBLISHES THE BAR'S HEIGHT, and that is now all it does.
     `--navbar-h` is read all over the stylesheet: the heroes that reach up
     behind the bar offset themselves by exactly this, and every anchored
     section uses it for its scroll-margin. Measured rather than guessed —
     the bar is shorter on mobile, where the logo shrinks.

     THIS USED TO PAINT THE TWO SCROLL-PROGRESS RAILS as well, which meant a
     scroll listener and a requestAnimationFrame running for the whole life
     of every page. Both bars are gone, and so is all of that: what is left
     runs when the window resizes or the bar itself changes size, and never
     once while you are scrolling. The ResizeObserver watches the header
     rather than the whole document body, too — the body was observed because
     the rails needed the page's total height, and it fired on every image
     that finished loading. */
  useEffect(() => {
    const publish = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--navbar-h", `${h}px`);
    };

    publish();
    window.addEventListener("resize", publish);
    const ro = new ResizeObserver(publish);
    if (headerRef.current) ro.observe(headerRef.current);

    return () => {
      window.removeEventListener("resize", publish);
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
    setOpenDrawer(null);
  }, [pathname]);

  /* Closing the drawer collapses whatever was expanded in it, so reopening
     it starts from the top rather than wherever the last visit finished. */
  useEffect(() => {
    if (!open) setOpenDrawer(null);
  }, [open]);

  /* A second-level panel belongs to its parent — when the parent closes or
     changes, it goes with it rather than hanging over the next one. */
  useEffect(() => {
    setOpenSub(null);
  }, [openMenu]);

  /* Pages that open on a full-bleed picture put the bar over it rather than
     on a white strip above it, and it stays that way for exactly as long as
     there is picture behind it: the moment the hero's lower edge passes
     under the bar, the bar goes solid and its type turns back to navy.
     A menu opening also forces it solid, so a white panel never hangs off a
     bar you can see through.

     This used to be `scrollY < 100` on a hardcoded list of routes, which was
     wrong in both directions — the bar turned white a tenth of the way down
     a 700px photograph, and pages with a hero that were not on the list
     never got the treatment at all. Asking the DOM what is underneath means
     any page that opens with a hero behaves the same, including ones added
     later, and nothing has to be kept in step with a regular expression. */
  const [overPicture, setOverPicture] = useState(false);
  useEffect(() => {
    /* THE HOME PAGE OPTS OUT. Everywhere else the see-through bar sits on a
       single photograph and comes off it cleanly. The home hero is a moving
       film under a dark scrim, and a bar with no ground of its own over
       moving pictures is a bar whose links change contrast frame by frame —
       the wordmark and the nav labels were legible on one shot and washed
       out on the next, and the dropdown panels opening off a bar you can
       see through never looked attached to anything.
       So: solid white, navy type, coloured mark, from the first pixel of
       the page. Every other page keeps the treatment exactly as it was —
       this returns early rather than changing what the measurement does. */
    if (pathname === "/") {
      setOverPicture(false);
      return;
    }

    let raf = 0;

    const measure = () => {
      raf = 0;
      /* First match in document order: on every page that has one, the hero
         is the first thing inside <main>. Scoped to <main> so a stray
         "hero"-ish class elsewhere on the page cannot be mistaken for one. */
      const hero = document.querySelector<HTMLElement>(
        "main .hero, main .dpage-hero"
      );
      if (!hero) {
        setOverPicture(false);
        return;
      }
      /* The bar's own height, not a guess: it is shorter on mobile, where
         the logo shrinks. Comparing against the hero's BOTTOM is what keeps
         the treatment for the whole of the picture rather than the first
         hundred pixels of the page. */
      const barH = headerRef.current?.offsetHeight ?? 0;
      setOverPicture(hero.getBoundingClientRect().bottom > barH);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    /* A hero that is still loading its photograph, or a page whose content
       arrives from the API, changes height after the first measurement. */
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
    /* Re-queried on every navigation: the previous page's hero is gone and
       the new one has not been looked for yet. */
  }, [pathname]);

  const seeThrough = overPicture && !openMenu && !open;

  /* The bar gets out of the way going down the page and comes back the
     moment you head up it.
     WHEN IT IS ALLOWED TO HIDE:
       - not while a menu is open, or the panel would go with it;
       - not in the first REVEAL_FLOOR pixels, where "scrolling down" is
         really just leaving the top of the page;
       - and not while the bar is see-through over a hero. That last one is
         the rule for the destination pages: over the picture the bar is
         part of the hero and has nowhere to hide TO, so it holds still
         until the photograph is behind you and only then starts sliding.
         The home page opts out of see-through entirely (see above), so
         there this is live from the first scroll. */
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    /* Movement needed before this makes up its mind — below it a trackpad's
       idle jitter would flap the bar in and out. */
    const STEP = 6;
    /* Above the fold the bar always shows. */
    const REVEAL_FLOOR = 90;

    let last = window.scrollY;
    let raf = 0;

    const measure = () => {
      raf = 0;
      const y = window.scrollY;
      const moved = y - last;
      if (Math.abs(moved) < STEP) return;
      last = y;
      /* Scrolling up, near the top, over a hero, or with a panel open: show.
         Everything else: away. */
      setHidden(moved > 0 && y > REVEAL_FLOOR && !overPicture);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [overPicture]);

  /* A new page starts with the bar present. Without this you could scroll
     down, follow a link, and land at the top of the next page with no
     navigation on screen — the scroll handler only reconsiders when the page
     actually moves, and it has not moved yet. */
  useEffect(() => {
    setHidden(false);
  }, [pathname]);

  /* Anything that wants the bar present says so here rather than racing the
     scroll handler for the same piece of state. */
  const away = hidden && !openMenu && !open;

  return (
    <header
      className={`navbar${seeThrough ? " is-over" : ""}${away ? " is-away" : ""}`}
      ref={headerRef}
    >
      {/* Leaving the bar closes any open panel. It lives here rather than on
          the nav item because the panel is a sibling below the strip — closing
          on the item's own mouseleave would snatch it away as the pointer
          travelled down into it. */}
      {/* The part that slides away. It is a wrapper rather than the <header>
          itself so the header keeps its own untransformed offsetHeight —
          --navbar-h holds its value and the heroes that reach up behind the
          bar do not jump when it hides.
          (It also used to shield a position:fixed progress rail from being
          dragged off screen by this transform. That rail is gone; the reason
          above is the one that still holds.) */}
      <div className="navbar-slide">
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
                     no longer a caret button to press on the wide bar. */
                  onFocus={() => setOpenMenu(item.menu ? item.label : null)}
                  aria-expanded={item.menu ? openMenu === item.label : undefined}
                  aria-controls={
                    item.menu ? `menu-${slug(item.label)}` : undefined
                  }
                  /* `isActive` alone underlines only the item whose own
                     address you are at; `covers` adds the pages listed in
                     its panel. See sectionPaths above. */
                  className={({ isActive }) =>
                    isActive || covers(item, pathname) ? "active" : ""
                  }
                >
                  {item.label}
                </NavLink>

                {/* THE CARET IS A SEPARATE CONTROL FROM THE LINK, and that
                    is the whole point of it. Tapping the label still goes to
                    the section's own page, the way it always has; tapping
                    the caret opens the list instead. Making the label do
                    both — navigate on one tap, expand on another — is the
                    thing that makes phone menus feel broken.

                    It is a real <button> so it is tabbable and announced,
                    and CSS hides it above the breakpoint, where hovering
                    the bar already opens the panel. */}
                {item.menu ? (
                  <button
                    type="button"
                    className="nav-caret"
                    aria-label={`${
                      openDrawer === item.label ? "Hide" : "Show"
                    } ${item.label} sections`}
                    aria-expanded={openDrawer === item.label}
                    aria-controls={`drawer-${slug(item.label)}`}
                    onClick={() =>
                      setOpenDrawer((cur) =>
                        cur === item.label ? null : item.label
                      )
                    }
                  >
                    {/* One chevron, turned over when open — a down arrow to
                        open and an up arrow to close, which is the same mark
                        rather than two that have to be kept in step. */}
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                ) : null}

                {/* The list itself. Rendered only while open, so a closed
                    drawer carries no hidden links for a screen reader or the
                    tab order to wander into — `display: none` would have hid
                    it from sight only. Hidden outright above the breakpoint,
                    where the mega panel does this job. */}
                {item.menu && openDrawer === item.label ? (
                  <ul className="nav-sub" id={`drawer-${slug(item.label)}`}>
                    {item.menu.links.map((l) => (
                      <li key={l.label}>
                        <Link to={l.to} onClick={() => setOpen(false)}>
                          {l.label}
                        </Link>
                        {/* A second level, shown flat rather than as another
                            accordion. Test Preparation is the only entry
                            with children, and burying nine tests behind a
                            third tap to save nine lines of scrolling is a
                            poor trade on a phone. */}
                        {l.children?.length ? (
                          <ul className="nav-sub-deep">
                            {l.children.map((c) => (
                              <li key={c.label}>
                                <Link to={c.to} onClick={() => setOpen(false)}>
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
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
      </div>{/* /.navbar-slide */}
    </header>
  );
}
