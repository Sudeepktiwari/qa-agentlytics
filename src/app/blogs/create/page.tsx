"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import Card from "@/app/components/Card";
import GlobalHeader from "@/app/components/GlobalHeader";
import "react-quill-new/dist/quill.snow.css";

interface Post {
  id: string;
  title: string;
  slug: string;
  date: string;
  author: string;
}

// Helper to compress images
const compressImage = async (
  base64Str: string,
  maxWidth = 1024,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str); // Fail safe
  });
};

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
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/blogs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post", error);
      alert("Error deleting post");
    }
  };

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
  // Note: We no longer need to upload images to the server separately because we are storing them as Base64 in the content.
  // This avoids issues with Vercel's read-only filesystem.

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);

    try {
      // Process content to convert blob URLs to Base64 and compress large images
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const images = doc.querySelectorAll("img");

      for (const img of Array.from(images)) {
        let src = img.getAttribute("src");

        // Convert Blob to Base64
        if (src?.startsWith("blob:")) {
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            src = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.error("Failed to convert blob to base64", e);
            continue;
          }
        }

        // Compress Base64 images to reduce payload size
        if (src?.startsWith("data:image")) {
          try {
            const compressed = await compressImage(src);
            img.setAttribute("src", compressed);
          } catch (e) {
            console.error("Failed to compress image", e);
            // Keep original if compression fails, but update src if it was a blob
            if (src) img.setAttribute("src", src);
          }
        }
      }

      const processedContent = doc.body.innerHTML;

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: processedContent,
          author,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Don't redirect immediately, maybe just refresh list and clear form?
        // But usually creation redirects to the new post.
        // Let's keep redirect, but maybe user wants to create multiple?
        // User asked to "show the blogs list", implying a management view.
        // But usually "Create" page is for creating.
        // Let's stick to redirect for now as it's standard flow.
        router.push(`/blogs/${data.slug}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to create post: ${errorData.error || "Unknown error"}`);
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

        <Card className="p-8 mb-12">
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

        {/* Existing Posts List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Existing Posts
          </h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    By {post.author} on {post.date}
                  </p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    target="_blank"
                  >
                    Visit Page
                  </Link>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    Delete Post
                  </button>
                </div>
              </Card>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No posts yet. Create your first one above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
