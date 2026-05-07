"use client";

import { useEffect, useState } from "react";
import { PostList } from "@/components/posts/PostList";
import type { Post } from "@/types";

interface PaginatedPosts {
  posts: (Post & { _id: string; author?: { name: string } })[];
  pagination: { page: number; totalPages: number; total: number; limit: number };
}

export default function Home() {
  const [data, setData] = useState<PaginatedPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    (Post & { _id: string; author?: { name: string } })[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${p}&limit=9`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/posts/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) setSearchResults(json.data.posts);
    } catch {
      console.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const hasResults = searchQuery.trim().length >= 2 && searchResults.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Discover Stories
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          Read and share ideas from writers around the world
        </p>
      </div>

      <div className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? "..." : "Search"}
        </button>
        {hasResults && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
            }}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600"
          >
            Clear
          </button>
        )}
      </div>

      {hasResults ? (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-zinc-700 dark:text-zinc-300">
            Search results for "{searchQuery}" ({searchResults.length})
          </h2>
          <PostList posts={searchResults} emptyMessage="No matching posts" />
        </div>
      ) : loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 animate-pulse"
            >
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6 mb-4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <PostList
            posts={data.posts}
            emptyMessage="No posts yet. Be the first to write one!"
          />
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-zinc-600 dark:text-zinc-300">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
