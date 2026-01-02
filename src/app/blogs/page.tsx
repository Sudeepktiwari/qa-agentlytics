"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import GlobalHeader from "../components/GlobalHeader";
import Card from "../components/Card";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  slug: string;
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Fetch from our new API
        const res = await fetch("/api/blogs");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        // If no posts yet, show some mocks or empty state
        if (data.length === 0) {
          // Keep mocks for demo if empty
          setPosts([
            {
              id: "demo-1",
              title: "Welcome to the Blog (Demo)",
              description:
                "This is a demo post. Create your own by clicking the button above!",
              date: "Today",
              author: "System",
              readTime: "1 min read",
              category: "Demo",
              slug: "demo",
            },
          ]);
        } else {
          setPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load blog posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <GlobalHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Insights, updates, and expert advice on AI, customer support, and
            business growth.
          </p>

          <Link
            href="/blogs/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors shadow-sm hover:shadow-md"
          >
            <span>✍️</span> Write a New Post
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} loading={true} className="h-96" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
              {error}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/blogs/${post.slug}`} key={post.id}>
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {/* Try to extract first image from content if possible, else show icon */}
                    <span className="text-4xl">📝</span>
                  </div>
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 mb-4 line-clamp-3 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">
                            {post.author}
                          </p>
                          <p className="text-slate-500 text-xs">{post.date}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
