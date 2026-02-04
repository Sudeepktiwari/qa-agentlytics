"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import BantQualificationSection from "../../components/admin/BantQualificationSection";
import { Users, CreditCard, LayoutDashboard, Settings } from "lucide-react";

// Types
interface Lead {
  email: string;
  firstSeen: string;
  lastSeen: string;
  messageCount: number;
  latestRole: string;
  latestContent: string | { mainText: string };
}

interface SubscriptionStatus {
  planKey: string;
  status: string;
  usage: {
    leadsUsed: number;
    creditsUsed: number;
  };
  limits: {
    leadTotalLimit: number;
    creditMonthlyLimit: number;
  };
}

export default function WorkflowPage() {
  const [activeSection, setActiveSection] = useState("workflow");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [crawledPages, setCrawledPages] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Leads
      const leadsRes = await fetch("/api/leads?pageSize=5");
      const leadsData = await leadsRes.json();
      if (leadsRes.ok) {
        setLeads(leadsData.leads || []);
      }

      // Fetch Crawled Pages (Workflow Data)
      const pagesRes = await fetch("/api/crawled-pages");
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
        setCrawledPages(pages);
      }

      // Fetch Subscription/Sales
      const subRes = await fetch("/api/admin/subscription/status");
      const subData = await subRes.json();
      if (subRes.ok) {
        setSubscription(subData);
      }
    } catch (error) {
      console.error("Failed to fetch workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (section: string) => {
    if (section === "workflow") return;
    // Redirect to main admin panel for other sections
    window.location.href = `/admin?section=${section}`;
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLogout={() => (window.location.href = "/api/auth/logout")}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Workflow Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <MenuIcon />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Workflow & Performance
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your chatbot's qualification flow and monitor results.
              </p>
            </div>

            {/* Sales / Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Leads Generated"
                value={subscription?.usage?.leadsUsed || 0}
                total={subscription?.limits?.leadTotalLimit}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="blue"
              />
              <StatCard
                title="Current Plan"
                value={(subscription?.planKey || "Free").toUpperCase()}
                icon={<CreditCard className="w-6 h-6 text-purple-600" />}
                color="purple"
              />
              <StatCard
                title="Sales / Conversions"
                value={leads.length} // Placeholder for actual sales if different from leads
                subtitle="Qualified Leads"
                icon={<LayoutDashboard className="w-6 h-6 text-green-600" />}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Generated Leads Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Recent Generated Leads
                  </h2>
                  <a
                    href="/admin?section=leads"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-medium">
                      <tr>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center">
                            Loading...
                          </td>
                        </tr>
                      ) : leads.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 text-center">
                            No leads found
                          </td>
                        </tr>
                      ) : (
                        leads.map((lead, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-900">
                              {lead.email}
                            </td>
                            <td className="px-6 py-3">
                              {lead.latestRole || "Visitor"}
                            </td>
                            <td className="px-6 py-3">
                              {new Date(lead.lastSeen).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Workflow Configuration (Questions, Options, Tags) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Generated Workflow Configuration
                  </h2>
                  <p className="text-sm text-gray-500">
                    Review generated lead and sales qualification questions from
                    your crawled pages.
                  </p>
                </div>

                {crawledPages.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">
                      No crawled pages found. Crawl a website to generate
                      workflow.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {crawledPages.map((page, pageIdx) =>
                      page.structuredSummary?.sections ? (
                        <div
                          key={pageIdx}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-medium text-gray-700 truncate max-w-md">
                              {page.url}
                            </h3>
                            <span className="text-xs text-gray-400">
                              Generated{" "}
                              {new Date(page.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="p-4 space-y-6">
                            {page.structuredSummary.sections.map(
                              (section: any, secIdx: number) => (
                                <div
                                  key={secIdx}
                                  className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm"
                                >
                                  <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">
                                    Section: {section.sectionName}
                                  </h4>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Leads Section */}
                                    <div className="space-y-6">
                                      <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                                          Leads
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">
                                          Lead Questions
                                        </span>
                                      </div>

                                      {/* Handle new array structure or fallback to legacy single object */}
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
                                          className="space-y-3 p-3 bg-blue-50/30 rounded-lg border border-blue-100"
                                        >
                                          <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs font-bold text-blue-400">
                                              Q{qIdx + 1}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded">
                                              {q.workflow || "legacy"}
                                            </span>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {q.question}
                                          </p>

                                          <div>
                                            <span className="text-xs text-gray-500 block mb-1">
                                              Options & Tags
                                            </span>
                                            <ul className="space-y-1">
                                              {q.options?.map(
                                                (opt: any, i: number) => (
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
                                                      opt.tags.length > 0 ? (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                          {opt.tags.join(", ")}
                                                        </span>
                                                      ) : q.tags?.[i] ? (
                                                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                          {q.tags[i]}
                                                        </span>
                                                      ) : null}
                                                      {typeof opt?.workflow ===
                                                        "string" &&
                                                      opt.workflow ? (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
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

                                    {/* Sales Section */}
                                    <div className="space-y-6">
                                      <div className="flex items-center gap-2 border-b border-green-100 pb-2">
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                                          Sales
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">
                                          Sales Questions
                                        </span>
                                      </div>

                                      {/* Handle new array structure or fallback to legacy single object */}
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
                                          className="space-y-3 p-3 bg-green-50/30 rounded-lg border border-green-100"
                                        >
                                          <div className="flex justify-between items-start gap-2">
                                            <span className="text-xs font-bold text-green-600">
                                              Q{qIdx + 1}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded">
                                              {q.workflow || "legacy"}
                                            </span>
                                          </div>
                                          <p className="text-sm font-medium text-gray-900">
                                            {q.question}
                                          </p>

                                          <div>
                                            <span className="text-xs text-gray-500 block mb-1">
                                              Options & Tags
                                            </span>
                                            <ul className="space-y-1">
                                              {q.options?.map(
                                                (opt: any, i: number) => (
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
                                                      opt.tags.length > 0 ? (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                          {opt.tags.join(", ")}
                                                        </span>
                                                      ) : q.tags?.[i] ? (
                                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                          {q.tags[i]}
                                                        </span>
                                                      ) : null}
                                                      {typeof opt?.workflow ===
                                                        "string" &&
                                                      opt.workflow ? (
                                                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
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

                                      {!section.salesQuestions &&
                                        !section.salesQuestion && (
                                          <p className="text-sm text-gray-500 italic p-2">
                                            No sales questions for this section
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, total, icon, color, subtitle }: any) {
  const colorClasses: Record<string, { border: string; bg: string }> = {
    blue: { border: "border-l-blue-500", bg: "bg-blue-50" },
    purple: { border: "border-l-purple-500", bg: "bg-purple-50" },
    green: { border: "border-l-green-500", bg: "bg-green-50" },
  };

  const { border, bg } = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 border-l-4 ${border}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {value}
            {total && (
              <span className="text-sm text-gray-400 font-normal">
                {" "}
                / {total}
              </span>
            )}
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
