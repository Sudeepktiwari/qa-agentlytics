"use client";

import React, { useEffect, useState, useCallback } from "react";
import DocumentUploader from "./DocumentUploader";
import Chatbot from "./Chatbot";

// Import admin section components
import AuthSection from "./admin/AuthSection";
import ContentCrawlingSection from "./admin/ContentCrawlingSection";
import ApiKeyManagementSection from "./admin/ApiKeyManagementSection";
import WidgetConfiguratorSection from "./admin/WidgetConfiguratorSection";
import LeadsManagementSection from "./admin/LeadsManagementSection";
import TestingSection from "./admin/TestingSection";
import DocumentManagementSection from "./admin/DocumentManagementSection";

const AdminPanel: React.FC = () => {
  // Authentication state
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

  // Documents management state
  interface Document {
    filename: string;
    count: number;
  }
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [documentsExpanded, setDocumentsExpanded] = useState(false);

  // Widget configuration state
  const [widgetConfig, setWidgetConfig] = useState({
    theme: "blue",
    size: "medium",
    position: "bottom-right",
    chatTitle: "Chat with us",
    buttonText: "💬",
    welcomeMessage: "",
    customColor: "#0070f3",
    voiceEnabled: true,
    voiceGender: "female",
    autoOpenProactive: true,
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
        // Refresh sitemap URLs
        fetchSitemapUrls();
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
    [leadsSearch, leadsSortBy, leadsSortOrder, LEADS_PAGE_SIZE]
  );

  // Documents management functions
  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const res = await fetch("/api/admin-docs?admin=1");
      const data = await res.json();
      if (res.ok) {
        setDocuments(data.documents || []);
      } else {
        setDocumentsError(data.error || "Failed to fetch documents");
      }
    } catch (error) {
      setDocumentsError("Failed to fetch documents");
      console.error("Error fetching documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const deleteDocumentFile = async (filename: string) => {
    if (
      !window.confirm(
        `Delete document "${filename}"? This will remove all its chunks from the knowledge base.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin-docs?admin=1", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      if (res.ok) {
        fetchDocuments(); // Refresh the list
      } else {
        const data = await res.json();
        setDocumentsError(data.error || "Failed to delete document");
      }
    } catch (error) {
      setDocumentsError("Failed to delete document");
      console.error("Error deleting document:", error);
    }
  };

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

  const fetchSitemapUrls = async () => {
    try {
      const res = await fetch("/api/sitemap?urls=1");
      const data = await res.json();
      if (data.urls) setSitemapUrls(data.urls);
    } catch (error) {
      console.error("Error fetching sitemap URLs:", error);
    }
  };

  useEffect(() => {
    if (auth) {
      // Fetch last submitted sitemapUrl from admin settings
      fetch("/api/sitemap?settings=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.lastSitemapUrl) setSitemapUrl(data.lastSitemapUrl);
        });

      fetchSitemapUrls();
      fetchApiKey();
      fetchLeads();
      fetchDocuments();
    }
  }, [auth, fetchLeads]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <AuthSection
        auth={auth}
        authError={authError}
        authLoading={authLoading}
        form={form}
        onFormChange={setForm}
        onAuth={handleAuth}
        onLogout={handleLogout}
      />

      {auth && (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <ContentCrawlingSection
            sitemapUrl={sitemapUrl}
            sitemapStatus={sitemapStatus}
            sitemapLoading={sitemapLoading}
            onSitemapUrlChange={setSitemapUrl}
            onSitemapSubmit={handleSitemapSubmit}
          />

          <ApiKeyManagementSection
            apiKey={apiKey}
            apiKeyLoading={apiKeyLoading}
            apiKeyError={apiKeyError}
            showApiKey={showApiKey}
            apiKeyCreated={apiKeyCreated}
            onGenerateApiKey={generateApiKey}
            onToggleShowApiKey={() => setShowApiKey(!showApiKey)}
            onCopyToClipboard={copyToClipboard}
          />

          <WidgetConfiguratorSection
            apiKey={apiKey}
            widgetConfig={widgetConfig}
            onWidgetConfigChange={setWidgetConfig}
            onCopyToClipboard={copyToClipboard}
          />

          <LeadsManagementSection
            leads={leads}
            leadsLoading={leadsLoading}
            leadsError={leadsError}
            leadsPage={leadsPage}
            leadsTotal={leadsTotal}
            leadsTotalPages={leadsTotalPages}
            leadsSearch={leadsSearch}
            leadsSortBy={leadsSortBy}
            leadsSortOrder={leadsSortOrder}
            LEADS_PAGE_SIZE={LEADS_PAGE_SIZE}
            onLeadsSearch={setLeadsSearch}
            onLeadsSearchSubmit={handleLeadsSearch}
            onLeadsSortByChange={(sortBy) => {
              setLeadsSortBy(sortBy);
              fetchLeads(1, leadsSearch);
            }}
            onLeadsSortOrderChange={(sortOrder) => {
              setLeadsSortOrder(sortOrder);
              fetchLeads(1, leadsSearch);
            }}
            onRefreshLeads={() => fetchLeads(leadsPage, leadsSearch)}
            onDeleteLead={deleteLead}
            onLeadsPageChange={(page) => {
              setLeadsPage(page);
              fetchLeads(page, leadsSearch);
            }}
            onCopyToClipboard={copyToClipboard}
          />

          <TestingSection
            auth={auth}
            sitemapUrls={sitemapUrls}
            selectedPageUrl={selectedPageUrl}
            onSelectedPageUrlChange={setSelectedPageUrl}
          />

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
              📎 Document Upload
            </h3>
            <DocumentUploader
              onUploadDone={() => {
                // Refresh documents list after upload
                fetchDocuments();
              }}
            />
          </div>

          <DocumentManagementSection
            documents={documents}
            documentsLoading={documentsLoading}
            documentsError={documentsError}
            documentsExpanded={documentsExpanded}
            onToggleDocumentsExpanded={() =>
              setDocumentsExpanded(!documentsExpanded)
            }
            onRefreshDocuments={fetchDocuments}
            onDeleteDocument={deleteDocumentFile}
          />
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
