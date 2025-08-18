"use client";

import React from "react";

interface CrawledPage {
  _id: string;
  url: string;
  hasStructuredSummary: boolean;
  createdAt: string;
  text?: string;
  summary?: string;
  structuredSummary?: any;
}

interface CrawledPagesSectionProps {
  crawledPages: CrawledPage[];
  crawledPagesLoading: boolean;
  crawledPagesError: string;
  onRefreshCrawledPages: () => void;
  onViewPageSummary: (page: CrawledPage) => void;
  onDeleteCrawledPage: (page: CrawledPage) => void;
}

const CrawledPagesSection: React.FC<CrawledPagesSectionProps> = ({
  crawledPages,
  crawledPagesLoading,
  crawledPagesError,
  onRefreshCrawledPages,
  onViewPageSummary,
  onDeleteCrawledPage,
}) => {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "32px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginBottom: "24px",
      }}
    >
      <h2
        style={{
          margin: "0 0 24px 0",
          fontSize: "24px",
          fontWeight: "700",
          color: "#2d3748",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        📚 Crawled Pages Library
        <span
          style={{
            background: "linear-gradient(135deg, #667eea20, #764ba220)",
            color: "#667eea",
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {crawledPages.length} pages
        </span>
      </h2>

      {/* Refresh Button */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={onRefreshCrawledPages}
          disabled={crawledPagesLoading}
          style={{
            padding: "12px 20px",
            background: crawledPagesLoading
              ? "#a0aec0"
              : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: crawledPagesLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: crawledPagesLoading
              ? "none"
              : "0 4px 12px rgba(72, 187, 120, 0.3)",
          }}
        >
          {crawledPagesLoading ? "⏳ Loading..." : "🔄 Refresh Pages"}
        </button>
      </div>

      {/* Error Display */}
      {crawledPagesError && (
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
          {crawledPagesError}
        </div>
      )}

      {/* Content */}
      {crawledPagesLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#718096",
            fontSize: "16px",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          Loading crawled pages...
        </div>
      ) : crawledPages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#718096",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
            No pages crawled yet
          </h3>
          <p style={{ margin: 0, fontSize: "16px" }}>
            Start crawling your website above to see pages here!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "16px",
          }}
        >
          {crawledPages.map((page) => (
            <div
              key={page._id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLDivElement;
                target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
                target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLDivElement;
                target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                target.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2d3748",
                      marginBottom: "8px",
                      wordBreak: "break-all",
                    }}
                  >
                    {page.url}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: page.hasStructuredSummary
                          ? "linear-gradient(135deg, #48bb7820, #38a16920)"
                          : "linear-gradient(135deg, #ed8f3620, #dd696820)",
                        color: page.hasStructuredSummary
                          ? "#38a169"
                          : "#dd6968",
                        fontWeight: "600",
                      }}
                    >
                      {page.hasStructuredSummary
                        ? "✅ Has Summary"
                        : "⚡ Needs Summary"}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#718096",
                      }}
                    >
                      {new Date(page.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <button
                    onClick={() => onViewPageSummary(page)}
                    style={{
                      background: page.hasStructuredSummary
                        ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
                        : "linear-gradient(135deg, #ed8f36 0%, #dd6968 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = "translateY(0)";
                    }}
                  >
                    {page.hasStructuredSummary
                      ? "👁️ View Summary"
                      : "⚡ Generate Summary"}
                  </button>
                  <button
                    onClick={() => onDeleteCrawledPage(page)}
                    style={{
                      background:
                        "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.transform = "translateY(0)";
                    }}
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
