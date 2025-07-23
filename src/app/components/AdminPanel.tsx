"use client";

import React, { useEffect, useState, useCallback } from "react";
import DocumentUploader from "./DocumentUploader";
import Chatbot from "./Chatbot";

const AdminPanel: React.FC = () => {
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
  const [sitemapLoading, setSitemapLoading] = useState(false);

  // Page URL dropdown state
  const [sitemapUrls, setSitemapUrls] = useState<
    { url: string; crawled: boolean }[]
  >([]);
  const [selectedPageUrl, setSelectedPageUrl] = useState("");

  // API Key management state
  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCreated, setApiKeyCreated] = useState<string>("");

  // Leads management state
  interface Lead {
    email: string;
    firstSeen: string;
    lastSeen: string;
    messageCount: number;
    sessionId: string;
    latestContent: string | { mainText: string };
    latestRole: string;
  }
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsTotalPages, setLeadsTotalPages] = useState(0);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsSortBy, setLeadsSortBy] = useState("lastSeen");
  const [leadsSortOrder, setLeadsSortOrder] = useState("desc");
  const LEADS_PAGE_SIZE = 10;

  // Widget configuration state
  const [widgetConfig, setWidgetConfig] = useState({
    theme: "blue",
    size: "medium",
    position: "bottom-right",
    chatTitle: "Chat with us",
    buttonText: "💬",
    welcomeMessage: "",
    customColor: "#0070f3",
  });

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
        }
      } catch {
        // Not authenticated
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

  // Sitemap submission handler
  const handleSitemapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSitemapStatus(null);
    setSitemapLoading(true);
    try {
      const res = await fetch("/api/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitemapUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setSitemapStatus(
          `Success: Crawled ${data.crawled} pages, ${data.totalChunks} total chunks`
        );
      } else {
        setSitemapStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setSitemapStatus("Failed to crawl sitemap");
      console.error("Sitemap crawl exception:", err);
    } finally {
      setSitemapLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuth(null);
  };

  // API Key management functions
  const fetchApiKey = async () => {
    try {
      const res = await fetch("/api/auth/api-key");
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey || "");
        setApiKeyCreated(data.apiKeyCreated || "");
      }
    } catch (error) {
      console.error("Failed to fetch API key:", error);
    }
  };

  const generateApiKey = async () => {
    setApiKeyLoading(true);
    setApiKeyError("");
    try {
      const res = await fetch("/api/auth/api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey);
        setApiKeyCreated(new Date().toISOString());
        setShowApiKey(true);
      } else {
        setApiKeyError(data.error || "Failed to generate API key");
      }
    } catch {
      setApiKeyError("Failed to generate API key");
    } finally {
      setApiKeyLoading(false);
    }
  };

  // Generate widget script with current configuration
  const generateWidgetScript = () => {
    let script = `<script src="${window.location.origin}/api/widget" data-api-key="${apiKey}"`;

    if (widgetConfig.theme !== "blue") {
      script += ` data-theme="${widgetConfig.theme}"`;
    }
    if (widgetConfig.size !== "medium") {
      script += ` data-size="${widgetConfig.size}"`;
    }
    if (widgetConfig.position !== "bottom-right") {
      script += ` data-position="${widgetConfig.position}"`;
    }
    if (widgetConfig.chatTitle !== "Chat with us") {
      script += ` data-chat-title="${widgetConfig.chatTitle}"`;
    }
    if (widgetConfig.buttonText !== "💬") {
      script += ` data-button-text="${widgetConfig.buttonText}"`;
    }
    if (widgetConfig.welcomeMessage) {
      script += ` data-welcome-message="${widgetConfig.welcomeMessage}"`;
    }
    if (widgetConfig.theme === "custom") {
      script += ` data-brand-color="${widgetConfig.customColor}"`;
    }

    script += `></script>`;
    return script;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Leads management functions
  const fetchLeads = useCallback(
    async (page = 1, search = leadsSearch) => {
      setLeadsLoading(true);
      setLeadsError("");
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: LEADS_PAGE_SIZE.toString(),
          sortBy: leadsSortBy,
          sortOrder: leadsSortOrder,
          ...(search && { search }),
        });

        const res = await fetch(`/api/leads?${params}`);
        const data = await res.json();

        if (res.ok) {
          setLeads(data.leads || []);
          setLeadsPage(data.page || 1);
          setLeadsTotal(data.total || 0);
          setLeadsTotalPages(data.totalPages || 0);
        } else {
          setLeadsError(data.error || "Failed to fetch leads");
        }
      } catch (error) {
        setLeadsError("Failed to fetch leads");
        console.error("Error fetching leads:", error);
      } finally {
        setLeadsLoading(false);
      }
    },
    [leadsSearch, leadsSortBy, leadsSortOrder, LEADS_PAGE_SIZE]
  );

  const deleteLead = async (email: string) => {
    if (!window.confirm(`Delete all conversation data for ${email}?`)) return;

    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        fetchLeads(leadsPage); // Refresh current page
      } else {
        const data = await res.json();
        setLeadsError(data.error || "Failed to delete lead");
      }
    } catch (error) {
      setLeadsError("Failed to delete lead");
      console.error("Error deleting lead:", error);
    }
  };

  const handleLeadsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadsPage(1);
    fetchLeads(1, leadsSearch);
  };

  useEffect(() => {
    if (auth) {
      // Fetch last submitted sitemapUrl from admin settings
      fetch("/api/sitemap?settings=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.lastSitemapUrl) setSitemapUrl(data.lastSitemapUrl);
        });
      fetch("/api/sitemap?urls=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.urls) setSitemapUrls(data.urls);
        });

      // Fetch current API key
      fetchApiKey();

      // Fetch leads
      fetchLeads();
    }
  }, [auth, fetchLeads]);

  if (authLoading)
    return (
      <div
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "20px",
        }}
      >
        Checking authentication...
      </div>
    );
  if (!auth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "40px",
            width: "100%",
            maxWidth: "400px",
            boxShadow:
              "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Logo/Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
              }}
            >
              <span
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                🤖
              </span>
            </div>
            <h2
              style={{
                color: "#2d3748",
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 8px 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Admin Portal
            </h2>
            <p style={{ color: "#718096", fontSize: "14px", margin: 0 }}>
              {form.action === "login"
                ? "Welcome back!"
                : "Create your account"}
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div
              style={{
                background: "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
                color: "white",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "24px",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(245, 101, 101, 0.3)",
              }}
            >
              {authError}
            </div>
          )}

          {/* Auth Mode Toggle */}
          <div
            style={{
              background: "#f7fafc",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "24px",
              display: "flex",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setForm({ ...form, action: "login" })}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: form.action === "login" ? "white" : "transparent",
                color: form.action === "login" ? "#667eea" : "#718096",
                fontWeight: form.action === "login" ? "600" : "400",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  form.action === "login"
                    ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                    : "none",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, action: "register" })}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background:
                  form.action === "register" ? "white" : "transparent",
                color: form.action === "register" ? "#667eea" : "#718096",
                fontWeight: form.action === "register" ? "600" : "400",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow:
                  form.action === "register"
                    ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                    : "none",
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2d3748",
                  background: "white",
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2d3748",
                  background: "white",
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: authLoading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: authLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: authLoading
                  ? "none"
                  : "0 4px 12px rgba(102, 126, 234, 0.4)",
                transform: authLoading ? "none" : "translateY(0)",
              }}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "translateY(-2px)";
                  target.style.boxShadow =
                    "0 6px 16px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!authLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "translateY(0)";
                  target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.4)";
                }
              }}
            >
              {authLoading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #ffffff30",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      marginRight: "8px",
                    }}
                  ></span>
                  Processing...
                </span>
              ) : form.action === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <p style={{ color: "#718096", fontSize: "12px", margin: 0 }}>
              {form.action === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <span
                onClick={() =>
                  setForm({
                    ...form,
                    action: form.action === "login" ? "register" : "login",
                  })
                }
                style={{
                  color: "#667eea",
                  cursor: "pointer",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                {form.action === "login" ? "Sign up" : "Sign in"}
              </span>
            </p>
          </div>
        </div>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "24px 32px",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🚀 Admin Dashboard
            </h1>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#718096",
                fontSize: "16px",
              }}
            >
              Welcome back, <strong>{auth.email}</strong>
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(238, 90, 82, 0.3)",
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.transform = "translateY(-2px)";
              target.style.boxShadow = "0 6px 16px rgba(238, 90, 82, 0.4)";
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.transform = "translateY(0)";
              target.style.boxShadow = "0 4px 12px rgba(238, 90, 82, 0.3)";
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Content Crawling Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2d3748",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              🌐 Website Content Crawling
            </h2>
            <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
              Paste any webpage URL to automatically discover and crawl content
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #667eea10, #764ba210)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: "#4a5568",
                fontSize: "18px",
              }}
            >
              Supported URL Types:
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "12px",
              }}
            >
              {[
                {
                  icon: "📄",
                  title: "Sitemap.xml",
                  desc: "Traditional XML sitemap for comprehensive crawling",
                },
                {
                  icon: "🏠",
                  title: "Homepage",
                  desc: "Discovers all linked pages from your main page",
                },
                {
                  icon: "❓",
                  title: "Help Center",
                  desc: "Crawls all articles from your support page",
                },
                {
                  icon: "📝",
                  title: "Blog Index",
                  desc: "Discovers and crawls all blog posts",
                },
                {
                  icon: "🔗",
                  title: "Any Page",
                  desc: "Extracts all same-domain links found",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "12px",
                    padding: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "8px" }}>
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#2d3748",
                      marginBottom: "4px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: "14px", color: "#718096" }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSitemapSubmit} style={{ marginBottom: "16px" }}>
            <div
              style={{ display: "flex", gap: "12px", alignItems: "stretch" }}
            >
              <input
                type="url"
                placeholder="https://example.com/sitemap.xml or any webpage URL"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                required
                disabled={sitemapLoading}
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  color: "#2d3748",
                  background: "white",
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={sitemapLoading || !sitemapUrl}
                style={{
                  padding: "16px 24px",
                  background:
                    sitemapLoading || !sitemapUrl
                      ? "#a0aec0"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor:
                    sitemapLoading || !sitemapUrl ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow:
                    sitemapLoading || !sitemapUrl
                      ? "none"
                      : "0 4px 12px rgba(102, 126, 234, 0.4)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!sitemapLoading && sitemapUrl) {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = "translateY(-2px)";
                    target.style.boxShadow =
                      "0 6px 16px rgba(102, 126, 234, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!sitemapLoading && sitemapUrl) {
                    const target = e.target as HTMLButtonElement;
                    target.style.transform = "translateY(0)";
                    target.style.boxShadow =
                      "0 4px 12px rgba(102, 126, 234, 0.4)";
                  }
                }}
              >
                {sitemapLoading ? "🔄 Discovering..." : "🚀 Crawl Website"}
              </button>
            </div>
          </form>

          {sitemapStatus && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background:
                  sitemapStatus.toLowerCase().includes("fail") ||
                  sitemapStatus.toLowerCase().includes("error")
                    ? "linear-gradient(135deg, #fed7d7, #feb2b2)"
                    : "linear-gradient(135deg, #c6f6d5, #9ae6b4)",
                border:
                  "1px solid " +
                  (sitemapStatus.toLowerCase().includes("fail") ||
                  sitemapStatus.toLowerCase().includes("error")
                    ? "#fc8181"
                    : "#68d391"),
                color:
                  sitemapStatus.toLowerCase().includes("fail") ||
                  sitemapStatus.toLowerCase().includes("error")
                    ? "#742a2a"
                    : "#22543d",
                whiteSpace: "pre-line",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {sitemapStatus}
            </div>
          )}
        </div>

        {/* API Key Management Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2d3748",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              🔐 Website Integration
            </h2>
            <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
              Use these credentials to embed the chatbot on your website
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "24px",
              marginBottom: "24px",
            }}
          >
            {/* API Key Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea10, #764ba210)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  color: "#4a5568",
                  fontSize: "18px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🔑 API Key
              </h3>
              {apiKey ? (
                <div>
                  <div style={{ marginBottom: "12px" }}>
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      style={{
                        width: "100%",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: "#f7fafc",
                        color: "#2d3748",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{
                        padding: "8px 16px",
                        background: showApiKey ? "#e2e8f0" : "#4299e1",
                        color: showApiKey ? "#2d3748" : "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {showApiKey ? "👁️ Hide" : "👁️ Show"}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey)}
                      style={{
                        padding: "8px 16px",
                        background: "#48bb78",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  {apiKeyCreated && (
                    <div style={{ fontSize: "12px", color: "#718096" }}>
                      Created: {new Date(apiKeyCreated).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p
                    style={{
                      color: "#718096",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    No API key generated yet. Create one to start integrating.
                  </p>
                </div>
              )}

              <button
                onClick={generateApiKey}
                disabled={apiKeyLoading}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  marginTop: "16px",
                  background: apiKeyLoading
                    ? "#a0aec0"
                    : apiKey
                    ? "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"
                    : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: apiKeyLoading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: apiKeyLoading
                    ? "none"
                    : "0 4px 12px rgba(72, 187, 120, 0.3)",
                }}
              >
                {apiKeyLoading
                  ? "⏳ Generating..."
                  : apiKey
                  ? "🔄 Regenerate"
                  : "✨ Generate API Key"}
              </button>

              {apiKeyError && (
                <div
                  style={{
                    color: "#e53e3e",
                    fontSize: "14px",
                    marginTop: "12px",
                    padding: "8px 12px",
                    background: "#fed7d7",
                    borderRadius: "8px",
                  }}
                >
                  {apiKeyError}
                </div>
              )}
            </div>

            {/* Widget Script Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #e6fffa10, #b2f5ea10)",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  color: "#4a5568",
                  fontSize: "18px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📝 Widget Script
              </h3>
              <p
                style={{
                  color: "#718096",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                Add this script tag to your website to embed the chatbot
              </p>
              {apiKey ? (
                <div>
                  <textarea
                    readOnly
                    value={`<script src="${window.location.origin}/api/widget" data-api-key="${apiKey}"></script>`}
                    style={{
                      width: "100%",
                      height: "80px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      padding: "12px 16px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "#f7fafc",
                      resize: "none",
                      color: "#2d3748",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `<script src="${window.location.origin}/api/widget" data-api-key="${apiKey}"></script>`
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      marginTop: "12px",
                      background:
                        "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    📋 Copy Script
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    color: "#718096",
                    fontSize: "14px",
                    padding: "40px 20px",
                    textAlign: "center",
                    background: "#f7fafc",
                    borderRadius: "8px",
                    border: "2px dashed #e2e8f0",
                  }}
                >
                  Generate an API key first to get the widget script
                </div>
              )}
            </div>
          </div>

          {/* Interactive Widget Configurator */}
          {apiKey && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#2d3748",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🎨 Widget Configurator
              </h3>
              <p
                style={{
                  color: "#718096",
                  fontSize: "14px",
                  marginBottom: "24px",
                }}
              >
                Customize your widget appearance and get the script
                automatically updated
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                {/* Configuration Options */}
                <div>
                  {/* Theme Selection */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2d3748",
                      }}
                    >
                      🎯 Theme
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "8px",
                      }}
                    >
                      {[
                        { name: "blue", color: "#0070f3", label: "Blue" },
                        { name: "green", color: "#10b981", label: "Green" },
                        { name: "purple", color: "#8b5cf6", label: "Purple" },
                        { name: "orange", color: "#f59e0b", label: "Orange" },
                        { name: "dark", color: "#1f2937", label: "Dark" },
                        { name: "custom", color: "#ff6b35", label: "Custom" },
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() =>
                            setWidgetConfig({
                              ...widgetConfig,
                              theme: theme.name,
                            })
                          }
                          style={{
                            padding: "8px",
                            background:
                              widgetConfig.theme === theme.name
                                ? "linear-gradient(135deg, #667eea, #764ba2)"
                                : "rgba(255, 255, 255, 0.8)",
                            border:
                              widgetConfig.theme === theme.name
                                ? "2px solid #667eea"
                                : "1px solid rgba(255, 255, 255, 0.4)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "11px",
                            color:
                              widgetConfig.theme === theme.name
                                ? "white"
                                : "#4a5568",
                            fontWeight:
                              widgetConfig.theme === theme.name
                                ? "600"
                                : "normal",
                            transition: "all 0.2s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              background: theme.color,
                              borderRadius: "50%",
                            }}
                          ></div>
                          {theme.label}
                        </button>
                      ))}
                    </div>
                    {widgetConfig.theme === "custom" && (
                      <div style={{ marginTop: "8px" }}>
                        <input
                          type="color"
                          value={widgetConfig.customColor}
                          onChange={(e) =>
                            setWidgetConfig({
                              ...widgetConfig,
                              customColor: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            height: "40px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Size Selection */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2d3748",
                      }}
                    >
                      📏 Size
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {[
                        { name: "small", label: "Small", size: "300×400" },
                        { name: "medium", label: "Medium", size: "350×500" },
                        { name: "large", label: "Large", size: "400×600" },
                      ].map((size) => (
                        <button
                          key={size.name}
                          onClick={() =>
                            setWidgetConfig({
                              ...widgetConfig,
                              size: size.name,
                            })
                          }
                          style={{
                            flex: 1,
                            padding: "12px",
                            background:
                              widgetConfig.size === size.name
                                ? "linear-gradient(135deg, #667eea, #764ba2)"
                                : "rgba(255, 255, 255, 0.8)",
                            border:
                              widgetConfig.size === size.name
                                ? "2px solid #667eea"
                                : "1px solid rgba(255, 255, 255, 0.4)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            color:
                              widgetConfig.size === size.name
                                ? "white"
                                : "#4a5568",
                            fontWeight:
                              widgetConfig.size === size.name
                                ? "600"
                                : "normal",
                            transition: "all 0.2s ease",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontWeight: "600" }}>{size.label}</div>
                          <div style={{ fontSize: "10px", marginTop: "2px" }}>
                            {size.size}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position Selection */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2d3748",
                      }}
                    >
                      📍 Position
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      {[
                        { name: "bottom-right", label: "Bottom Right" },
                        { name: "bottom-left", label: "Bottom Left" },
                        { name: "top-right", label: "Top Right" },
                        { name: "top-left", label: "Top Left" },
                      ].map((position) => (
                        <button
                          key={position.name}
                          onClick={() =>
                            setWidgetConfig({
                              ...widgetConfig,
                              position: position.name,
                            })
                          }
                          style={{
                            padding: "10px",
                            background:
                              widgetConfig.position === position.name
                                ? "linear-gradient(135deg, #667eea, #764ba2)"
                                : "rgba(255, 255, 255, 0.8)",
                            border:
                              widgetConfig.position === position.name
                                ? "2px solid #667eea"
                                : "1px solid rgba(255, 255, 255, 0.4)",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "12px",
                            color:
                              widgetConfig.position === position.name
                                ? "white"
                                : "#4a5568",
                            fontWeight:
                              widgetConfig.position === position.name
                                ? "600"
                                : "normal",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {position.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Customization */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2d3748",
                      }}
                    >
                      💬 Chat Title
                    </label>
                    <input
                      type="text"
                      value={widgetConfig.chatTitle}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          chatTitle: e.target.value,
                        })
                      }
                      placeholder="Chat with us"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2d3748",
                      }}
                    >
                      🔘 Button Text
                    </label>
                    <input
                      type="text"
                      value={widgetConfig.buttonText}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          buttonText: e.target.value,
                        })
                      }
                      placeholder="💬"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2d3748",
                      }}
                    >
                      � Welcome Message (Optional)
                    </label>
                    <input
                      type="text"
                      value={widgetConfig.welcomeMessage}
                      onChange={(e) =>
                        setWidgetConfig({
                          ...widgetConfig,
                          welcomeMessage: e.target.value,
                        })
                      }
                      placeholder="Hi! How can we help you today?"
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Generated Script */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2d3748",
                    }}
                  >
                    🚀 Your Customized Script
                  </label>
                  <textarea
                    readOnly
                    value={generateWidgetScript()}
                    style={{
                      width: "100%",
                      height: "200px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      backgroundColor: "#f7fafc",
                      resize: "none",
                      color: "#2d3748",
                      boxSizing: "border-box",
                      marginBottom: "12px",
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(generateWidgetScript())}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    📋 Copy Customized Script
                  </button>

                  {/* Preview Info */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
                      borderRadius: "8px",
                      border: "1px solid #c7d2fe",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4338ca",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      ✨ Live Preview:
                    </div>
                    <div style={{ fontSize: "11px", color: "#6366f1" }}>
                      • Theme: {widgetConfig.theme}{" "}
                      {widgetConfig.theme === "custom" &&
                        `(${widgetConfig.customColor})`}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6366f1" }}>
                      • Size: {widgetConfig.size}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6366f1" }}>
                      • Position: {widgetConfig.position}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6366f1" }}>
                      • Title: "{widgetConfig.chatTitle}"
                    </div>
                    <div style={{ fontSize: "11px", color: "#6366f1" }}>
                      • Button: "{widgetConfig.buttonText}"
                    </div>
                    {widgetConfig.welcomeMessage && (
                      <div style={{ fontSize: "11px", color: "#6366f1" }}>
                        • Welcome: "{widgetConfig.welcomeMessage}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How it works */}
          <div
            style={{
              background: "linear-gradient(135deg, #edf2f710, #e2e8f010)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: "#4a5568",
                fontSize: "18px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ⚡ How it works
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "16px",
              }}
            >
              {[
                "🎯 Automatically detects which page the user is viewing",
                "💬 Provides contextual responses based on your crawled content",
                "👤 Links all conversations to your admin account",
                "📧 Collects user emails for lead generation",
                "⏰ Sends automatic followup messages",
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    color: "#4a5568",
                    fontSize: "14px",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.6)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Security Note */}
          <div
            style={{
              background: "linear-gradient(135deg, #fef5e7, #fed7aa)",
              border: "1px solid #f6ad55",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
            >
              <span style={{ fontSize: "20px" }}>🔒</span>
              <div>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    color: "#744210",
                    fontSize: "16px",
                  }}
                >
                  Security Best Practices
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#744210" }}>
                  Keep your API key secure and never expose it in client-side
                  code. The widget script handles authentication automatically.
                  Regenerate your API key if you suspect it has been
                  compromised.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Management Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "32px",
            marginBottom: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
                color: "#2d3748",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              📧 Lead Management
            </h2>
            <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
              Track and manage leads generated from chatbot conversations
            </p>
          </div>

          {/* Search and Controls */}
          <div
            style={{
              background: "linear-gradient(135deg, #f7fafc10, #edf2f710)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              <form
                onSubmit={handleLeadsSearch}
                style={{ display: "flex", gap: "8px", flex: "1 1 300px" }}
              >
                <input
                  type="text"
                  placeholder="Search by email or message..."
                  value={leadsSearch}
                  onChange={(e) => setLeadsSearch(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#2d3748",
                    background: "white",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 20px",
                    background:
                      "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  🔍 Search
                </button>
              </form>

              <select
                value={leadsSortBy}
                onChange={(e) => {
                  setLeadsSortBy(e.target.value);
                  fetchLeads(1, leadsSearch);
                }}
                style={{
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "white",
                  color: "#2d3748",
                }}
              >
                <option value="lastSeen">Sort by Last Seen</option>
                <option value="firstSeen">Sort by First Seen</option>
                <option value="email">Sort by Email</option>
                <option value="messageCount">Sort by Message Count</option>
              </select>

              <select
                value={leadsSortOrder}
                onChange={(e) => {
                  setLeadsSortOrder(e.target.value);
                  fetchLeads(1, leadsSearch);
                }}
                style={{
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "white",
                  color: "#2d3748",
                }}
              >
                <option value="desc">↓ Descending</option>
                <option value="asc">↑ Ascending</option>
              </select>

              <button
                onClick={() => fetchLeads(leadsPage, leadsSearch)}
                disabled={leadsLoading}
                style={{
                  padding: "12px 20px",
                  background: leadsLoading
                    ? "#a0aec0"
                    : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: leadsLoading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {leadsLoading ? "⏳ Loading..." : "🔄 Refresh"}
              </button>
            </div>

            {/* Stats */}
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(255, 255, 255, 0.7)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "20px" }}>📊</span>
                  <strong style={{ color: "#2d3748" }}>
                    Total Leads: {leadsTotal}
                  </strong>
                </div>
                {leadsTotal > 0 && (
                  <span style={{ color: "#718096", fontSize: "14px" }}>
                    Showing {(leadsPage - 1) * LEADS_PAGE_SIZE + 1} -{" "}
                    {Math.min(leadsPage * LEADS_PAGE_SIZE, leadsTotal)} of{" "}
                    {leadsTotal}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {leadsError && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                border: "1px solid #fc8181",
                color: "#742a2a",
                marginBottom: "24px",
              }}
            >
              {leadsError}
            </div>
          )}

          {/* Leads Content */}
          {leadsLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
                fontSize: "16px",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
                No leads found
              </h3>
              <p style={{ margin: 0, fontSize: "16px" }}>
                Start promoting your chatbot to collect leads!
              </p>
            </div>
          ) : (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
                      }}
                    >
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        📧 Email
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        🆕 First Contact
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        ⏰ Last Activity
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "center",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        💬 Messages
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "left",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        📝 Latest Message
                      </th>
                      <th
                        style={{
                          padding: "16px 20px",
                          textAlign: "center",
                          borderBottom: "2px solid #e2e8f0",
                          color: "#4a5568",
                          fontWeight: "600",
                        }}
                      >
                        ⚡ Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead, index) => (
                      <tr
                        key={lead.email}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#edf2f7";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            index % 2 === 0 ? "#fff" : "#f8fafc";
                        }}
                      >
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #48bb78, #38a169)",
                              }}
                            ></span>
                            <strong style={{ color: "#2d3748" }}>
                              {lead.email}
                            </strong>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#718096",
                          }}
                        >
                          {new Date(lead.firstSeen).toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                            color: "#718096",
                          }}
                        >
                          {new Date(lead.lastSeen).toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                              color: "white",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            {lead.messageCount}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                            maxWidth: "250px",
                          }}
                        >
                          <div
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color:
                                lead.latestRole === "user"
                                  ? "#2d3748"
                                  : "#718096",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "16px",
                                background:
                                  lead.latestRole === "user"
                                    ? "#e6fffa"
                                    : "#f7fafc",
                                padding: "4px 6px",
                                borderRadius: "6px",
                              }}
                            >
                              {lead.latestRole === "user" ? "👤" : "🤖"}
                            </span>
                            <span style={{ fontSize: "13px", flex: 1 }}>
                              {typeof lead.latestContent === "string"
                                ? lead.latestContent
                                : lead.latestContent &&
                                  typeof lead.latestContent === "object" &&
                                  "mainText" in lead.latestContent
                                ? lead.latestContent.mainText
                                : "No content"}
                            </span>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e2e8f0",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() => copyToClipboard(lead.email)}
                              style={{
                                background:
                                  "linear-gradient(135deg, #48bb78, #38a169)",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              title="Copy email"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => deleteLead(lead.email)}
                              style={{
                                background:
                                  "linear-gradient(135deg, #f56565, #e53e3e)",
                                color: "white",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              title="Delete lead"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {leadsTotalPages > 1 && (
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setLeadsPage(1);
                  fetchLeads(1, leadsSearch);
                }}
                disabled={leadsPage === 1}
                style={{
                  padding: "8px 16px",
                  background:
                    leadsPage === 1
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: leadsPage === 1 ? "#a0aec0" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: leadsPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                ⏮️ First
              </button>
              <button
                onClick={() => {
                  const newPage = leadsPage - 1;
                  setLeadsPage(newPage);
                  fetchLeads(newPage, leadsSearch);
                }}
                disabled={leadsPage === 1}
                style={{
                  padding: "8px 16px",
                  background:
                    leadsPage === 1
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: leadsPage === 1 ? "#a0aec0" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: leadsPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                ⬅️ Previous
              </button>
              <span
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#4a5568",
                }}
              >
                Page {leadsPage} of {leadsTotalPages}
              </span>
              <button
                onClick={() => {
                  const newPage = leadsPage + 1;
                  setLeadsPage(newPage);
                  fetchLeads(newPage, leadsSearch);
                }}
                disabled={leadsPage === leadsTotalPages}
                style={{
                  padding: "8px 16px",
                  background:
                    leadsPage === leadsTotalPages
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: leadsPage === leadsTotalPages ? "#a0aec0" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor:
                    leadsPage === leadsTotalPages ? "not-allowed" : "pointer",
                }}
              >
                Next ➡️
              </button>
              <button
                onClick={() => {
                  setLeadsPage(leadsTotalPages);
                  fetchLeads(leadsTotalPages, leadsSearch);
                }}
                disabled={leadsPage === leadsTotalPages}
                style={{
                  padding: "8px 16px",
                  background:
                    leadsPage === leadsTotalPages
                      ? "#e2e8f0"
                      : "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: leadsPage === leadsTotalPages ? "#a0aec0" : "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor:
                    leadsPage === leadsTotalPages ? "not-allowed" : "pointer",
                }}
              >
                Last ⏭️
              </button>
            </div>
          )}

          {/* Export Options */}
          {leads.length > 0 && (
            <div
              style={{
                marginTop: "24px",
                background: "linear-gradient(135deg, #e6fffa10, #b2f5ea10)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px 0",
                  color: "#4a5568",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📊 Export Options
              </h4>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    const csvContent = [
                      [
                        "Email",
                        "First Contact",
                        "Last Activity",
                        "Message Count",
                        "Latest Message",
                      ].join(","),
                      ...leads.map((lead) =>
                        [
                          `"${lead.email}"`,
                          `"${new Date(lead.firstSeen).toLocaleString()}"`,
                          `"${new Date(lead.lastSeen).toLocaleString()}"`,
                          lead.messageCount,
                          `"${(typeof lead.latestContent === "string"
                            ? lead.latestContent
                            : lead.latestContent &&
                              typeof lead.latestContent === "object" &&
                              "mainText" in lead.latestContent
                            ? lead.latestContent.mainText
                            : ""
                          ).replace(/"/g, '""')}"`,
                        ].join(",")
                      ),
                    ].join("\n");

                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `leads-${
                      new Date().toISOString().split("T")[0]
                    }.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #38b2ac, #319795)",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  📥 Export as CSV
                </button>
                <button
                  onClick={() => {
                    const emailList = leads
                      .map((lead) => lead.email)
                      .join(", ");
                    copyToClipboard(emailList);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #805ad5, #6b46c1)",
                    color: "white",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  📋 Copy All Emails
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Testing Section */}
        {auth && sitemapUrls.length > 0 && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              padding: "32px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#2d3748",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                🧪 Chatbot Testing
              </h2>
              <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
                Test your chatbot as if a user is on a specific page
              </p>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #edf2f710, #e2e8f010)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <label
                htmlFor="sitemap-url-dropdown"
                style={{
                  display: "block",
                  color: "#4a5568",
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                🌐 Simulate User on Page:
              </label>
              <select
                id="sitemap-url-dropdown"
                value={selectedPageUrl}
                onChange={(e) => setSelectedPageUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#2d3748",
                  background: "white",
                  outline: "none",
                }}
              >
                <option value="">(Select a page URL to test)</option>
                {sitemapUrls.map((u) => (
                  <option key={u.url} value={u.url}>
                    {u.url} {u.crawled ? "✅ (crawled)" : "⏳ (not crawled)"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Live Chatbot Preview */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#2d3748",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            💬 Live Chatbot Preview
          </h3>
          <Chatbot
            pageUrl={selectedPageUrl || undefined}
            adminId={auth?.adminId}
          />
        </div>

        {/* Document Upload */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#2d3748",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📎 Document Upload
          </h3>
          <DocumentUploader onUploadDone={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
