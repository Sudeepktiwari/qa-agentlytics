import React from "react";
import Link from "next/link";
import fs from 'fs';
import path from 'path';
import GlobalHeader from "@/app/components/GlobalHeader";
import ReactMarkdown from "react-markdown";

// Helper to get post by slug (Server-side)
async function getPostBySlug(slug: string) {
  const filePath = path.join(process.cwd(), 'src/data/posts.json');
  if (!fs.existsSync(filePath)) return null;
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const posts = JSON.parse(fileContent);
  return posts.find((p: any) => p.slug === slug);
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-8">The blog post you are looking for does not exist.</p>
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
              {post.category || 'Blog Post'}
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
             <ReactMarkdown 
               components={{
                 img: ({node, ...props}) => (
                   <span className="block my-8">
                     <img 
                       {...props} 
                       className="rounded-lg shadow-md w-full object-cover max-h-[500px]"
                       alt={props.alt || "Blog image"}
                     />
                     {props.alt && (
                       <span className="block text-center text-sm text-slate-500 mt-2 italic">
                         {props.alt}
                       </span>
                     )}
                   </span>
                 )
               }}
             >
               {post.content}
             </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
