"use client";

import React, { useState } from "react";
import {
  Globe,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Zap,
  FileText,
  Layers,
  Search,
  UploadCloud,
  ArrowRight,
  Database,
  Cpu,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"url" | "file">("url");
  const [openInfoSections, setOpenInfoSections] = useState<
    Record<string, boolean>
  >({});

  const toggleInfoSection = (section: string) => {
    setOpenInfoSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Determine status type for styling
  const isError =
    sitemapStatus?.toLowerCase().includes("fail") ||
    sitemapStatus?.toLowerCase().includes("error");
  const isSuccess = sitemapStatus?.includes("✅");
  const isActive = sitemapLoading || sitemapStatus || totalProcessed > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="border-b border-slate-100 bg-slate-50/50 p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-blue-600">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Knowledge Base Training
            </h2>
            <p className="text-sm text-slate-500">
              Import content to train your chatbot's intelligence
            </p>
          </div>
        </div>
        {/* <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <Cpu size={14} className="text-blue-500" />
          <span>AI Model: Gemini 1.5 Pro</span>
        </div> */}
      </div>

      <div className="p-4 sm:p-8">
        {!isActive ? (
          /* Step 1: Input Selection (Guided Flow) */
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Where should the chatbot learn from?
              </h3>
              <p className="text-slate-500">
                Connect a data source to begin the training process.
              </p>
            </div>

            {/* Source Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                <button
                  onClick={() => setActiveTab("url")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "url"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe size={16} />
                    Website / Sitemap
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("file")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "file"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UploadCloud size={16} />
                    Upload Documents
                  </span>
                </button>
              </div>
            </div>

            {activeTab === "url" ? (
              <div className="bg-white rounded-2xl p-1 border border-blue-100 shadow-lg shadow-blue-500/5 transition-all">
                <form
                  onSubmit={onSitemapSubmit}
                  className="flex flex-col sm:flex-row gap-2 p-2"
                >
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <LinkIcon size={18} />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com or https://example.com/sitemap.xml"
                      value={sitemapUrl}
                      onChange={(e) => onSitemapUrlChange(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    Start Training
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                  <UploadCloud size={24} />
                </div>
                <h4 className="text-slate-900 font-medium mb-1">
                  Upload not available yet
                </h4>
                <p className="text-slate-500 text-sm">
                  We are rolling out file uploads soon. Please use Sitemap or
                  Website URL for now.
                </p>
              </div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mt-12 border-t border-slate-100 pt-8">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Zap size={14} />
                </div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Fast Sync
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                  <Layers size={14} />
                </div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Smart Chunking
                </p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={14} />
                </div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Auto-Cleaning
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Processing (Active State) */
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    {sitemapLoading ? (
                      <>
                        <RefreshCw
                          size={18}
                          className="animate-spin text-blue-600"
                        />
                        Training in Progress
                      </>
                    ) : isSuccess ? (
                      <>
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Training Complete
                      </>
                    ) : isError ? (
                      <>
                        <AlertCircle size={18} className="text-red-500" />
                        Training Failed
                      </>
                    ) : (
                      "Training Paused"
                    )}
                  </h3>
                  {/* Controls */}
                  <div className="flex gap-2">
                    {totalRemaining > 0 && !sitemapLoading && (
                      <button
                        onClick={onContinueCrawling}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Play size={12} className="fill-current" />
                        Resume
                      </button>
                    )}
                    {sitemapLoading && (autoContinue || continueCrawling) && (
                      <button
                        onClick={onStopCrawling}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Square size={12} className="fill-current" />
                        Stop
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-500">
                  {sitemapLoading ? (
                    <>
                      Our AI is reading and indexing your content...
                      <span className="block mt-1 font-medium text-amber-600">
                        Please don’t refresh or close this page. The system
                        needs a few minutes to crawl and index your website.
                      </span>
                    </>
                  ) : isSuccess ? (
                    "Your chatbot has been updated with the latest knowledge."
                  ) : (
                    "Something went wrong. Check the logs below."
                  )}
                </p>
              </div>

              {/* Progress Visualization */}
              {(totalProcessed > 0 || totalRemaining > 0) && (
                <div className="p-6 bg-slate-50/50">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    <span>
                      Progress ({totalProcessed} /{" "}
                      {totalProcessed + totalRemaining})
                    </span>
                    <span>
                      {Math.round(
                        (totalProcessed /
                          (totalProcessed + totalRemaining || 1)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out relative ${
                        isError
                          ? "bg-red-500"
                          : isSuccess
                            ? "bg-emerald-500"
                            : "bg-blue-600"
                      }`}
                      style={{
                        width: `${Math.max(
                          5,
                          (totalProcessed /
                            (totalProcessed + totalRemaining || 1)) *
                            100,
                        )}%`,
                      }}
                    >
                      {sitemapLoading && !isError && !isSuccess && (
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={autoContinue}
                          onChange={(e) =>
                            onAutoContinueChange(e.target.checked)
                          }
                          disabled={sitemapLoading}
                          className="peer sr-only"
                        />
                        <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        Auto-process batches
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Console / Logs */}
            {sitemapStatus && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden font-mono text-xs">
                <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2 text-slate-400">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="ml-2">System Log</span>
                </div>
                <div className="p-4 text-slate-300 max-h-48 overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-line">
                  <span className="text-blue-400 mr-2">$</span>
                  {sitemapStatus}
                  {sitemapLoading && (
                    <span className="inline-block w-2 h-4 bg-slate-500 ml-1 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}

            {sitemapStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full pb-2 items-start">
                {/* What this means */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleInfoSection("meaning")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <Info size={16} className="text-blue-500" />
                      What this means
                    </span>
                    {openInfoSections["meaning"] ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </button>
                  {openInfoSections["meaning"] && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <ul className="space-y-2 text-sm text-slate-600 list-disc pl-4">
                        <li>
                          Pages are being crawled and validated before they are
                          indexed.
                        </li>
                        <li>
                          Some batches may show “0 pages processed” while the
                          system prepares the next set — this is expected
                          behavior.
                        </li>
                        <li>No action is required from you.</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* What happens next */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleInfoSection("next")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <HelpCircle size={16} className="text-emerald-500" />
                      What happens next
                    </span>
                    {openInfoSections["next"] ? (
                      <ChevronUp size={16} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </button>
                  {openInfoSections["next"] && (
                    <div className="p-4 bg-white border-t border-slate-100">
                      <ul className="space-y-2 text-sm text-slate-600 list-disc pl-4">
                        <li>
                          The system will automatically continue with the
                          remaining pages.
                        </li>
                        <li>
                          Indexed pages will appear in your Crawled Pages
                          Library once processing completes.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCrawlingSection;
