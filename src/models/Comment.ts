import { ObjectId } from "mongodb";
import type { Comment } from "@/types";

export function validateComment(data: Partial<Comment>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.content || data.content.trim().length < 1) {
    errors.push("Comment content is required");
  }

  if (!data.postId) {
    errors.push("Post ID is required");
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeComment(comment: Comment & { _id: ObjectId }) {
  return {
    ...comment,
    _id: comment._id.toString(),
    postId: comment.postId?.toString(),
    userId: comment.userId?.toString(),
    createdAt: comment.createdAt?.toISOString(),
    updatedAt: comment.updatedAt?.toISOString(),
  };
}
