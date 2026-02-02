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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Workflow Configuration
                  </h2>
                  <p className="text-sm text-gray-500">
                    Configure questions, options, and tags for qualification.
                  </p>
                </div>

                {/* We reuse the BANT Qualification Section here as it handles Questions/Options */}
                <BantQualificationSection />
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
