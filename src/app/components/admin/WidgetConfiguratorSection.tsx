"use client";

import React from "react";

interface WidgetConfig {
  theme: string;
  size: string;
  position: string;
  chatTitle: string;
  buttonText: string;
  welcomeMessage: string;
  customColor: string;
}

interface WidgetConfiguratorSectionProps {
  apiKey: string;
  widgetConfig: WidgetConfig;
  onWidgetConfigChange: (config: WidgetConfig) => void;
  onCopyToClipboard: (text: string) => void;
}

const WidgetConfiguratorSection: React.FC<WidgetConfiguratorSectionProps> = ({
  apiKey,
  widgetConfig,
  onWidgetConfigChange,
  onCopyToClipboard,
}) => {
  // Helper function to get origin safely
  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : "YOUR_DOMAIN";

  // Get current theme color
  const getCurrentThemeColor = () => {
    switch (widgetConfig.theme) {
      case "blue":
        return "#3b82f6";
      case "green":
        return "#10b981";
      case "purple":
        return "#8b5cf6";
      case "custom":
        return widgetConfig.customColor;
      default:
        return "#3b82f6";
    }
  };

  // Generate widget script with current configuration
  const generateWidgetScript = () => {
    const configParams = [];
    if (widgetConfig.theme !== "blue")
      configParams.push(`data-theme="${widgetConfig.theme}"`);
    if (widgetConfig.size !== "medium")
      configParams.push(`data-size="${widgetConfig.size}"`);
    if (widgetConfig.position !== "bottom-right")
      configParams.push(`data-position="${widgetConfig.position}"`);
    if (widgetConfig.chatTitle !== "Chat with us")
      configParams.push(`data-chat-title="${widgetConfig.chatTitle}"`);
    if (widgetConfig.buttonText !== "💬")
      configParams.push(`data-button-text="${widgetConfig.buttonText}"`);
    if (widgetConfig.welcomeMessage)
      configParams.push(
        `data-welcome-message="${widgetConfig.welcomeMessage}"`
      );
    if (widgetConfig.customColor !== "#0070f3")
      configParams.push(`data-custom-color="${widgetConfig.customColor}"`);

    const allParams = [`data-api-key="${apiKey}"`, ...configParams].join(" ");
    return `<script src="${getOrigin()}/api/widget" ${allParams}></script>`;
  };

  if (!apiKey) {
    return null;
  }

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
        🎨 Widget Configurator
      </h3>
      <p
        style={{
          color: "#718096",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        Customize your widget appearance and get the script automatically
        updated
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        {/* Configuration Options */}
        <div>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
              }}
            >
              🎨 Theme
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
              }}
            >
              {[
                { value: "blue", label: "Blue", color: "#3b82f6" },
                { value: "green", label: "Green", color: "#10b981" },
                { value: "purple", label: "Purple", color: "#8b5cf6" },
                {
                  value: "custom",
                  label: "Custom",
                  color: widgetConfig.customColor,
                },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() =>
                    onWidgetConfigChange({
                      ...widgetConfig,
                      theme: theme.value,
                    })
                  }
                  style={{
                    padding: "12px 16px",
                    border:
                      widgetConfig.theme === theme.value
                        ? `2px solid ${theme.color}`
                        : "2px solid #e2e8f0",
                    borderRadius: "8px",
                    background:
                      widgetConfig.theme === theme.value
                        ? `linear-gradient(135deg, ${theme.color}20, ${theme.color}10)`
                        : "linear-gradient(135deg, #ffffff, #f8fafc)",
                    color:
                      widgetConfig.theme === theme.value
                        ? theme.color
                        : "#4a5568",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow:
                      widgetConfig.theme === theme.value
                        ? `0 4px 12px ${theme.color}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                    transform:
                      widgetConfig.theme === theme.value
                        ? "translateY(-1px)"
                        : "translateY(0)",
                  }}
                  onMouseEnter={(e) => {
                    if (widgetConfig.theme !== theme.value) {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = `${theme.color}80`;
                      target.style.background = `linear-gradient(135deg, ${theme.color}15, ${theme.color}08)`;
                      target.style.boxShadow = `0 4px 8px ${theme.color}20, inset 0 1px 0 rgba(255,255,255,0.1)`;
                      target.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (widgetConfig.theme !== theme.value) {
                      const target = e.target as HTMLButtonElement;
                      target.style.borderColor = "#e2e8f0";
                      target.style.background =
                        "linear-gradient(135deg, #ffffff, #f8fafc)";
                      target.style.boxShadow =
                        "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)";
                      target.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: theme.color,
                    }}
                  />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {widgetConfig.theme === "custom" && (
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#2d3748",
                }}
              >
                🌈 Custom Color
              </label>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <input
                  type="color"
                  value={widgetConfig.customColor}
                  onChange={(e) =>
                    onWidgetConfigChange({
                      ...widgetConfig,
                      customColor: e.target.value,
                    })
                  }
                  style={{
                    width: "50px",
                    height: "50px",
                    padding: "0",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />
                <input
                  type="text"
                  value={widgetConfig.customColor}
                  onChange={(e) =>
                    onWidgetConfigChange({
                      ...widgetConfig,
                      customColor: e.target.value,
                    })
                  }
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    color: "#2d3748",
                    background: "white",
                    outline: "none",
                  }}
                  placeholder="#0070f3"
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
              }}
            >
              📏 Size
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              {[
                { value: "small", label: "Small", icon: "📱" },
                { value: "medium", label: "Medium", icon: "💻" },
                { value: "large", label: "Large", icon: "🖥️" },
              ].map((size) => {
                const themeColor = getCurrentThemeColor();
                return (
                  <button
                    key={size.value}
                    onClick={() =>
                      onWidgetConfigChange({
                        ...widgetConfig,
                        size: size.value,
                      })
                    }
                    style={{
                      padding: "16px 12px",
                      border:
                        widgetConfig.size === size.value
                          ? `2px solid ${themeColor}`
                          : "2px solid #e2e8f0",
                      borderRadius: "8px",
                      background:
                        widgetConfig.size === size.value
                          ? `linear-gradient(135deg, ${themeColor}20, ${themeColor}20, ${themeColor}10)`
                          : "linear-gradient(135deg, #ffffff, #f8fafc)",
                      color:
                        widgetConfig.size === size.value
                          ? themeColor
                          : "#4a5568",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontWeight: "600",
                      fontSize: "14px",
                      textAlign: "center",
                      boxShadow:
                        widgetConfig.size === size.value
                          ? `0 4px 12px ${themeColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                      transform:
                        widgetConfig.size === size.value
                          ? "translateY(-1px)"
                          : "translateY(0)",
                    }}
                    onMouseEnter={(e) => {
                      if (widgetConfig.size !== size.value) {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = `${themeColor}80`;
                        target.style.background = `linear-gradient(135deg, ${themeColor}15, ${themeColor}15, ${themeColor}08)`;
                        target.style.boxShadow = `0 4px 8px ${themeColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`;
                        target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (widgetConfig.size !== size.value) {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = "#e2e8f0";
                        target.style.background =
                          "linear-gradient(135deg, #ffffff, #f8fafc)";
                        target.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)";
                        target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>
                      {size.icon}
                    </div>
                    {size.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
              }}
            >
              📍 Position
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
              }}
            >
              {[
                { value: "bottom-right", label: "Bottom Right", icon: "↘️" },
                { value: "bottom-left", label: "Bottom Left", icon: "↙️" },
                { value: "top-right", label: "Top Right", icon: "↗️" },
                { value: "top-left", label: "Top Left", icon: "↖️" },
              ].map((position) => {
                const themeColor = getCurrentThemeColor();
                return (
                  <button
                    key={position.value}
                    onClick={() =>
                      onWidgetConfigChange({
                        ...widgetConfig,
                        position: position.value,
                      })
                    }
                    style={{
                      padding: "12px 16px",
                      border:
                        widgetConfig.position === position.value
                          ? `2px solid ${themeColor}`
                          : "2px solid #e2e8f0",
                      borderRadius: "8px",
                      background:
                        widgetConfig.position === position.value
                          ? `linear-gradient(135deg, ${themeColor}20, ${themeColor}20, ${themeColor}10)`
                          : "linear-gradient(135deg, #ffffff, #f8fafc)",
                      color:
                        widgetConfig.position === position.value
                          ? themeColor
                          : "#4a5568",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontWeight: "600",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow:
                        widgetConfig.position === position.value
                          ? `0 4px 12px ${themeColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                          : "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
                      transform:
                        widgetConfig.position === position.value
                          ? "translateY(-1px)"
                          : "translateY(0)",
                    }}
                    onMouseEnter={(e) => {
                      if (widgetConfig.position !== position.value) {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = `${themeColor}80`;
                        target.style.background = `linear-gradient(135deg, ${themeColor}15, ${themeColor}15, ${themeColor}08)`;
                        target.style.boxShadow = `0 4px 8px ${themeColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`;
                        target.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (widgetConfig.position !== position.value) {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = "#e2e8f0";
                        target.style.background =
                          "linear-gradient(135deg, #ffffff, #f8fafc)";
                        target.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)";
                        target.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{position.icon}</span>
                    {position.label}
                  </button>
                );
              })}
            </div>
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
              💬 Chat Title
            </label>
            <input
              type="text"
              value={widgetConfig.chatTitle}
              onChange={(e) =>
                onWidgetConfigChange({
                  ...widgetConfig,
                  chatTitle: e.target.value,
                })
              }
              placeholder="Chat with us"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
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
              🔘 Button Text
            </label>
            <input
              type="text"
              value={widgetConfig.buttonText}
              onChange={(e) =>
                onWidgetConfigChange({
                  ...widgetConfig,
                  buttonText: e.target.value,
                })
              }
              placeholder="💬"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#2d3748",
              }}
            >
              👋 Welcome Message
            </label>
            <input
              type="text"
              value={widgetConfig.welcomeMessage}
              onChange={(e) =>
                onWidgetConfigChange({
                  ...widgetConfig,
                  welcomeMessage: e.target.value,
                })
              }
              placeholder="Hi! How can we help you today?"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Generated Script */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#2d3748",
            }}
          >
            🚀 Your Customized Script
          </label>
          <textarea
            readOnly
            value={generateWidgetScript()}
            style={{
              width: "100%",
              height: "200px",
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
            onClick={() => onCopyToClipboard(generateWidgetScript())}
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            📋 Copy Customized Script
          </button>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
              borderRadius: "8px",
              border: "1px solid #c7d2fe",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#4c1d95",
                lineHeight: "1.4",
              }}
            >
              💡 <strong>Tip:</strong> Changes to the widget configuration will
              update the script automatically. Copy the new script and replace
              it on your website to apply the changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetConfiguratorSection;
