"use client";

import React, { useEffect, useState } from "react";
import DocumentUploader from "./DocumentUploader";
import Chatbot from "./Chatbot";

interface DocMeta {
  filename: string;
  count: number;
}

const AdminPanel: React.FC = () => {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<null | { email: string; adminId?: string }>(
    null
  );
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    action: "login",
  });

  // Sitemap crawling state
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [sitemapStatus, setSitemapStatus] = useState<string | null>(null);
  const [sitemapResult, setSitemapResult] = useState<{
    crawled: number;
    totalChunks: number;
    pages: string[];
  } | null>(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);

  // Sitemaps management state
  interface SitemapMeta {
    sitemapUrl: string;
    count: number;
    firstCrawled: string;
    urls: string[];
  }
  const [sitemaps, setSitemaps] = useState<SitemapMeta[]>([]);
  const [sitemapsLoading, setSitemapsLoading] = useState(false);
  const [sitemapsError, setSitemapsError] = useState("");
  const [sitemapsPage, setSitemapsPage] = useState(1);
  const [sitemapsTotal, setSitemapsTotal] = useState(0);
  const [expandedSitemap, setExpandedSitemap] = useState<string | null>(null);
  const SITEMAPS_PAGE_SIZE = 5;

  // Admin-only: sitemap URL dropdown for testing
  const [sitemapUrls, setSitemapUrls] = useState<
    { url: string; crawled?: boolean }[]
  >([]);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string>("");

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      setAuthError("");
      try {
        const res = await fetch("/api/auth/verify");
        if (res.ok) {
          const data = await res.json();
          setAuth({ email: data.email, adminId: data.adminId });
        } else {
          setAuth(null);
        }
      } catch {
        setAuth(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Auth form submit
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: form.action,
          email: form.email,
          password: form.password,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuth({ email: form.email, adminId: data.adminId });
      } else {
        const data = await res.json();
        setAuthError(data.error || "Auth failed");
      }
    } catch {
      setAuthError("Auth failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch docs only if authenticated
  const fetchDocs = async () => {
    setLoading(true);
    setError("");
    try {
      // Try to fetch uploaded documents first
      const res = await fetch("/api/admin-docs?admin=1");
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        setDocs(data.documents || []);
      } else {
        // If no uploaded documents, fetch crawled pages as fallback
        const sitemapRes = await fetch("/api/sitemap?page=1&pageSize=100");
        const sitemapData = await sitemapRes.json();
        if (sitemapData.sitemaps && sitemapData.sitemaps.length > 0) {
          // Map crawled sitemaps to DocMeta format
          setDocs(
            sitemapData.sitemaps.map((s: any) => ({
              filename: s.sitemapUrl,
              count: s.count,
            }))
          );
        } else {
          setDocs([]);
        }
      }
    } catch {
      setError("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth) fetchDocs();
  }, [auth]);

  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Delete ${filename}?`)) return;
    setLoading(true);
    setError("");
    try {
      await fetch(
        `/api/admin-docs?admin=1&filename=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        }
      );
      fetchDocs();
    } catch {
      setError("Failed to delete document");
      setLoading(false);
    }
  };

  // Refresh doc list after upload
  const handleUploadDone = () => {
    fetchDocs();
  };

  // Sitemap submission handler
  const handleSitemapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSitemapStatus(null);
    setSitemapResult(null);
    setSitemapLoading(true);
    try {
      const res = await fetch("/api/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitemapUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setSitemapResult(data);
        setSitemapStatus(
          `Crawled ${data.crawled} pages, ${data.totalChunks} chunks.\n` +
            (typeof data.batchDone === "number" &&
            typeof data.totalRemaining === "number"
              ? `Batch: ${data.batchDone} crawled, ${data.totalRemaining} remaining.`
              : "")
        );
        setSitemapUrl(sitemapUrl); // Prefill the input with the just-crawled URL
      } else {
        setSitemapStatus(data.error || "Failed to crawl sitemap");
        console.error("Sitemap crawl error:", data.error || data);
      }
    } catch (err) {
      setSitemapStatus("Failed to crawl sitemap");
      console.error("Sitemap crawl exception:", err);
    } finally {
      setSitemapLoading(false);
    }
  };

  const fetchSitemaps = async (page = 1) => {
    setSitemapsLoading(true);
    setSitemapsError("");
    try {
      const res = await fetch(
        `/api/sitemap?page=${page}&pageSize=${SITEMAPS_PAGE_SIZE}`
      );
      const data = await res.json();
      if (res.ok) {
        setSitemaps(data.sitemaps);
        setSitemapsTotal(data.total);
        setSitemapsPage(data.page);
      } else {
        setSitemapsError(data.error || "Failed to fetch sitemaps");
      }
    } catch {
      setSitemapsError("Failed to fetch sitemaps");
    } finally {
      setSitemapsLoading(false);
    }
  };

  useEffect(() => {
    if (auth) fetchSitemaps();
  }, [auth]);

  const handleDeleteSitemap = async (sitemapUrl: string) => {
    if (!window.confirm(`Delete all pages for sitemap?\n${sitemapUrl}`)) return;
    setSitemapsLoading(true);
    try {
      const res = await fetch("/api/sitemap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitemapUrl }),
      });
      await res.json();
      fetchSitemaps(sitemapsPage);
    } catch {
      setSitemapsError("Failed to delete sitemap");
      setSitemapsLoading(false);
    }
  };

  const handleDeletePage = async (url: string) => {
    if (!window.confirm(`Delete crawled page?\n${url}`)) return;
    setSitemapsLoading(true);
    try {
      const res = await fetch("/api/sitemap", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      await res.json();
      fetchSitemaps(sitemapsPage);
    } catch {
      setSitemapsError("Failed to delete page");
      setSitemapsLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuth(null);
  };

  useEffect(() => {
    if (auth) {
      // Fetch last submitted sitemapUrl from admin settings
      fetch("/api/sitemap?settings=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.settings && data.settings.lastSitemapUrl) {
            setSitemapUrl(data.settings.lastSitemapUrl);
          }
        });
      fetch("/api/sitemap?urls=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.urls) setSitemapUrls(data.urls);
        });
    }
  }, [auth]);

  if (authLoading) return <div>Checking authentication...</div>;
  if (!auth) {
    return (
      <div
        style={{
          border: "2px solid #0070f3",
          padding: 20,
          borderRadius: 10,
          marginBottom: 32,
        }}
      >
        <h2>Admin Login / Register</h2>
        <form onSubmit={handleAuth} style={{ marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            style={{ marginRight: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
            style={{ marginRight: 8 }}
          />
          <select
            value={form.action}
            onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
            style={{ marginRight: 8 }}
          >
            <option value="login">Login</option>
            <option value="register">Register</option>
          </select>
          <button type="submit" disabled={authLoading}>
            {authLoading
              ? "Please wait..."
              : form.action === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
        {authError && <div style={{ color: "red" }}>{authError}</div>}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "2px solid #0070f3",
        padding: 20,
        borderRadius: 10,
        marginBottom: 32,
      }}
    >
      <h2>Admin Panel</h2>
      <div style={{ marginBottom: 12 }}>
        Logged in as <b>{auth.email}</b>
        <button style={{ marginLeft: 16 }} onClick={handleLogout}>
          Logout
        </button>
      </div>
      {/* Sitemap Submission Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <h3>Submit Sitemap</h3>
        <form onSubmit={handleSitemapSubmit} style={{ marginBottom: 8 }}>
          <input
            type="url"
            placeholder="https://example.com/sitemap.xml"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            required
            style={{ width: 320, marginRight: 8 }}
            disabled={sitemapLoading}
          />
          <button type="submit" disabled={sitemapLoading || !sitemapUrl}>
            {sitemapLoading ? "Crawling..." : "Crawl Sitemap"}
          </button>
        </form>
        {sitemapStatus && (
          <div
            style={{
              marginTop: 8,
              whiteSpace: "pre-line",
              color:
                sitemapStatus.toLowerCase().includes("fail") ||
                sitemapStatus.toLowerCase().includes("error")
                  ? "#b00020"
                  : undefined,
              background:
                sitemapStatus.toLowerCase().includes("fail") ||
                sitemapStatus.toLowerCase().includes("error")
                  ? "#ffeaea"
                  : undefined,
              border:
                sitemapStatus.toLowerCase().includes("fail") ||
                sitemapStatus.toLowerCase().includes("error")
                  ? "1px solid #b00020"
                  : undefined,
              padding:
                sitemapStatus.toLowerCase().includes("fail") ||
                sitemapStatus.toLowerCase().includes("error")
                  ? "8px 12px"
                  : undefined,
              borderRadius: 4,
            }}
          >
            {sitemapStatus}
          </div>
        )}
        {sitemapResult &&
          sitemapResult.pages &&
          sitemapResult.pages.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <b>Crawled URLs:</b>
              <ul style={{ maxHeight: 120, overflowY: "auto", fontSize: 13 }}>
                {sitemapResult.pages.map((url) => (
                  <li key={url} style={{ wordBreak: "break-all" }}>
                    {url}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
      {/* Sitemap Management Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <h3>Crawled Sitemaps</h3>
        {sitemapsLoading && <div>Loading...</div>}
        {sitemapsError && <div style={{ color: "red" }}>{sitemapsError}</div>}
        {sitemaps.length === 0 && !sitemapsLoading && (
          <div>No sitemaps crawled yet.</div>
        )}
        {sitemaps.map((s) => (
          <div
            key={s.sitemapUrl}
            style={{
              marginBottom: 12,
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontWeight: 500, flex: 1 }}>{s.sitemapUrl}</span>
              <span style={{ fontSize: 12, color: "#666", marginLeft: 8 }}>
                {s.count} pages, crawled{" "}
                {new Date(s.firstCrawled).toLocaleString()}
              </span>
              <button
                style={{ marginLeft: 12 }}
                onClick={() =>
                  setExpandedSitemap(
                    expandedSitemap === s.sitemapUrl ? null : s.sitemapUrl
                  )
                }
              >
                {expandedSitemap === s.sitemapUrl ? "Hide" : "Show"} Pages
              </button>
              <button
                style={{ marginLeft: 8, color: "red" }}
                onClick={() => handleDeleteSitemap(s.sitemapUrl)}
              >
                Delete Sitemap
              </button>
            </div>
            {expandedSitemap === s.sitemapUrl && (
              <ul
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 13,
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                {s.urls.map((url: string) => (
                  <li
                    key={url}
                    style={{ wordBreak: "break-all", marginBottom: 4 }}
                  >
                    {url}
                    <button
                      style={{ marginLeft: 8, color: "red" }}
                      onClick={() => handleDeletePage(url)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {/* Pagination Controls */}
        {sitemapsTotal > SITEMAPS_PAGE_SIZE && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => fetchSitemaps(sitemapsPage - 1)}
              disabled={sitemapsPage === 1 || sitemapsLoading}
              style={{ marginRight: 8 }}
            >
              Previous
            </button>
            <span style={{ fontSize: 13 }}>
              Page {sitemapsPage} of{" "}
              {Math.ceil(sitemapsTotal / SITEMAPS_PAGE_SIZE)}
            </span>
            <button
              onClick={() => fetchSitemaps(sitemapsPage + 1)}
              disabled={
                sitemapsPage ===
                  Math.ceil(sitemapsTotal / SITEMAPS_PAGE_SIZE) ||
                sitemapsLoading
              }
              style={{ marginLeft: 8 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
      {/* Admin-only: Sitemap URL dropdown for testing */}
      {auth && sitemapUrls.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="sitemap-url-dropdown">
            <b>Test as if user is on page:</b>
          </label>
          <select
            id="sitemap-url-dropdown"
            value={selectedPageUrl}
            onChange={(e) => setSelectedPageUrl(e.target.value)}
            style={{ marginLeft: 8, minWidth: 300 }}
          >
            <option value="">(Select a page URL)</option>
            {sitemapUrls.map((u) => (
              <option key={u.url} value={u.url}>
                {u.url} {u.crawled ? "(crawled)" : "(not crawled)"}
              </option>
            ))}
          </select>
        </div>
      )}
      <Chatbot pageUrl={selectedPageUrl || undefined} adminId={auth.adminId} />
      <DocumentUploader onUploadDone={handleUploadDone} />
      <h4>Uploaded Documents</h4>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {docs.map((doc) => (
          <li key={doc.filename} style={{ marginBottom: 8 }}>
            <b>{doc.filename}</b> ({doc.count} chunks)
            <button
              style={{ marginLeft: 12, color: "red" }}
              onClick={() => handleDelete(doc.filename)}
              disabled={loading}
            >
              Delete
            </button>
          </li>
        ))}
        {docs.length === 0 && !loading && (
          <li>No documents uploaded or crawled.</li>
        )}
      </ul>
    </div>
  );
};

export default AdminPanel;
