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
import CrawledPagesSection from "./admin/CrawledPagesSection";
import CustomerPersonaSection from "./admin/CustomerPersonaSection";
import CustomerProfilesSection from "./admin/CustomerProfilesSection";
import SummaryModal from "./admin/SummaryModal";

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
  const [documentsExpanded, setDocumentsExpanded] = useState(true);

  // Crawled pages management state
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [crawledPagesLoading, setCrawledPagesLoading] = useState(false);
  const [crawledPagesError, setCrawledPagesError] = useState("");

  // Summary modal state
  interface CrawledPage {
    _id: string;
    url: string;
    hasStructuredSummary: boolean;
    createdAt: string;
    text?: string;
    summary?: string;
    structuredSummary?: Record<string, unknown>;
  }
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedPageForSummary, setSelectedPageForSummary] =
    useState<CrawledPage | null>(null);

  // URL summary status tracking
  const [urlSummaryStatus, setUrlSummaryStatus] = useState<
    Record<string, boolean>
  >({});
  // Track which URLs actually exist in crawled_pages collection (can generate summaries)
  const [urlExistsInCrawledPages, setUrlExistsInCrawledPages] = useState<
    Record<string, boolean>
  >({});

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

  // Customer persona section state
  const [personasExpanded, setPersonasExpanded] = useState(false);

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

  // Auto-continue state
  const [autoContinue, setAutoContinue] = useState(false);
  const [continueCrawling, setContinueCrawling] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  // Sitemap submission handler with auto-continue
  const handleSitemapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSitemapStatus(null);
    setSitemapLoading(true);
    setTotalProcessed(0);
    setTotalRemaining(0);

    await crawlBatch(sitemapUrl, true);
  };

  // Recursive crawling function
  const crawlBatch = async (url: string, isInitial: boolean = false) => {
    try {
      const res = await fetch("/api/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitemapUrl: url }),
      });

      const data = await res.json();

      if (res.ok) {
        const newTotalProcessed = isInitial
          ? data.crawled
          : totalProcessed + data.crawled;
        setTotalProcessed(newTotalProcessed);
        setTotalRemaining(data.totalRemaining);

        // Update status with progress information
        const progressInfo = data.totalDiscovered
          ? `Progress: ${newTotalProcessed}/${
              data.totalDiscovered
            } pages (${Math.round(
              (newTotalProcessed / data.totalDiscovered) * 100
            )}%)`
          : `Processed: ${newTotalProcessed} pages`;

        setSitemapStatus(
          `✅ Batch Complete: ${data.crawled} pages crawled, ${data.totalChunks} chunks created\n` +
            `📊 ${progressInfo}\n` +
            `⏱️ Execution time: ${Math.round(data.executionTime / 1000)}s\n` +
            `${data.message}`
        );

        // Auto-continue if there are more pages and auto-continue is enabled
        if (data.hasMorePages && (autoContinue || continueCrawling)) {
          setSitemapStatus(
            (prev) => prev + `\n\n🔄 Auto-continuing in 2 seconds...`
          );

          // Wait 2 seconds before continuing to prevent overwhelming the server
          setTimeout(() => {
            crawlBatch(url, false);
          }, 2000);
        } else if (data.hasMorePages) {
          setSitemapStatus(
            (prev) =>
              prev +
              `\n\n💡 ${data.totalRemaining} pages remaining. Enable auto-continue or click "Continue Crawling" to process more.`
          );
          setSitemapLoading(false);
        } else {
          setSitemapStatus(
            (prev) =>
              prev + `\n\n🎉 All pages have been successfully processed!`
          );
          setSitemapLoading(false);
          setContinueCrawling(false);
        }

        // Refresh sitemap URLs
        fetchSitemapUrls();
      } else {
        setSitemapStatus(`❌ Error: ${data.error}`);
        setSitemapLoading(false);
        setContinueCrawling(false);
      }
    } catch (err) {
      setSitemapStatus("❌ Failed to crawl sitemap");
      console.error("Sitemap crawl exception:", err);
      setSitemapLoading(false);
      setContinueCrawling(false);
    }
  };

  // Continue crawling handler
  const handleContinueCrawling = () => {
    if (sitemapUrl && totalRemaining > 0) {
      setContinueCrawling(true);
      setSitemapLoading(true);
      crawlBatch(sitemapUrl, false);
    }
  };

  // Stop auto-continue handler
  const handleStopCrawling = () => {
    setAutoContinue(false);
    setContinueCrawling(false);
    setSitemapLoading(false);
    setSitemapStatus((prev) => prev + `\n\n⏹️ Crawling stopped by user.`);
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
  // Unified fetchDocuments: merges uploaded docs and crawled pages into one list
  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      // Fetch uploaded documents
      const docsRes = await fetch("/api/admin-docs?admin=1");
      const docsData = await docsRes.json();
      const uploadedDocs = docsRes.ok ? docsData.documents || [] : [];

      // Fetch crawled pages (as URLs)
      let crawledPages: any[] = [];
      if (apiKey) {
        const pagesRes = await fetch("/api/crawled-pages", {
          method: "GET",
          headers: { "x-api-key": apiKey },
        });
        const pagesData = await pagesRes.json();
        if (pagesRes.ok && Array.isArray(pagesData.pages)) {
          crawledPages = pagesData.pages.map((page: any) => ({
            filename: page.url, // Use URL as filename
            count: page.chunksCount || 0, // If available, else 0
            hasStructuredSummary: !!page.structuredSummary, // Pass summary status for button logic
          }));
        }
      }

      // Merge, deduplicate by filename (URL or doc name)
      const allDocsMap: Record<string, { filename: string; count: number }> =
        {};
      uploadedDocs.forEach((doc: any) => {
        allDocsMap[doc.filename] = doc;
      });
      crawledPages.forEach((pageDoc) => {
        if (!allDocsMap[pageDoc.filename]) {
          allDocsMap[pageDoc.filename] = pageDoc;
        }
      });
      const allDocs = Object.values(allDocsMap);
      setDocuments(allDocs);
      // Also fetch URL summary status when documents are loaded
      fetchUrlSummaryStatus();
    } catch (error) {
      setDocumentsError("Failed to fetch documents");
      console.error("Error fetching documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Crawled pages management functions
  const fetchCrawledPages = async () => {
    if (!apiKey) return;

    setCrawledPagesLoading(true);
    setCrawledPagesError("");
    try {
      const res = await fetch("/api/crawled-pages", {
        method: "GET",
        headers: { "x-api-key": apiKey },
      });
      const data = await res.json();
      if (res.ok) {
        setCrawledPages(data.pages || []);
      } else {
        setCrawledPagesError(data.error || "Failed to fetch crawled pages");
      }
    } catch (error) {
      setCrawledPagesError("Failed to fetch crawled pages");
      console.error("Error fetching crawled pages:", error);
    } finally {
      setCrawledPagesLoading(false);
    }
  };

  const deleteCrawledPage = async (page: CrawledPage) => {
    if (!apiKey) return;

    if (
      !window.confirm(
        `Delete crawled page "${page.url}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/crawled-pages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ url: page.url }),
      });

      if (res.ok) {
        fetchCrawledPages(); // Refresh the list
        fetchDocuments(); // Also refresh documents as it might affect the unified view
      } else {
        const data = await res.json();
        setCrawledPagesError(data.error || "Failed to delete crawled page");
      }
    } catch (error) {
      setCrawledPagesError("Failed to delete crawled page");
      console.error("Error deleting crawled page:", error);
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

  // View summary function for crawled pages
  const viewSummary = async (url: string) => {
    if (!apiKey) {
      alert("API key required to view summary");
      return;
    }

    setSelectedPageForSummary({
      _id: url, // Use URL as ID for now
      url,
      hasStructuredSummary: false,
      createdAt: new Date().toISOString(),
    });
    setShowSummaryModal(true);

    // Fetch the actual summary data from crawled pages collection
    try {
      const res = await fetch("/api/crawled-pages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pages) {
          // Find the specific page by URL
          const pageData = data.pages.find((page: any) => page.url === url);
          if (pageData) {
            setSelectedPageForSummary({
              _id: pageData._id,
              url: pageData.url,
              hasStructuredSummary: !!pageData.structuredSummary,
              createdAt: pageData.createdAt,
              text: pageData.text,
              summary: pageData.summary,
              structuredSummary: pageData.structuredSummary,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  // Generate summary function that replaces existing summary
  const generateSummary = async (page: CrawledPage) => {
    if (!apiKey) {
      alert("API key required to generate summary");
      return;
    }

    try {
      // Show loading state
      setSelectedPageForSummary({
        ...page,
        hasStructuredSummary: false,
      });

      const response = await fetch("/api/crawled-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          url: page.url,
          regenerate: true, // Force regeneration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Summary generated successfully:", result);

        // Refresh the documents list to show updated summary status
        fetchDocuments();
        // Also refresh URL summary status
        fetchUrlSummaryStatus();
        // Refresh crawled pages to show updated status
        await fetchCrawledPages();

        // Close the modal and clear selected page so next open uses latest data
        setShowSummaryModal(false);
        setSelectedPageForSummary(null);

        alert("Summary generated successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to generate summary:", errorData);

        // Show more user-friendly error messages
        let errorMessage = errorData.error || "Unknown error";
        if (errorData.error === "Page not found") {
          errorMessage =
            "This URL wasn't found in the crawled pages database. Try refreshing the page list first.";
        } else if (
          errorData.error &&
          errorData.error.includes("document chunks")
        ) {
          errorMessage =
            "This page was processed as document chunks but doesn't have the full text needed for summary generation.";
        }

        alert(`Failed to generate summary: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Error generating summary. Please try again.");
    }
  };

  // Fetch URL summary status for all crawled pages
  const fetchUrlSummaryStatus = async () => {
    if (!apiKey) return;

    try {
      const response = await fetch("/api/crawled-pages", {
        method: "GET",
        headers: { "x-api-key": apiKey },
      });

      if (response.ok) {
        const data = await response.json();
        const statusMap: Record<string, boolean> = {};
        const existsMap: Record<string, boolean> = {};

        if (data.pages && Array.isArray(data.pages)) {
          data.pages.forEach((page: any) => {
            statusMap[page.url] = !!page.structuredSummary;
            existsMap[page.url] = true; // This URL exists in crawled_pages
          });
        }

        setUrlSummaryStatus(statusMap);
        setUrlExistsInCrawledPages(existsMap);
        console.log("URL summary status updated:", statusMap);
        console.log("URL exists mapping updated:", existsMap);
      }
    } catch (error) {
      console.error("Error fetching URL summary status:", error);
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
      fetchCrawledPages();
    }
  }, [auth, fetchLeads]);

  // Fetch crawled pages when API key becomes available
  useEffect(() => {
    if (apiKey && auth) {
      fetchCrawledPages();
    }
  }, [apiKey, auth]);

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
            autoContinue={autoContinue}
            continueCrawling={continueCrawling}
            totalProcessed={totalProcessed}
            totalRemaining={totalRemaining}
            onSitemapUrlChange={setSitemapUrl}
            onSitemapSubmit={handleSitemapSubmit}
            onAutoContinueChange={setAutoContinue}
            onContinueCrawling={handleContinueCrawling}
            onStopCrawling={handleStopCrawling}
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

          <CustomerPersonaSection
            expanded={personasExpanded}
            onToggleExpanded={() => setPersonasExpanded(!personasExpanded)}
          />

          <CustomerProfilesSection />

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
            urlSummaryStatus={urlSummaryStatus}
            urlExistsInCrawledPages={urlExistsInCrawledPages}
            onToggleDocumentsExpanded={() =>
              setDocumentsExpanded(!documentsExpanded)
            }
            onRefreshDocuments={fetchDocuments}
            onDeleteDocument={deleteDocumentFile}
            onViewSummary={viewSummary}
          />
        </div>
      )}

      {/* Summary Modal */}
      <SummaryModal
        page={selectedPageForSummary}
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setSelectedPageForSummary(null);
          fetchDocuments(); // Refresh document list to update summary button state
        }}
        onGenerateSummary={generateSummary}
      />
    </div>
  );
};

export default AdminPanel;
