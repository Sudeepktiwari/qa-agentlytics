"use client";

import React, { useState } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Mail,
  Calendar,
  MessageSquare,
  User,
  Bot,
  Target,
  X,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Briefcase,
  DollarSign,
  Hourglass,
  ShieldAlert,
  Brain,
  Building2,
  Zap,
  BarChart,
  Globe,
  MessageCircle,
} from "lucide-react";

interface CustomerProfile {
  _id: string;
  name?: string;
  email: string;
  sessionIds: string[];
  firstContact: string;
  lastContact: string;
  totalSessions: number;
  companyProfile: {
    size?: string;
    industry?: string;
    revenue?: string;
    techStack?: string[];
    currentTools?: string[];
  };
  behaviorProfile: {
    technicalLevel?: string;
    decisionMaker?: boolean;
    researchPhase?: string;
    urgency?: string;
    communicationStyle?: string;
  };
  requirementsProfile: {
    primaryUseCase?: string;
    specificFeatures?: string[];
    integrationNeeds?: string[];
    budgetRange?: string;
    timeline?: string;
    scalingNeeds?: string[];
  };
  engagementProfile: {
    questionsAsked: number;
    pagesVisited: string[];
    timeOnSite: number;
    returnVisits: number;
    conversionSignals: string[];
    objections: string[];
  };
  intelligenceProfile: {
    buyingReadiness?: string;
    conversionProbability?: number;
    topicsDiscussed?: string[];
    recommendedNextSteps?: string[];
    riskFactors?: string[];
    strengths?: string[];
  };
  profileMeta: {
    confidenceScore: number;
    lastUpdated: string;
    updateTriggers: string[];
    totalUpdates: number;
  };
}

interface Lead {
  email: string;
  firstSeen: string;
  lastSeen: string;
  messageCount: number;
  sessionId: string;
  requirements?: string;
  latestContent: string | { mainText: string };
  latestRole: string;
  visibilityRestricted?: boolean;
  confidenceScore?: number;
  bantScore?: number;
  buyingReadiness?: string;
}

interface LeadsManagementSectionProps {
  leads: Lead[];
  leadsLoading: boolean;
  leadsError: string;
  leadsPage: number;
  leadsTotal: number;
  leadsTotalPages: number;
  leadsSearch: string;
  leadsSortBy: string;
  leadsSortOrder: string;
  LEADS_PAGE_SIZE: number;
  onLeadsSearch: (search: string) => void;
  onLeadsSearchSubmit: (e: React.FormEvent) => void;
  onLeadsSortByChange: (sortBy: string) => void;
  onLeadsSortOrderChange: (sortOrder: string) => void;
  onRefreshLeads: () => void;
  onDeleteLead: (email: string) => void;
  onLeadsPageChange: (page: number) => void;
  onCopyToClipboard: (text: string) => void;
}

