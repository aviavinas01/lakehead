import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import slugify from "slugify";

export interface IAlbum {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AlbumDocument = HydratedDocument<IAlbum>;

const albumSchema = new Schema<IAlbum>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, maxlength: 1000 },
    coverImage: { type: String, default: "" },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

albumSchema.pre("validate", function (next) {
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) +
      "-" +
      Date.now().toString(36).slice(-4);
  }
  next();
});

export const Album: Model<IAlbum> = mongoose.model<IAlbum>("Album", albumSchema);
