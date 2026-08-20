import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    role: z.enum(["admin", "editor"]).default("editor"),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    role: z.enum(["admin", "editor"]).optional(),
    active: z.boolean().optional(),
    password: z.string().min(8).max(72).optional(),
  }),
  params: z.object({ id: z.string().length(24) }),
});
