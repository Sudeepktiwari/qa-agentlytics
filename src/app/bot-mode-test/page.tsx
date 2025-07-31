import React from "react";

export default function BotModeTest() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🤖 Direct Bot Mode Indicator Test</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test 1: Static Lead Mode Indicator</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            border: "1px solid #ccc",
            padding: 16,
            borderRadius: 8,
            backgroundColor: "#ffffff",
          }}
        >
          <h3 style={{ color: "#000000", margin: 0 }}>Chatbot</h3>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: 12,
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: "#f3e5f5",
              color: "#7b1fa2",
              border: "1px solid #e1bee7",
            }}
          >
            LEAD MODE
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test 2: Static Sales Mode Indicator</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            border: "1px solid #ccc",
            padding: 16,
            borderRadius: 8,
            backgroundColor: "#ffffff",
          }}
        >
          <h3 style={{ color: "#000000", margin: 0 }}>Chatbot</h3>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: 12,
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              border: "1px solid #bbdefb",
            }}
          >
            SALES MODE
            <span style={{ marginLeft: 4, opacity: 0.7 }}>
              • test@example.com
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Console Log Test</h3>
        <button
          onClick={() => {
            console.log("[BotModeTest] Button clicked - testing console logs");
            alert("Check console for log message");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Test Console Logging
        </button>
      </div>

      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        <strong>What you should see:</strong>
        <ul>
          <li>Two chatbot headers with different colored badges</li>
          <li>Purple "LEAD MODE" badge in the first one</li>
          <li>Blue "SALES MODE • test@example.com" badge in the second one</li>
          <li>Console log when clicking the button</li>
        </ul>

        <strong>If you don't see the badges:</strong>
        <ul>
          <li>There might be a CSS styling issue</li>
          <li>Check browser zoom level (try 100%)</li>
          <li>Try in a different browser</li>
        </ul>
      </div>
    </div>
  );
}
