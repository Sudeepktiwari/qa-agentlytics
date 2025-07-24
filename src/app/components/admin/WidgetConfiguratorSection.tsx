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
              🎨 Theme
            </label>
            <select
              value={widgetConfig.theme}
              onChange={(e) =>
                onWidgetConfigChange({
                  ...widgetConfig,
                  theme: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="custom">Custom Color</option>
            </select>
          </div>

          {widgetConfig.theme === "custom" && (
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
                🌈 Custom Color
              </label>
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
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  height: "40px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

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
              📏 Size
            </label>
            <select
              value={widgetConfig.size}
              onChange={(e) =>
                onWidgetConfigChange({
                  ...widgetConfig,
                  size: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
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
              📍 Position
            </label>
            <select
              value={widgetConfig.position}
              onChange={(e) =>
                onWidgetConfigChange({
                  ...widgetConfig,
                  position: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
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
