import { OFFICES } from "../config/contact";
import { TESTS } from "../data/tests";
import StatMarquee, { type StatItem } from "./StatMarquee";

/**
 * The figures under the home page hero.
 *
 * This owns the NUMBERS only; the moving line they sit in is StatMarquee,
 * which the "who we are" band uses as well. See that component for how the
 * loop is made seamless.
 *
 * WHY IT IS NOT A GRID ANY MORE. It used to be four cells in a row, each
 * with its digits rolling up into place like the numerals turning over on a
 * desk calendar. That bought one moment — the roll ran once, the first time
 * the strip was scrolled to — and then sat there as a static four-up for the
 * rest of the visit. It also capped the section at four figures, because a
 * fifth either squeezed the row or wrapped to a second line that read as an
 * afterthought.
 *
 * A marquee has neither limit. It is in motion whenever the strip is on
 * screen, and the list can be any length — the line is longer, that is all.
 * That is what makes room for the detail under each label: the offices by
 * name, the destinations by name, the tests by name. On the grid there was
 * nowhere to put any of it.
 */

/* Where these come from:
     · The first three are the figures the strip has always carried.
     · Destinations names six of the countries we run guides for; the count
       stays the site's own "10+", so the detail reads as examples and not
       as the whole list.
     · Tests and offices are COUNTED FROM THE DATA rather than typed out —
       add a test to data/tests.ts or an office to config/contact.ts and the
       figure and the names here both follow. Two copies of a number that
       has to match a list is how the two drift apart. */
const STATS: StatItem[] = [
  {
    figure: "1,100+",
    label: "Institution partners",
    detail: "Universities, colleges and pathway providers",
  },
  {
    figure: "760,000+",
    label: "Students assisted",
    detail: "Counselling, applications, visas and departure",
  },
  {
    figure: "200,000+",
    label: "Courses offered",
    detail: "Undergraduate, postgraduate and pathway",
  },
  {
    figure: "10+",
    label: "Destinations served",
    detail: "USA · UK · Australia · Canada · New Zealand · South Korea",
  },
  {
    figure: String(TESTS.length),
    label: "Tests coached",
    detail: TESTS.map((t) => t.name).join(" · "),
  },
  {
    figure: String(OFFICES.length),
    label: "Offices in Nepal",
    detail: OFFICES.map((o) => o.city).join(" · "),
  },
];

export default function StatsStrip() {
  return (
    <section className="stats-strip" aria-label="Lakehead in numbers">
      <StatMarquee items={STATS} />
      <div className="container">
        <p className="stats-note">(As of Mar&#39;25)*</p>
      </div>
    </section>
  );
}
