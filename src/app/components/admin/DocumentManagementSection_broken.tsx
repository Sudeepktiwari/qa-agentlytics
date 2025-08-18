"use client";

import React from "react";

interface Document {
  filename: string;
  count: number;
}

interface CrawledPage {
  _id: string;
  url: string;
  hasStructuredSummary: boolean;
  createdAt: string;
  text?: string;
  summary?: string;
  structuredSummary?: any;
}

interface DocumentManagementSectionProps {
  documents: Document[];
  documentsLoading: boolean;
  documentsError: string;
  documentsExpanded: boolean;
  onToggleDocumentsExpanded: () => void;
  onRefreshDocuments: () => void;
  onDeleteDocument: (filename: string) => void;
  crawledPages: CrawledPage[];
  crawledPagesLoading: boolean;
  crawledPagesError: string;
  onRefreshCrawledPages: () => void;
  onViewPageSummary: (page: CrawledPage) => void;
  onDeleteCrawledPage: (page: CrawledPage) => void;
}

const DocumentManagementSection: React.FC<DocumentManagementSectionProps> = ({
  documents,
  documentsLoading,
  documentsError,
  documentsExpanded,
  onToggleDocumentsExpanded,
  onRefreshDocuments,
  onDeleteDocument,
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
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <div
          onClick={onToggleDocumentsExpanded}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: "8px",
            borderRadius: "12px",
            marginBottom: documentsExpanded ? "16px" : "0",
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLDivElement;
            target.style.background = "rgba(102, 126, 234, 0.05)";
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLDivElement;
            target.style.background = "transparent";
          }}
        >
          <div>
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
              📚 Document Library
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
                {documents.length + crawledPages.length} items
              </span>
            </h2>
            <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
              Manage documents and crawled pages - View summaries for pages
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#667eea",
              fontWeight: "600",
            }}
          >
            <span>{documentsExpanded ? "Collapse" : "Expand"}</span>
            <span
              style={{
                transform: documentsExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
                transition: "transform 0.2s ease",
                fontSize: "16px",
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      {documentsExpanded && (
        <div>
          {/* Refresh Buttons */}
          <div style={{ marginBottom: "24px", display: "flex", gap: "12px" }}>
            <button
              onClick={onRefreshDocuments}
              disabled={documentsLoading}
              style={{
                padding: "12px 20px",
                background: documentsLoading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: documentsLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: documentsLoading
                  ? "none"
                  : "0 4px 12px rgba(72, 187, 120, 0.3)",
              }}
            >
              {documentsLoading ? "⏳ Loading..." : "🔄 Refresh Documents"}
            </button>
            <button
              onClick={onRefreshCrawledPages}
              disabled={crawledPagesLoading}
              style={{
                padding: "12px 20px",
                background: crawledPagesLoading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                  : "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
            >
              {crawledPagesLoading ? "⏳ Loading..." : "📄 Refresh Pages"}
            </button>
          </div>

          {/* Error Display */}
          {(documentsError || crawledPagesError) && (
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
              {documentsError && <div>Documents: {documentsError}</div>}
              {crawledPagesError && <div>Pages: {crawledPagesError}</div>}
            </div>
          )}

          {/* Documents Content */}
          {documentsLoading || crawledPagesLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
                fontSize: "16px",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
              Loading documents and pages...
            </div>
          ) : documents.length === 0 && crawledPages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
                No content available
              </h3>
              <p style={{ margin: 0, fontSize: "16px" }}>
                Upload documents or crawl pages to get started!
              </p>
            </div>
          ) : (
            <>
              {/* Simple unified list */}
              <div style={{ display: "grid", gap: "12px" }}>
                {/* Documents */}
                {documents.map((doc) => (
                  <div
                    key={`doc-${doc.filename}`}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLDivElement;
                      target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
                      target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLDivElement;
                      target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                      target.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <span style={{ fontSize: "20px" }}>📄</span>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#2d3748",
                            fontSize: "16px",
                          }}
                        >
                          {doc.filename}
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096" }}>
                          Document • {doc.count} chunks
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteDocument(doc.filename)}
                      style={{
                        background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 16px",
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
                      🗑️ Delete
                    </button>
                  </div>
                ))}

                {/* Crawled Pages */}
                {crawledPages.map((page) => (
                  <div
                    key={`page-${page._id}`}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLDivElement;
                      target.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.1)";
                      target.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLDivElement;
                      target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                      target.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <span style={{ fontSize: "20px" }}>🌐</span>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "#2d3748",
                            fontSize: "16px",
                            wordBreak: "break-all",
                          }}
                        >
                          {page.url}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "#718096" }}>
                            Web Page • {new Date(page.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: page.hasStructuredSummary
                                ? "linear-gradient(135deg, #48bb7820, #38a16920)"
                                : "linear-gradient(135deg, #ed8f3620, #dd696820)",
                              color: page.hasStructuredSummary ? "#38a169" : "#dd6968",
                              fontWeight: "600",
                            }}
                          >
                            {page.hasStructuredSummary ? "Has Summary" : "Needs Summary"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
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
                        {page.hasStructuredSummary ? "👁️ View Summary" : "⚡ Generate Summary"}
                      </button>
                      <button
                        onClick={() => onDeleteCrawledPage(page)}
                        style={{
                          background: "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
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
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentManagementSection;
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>🧩</span>
                    <strong style={{ color: "#2d3748" }}>
                      Doc Chunks:{" "}
                      {documents.reduce((sum, doc) => sum + doc.count, 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Combined Content */}
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
                          background:
                            "linear-gradient(135deg, #f7fafc, #edf2f7)",
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
                          📄 Name / URL
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
                          🏷️ Type
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
                          📊 Info
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
                      {/* Documents */}
                      {documents.map((doc, index) => (
                        <tr
                          key={`doc-${doc.filename}`}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#fff" : "#f8fafc",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            const target =
                              e.currentTarget as HTMLTableRowElement;
                            target.style.backgroundColor = "#f1f5f9";
                          }}
                          onMouseLeave={(e) => {
                            const target =
                              e.currentTarget as HTMLTableRowElement;
                            target.style.backgroundColor =
                              index % 2 === 0 ? "#fff" : "#f8fafc";
                          }}
                        >
                          <td
                            style={{
                              padding: "16px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              maxWidth: "400px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span style={{ fontSize: "16px" }}>📄</span>
                              <span
                                style={{
                                  fontWeight: "600",
                                  color: "#2d3748",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={doc.filename}
                              >
                                {doc.filename}
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
                            <span
                              style={{
                                background:
                                  "linear-gradient(135deg, #48bb7820, #38a16920)",
                                color: "#38a169",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              Document
                            </span>
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
                                  "linear-gradient(135deg, #667eea20, #764ba220)",
                                color: "#667eea",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {doc.count} chunks
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "16px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              textAlign: "center",
                            }}
                          >
                            <button
                              onClick={() => onDeleteDocument(doc.filename)}
                              style={{
                                background:
                                  "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
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
                                margin: "0 auto",
                              }}
                              onMouseEnter={(e) => {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = "translateY(-1px)";
                                target.style.boxShadow =
                                  "0 8px 25px rgba(245, 101, 101, 0.4)";
                              }}
                              onMouseLeave={(e) => {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = "translateY(0)";
                                target.style.boxShadow =
                                  "0 4px 12px rgba(245, 101, 101, 0.3)";
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Crawled Pages */}
                      {crawledPages.map((page, index) => {
                        const totalIndex = documents.length + index;
                        return (
                          <tr
                            key={`page-${page._id}`}
                            style={{
                              backgroundColor:
                                totalIndex % 2 === 0 ? "#fff" : "#f8fafc",
                              transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              const target =
                                e.currentTarget as HTMLTableRowElement;
                              target.style.backgroundColor = "#f1f5f9";
                            }}
                            onMouseLeave={(e) => {
                              const target =
                                e.currentTarget as HTMLTableRowElement;
                              target.style.backgroundColor =
                                totalIndex % 2 === 0 ? "#fff" : "#f8fafc";
                            }}
                          >
                            <td
                              style={{
                                padding: "16px 20px",
                                borderBottom: "1px solid #e2e8f0",
                                maxWidth: "400px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <span style={{ fontSize: "16px" }}>🌐</span>
                                <span
                                  style={{
                                    fontWeight: "600",
                                    color: "#2d3748",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                  title={page.url}
                                >
                                  {page.url}
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
                              <span
                                style={{
                                  background:
                                    "linear-gradient(135deg, #667eea20, #764ba220)",
                                  color: "#667eea",
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                Web Page
                              </span>
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
                                  background: page.hasStructuredSummary
                                    ? "linear-gradient(135deg, #48bb7820, #38a16920)"
                                    : "linear-gradient(135deg, #ed8f3620, #dd696820)",
                                  color: page.hasStructuredSummary
                                    ? "#38a169"
                                    : "#dd6968",
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                {page.hasStructuredSummary
                                  ? "✅ Has Summary"
                                  : "⚡ Needs Summary"}
                              </span>
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
                                  gap: "8px",
                                  justifyContent: "center",
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
                                    const target =
                                      e.target as HTMLButtonElement;
                                    target.style.transform = "translateY(-1px)";
                                  }}
                                  onMouseLeave={(e) => {
                                    const target =
                                      e.target as HTMLButtonElement;
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
                                    const target =
                                      e.target as HTMLButtonElement;
                                    target.style.transform = "translateY(-1px)";
                                  }}
                                  onMouseLeave={(e) => {
                                    const target =
                                      e.target as HTMLButtonElement;
                                    target.style.transform = "translateY(0)";
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info Box */}
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
                  💡 About Document Processing
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      color: "#4a5568",
                      fontSize: "14px",
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.6)",
                      borderRadius: "8px",
                    }}
                  >
                    <strong>📄 Chunks:</strong> Large documents are split into
                    smaller text chunks for better AI processing and more
                    accurate responses.
                  </div>
                  <div
                    style={{
                      color: "#4a5568",
                      fontSize: "14px",
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.6)",
                      borderRadius: "8px",
                    }}
                  >
                    <strong>🔍 Search:</strong> When users ask questions, the AI
                    searches through all chunks to find the most relevant
                    information.
                  </div>
                  <div
                    style={{
                      color: "#4a5568",
                      fontSize: "14px",
                      padding: "12px",
                      background: "rgba(255, 255, 255, 0.6)",
                      borderRadius: "8px",
                    }}
                  >
                    <strong>🗑️ Deletion:</strong> Deleting a document removes
                    all its chunks from the knowledge base permanently.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentManagementSection;
