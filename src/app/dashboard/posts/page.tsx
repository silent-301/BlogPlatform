"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Post } from "@/types";

export default function DashboardPostsPage() {
  const [posts, setPosts] = useState<
    (Post & { _id: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?status=${filter}&limit=50`);
      const data = await res.json();
      if (data.success) setPosts(data.data.posts);
    } catch {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch {
      console.error("Failed to delete post");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          My Posts
        </h1>
        <Link href="/dashboard/create">
          <Button>New Post</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "draft", "published"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse"
            >
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">No posts yet</p>
          <Link href="/dashboard/create">
            <Button>Create your first post</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-700">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Date
                </th>
                <th className="text-right px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {posts.map((post) => (
                <tr key={post._id}>
                  <td className="px-6 py-4">
                    <Link
                      href={`/posts/${post.slug || post._id}`}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/edit/${post._id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(post._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
