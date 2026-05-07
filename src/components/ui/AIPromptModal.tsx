"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface AIPromptModalProps {
  mode: "description" | "improve" | "expand" | "tags";
  title?: string;
  content?: string;
  onClose: () => void;
  onResult: (result: string) => void;
}

export function AIPromptModal({
  mode,
  title,
  content,
  onClose,
  onResult,
}: AIPromptModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const labels: Record<string, { label: string; placeholder: string }> = {
    description: {
      label: "Generate Description",
      placeholder: "Describe what your blog is about, or leave blank to use title + content...",
    },
    improve: {
      label: "Improve Text",
      placeholder: "Add specific instructions for improvement, or leave blank for general improvements...",
    },
    expand: {
      label: "Expand Content",
      placeholder: "Tell the AI what to expand on, or leave blank for general expansion...",
    },
    tags: {
      label: "Generate Tags",
      placeholder: "Suggest specific topics for tags, or leave blank to auto-detect...",
    },
  };

  const config = labels[mode];

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          title: title || "",
          content: content || "",
          prompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }

      if (!data.data.generated || data.data.generated.trim().length === 0) {
        setError("AI returned an empty response. Try adding more content to your post first.");
        return;
      }

      onResult(data.data.generated);
    } catch {
      setError("Failed to connect to AI service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-lg mx-4">
        <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-white">
          {config.label}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          {config.placeholder}
        </p>

        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={config.placeholder}
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
        />

        {error && (
          <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} isLoading={loading}>
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
