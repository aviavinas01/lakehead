import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Arrow } from "../shared/destinationBits";
import {
  UNIVERSITIES,
  countByCountry,
  countriesWithPartners,
  universityPath,
  type University,
} from "../../data/universities";

/**
 * The partner institutions — a searchable wall of logos, on /study-abroad.
 *
 * ------------------------------------------------------------------
 * MOVED, NOT REWRITTEN. This was the list on the University Partners page;
 * the page is gone and this is its useful half, together with the
 * slideshow (PartnerSlideshow). Behaviour is unchanged. Two things did
 * change, both because of where it now lives:
 *
 *   · Each logo opens /study-abroad/universities/<slug> (universityPath),
 *     where the detail pages moved with it. The old addresses redirect.
 *   · The section's anchor is `#universities` rather than `#list` — a page
 *     with several sections needs an anchor that says which one. Every
 *     "back to the list" link and the old /university-partners address land
 *     on it.
 *
 * THE PARTNERS COME FROM data/universities.ts, edited by hand; see the note
 * at the top of that file for why a list this size is better as a list.
 * ------------------------------------------------------------------
 */

/** Must match UNIVERSITIES_ANCHOR in data/universities.ts. */
export const UNIVERSITIES_SECTION_ID = "universities";

/**
 * One partner: the mark, on a card, and nothing else.
 *
 * Institutions are recognised by their crest, not read off a list. The name
 * is the image's alt text and its tooltip, it is what the search matches,
 * and if the file is missing it is what the card shows instead — so a broken
 * path degrades to a legible card rather than a broken image.
 */
function Logo({ uni }: { uni: University }) {
  const [broken, setBroken] = useState(false);

  return (
    <Link className="unip-card" to={universityPath(uni.slug)} title={uni.name}>
      {broken ? (
        <span className="unip-logo-fallback">{uni.name}</span>
      ) : (
        <img
          src={uni.logo}
          /* Named, not decorative: this is the only thing on the card. */
          alt={uni.name}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      )}
    </Link>
  );
}

export default function PartnerUniversities() {
  const [country, setCountry] = useState<string>("all");
  /* What is typed, which filters live. The search button submits the form —
     it does not gate the filtering, it just gives a phone keyboard something
     to close on and a mouse something to press. */
  const [query, setQuery] = useState("");

  /* The list is a module constant, so these are computed once — no request,
     no loading state, nothing to wait for. */
  const all = UNIVERSITIES;
  const counts = useMemo(() => countByCountry(), []);
  const countries = useMemo(() => countriesWithPartners(), []);

  /* Name, city and country all match, so "Melbourne" and "Australia" find
     things as readily as an institution's name does. */
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (u) =>
        (country === "all" || u.country === country) &&
        (q === "" ||
          u.name.toLowerCase().includes(q) ||
          u.city?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q))
    );
  }, [all, country, query]);

  /* "No partners yet" and "nothing matched that" are different messages, and
     only one of them has a way out. */
  const filtered = country !== "all" || query.trim() !== "";

  const clear = () => {
    setQuery("");
    setCountry("all");
  };

  /* The button and the Enter key do nothing to the results, which are
     already live — they dismiss the keyboard on a phone. Submitting must not
     reload the page. */
  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <section
      className="dpage-section dpage-tint sa-unis"
      id={UNIVERSITIES_SECTION_ID}
      aria-labelledby="sa-unis-h"
    >
      <div className="container">
        <h2 className="dpage-title unip-h2" id="sa-unis-h">
          Our partner <span className="h-outline">institutions</span>
        </h2>
        <p className="dpage-section-lead">
          Everyone we hold a direct agreement with. It grows most years, so if
          the university you are after is not here, ask anyway.
        </p>

        <form className="unip-tools" onSubmit={onSearch} role="search">
          <div className="unip-searchrow">
            <label className="unip-search">
              <span className="unip-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, city or country"
                aria-label="Search partner institutions"
              />
            </label>
            <button type="submit" className="unip-searchgo">
              Search
            </button>
            {/* Only while something is actually filtered — a permanent
                "Clear" beside an untouched form does nothing every time you
                look at it. */}
            {filtered ? (
              <button type="button" className="unip-clear" onClick={clear}>
                Clear
              </button>
            ) : null}
          </div>

          {/* Only once at least one partner carries a country — a filter row
              with a single "Everywhere" chip is furniture. */}
          {countries.length > 1 ? (
            <div className="unip-chiprow" role="group" aria-label="Filter by destination">
              <button
                type="button"
                className={`unip-chip${country === "all" ? " is-on" : ""}`}
                onClick={() => setCountry("all")}
                aria-pressed={country === "all"}
              >
                Everywhere <span>{all.length}</span>
              </button>
              {countries.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`unip-chip${country === c ? " is-on" : ""}`}
                  onClick={() => setCountry(c)}
                  aria-pressed={country === c}
                >
                  {c} <span>{counts[c]}</span>
                </button>
              ))}
            </div>
          ) : null}
        </form>

        {/* Announced politely, which is what tells a screen-reader user that
            pressing a chip or typing did anything at all. */}
        <p className="unip-count" aria-live="polite">
          {shown.length === 0
            ? "No institution matches that search."
            : `Showing ${shown.length} of ${all.length}`}
        </p>

        {shown.length > 0 ? (
          <div className="unip-grid">
            {shown.map((u) => (
              <Logo uni={u} key={u.slug} />
            ))}
          </div>
        ) : null}

        {shown.length === 0 && filtered ? (
          <button type="button" className="unip-reset" onClick={clear}>
            Clear the search <Arrow />
          </button>
        ) : null}

        {/* Directly under the wall, which is where the question actually
            occurs to somebody. */}
        <aside className="dpage-callout unip-ask">
          <h3>Not on the list?</h3>
          <p>
            We apply to non-partner institutions constantly — the agreement is
            a convenience, not a boundary. If you have a university in mind,
            bring it and we will tell you honestly what your chances look like.
          </p>
          <Link className="dpage-callout-btn" to="/contact">
            Ask about it <Arrow />
          </Link>
        </aside>
      </div>
    </section>
  );
}
