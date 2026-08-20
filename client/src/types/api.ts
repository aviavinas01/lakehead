export type UserRole = "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active?: boolean;
  createdAt?: string;
}

export type PostStatus = "draft" | "published";

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: PostStatus;
  author?: { _id: string; name: string };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PostSummary = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "tags" | "publishedAt"
>;

export const SERVICES = [
  "study-abroad",
  "test-preparation",
  "visa-guidance",
  "career-counselling",
  "other",
] as const;
export type ServiceType = (typeof SERVICES)[number];

export type InquiryStatus = "new" | "contacted" | "closed";

export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  service: ServiceType;
  message: string;
  status: InquiryStatus;
  notes?: string;
  createdAt: string;
}

export interface Album {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = "image" | "video";

export interface Media {
  _id: string;
  type: MediaType;
  url: string;
  title?: string;
  caption?: string;
  album?: string | { _id: string; title: string; slug: string };
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
