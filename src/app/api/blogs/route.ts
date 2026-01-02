
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/posts.json');

// Helper to read posts
function getPosts() {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    return [];
  }
  const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
  try {
    return JSON.parse(fileContent);
  } catch (e) {
    return [];
  }
}

// Helper to save posts
function savePosts(posts: any[]) {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(posts, null, 2));
}

export async function GET() {
  const posts = getPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, content, author, description } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  }

  const posts = getPosts();
  
  // Create slug
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    slug,
    author: author || 'Anonymous',
    description: description || content.slice(0, 150) + '...',
    date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    readTime: `${Math.ceil(content.split(' ').length / 200)} min read`,
    category: 'General'
  };

  // Check if slug exists, if so append timestamp
  if (posts.some((p: any) => p.slug === slug)) {
      newPost.slug = `${slug}-${Date.now()}`;
  }

  posts.unshift(newPost); // Add to top
  savePosts(posts);

  return NextResponse.json({ success: true, slug: newPost.slug });
}
