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
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          ← Back to all posts
        </Link>

        <article>
          <header className="mb-10 text-center">
            <div className="text-sm font-medium text-blue-600 mb-3">
              {post.category || "Blog Post"}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <span className="font-medium text-slate-900">{post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          <div className="prose prose-lg prose-slate mx-auto">
            {parse(post.content, {
              replace: (domNode) => {
                if (domNode instanceof Element && domNode.name === "img") {
                  const { src, alt, width, height } = domNode.attribs;
                  return (
                    <span className="block my-8">
                      <img
                        src={src}
                        alt={alt || "Blog image"}
                        width={width}
                        height={height}
                        className="rounded-lg shadow-md max-w-full h-auto"
                      />
                      {alt && (
                        <span className="block text-center text-sm text-slate-500 mt-2 italic">
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
