"use client";
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  DollarSign,
  Users,
  Clock,
  Zap,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  X,
  Wand2,
} from "lucide-react";

interface BantQuestion {
  id: string;
  question: string;
  options: string[];
  active: boolean;
}

interface BantConfiguration {
  adminId: string;
  budget: BantQuestion[];
  authority: BantQuestion[];
  need: BantQuestion[];
  timeline: BantQuestion[];
  updatedAt: Date;
}

const BantQualificationSection: React.FC = () => {
  const [config, setConfig] = useState<BantConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "budget" | "authority" | "need" | "timeline"
  >("budget");

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bant");
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
      } else {
        setError(data.error || "Failed to fetch BANT configuration");
      }
    } catch (err) {
      console.error("Error fetching BANT config:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (
      !confirm(
        "This will overwrite your current BANT questions with AI-generated ones based on your website content. Continue?",
      )
    ) {
      return;
    }

    setGenerating(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/bant/generate", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setConfig(data.config);
        setMessage(
          "Questions generated successfully! Don't forget to review and save.",
        );
      } else {
        setError(data.error || "Failed to generate questions");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to generation service");
    } finally {
      setGenerating(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/bant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budget: config.budget,
          authority: config.authority,
          need: config.need,
          timeline: config.timeline,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Configuration saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Failed to save configuration");
      }
    } catch (err) {
      console.error("Error saving BANT config:", err);
      setError("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!config) return;
    const newQuestion: BantQuestion = {
      id: `q_${Date.now()}`,
      question: "",
      options: [""],
      active: true,
    };
    setConfig({
      ...config,
      [activeCategory]: [...config[activeCategory], newQuestion],
    });
  };

  const updateQuestion = (
    index: number,
    field: keyof BantQuestion,
    value: any,
  ) => {
    if (!config) return;
    const updatedList = [...config[activeCategory]];
    updatedList[index] = { ...updatedList[index], [field]: value };
    setConfig({ ...config, [activeCategory]: updatedList });
  };

  const removeQuestion = (index: number) => {
    if (!config) return;
    const updatedList = [...config[activeCategory]];
    updatedList.splice(index, 1);
    setConfig({ ...config, [activeCategory]: updatedList });
  };

  const addOption = (qIndex: number) => {
    if (!config) return;
    const updatedList = [...config[activeCategory]];
    updatedList[qIndex].options.push("");
    setConfig({ ...config, [activeCategory]: updatedList });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    if (!config) return;
    const updatedList = [...config[activeCategory]];
    updatedList[qIndex].options[oIndex] = value;
    setConfig({ ...config, [activeCategory]: updatedList });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    if (!config) return;
    const updatedList = [...config[activeCategory]];
    updatedList[qIndex].options.splice(oIndex, 1);
    setConfig({ ...config, [activeCategory]: updatedList });
  };

  const categories = [
    {
      id: "budget",
      label: "Budget",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      id: "authority",
      label: "Authority",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      id: "need",
      label: "Need",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ] as const;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-sm">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              BANT Qualification
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider border border-teal-100">
                Configuration
              </span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage global qualification questions for Budget, Authority, Need,
              and Timeline
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <span className="animate-spin">✨</span>
          ) : (
            <Wand2 size={16} />
          )}
          {generating ? "Generating..." : "Auto-Generate from Website"}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700 text-sm animate-in fade-in">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <div>{message}</div>
          </div>
        )}

        {loading && !config ? (
          <div className="py-12 text-center text-slate-500">
            Loading configuration...
          </div>
        ) : config ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    activeCategory === cat.id
                      ? `${cat.bg} ${cat.border} ${cat.color} ring-1 ring-inset ring-black/5`
                      : "bg-white border-transparent hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <cat.icon size={18} />
                  {cat.label}
                  <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-md text-xs border border-black/5">
                    {config[cat.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                  {activeCategory} Questions
                </h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              <div className="space-y-6">
                {config[activeCategory].map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Question Text
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(qIndex, "question", e.target.value)
                          }
                          placeholder="e.g., What is your budget range?"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mt-6"
                        title="Remove Question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="pl-4 border-l-2 border-slate-100">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Answer Options
                      </label>
                      <div className="space-y-2">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                updateOption(qIndex, oIndex, e.target.value)
                              }
                              placeholder="Option text..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(qIndex)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-2 px-2 py-1 rounded hover:bg-blue-50 transition-colors w-fit"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {config[activeCategory].length === 0 && (
                  <div className="text-center py-8 text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-sm">
                      No questions added for this category yet.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                <button
                  onClick={saveConfig}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BantQualificationSection;
