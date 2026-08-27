import type { GalleryAlbum } from "../api/gallery";

/**
 * What the gallery shows before the admin has published anything.
 *
 * THESE ARE PLACEHOLDERS AND THEY DISAPPEAR ON THEIR OWN. The moment
 * `GET /albums` returns a single published album with an image in it, this
 * file stops being read — the page swaps to the real thing wholesale, never
 * mixes the two, and never falls back again in that session. Nothing here
 * needs deleting when the real photographs arrive.
 *
 * They exist because a gallery is the one page that cannot degrade to
 * nothing: an empty testimonial band can simply not render and the page
 * closes up around it, but a gallery with no images is a blank page with a
 * heading on it. So the layout is shown with photographs the site already
 * ships — the destination shots from the home page's globe — rather than
 * with a wireframe of grey panels.
 *
 * They are also deliberately NOT dressed up as things they are not. The
 * album titles below describe what the sections are for, and the captions
 * say plainly that these are stand-ins. Nothing here claims to be a
 * photograph of the Kathmandu office, an award, or a member of staff,
 * because a placeholder that lies is worse than an empty page.
 *
 * TO REPLACE THEM: in the admin media library, create an album, publish it,
 * and upload into it. Its title becomes the section heading and its
 * description (once that field is added to the upload screen) becomes the
 * standfirst.
 */

export const PLACEHOLDER_ALBUMS: GalleryAlbum[] = [
  {
    id: "placeholder-destinations",
    title: "Where we send students",
    description:
      "A stand-in section, using the destination photographs from elsewhere on the site. Publish an album in the media library and this is replaced by it.",
    images: [
      { id: "p-1", src: "/canada.jpg", caption: "Placeholder — Canada" },
      { id: "p-2", src: "/australia.jpg", caption: "Placeholder — Australia" },
      { id: "p-3", src: "/uk.jpg", caption: "Placeholder — United Kingdom" },
      { id: "p-4", src: "/usa.jpg", caption: "Placeholder — United States" },
      { id: "p-5", src: "/newzealand.jpg", caption: "Placeholder — New Zealand" },
      { id: "p-6", src: "/southkorea.jpg", caption: "Placeholder — South Korea" },
      { id: "p-7", src: "/ireland.jpg", caption: "Placeholder — Ireland" },
      { id: "p-8", src: "/germany.jpg", caption: "Placeholder — Germany" },
      { id: "p-9", src: "/dubai.jpg", caption: "Placeholder — Dubai" },
    ],
  },
  {
    id: "placeholder-preparation",
    title: "In the classroom",
    description:
      "A second stand-in, so the page shows what two albums look like stacked. Real test-preparation photographs belong here.",
    images: [
      { id: "p-10", src: "/help/ielts.jpg", caption: "Placeholder — IELTS" },
      { id: "p-11", src: "/help/toefl.jpg", caption: "Placeholder — TOEFL" },
      { id: "p-12", src: "/help/citizenship-test.jpg", caption: "Placeholder — testing" },
    ],
  },
];
