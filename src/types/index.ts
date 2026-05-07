import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "author" | "reader";
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  authorId: ObjectId;
  author?: User;
  status: "draft" | "published";
  tags: string[];
  likes: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  user?: User;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
