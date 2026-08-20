import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/User.js";
import { comparePassword } from "../utils/password.js";
import { ApiError } from "../utils/ApiError.js";

export const authService = {
  async login(email: string, password: string): Promise<{ user: UserDocument; token: string }> {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.active || !(await comparePassword(password, user.password))) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    const token = jwt.sign({ id: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
    return { user, token };
  },
};
