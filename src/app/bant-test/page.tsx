"use client";

import React from "react";
import Chatbot from "../components/Chatbot";

export default function BantTestPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold">BANT Chain Test</h1>
        <p className="mt-2 text-slate-700">
          Seeded BANT prompts below should each show a textbox beneath them.
        </p>
        <div className="mt-6">
          <Chatbot
            disableProactive
            seedAssistantMessages={[
              "What's your approximate budget per month?",
              "Are you the decision maker for this purchase?",
              "What specific features or needs are most important?",
              "What's your expected timeline to get started?",
              "Budget range per month",
            ]}
            prefillQuestions={[
              "I'm exploring pricing options",
              "We are SMB and need lead qualification",
              "Can you help with budget and timeline?",
              "What's the best plan for under $500/mo?",
              "Decision maker is me; timeline is this month",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

