import type { CookieOptions } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authService } from "../services/auth.service.js";
import { isProd } from "../config/env.js";
import { clearPass } from "../middleware/gate.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const publicUser = (u: { _id: unknown; name: string; email: string; role: string }) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const { user, token } = await authService.login(email, password);
  /* One pass, one sign-in. Leaving it set would let a shared or borrowed
     browser retry the password for the next ten minutes without going back
     through the door. */
  clearPass(res);
  res.cookie("token", token, cookieOptions).json({ user: publicUser(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: 0 }).json({ message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user!) });
});
