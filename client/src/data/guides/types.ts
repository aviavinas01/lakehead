import type { ReactNode } from "react";

/**
 * The shape of a destination guide — the long-form, communicative pages
 * behind /study-in-*.
 *
 * These pages are content, not code. Everything that differs between the USA
 * and New Zealand is a data file; the layout, the contents rail, the reveal
 * animations and every callout style live once in components/GuidePage.tsx.
 * Writing a new destination means writing prose, not JSX.
 *
 * On tone: these guides are deliberately informal, because they are read by
 * seventeen-year-olds deciding what to do with the next decade. Jokes and
 * asides are part of the format — see the `quip` block. What is NOT part of
 * the format is a promise: no page here names a visa fee, a score threshold,
 * a success rate or a guaranteed outcome. Rules differ by institution and
 * change yearly, so anything with a shelf life goes in a `req` block, which
 * carries a review date and a link to the official source.
 */

/** A heading, split so individual words can take their own treatment. */
export type HeadPart =
  | string
  | { text: string; as: "accent" | "outline" | "shout" };

export type Block =
  /** Ordinary body paragraph. */
  | { t: "p"; text: ReactNode }
  /** A line lifted out of the flow — bigger, darker, with a red rule. */
  | { t: "pull"; text: ReactNode }
  /** The asides and jokes that break up a long read. */
  | { t: "quip"; text: ReactNode }
  /** Navy panel. One or more paragraphs. */
  | { t: "dyk"; text: ReactNode[] }
  /** Red-bordered rule or warning. `hard` tints the background. */
  | { t: "warn"; tag: string; text: ReactNode; more?: ReactNode; hard?: boolean }
  | { t: "chips"; items: string[]; ivy?: boolean }
  | { t: "checks"; items: string[]; two?: boolean }
  /** Numbered question list, two columns on a wide screen. */
  | { t: "questions"; items: string[] }
  /** Institution types: image, description, and a folded example list. */
  | {
      t: "types";
      items: {
        name: string;
        lead: string;
        text: string;
        best?: string;
        examples?: string[];
        image: string;
      }[];
    }
  /** Struck-through claim beside its correction. */
  | { t: "myths"; items: { myth: string; truth: string }[] }
  | { t: "faq"; items: { q: string; a: string }[] }
  | { t: "roadmap"; items: string[] }
  /** Two figures either side of a multiplier — the scale comparison. */
  | {
      t: "compare";
      a: { label: string; value: string };
      x: string;
      b: { label: string; value: string };
      note: string;
    }
  /** Full-width photograph. Supply the file; a missing one shows a panel. */
  | { t: "band"; src: string; caption?: string }
  /**
   * The dated facts panel. Everything with a shelf life belongs here and
   * nowhere else: it carries a review date and a source link, so a reader
   * can see how fresh it is and go and check.
   */
  | {
      t: "req";
      lastReviewed: string;
      source: { label: string; href: string };
      items: { label: string; value: string; note?: string }[];
    }
  /** Indicative figures — rents, living costs. Stamped like `req`. */
  | {
      t: "table";
      title: string;
      stamp: string;
      head: [string, string];
      rows: { k: string; v: string }[];
      note: string;
    }

export interface GuideSection {
  /** Anchor id, also used by the contents rail. */
  id: string;
  /** Short label for the rail. */
  label: string;
  head: HeadPart[];
  blocks: Block[];
}

export interface Guide {
  /** Page <title> and the eyebrow above the headline. */
  name: string;
  /** Hero headline. */
  head: HeadPart[];
  /** Hero photograph — the knockout heading is cut out of this. */
  hero: string;
  /** Hero standfirst. */
  lead: string;
  /** Where the hero's secondary link points, and what it says. */
  jump: { to: string; label: string };
  sections: GuideSection[];
  cta: { head: string; text: string };
}
