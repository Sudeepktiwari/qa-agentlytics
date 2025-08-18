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
  crawledPages?: CrawledPage[];
  crawledPagesLoading?: boolean;
  crawledPagesError?: string;
  onRefreshCrawledPages?: () => void;
  onViewPageSummary?: (page: CrawledPage) => void;
  onDeleteCrawledPage?: (page: CrawledPage) => void;
}

const DocumentManagementSection: React.FC<DocumentManagementSectionProps> = ({
  documents,
  documentsLoading,
  documentsError,
  documentsExpanded,
  onToggleDocumentsExpanded,
  onRefreshDocuments,
  onDeleteDocument,
  crawledPages = [],
  crawledPagesLoading = false,
  crawledPagesError = "",
  onRefreshCrawledPages,
  onViewPageSummary,
  onDeleteCrawledPage,
}) => {
  const showCrawledPages = crawledPages !== undefined && onRefreshCrawledPages && onViewPageSummary && onDeleteCrawledPage;

  if (showCrawledPages) {
    return (
      <div style={{ background: "white", borderRadius: "20px", padding: "32px", marginBottom: "32px" }}>
        <h2>📚 Crawled Pages Library</h2>
        {documentsExpanded && (
          <div>
            {crawledPagesLoading ? (
              <div>Loading crawled pages...</div>
            ) : (
              <div>
                {crawledPages.map((page) => (
                  <div key={page._id} style={{ padding: "16px", border: "1px solid #ccc", margin: "8px 0" }}>
                    <div>{page.url}</div>
                    <div>
                      <button onClick={() => onViewPageSummary?.(page)}>
                        {page.hasStructuredSummary ? "👁️ View Summary" : "⚡ Generate Summary"}
                      </button>
                      <button onClick={() => onDeleteCrawledPage?.(page)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "20px", padding: "32px", marginBottom: "32px" }}>
      <h2>📚 Document Library</h2>
      {documentsExpanded && (
        <div>
          {documentsLoading ? (
            <div>Loading documents...</div>
          ) : (
            <div>
              {documents.map((doc) => (
                <div key={doc.filename} style={{ padding: "16px", border: "1px solid #ccc", margin: "8px 0" }}>
                  <div>{doc.filename} ({doc.count} chunks)</div>
                  <button onClick={() => onDeleteDocument(doc.filename)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentManagementSection;
