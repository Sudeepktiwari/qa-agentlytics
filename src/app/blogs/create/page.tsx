"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import GlobalHeader from "@/app/components/GlobalHeader";
import ReactMarkdown from "react-markdown";
import TurndownService from "turndown";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  Quote,
  Code,
  Heading as HeadingIcon,
} from "lucide-react";

export default function CreateBlogPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImages, setPendingImages] = useState<Map<string, File>>(
    new Map()
  );
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);

    try {
      let finalContent = content;

      // Upload pending images
      if (pendingImages.size > 0) {
        // Regex to find blob urls in content: blob:http://...
        const blobUrlRegex = /!\[(.*?)\]\((blob:.*?)\)/g;
        let match;
        const uploads = [];

        // Find all blob images used in content
        while ((match = blobUrlRegex.exec(content)) !== null) {
          const fullMatch = match[0];
          const altText = match[1];
          const blobUrl = match[2];

          if (pendingImages.has(blobUrl)) {
            uploads.push({
              blobUrl,
              file: pendingImages.get(blobUrl)!,
              altText,
            });
          }
        }

        // Upload them
        for (const upload of uploads) {
          try {
            const formData = new FormData();
            formData.append("file", upload.file);

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              // Replace blob url with server url in final content
              finalContent = finalContent.replace(upload.blobUrl, data.url);
            }
          } catch (e) {
            console.error("Failed to upload image", e);
          }
        }
      }

      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: finalContent, author }),
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

  const insertMarkdown = (
    prefix: string,
    suffix: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    // If wrapping with same characters (toggle behavior check could be added here, but simple insertion is safer for now)
    const newText =
      text.substring(0, start) +
      prefix +
      (selectedText || placeholder) +
      suffix +
      text.substring(end);

    setContent(newText);

    // Restore focus and update cursor
    setTimeout(() => {
      textarea.focus();
      // If text was selected, keep it selected inside the tags
      if (selectedText.length > 0) {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      } else {
        // If placeholder inserted, select the placeholder so user can type over it
        const newCursorPos = start + prefix.length;
        textarea.setSelectionRange(
          newCursorPos,
          newCursorPos + placeholder.length
        );
      }
    }, 0);
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = parseInt(e.target.value);
    if (level > 0) {
      insertMarkdown("#".repeat(level) + " ", "", "Heading");
      // Reset select to default
      e.target.value = "0";
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    let imageFile: File | null = null;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        imageFile = items[i].getAsFile();
        break;
      }
    }

    if (imageFile) {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return;

      // Create object URL
      const objectUrl = URL.createObjectURL(imageFile);

      // Store file in pending images
      setPendingImages((prev) => new Map(prev).set(objectUrl, imageFile!));

      // Insert markdown with blob URL
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const imageMarkdown = `![Image](${objectUrl})`;

      const newText =
        content.substring(0, start) + imageMarkdown + content.substring(end);

      setContent(newText);
      return;
    }

    // Check for HTML content to convert to Markdown
    const html = e.clipboardData.getData("text/html");
    if (html) {
      e.preventDefault();
      const turndownService = new TurndownService();
      // Configure turndown to handle specific tags if needed
      turndownService.addRule("codeBlock", {
        filter: "pre",
        replacement: function (content: string) {
          return "```\n" + content + "\n```";
        },
      });

      const markdown = turndownService.turndown(html);

      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText =
        content.substring(0, start) + markdown + content.substring(end);

      setContent(newText);

      // Update cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + markdown.length,
          start + markdown.length
        );
      }, 0);
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
                <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all bg-white">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-1 border-r border-slate-300 pr-2 mr-1">
                      <HeadingIcon className="w-4 h-4 text-slate-500" />
                      <select
                        onChange={handleHeadingChange}
                        defaultValue="0"
                        className="bg-transparent text-sm text-slate-700 focus:outline-none cursor-pointer w-24"
                        title="Heading Level"
                      >
                        <option value="0">Normal</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                        <option value="4">Heading 4</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => insertMarkdown("**", "**", "bold text")}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("*", "*", "italic text")}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("> ", "", "quote")}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("`", "`", "code")}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="Inline Code"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("[", "](url)", "link text")}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdown(
                          "![",
                          "](https://example.com/image.jpg)",
                          "alt text"
                        )
                      }
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("- ", "", "list item")}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                      title="List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Start writing your story..."
                    rows={15}
                    className="w-full px-4 py-3 outline-none resize-y font-mono text-sm"
                    required
                  />
                </div>
              ) : (
                <div className="w-full px-4 py-3 border border-slate-200 rounded-lg min-h-[300px] prose prose-slate max-w-none overflow-y-auto bg-white">
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <p className="text-slate-400 italic">
                      Nothing to preview yet...
                    </p>
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
