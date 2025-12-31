"use client";

import React, { useState, useEffect } from "react";

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
  bant?: {
    budgetRange?: string;
    authorityDecisionMaker?: boolean | null;
    needSummary?: string | null;
    timeline?: string;
    score?: number;
    completeness?: number;
    stage?: string;
  };
  profileMeta: {
    confidenceScore: number;
    lastUpdated: string;
    lastUpdateTrigger?: string;
    updateTriggers: string[];
    totalUpdates: number;
  };
}

const CustomerProfilesSection: React.FC = () => {
  const [profiles, setProfiles] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProfile, setSelectedProfile] =
    useState<CustomerProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterByConfidence, setFilterByConfidence] = useState("all");
  const [sortBy, setSortBy] = useState("lastContact");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/customer-profiles?all=true");
      const data = await response.json();

      if (response.ok) {
        setProfiles(data.profiles || []);
      } else {
        setError(data.error || "Failed to fetch profiles");
      }
    } catch (err) {
      setError("Failed to fetch customer profiles");
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (
      !window.confirm(
        "Delete this customer profile? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/customer-profiles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });

      if (response.ok) {
        setProfiles(profiles.filter((p) => p._id !== profileId));
        if (selectedProfile?._id === profileId) {
          setSelectedProfile(null);
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete profile");
      }
    } catch (err) {
      setError("Failed to delete profile");
      console.error("Error deleting profile:", err);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "#22c55e"; // Green
    if (score >= 0.6) return "#f59e0b"; // Yellow
    if (score >= 0.4) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    if (score >= 0.4) return "Low";
    return "Very Low";
  };

  const getBuyingReadinessColor = (readiness?: string) => {
    switch (readiness) {
      case "very_high":
        return "#22c55e";
      case "high":
        return "#84cc16";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const filteredProfiles = profiles
    .filter((profile) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          profile.email?.toLowerCase().includes(search) ||
          profile.companyProfile?.industry?.toLowerCase().includes(search) ||
          profile.requirementsProfile?.primaryUseCase
            ?.toLowerCase()
            .includes(search)
        );
      }
      return true;
    })
    .filter((profile) => {
      if (filterByConfidence === "all") return true;
      if (filterByConfidence === "high")
        return profile.profileMeta.confidenceScore >= 0.8;
      if (filterByConfidence === "medium")
        return (
          profile.profileMeta.confidenceScore >= 0.6 &&
          profile.profileMeta.confidenceScore < 0.8
        );
      if (filterByConfidence === "low")
        return profile.profileMeta.confidenceScore < 0.6;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "lastContact":
          return (
            new Date(b.lastContact).getTime() -
            new Date(a.lastContact).getTime()
          );
        case "confidence":
          return b.profileMeta.confidenceScore - a.profileMeta.confidenceScore;
        case "sessions":
          return b.totalSessions - a.totalSessions;
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        default:
          return 0;
      }
    });

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
          🧠 Customer Intelligence Profiles
        </h2>
        <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
          Comprehensive customer profiles built through AI analysis of
          conversations
        </p>
      </div>

      {/* Controls */}
      <div
        style={{
          background: "linear-gradient(135deg, #f7fafc10, #edf2f710)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 300px" }}>
          <input
            type="text"
            placeholder="Search by email, industry, or use case..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#2d3748",
              background: "white",
              outline: "none",
            }}
          />
        </div>

        <select
          value={filterByConfidence}
          onChange={(e) => setFilterByConfidence(e.target.value)}
          style={{
            padding: "12px 16px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            background: "white",
            color: "#2d3748",
          }}
        >
          <option value="all">All Confidence Levels</option>
          <option value="high">High Confidence (80%+)</option>
          <option value="medium">Medium Confidence (60-80%)</option>
          <option value="low">Low Confidence (&lt;60%)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "12px 16px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            background: "white",
            color: "#2d3748",
          }}
        >
          <option value="lastContact">Sort by Last Contact</option>
          <option value="confidence">Sort by Confidence</option>
          <option value="sessions">Sort by Sessions</option>
          <option value="email">Sort by Email</option>
        </select>

        <button
          onClick={fetchProfiles}
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
          🔄 Refresh
        </button>
      </div>

      {error && (
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
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Profiles List */}
        <div style={{ flex: "1" }}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
                fontSize: "16px",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
              Loading customer profiles...
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🧠</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
                No customer profiles found
              </h3>
              <p style={{ margin: 0, fontSize: "16px" }}>
                Customer profiles will appear here as conversations develop!
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {filteredProfiles.map((profile) => (
                <div
                  key={profile._id}
                  onClick={() => setSelectedProfile(profile)}
                  style={{
                    padding: "16px 20px",
                    background:
                      selectedProfile?._id === profile._id
                        ? "#e6fffa"
                        : "white",
                    border:
                      selectedProfile?._id === profile._id
                        ? "2px solid #4fd1c7"
                        : "1px solid #e2e8f0",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#2d3748",
                          marginBottom: "4px",
                        }}
                      >
                        {profile.name || profile.email || "Anonymous"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096" }}>
                        {profile.companyProfile?.industry && (
                          <span style={{ marginRight: "12px" }}>
                            🏢 {profile.companyProfile.industry}
                          </span>
                        )}
                        {profile.companyProfile?.size && (
                          <span style={{ marginRight: "12px" }}>
                            👥 {profile.companyProfile.size.replace(/_/g, " ")}
                          </span>
                        )}
                        <span>
                          📅{" "}
                          {new Date(profile.lastContact).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          background: getConfidenceColor(
                            profile.profileMeta.confidenceScore
                          ),
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {Math.round(profile.profileMeta.confidenceScore * 100)}%
                        Confidence
                      </div>
                      {profile.bant?.score !== undefined && (
                        <div
                          style={{
                            background: "#3182ce",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "600",
                          }}
                        >
                          BANT {profile.bant.score}
                        </div>
                      )}
                      {profile.intelligenceProfile?.buyingReadiness && (
                        <div
                          style={{
                            background: getBuyingReadinessColor(
                              profile.intelligenceProfile.buyingReadiness
                            ),
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: "600",
                          }}
                        >
                          {profile.intelligenceProfile.buyingReadiness.replace(
                            /_/g,
                            " "
                          )}{" "}
                          readiness
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.requirementsProfile?.primaryUseCase && (
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#4a5568",
                        marginBottom: "8px",
                      }}
                    >
                      🎯 {profile.requirementsProfile.primaryUseCase}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      fontSize: "12px",
                      color: "#718096",
                    }}
                  >
                    <span>💬 {profile.totalSessions} sessions</span>
                    <span>📊 {profile.profileMeta.totalUpdates} updates</span>
                    {profile.engagementProfile?.questionsAsked > 0 && (
                      <span>
                        ❓ {profile.engagementProfile.questionsAsked} questions
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Details */}
        {selectedProfile && (
          <div
            style={{
              flex: "1",
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #e2e8f0",
              maxHeight: "800px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#2d3748",
                  }}
                >
                  {selectedProfile.name ||
                    selectedProfile.email ||
                    "Anonymous Profile"}
                </h3>
                <div style={{ fontSize: "14px", color: "#718096" }}>
                  Profile ID: {selectedProfile._id}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setSelectedProfile(null)}
                  style={{
                    padding: "8px 12px",
                    background: "#f7fafc",
                    color: "#4a5568",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => deleteProfile(selectedProfile._id)}
                  style={{
                    padding: "8px 12px",
                    background: "#fed7d7",
                    color: "#c53030",
                    border: "1px solid #fc8181",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Profile Sections */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Overview */}
              <div
                style={{
                  padding: "16px",
                  background: "#f7fafc",
                  borderRadius: "8px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#2d3748",
                  }}
                >
                  📊 Overview
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <span style={{ color: "#718096" }}>Name:</span>
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {selectedProfile.name || "—"}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#718096" }}>Confidence Score:</span>
                    <div
                      style={{
                        fontWeight: "600",
                        color: getConfidenceColor(
                          selectedProfile.profileMeta.confidenceScore
                        ),
                      }}
                    >
                      {Math.round(
                        selectedProfile.profileMeta.confidenceScore * 100
                      )}
                      % (
                      {getConfidenceLabel(
                        selectedProfile.profileMeta.confidenceScore
                      )}
                      )
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#718096" }}>Total Sessions:</span>
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {selectedProfile.totalSessions}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#718096" }}>Email:</span>
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {selectedProfile.email || "—"}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#718096" }}>First Contact:</span>
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {new Date(
                        selectedProfile.firstContact
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "#718096" }}>Last Update:</span>
                    <div style={{ fontWeight: "600", color: "#2d3748" }}>
                      {new Date(
                        selectedProfile.profileMeta.lastUpdated
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Profile */}
              {Object.keys(selectedProfile.companyProfile || {}).length > 0 && (
                <div
                  style={{
                    padding: "16px",
                    background: "#f0fff4",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2d3748",
                    }}
                  >
                    🏢 Company Profile
                  </h4>
                  <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    {selectedProfile.companyProfile.size && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>Size:</span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.companyProfile.size.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </div>
                    )}
                    {selectedProfile.companyProfile.industry && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>Industry:</span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.companyProfile.industry}
                        </span>
                      </div>
                    )}
                    {selectedProfile.companyProfile.revenue && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>Revenue:</span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.companyProfile.revenue.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </div>
                    )}
                    {selectedProfile.companyProfile.techStack &&
                      selectedProfile.companyProfile.techStack.length > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#718096" }}>Tech Stack:</span>{" "}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {selectedProfile.companyProfile.techStack.map(
                              (tech, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: "#e6fffa",
                                    color: "#2d3748",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {tech}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {selectedProfile.companyProfile.currentTools &&
                      selectedProfile.companyProfile.currentTools.length >
                        0 && (
                        <div>
                          <span style={{ color: "#718096" }}>
                            Current Tools:
                          </span>{" "}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {selectedProfile.companyProfile.currentTools.map(
                              (tool, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: "#f0f9ff",
                                    color: "#2d3748",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {tool}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Behavior Profile */}
              {Object.keys(selectedProfile.behaviorProfile || {}).length >
                0 && (
                <div
                  style={{
                    padding: "16px",
                    background: "#fef7e0",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2d3748",
                    }}
                  >
                    🧠 Behavior Profile
                  </h4>
                  <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    {selectedProfile.behaviorProfile.technicalLevel && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>
                          Technical Level:
                        </span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.behaviorProfile.technicalLevel}
                        </span>
                      </div>
                    )}
                    {selectedProfile.behaviorProfile.decisionMaker !==
                      undefined && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>
                          Decision Maker:
                        </span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.behaviorProfile.decisionMaker
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>
                    )}
                    {selectedProfile.behaviorProfile.researchPhase && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>
                          Research Phase:
                        </span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.behaviorProfile.researchPhase}
                        </span>
                      </div>
                    )}
                    {selectedProfile.behaviorProfile.urgency && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>Urgency:</span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.behaviorProfile.urgency}
                        </span>
                      </div>
                    )}
                    {selectedProfile.behaviorProfile.communicationStyle && (
                      <div>
                        <span style={{ color: "#718096" }}>
                          Communication Style:
                        </span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.behaviorProfile.communicationStyle.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Requirements Profile */}
              {Object.keys(selectedProfile.requirementsProfile || {}).length >
                0 && (
                <div
                  style={{
                    padding: "16px",
                    background: "#f0f4ff",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2d3748",
                    }}
                  >
                    🎯 Requirements Profile
                  </h4>
                  <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    {selectedProfile.requirementsProfile.primaryUseCase && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>
                          Primary Use Case:
                        </span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.requirementsProfile.primaryUseCase}
                        </span>
                      </div>
                    )}
                    {selectedProfile.requirementsProfile.budgetRange && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>Budget Range:</span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          $
                          {selectedProfile.requirementsProfile.budgetRange.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </div>
                    )}
                    {selectedProfile.requirementsProfile.timeline && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>Timeline:</span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {selectedProfile.requirementsProfile.timeline.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </div>
                    )}
                    {selectedProfile.requirementsProfile.specificFeatures &&
                      selectedProfile.requirementsProfile.specificFeatures
                        .length > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#718096" }}>
                            Specific Features:
                          </span>{" "}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {selectedProfile.requirementsProfile.specificFeatures.map(
                              (feature, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: "#dbeafe",
                                    color: "#2d3748",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {feature}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {selectedProfile.requirementsProfile.integrationNeeds &&
                      selectedProfile.requirementsProfile.integrationNeeds
                        .length > 0 && (
                        <div>
                          <span style={{ color: "#718096" }}>
                            Integration Needs:
                          </span>{" "}
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {selectedProfile.requirementsProfile.integrationNeeds.map(
                              (integration, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    background: "#fef3c7",
                                    color: "#2d3748",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {integration}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* BANT */}
              {selectedProfile.bant && (
                <div
                  style={{
                    padding: "16px",
                    background: "#ebf8ff",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2d3748",
                    }}
                  >
                    🧩 BANT Qualification
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <span style={{ color: "#718096" }}>Score:</span>{" "}
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>
                        {selectedProfile.bant.score}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#718096" }}>Stage:</span>{" "}
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>
                        {(selectedProfile.bant.stage || "intro").replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#718096" }}>Budget:</span>{" "}
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>
                        {(
                          selectedProfile.bant.budgetRange || "unknown"
                        ).replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#718096" }}>Authority:</span>{" "}
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>
                        {selectedProfile.bant.authorityDecisionMaker === true
                          ? "Decision maker"
                          : selectedProfile.bant.authorityDecisionMaker ===
                            false
                          ? "Not decision maker"
                          : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#718096" }}>Need:</span>{" "}
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>
                        {selectedProfile.bant.needSummary || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#718096" }}>Timeline:</span>{" "}
                      <span style={{ fontWeight: "600", color: "#2d3748" }}>
                        {(selectedProfile.bant.timeline || "unknown").replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Intelligence Profile */}
              {Object.keys(selectedProfile.intelligenceProfile || {}).length >
                0 && (
                <div
                  style={{
                    padding: "16px",
                    background: "#fdf2f8",
                    borderRadius: "8px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#2d3748",
                    }}
                  >
                    🚀 AI Intelligence
                  </h4>
                  <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    {selectedProfile.intelligenceProfile.buyingReadiness && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>
                          Buying Readiness:
                        </span>{" "}
                        <span
                          style={{
                            fontWeight: "600",
                            color: getBuyingReadinessColor(
                              selectedProfile.intelligenceProfile
                                .buyingReadiness
                            ),
                          }}
                        >
                          {selectedProfile.intelligenceProfile.buyingReadiness.replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </div>
                    )}
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#718096" }}>
                        Topics Discussed:
                      </span>{" "}
                      {selectedProfile.intelligenceProfile?.topicsDiscussed &&
                      selectedProfile.intelligenceProfile.topicsDiscussed
                        .length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {selectedProfile.intelligenceProfile.topicsDiscussed.map(
                            (topic, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "#f3e8ff",
                                  color: "#6b21a8",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                }}
                              >
                                {topic}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            color: "#a0aec0",
                            fontStyle: "italic",
                            fontSize: "14px",
                          }}
                        >
                          No topics analyzed yet
                        </span>
                      )}
                    </div>
                    {selectedProfile.intelligenceProfile
                      .conversionProbability !== undefined && (
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ color: "#718096" }}>
                          Conversion Probability:
                        </span>{" "}
                        <span style={{ fontWeight: "600" }}>
                          {Math.round(
                            selectedProfile.intelligenceProfile
                              .conversionProbability * 100
                          )}
                          %
                        </span>
                      </div>
                    )}
                    {selectedProfile.intelligenceProfile.recommendedNextSteps &&
                      selectedProfile.intelligenceProfile.recommendedNextSteps
                        .length > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#718096" }}>
                            Recommended Next Steps:
                          </span>
                          <ul
                            style={{ margin: "4px 0 0 16px", paddingLeft: 0 }}
                          >
                            {selectedProfile.intelligenceProfile.recommendedNextSteps.map(
                              (step, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    color: "#2d3748",
                                    fontWeight: "600",
                                  }}
                                >
                                  {step}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {selectedProfile.intelligenceProfile.strengths &&
                      selectedProfile.intelligenceProfile.strengths.length >
                        0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <span style={{ color: "#718096" }}>Strengths:</span>
                          <ul
                            style={{ margin: "4px 0 0 16px", paddingLeft: 0 }}
                          >
                            {selectedProfile.intelligenceProfile.strengths.map(
                              (strength, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    color: "#22c55e",
                                    fontWeight: "600",
                                  }}
                                >
                                  {strength}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {selectedProfile.intelligenceProfile.riskFactors &&
                      selectedProfile.intelligenceProfile.riskFactors.length >
                        0 && (
                        <div>
                          <span style={{ color: "#718096" }}>
                            Risk Factors:
                          </span>
                          <ul
                            style={{ margin: "4px 0 0 16px", paddingLeft: 0 }}
                          >
                            {selectedProfile.intelligenceProfile.riskFactors.map(
                              (risk, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    color: "#ef4444",
                                    fontWeight: "600",
                                  }}
                                >
                                  {risk}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Update History */}
              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#2d3748",
                  }}
                >
                  📈 Profile Updates
                </h4>
                <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ color: "#718096" }}>Total Updates:</span>{" "}
                    <span style={{ fontWeight: "600" }}>
                      {selectedProfile.profileMeta.totalUpdates}
                    </span>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <span style={{ color: "#718096" }}>Last Trigger:</span>{" "}
                    <span style={{ fontWeight: "600" }}>
                      {selectedProfile.profileMeta.lastUpdateTrigger?.replace(
                        /_/g,
                        " "
                      ) || "N/A"}
                    </span>
                  </div>
                  {selectedProfile.profileMeta.updateTriggers &&
                    selectedProfile.profileMeta.updateTriggers.length > 0 && (
                      <div>
                        <span style={{ color: "#718096" }}>
                          Update History:
                        </span>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {selectedProfile.profileMeta.updateTriggers
                            .slice(-10)
                            .map((trigger, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "#e2e8f0",
                                  color: "#2d3748",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                }}
                              >
                                {trigger.replace(/_/g, " ")}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfilesSection;
