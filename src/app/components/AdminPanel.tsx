"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Users, FileText, Database, Activity, Menu } from "lucide-react";
import DocumentUploader from "./DocumentUploader";
import Sidebar from "./admin/Sidebar";

// Import admin section components
import AuthSection from "./admin/AuthSection";
import ContentCrawlingSection from "./admin/ContentCrawlingSection";
import ApiKeyManagementSection from "./admin/ApiKeyManagementSection";
import WidgetConfiguratorSection from "./admin/WidgetConfiguratorSection";
import WidgetInstructionsSection from "./admin/WidgetInstructionsSection";
import LeadsManagementSection from "./admin/LeadsManagementSection";
import TestingSection from "./admin/TestingSection";
import DocumentManagementSection from "./admin/DocumentManagementSection";
import CrawledPagesSection from "./admin/CrawledPagesSection";
import CustomerPersonaSection from "./admin/CustomerPersonaSection";
import BantQualificationSection from "./admin/BantQualificationSection";
import CustomerProfilesSection from "./admin/CustomerProfilesSection";
import BookingManagementSection from "./admin/BookingManagementSection";
import SubscriptionSection from "./admin/SubscriptionSection";
import { AdminSettingsSection } from "./admin/AdminSettingsSection";
import OnboardingSettingsSection from "./admin/OnboardingSettingsSection";
import WorkflowSection from "./admin/WorkflowSection";
import SummaryModal from "./admin/SummaryModal";
import { PRICING } from "@/config/pricing";

