// Run once: npm run seed:admin
import { connectDB, disconnectDB } from "./db.js";
import { env } from "./env.js";
import { User } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

const seed = async () => {
  await connectDB();
  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists:", env.ADMIN_EMAIL);
  } else {
    await User.create({
      name: "Admin",
      email: env.ADMIN_EMAIL,
      password: await hashPassword(env.ADMIN_PASSWORD),
      role: "admin",
    });
    console.log("Admin user created:", env.ADMIN_EMAIL);
  }
  await disconnectDB();
};

seed();