const LeadsManagementSection: React.FC<LeadsManagementSectionProps> = ({
  leads,
  leadsLoading,
  leadsError,
  leadsPage,
  leadsTotal,
  leadsTotalPages,
  leadsSearch,
  leadsSortBy,
  leadsSortOrder,
  onLeadsSearch,
  onLeadsSearchSubmit,
  onLeadsSortByChange,
  onLeadsSortOrderChange,
  onRefreshLeads,
  onDeleteLead,
  onLeadsPageChange,
  onCopyToClipboard,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  React.useEffect(() => {
    if (selectedLead?.email) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        try {
          const response = await fetch(
            `/api/customer-profiles?email=${encodeURIComponent(
              selectedLead.email
            )}`
          );
          if (response.ok) {
            const data = await response.json();
            setCustomerProfile(data.profile);
          } else {
            setCustomerProfile(null);
          }
        } catch (error) {
          console.error("Error fetching customer profile:", error);
          setCustomerProfile(null);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchProfile();
    } else {
      setCustomerProfile(null);
    }
  }, [selectedLead]);

  // Helper to format date relative or absolute
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  // Helper to get latest message text
  const getLatestMessage = (lead: Lead) => {
    if (typeof lead.latestContent === "string") return lead.latestContent;
    if (
      lead.latestContent &&
      typeof lead.latestContent === "object" &&
      "mainText" in lead.latestContent
    ) {
      return lead.latestContent.mainText;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leads & CRM</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your potential customers
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onRefreshLeads}
            disabled={leadsLoading}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200"
            title="Refresh list"
          >
            <RefreshCw
              size={18}
              className={leadsLoading ? "animate-spin" : ""}
            />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <button
            onClick={() => {
              const emailList = leads.map((lead) => lead.email).join(", ");
              onCopyToClipboard(emailList);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">Copy Emails</span>
          </button>
          <button
            onClick={() => {
              const csvContent = [
                [
                  "Email",
                  "First Contact",
                  "Last Activity",
                  "Message Count",
                  "Latest Message",
                  "Requirements",
                ].join(","),
                ...leads.map((lead) =>
                  [
                    `"${lead.email}"`,
                    `"${new Date(lead.firstSeen).toLocaleString()}"`,
                    `"${new Date(lead.lastSeen).toLocaleString()}"`,
                    lead.messageCount,
                    `"${getLatestMessage(lead).replace(/"/g, '""')}"`,
                    `"${(lead.requirements || "").replace(/"/g, '""')}"`,
                  ].join(",")
                ),
              ].join("\n");

              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `leads-${
                new Date().toISOString().split("T")[0]
              }.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col lg:flex-row gap-3 md:gap-2">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={16}
          />
          <form onSubmit={onLeadsSearchSubmit} className="w-full">
            <input
              type="text"
              placeholder="Search by email, requirements..."
              value={leadsSearch}
              onChange={(e) => onLeadsSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border-slate-200 md:border-none rounded-lg md:rounded-none border md:border-0 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400 h-10 md:h-9"
            />
          </form>
        </div>

        <div className="h-9 w-px bg-slate-100 hidden lg:block" />

        <div className="flex flex-row items-center gap-2 px-0 md:px-2 w-full lg:w-auto">
          <div className="flex-1 lg:flex-none flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200 h-10 md:h-auto">
            <select
              value={leadsSortBy}
              onChange={(e) => onLeadsSortByChange(e.target.value)}
              className="w-full bg-transparent border-none text-slate-600 text-xs font-medium py-1.5 pl-2 pr-6 focus:ring-0 cursor-pointer hover:text-slate-900 transition-colors"
            >
              <option value="lastSeen">Last Activity</option>
              <option value="firstSeen">First Seen</option>
              <option value="email">Email</option>
              <option value="messageCount">Engagement</option>
            </select>
          </div>

          <button
            onClick={() =>
              onLeadsSortOrderChange(leadsSortOrder === "asc" ? "desc" : "asc")
            }
            className="flex-none p-2 h-10 md:h-auto bg-white border border-slate-200 text-slate-500 rounded-lg hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm flex items-center justify-center min-w-[40px]"
            title={leadsSortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {leadsSortOrder === "asc" ? (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
                  Asc
                </span>
                <span className="md:hidden">↑</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
                  Desc
                </span>
                <span className="md:hidden">↓</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {leadsError && (
          <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-sm flex items-center gap-2">
            <X size={16} />
            {leadsError}
          </div>
        )}

        {leadsLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-3" size={32} />
            <p className="text-sm font-medium">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-medium mb-1">No leads found</h3>
            <p className="text-slate-500 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider min-w-[220px] pl-6">
                    Lead Identity
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider min-w-[180px]">
                    Scores
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider min-w-[160px]">
                    Engagement
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider min-w-[140px]">
                    Timeline
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-[11px] uppercase tracking-wider text-right pr-6 min-w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.email}
                    onClick={() => setSelectedLead(lead)}
                    className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                          {lead.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                            {lead.visibilityRestricted ? "***" : lead.email}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Active
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        {/* Confidence Score */}
                        {lead.confidenceScore !== undefined &&
                        lead.confidenceScore > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                            {(lead.confidenceScore * 100).toFixed(0)}%
                            Confidence
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                            No Confidence Score
                          </span>
                        )}

                        {/* BANT Score */}
                        {lead.bantScore !== undefined && lead.bantScore > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-sm">
                            BANT {lead.bantScore}
                          </span>
                        )}

                        {/* Readiness */}
                        {lead.buyingReadiness && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold shadow-sm ${
                              lead.buyingReadiness === "high" ||
                              lead.buyingReadiness === "very_high"
                                ? "bg-emerald-500"
                                : lead.buyingReadiness === "medium"
                                ? "bg-blue-400"
                                : "bg-red-500"
                            }`}
                          >
                            {lead.buyingReadiness.replace("_", " ")} readiness
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-700">
                            {lead.messageCount} messages
                          </span>
                          {lead.messageCount > 5 && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-blue-500"
                              title="Highly engaged"
                            ></span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px] italic">
                          "{getLatestMessage(lead)}"
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs font-medium text-slate-700">
                        {formatDate(lead.lastSeen)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        First: {formatDate(lead.firstSeen)}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyToClipboard(
                              lead.visibilityRestricted ? "***" : lead.email
                            );
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Copy email"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLead(lead.email);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Delete lead"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="w-px h-3 bg-slate-200 mx-0.5"></div>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-blue-400"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {leadsTotalPages > 1 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Showing page <span className="font-medium">{leadsPage}</span> of{" "}
              <span className="font-medium">{leadsTotalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onLeadsPageChange(leadsPage - 1)}
                disabled={leadsPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onLeadsPageChange(leadsPage + 1)}
                disabled={leadsPage === leadsTotalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRM Drawer (Slide-over) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full md:max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg md:text-xl font-bold shadow-lg shadow-blue-500/20 ring-2 md:ring-4 ring-white shrink-0">
                  {selectedLead.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 truncate">
                    {selectedLead.visibilityRestricted
                      ? "***"
                      : selectedLead.email.split("@")[0]}
                  </h3>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mt-0.5 font-mono">
                    <span className="truncate max-w-[150px] md:max-w-none">
                      {selectedLead.visibilityRestricted
                        ? "***"
                        : selectedLead.email}
                    </span>
                    <button
                      onClick={() =>
                        onCopyToClipboard(
                          selectedLead.visibilityRestricted
                            ? "***"
                            : selectedLead.email
                        )
                      }
                      className="text-slate-400 hover:text-blue-500 transition-colors shrink-0"
                      title="Copy email"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  {selectedLead.visibilityRestricted && (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 flex items-center justify-between">
                      <span className="text-xs">
                        Please upgrade to make contact visible
                      </span>
                      <button
                        onClick={() => (window.location.href = "/pricing")}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                      New Lead
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-slate-200">
                      {selectedLead.messageCount} Messages
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
              {/* BANT Score Card (Rule 5 Premium Visualization) */}
              <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl p-1 border border-indigo-100/50 shadow-sm">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Target size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Qualification Score
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                        BANT Framework
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                      <span>High Intent</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Budget */}
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <DollarSign size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Budget
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Unknown
                      </p>
                    </div>

                    {/* Authority */}
                    <div className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Briefcase size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Authority
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        Decision Maker
                      </p>
                    </div>

                    {/* Need */}
                    <div className="col-span-2 p-3 bg-white rounded-lg border border-emerald-100 shadow-sm ring-1 ring-emerald-50">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <ShieldAlert size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Need (Identified)
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 leading-relaxed">
                        {selectedLead.requirements ||
                          "No specific requirements identified yet."}
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="col-span-2 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Hourglass size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Timeline
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          Active recently
                        </p>
                        <span className="text-xs text-slate-500">
                          Last seen {formatDate(selectedLead.lastSeen)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Intelligence Profile */}
              {(customerProfile || profileLoading) && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Brain size={16} className="text-purple-500" />
                    Customer Intelligence
                  </h4>

                  {profileLoading ? (
                    <div className="flex justify-center p-8 bg-slate-50 rounded-xl border border-slate-100">
                      <RefreshCw
                        className="animate-spin text-slate-400"
                        size={24}
                      />
                    </div>
                  ) : customerProfile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Company Profile */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <Building2 size={16} className="text-blue-500" />
                          <h5 className="text-xs font-bold uppercase tracking-wider">
                            Company
                          </h5>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Size</span>
                            <span className="font-medium text-slate-900">
                              {customerProfile.companyProfile.size || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Industry</span>
                            <span className="font-medium text-slate-900">
                              {customerProfile.companyProfile.industry ||
                                "Unknown"}
                            </span>
                          </div>
                          {customerProfile.companyProfile.techStack &&
                            customerProfile.companyProfile.techStack.length >
                              0 && (
                              <div className="pt-1">
                                <span className="text-slate-500 text-xs block mb-1.5">
                                  Tech Stack
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {customerProfile.companyProfile.techStack.map(
                                    (tech, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200"
                                      >
                                        {tech}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Behavior Profile */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <Zap size={16} className="text-amber-500" />
                          <h5 className="text-xs font-bold uppercase tracking-wider">
                            Behavior
                          </h5>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Role</span>
                            <span className="font-medium text-slate-900">
                              {customerProfile.behaviorProfile.decisionMaker
                                ? "Decision Maker"
                                : "Influencer/User"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Tech Level</span>
                            <span className="font-medium text-slate-900 capitalize">
                              {customerProfile.behaviorProfile.technicalLevel ||
                                "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Urgency</span>
                            <span
                              className={`font-medium capitalize ${
                                customerProfile.behaviorProfile.urgency ===
                                "urgent"
                                  ? "text-red-600"
                                  : customerProfile.behaviorProfile.urgency ===
                                    "high"
                                  ? "text-orange-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {customerProfile.behaviorProfile.urgency ||
                                "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Requirements Profile */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <Target size={16} className="text-emerald-500" />
                          <h5 className="text-xs font-bold uppercase tracking-wider">
                            Requirements
                          </h5>
                        </div>
                        <div className="space-y-2.5">
                          {customerProfile.requirementsProfile
                            .primaryUseCase && (
                            <div>
                              <span className="text-slate-500 text-xs block mb-1">
                                Primary Use Case
                              </span>
                              <p className="text-sm font-medium text-slate-900 leading-snug">
                                {
                                  customerProfile.requirementsProfile
                                    .primaryUseCase
                                }
                              </p>
                            </div>
                          )}
                          {customerProfile.requirementsProfile.budgetRange && (
                            <div className="flex justify-between text-sm pt-1">
                              <span className="text-slate-500">Budget</span>
                              <span className="font-medium text-slate-900">
                                {
                                  customerProfile.requirementsProfile
                                    .budgetRange
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-3 text-slate-500">
                          <BarChart size={16} className="text-indigo-500" />
                          <h5 className="text-xs font-bold uppercase tracking-wider">
                            Engagement
                          </h5>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-2 rounded-lg text-center">
                            <div className="text-lg font-bold text-slate-900">
                              {customerProfile.engagementProfile.questionsAsked}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase">
                              Questions
                            </div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-lg text-center">
                            <div className="text-lg font-bold text-slate-900">
                              {customerProfile.engagementProfile.timeOnSite}s
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase">
                              Time
                            </div>
                          </div>
                          <div className="col-span-2 bg-slate-50 p-2 rounded-lg flex justify-between items-center px-3">
                            <span className="text-xs text-slate-500">
                              Confidence Score
                            </span>
                            <span className="font-bold text-blue-600">
                              {(
                                customerProfile.profileMeta.confidenceScore *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Insights */}
                      {customerProfile.intelligenceProfile
                        .recommendedNextSteps &&
                        customerProfile.intelligenceProfile.recommendedNextSteps
                          .length > 0 && (
                          <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 rounded-xl border border-violet-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-violet-700">
                              <Zap size={16} />
                              <h5 className="text-xs font-bold uppercase tracking-wider">
                                Recommended Next Steps
                              </h5>
                            </div>
                            <ul className="space-y-2">
                              {customerProfile.intelligenceProfile.recommendedNextSteps.map(
                                (step, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-violet-900"
                                  >
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                                    {step}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      <Brain
                        size={32}
                        className="text-slate-300 mx-auto mb-3"
                      />
                      <p className="text-slate-500 text-sm font-medium">
                        No detailed intelligence profile available yet.
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Profiles are generated automatically as the conversation
                        progresses.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Engagement Timeline */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Activity Timeline
                </h4>
                <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                  {/* Latest Action */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <div className="text-xs text-slate-500 mb-0.5">
                      {formatDate(selectedLead.lastSeen)}
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      Latest Interaction
                    </p>
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 italic">
                      "{getLatestMessage(selectedLead)}"
                    </div>
                  </div>

                  {/* First Seen */}
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm" />
                    <div className="text-xs text-slate-500 mb-0.5">
                      {formatDate(selectedLead.firstSeen)}
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      First Contact
                    </p>
                    <p className="text-sm text-slate-500">
                      Started a new session
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                onClick={() =>
                  (window.location.href = `mailto:${selectedLead.email}`)
                }
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
              >
                <Mail size={18} />
                Send Email
              </button>
              <button
                onClick={() => {
                  onDeleteLead(selectedLead.email);
                  setSelectedLead(null);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-red-600 rounded-xl font-medium hover:bg-red-50 hover:border-red-200 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagementSection;
