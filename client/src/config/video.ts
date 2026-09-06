/**
 * ═══════════════════════════════════════════════════════════════════════
 *  THE VIDEO UNDER THE RED "TALK TO US" BAND — PUT THE ID BELOW.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * WHAT TO PASTE. Open the video on YouTube and look at the address bar:
 *
 *     https://www.youtube.com/watch?v=dQw4w9WgXcQ
 *                                    ^^^^^^^^^^^
 *     https://youtu.be/dQw4w9WgXcQ
 *                      ^^^^^^^^^^^
 *
 * The eleven characters after `v=` (or after the last slash on a youtu.be
 * link) are the id. Paste JUST those between the quotes — not the whole
 * address:
 *
 *     export const HELP_VIDEO_ID = "dQw4w9WgXcQ";
 *
 * WHILE IT IS EMPTY, NOTHING IS SHOWN. The section renders nothing at all
 * rather than an empty black box or somebody else's clip, which is the same
 * rule the student-stories row follows: a section that is briefly absent is
 * far better than one that confidently shows the wrong thing. So this is
 * safe to ship as it stands, and the video appears on all sixteen pages the
 * moment the id lands.
 *
 * THE VIDEO MUST BE PUBLIC OR UNLISTED. A private video cannot be embedded
 * and will show "Video unavailable" to everybody. If embedding is switched
 * off for the video in YouTube Studio it will do the same, so check
 * Studio → the video → Visibility, and that "Allow embedding" is ticked.
 *
 * ONE ID FOR THE WHOLE SITE. Every red band on every page shows this same
 * video. If a page ever needs its own, HelpVideo takes an optional `id`
 * prop — pass it there and this stays the default.
 */
export const HELP_VIDEO_ID = "";

/** The title, used for the iframe's accessible name and the play button. */
export const HELP_VIDEO_TITLE = "Lakehead Education";
