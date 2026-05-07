"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import type { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing your post...",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
      <div className="border-b border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("bold")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("italic")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("heading", { level: 2 })
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("heading", { level: 3 })
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("bulletList")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("orderedList")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          1. 2. 3.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive("blockquote")
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="px-2 py-1 rounded text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className="px-2 py-1 rounded text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          Link
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="p-4 bg-white dark:bg-zinc-900"
      />
    </div>
  );
}
