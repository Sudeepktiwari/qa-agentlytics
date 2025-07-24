"use client";

import React from "react";

interface ApiKeyManagementSectionProps {
  apiKey: string;
  apiKeyLoading: boolean;
  apiKeyError: string;
  showApiKey: boolean;
  apiKeyCreated: string;
  onGenerateApiKey: () => void;
  onToggleShowApiKey: () => void;
  onCopyToClipboard: (text: string) => void;
}

const ApiKeyManagementSection: React.FC<ApiKeyManagementSectionProps> = ({
  apiKey,
  apiKeyLoading,
  apiKeyError,
  showApiKey,
  apiKeyCreated,
  onGenerateApiKey,
  onToggleShowApiKey,
  onCopyToClipboard,
}) => {
  // Helper function to get origin safely
  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : "YOUR_DOMAIN";

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
          🔐 Website Integration
        </h2>
        <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
          Use these credentials to embed the chatbot on your website
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* API Key Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea10, #764ba210)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              color: "#4a5568",
              fontSize: "18px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔑 API Key
          </h3>
          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            Your unique authentication key for widget integration
          </p>
          {apiKey ? (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  style={{
                    fontFamily: "monospace",
                    fontSize: "13px",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    width: "220px",
                    backgroundColor: "#f7fafc",
                    color: "#2d3748",
                  }}
                />
                <button
                  onClick={onToggleShowApiKey}
                  style={{
                    padding: "12px 16px",
                    background: "linear-gradient(135deg, #4299e1, #3182ce)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {showApiKey ? "👁️‍🗨️ Hide" : "👁️ Show"}
                </button>
                <button
                  onClick={() => onCopyToClipboard(apiKey)}
                  style={{
                    padding: "12px 16px",
                    background: "linear-gradient(135deg, #48bb78, #38a169)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  📋 Copy
                </button>
              </div>
              {apiKeyCreated && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#718096",
                    marginBottom: "16px",
                  }}
                >
                  ⏰ Created: {new Date(apiKeyCreated).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: "16px" }}>
              <p
                style={{
                  color: "#718096",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                No API key generated yet. Create one to enable widget
                integration.
              </p>
            </div>
          )}

          <button
            onClick={onGenerateApiKey}
            disabled={apiKeyLoading}
            style={{
              width: "100%",
              padding: "12px 20px",
              background: apiKeyLoading
                ? "#a0aec0"
                : apiKey
                ? "linear-gradient(135deg, #f56565, #e53e3e)"
                : "linear-gradient(135deg, #48bb78, #38a169)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: apiKeyLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: apiKeyLoading
                ? "none"
                : apiKey
                ? "0 4px 12px rgba(245, 101, 101, 0.3)"
                : "0 4px 12px rgba(72, 187, 120, 0.3)",
            }}
          >
            {apiKeyLoading
              ? "⏳ Generating..."
              : apiKey
              ? "🔄 Regenerate API Key"
              : "✨ Generate API Key"}
          </button>

          {apiKeyError && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                border: "1px solid #fc8181",
                color: "#742a2a",
                fontSize: "14px",
                marginTop: "12px",
              }}
            >
              {apiKeyError}
            </div>
          )}
        </div>

        {/* Widget Script Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #e6fffa10, #b2f5ea10)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px 0",
              color: "#4a5568",
              fontSize: "18px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📝 Widget Script
          </h3>
          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            Add this script tag to your website to embed the chatbot
          </p>
          {apiKey ? (
            <div>
              <textarea
                readOnly
                value={`<script src="${getOrigin()}/api/widget" data-api-key="${apiKey}"></script>`}
                style={{
                  width: "100%",
                  height: "80px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "#f7fafc",
                  resize: "none",
                  color: "#2d3748",
                  boxSizing: "border-box",
                  marginBottom: "12px",
                }}
              />
              <button
                onClick={() =>
                  onCopyToClipboard(
                    `<script src="${getOrigin()}/api/widget" data-api-key="${apiKey}"></script>`
                  )
                }
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                📋 Copy Script
              </button>
            </div>
          ) : (
            <div
              style={{
                padding: "20px",
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "8px",
                textAlign: "center",
                color: "#718096",
                fontSize: "14px",
              }}
            >
              Generate an API key first to get the widget script.
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div
        style={{
          background: "linear-gradient(135deg, #edf2f710, #e2e8f010)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            color: "#4a5568",
            fontSize: "18px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ⚡ How it works
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
          }}
        >
          {[
            "🎯 Automatically detects which page the user is viewing",
            "💬 Provides contextual responses based on your crawled content",
            "👤 Links all conversations to your admin account",
            "📧 Collects user emails for lead generation",
            "⏰ Sends automatic followup messages",
          ].map((item, index) => (
            <div
              key={index}
              style={{
                color: "#4a5568",
                fontSize: "14px",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.6)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Security Note */}
      <div
        style={{
          background: "linear-gradient(135deg, #fef5e7, #fed7aa)",
          border: "1px solid #f6ad55",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>🔒</span>
          <div>
            <h4
              style={{
                margin: "0 0 8px 0",
                color: "#744210",
                fontSize: "16px",
              }}
            >
              Security Best Practices
            </h4>
            <p style={{ margin: 0, fontSize: "14px", color: "#744210" }}>
              Keep your API key secure and never expose it in client-side code.
              The widget script handles authentication automatically. Regenerate
              your API key if you suspect it has been compromised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManagementSection;
