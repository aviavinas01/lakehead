import mongoose, { Schema, type HydratedDocument, type Model, Types } from "mongoose";

export type MediaType = "image" | "video";

export interface IMedia {
  type: MediaType;
  url: string;
  /** Cloudinary's handle for the file, when Cloudinary stored it. Absent for
      files on the local disk. See services/storage.service. */
  publicId?: string;
  title?: string;
  caption?: string;
  album?: Types.ObjectId;
  mimeType: string;
  size: number;
  order: number;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaDocument = HydratedDocument<IMedia>;

const mediaSchema = new Schema<IMedia>(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    publicId: { type: String, trim: true },
    title: { type: String, trim: true, maxlength: 200 },
    caption: { type: String, maxlength: 500 },
    album: { type: Schema.Types.ObjectId, ref: "Album", index: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    order: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Media: Model<IMedia> = mongoose.model<IMedia>("Media", mediaSchema);
