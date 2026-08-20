import { Router } from "express";
import authRoutes from "./auth.routes.js";
import postRoutes from "./post.routes.js";
import inquiryRoutes from "./inquiry.routes.js";
import userRoutes from "./user.routes.js";
import albumRoutes from "./album.routes.js";
import mediaRoutes from "./media.routes.js";

const v1 = Router();

v1.use("/auth", authRoutes);
v1.use("/posts", postRoutes);
v1.use("/inquiries", inquiryRoutes);
v1.use("/users", userRoutes);
v1.use("/albums", albumRoutes);
v1.use("/media", mediaRoutes);

export default v1;
