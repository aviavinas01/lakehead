import { User, type IUser, type UserDocument } from "../models/User.js";
import { hashPassword } from "../utils/password.js";
import { ApiError } from "../utils/ApiError.js";

type CreateUserInput = Pick<IUser, "name" | "email" | "password"> &
  Partial<Pick<IUser, "role">>;

export const userService = {
  async list(): Promise<UserDocument[]> {
    return User.find().sort({ createdAt: -1 });
  },

  async create(input: CreateUserInput): Promise<UserDocument> {
    const existing = await User.findOne({ email: input.email });
    if (existing) throw ApiError.conflict("A user with this email already exists");
    return User.create({ ...input, password: await hashPassword(input.password) });
  },

  async update(
    id: string,
    input: Partial<Pick<IUser, "name" | "role" | "active" | "password">>
  ): Promise<UserDocument> {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound("User not found");
    if (input.password) input.password = await hashPassword(input.password);
    Object.assign(user, input);
    await user.save();
    return user;
  },
};
