"use client";

import React from "react";

interface ContentCrawlingSectionProps {
  sitemapUrl: string;
  sitemapStatus: string | null;
  sitemapLoading: boolean;
  autoContinue: boolean;
  continueCrawling: boolean;
  totalProcessed: number;
  totalRemaining: number;
  onSitemapUrlChange: (url: string) => void;
  onSitemapSubmit: (e: React.FormEvent) => void;
  onAutoContinueChange: (enabled: boolean) => void;
  onContinueCrawling: () => void;
  onStopCrawling: () => void;
}

const ContentCrawlingSection: React.FC<ContentCrawlingSectionProps> = ({
  sitemapUrl,
  sitemapStatus,
  sitemapLoading,
  autoContinue,
  continueCrawling,
  totalProcessed,
  totalRemaining,
  onSitemapUrlChange,
  onSitemapSubmit,
  onAutoContinueChange,
  onContinueCrawling,
  onStopCrawling,
}) => {
  return (
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
          🌐 Content Crawling
        </h2>
        <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
          Add website content to train your chatbot with contextual information
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "12px",
          }}
        >
          {[
            "🎯 Provides contextual responses based on your content",
            "🔍 Automatically indexes all pages from your sitemap",
            "⚡ Updates chatbot knowledge base in real-time",
            "📄 Supports both sitemap.xml files and individual URLs",
            "🧠 Intelligent content chunking for better AI responses",
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                color: "#4a5568",
                fontSize: "14px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                textAlign: "center",
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSitemapSubmit} style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
          <input
            type="url"
            placeholder="https://example.com/sitemap.xml or any webpage URL"
            value={sitemapUrl}
            onChange={(e) => onSitemapUrlChange(e.target.value)}
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
              const target = e.target as HTMLInputElement;
              target.style.borderColor = "#667eea";
              target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              const target = e.target as HTMLInputElement;
              target.style.borderColor = "#e2e8f0";
              target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={sitemapLoading}
            style={{
              padding: "16px 24px",
              background: sitemapLoading
                ? "#a0aec0"
                : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: sitemapLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              boxShadow: sitemapLoading
                ? "none"
                : "0 4px 12px rgba(72, 187, 120, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!sitemapLoading) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = "translateY(-1px)";
                target.style.boxShadow = "0 8px 25px rgba(72, 187, 120, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!sitemapLoading) {
                const target = e.target as HTMLButtonElement;
                target.style.transform = "translateY(0)";
                target.style.boxShadow = "0 4px 12px rgba(72, 187, 120, 0.3)";
              }
            }}
          >
            {sitemapLoading ? "⏳ Crawling..." : "🚀 Start Crawling"}
          </button>
        </div>
      </form>

      {/* Auto-continue controls */}
      <div
        style={{
          marginBottom: "16px",
          padding: "16px",
          background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={autoContinue}
                onChange={(e) => onAutoContinueChange(e.target.checked)}
                disabled={sitemapLoading}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#48bb78",
                }}
              />
              🔄 Auto-continue crawling
            </label>

            {(totalProcessed > 0 || totalRemaining > 0) && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#718096",
                  background: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                📊 {totalProcessed} processed, {totalRemaining} remaining
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {totalRemaining > 0 && !sitemapLoading && (
              <button
                onClick={onContinueCrawling}
                style={{
                  padding: "8px 16px",
                  background:
                    "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
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
                ▶️ Continue Crawling
              </button>
            )}

            {sitemapLoading && (autoContinue || continueCrawling) && (
              <button
                onClick={onStopCrawling}
                style={{
                  padding: "8px 16px",
                  background:
                    "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
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
                ⏹️ Stop Crawling
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#718096",
            marginTop: "8px",
            lineHeight: "1.4",
          }}
        >
          💡 <strong>Auto-continue:</strong> Automatically processes all pages
          in batches without manual intervention. Large sitemaps will be
          processed incrementally to avoid timeouts.
        </div>
      </div>

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
  );
};

export default ContentCrawlingSection;
