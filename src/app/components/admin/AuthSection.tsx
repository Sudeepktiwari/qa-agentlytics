"use client";

import React from "react";

interface AuthSectionProps {
  auth: { email: string; adminId?: string } | null;
  authError: string;
  authLoading: boolean;
  form: {
    email: string;
    password: string;
    action: string;
  };
  onFormChange: (form: {
    email: string;
    password: string;
    action: string;
  }) => void;
  onAuth: (e: React.FormEvent) => void;
  onLogout: () => void;
}

const AuthSection: React.FC<AuthSectionProps> = ({
  auth,
  authError,
  authLoading,
  form,
  onFormChange,
  onAuth,
  onLogout,
}) => {
  const handleOnboardingRegisterClick = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const existingScript = document.querySelector(
      'script[data-onboarding-widget="true"]'
    );
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = `/api/onboarding/widget?cb=${Date.now()}`;
    script.async = true;
    script.setAttribute("data-onboarding-widget", "true");
    script.setAttribute(
      "data-api-key",
      "ak_ed1d712d17eb4de4201139ae22936abde730cf95372dc5fffe3a891216ae136e"
    );
    script.setAttribute("data-onboarding-only", "true");
    script.setAttribute("data-voice-enabled", "false");
    script.setAttribute("data-theme", "blue");
    script.setAttribute("data-chat-title", "Onboarding Assistant");
    script.setAttribute("data-widget", "appointy");
    document.body.appendChild(script);
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          padding: "20px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
          <h2 style={{ color: "#2d3748", margin: 0 }}>
            Checking authentication...
          </h2>
        </div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          padding: "20px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                color: "#2d3748",
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 8px 0",
              }}
            >
              🔐 Admin Access
            </h1>
            <p style={{ color: "#718096", fontSize: "16px", margin: 0 }}>
              Sign in to manage your chatbot
            </p>
          </div>

          {authError && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                border: "1px solid #fc8181",
                color: "#742a2a",
                marginBottom: "24px",
                fontSize: "14px",
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={onAuth}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#2d3748",
                }}
              >
                📧 Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  onFormChange({ ...form, email: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  color: "#2d3748",
                  background: "white",
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = "#667eea";
                  target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = "#e2e8f0";
                  target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#2d3748",
                }}
              >
                🔒 Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  onFormChange({ ...form, password: e.target.value })
                }
                required
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "16px",
                  color: "#2d3748",
                  background: "white",
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = "#667eea";
                  target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.style.borderColor = "#e2e8f0";
                  target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: authLoading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: authLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: authLoading
                  ? "none"
                  : "0 4px 12px rgba(102, 126, 234, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!authLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "translateY(-1px)";
                  target.style.boxShadow =
                    "0 8px 25px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!authLoading) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = "translateY(0)";
                  target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.3)";
                }
              }}
            >
              {authLoading
                ? "⏳ Processing..."
                : form.action === "login"
                ? "🚀 Sign In"
                : "✨ Create Account"}
            </button>
            <button
              type="button"
              onClick={handleOnboardingRegisterClick}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px 20px",
                background: "white",
                color: "#4a5568",
                border: "1px solid #cbd5e0",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#f7fafc";
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "white";
              }}
            >
              ✨ Register with onboarding bot
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Header component for authenticated users
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "24px 32px",
        marginBottom: "24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "28px",
            fontWeight: "700",
            color: "#2d3748",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          🤖 Chatbot Admin Panel
        </h1>
        <p
          style={{
            color: "#718096",
            fontSize: "16px",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "linear-gradient(135deg, #48bb7810, #38a16910)",
              padding: "4px 12px",
              borderRadius: "20px",
              color: "#38a169",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ✅ Logged in as {auth.email}
          </span>
        </p>
      </div>
      <button
        onClick={onLogout}
        style={{
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 12px rgba(238, 90, 82, 0.3)",
        }}
        onMouseEnter={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = "translateY(-1px)";
          target.style.boxShadow = "0 8px 25px rgba(238, 90, 82, 0.4)";
        }}
        onMouseLeave={(e) => {
          const target = e.target as HTMLButtonElement;
          target.style.transform = "translateY(0)";
          target.style.boxShadow = "0 4px 12px rgba(238, 90, 82, 0.3)";
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
};

export default AuthSection;
