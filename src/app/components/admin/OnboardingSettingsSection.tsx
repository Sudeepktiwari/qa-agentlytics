"use client";

import React, { useEffect, useState } from "react";
import { OnboardingSettings } from "@/lib/adminSettings";

const OnboardingSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<OnboardingSettings>({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Doc-to-cURL UI state
  const [docUrl, setDocUrl] = useState<string>("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [namespace, setNamespace] = useState<string>("docs");
  const [prompt, setPrompt] = useState<string>("");
  const [indexing, setIndexing] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [indexStatus, setIndexStatus] = useState<string>("");
  const [generatedCurl, setGeneratedCurl] = useState<string>("");
  const [hits, setHits] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/onboarding", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success) {
          const ob = data.onboarding || { enabled: false };
          setSettings({ ...ob });
          if (ob.docsUrl) setDocUrl(ob.docsUrl);
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
      // Save initial setup fields alongside canonical cURL
      const settingsToSave = {
        curlCommand: settings.curlCommand,
        docsUrl: settings.docsUrl,
        apiBaseUrl: settings.apiBaseUrl,
        registerEndpoint: settings.registerEndpoint,
        method: settings.method,
        apiKey: settings.apiKey,
        authHeaderKey: settings.authHeaderKey,
        idempotencyKeyField: settings.idempotencyKeyField,
        rateLimit: settings.rateLimit,
      };
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setDocFile(files[0]);
    } else {
      setDocFile(null);
    }
  };

  const indexDocs = async () => {
    try {
      setError(null);
      setSuccess(null);
      setGeneratedCurl("");
      setIndexStatus("");
      setHits(0);
      setIndexing(true);

      const form = new FormData();
      if (docUrl && docUrl.trim()) form.append("url", docUrl.trim());
      if (docFile) form.append("file", docFile);
      form.append("namespace", namespace || "docs");

      const indexRes = await fetch("/api/index", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const indexJson = await indexRes.json();
      if (!indexRes.ok || !indexJson.ok) {
        throw new Error(indexJson.error || "Failed to index docs");
      }
      setIndexStatus(`Indexed ${indexJson.count} chunks from ${indexJson.source}`);
    } catch (e: any) {
      setError(e?.message || "Failed to index docs");
    } finally {
      setIndexing(false);
    }

    // Auto-trigger generation
    try {
      setGenerating(true);
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: prompt || "Generate a canonical registration cURL", namespace, topK: 5 }),
      });
      const genJson = await genRes.json();
      if (!genRes.ok || !genJson.success) {
        throw new Error(genJson.error || "Failed to generate cURL");
      }
      setGeneratedCurl(genJson.curl || "");
      setHits(genJson.hits || 0);
      // Auto-populate the cURL field for saving
      setSettings((prev) => ({ ...prev, curlCommand: genJson.curl || prev.curlCommand }));
      setSuccess("Generated cURL from docs. You can review and save it.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e?.message || "Failed to generate cURL");
    } finally {
      setGenerating(false);
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

          {/* Initial Setup */}
          <div style={{ marginBottom: 16, padding: 12, border: "1px solid #e2e8f0", borderRadius: 12, background: "#f9fafb" }}>
            <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>API Docs URL</label>
            <input
              type="url"
              placeholder="https://yourdocs.page or https://docs.google.com/..."
              value={settings.docsUrl || ""}
              onChange={(e) => setSettings({ ...settings, docsUrl: e.target.value })}
              style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>API Base URL</label>
                <input
                  type="text"
                  placeholder="https://api.your-service.com"
                  value={settings.apiBaseUrl || ""}
                  onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Register Endpoint</label>
                <input
                  type="text"
                  placeholder="/users/register"
                  value={settings.registerEndpoint || ""}
                  onChange={(e) => setSettings({ ...settings, registerEndpoint: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>HTTP Method</label>
                <select
                  value={settings.method || "POST"}
                  onChange={(e) => setSettings({ ...settings, method: e.target.value as "POST" | "PUT" | "PATCH" })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, background: "white" }}
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Auth Header Key</label>
                <input
                  type="text"
                  placeholder="Authorization"
                  value={settings.authHeaderKey || "Authorization"}
                  onChange={(e) => setSettings({ ...settings, authHeaderKey: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>API Key / Token</label>
                <input
                  type="text"
                  placeholder="sk-..."
                  value={settings.apiKey || ""}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Idempotency Field</label>
                <input
                  type="text"
                  placeholder="email"
                  value={settings.idempotencyKeyField || "email"}
                  onChange={(e) => setSettings({ ...settings, idempotencyKeyField: e.target.value })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 10 }}>
              <div>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Rate Limit per Minute</label>
                <input
                  type="number"
                  min={1}
                  placeholder="30"
                  value={(settings.rateLimit?.perMinute ?? 30).toString()}
                  onChange={(e) => setSettings({ ...settings, rateLimit: { perMinute: parseInt(e.target.value || "30", 10) } })}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>
          </div>

          {/* Document indexing and cURL generation */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>
              Document URL (Google Docs or any public page)
            </label>
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/<DOC_ID>/edit?usp=sharing or https://yourdocs.page"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
            />

            <div style={{ marginTop: 10 }}>
              <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>
                Or upload a plain text file (.txt or .md)
              </label>
              <input type="file" accept=".txt,.md" onChange={handleFileChange} />
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Namespace</label>
                <input
                  type="text"
                  placeholder="docs"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Optional prompt</label>
              <textarea
                placeholder={"POST /users/register with JSON {email, password}; include Content-Type header"}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, fontFamily: "monospace" }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <button
                onClick={indexDocs}
                disabled={indexing || generating}
                style={{
                  padding: "10px 14px",
                  background: indexing || generating ? "#a0aec0" : "linear-gradient(135deg, #4299e1, #3182ce)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: indexing || generating ? "not-allowed" : "pointer",
                }}
              >
                {indexing ? "Indexing…" : generating ? "Generating cURL…" : "Index docs"}
              </button>
            </div>

            {indexStatus && (
              <div style={{ color: "#4a5568", fontSize: 12, marginTop: 6 }}>{indexStatus}</div>
            )}
            {generatedCurl && (
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", color: "#4a5568", fontSize: 13, marginBottom: 6 }}>Generated cURL</label>
                <textarea
                  value={generatedCurl}
                  readOnly
                  rows={5}
                  style={{ width: "100%", padding: 12, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, fontFamily: "monospace" }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedCurl)}
                    style={{ padding: "8px 12px", background: "#2d3748", color: "white", border: "none", borderRadius: 8, fontSize: 13 }}
                  >
                    Copy cURL
                  </button>
                  <span style={{ color: "#718096", fontSize: 12 }}>Context hits: {hits}</span>
                </div>
              </div>
            )}
          </div>

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
        </div>
      )}
    </div>
  );
};

export default OnboardingSettingsSection;