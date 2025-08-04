import React, { useState, useEffect } from "react";

// Customer persona interfaces
interface CustomerPersona {
  id: string;
  name: string;
  type: string;
  industries: string[];
  companySize: string;
  painPoints: string[];
  preferredFeatures: string[];
  buyingPatterns: string[];
  budget: string;
  technicalLevel: string;
  urgency: string;
  decisionMaker: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PersonaData {
  adminId: string;
  websiteUrl: string;
  targetAudiences: CustomerPersona[];
  industryFocus: string[];
  useCaseExamples: string[];
  competitorMentions: string[];
  pricingStrategy: string;
  extractedAt: Date;
  updatedAt: Date;
}

interface CustomerPersonaSectionProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

const CustomerPersonaSection: React.FC<CustomerPersonaSectionProps> = ({
  expanded,
  onToggleExpanded,
}) => {
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingPersona, setEditingPersona] = useState<CustomerPersona | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load personas on component mount
  useEffect(() => {
    if (expanded) {
      fetchPersonas();
    }
  }, [expanded]);

  const fetchPersonas = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/personas");
      const data = await res.json();

      if (res.ok) {
        setPersonaData(data.personas);
      } else {
        setError(data.error || "Failed to fetch personas");
      }
    } catch (error) {
      setError("Failed to fetch personas");
      console.error("Error fetching personas:", error);
    } finally {
      setLoading(false);
    }
  };

  const autoExtractPersonas = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_extract",
          // websiteUrl is now optional - will be auto-detected from crawled content
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPersonaData(data.personas);
        setMessage(data.message);
      } else {
        setError(data.error || "Failed to extract personas");
      }
    } catch (error) {
      setError("Failed to extract personas");
      console.error("Error extracting personas:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePersonas = async (updatedPersonaData: PersonaData) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manual_save",
          personaData: updatedPersonaData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPersonaData(data.personas);
        setMessage("Personas saved successfully!");
        setEditingPersona(null);
        setShowCreateForm(false);
      } else {
        setError(data.error || "Failed to save personas");
      }
    } catch (error) {
      setError("Failed to save personas");
      console.error("Error saving personas:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePersonas = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all personas? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/personas", {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setPersonaData(null);
        setMessage("Personas deleted successfully");
      } else {
        setError(data.error || "Failed to delete personas");
      }
    } catch (error) {
      setError("Failed to delete personas");
      console.error("Error deleting personas:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePersona = (updatedPersona: CustomerPersona) => {
    if (!personaData) return;

    const updatedAudiences = personaData.targetAudiences.map((p) =>
      p.id === updatedPersona.id
        ? { ...updatedPersona, updatedAt: new Date() }
        : p
    );

    const updatedData = {
      ...personaData,
      targetAudiences: updatedAudiences,
      updatedAt: new Date(),
    };

    savePersonas(updatedData);
  };

  const addNewPersona = (
    newPersona: Omit<CustomerPersona, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!personaData) return;

    const persona: CustomerPersona = {
      ...newPersona,
      id: `persona_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedData = {
      ...personaData,
      targetAudiences: [...personaData.targetAudiences, persona],
      updatedAt: new Date(),
    };

    savePersonas(updatedData);
  };

  const removePersona = (personaId: string) => {
    if (!personaData) return;
    if (!window.confirm("Are you sure you want to delete this persona?"))
      return;

    const updatedAudiences = personaData.targetAudiences.filter(
      (p) => p.id !== personaId
    );

    const updatedData = {
      ...personaData,
      targetAudiences: updatedAudiences,
      updatedAt: new Date(),
    };

    savePersonas(updatedData);
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginBottom: "24px",
      }}
    >
      {/* Header */}
      <div
        onClick={onToggleExpanded}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          marginBottom: expanded ? "24px" : "0",
        }}
      >
        <div>
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
            🎯 Customer Personas
            <span
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {personaData?.targetAudiences?.length || 0} personas
            </span>
          </h2>
          <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
            Analyze and manage your target customer personas for intelligent
            messaging
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#667eea",
            fontWeight: "600",
          }}
        >
          <span>{expanded ? "Collapse" : "Expand"}</span>
          <span
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              fontSize: "16px",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {expanded && (
        <div>
          {/* Action Buttons */}
          <div style={{ marginBottom: "24px" }}>
            <button
              onClick={autoExtractPersonas}
              disabled={loading}
              style={{
                padding: "12px 20px",
                background: loading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: loading
                  ? "none"
                  : "0 4px 12px rgba(72, 187, 120, 0.3)",
                marginRight: "12px",
              }}
            >
              {loading ? "⏳ Extracting..." : "🧠 Auto-Extract Personas"}
            </button>

            {personaData && (
              <>
                <button
                  onClick={() => setShowCreateForm(true)}
                  style={{
                    padding: "12px 20px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    marginRight: "12px",
                  }}
                >
                  ➕ Add Persona
                </button>

                <button
                  onClick={deletePersonas}
                  style={{
                    padding: "12px 20px",
                    background:
                      "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(245, 101, 101, 0.3)",
                  }}
                >
                  🗑️ Delete All
                </button>
              </>
            )}
          </div>

          {/* Messages */}
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

          {message && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #c6f6d5, #9ae6b4)",
                border: "1px solid #68d391",
                color: "#276749",
                marginBottom: "24px",
              }}
            >
              {message}
            </div>
          )}

          {/* Personas Content */}
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
              Loading personas...
            </div>
          ) : !personaData ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#718096",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎯</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
                No personas created yet
              </h3>
              <p style={{ margin: 0, fontSize: "16px" }}>
                Click &quot;Auto-Extract Personas&quot; to analyze your website
                content and create customer personas automatically!
              </p>
            </div>
          ) : (
            <PersonasList
              personaData={personaData}
              onEditPersona={setEditingPersona}
              onRemovePersona={removePersona}
            />
          )}

          {/* Edit/Create Forms */}
          {(editingPersona || showCreateForm) && (
            <PersonaForm
              persona={editingPersona}
              onSave={editingPersona ? updatePersona : addNewPersona}
              onCancel={() => {
                setEditingPersona(null);
                setShowCreateForm(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Personas List Component
const PersonasList: React.FC<{
  personaData: PersonaData;
  onEditPersona: (persona: CustomerPersona) => void;
  onRemovePersona: (personaId: string) => void;
}> = ({ personaData, onEditPersona, onRemovePersona }) => {
  return (
    <div>
      {/* Overview Stats */}
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>🎯</div>
            <strong style={{ color: "#2d3748", display: "block" }}>
              {personaData.targetAudiences.length} Personas
            </strong>
            <span style={{ color: "#718096", fontSize: "14px" }}>
              Target audiences identified
            </span>
          </div>
          <div>
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>🏢</div>
            <strong style={{ color: "#2d3748", display: "block" }}>
              {personaData.industryFocus.length} Industries
            </strong>
            <span style={{ color: "#718096", fontSize: "14px" }}>
              {personaData.industryFocus.slice(0, 2).join(", ")}
              {personaData.industryFocus.length > 2 ? "..." : ""}
            </span>
          </div>
          <div>
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>💰</div>
            <strong style={{ color: "#2d3748", display: "block" }}>
              {personaData.pricingStrategy}
            </strong>
            <span style={{ color: "#718096", fontSize: "14px" }}>
              Pricing strategy
            </span>
          </div>
        </div>
      </div>

      {/* Personas Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {personaData.targetAudiences.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            onEdit={() => onEditPersona(persona)}
            onRemove={() => onRemovePersona(persona.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Individual Persona Card
const PersonaCard: React.FC<{
  persona: CustomerPersona;
  onEdit: () => void;
  onRemove: () => void;
}> = ({ persona, onEdit, onRemove }) => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e2e8f0",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#2d3748",
            }}
          >
            {persona.name}
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onEdit}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
              title="Edit persona"
            >
              ✏️
            </button>
            <button
              onClick={onRemove}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
              title="Delete persona"
            >
              🗑️
            </button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, #667eea20, #764ba220)",
              color: "#667eea",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {persona.type}
          </span>
          <span
            style={{
              background: "linear-gradient(135deg, #48bb7820, #38a16920)",
              color: "#38a169",
              padding: "2px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {persona.companySize}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
        <div style={{ marginBottom: "12px" }}>
          <strong style={{ color: "#4a5568" }}>Industries:</strong>
          <div style={{ color: "#718096", marginTop: "4px" }}>
            {persona.industries.join(", ")}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <strong style={{ color: "#4a5568" }}>Pain Points:</strong>
          <div style={{ color: "#718096", marginTop: "4px" }}>
            {persona.painPoints.slice(0, 2).join(", ")}
            {persona.painPoints.length > 2 && "..."}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <strong style={{ color: "#4a5568" }}>Budget:</strong>
          <span style={{ color: "#718096", marginLeft: "8px" }}>
            {persona.budget}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
            fontSize: "12px",
          }}
        >
          <span style={{ color: "#718096" }}>
            {persona.technicalLevel} • {persona.urgency} urgency
          </span>
          {persona.decisionMaker && (
            <span
              style={{
                background: "#ffd70020",
                color: "#b7791f",
                padding: "2px 6px",
                borderRadius: "8px",
                fontWeight: "600",
              }}
            >
              Decision Maker
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Persona Form Component (for editing/creating)
const PersonaForm: React.FC<{
  persona?: CustomerPersona | null;
  onSave: (persona: any) => void;
  onCancel: () => void;
}> = ({ persona, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: persona?.name || "",
    type: persona?.type || "small_business",
    industries: persona?.industries || [],
    companySize: persona?.companySize || "1-10",
    painPoints: persona?.painPoints || [],
    preferredFeatures: persona?.preferredFeatures || [],
    buyingPatterns: persona?.buyingPatterns || [],
    budget: persona?.budget || "under_500",
    technicalLevel: persona?.technicalLevel || "beginner",
    urgency: persona?.urgency || "medium",
    decisionMaker: persona?.decisionMaker || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <h3
          style={{
            margin: "0 0 20px 0",
            fontSize: "20px",
            fontWeight: "600",
            color: "#2d3748",
          }}
        >
          {persona ? "Edit Persona" : "Create New Persona"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Name:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Type:
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="small_business">Small Business</option>
                <option value="enterprise">Enterprise</option>
                <option value="startup">Startup</option>
                <option value="freelancer">Freelancer</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Company Size:
              </label>
              <select
                value={formData.companySize}
                onChange={(e) =>
                  setFormData({ ...formData, companySize: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Industries (comma-separated):
            </label>
            <input
              type="text"
              value={formData.industries.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  industries: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              placeholder="e.g., technology, healthcare, finance"
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Pain Points (comma-separated):
            </label>
            <textarea
              value={formData.painPoints.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  painPoints: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                minHeight: "80px",
                resize: "vertical",
              }}
              placeholder="e.g., limited budget, complex setup, lack of time"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Budget:
              </label>
              <select
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="under_500">Under $500</option>
                <option value="500_2000">$500 - $2,000</option>
                <option value="2000_10000">$2,000 - $10,000</option>
                <option value="10000_plus">$10,000+</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Technical Level:
              </label>
              <select
                value={formData.technicalLevel}
                onChange={(e) =>
                  setFormData({ ...formData, technicalLevel: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                }}
              >
                Urgency:
              </label>
              <select
                value={formData.urgency}
                onChange={(e) =>
                  setFormData({ ...formData, urgency: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <input
                type="checkbox"
                checked={formData.decisionMaker}
                onChange={(e) =>
                  setFormData({ ...formData, decisionMaker: e.target.checked })
                }
              />
              <span style={{ fontWeight: "500" }}>Decision Maker</span>
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              type="submit"
              style={{
                padding: "12px 20px",
                background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                flex: 1,
              }}
            >
              {persona ? "Update Persona" : "Create Persona"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "12px 20px",
                background: "#e2e8f0",
                color: "#4a5568",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPersonaSection;
