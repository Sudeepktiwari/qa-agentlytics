"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import GlobalHeader from "@/app/components/GlobalHeader";
import ReactMarkdown from "react-markdown";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, author }),
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Content (Markdown Supported)
                </label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === "write"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === "preview"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Preview
                  </button>
                </div>
              </div>

              {activeTab === "write" ? (
                <>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# Heading&#10;&#10;Write your story here...&#10;&#10;![Image Alt Text](https://example.com/image.jpg)"
                    rows={12}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    required
                  />
                  <div className="mt-2 text-xs text-slate-500 bg-blue-50 p-3 rounded border border-blue-100">
                    <p className="font-semibold mb-1">Markdown Quick Guide:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use <code># Title</code> for headings</li>
                      <li>Use <code>**bold**</code> for bold text</li>
                      <li>Use <code>![Alt Text](url)</code> for images</li>
                      <li>Use <code>- Item</code> for lists</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="w-full px-4 py-3 border border-slate-200 rounded-lg min-h-[300px] prose prose-slate max-w-none overflow-y-auto bg-white">
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <p className="text-slate-400 italic">Nothing to preview yet...</p>
                  )}
                </div>
              )}
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
