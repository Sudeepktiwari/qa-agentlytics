"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [apiKey, setApiKey] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadWidget = () => {
    const v = apiKey.trim();
    if (!v) return alert("Please paste your API key");
    const s = document.createElement("script");
    s.src = "/api/onboarding/widget";
    s.setAttribute("data-api-key", v);
    s.setAttribute("data-onboarding-only", "true");
    s.setAttribute("data-chat-title", "Onboarding Assistant");
    s.setAttribute("data-theme", "green");
    s.setAttribute("data-auto-open-proactive", "false");
    s.setAttribute("data-mirror-mode", "false");
    s.onload = () => setLoaded(true);
    document.body.appendChild(s);
  };

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        margin: 0,
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1>Onboarding Assistant</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
          Paste your API key to load the onboarding-only widget.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            placeholder="ak_................................................................."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <button
            onClick={loadWidget}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#10b981",
              color: "white",
              fontWeight: 600,
            }}
          >
            Load Widget
          </button>
        </div>
        {loaded && (
          <p style={{ color: "#10b981", fontSize: 14, marginTop: 10 }}>
            Widget loaded.
          </p>
        )}
      </div>
    </div>
  );
}
