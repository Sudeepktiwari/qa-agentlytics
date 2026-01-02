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
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold text-slate-800 flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          Chatbot Testing
        </h2>
        <p className="text-slate-500 text-base m-0">
          Test your chatbot as if a user is on a specific page
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <label
          htmlFor="sitemap-url-dropdown"
          className="block text-slate-700 text-base font-semibold mb-3"
        >
          🌐 Simulate User on Page:
        </label>
        <select
          id="sitemap-url-dropdown"
          value={selectedPageUrl}
          onChange={(e) => onSelectedPageUrlChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
        >
          <option value="">(Select a page URL to test)</option>
          {Array.from(new Map(sitemapUrls.map((u) => [u.url, u])).values()).map(
            (u, index) => (
              <option key={`${u.url}-${index}`} value={u.url}>
                {u.url} {u.crawled ? "✅ (crawled)" : "⏳ (not crawled)"}
              </option>
            )
          )}
        </select>
        <div className="mt-2 text-xs text-slate-400">
          Select a page to simulate the chatbot context for that specific URL.
        </div>
      </div>
    </div>
  );
};

export default TestingSection;
