import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type UserRole = "admin" | "editor";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  /* Consecutive failed sign-ins, reset by the first success. Kept per
     ACCOUNT rather than per address: the rate limiter on the route already
     caps attempts from one address, and the attack it cannot see is the
     same password tried against one account from a hundred of them. */
  failedLogins: number;
  /** Set once the count is exceeded; sign-in is refused until it passes. */
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    active: { type: Boolean, default: true },
    /* Both select:false — neither belongs in a user object handed to a
       route, and leaking `lockedUntil` would tell an attacker exactly how
       long to wait. */
    failedLogins: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
