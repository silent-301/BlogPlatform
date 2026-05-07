"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import type { Post, Comment } from "@/types";

export default function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [post, setPost] = useState<
    (Post & { _id: string; author?: { name: string; email: string } }) | null
  >(null);
  const [comments, setComments] = useState<
    (Comment & { _id: string; user?: { name: string } })[]
  >([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { user } = useAuth();

  const loadPost = useCallback(async () => {
    const { slug } = await params;
    try {
      const postRes = await fetch(`/api/posts/${slug}`);
      const postData = await postRes.json();
      if (postData.success) {
        setPost(postData.data);
        setLikesCount(postData.data.likes?.length || 0);

        const commentsRes = await fetch(`/api/posts/${slug}/comments`);
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          setComments(commentsData.data);
        }
      } else {
        setError(postData.error);
      }
    } catch {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (user && post) {
      setIsLiked(post.likes?.includes(user.id) || false);
    }
  }, [user, post]);

  const handleLike = async () => {
    if (!user) return;

    const { slug } = await params;
    try {
      const res = await fetch(`/api/posts/${slug}/likes`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setIsLiked(data.data.isLiked);
        setLikesCount(data.data.likesCount);
      }
    } catch {
      console.error("Failed to toggle like");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { slug } = await params;
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => [data.data, ...prev]);
        setNewComment("");
      }
    } catch {
      console.error("Failed to add comment");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-8" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error || "Post not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        {post.coverImage && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {post.author?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">
                {post.author?.name || "Anonymous"}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="flex items-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-700">
          <Button
            variant={isLiked ? "danger" : "secondary"}
            onClick={handleLike}
          >
            {isLiked ? (
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            )}
            {likesCount} {likesCount === 1 ? "Like" : "Likes"}
          </Button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {post.views} {post.views === 1 ? "view" : "views"}
          </span>
        </div>
      </article>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-white">
          Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" disabled={!newComment.trim()}>
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Please{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              login
            </a>{" "}
            to leave a comment.
          </p>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-6">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="font-medium text-sm text-zinc-900 dark:text-white">
                    {comment.user?.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
