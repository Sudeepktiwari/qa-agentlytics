"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Card from "@/app/components/Card";
import GlobalHeader from "@/app/components/GlobalHeader";
import TurndownService from "turndown";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Stores HTML content from Quill
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Configure Quill modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "link",
    "image",
    "code-block",
  ];

  // Helper to convert base64 to blob
  const base64ToBlob = async (base64Data: string) => {
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    return blob;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);

    try {
      // Process content to handle base64 images
      // We create a temporary DOM element to traverse and modify images
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const images = doc.querySelectorAll("img");
      const uploads: Promise<void>[] = [];

      images.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && (src.startsWith("data:image") || src.startsWith("blob:"))) {
          // It's a base64 or blob image, needs upload
          const uploadTask = async () => {
            try {
              const blob = await base64ToBlob(src);
              const file = new File([blob], "image.png", { type: blob.type });
              const formData = new FormData();
              formData.append("file", file);

              const res = await fetch("/api/blog-images", {
                method: "POST",
                body: formData,
              });

              if (res.ok) {
                const data = await res.json();
                img.setAttribute("src", data.url);
              }
            } catch (err) {
              console.error("Failed to upload image", err);
            }
          };
          uploads.push(uploadTask());
        }
      });

      // Wait for all image uploads to complete
      await Promise.all(uploads);

      // Convert the processed HTML to Markdown
      const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
      });

      // Ensure code blocks are handled correctly
      turndownService.addRule("codeBlock", {
        filter: "pre",
        replacement: function (content) {
          return "```\n" + content + "\n```";
        },
      });

      const markdownContent = turndownService.turndown(doc.body.innerHTML);

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: markdownContent, author }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/blogs/${data.slug}`);
      } else {
        alert("Failed to create post");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalHeader />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Create a New Blog Post
        </h1>

        <Card className="p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Blog Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., The Future of AI"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Content
              </label>
              <div className="bg-white rounded-lg overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  className="h-[400px] mb-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
