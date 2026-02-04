import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";

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
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
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
      if (targetSearch.trim().length > 0) {
        query.set("search", targetSearch.trim());
      }
      
      const pagesRes = await fetch(`/api/crawled-pages?${query.toString()}`);
      const pagesData = await pagesRes.json();
      
      if (pagesRes.ok) {
        const pages =
          (pagesData.pages || []).filter(
            (p: any) =>
              p &&
              p.hasStructuredSummary &&
              p.structuredSummary &&
              Array.isArray(p.structuredSummary.sections) &&
              p.structuredSummary.sections.length > 0,
          ) || [];
        const filtered =
          pageTypeFilter && pageTypeFilter.length > 0
            ? pages.filter(
                (p: any) =>
                  String(p?.structuredSummary?.pageType || "").toLowerCase() ===
                  pageTypeFilter.toLowerCase(),
              )
            : pages;
        setCrawledPages(filtered);
        setPageTotal(filtered.length || 0);
        setPagePage(targetPage);
        setPageSearch(targetSearch);
        setSelectedPageIndex(0);
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
          Generated Workflow Configuration
        </h2>
        <p className="text-sm text-slate-500">
          Review generated lead and sales qualification questions from
          your crawled pages.
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
            onClick={() =>
              fetchData({ page: 1, search: pageSearch.trim() })
            }
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

      {crawledPages.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">
            No crawled pages found with workflow data. Crawl a website to generate workflow.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500">
              Pages
            </div>
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
              {crawledPages.map((page, idx) => {
                const isActive = idx === selectedPageIndex;
                const summary = page.structuredSummary || {};
                const sections =
                  Array.isArray(summary.sections) &&
                  summary.sections.length > 0
                    ? summary.sections
                    : [];
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPageIndex(idx);
                      setSelectedSectionIndex(null);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm ${
                      isActive
                        ? "bg-blue-50 border-l-2 border-blue-500"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium text-slate-800 truncate">
                          {page.url}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {summary.pageType
                            ? String(summary.pageType)
                            : "Unknown type"}
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400 flex-shrink-0">
                        <div>
                          {new Date(
                            page.createdAt,
                          ).toLocaleDateString()}
                        </div>
                        <div>{sections.length} sections</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:flex-1 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {crawledPages[selectedPageIndex] ? (
              <div className="flex flex-col h-full">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex-1 overflow-hidden mr-2">
                    <div className="text-xs text-slate-400">
                      Selected page
                    </div>
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {crawledPages[selectedPageIndex].url}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">
                    {new Date(
                      crawledPages[selectedPageIndex].createdAt,
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto max-h-[420px]">
                  {(() => {
                    const page = crawledPages[selectedPageIndex];
                    const summary = page.structuredSummary || {};
                    const sections =
                      Array.isArray(summary.sections) &&
                      summary.sections.length > 0
                        ? summary.sections
                        : [];
                    if (sections.length === 0) {
                      return (
                        <div className="text-sm text-slate-500">
                          No sections found for this page.
                        </div>
                      );
                    }
                    return sections.map(
                      (section: any, secIdx: number) => {
                        const isOpen =
                          selectedSectionIndex === secIdx;
                        const leadCount = Array.isArray(
                          section.leadQuestions,
                        )
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
                            className="border border-slate-200 rounded-lg"
                          >
                            <button
                              onClick={() =>
                                setSelectedSectionIndex(
                                  isOpen ? null : secIdx,
                                )
                              }
                              className="w-full flex items-center justify-between px-4 py-3 text-left"
                            >
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-800">
                                  {section.sectionName ||
                                    `Section ${secIdx + 1}`}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {summary.pageType
                                    ? String(summary.pageType)
                                    : "Unknown type"}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mr-2">
                                <span>
                                  Leads: {leadCount} • Sales:{" "}
                                  {salesCount}
                                </span>
                                <span
                                  className={`transform transition-transform ${
                                    isOpen ? "rotate-90" : ""
                                  }`}
                                >
                                  ▸
                                </span>
                              </div>
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 pt-1 space-y-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                                        Leads
                                      </span>
                                      <span className="text-xs text-slate-500 font-mono">
                                        Lead Questions
                                      </span>
                                    </div>
                                    {(
                                      section.leadQuestions ||
                                      (section.leadQuestion
                                        ? [
                                            {
                                              question:
                                                section.leadQuestion,
                                              options:
                                                section.leadOptions,
                                              tags: section.leadTags,
                                              workflow: "legacy",
                                            },
                                          ]
                                        : [])
                                    ).map((q: any, qIdx: number) => (
                                      <div
                                        key={qIdx}
                                        className="space-y-3 p-3 bg-blue-50/30 rounded-lg border border-blue-100"
                                      >
                                        <div className="flex justify-between items-start gap-2">
                                          <span className="text-xs font-bold text-blue-400">
                                            Q{qIdx + 1}
                                          </span>
                                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded">
                                            {q.workflow || "legacy"}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">
                                          {q.question}
                                        </p>
                                        <div>
                                          <span className="text-xs text-slate-500 block mb-1">
                                            Options & Tags
                                          </span>
                                          <ul className="space-y-1">
                                            {q.options?.map(
                                              (
                                                opt: any,
                                                i: number,
                                              ) => (
                                                <li
                                                  key={i}
                                                  className="text-sm flex items-center justify-between bg-white p-1.5 rounded border border-blue-100"
                                                >
                                                  <span>
                                                    {typeof opt ===
                                                      "object" &&
                                                    opt &&
                                                    typeof opt.label ===
                                                      "string"
                                                      ? opt.label
                                                      : String(opt)}
                                                  </span>
                                                  <div className="flex items-center gap-1">
                                                    {Array.isArray(
                                                      opt?.tags,
                                                    ) &&
                                                    opt.tags.length >
                                                      0 ? (
                                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                        {opt.tags.join(
                                                          ", ",
                                                        )}
                                                      </span>
                                                    ) : q.tags?.[
                                                        i
                                                      ] ? (
                                                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                        {q.tags[i]}
                                                      </span>
                                                    ) : null}
                                                    {typeof opt?.workflow ===
                                                      "string" &&
                                                    opt.workflow ? (
                                                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                        {opt.workflow}
                                                      </span>
                                                    ) : null}
                                                  </div>
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-green-100 pb-2">
                                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                                        Sales
                                      </span>
                                      <span className="text-xs text-slate-500 font-mono">
                                        Sales Questions
                                      </span>
                                    </div>
                                    {(
                                      section.salesQuestions ||
                                      (section.salesQuestion
                                        ? [
                                            {
                                              question:
                                                section.salesQuestion,
                                              options:
                                                section.salesOptions,
                                              tags: section.salesTags,
                                              workflow: "legacy",
                                            },
                                          ]
                                        : [])
                                    ).map((q: any, qIdx: number) => (
                                      <div
                                        key={qIdx}
                                        className="space-y-3 p-3 bg-green-50/30 rounded-lg border border-green-100"
                                      >
                                        <div className="flex justify-between items-start gap-2">
                                          <span className="text-xs font-bold text-green-600">
                                            Q{qIdx + 1}
                                          </span>
                                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded">
                                            {q.workflow || "legacy"}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">
                                          {q.question}
                                        </p>
                                        <div>
                                          <span className="text-xs text-slate-500 block mb-1">
                                            Options & Tags
                                          </span>
                                          <ul className="space-y-1">
                                            {q.options?.map(
                                              (
                                                opt: any,
                                                i: number,
                                              ) => (
                                                <li
                                                  key={i}
                                                  className="text-sm flex items-center justify-between bg-white p-1.5 rounded border border-green-100"
                                                >
                                                  <span>
                                                    {typeof opt ===
                                                      "object" &&
                                                    opt &&
                                                    typeof opt.label ===
                                                      "string"
                                                      ? opt.label
                                                      : String(opt)}
                                                  </span>
                                                  <div className="flex items-center gap-1">
                                                    {Array.isArray(
                                                      opt?.tags,
                                                    ) &&
                                                    opt.tags.length >
                                                      0 ? (
                                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                        {opt.tags.join(
                                                          ", ",
                                                        )}
                                                      </span>
                                                    ) : q.tags?.[
                                                        i
                                                      ] ? (
                                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                        {q.tags[i]}
                                                      </span>
                                                    ) : null}
                                                    {typeof opt?.workflow ===
                                                      "string" &&
                                                    opt.workflow ? (
                                                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                        {opt.workflow}
                                                      </span>
                                                    ) : null}
                                                  </div>
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-slate-500">
                Select a page from the list to view its workflow
                configuration.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
