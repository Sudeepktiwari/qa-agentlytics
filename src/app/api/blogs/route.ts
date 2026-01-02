import { NextResponse } from "next/server";
import { getPostsCollection } from "@/lib/mongo";

export async function GET() {
  try {
    const postsCollection = await getPostsCollection();
    // Fetch all posts, sorted by date (newest first)
    // We can assume 'id' or 'date' can be used for sorting.
    // Let's sort by insertion order (reverse natural) or a date field if available.
    const posts = await postsCollection.find({}).toArray();

    // Sort manually if needed, or rely on Mongo sort
    // The previous file-based impl put new posts at the top (unshift).
    // So we want reverse chronological order.
    // We'll rely on the 'date' string parsing or just the 'id' (timestamp)

    const sortedPosts = posts.sort((a, b) => {
      // Compare by id (timestamp) descending
      return Number(b.id) - Number(a.id);
    });

    // Map _id to string if needed, though for JSON response it's fine.
    // Just ensure we match the expected shape.
    const cleanPosts = sortedPosts.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json(cleanPosts);
  } catch (e) {
    console.error("Failed to fetch posts from Mongo:", e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author, description } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const postsCollection = await getPostsCollection();

    // Create slug
    const slugBase = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = slugBase;

    // Check for duplicate slug
    const existing = await postsCollection.findOne({ slug });
    if (existing) {
      slug = `${slugBase}-${Date.now()}`;
    }

    const newPost = {
      id: Date.now().toString(),
      title,
      content, // Content now contains Base64 images directly
      slug,
      author: author || "Anonymous",
      description: description || content.slice(0, 150) + "...",
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      readTime: `${Math.ceil(content.split(" ").length / 200)} min read`,
      category: "General",
      createdAt: new Date(),
    };

    await postsCollection.insertOne(newPost);

    return NextResponse.json({ success: true, slug: newPost.slug });
  } catch (e) {
    console.error("Failed to create post in Mongo:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
