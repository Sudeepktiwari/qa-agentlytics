"use client";

import React, { useEffect, useState } from "react";

interface OnboardingSettings {
  enabled: boolean;
  curlCommand?: string;
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
      // Only send the cURL command; enablement handled server-side
      const settingsToSave = { curlCommand: settings.curlCommand };
      const res = await fetch("/api/admin/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ onboarding: settingsToSave }),
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

          {/* Canonical registration cURL command */}
          <div>
            <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>
              Canonical registration cURL
            </label>
            <textarea
              placeholder={"curl -X POST https://api.your-service.com/register \\\n+  -H 'Content-Type: application/json' \\\n+  -H 'Authorization: Bearer <token>' \\\n+  -d '{\"email\":\"user@example.com\",\"firstName\":\"Jane\",\"lastName\":\"Doe\"}'"}
              value={settings.curlCommand || ""}
              onChange={(e) => setSettings({ ...settings, curlCommand: e.target.value })}
              rows={6}
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
              }}
            />
            <div style={{ color: "#718096", fontSize: 12, marginTop: 6 }}>
              Paste the exact cURL used to register a user. We will auto-derive
              method, URL, headers, content type, and required fields from it.
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

          {/* Removed document upload: onboarding now only needs the cURL command */}
        </div>
      )}
    </div>
  );
};

export default OnboardingSettingsSection;