// npm run seed:admin — for a local database, against your own .env.
//
// The server now does this itself at every boot (see ensureAdmin, which this
// calls), so nothing depends on anyone remembering to run it. It is kept
// because pointing a local .env at a database and running one command is
// still the quickest way to check what ensureAdmin will do to it.
import { connectDB, disconnectDB } from "./db.js";
import { ensureAdmin } from "./ensureAdmin.js";

const seed = async () => {
  await connectDB();
  await ensureAdmin();
  await disconnectDB();
};

seed();
