"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import GlobalHeader from "@/app/components/GlobalHeader";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    // Convert title to a URL-friendly slug (e.g., "My New Post" -> "my-new-post")
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Pass content via URL query parameters (since we have no DB)
    const queryParams = new URLSearchParams();
    if (content) queryParams.set("content", content);
    
    // Redirect to the dynamic page
    router.push(`/blogs/${slug}?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalHeader />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Create a New Blog Post
        </h1>
        
        <Card className="p-8">
          <form onSubmit={handleCreate} className="space-y-6">
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
                Content (Optional)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here..."
                rows={6}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-2">
                *Since there is no database, content is passed via the URL. Keep it brief!
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Generate Page
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
