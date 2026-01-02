import React from "react";
import Link from "next/link";
import GlobalHeader from "@/app/components/GlobalHeader";

// In Next.js 15, params and searchParams are Promises
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogPost({ params, searchParams }: Props) {
  const { slug } = await params;
  const { content } = await searchParams;
  
  // Ensure content is a string (searchParams can be string | string[] | undefined)
  const contentString = Array.isArray(content) ? content[0] : content || "";

  // Convert slug back to readable Title (e.g., "my-new-post" -> "My New Post")
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Mock date generator based on slug length (just for fun consistency)
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      <GlobalHeader />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/blogs/create"
          className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          ← Create another post
        </Link>

        <article>
          <header className="mb-10 text-center">
            <div className="text-sm font-medium text-blue-600 mb-3">
              Blog Post
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </header>

          <div className="prose prose-lg prose-slate mx-auto">
            {contentString ? (
              <div className="whitespace-pre-wrap">{contentString}</div>
            ) : (
              // Fallback dummy content if no content provided
              <>
                <p className="lead text-xl text-slate-600 mb-8">
                  This is a dynamically generated page for <strong>"{title}"</strong>.
                  Since we aren't using a database, this page exists simply because
                  you visited the URL!
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                  enim ad minim veniam, quis nostrud exercitation ullamco laboris
                  nisi ut aliquip ex ea commodo consequat.
                </p>
                <h2>Why Dynamic Routes are Cool</h2>
                <p>
                  Next.js allows us to use <code>[slug]</code> as a filename, which
                  acts as a wildcard. Whether you visit <code>/blogs/hello</code> or{" "}
                  <code>/blogs/world</code>, this single file handles it all.
                </p>
              </>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
