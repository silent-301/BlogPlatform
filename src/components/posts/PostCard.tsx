import Link from "next/link";
import Image from "next/image";
import { formatDate, truncateText, stripHtml } from "@/lib/utils";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post & { _id: string; author?: { name: string } };
}

export function PostCard({ post }: PostCardProps) {
  const excerpt = truncateText(stripHtml(post.content), 150);
  const hasLikes = (post.likes?.length || 0) > 0;

  return (
    <article className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow">
      {post.coverImage && (
        <Link href={`/posts/${post.slug || post._id}`} className="block">
          <div className="relative w-full h-48">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          {post.status === "draft" && (
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
              Draft
            </span>
          )}
          {post.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <Link href={`/posts/${post.slug || post._id}`}>
          <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {post.title}
          </h2>
        </Link>
        <p className="text-zinc-600 dark:text-zinc-300 mb-4 text-sm leading-relaxed">
          {excerpt}
        </p>
        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span>{post.author?.name || "Anonymous"}</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-4">
            {hasLikes && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                {post.likes?.length || 0}
              </span>
            )}
            {post.views && post.views > 0 && (
              <span>{post.views} views</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
