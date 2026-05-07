import { ObjectId } from "mongodb";
import type { User } from "@/types";

export function validateUser(data: Partial<User>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Valid email is required");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (data.role && !["author", "reader"].includes(data.role)) {
    errors.push("Role must be 'author' or 'reader'");
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeUser(user: User & { _id: ObjectId }) {
  const { password: _password, ...rest } = user;
  return {
    ...rest,
    _id: rest._id.toString(),
    createdAt: rest.createdAt?.toISOString(),
    updatedAt: rest.updatedAt?.toISOString(),
  };
}
