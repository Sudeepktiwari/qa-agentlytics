"use client";
import Chatbot from "./components/Chatbot";

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
        Document Chatbot
      </h1>
      <Chatbot />
    </main>
  );
}
