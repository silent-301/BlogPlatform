import { ObjectId } from "mongodb";
import type { Post } from "@/types";

export function validatePost(data: Partial<Post>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push("Title must be at least 3 characters");
  }

  if (!data.content || data.content.trim().length < 10) {
    errors.push("Content must be at least 10 characters");
  }

  if (data.status && !["draft", "published"].includes(data.status)) {
    errors.push("Status must be 'draft' or 'published'");
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizePost(post: Post & { _id: ObjectId }) {
  return {
    ...post,
    _id: post._id.toString(),
    authorId: post.authorId?.toString(),
    likes: post.likes || [],
    createdAt: post.createdAt?.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
  };
}
