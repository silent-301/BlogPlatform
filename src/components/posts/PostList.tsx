import { PostCard } from "./PostCard";
import type { Post } from "@/types";

interface PostListProps {
  posts: (Post & { _id: string; author?: { name: string } })[];
  emptyMessage?: string;
}

export function PostList({ posts, emptyMessage = "No posts found" }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
