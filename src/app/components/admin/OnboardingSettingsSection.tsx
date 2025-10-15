"use client";

import React, { useEffect, useState } from "react";

interface OnboardingSettings {
  enabled: boolean;
  apiBaseUrl?: string;
  apiKey?: string;
  docsUrl?: string;
}

const OnboardingSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<OnboardingSettings>({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/onboarding", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success) {
          setSettings({ ...(data.onboarding || { enabled: false }) });
        } else {
          setError(data.error || "Failed to load onboarding settings");
        }
      } catch (e) {
        setError("Failed to load onboarding settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ onboarding: settings }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.onboarding);
        setSuccess("Onboarding settings saved successfully");
        setTimeout(() => setSuccess(null), 2500);
      } else {
        setError(data.error || "Failed to save onboarding settings");
      }
    } catch (e) {
      setError("Failed to save onboarding settings");
    } finally {
      setSaving(false);
    }
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
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "20px",
          fontWeight: "700",
          color: "#2d3748",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🧭 Onboarding Settings
      </h3>

      {loading ? (
        <div style={{ color: "#718096" }}>Loading onboarding settings…</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                border: "1px solid #fc8181",
                color: "#742a2a",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #c6f6d5, #9ae6b4)",
                border: "1px solid #68d391",
                color: "#22543d",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              {success}
            </div>
          )}

          {/* Enable toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              checked={!!settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            />
            <span style={{ color: "#2d3748", fontWeight: 600 }}>Enable onboarding</span>
          </label>

          {/* API Base URL */}
          <div>
            <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>
              Registration API Base URL
            </label>
            <input
              type="text"
              placeholder="https://api.your-service.com"
              value={settings.apiBaseUrl || ""}
              onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
              }}
            />
            <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
              Base URL for your user registration API (onboarding submissions)
            </div>
          </div>

          {/* API Key */}
          <div>
            <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>
              Registration API Key
            </label>
            <input
              type="text"
              placeholder="Paste API key"
              value={settings.apiKey || ""}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
              }}
            />
            <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
              Used for Authorization header when calling your registration API
            </div>
          </div>

          {/* Docs URL */}
          <div>
            <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>
              Public Docs URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://docs.your-service.com/onboarding"
              value={settings.docsUrl || ""}
              onChange={(e) => setSettings({ ...settings, docsUrl: e.target.value })}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
              }}
            />
            <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
              Shown to users at onboarding start for additional reference
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: "12px 16px",
                background: saving
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #48bb78, #38a169)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving…" : "Save Onboarding Settings"}
            </button>
          </div>

          <div style={{ marginTop: 16, color: "#718096", fontSize: 13 }}>
            Tip: Upload your onboarding API documentation below. It will be embedded and
            stored as searchable vectors to help the bot answer onboarding questions.
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingSettingsSection;