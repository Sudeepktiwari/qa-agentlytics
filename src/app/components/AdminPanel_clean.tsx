"use client";

import React, { useEffect, useState, useCallback } from "react";
import DocumentUploader from "./DocumentUploader";
import Chatbot from "./Chatbot";

const AdminPanel: React.FC = () => {
  const [auth, setAuth] = useState<null | { email: string; adminId?: string }>(
    null,
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
    visibilityRestricted?: boolean;
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
          `Success: Crawled ${data.crawled} pages, ${data.totalChunks} total chunks`,
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
    [leadsSearch, leadsSortBy, leadsSortOrder, LEADS_PAGE_SIZE],
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
          border: "2px solid #0070f3",
          padding: 20,
          borderRadius: 10,
          marginBottom: 32,
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
      >
        <h2 style={{ color: "#000000" }}>Admin Login / Register</h2>
        {authError && (
          <div style={{ color: "red", marginBottom: 16 }}>{authError}</div>
        )}
        <form onSubmit={handleAuth} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{
                marginLeft: 8,
                padding: 4,
                color: "#000000",
                backgroundColor: "#ffffff",
              }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{
                marginLeft: 8,
                padding: 4,
                color: "#000000",
                backgroundColor: "#ffffff",
              }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              <input
                type="radio"
                value="login"
                checked={form.action === "login"}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
              />
              Login
            </label>
            <label style={{ marginLeft: 16 }}>
              <input
                type="radio"
                value="register"
                checked={form.action === "register"}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
              />
              Register
            </label>
          </div>
          <button type="submit" disabled={authLoading}>
            {authLoading
              ? "Processing..."
              : form.action === "login"
                ? "Login"
                : "Register"}
          </button>
        </form>
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
        <h3>Submit Sitemap or Website URL</h3>
        <form onSubmit={handleSitemapSubmit} style={{ marginBottom: 8 }}>
          <input
            type="url"
            placeholder="https://example.com or https://example.com/sitemap.xml"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            required
            style={{ width: 320, marginRight: 8 }}
            disabled={sitemapLoading}
          />
          <button type="submit" disabled={sitemapLoading || !sitemapUrl}>
            {sitemapLoading ? "Crawling..." : "Crawl"}
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
                  ? "red"
                  : "green",
            }}
          >
            {sitemapStatus}
          </div>
        )}
      </div>

      {/* API Key Management Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>Website Integration</h3>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
          Use these credentials to embed the chatbot on your website.
        </p>

        <div style={{ marginBottom: 16 }}>
          <h4>API Key</h4>
          {apiKey ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    padding: 8,
                    border: "1px solid #ddd",
                    borderRadius: 4,
                    width: 400,
                    backgroundColor: "#f5f5f5",
                  }}
                />
                <button onClick={() => setShowApiKey(!showApiKey)}>
                  {showApiKey ? "Hide" : "Show"}
                </button>
                <button onClick={() => copyToClipboard(apiKey)}>Copy</button>
              </div>
              {apiKeyCreated && (
                <div style={{ fontSize: 12, color: "#666" }}>
                  Created: {new Date(apiKeyCreated).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ color: "#666", fontSize: 14 }}>
                No API key generated yet.
              </p>
            </div>
          )}

          <button
            onClick={generateApiKey}
            disabled={apiKeyLoading}
            style={{
              marginTop: 8,
              backgroundColor: apiKey ? "#dc3545" : "#28a745",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {apiKeyLoading
              ? "Generating..."
              : apiKey
                ? "Regenerate API Key"
                : "Generate API Key"}
          </button>

          {apiKeyError && (
            <div style={{ color: "red", fontSize: 14, marginTop: 8 }}>
              {apiKeyError}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>Widget Script</h4>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
            Add this script tag to your website to embed the chatbot:
          </p>
          {apiKey ? (
            <div>
              <textarea
                readOnly
                value={`<script src="${window.location.origin}/api/widget" data-api-key="${apiKey}"></script>`}
                style={{
                  width: "100%",
                  height: 60,
                  fontFamily: "monospace",
                  fontSize: 13,
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  backgroundColor: "#f5f5f5",
                  resize: "none",
                }}
              />
              <button
                onClick={() =>
                  copyToClipboard(
                    `<script src="${window.location.origin}/api/widget" data-api-key="${apiKey}"></script>`,
                  )
                }
                style={{ marginTop: 8 }}
              >
                Copy Script
              </button>
            </div>
          ) : (
            <div style={{ color: "#666", fontSize: 14 }}>
              Generate an API key first to get the widget script.
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4>How it works</h4>
          <ul style={{ color: "#666", fontSize: 14, paddingLeft: 20 }}>
            <li>
              The widget automatically detects which page the user is viewing
            </li>
            <li>
              It provides contextual responses based on your crawled sitemap
              data
            </li>
            <li>All conversations are linked to your admin account</li>
            <li>Users can provide their email for lead generation</li>
            <li>
              The widget includes automatic followup messages after 30 seconds
              of inactivity
            </li>
          </ul>
        </div>

        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            padding: 12,
            borderRadius: 4,
          }}
        >
          <strong>⚠️ Security Note:</strong>
          <p style={{ margin: 0, fontSize: 14, color: "#856404" }}>
            Keep your API key secure and never expose it in client-side code.
            The widget script handles authentication automatically.
          </p>
        </div>
      </div>

      {/* Leads Management Section */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <h3>Lead Management</h3>

        {/* Search and Controls */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <form
            onSubmit={handleLeadsSearch}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              type="text"
              placeholder="Search by email or message..."
              value={leadsSearch}
              onChange={(e) => setLeadsSearch(e.target.value)}
              style={{
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4,
                width: 250,
              }}
            />
            <button type="submit" style={{ padding: "8px 16px" }}>
              Search
            </button>
          </form>

          <select
            value={leadsSortBy}
            onChange={(e) => {
              setLeadsSortBy(e.target.value);
              fetchLeads(1, leadsSearch);
            }}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
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
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>

          <button
            onClick={() => fetchLeads(leadsPage, leadsSearch)}
            disabled={leadsLoading}
            style={{ padding: "8px 16px" }}
          >
            {leadsLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: "#f8f9fa",
            borderRadius: 4,
          }}
        >
          <strong>Total Leads: {leadsTotal}</strong>
          {leadsTotal > 0 && (
            <span style={{ marginLeft: 16, color: "#666" }}>
              Showing {(leadsPage - 1) * LEADS_PAGE_SIZE + 1} -{" "}
              {Math.min(leadsPage * LEADS_PAGE_SIZE, leadsTotal)} of{" "}
              {leadsTotal}
            </span>
          )}
        </div>

        {/* Error Display */}
        {leadsError && (
          <div
            style={{
              color: "red",
              marginBottom: 16,
              padding: 8,
              backgroundColor: "#ffeaea",
              borderRadius: 4,
            }}
          >
            {leadsError}
          </div>
        )}

        {/* Leads Table */}
        {leadsLoading ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
            No leads found. Start promoting your chatbot to collect leads!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    First Contact
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Last Activity
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Messages
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Latest Message
                  </th>
                  <th
                    style={{
                      padding: 12,
                      textAlign: "center",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr
                    key={lead.email}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa",
                    }}
                  >
                    <td
                      style={{ padding: 12, borderBottom: "1px solid #dee2e6" }}
                    >
                      <strong>{lead.email}</strong>
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #dee2e6",
                        color: "#666",
                      }}
                    >
                      {new Date(lead.firstSeen).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #dee2e6",
                        color: "#666",
                      }}
                    >
                      {new Date(lead.lastSeen).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#0070f3",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      >
                        {lead.messageCount}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #dee2e6",
                        maxWidth: 200,
                      }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: lead.latestRole === "user" ? "#333" : "#666",
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: "bold" }}>
                          {lead.latestRole === "user" ? "👤" : "🤖"}
                        </span>{" "}
                        {typeof lead.latestContent === "string"
                          ? lead.latestContent
                          : lead.latestContent &&
                              typeof lead.latestContent === "object" &&
                              "mainText" in lead.latestContent
                            ? lead.latestContent.mainText
                            : "No content"}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #dee2e6",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => copyToClipboard(lead.email)}
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          marginRight: 4,
                          cursor: "pointer",
                        }}
                        title="Copy email"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => deleteLead(lead.email)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                        title="Delete lead"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {leadsTotalPages > 1 && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <button
              onClick={() => {
                setLeadsPage(1);
                fetchLeads(1, leadsSearch);
              }}
              disabled={leadsPage === 1}
              style={{ padding: "8px 12px" }}
            >
              First
            </button>
            <button
              onClick={() => {
                const newPage = leadsPage - 1;
                setLeadsPage(newPage);
                fetchLeads(newPage, leadsSearch);
              }}
              disabled={leadsPage === 1}
              style={{ padding: "8px 12px" }}
            >
              Previous
            </button>
            <span
              style={{
                padding: "8px 12px",
                backgroundColor: "#f8f9fa",
                borderRadius: 4,
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
              style={{ padding: "8px 12px" }}
            >
              Next
            </button>
            <button
              onClick={() => {
                setLeadsPage(leadsTotalPages);
                fetchLeads(leadsTotalPages, leadsSearch);
              }}
              disabled={leadsPage === leadsTotalPages}
              style={{ padding: "8px 12px" }}
            >
              Last
            </button>
          </div>
        )}

        {/* Export Options */}
        {leads.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#f8f9fa",
              borderRadius: 4,
            }}
          >
            <h4 style={{ margin: "0 0 8px 0" }}>Export Options</h4>
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
                    ].join(","),
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
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: 8,
              }}
            >
              Export as CSV
            </button>
            <button
              onClick={() => {
                const emailList = leads.map((lead) => lead.email).join(", ");
                copyToClipboard(emailList);
              }}
              style={{
                backgroundColor: "#6f42c1",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Copy All Emails
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
      <Chatbot pageUrl={selectedPageUrl || undefined} adminId={auth?.adminId} />
      <DocumentUploader onUploadDone={() => {}} />
    </div>
  );
};

export default AdminPanel;
