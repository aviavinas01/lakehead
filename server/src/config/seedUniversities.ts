// npm run seed:universities
//
// A one-off migration, not a fixture. It copies the ten partner logos that
// used to live in client/src/data/universities.ts into the collection that
// replaced that file, so the wall on /university-partners looks exactly the
// same the moment this ships and everything after that is edited in the
// admin.
//
// SAFE TO RUN TWICE. Each entry is matched on its logo path and skipped if
// it is already there, so a second run reports "already present" and changes
// nothing. It will not overwrite a name somebody has since corrected in the
// admin — which is the whole reason it matches on the logo rather than on
// the name.
//
// NOT CALLED AT BOOT, deliberately, unlike ensureAdmin next door. Seeding an
// admin account every start is how the site stays reachable; re-inserting
// content the office may have deliberately deleted is not a favour. Run it
// once, by hand, and then forget it exists.
import { connectDB, disconnectDB } from "./db.js";
import { University } from "../models/University.js";
import { universityService } from "../services/university.service.js";

/**
 * The ten records as the static file held them.
 *
 * THE NAMES ARE STILL PLACEHOLDERS, and that is faithful rather than lazy:
 * the logos were supplied without names attached, so the file carried
 * "University 1"…"University 10" and so does this. They are now editable by
 * whoever knows the real names, which was the point of the move. Set the
 * country while you are in there — the filter chips and the per-destination
 * counts on the partners page are all derived from that field.
 */
const LEGACY = Array.from({ length: 10 }, (_, i) => ({
  name: `University ${i + 1}`,
  logo: `/universities/uni-${i + 1}.jpeg`,
  /* Preserves the order they appeared in on the old wall. */
  order: i,
}));

const seed = async () => {
  await connectDB();

  let added = 0;
  let skipped = 0;

  for (const entry of LEGACY) {
    const existing = await University.findOne({ logo: entry.logo }).select("_id");
    if (existing) {
      skipped++;
      continue;
    }
    /* Through the service rather than the model, so each one gets its slug
       built and de-duplicated exactly as an admin-created record does. */
    await universityService.create(entry);
    added++;
  }

  console.log(
    `Universities seeded: ${added} added, ${skipped} already present.`
  );

  await disconnectDB();
};

seed();
