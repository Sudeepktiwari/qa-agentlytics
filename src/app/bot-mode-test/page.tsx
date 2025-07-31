"use client";

import React from "react";

export default function BotModeTest() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🤖 Direct Bot Mode Indicator Test</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test 1: Static Lead Mode Circle (Purple)</h3>
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
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#7b1fa2",
              flexShrink: 0,
            }}
            title="Lead Mode"
          ></div>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test 2: Static Sales Mode Circle (Green)</h3>
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
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#4caf50",
              flexShrink: 0,
            }}
            title="Sales Mode • test@example.com"
          ></div>
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
          <li>Two chatbot headers with different colored circles</li>
          <li>Purple circle in the first one (Lead Mode)</li>
          <li>Green circle in the second one (Sales Mode with email)</li>
          <li>Console log when clicking the button</li>
          <li>Hover over circles to see tooltip with mode info</li>
        </ul>

        <strong>If you don&apos;t see the circles:</strong>
        <ul>
          <li>There might be a CSS styling issue</li>
          <li>Check browser zoom level (try 100%)</li>
          <li>Try in a different browser</li>
        </ul>
      </div>
    </div>
  );
}
