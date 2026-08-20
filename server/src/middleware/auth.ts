import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type UserRole } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface JwtPayload {
  id: string;
}

export const protect: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token: string | undefined = req.cookies?.token;
  if (!token) throw ApiError.unauthorized();

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.id);
  if (!user || !user.active) throw ApiError.unauthorized("Account not found or disabled");

  req.user = user;
  next();
});

/** Role guard: requireRole("admin") or requireRole("admin", "editor") */
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
