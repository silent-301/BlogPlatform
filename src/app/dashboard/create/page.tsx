"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { AIPromptModal } from "@/components/ui/AIPromptModal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiModal, setAiModal] = useState<{
    mode: "description" | "improve" | "expand" | "tags";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setCoverImageUrl(data.data.url);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  function hasRealContent(text: string): boolean {
    return text.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim().length > 0;
  }

  const handleAiResult = (result: string) => {
    if (aiModal?.mode === "tags") {
      setTagsInput(result);
    } else if (aiModal?.mode === "improve") {
      setContent(result);
    } else {
      setContent((prev) => prev + "\n" + result);
    }
    setAiModal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          coverImage: coverImageUrl || undefined,
          tags,
          status,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      router.push("/dashboard/posts");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Create New Post
        </h1>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
            AI Tools
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Cover Image
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploading}
            >
              Upload Image
            </Button>
            {coverImageUrl && (
              <span className="text-sm text-green-600 dark:text-green-400 self-center">
                Image uploaded: {coverImageUrl}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Content
            </label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasRealContent(content)}
                onClick={() => setAiModal({ mode: "improve" })}
                className="text-purple-600 dark:text-purple-400 text-xs"
              >
                Improve
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!hasRealContent(content)}
                onClick={() => setAiModal({ mode: "expand" })}
                className="text-purple-600 dark:text-purple-400 text-xs"
              >
                Expand
              </Button>
            </div>
          </div>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your post..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tags (comma separated)
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!title && !hasRealContent(content)}
              onClick={() => setAiModal({ mode: "tags" })}
              className="text-purple-600 dark:text-purple-400 text-xs"
            >
              Auto-generate
            </Button>
          </div>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. technology, javascript, webdev"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
            Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={() => setStatus("draft")}
                className="text-blue-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Draft</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={() => setStatus("published")}
                className="text-blue-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Published</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" isLoading={loading}>
            {status === "draft" ? "Save Draft" : "Publish"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>

      {aiModal && (
        <AIPromptModal
          mode={aiModal.mode}
          title={title}
          content={content}
          onClose={() => setAiModal(null)}
          onResult={handleAiResult}
        />
      )}
    </div>
  );
}
