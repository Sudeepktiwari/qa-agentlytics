"use client";
import Chatbot from "./components/Chatbot";

export default function HomePage() {
  return (
    <main
      style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 32 }}>
        Document Chatbot
      </h1>
      <Chatbot />
    </main>
  );
}
