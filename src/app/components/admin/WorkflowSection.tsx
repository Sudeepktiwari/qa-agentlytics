"use client";
import React, { useState, useEffect } from "react";
import { Settings, Loader2 } from "lucide-react";

interface WorkflowSectionProps {
  // No specific props needed based on the source file,
  // but we might want to pass things later.
}

export default function WorkflowSection() {
  // Data State
  const [crawledPages, setCrawledPages] = useState<any[]>([]);
  const [pageSearch, setPageSearch] = useState("");
  const [pagePage, setPagePage] = useState(1);
  const [pagePageSize, setPagePageSize] = useState(10);
  const [pageTotal, setPageTotal] = useState(0);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(
    null,
  );
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<
    number | null
  >(null);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<{
    title: string;
    answer: string;
    options?: string[];
  } | null>(null);
  const [pageTypeFilter, setPageTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (options?: { page?: number; search?: string }) => {
    try {
      setLoading(true);

      const targetPage =
        options && typeof options.page === "number"
          ? options.page
          : pagePage || 1;
      const targetSearch =
        options && typeof options.search === "string"
          ? options.search
          : pageSearch || "";
      const query = new URLSearchParams();
      query.set("page", String(targetPage));
      query.set("pageSize", String(pagePageSize));
      query.set("workflowOnly", "true");
      if (targetSearch.trim().length > 0) {
        query.set("search", targetSearch.trim());
      }

      const pagesRes = await fetch(`/api/crawled-pages?${query.toString()}`);
      const pagesData = await pagesRes.json();

      if (pagesRes.ok) {
        // Data is already filtered by backend
        const pages = pagesData.pages || [];

        const filtered =
          pageTypeFilter && pageTypeFilter.length > 0
            ? pages.filter(
                (p: any) =>
                  String(p?.structuredSummary?.pageType || "").toLowerCase() ===
                  pageTypeFilter.toLowerCase(),
              )
            : pages;

        setCrawledPages(filtered);
        // Use total from backend, or fallback to length if not provided (though backend should provide it)
        setPageTotal(pagesData.total || filtered.length || 0);
        setPagePage(targetPage);
        setPageSearch(targetSearch);
        setSelectedPageIndex(null);
        setSelectedSectionIndex(null);
      }
    } catch (error) {
      console.error("Failed to fetch workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500" />
          Workflow Rules
        </h2>
        <p className="text-sm text-slate-500">
          Visualize and manage the conversation workflow for each page.
        </p>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            placeholder="Filter by URL..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full md:w-64"
          />
          <select
            value={pageTypeFilter}
            onChange={(e) => {
              setPageTypeFilter(e.target.value);
              fetchData({ page: 1, search: pageSearch.trim() });
            }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="homepage">Homepage</option>
            <option value="pricing">Pricing</option>
            <option value="features">Features</option>
            <option value="about">About</option>
            <option value="contact">Contact</option>
            <option value="blog">Blog</option>
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={() => fetchData({ page: 1, search: pageSearch.trim() })}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            {(pageTotal || 0) > 0
              ? `Showing page ${pagePage} of ${Math.max(
                  1,
                  Math.ceil((pageTotal || 0) / pagePageSize),
                )}`
              : "No pages"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                pagePage > 1 &&
                fetchData({ page: pagePage - 1, search: pageSearch })
              }
              disabled={pagePage <= 1}
              className={`px-2 py-1 rounded border text-xs ${
                pagePage <= 1
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Prev
            </button>
            <button
              onClick={() => {
                const maxPage =
                  pageTotal && pagePageSize
                    ? Math.ceil(pageTotal / pagePageSize)
                    : 1;
                if (pagePage < maxPage) {
                  fetchData({
                    page: pagePage + 1,
                    search: pageSearch,
                  });
                }
              }}
              disabled={
                !pageTotal ||
                !pagePageSize ||
                pagePage >= Math.ceil(pageTotal / pagePageSize)
              }
              className={`px-2 py-1 rounded border text-xs ${
                !pageTotal ||
                !pagePageSize ||
                pagePage >= Math.ceil(pageTotal / pagePageSize)
                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-600 font-medium">Loading workflow data...</p>
        </div>
      ) : crawledPages.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">
            No crawled pages found with workflow data. Crawl a website to
            generate workflow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {crawledPages.map((page, idx) => {
            const isPageExpanded = idx === selectedPageIndex;
            const summary = page.structuredSummary || {};
            const sections =
              Array.isArray(summary.sections) && summary.sections.length > 0
                ? summary.sections
                : [];

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => {
                    if (isPageExpanded) {
                      setSelectedPageIndex(null);
                    } else {
                      setSelectedPageIndex(idx);
                      setSelectedSectionIndex(null);
                    }
                  }}
                  className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    isPageExpanded
                      ? "bg-slate-50 border-b border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-2 rounded-lg ${isPageExpanded ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      <Settings className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-slate-900 truncate text-base">
                        {page.url}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {summary.pageType
                            ? String(summary.pageType)
                            : "Unknown type"}
                        </span>
                        <span className="text-xs text-slate-400">
                          • {new Date(page.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-medium text-slate-700">
                        {sections.length} Sections
                      </div>
                      <div className="text-xs text-slate-400">
                        Click to expand
                      </div>
                    </div>
                    <span
                      className={`transform transition-transform duration-200 ${isPageExpanded ? "rotate-90" : ""}`}
                    >
                      ▸
                    </span>
                  </div>
                </button>

                {isPageExpanded && (
                  <div className="p-4 bg-slate-50/50">
                    <div className="space-y-3">
                      {sections.length === 0 ? (
                        <div className="text-sm text-slate-500 italic p-4 text-center">
                          No sections found for this page.
                        </div>
                      ) : (
                        sections.map((section: any, secIdx: number) => {
                          const isOpen = selectedSectionIndex === secIdx;
                          const leadCount = Array.isArray(section.leadQuestions)
                            ? section.leadQuestions.length
                            : section.leadQuestion
                              ? 1
                              : 0;
                          const salesCount = Array.isArray(
                            section.salesQuestions,
                          )
                            ? section.salesQuestions.length
                            : section.salesQuestion
                              ? 1
                              : 0;

                          return (
                            <div
                              key={secIdx}
                              className="border border-slate-200 rounded-lg bg-white shadow-sm"
                            >
                              <button
                                onClick={() =>
                                  setSelectedSectionIndex(
                                    isOpen ? null : secIdx,
                                  )
                                }
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    {section.sectionName ||
                                      `Section ${secIdx + 1}`}
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                      {leadCount} Lead Qs
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      {salesCount} Sales Qs
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-slate-400 transform transition-transform ${isOpen ? "rotate-180" : ""}`}
                                  >
                                    ▼
                                  </span>
                                </div>
                              </button>

                              {isOpen && (
                                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                                    {/* Lead Questions Column */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 pb-2 border-b border-blue-100">
                                        <div className="bg-blue-100 p-1 rounded">
                                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                          Lead Workflow
                                        </span>
                                      </div>

                                      {(
                                        section.leadQuestions ||
                                        (section.leadQuestion
                                          ? [
                                              {
                                                question: section.leadQuestion,
                                                options: section.leadOptions,
                                                tags: section.leadTags,
                                                workflow: "legacy",
                                              },
                                            ]
                                          : [])
                                      ).map((q: any, qIdx: number) => (
                                        <div
                                          key={qIdx}
                                          className="bg-blue-50/50 rounded-lg border border-blue-100 overflow-hidden"
                                        >
                                          <div className="p-3 border-b border-blue-100/50 bg-blue-50/80 flex justify-between items-start gap-2">
                                            <span className="text-xs font-bold text-blue-600">
                                              Q{qIdx + 1}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-blue-100">
                                              {q.workflow || "legacy"}
                                            </span>
                                          </div>
                                          <div className="p-3 space-y-3">
                                            <p className="text-sm font-medium text-slate-800">
                                              {q.question}
                                            </p>

                                            {/* Options */}
                                            {q.options &&
                                              q.options.length > 0 && (
                                                <div className="space-y-2">
                                                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                    Options
                                                  </span>
                                                  <ul className="space-y-1.5">
                                                    {q.options.map(
                                                      (opt: any, i: number) => (
                                                        <li
                                                          key={i}
                                                          onClick={() => {
                                                            if (
                                                              opt?.diagnostic_answer
                                                            ) {
                                                              setSelectedDiagnostic(
                                                                {
                                                                  title:
                                                                    opt.label ||
                                                                    String(opt),
                                                                  answer:
                                                                    opt.diagnostic_answer,
                                                                  options:
                                                                    opt.diagnostic_options,
                                                                },
                                                              );
                                                            }
                                                          }}
                                                          className={`text-sm bg-white p-2 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-2 ${
                                                            opt?.diagnostic_answer
                                                              ? "cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all ring-1 ring-transparent hover:ring-blue-100"
                                                              : ""
                                                          }`}
                                                        >
                                                          <span className="text-slate-700">
                                                            {typeof opt ===
                                                              "object" &&
                                                            opt &&
                                                            typeof opt.label ===
                                                              "string"
                                                              ? opt.label
                                                              : String(opt)}
                                                          </span>
                                                          <div className="flex items-center gap-1 flex-wrap">
                                                            {/* Tags */}
                                                            {Array.isArray(
                                                              opt?.tags,
                                                            ) &&
                                                            opt.tags.length >
                                                              0 ? (
                                                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                                                {opt.tags.join(
                                                                  ", ",
                                                                )}
                                                              </span>
                                                            ) : q.tags?.[i] ? (
                                                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                                                                {q.tags[i]}
                                                              </span>
                                                            ) : null}

                                                            {/* Workflow Next Step */}
                                                            {typeof opt?.workflow ===
                                                              "string" &&
                                                              opt.workflow && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                                  <span>→</span>{" "}
                                                                  {opt.workflow}
                                                                </span>
                                                              )}

                                                            {/* Diagnostic Indicator */}
                                                            {opt?.diagnostic_answer && (
                                                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                View
                                                              </span>
                                                            )}
                                                          </div>
                                                        </li>
                                                      ),
                                                    )}
                                                  </ul>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      ))}

                                      {!section.leadQuestions &&
                                        !section.leadQuestion && (
                                          <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">
                                            No lead questions generated.
                                          </div>
                                        )}
                                    </div>

                                    {/* Sales Questions Column */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2 pb-2 border-b border-green-100">
                                        <div className="bg-green-100 p-1 rounded">
                                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                          Sales Workflow
                                        </span>
                                      </div>

                                      {(
                                        section.salesQuestions ||
                                        (section.salesQuestion
                                          ? [
                                              {
                                                question: section.salesQuestion,
                                                options: section.salesOptions,
                                                tags: section.salesTags,
                                                workflow: "legacy",
                                              },
                                            ]
                                          : [])
                                      ).map((q: any, qIdx: number) => (
                                        <div
                                          key={qIdx}
                                          className="bg-green-50/50 rounded-lg border border-green-100 overflow-hidden"
                                        >
                                          <div className="p-3 border-b border-green-100/50 bg-green-50/80 flex justify-between items-start gap-2">
                                            <span className="text-xs font-bold text-green-600">
                                              Q{qIdx + 1}
                                            </span>
                                            <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-green-100">
                                              {q.workflow || "legacy"}
                                            </span>
                                          </div>
                                          <div className="p-3 space-y-3">
                                            <p className="text-sm font-medium text-slate-800">
                                              {q.question}
                                            </p>

                                            {/* Options */}
                                            {q.options &&
                                              q.options.length > 0 && (
                                                <div className="space-y-2">
                                                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                                    Options
                                                  </span>
                                                  <ul className="space-y-1.5">
                                                    {q.options.map(
                                                      (opt: any, i: number) => (
                                                        <li
                                                          key={i}
                                                          onClick={() => {
                                                            if (
                                                              opt?.diagnostic_answer
                                                            ) {
                                                              setSelectedDiagnostic(
                                                                {
                                                                  title:
                                                                    opt.label ||
                                                                    String(opt),
                                                                  answer:
                                                                    opt.diagnostic_answer,
                                                                  options:
                                                                    opt.diagnostic_options,
                                                                },
                                                              );
                                                            }
                                                          }}
                                                          className={`text-sm bg-white p-2 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-2 ${
                                                            opt?.diagnostic_answer
                                                              ? "cursor-pointer hover:border-green-400 hover:shadow-sm transition-all ring-1 ring-transparent hover:ring-green-100"
                                                              : ""
                                                          }`}
                                                        >
                                                          <span className="text-slate-700">
                                                            {typeof opt ===
                                                              "object" &&
                                                            opt &&
                                                            typeof opt.label ===
                                                              "string"
                                                              ? opt.label
                                                              : String(opt)}
                                                          </span>
                                                          <div className="flex items-center gap-1 flex-wrap">
                                                            {/* Tags */}
                                                            {Array.isArray(
                                                              opt?.tags,
                                                            ) &&
                                                            opt.tags.length >
                                                              0 ? (
                                                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                                                                {opt.tags.join(
                                                                  ", ",
                                                                )}
                                                              </span>
                                                            ) : q.tags?.[i] ? (
                                                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                                                                {q.tags[i]}
                                                              </span>
                                                            ) : null}

                                                            {/* Workflow Next Step */}
                                                            {typeof opt?.workflow ===
                                                              "string" &&
                                                              opt.workflow && (
                                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                                                  <span>→</span>{" "}
                                                                  {opt.workflow}
                                                                </span>
                                                              )}

                                                            {/* Diagnostic Indicator */}
                                                            {opt?.diagnostic_answer && (
                                                              <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                View
                                                              </span>
                                                            )}
                                                          </div>
                                                        </li>
                                                      ),
                                                    )}
                                                  </ul>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      ))}

                                      {!section.salesQuestions &&
                                        !section.salesQuestion && (
                                          <div className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">
                                            No sales questions generated.
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {selectedDiagnostic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">
                Diagnostic Answer
              </h3>
              <button
                onClick={() => setSelectedDiagnostic(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Selected Option
                </span>
                <p className="font-medium text-slate-800">
                  {selectedDiagnostic.title}
                </p>
              </div>
              <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
                {selectedDiagnostic.answer}
              </div>
              {selectedDiagnostic.options &&
                selectedDiagnostic.options.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-2">
                      Recommended Actions
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDiagnostic.options.map((opt, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 font-medium hover:bg-blue-100 cursor-default transition-colors"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedDiagnostic(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
