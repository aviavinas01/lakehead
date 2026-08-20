// Run once: npm run seed:sample — creates example content so the site isn't empty.
import { connectDB, disconnectDB } from "./db.js";
import { env } from "./env.js";
import { User } from "../models/User.js";
import { Post } from "../models/Post.js";
import { Album } from "../models/Album.js";

const seed = async () => {
  await connectDB();

  const admin = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!admin) {
    console.error("Admin user not found — run `npm run seed:admin` first.");
    await disconnectDB();
    process.exit(1);
  }

  if (await Post.countDocuments()) {
    console.log("Posts already exist — skipping sample posts.");
  } else {
    await Post.create([
      {
        title: "Welcome to Our Consultancy",
        excerpt: "Who we are, what we do, and how we help you reach your goals.",
        content:
          "This is a sample blog post. Log in to the admin panel and edit or delete it, then write your own.\n\nUse the post editor to publish updates, guides, and success stories for your clients.",
        tags: ["announcements"],
        status: "published",
        author: admin._id,
      },
      {
        title: "How Our Consultation Process Works",
        excerpt: "A step-by-step look at what to expect when you work with us.",
        content:
          "This is a second sample post, saved as a draft. Drafts are only visible in the admin panel — publish it from the post editor when it's ready.",
        tags: ["guides"],
        status: "draft",
        author: admin._id,
      },
    ]);
    console.log("Sample posts created (1 published, 1 draft).");
  }

  if (await Album.countDocuments()) {
    console.log("Albums already exist — skipping sample album.");
  } else {
    await Album.create({
      title: "Our Office",
      description:
        "A sample album. Upload photos and videos to it from the admin panel, or create new albums for events, teams, and success stories.",
      published: true,
    });
    console.log("Sample album created.");
  }

  await disconnectDB();
  console.log("Sample data seeding complete.");
};

seed();
