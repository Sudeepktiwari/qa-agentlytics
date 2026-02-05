"use client";

import React from "react";
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Globe,
  RefreshCw,
  Trash2,
  Eye,
  Zap,
} from "lucide-react";

interface Document {
  filename: string;
  count: number;
  hasStructuredSummary?: boolean;
}

interface CrawledPage {
  _id: string;
  url: string;
  hasStructuredSummary: boolean;
  createdAt: string;
  text?: string;
  summary?: string;
  structuredSummary?: Record<string, unknown>;
  chunksCount?: number;
  status?: "success" | "failed";
  error?: string;
}

interface CrawledPagesSectionProps {
  crawledPages: CrawledPage[];
  crawledPagesLoading: boolean;
  crawledPagesError: string;
  onRefreshCrawledPages: () => void;
  onViewPageSummary: (page: CrawledPage) => void;
  onDeleteCrawledPage: (page: CrawledPage) => void;
  onRetryPage: (page: CrawledPage) => void;
  onDeleteCrawledPages?: (pages: CrawledPage[]) => void;
  // Documents props
  documents?: Document[];
  documentsLoading?: boolean;
  onRefreshDocuments?: () => void;
  onDeleteDocument?: (filename: string) => void;
}

const CrawledPagesSection: React.FC<CrawledPagesSectionProps> = ({
  crawledPages,
  crawledPagesLoading,
  crawledPagesError,
  onRefreshCrawledPages,
  onViewPageSummary,
  onDeleteCrawledPage,
  onRetryPage,
  documents = [],
  documentsLoading = false,
  onRefreshDocuments,
  onDeleteDocument,
  onDeleteCrawledPages,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    "success" | "failed" | "documents"
  >("success");
  const [selectedUrls, setSelectedUrls] = React.useState<Set<string>>(
    new Set(),
  );

  const successPages = crawledPages.filter((p) => p.status !== "failed");
  const failedPages = crawledPages.filter((p) => p.status === "failed");

  // Filter documents to show only uploaded ones (exclude those that match crawled page URLs)
  // We assume if a document filename matches a crawled page URL, it's a crawled page entry
  const crawledUrls = new Set(crawledPages.map((p) => p.url));
  const uploadedDocuments = documents.filter(
    (doc) => !crawledUrls.has(doc.filename),
  );

  const displayedItems =
    activeTab === "success"
      ? successPages
      : activeTab === "failed"
        ? failedPages
        : uploadedDocuments;

  const isLoading =
    activeTab === "documents" ? documentsLoading : crawledPagesLoading;

  // Clear selection when tab changes
  React.useEffect(() => {
    setSelectedUrls(new Set());
  }, [activeTab]);

  const handleRefresh = () => {
    if (activeTab === "documents" && onRefreshDocuments) {
      onRefreshDocuments();
    } else {
      onRefreshCrawledPages();
    }
  };

  const toggleSelection = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedUrls(newSelected);
  };

  const toggleSelectAll = () => {
    if (
      selectedUrls.size === displayedItems.length &&
      displayedItems.length > 0
    ) {
      setSelectedUrls(new Set());
    } else {
      const allUrls = displayedItems.map((item) =>
        activeTab === "documents"
          ? (item as Document).filename
          : (item as CrawledPage).url,
      );
      setSelectedUrls(new Set(allUrls));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUrls.size === 0) return;

    if (activeTab === "documents") {
      // Bulk delete for documents not implemented yet/requested
      // But we can iterate if needed, or just support crawled pages for now
      // The user specifically asked for "knowledge base crawled pages"
      if (onDeleteDocument) {
        // Warning: this would trigger multiple API calls if we don't have a bulk endpoint for docs
        // For now, let's just support crawled pages as requested
        Array.from(selectedUrls).forEach((url) => onDeleteDocument(url));
        setSelectedUrls(new Set());
      }
    } else {
      if (onDeleteCrawledPages) {
        const pagesToDelete = crawledPages.filter((p) =>
          selectedUrls.has(p.url),
        );
        onDeleteCrawledPages(pagesToDelete);
        setSelectedUrls(new Set());
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header & Tabs */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="text-indigo-600" size={24} />
            Knowledge Base
          </h2>

          <div className="flex items-center gap-3">
            {selectedUrls.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                <Trash2 size={16} />
                Delete Selected ({selectedUrls.size})
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isLoading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:scale-95"
              }`}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              {isLoading ? "Refreshing..." : "Refresh List"}
            </button>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("success")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "success"
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <CheckCircle size={16} />
            Crawled Pages
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === "success"
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {successPages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("failed")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "failed"
                ? "bg-white text-red-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <AlertCircle size={16} />
            Pending / Failed
            {failedPages.length > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === "failed"
                    ? "bg-red-50 text-red-600"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {failedPages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === "documents"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <FileText size={16} />
            Uploaded Documents
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === "documents"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {uploadedDocuments.length}
            </span>
          </button>
        </div>

        {/* Select All Bar */}
        {displayedItems.length > 0 &&
          (activeTab === "success" || activeTab === "failed") && (
            <div className="mt-4 flex items-center gap-3 px-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={
                  selectedUrls.size === displayedItems.length &&
                  displayedItems.length > 0
                }
                onChange={toggleSelectAll}
              />
              <span className="text-sm text-slate-600">
                Select All ({displayedItems.length})
              </span>
            </div>
          )}
      </div>

      {/* Error Display */}
      {crawledPagesError && (
        <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle size={20} />
          {crawledPagesError}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {isLoading && displayedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="animate-spin text-indigo-500 mb-4 mx-auto">
              <RefreshCw size={32} />
            </div>
            <p className="text-slate-500 font-medium">Loading content...</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="text-4xl mb-4 opacity-50">
              {activeTab === "success"
                ? "🌐"
                : activeTab === "failed"
                  ? "⚠️"
                  : "📄"}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">
              {activeTab === "success"
                ? "No crawled pages found"
                : activeTab === "failed"
                  ? "No failed pages"
                  : "No uploaded documents"}
            </h3>
            <p className="text-slate-500 text-sm">
              {activeTab === "documents"
                ? "Upload documents in the Upload section to see them here."
                : "Start crawling your website to populate this list."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeTab === "documents"
              ? // Documents List
                (displayedItems as Document[]).map((doc) => (
                  <div
                    key={doc.filename}
                    className="group bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-semibold text-slate-800 truncate"
                          title={doc.filename}
                        >
                          {doc.filename}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                            {doc.count} chunks
                          </span>
                          {doc.hasStructuredSummary && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle size={10} /> Has Summary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {onDeleteDocument && (
                      <button
                        onClick={() => onDeleteDocument(doc.filename)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))
              : // Crawled Pages List (Success or Failed)
                (displayedItems as CrawledPage[]).map((page) => (
                  <div
                    key={page._id}
                    className={`group bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-all ${
                      selectedUrls.has(page.url)
                        ? "border-indigo-400 ring-1 ring-indigo-400"
                        : "border-slate-200 hover:border-indigo-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          className="mt-3 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                          checked={selectedUrls.has(page.url)}
                          onChange={() => toggleSelection(page.url)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className={`p-2 rounded-lg mt-0.5 ${
                            page.status === "failed"
                              ? "bg-red-50 text-red-500"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {page.status === "failed" ? (
                            <AlertCircle size={18} />
                          ) : (
                            <Globe size={18} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-800 hover:text-indigo-600 hover:underline truncate block transition-colors"
                          >
                            {page.url}
                          </a>

                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              Created:{" "}
                              {new Date(page.createdAt).toLocaleDateString()}
                            </span>

                            {page.status === "failed" ? (
                              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                Failed
                              </span>
                            ) : (
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1 border ${
                                  page.hasStructuredSummary
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}
                              >
                                {page.hasStructuredSummary ? (
                                  <>
                                    <CheckCircle size={10} />
                                    Summary Ready
                                  </>
                                ) : (
                                  <>
                                    <Zap size={10} />
                                    Needs Summary
                                  </>
                                )}
                              </span>
                            )}
                          </div>

                          {page.status === "failed" && page.error && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 font-mono">
                              {page.error}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-11 sm:pl-0 w-full sm:w-auto">
                        {page.status === "failed" ? (
                          <button
                            onClick={() => onRetryPage(page)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            <RefreshCw size={14} />
                            Retry
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewPageSummary(page)}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
                              page.hasStructuredSummary
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-amber-500 hover:bg-amber-600"
                            }`}
                          >
                            {page.hasStructuredSummary ? (
                              <Eye size={14} />
                            ) : (
                              <Zap size={14} />
                            )}
                            {page.hasStructuredSummary ? "View" : "Generate"}
                          </button>
                        )}

                        {page.status !== "failed" && (
                          <button
                            onClick={() => onRetryPage(page)}
                            className="flex-none p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            title="Recrawl page"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteCrawledPage(page)}
                          className="flex-none p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete page"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawledPagesSection;
