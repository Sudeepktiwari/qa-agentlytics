"use client";

import React from "react";

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
}

const CrawledPagesSection: React.FC<CrawledPagesSectionProps> = ({
  crawledPages,
  crawledPagesLoading,
  crawledPagesError,
  onRefreshCrawledPages,
  onViewPageSummary,
  onDeleteCrawledPage,
  onRetryPage,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-8 shadow-lg border border-white/20 mb-6 transition-all">
      <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3 flex-wrap">
        📚 Crawled Pages Library
        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
          {crawledPages.length} pages
        </span>
      </h2>

      {/* Refresh Button */}
      <div className="mb-6">
        <button
          onClick={onRefreshCrawledPages}
          disabled={crawledPagesLoading}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-md active:scale-95 ${
            crawledPagesLoading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-gradient-to-br from-emerald-500 to-green-600 hover:shadow-lg hover:-translate-y-0.5"
          }`}
        >
          {crawledPagesLoading ? "⏳ Loading..." : "🔄 Refresh Pages"}
        </button>
      </div>

      {/* Error Display */}
      {crawledPagesError && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium">
          {crawledPagesError}
        </div>
      )}

      {/* Content */}
      {crawledPagesLoading ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading crawled pages...</p>
        </div>
      ) : crawledPages.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            No pages crawled yet
          </h3>
          <p>Start crawling your website above to see pages here!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {crawledPages.map((page) => (
            <div
              key={page._id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-slate-800 mb-2 break-all">
                    {page.url}
                  </div>
                  {page.status === "failed" ? (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-red-50 text-red-600 border border-red-100">
                          ❌ Failed
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(page.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {page.error && (
                        <div className="text-xs text-red-500 mt-1 font-mono bg-red-50/50 p-1.5 rounded border border-red-100">
                          Error: {page.error}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                          page.hasStructuredSummary
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {page.hasStructuredSummary
                          ? "✅ Has Summary"
                          : "⚡ Needs Summary"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {page.status === "failed" ? (
                    <button
                      onClick={() => onRetryPage(page)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm hover:-translate-y-0.5 bg-gradient-to-br from-blue-500 to-indigo-600 hover:shadow-blue-200"
                    >
                      🔄 Try Again
                    </button>
                  ) : (
                    <button
                      onClick={() => onViewPageSummary(page)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm hover:-translate-y-0.5 ${
                        page.hasStructuredSummary
                          ? "bg-gradient-to-br from-emerald-500 to-green-600"
                          : "bg-gradient-to-br from-orange-400 to-red-500"
                      }`}
                    >
                      {page.hasStructuredSummary
                        ? "👁️ View Summary"
                        : "⚡ Generate Summary"}
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteCrawledPage(page)}
                    className="flex-none px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-red-500 to-rose-600 transition-all shadow-sm hover:-translate-y-0.5"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrawledPagesSection;
