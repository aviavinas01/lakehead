import { Fragment, type ReactNode } from "react";
import { mediaSrc } from "../api/media";

/**
 * The article format, and the one renderer that draws it.
 *
 * Posts are stored as plain text in `Post.content`. Before this, the public
 * page split on blank lines and wrapped each chunk in a <p>, which meant a
 * writer had no way to set a heading, quote anyone, or place an image in the
 * middle of a piece — every article was an undifferentiated column of
 * paragraphs.
 *
 * So a small, deliberately limited markup is understood instead. It is a
 * subset of Markdown, which matters because it is the subset people type by
 * habit anyway, and because anything it does not recognise degrades to an
 * ordinary paragraph rather than to an error.
 *
 * NOTHING IS EVER SET AS HTML. Every branch below returns React elements
 * built from parsed pieces, so a post can contain `<script>` or any other
 * markup and it renders as the literal text somebody typed. That is the
 * whole reason this is hand-written rather than a markdown library plus a
 * sanitiser: there is no HTML path to sanitise. Links are the one place raw
 * input reaches an attribute, and `safeHref` below is why `javascript:` in a
 * link target cannot do anything.
 *
 * The editor's live preview calls this same function, so what a writer sees
 * while typing is what the article page will render — not an approximation.
 */

/** The syntax, as shown to writers in the editor's help panel. */
export const SYNTAX_HELP: { code: string; means: string }[] = [
  { code: "## Heading", means: "Section heading" },
  { code: "### Smaller heading", means: "Sub-heading" },
  { code: "> A quotation", means: "Pulled-out quote" },
  { code: "- Item", means: "Bulleted list" },
  { code: "1. Item", means: "Numbered list" },
  { code: "![](image-url)", means: "Image, on its own line" },
  { code: "---", means: "Divider" },
  { code: "**bold**", means: "Bold" },
  { code: "*italic*", means: "Italic" },
  { code: "[text](url)", means: "Link" },
];

/**
 * Blocks a link from carrying a script. Anything that is not plainly http,
 * https, mailto, tel, an anchor or a site-relative path is dropped, and the
 * link renders as unclickable text rather than as a live hazard.
 */
function safeHref(href: string): string | undefined {
  const v = href.trim();
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(v) && !v.startsWith("//")) return v;
  return undefined;
}

/** `**bold**`, `*italic*`, `` `code` `` and `[text](url)`, in one pass. */
const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(INLINE);

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyBase}-${match.index}`;

    if (token.startsWith("**")) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const split = token.indexOf("](");
      const label = token.slice(1, split);
      const href = safeHref(token.slice(split + 2, -1));
      out.push(
        href ? (
          <a
            key={key}
            href={href}
            {...(href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {label}
          </a>
        ) : (
          /* A link we will not follow still shows its words */
          <Fragment key={key}>{label}</Fragment>
        )
      );
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}

const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

/** Parses `content` into React elements. Unknown lines become paragraphs. */
export function renderArticle(content: string): ReactNode[] {
  /* Normalise line endings first — content pasted from Word arrives with
     \r\n and every block test below would miss on the trailing \r. */
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;

  /* Collects the run of consecutive lines that all match `test`, which is
     what turns four "- " lines into one <ul> rather than four. */
  const gather = (test: (l: string) => boolean) => {
    const run: string[] = [];
    while (i < lines.length && test(lines[i])) run.push(lines[i++]);
    return run;
  };

  while (i < lines.length) {
    const line = lines[i];
    const key = `b-${i}`;

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      out.push(<hr key={key} />);
      i++;
      continue;
    }

    const image = line.trim().match(IMAGE_LINE);
    if (image) {
      const src = safeHref(image[2]);
      i++;
      if (src) {
        out.push(
          <figure key={key} className="art-figure">
            <img src={mediaSrc(src)} alt={image[1]} loading="lazy" decoding="async" />
            {image[1] ? <figcaption>{image[1]}</figcaption> : null}
          </figure>
        );
      }
      continue;
    }

    if (line.startsWith("### ")) {
      out.push(<h3 key={key}>{inline(line.slice(4), key)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(<h2 key={key}>{inline(line.slice(3), key)}</h2>);
      i++;
      continue;
    }
    /* A single # is treated as a section heading too: the post already has
       an <h1> — its title — and a second one would be wrong. */
    if (line.startsWith("# ")) {
      out.push(<h2 key={key}>{inline(line.slice(2), key)}</h2>);
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const run = gather((l) => l.startsWith("> "));
      out.push(
        <blockquote key={key}>
          {inline(run.map((l) => l.slice(2)).join(" "), key)}
        </blockquote>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const run = gather((l) => /^[-*]\s+/.test(l));
      out.push(
        <ul key={key}>
          {run.map((l, n) => (
            <li key={n}>{inline(l.replace(/^[-*]\s+/, ""), `${key}-${n}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      const run = gather((l) => /^\d+[.)]\s+/.test(l));
      out.push(
        <ol key={key}>
          {run.map((l, n) => (
            <li key={n}>{inline(l.replace(/^\d+[.)]\s+/, ""), `${key}-${n}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    /* An ordinary paragraph: every consecutive plain line, joined. A single
       newline inside a paragraph is a wrap, not a break — a blank line or a
       block marker is what ends it.
     *
     * The current line is taken FIRST and unconditionally, before gathering
     * the rest. That is not tidiness: this branch is the fallthrough, so it
     * is reached by lines that matched no block test above, and some of
     * those also fail the continuation test below — `#hashtag`, for
     * instance, is not a heading (no space) but does start with "#". Asking
     * `gather` to consume it would return an empty run, leave `i` where it
     * was, and spin the loop forever on that one line. */
    i++;
    const run = [
      line,
      ...gather(
        (l) =>
          l.trim() !== "" &&
          !l.startsWith("#") &&
          !l.startsWith("> ") &&
          !/^[-*]\s+/.test(l) &&
          !/^\d+[.)]\s+/.test(l) &&
          !/^---+$/.test(l.trim()) &&
          !IMAGE_LINE.test(l.trim())
      ),
    ];
    out.push(<p key={key}>{inline(run.join(" "), key)}</p>);
  }

  return out;
}

/** The article as plain words — for excerpts, counts and reading time. */
export function plainText(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(content: string): number {
  const text = plainText(content);
  return text ? text.split(" ").length : 0;
}

/** 220 words a minute, rounded up, never zero. */
export function readingTime(content: string): number {
  return Math.max(1, Math.ceil(wordCount(content) / 220));
}

/** First sentence or two, for a card with no excerpt written for it. */
export function autoExcerpt(content: string, max = 180): string {
  const text = plainText(content);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return `${cut.slice(0, stop > 60 ? stop : max).trimEnd()}…`;
}
