import { asyncHandler } from "../utils/asyncHandler.js";
import { userService } from "../services/user.service.js";

const sanitize = (u: { _id: unknown; name: string; email: string; role: string; active: boolean; createdAt: Date }) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  role: u.role,
  active: u.active,
  createdAt: u.createdAt,
});

export const list = asyncHandler(async (_req, res) => {
  const users = await userService.list();
  res.json({ users: users.map(sanitize) });
});

export const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ user: sanitize(user) });
});

export const update = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id as string, req.body);
  res.json({ user: sanitize(user) });
});
