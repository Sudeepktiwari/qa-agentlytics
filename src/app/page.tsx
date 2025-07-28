"use client";

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 600,
        margin: "40px auto",
        fontFamily: "sans-serif",
        backgroundColor: "#ffffff",
        color: "#000000",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: 32,
          color: "#000000",
        }}
      >
        Welcome to Our Website
      </h1>
      <div style={{ textAlign: "center", color: "#666" }}>
        <p>This is a sample page with our chatbot widget.</p>
        <p>Look for the chat bubble in the bottom-right corner!</p>
      </div>
    </main>
  );
}
