import React from "react";
import Link from "next/link";
import GlobalHeader from "@/app/components/GlobalHeader";
import parse, { DOMNode, Element } from "html-react-parser";
import { getPostsCollection } from "@/lib/mongo";
import { WithId, Document } from "mongodb";

// Define Post interface
interface Post extends WithId<Document> {
  title: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
}

// Helper to get post by slug (Server-side)
async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsCollection = await getPostsCollection();
    const post = await postsCollection.findOne<Post>({ slug });
    if (post) {
      return {
        ...post,
        _id: post._id,
      };
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch post from Mongo:", e);
    return null;
  }
}

// In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <GlobalHeader />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-slate-600 mb-8">
            The blog post you are looking for does not exist.
          </p>
          <Link href="/blogs" className="text-blue-600 hover:underline">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <GlobalHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all posts
        </Link>

        <article className="w-full">
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <div className="text-sm font-bold tracking-wider text-blue-600 mb-3 uppercase">
              {post.category || "Blog Post"}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-900">{post.author}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-4 sm:gap-2">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </header>

          <div className="prose prose-lg prose-slate mx-auto max-w-none prose-img:rounded-xl prose-img:shadow-lg prose-headings:scroll-mt-20 prose-a:text-blue-600 hover:prose-a:text-blue-700">
            {parse(post.content, {
              replace: (domNode) => {
                if (domNode instanceof Element && domNode.name === "img") {
                  const { src, alt } = domNode.attribs;
                  return (
                    <span className="block my-10">
                      <img
                        src={src}
                        alt={alt || "Blog image"}
                        className="rounded-xl shadow-lg w-full h-auto object-cover"
                        loading="lazy"
                      />
                      {alt && (
                        <span className="block text-center text-sm text-slate-500 mt-3 italic">
                          {alt}
                        </span>
                      )}
                    </span>
                  );
                }
              },
            })}
          </div>
        </article>
      </main>
    </div>
  );
}
