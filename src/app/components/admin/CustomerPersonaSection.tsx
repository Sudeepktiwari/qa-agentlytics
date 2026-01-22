import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Target,
  Briefcase,
  DollarSign,
  Zap,
  Trash2,
  Edit2,
  Plus,
  ChevronDown,
  ChevronUp,
  Cpu,
  Building2,
  PieChart,
  AlertCircle,
  CheckCircle2,
  X,
  Save,
} from "lucide-react";

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
  bantQuestions: {
    budget: { question: string; options: string[] }[];
    authority: { question: string; options: string[] }[];
    need: { question: string; options: string[] }[];
    timeline: { question: string; options: string[] }[];
  };
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
    null,
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
      console.log("Starting persona auto-extraction...");

      const res = await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_extract",
          // websiteUrl is now optional - will be auto-detected from crawled content
        }),
      });

      const data = await res.json();
      console.log("Persona extraction response:", data);

      if (res.ok) {
        setPersonaData(data.personas);
        setMessage(data.message);
        console.log(
          "Successfully extracted personas:",
          data.personas?.targetAudiences?.length || 0,
        );
      } else {
        setError(data.error || "Failed to extract personas");
        console.error("Persona extraction failed:", data.error);
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
        "Are you sure you want to delete all personas? This action cannot be undone.",
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
        : p,
    );

    const updatedData = {
      ...personaData,
      targetAudiences: updatedAudiences,
      updatedAt: new Date(),
    };

    savePersonas(updatedData);
  };

  const addNewPersona = (
    newPersona: Omit<CustomerPersona, "id" | "createdAt" | "updatedAt">,
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
      (p) => p.id !== personaId,
    );

    const updatedData = {
      ...personaData,
      targetAudiences: updatedAudiences,
      updatedAt: new Date(),
    };

    savePersonas(updatedData);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div
        onClick={onToggleExpanded}
        className={`p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors ${
          expanded ? "border-b border-slate-100" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              Customer Personas
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                {personaData?.targetAudiences?.length || 0} personas
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Analyze and manage your target customer personas for intelligent
              messaging
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          {expanded ? "Collapse" : "Expand"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 md:p-6 bg-slate-50/30">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button
              onClick={autoExtractPersonas}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all ${
                loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <Zap className="animate-spin" size={16} />
              ) : (
                <Zap size={16} />
              )}
              {loading ? "Extracting..." : "Auto-Extract Personas"}
            </button>

            {personaData && (
              <>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Add Persona
                </button>

                <button
                  onClick={deletePersonas}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm ml-auto"
                >
                  <Trash2 size={16} />
                  Delete All
                </button>
              </>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <div>{message}</div>
            </div>
          )}

          {/* Personas Content */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Users size={32} className="text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">
                Analyzing content...
              </h3>
              <p className="text-slate-500 text-sm">
                Identifying customer patterns and segments
              </p>
            </div>
          ) : !personaData ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <Target size={32} className="text-slate-400" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-2">
                No personas created yet
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Click "Auto-Extract Personas" to analyze your website content
                and create customer personas automatically!
              </p>
              <button
                onClick={autoExtractPersonas}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <Zap size={16} />
                Start Extraction
              </button>
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
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <strong className="block text-slate-900 text-lg">
                {personaData.targetAudiences.length}
              </strong>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                Personas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <strong className="block text-slate-900 text-lg">
                {personaData.industryFocus.length}
              </strong>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                Industries
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <strong
                className="block text-slate-900 text-sm truncate max-w-[150px]"
                title={personaData.pricingStrategy}
              >
                {personaData.pricingStrategy || "N/A"}
              </strong>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                Pricing Strategy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1 group">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {persona.name}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Edit persona"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Delete persona"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            {persona.type}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            {persona.companySize}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div>
          <strong className="text-slate-700 font-semibold text-xs uppercase tracking-wide">
            Industries
          </strong>
          <div className="text-slate-500 mt-1 leading-relaxed">
            {persona.industries.join(", ")}
          </div>
        </div>

        <div>
          <strong className="text-slate-700 font-semibold text-xs uppercase tracking-wide">
            Pain Points
          </strong>
          <div className="text-slate-500 mt-1 leading-relaxed">
            {persona.painPoints.slice(0, 2).join(", ")}
            {persona.painPoints.length > 2 && "..."}
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <DollarSign size={12} className="text-slate-400" />
            {persona.budget}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                persona.urgency === "high"
                  ? "bg-red-500"
                  : persona.urgency === "medium"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
            />
            <span className="text-xs text-slate-500 font-medium capitalize">
              {persona.urgency}
            </span>
          </div>
        </div>

        {persona.decisionMaker && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md border border-amber-100 w-full justify-center">
            <Zap size={10} className="fill-current" />
            Decision Maker
          </div>
        )}

        {persona.bantQuestions && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase size={12} /> BANT Questions
            </div>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(persona.bantQuestions).map(
                ([key, questions]) =>
                  questions &&
                  questions.length > 0 && (
                    <span
                      key={key}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize"
                    >
                      {key}: {questions.length}
                    </span>
                  ),
              )}
            </div>
          </div>
        )}
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
    bantQuestions: persona?.bantQuestions || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        // Close modal if clicking the backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {persona ? "Edit Persona" : "Create New Persona"}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="persona-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Persona Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g. Enterprise Decision Maker"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Type
                </label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="small_business">Small Business</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="startup">Startup</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="agency">Agency</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Company Size
                </label>
                <div className="relative">
                  <select
                    value={formData.companySize}
                    onChange={(e) =>
                      setFormData({ ...formData, companySize: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="200+">200+ employees</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Industries (comma-separated)
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
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="e.g., technology, healthcare, finance"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Pain Points (comma-separated)
              </label>
              <textarea
                value={formData.painPoints.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    painPoints: e.target.value.split(",").map((s) => s.trim()),
                  })
                }
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[80px] resize-y"
                placeholder="e.g., limited budget, complex setup, lack of time"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Budget
                </label>
                <div className="relative">
                  <select
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="under_500">Under $500</option>
                    <option value="500_2000">$500 - $2,000</option>
                    <option value="2000_10000">$2,000 - $10,000</option>
                    <option value="10000_plus">$10,000+</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tech Level
                </label>
                <div className="relative">
                  <select
                    value={formData.technicalLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        technicalLevel: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Urgency
                </label>
                <div className="relative">
                  <select
                    value={formData.urgency}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.decisionMaker}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        decisionMaker: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                  Decision Maker
                </span>
              </label>
            </div>

            {/* BANT Questions Section */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                BANT Qualification Questions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(["budget", "authority", "need", "timeline"] as const).map(
                  (category) => (
                    <div
                      key={category}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                          {category === "budget" && (
                            <DollarSign
                              size={14}
                              className="text-emerald-600"
                            />
                          )}
                          {category === "authority" && (
                            <Users size={14} className="text-blue-600" />
                          )}
                          {category === "need" && (
                            <Target size={14} className="text-amber-600" />
                          )}
                          {category === "timeline" && (
                            <PieChart size={14} className="text-purple-600" />
                          )}
                          {category}
                        </label>
                        <button
                          type="button"
                          onClick={() => addBantQuestion(category)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(formData.bantQuestions[category] || []).map(
                          (q, qIdx) => (
                            <div
                              key={`${category}-${qIdx}`}
                              className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                            >
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={q.question}
                                  onChange={(e) =>
                                    handleBantQuestionChange(
                                      category,
                                      qIdx,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`${category} question...`}
                                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeBantQuestion(category, qIdx)
                                  }
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              {/* Options */}
                              <div className="pl-2 border-l-2 border-slate-100 ml-1 space-y-2">
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                  Options
                                </div>
                                {(q.options || []).map((opt, oIdx) => (
                                  <div
                                    key={`${category}-${qIdx}-opt-${oIdx}`}
                                    className="flex gap-2 items-center"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) =>
                                        handleBantOptionChange(
                                          category,
                                          qIdx,
                                          oIdx,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Option label..."
                                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeBantOption(category, qIdx, oIdx)
                                      }
                                      className="text-slate-300 hover:text-red-400 p-0.5"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addBantOption(category, qIdx)}
                                  className="text-[10px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1 pl-3"
                                >
                                  <Plus size={10} /> Add Option
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const form = document.getElementById(
                "persona-form",
              ) as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {persona ? "Update Persona" : "Create Persona"}
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal outside the parent container
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  // Fallback for SSR
  return modalContent;
};

export default CustomerPersonaSection;