const AdminPanel: React.FC = () => {
  // Authentication state
  const [auth, setAuth] = useState<null | { email: string; adminId?: string }>(
    null,
  );
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
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
    requirements?: string;
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

  // Documents management state
  interface Document {
    filename: string;
    count: number;
    hasStructuredSummary?: boolean;
  }
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [documentsExpanded, setDocumentsExpanded] = useState(true);

  // Crawled pages management state
  interface CrawledPage {
    _id: string;
    url: string;
    hasStructuredSummary: boolean;
    createdAt: string;
    text?: string;
    summary?: string;
    structuredSummary?: Record<string, unknown>;
    chunksCount?: number;
  }
  const [crawledPages, setCrawledPages] = useState<CrawledPage[]>([]);
  const [crawledPagesLoading, setCrawledPagesLoading] = useState(false);
  const [crawledPagesError, setCrawledPagesError] = useState("");

  // Summary modal state
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
    voiceEnabled: false,
    voiceGender: "female",
    autoOpenProactive: true,
  });

  // Toast state
  const [toast, setToast] = useState<null | {
    message: string;
    type: "success" | "error";
  }>(null);
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Navigation state
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Section Metadata Configuration
  const SECTION_METADATA: Record<
    string,
    { title: string; description: string }
  > = {
    overview: {
      title: "Dashboard",
      description: "Overview of your agent's performance and usage.",
    },
    workflow: {
      title: "Workflow Management",
      description: "Configure conversation flows and dialogue structure.",
    },
    knowledge: {
      title: "Knowledge Base",
      description: "Manage your agent's knowledge sources and crawled content.",
    },
    leads: {
      title: "Lead Management",
      description: "View and manage captured leads and conversations.",
    },
    configuration: {
      title: "Widget Configuration",
      description: "Customize the appearance and behavior of your chat widget.",
    },
    testing: {
      title: "Test Sandbox",
      description: "Test your agent's responses in a safe environment.",
    },
    bookings: {
      title: "Bookings",
      description: "Manage appointment bookings and schedules.",
    },
    subscription: {
      title: "Subscription",
      description: "Manage your plan and billing details.",
    },
    qualification: {
      title: "Qualification Rules",
      description: "Define BANT and persona-based qualification criteria.",
    },
    onboarding: {
      title: "Onboarding Setup",
      description: "Review onboarding analytics and setup progress.",
    },
    documents: {
      title: "Documents",
      description: "Upload and manage reference documents.",
    },
    "live-preview": {
      title: "Live Preview",
      description: "Interact with your agent in real-time.",
    },
  };
  const [subscriptionUsage, setSubscriptionUsage] = useState<null | {
    plan: string;
    usage: {
      leads: number;
      leadsLimit: number;
      limitReached: boolean;
      credits: number;
      creditsLimit: number;
    };
  }>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      setAuthError("");
      try {
        const res = await fetch("/api/auth/verify", {
          credentials: "include", // Include cookies for authentication
        });
        if (res.ok) {
          const data = await res.json();
          setAuth({ email: data.email, adminId: data.adminId });
          if (data.apiKey) {
            setApiKey(data.apiKey);
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Auto-open knowledge base and start crawl + auto-login via token from onboarding
  useEffect(() => {
    const initFromParams = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const section = params.get("section");
        const urlParam = params.get("sitemapUrl");
        const tokenParam = params.get("token");

        if (tokenParam) {
          const res = await fetch("/api/auth", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: tokenParam }),
          });
          if (res.ok) {
            const data = await res.json();
            setAuth({ email: data.email, adminId: data.adminId });
            if (data.apiKey) {
              setApiKey(data.apiKey);
            }
          }
        }

        if (section === "knowledge") setActiveSection("knowledge");
        if (section === "configuration") setActiveSection("configuration");
        if (urlParam && urlParam.trim().length > 0) {
          setSitemapUrl(urlParam);
          setSitemapStatus(null);
          setSitemapLoading(true);
          setTotalProcessed(0);
          setTotalRemaining(0);
          crawlBatch(urlParam, true);
        }
      } catch {}
    };
    initFromParams();
  }, []);

  // Auth form submit
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "🔵 [AdminPanel] handleAuth called with action:",
      form.action,
      "email:",
      form.email,
    );
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          action: form.action,
          email: form.email,
          password: form.password,
        }),
      });

      console.log(
        "🔵 [AdminPanel] Response status:",
        res.status,
        res.statusText,
      );
      const data = await res.json();
      console.log("🔵 [AdminPanel] Response data:", data);

      if (res.ok) {
        if (form.action === "register") {
          setAuthSuccess(
            data.message ||
              "Registration successful! Please check your email to verify your account.",
          );
          setForm((prev) => ({ ...prev, action: "login" }));
        } else {
          // Login success
          setAuth({ email: form.email, adminId: data.adminId });
          if (data.apiKey) {
            setApiKey(data.apiKey);
          }
        }
      } else {
        setAuthError(data.error || "Auth failed");
      }
    } catch (err: any) {
      setAuthError(err.message || "Auth failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auto-continue state
  const [autoContinue, setAutoContinue] = useState(true);
  const [continueCrawling, setContinueCrawling] = useState(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  // Refs for checking state inside async closures
  const autoContinueRef = useRef(autoContinue);
  const continueCrawlingRef = useRef(continueCrawling);

  useEffect(() => {
    autoContinueRef.current = autoContinue;
  }, [autoContinue]);

  useEffect(() => {
    continueCrawlingRef.current = continueCrawling;
  }, [continueCrawling]);

  // Sitemap submission handler with auto-continue
  const handleSitemapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSitemapStatus(null);
    setSitemapLoading(true);
    setTotalProcessed(0);
    setTotalRemaining(0);
    setAutoContinue(true); // Always enable auto-continue on new crawl

    await crawlBatch(sitemapUrl, true);
  };

  // Recursive crawling function
  const crawlBatch = async (
    url: string,
    isInitial: boolean = false,
    accumulatedProcessed: number = 0,
  ) => {
    try {
      const res = await fetch("/api/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sitemapUrl: url }),
      });

      const data = await res.json();

      if (res.ok) {
        const newTotalProcessed = isInitial
          ? data.crawled
          : accumulatedProcessed + data.crawled;
        setTotalProcessed(newTotalProcessed);
        setTotalRemaining(data.totalRemaining);

        const overallProcessed = data.totalDiscovered
          ? data.totalDiscovered - data.totalRemaining
          : newTotalProcessed;
        const pctRaw = data.totalDiscovered
          ? (overallProcessed / data.totalDiscovered) * 100
          : 0;
        const pct = overallProcessed > 0 ? Math.max(pctRaw, 0.1) : 0;
        const progressInfo = data.totalDiscovered
          ? `Progress: ${overallProcessed}/${
              data.totalDiscovered
            } pages (${pct.toFixed(1)}%)`
          : `Processed: ${newTotalProcessed} pages`;

        setSitemapStatus(
          `✅ Batch Complete: ${data.crawled} pages crawled, ${data.totalChunks} chunks created\n` +
            `📊 ${progressInfo}\n` +
            `⏱️ Execution time: ${Math.round(data.executionTime / 1000)}s\n` +
            `${data.message}`,
        );

        // Auto-continue if there are more pages and auto-continue is enabled
        if (
          data.hasMorePages &&
          (autoContinueRef.current || continueCrawlingRef.current)
        ) {
          setSitemapStatus(
            (prev) => prev + `\n\n🔄 Auto-continuing in 2 seconds...`,
          );

          // Wait 2 seconds before continuing to prevent overwhelming the server
          setTimeout(() => {
            crawlBatch(url, false);
          }, 2000);
        } else if (data.hasMorePages) {
          setSitemapStatus(
            (prev) =>
              prev +
              `\n\n💡 ${data.totalRemaining} pages remaining. Enable auto-continue or click "Continue Crawling" to process more.`,
          );
          setSitemapLoading(false);
        } else {
          setSitemapStatus(
            (prev) =>
              prev + `\n\n🎉 All pages have been successfully processed!`,
          );
          setSitemapLoading(false);
          setContinueCrawling(false);
        }

        // Refresh sitemap URLs
        fetchSitemapUrls();
        fetchCrawledPages();
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
  const handleStopCrawling = async () => {
    setAutoContinue(false);
    setContinueCrawling(false);
    setSitemapLoading(false);
    setSitemapStatus((prev) => prev + `\n\n⏹️ Crawling stopped by user.`);

    try {
      // Notify backend to stop any running background jobs
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }

      await fetch("/api/sitemap", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ action: "stop" }),
      });
    } catch (err) {
      console.error("Failed to send stop signal to backend:", err);
    } finally {
      fetchCrawledPages();
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // Include cookies for logout
    });
    setAuth(null);
  };

  // API Key management functions
  const fetchApiKey = async () => {
    try {
      const res = await fetch("/api/auth/api-key", {
        credentials: "include", // Include cookies for authentication
      });
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
      const res = await fetch("/api/auth/api-key", {
        method: "POST",
        credentials: "include", // Include cookies for authentication
      });
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

        const res = await fetch(`/api/leads?${params}`, {
          credentials: "include", // Include cookies for authentication
        });
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

  // Documents management functions
  // Unified fetchDocuments: merges uploaded docs and crawled pages into one list
  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      // Fetch uploaded documents
      const docsRes = await fetch("/api/admin-docs?admin=1", {
        credentials: "include", // Include cookies for authentication
      });
      const docsData = await docsRes.json();
      const uploadedDocs = docsRes.ok ? docsData.documents || [] : [];

      // Fetch crawled pages (as URLs)
      let crawledPages: any[] = [];
      const urlSummaryStatusMap: Record<string, boolean> = {};

      if (auth) {
        const pagesRes = await fetch("/api/crawled-pages", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent for auth fallback
        });
        const pagesData = await pagesRes.json();
        if (pagesRes.ok && Array.isArray(pagesData.pages)) {
          // Build summary status map preserving the newest record per URL (pages are newest-first)
          for (const page of pagesData.pages) {
            if (urlSummaryStatusMap[page.url] === undefined) {
              urlSummaryStatusMap[page.url] = !!page.structuredSummary;
            }
          }
          // Map crawled pages to document rows, deriving hasStructuredSummary from the status map
          crawledPages = pagesData.pages.map((page: any) => ({
            filename: page.url, // Use URL as filename
            count: page.chunksCount || 0, // If available, else 0
            hasStructuredSummary: urlSummaryStatusMap[page.url],
          }));
        }
      }

      // Merge, deduplicate by filename (URL or doc name)
      const allDocsMap: Record<
        string,
        { filename: string; count: number; hasStructuredSummary?: boolean }
      > = {};
      uploadedDocs.forEach((doc: any) => {
        allDocsMap[doc.filename] = doc;
      });
      crawledPages.forEach((pageDoc) => {
        if (!allDocsMap[pageDoc.filename]) {
          allDocsMap[pageDoc.filename] = pageDoc;
        } else {
          // Ensure any existing entry (e.g., uploaded doc) reflects the correct summary status
          (allDocsMap[pageDoc.filename] as any).hasStructuredSummary =
            pageDoc.hasStructuredSummary;
        }
      });
      const allDocs = Object.values(allDocsMap);
      setDocuments(allDocs);
      // Set summary status for all URLs so button state is correct on first render
      setUrlSummaryStatus(urlSummaryStatusMap);
    } catch (error) {
      setDocumentsError("Failed to fetch documents");
      console.error("Error fetching documents:", error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Crawled pages management functions
  const fetchCrawledPages = async () => {
    // Allow fetching if we have auth (cookie)
    if (!auth) return;

    setCrawledPagesLoading(true);
    setCrawledPagesError("");
    try {
      const res = await fetch("/api/crawled-pages", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent for auth fallback
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
    // Allow deletion if we have auth (cookie)
    if (!auth) return;

    if (
      !window.confirm(
        `Delete crawled page "${page.url}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    // Optimistic update: Update UI immediately before API call to prevent list refresh/flicker
    const previousPages = crawledPages;
    const previousDocuments = documents;

    setCrawledPages((prev) => prev.filter((p) => p.url !== page.url));
    setDocuments((prev) => prev.filter((d) => d.filename !== page.url));

    try {
      const res = await fetch("/api/crawled-pages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent for auth fallback
        body: JSON.stringify({ url: page.url }),
      });

      if (res.ok) {
        showToast("Crawled page deleted successfully");
      } else {
        // Revert on failure
        setCrawledPages(previousPages);
        setDocuments(previousDocuments);
        const data = await res.json();
        setCrawledPagesError(data.error || "Failed to delete crawled page");
      }
    } catch (error) {
      // Revert on error
      setCrawledPages(previousPages);
      setDocuments(previousDocuments);
      setCrawledPagesError("Failed to delete crawled page");
      console.error("Error deleting crawled page:", error);
    }
  };

  const deleteCrawledPages = async (pages: CrawledPage[]) => {
    // Allow deletion if we have auth (cookie)
    if (!auth) return;

    if (
      !window.confirm(
        `Delete ${pages.length} crawled pages? This action cannot be undone.`,
      )
    ) {
      return;
    }

    // Optimistic update
    const previousPages = crawledPages;
    const previousDocuments = documents;

    const urlsToDelete = new Set(pages.map((p) => p.url));
    setCrawledPages((prev) => prev.filter((p) => !urlsToDelete.has(p.url)));
    setDocuments((prev) => prev.filter((d) => !urlsToDelete.has(d.filename)));

    try {
      const res = await fetch("/api/crawled-pages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent for auth fallback
        body: JSON.stringify({ urls: Array.from(urlsToDelete) }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(
          `Successfully deleted ${data.deletedCount || pages.length} pages`,
        );
      } else {
        // Revert on failure
        setCrawledPages(previousPages);
        setDocuments(previousDocuments);
        const data = await res.json();
        setCrawledPagesError(data.error || "Failed to delete pages");
      }
    } catch (error) {
      // Revert on error
      setCrawledPages(previousPages);
      setDocuments(previousDocuments);
      setCrawledPagesError("Failed to delete pages");
      console.error("Error deleting pages:", error);
    }
  };

  const retryPage = async (page: CrawledPage) => {
    // Allow retry if we have auth (cookie)
    if (!auth) {
      showToast("Authentication required to retry crawl", "error");
      return;
    }

    try {
      showToast(`Retrying crawl for ${page.url}...`);

      // Update local state to show loading/retrying status if needed
      // For now we just trigger the toast

      const res = await fetch("/api/sitemap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent for auth fallback
        body: JSON.stringify({ retryUrl: page.url }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Retry successful! Page is being processed.");
        // Refresh the list to show updated status
        fetchCrawledPages();
      } else {
        showToast(`Retry failed: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error retrying page:", error);
      showToast("Error retrying page. Please try again.", "error");
    }
  };

  const deleteDocumentFile = async (filename: string) => {
    if (
      !window.confirm(
        `Delete document "${filename}"? This will remove all its chunks from the knowledge base.`,
      )
    ) {
      return;
    }

    // Optimistic update: Update UI immediately
    const previousDocuments = documents;
    setDocuments((prev) => prev.filter((d) => d.filename !== filename));

    try {
      const res = await fetch("/api/admin-docs?admin=1", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ filename }),
      });

      if (res.ok) {
        showToast("Document deleted successfully");
      } else {
        // Revert on failure
        setDocuments(previousDocuments);
        const data = await res.json();
        setDocumentsError(data.error || "Failed to delete document");
      }
    } catch (error) {
      // Revert on error
      setDocuments(previousDocuments);
      setDocumentsError("Failed to delete document");
      console.error("Error deleting document:", error);
    }
  };

  // View summary function for crawled pages
  const viewSummary = async (url: string) => {
    // Allow viewing if we have auth (cookie)
    if (!auth) {
      alert("Authentication required to view summary");
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
        credentials: "include", // Ensure cookies are sent for auth fallback
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
    // Allow generation if we have auth (cookie)
    if (!auth) {
      showToast("Authentication required to generate summary", "error");
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
        },
        credentials: "include", // Ensure cookies are sent for auth fallback
        body: JSON.stringify({
          url: page.url,
          regenerate: true, // Force regeneration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Summary generated successfully:", result);

        // Update modal content in-place so summary shows immediately
        setSelectedPageForSummary((prev) =>
          prev
            ? {
                ...prev,
                hasStructuredSummary: true,
                structuredSummary: result.summary || prev.structuredSummary,
              }
            : prev,
        );

        // Update local status maps and background lists without closing modal
        setUrlSummaryStatus((prev) => ({ ...prev, [page.url]: true }));
        fetchUrlSummaryStatus();
        fetchDocuments();
        fetchCrawledPages();

        showToast("Summary generated successfully!", "success");
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

        showToast(`Failed to generate summary: ${errorMessage}`, "error");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      showToast("Error generating summary. Please try again.", "error");
    }
  };

  // Fetch URL summary status for all crawled pages
  const fetchUrlSummaryStatus = async () => {
    // Allow fetching if we have auth (cookie)
    if (!auth) return;

    try {
      const response = await fetch("/api/crawled-pages", {
        method: "GET",
        credentials: "include", // Ensure cookies are sent for auth fallback
      });

      if (response.ok) {
        const data = await response.json();
        const statusMap: Record<string, boolean> = {};
        const existsMap: Record<string, boolean> = {};

        if (data.pages && Array.isArray(data.pages)) {
          // pages are sorted by createdAt desc (newest first). Preserve first occurrence per URL.
          for (const page of data.pages) {
            if (!(page.url in statusMap)) {
              statusMap[page.url] = !!page.structuredSummary;
            }
            if (!(page.url in existsMap)) {
              existsMap[page.url] = true; // This URL exists in crawled_pages
            }
          }
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
        credentials: "include", // Include cookies for authentication
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
      const res = await fetch("/api/sitemap?urls=1", {
        credentials: "include", // Include cookies for authentication
      });
      const data = await res.json();
      if (data.urls) setSitemapUrls(data.urls);
    } catch (error) {
      console.error("Error fetching sitemap URLs:", error);
    }
  };

  useEffect(() => {
    if (auth) {
      // Fetch last submitted sitemapUrl from admin settings
      fetch("/api/sitemap?settings=1", {
        credentials: "include", // Include cookies for authentication
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.lastSitemapUrl) setSitemapUrl(data.lastSitemapUrl);
        });

      fetchSitemapUrls();
      fetchApiKey();
      fetchLeads();
      fetchCrawledPages();
      fetchDocuments();
      fetch("/api/admin/subscription/status", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.usage) setSubscriptionUsage(data);
        })
        .catch(() => {});
    }
  }, [auth, fetchLeads]);

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            {subscriptionUsage &&
              subscriptionUsage.usage.leadsLimit > 0 &&
              (subscriptionUsage.usage.limitReached ||
                subscriptionUsage.usage.leads /
                  subscriptionUsage.usage.leadsLimit >=
                  0.8) && (
                <div
                  className={
                    subscriptionUsage.usage.limitReached
                      ? "rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
                      : "rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
                  }
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {subscriptionUsage.usage.limitReached
                        ? "Lead limit reached"
                        : "Approaching your lead limit"}
                    </p>
                    <button
                      onClick={() => setActiveSection("subscription")}
                      className={
                        subscriptionUsage.usage.limitReached
                          ? "h-8 px-3 text-xs rounded-md bg-red-600 text-white"
                          : "h-8 px-3 text-xs rounded-md bg-amber-600 text-white"
                      }
                    >
                      Upgrade
                    </button>
                  </div>
                  <p className="mt-1 text-xs">
                    {subscriptionUsage.usage.leads.toLocaleString()} of{" "}
                    {subscriptionUsage.usage.leadsLimit.toLocaleString()}{" "}
                    lifetime leads used
                  </p>
                </div>
              )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Leads Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Total Leads
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {subscriptionUsage
                        ? subscriptionUsage.usage.leads
                        : leadsTotal}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Credits Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Credits
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {subscriptionUsage
                        ? `${subscriptionUsage.usage.credits.toLocaleString()} / ${(
                            subscriptionUsage.usage.creditsLimit || 0
                          ).toLocaleString()}`
                        : "-"}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Documents Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Documents
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {documents.length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Crawled Pages Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Database size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Crawled Pages
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {crawledPages.length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* API Status Card */}
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      API Status
                    </p>
                    <h3 className="text-lg font-bold text-slate-800">
                      {apiKey ? "Active" : "Not Configured"}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveSection("knowledge")}
                    className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 text-left transition-colors"
                  >
                    <span className="block font-medium text-slate-700 mb-1">
                      Update Knowledge Base
                    </span>
                    <span className="text-xs text-slate-500">
                      Crawl new pages or upload docs
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveSection("leads")}
                    className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 text-left transition-colors"
                  >
                    <span className="block font-medium text-slate-700 mb-1">
                      View Leads
                    </span>
                    <span className="text-xs text-slate-500">
                      Check recent conversations
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  System Status
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-600 text-sm">Auth System</span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-slate-600 text-sm">
                      Database Connection
                    </span>
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                      Connected
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 text-sm">
                      Crawler Service
                    </span>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "live-preview":
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <TestingSection
              auth={auth}
              sitemapUrls={sitemapUrls}
              selectedPageUrl={selectedPageUrl}
              onSelectedPageUrlChange={setSelectedPageUrl}
            />
          </div>
        );

      case "knowledge":
        return (
          <div className="space-y-8">
            <ContentCrawlingSection
              sitemapUrl={sitemapUrl}
              sitemapStatus={sitemapStatus}
              sitemapLoading={sitemapLoading}
              continueCrawling={continueCrawling}
              totalProcessed={totalProcessed}
              totalRemaining={totalRemaining}
              onSitemapUrlChange={setSitemapUrl}
              onSitemapSubmit={handleSitemapSubmit}
              onContinueCrawling={handleContinueCrawling}
              onStopCrawling={handleStopCrawling}
            />
            <WidgetInstructionsSection
              apiKey={apiKey}
              widgetConfig={widgetConfig}
            />
            <CrawledPagesSection
              crawledPages={crawledPages}
              crawledPagesLoading={crawledPagesLoading}
              crawledPagesError={crawledPagesError}
              onRefreshCrawledPages={fetchCrawledPages}
              onViewPageSummary={(page) => viewSummary(page.url)}
              onDeleteCrawledPage={deleteCrawledPage}
              onDeleteCrawledPages={deleteCrawledPages}
              onRetryPage={retryPage}
              documents={documents}
              documentsLoading={documentsLoading}
              onRefreshDocuments={fetchDocuments}
              onDeleteDocument={deleteDocumentFile}
            />
          </div>
        );

      case "documents":
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Upload Documents
              </h3>
              <DocumentUploader
                onUploadDone={() => {
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
        );

      case "leads":
        return (
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
        );

      case "bookings":
        return <BookingManagementSection adminId={auth?.adminId} />;

      case "configuration":
        return (
          <div className="space-y-8">
            <WidgetConfiguratorSection
              apiKey={apiKey}
              widgetConfig={widgetConfig}
              onWidgetConfigChange={setWidgetConfig}
              onCopyToClipboard={copyToClipboard}
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Global Settings
              </h3>
              <AdminSettingsSection />
            </div>
          </div>
        );

      case "testing":
        // Duplicate of live-preview but kept for explicit sidebar item
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
            <TestingSection
              auth={auth}
              sitemapUrls={sitemapUrls}
              selectedPageUrl={selectedPageUrl}
              onSelectedPageUrlChange={setSelectedPageUrl}
            />
          </div>
        );

      case "subscription":
        return <SubscriptionSection email={auth?.email} />;

      case "qualification":
        return (
          <div className="space-y-8">
            {/* <CustomerPersonaSection
              expanded={true} // Always expanded in dedicated view
              onToggleExpanded={() => {}}
            /> */}
            <BantQualificationSection />
            {/* <CustomerProfilesSection /> */}
          </div>
        );

      case "onboarding":
        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Onboarding Analytics & Setup
            </h3>
            <OnboardingSettingsSection />
          </div>
        );

      case "workflow":
        return <WorkflowSection />;

      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {!auth ? (
        <AuthSection
          auth={auth}
          authError={authError}
          authSuccess={authSuccess}
          authLoading={authLoading}
          form={form}
          onFormChange={setForm}
          onAuth={handleAuth}
          onLogout={handleLogout}
        />
      ) : (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            activeSection={activeSection}
            onNavigate={setActiveSection}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-slate-50 w-full relative">
            {/* Mobile Header */}
            <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 transition-all duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200">
                  A
                </div>
                <span className="font-semibold text-slate-800 text-lg tracking-tight">
                  Admin Panel
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all active:scale-95"
                aria-label="Open sidebar"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
              <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 capitalize">
                    {SECTION_METADATA[activeSection]?.title ||
                      activeSection.replace("-", " ")}
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    {SECTION_METADATA[activeSection]?.description ||
                      "Manage your chatbot and data"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                    Logged in as: {auth.email}
                  </div>
                </div>
              </header>

              {renderContent()}
            </div>
          </main>
        </div>
      )}

      {/* Summary Modal */}
      <SummaryModal
        page={selectedPageForSummary}
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setSelectedPageForSummary(null);
        }}
        onGenerateSummary={generateSummary}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 bottom-5 px-4 py-3 rounded-xl shadow-lg z-50 text-white font-medium text-sm transition-all transform duration-300 ${
            toast.type === "success"
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : "bg-gradient-to-br from-red-500 to-rose-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
