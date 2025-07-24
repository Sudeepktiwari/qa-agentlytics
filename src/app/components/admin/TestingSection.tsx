"use client";

import React from "react";

interface TestingSectionProps {
  auth: { email: string; adminId?: string } | null;
  sitemapUrls: { url: string; crawled: boolean }[];
  selectedPageUrl: string;
  onSelectedPageUrlChange: (url: string) => void;
}

const TestingSection: React.FC<TestingSectionProps> = ({
  auth,
  sitemapUrls,
  selectedPageUrl,
  onSelectedPageUrlChange,
}) => {
  if (!auth || sitemapUrls.length === 0) {
    return null;
  }

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
      <div style={{ marginBottom: "20px" }}>
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
          🧪 Chatbot Testing
        </h2>
        <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
          Test your chatbot as if a user is on a specific page
        </p>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #edf2f710, #e2e8f010)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <label
          htmlFor="sitemap-url-dropdown"
          style={{
            display: "block",
            color: "#4a5568",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
          }}
        >
          🌐 Simulate User on Page:
        </label>
        <select
          id="sitemap-url-dropdown"
          value={selectedPageUrl}
          onChange={(e) => onSelectedPageUrlChange(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#2d3748",
            background: "white",
            outline: "none",
          }}
        >
          <option value="">(Select a page URL to test)</option>
          {sitemapUrls.map((u) => (
            <option key={u.url} value={u.url}>
              {u.url} {u.crawled ? "✅ (crawled)" : "⏳ (not crawled)"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TestingSection;
