"use client";

import React from "react";

interface Lead {
  email: string;
  firstSeen: string;
  lastSeen: string;
  messageCount: number;
  sessionId: string;
  requirements?: string;
  latestContent: string | { mainText: string };
  latestRole: string;
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
  LEADS_PAGE_SIZE,
  onLeadsSearch,
  onLeadsSearchSubmit,
  onLeadsSortByChange,
  onLeadsSortOrderChange,
  onRefreshLeads,
  onDeleteLead,
  onLeadsPageChange,
  onCopyToClipboard,
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
          📧 Lead Management
        </h2>
        <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
          Track and manage leads generated from chatbot conversations
        </p>
      </div>

      {/* Search and Controls */}
      <div
        style={{
          background: "linear-gradient(135deg, #f7fafc10, #edf2f710)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <form
            onSubmit={onLeadsSearchSubmit}
            style={{ display: "flex", gap: "8px", flex: "1 1 300px" }}
          >
            <input
              type="text"
              placeholder="Search by email or message..."
              value={leadsSearch}
              onChange={(e) => onLeadsSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#2d3748",
                background: "white",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 20px",
                background: "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              🔍 Search
            </button>
          </form>

          <select
            value={leadsSortBy}
            onChange={(e) => onLeadsSortByChange(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              color: "#2d3748",
            }}
          >
            <option value="lastSeen">Sort by Last Seen</option>
            <option value="firstSeen">Sort by First Seen</option>
            <option value="email">Sort by Email</option>
            <option value="messageCount">Sort by Message Count</option>
          </select>

          <select
            value={leadsSortOrder}
            onChange={(e) => onLeadsSortOrderChange(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              background: "white",
              color: "#2d3748",
            }}
          >
            <option value="desc">↓ Descending</option>
            <option value="asc">↑ Ascending</option>
          </select>

          <button
            onClick={onRefreshLeads}
            disabled={leadsLoading}
            style={{
              padding: "12px 20px",
              background: leadsLoading
                ? "#a0aec0"
                : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: leadsLoading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {leadsLoading ? "⏳ Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "20px" }}>📊</span>
              <strong style={{ color: "#2d3748" }}>
                Total Leads: {leadsTotal}
              </strong>
            </div>
            {leadsTotal > 0 && (
              <span style={{ color: "#718096", fontSize: "14px" }}>
                Showing {(leadsPage - 1) * LEADS_PAGE_SIZE + 1} -{" "}
                {Math.min(leadsPage * LEADS_PAGE_SIZE, leadsTotal)} of{" "}
                {leadsTotal}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {leadsError && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
            border: "1px solid #fc8181",
            color: "#742a2a",
            marginBottom: "24px",
          }}
        >
          {leadsError}
        </div>
      )}

      {/* Leads Content */}
      {leadsLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#718096",
            fontSize: "16px",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#718096",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
            No leads found
          </h3>
          <p style={{ margin: 0, fontSize: "16px" }}>
            Start promoting your chatbot to collect leads!
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
                  }}
                >
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    📧 Email
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    🆕 First Contact
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    ⏰ Last Activity
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "center",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    💬 Messages
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    📝 Latest Message
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "left",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    🎯 Requirements
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      textAlign: "center",
                      borderBottom: "2px solid #e2e8f0",
                      color: "#4a5568",
                      fontWeight: "600",
                    }}
                  >
                    ⚡ Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <tr
                    key={lead.email}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#f8fafc",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      const target = e.currentTarget as HTMLTableRowElement;
                      target.style.backgroundColor = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget as HTMLTableRowElement;
                      target.style.backgroundColor =
                        index % 2 === 0 ? "#fff" : "#f8fafc";
                    }}
                  >
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>📧</span>
                        <strong
                          style={{
                            color: "#2d3748",
                            fontSize: "14px",
                            wordBreak: "break-word",
                          }}
                        >
                          {lead.email}
                        </strong>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#4a5568",
                        fontSize: "13px",
                      }}
                    >
                      {new Date(lead.firstSeen).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#4a5568",
                        fontSize: "13px",
                      }}
                    >
                      {new Date(lead.lastSeen).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea20, #764ba220)",
                          color: "#667eea",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        {lead.messageCount}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        maxWidth: "300px",
                      }}
                    >
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color:
                            lead.latestRole === "user" ? "#2d3748" : "#718096",
                          fontSize: "13px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            marginRight: "4px",
                          }}
                        >
                          {lead.latestRole === "user" ? "👤" : "🤖"}
                        </span>
                        {typeof lead.latestContent === "string"
                          ? lead.latestContent
                          : lead.latestContent &&
                            typeof lead.latestContent === "object" &&
                            "mainText" in lead.latestContent
                          ? lead.latestContent.mainText
                          : "No content"}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        maxWidth: "250px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: lead.requirements ? "#4a5568" : "#a0aec0",
                          lineHeight: "1.4",
                        }}
                      >
                        {lead.requirements ? (
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #e6fffa, #f0fff4)",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: "1px solid #b2f5ea",
                            }}
                          >
                            <span
                              style={{ fontSize: "12px", marginRight: "6px" }}
                            >
                              🎯
                            </span>
                            {lead.requirements}
                          </div>
                        ) : (
                          <div
                            style={{
                              fontStyle: "italic",
                              color: "#a0aec0",
                              fontSize: "12px",
                            }}
                          >
                            No specific requirements detected
                          </div>
                        )}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #e2e8f0",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => onCopyToClipboard(lead.email)}
                          style={{
                            background:
                              "linear-gradient(135deg, #48bb78, #38a169)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          title="Copy email"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead.email)}
                          style={{
                            background:
                              "linear-gradient(135deg, #f56565, #e53e3e)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          title="Delete lead"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {leadsTotalPages > 1 && (
        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => onLeadsPageChange(1)}
            disabled={leadsPage === 1}
            style={{
              padding: "8px 16px",
              background:
                leadsPage === 1
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #4299e1, #3182ce)",
              color: leadsPage === 1 ? "#a0aec0" : "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: leadsPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ⏮️ First
          </button>
          <button
            onClick={() => onLeadsPageChange(leadsPage - 1)}
            disabled={leadsPage === 1}
            style={{
              padding: "8px 16px",
              background:
                leadsPage === 1
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #4299e1, #3182ce)",
              color: leadsPage === 1 ? "#a0aec0" : "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: leadsPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ⬅️ Previous
          </button>
          <span
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#4a5568",
            }}
          >
            Page {leadsPage} of {leadsTotalPages}
          </span>
          <button
            onClick={() => onLeadsPageChange(leadsPage + 1)}
            disabled={leadsPage === leadsTotalPages}
            style={{
              padding: "8px 16px",
              background:
                leadsPage === leadsTotalPages
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #4299e1, #3182ce)",
              color: leadsPage === leadsTotalPages ? "#a0aec0" : "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: leadsPage === leadsTotalPages ? "not-allowed" : "pointer",
            }}
          >
            Next ➡️
          </button>
          <button
            onClick={() => onLeadsPageChange(leadsTotalPages)}
            disabled={leadsPage === leadsTotalPages}
            style={{
              padding: "8px 16px",
              background:
                leadsPage === leadsTotalPages
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #4299e1, #3182ce)",
              color: leadsPage === leadsTotalPages ? "#a0aec0" : "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: leadsPage === leadsTotalPages ? "not-allowed" : "pointer",
            }}
          >
            Last ⏭️
          </button>
        </div>
      )}

      {/* Export Options */}
      {leads.length > 0 && (
        <div
          style={{
            marginTop: "24px",
            background: "linear-gradient(135deg, #e6fffa10, #b2f5ea10)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h4
            style={{
              margin: "0 0 16px 0",
              color: "#4a5568",
              fontSize: "16px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📊 Export Options
          </h4>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                const csvContent = [
                  [
                    "Email",
                    "First Contact",
                    "Last Activity",
                    "Message Count",
                    "Latest Message",
                  ].join(","),
                  ...leads.map((lead) =>
                    [
                      `"${lead.email}"`,
                      `"${new Date(lead.firstSeen).toLocaleString()}"`,
                      `"${new Date(lead.lastSeen).toLocaleString()}"`,
                      lead.messageCount,
                      `"${(typeof lead.latestContent === "string"
                        ? lead.latestContent
                        : lead.latestContent &&
                          typeof lead.latestContent === "object" &&
                          "mainText" in lead.latestContent
                        ? lead.latestContent.mainText
                        : ""
                      ).replace(/"/g, '""')}"`,
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
              style={{
                background: "linear-gradient(135deg, #38b2ac, #319795)",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📥 Export as CSV
            </button>
            <button
              onClick={() => {
                const emailList = leads.map((lead) => lead.email).join(", ");
                onCopyToClipboard(emailList);
              }}
              style={{
                background: "linear-gradient(135deg, #805ad5, #6b46c1)",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📋 Copy All Emails
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagementSection;
