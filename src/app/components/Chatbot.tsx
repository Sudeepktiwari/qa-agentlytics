"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

function getSessionId() {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("chatSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("chatSessionId", sessionId);
  }
  return sessionId;
}

function getPageUrl() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  pageUrl?: string;
  adminId?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ pageUrl, adminId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const followupTimer = useRef<NodeJS.Timeout | null>(null);
  const [followupSent, setFollowupSent] = useState(false);
  const [followupCount, setFollowupCount] = useState(0);

  function getEffectivePageUrl() {
    return pageUrl || getPageUrl();
  }

  // Helper to get all previous assistant messages (bot questions)
  function getPreviousQuestions() {
    return messages
      .filter((msg) => msg.role === "assistant")
      .map((msg) => msg.content);
  }

  useEffect(() => {
    // Fetch chat history on mount
    const sessionId = getSessionId();
    const effectivePageUrl = getEffectivePageUrl();
    fetch(
      `/api/chat?sessionId=${sessionId}&pageUrl=${encodeURIComponent(
        effectivePageUrl
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setMessages(data.history);
        // Always trigger proactive bot message and follow-up timer on mount
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pageUrl: effectivePageUrl,
            proactive: true,
            ...(adminId ? { adminId } : {}),
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.answer)
              setMessages([{ role: "assistant", content: data.answer }]);
            // Start follow-up timer
            if (followupTimer.current) clearTimeout(followupTimer.current);
            setFollowupSent(false);
            console.log("[Chatbot] Setting follow-up timer for 10 seconds");
            followupTimer.current = setTimeout(() => {
              // Only send follow-up if user hasn't responded
              console.log(
                "[Chatbot] Follow-up timer triggered, setting followupSent to true"
              );
              setFollowupSent(true);
            }, 10000); // 10 seconds
          });
      });
    // Cleanup timer on unmount
    return () => {
      if (followupTimer.current) {
        console.log("[Chatbot] Clearing follow-up timer on unmount");
        clearTimeout(followupTimer.current);
      }
    };
  }, [pageUrl, adminId, getEffectivePageUrl]);

  // Watch for user response or followup trigger
  useEffect(() => {
    // Only run if there is at least one message
    if (messages.length === 0) return;
    // Find the last message
    const lastMsg = messages[messages.length - 1];
    // If last message is from bot, start inactivity timer
    if (lastMsg.role === "assistant") {
      if (followupTimer.current) clearTimeout(followupTimer.current);
      setFollowupSent(false);
      // Only set timer if followupCount < 3
      if (followupCount < 3) {
        console.log(
          "[Chatbot] Setting inactivity follow-up timer for 10 seconds after bot message"
        );
        followupTimer.current = setTimeout(() => {
          console.log(
            "[Chatbot] Inactivity timer triggered, setting followupSent to true"
          );
          setFollowupSent(true);
        }, 10000);
      }
    } else if (lastMsg.role === "user") {
      // If user replied, clear timer and reset followupCount
      if (followupTimer.current) {
        console.log(
          "[Chatbot] User responded, clearing inactivity follow-up timer"
        );
        clearTimeout(followupTimer.current);
        followupTimer.current = null;
      }
      setFollowupSent(false);
      setFollowupCount(0);
    }
    // Send follow-up if triggered and last message is from bot, and limit to 3
    if (followupSent && lastMsg.role === "assistant" && followupCount < 3) {
      console.log("[Chatbot] Sending follow-up request to backend");
      const sessionId = getSessionId();
      const effectivePageUrl = getEffectivePageUrl();
      const previousQuestions = getPreviousQuestions();
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          pageUrl: effectivePageUrl,
          followup: true,
          previousQuestions,
          ...(adminId ? { adminId } : {}),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.answer)
            setMessages((msgs) => [
              ...msgs,
              { role: "assistant", content: data.answer },
            ]);
          setFollowupCount((c) => c + 1);
        });
    }
    // Cleanup on unmount
    return () => {
      if (followupTimer.current) {
        console.log("[Chatbot] Clearing inactivity follow-up timer on unmount");
        clearTimeout(followupTimer.current);
      }
    };
  }, [
    messages,
    followupSent,
    adminId,
    pageUrl,
    followupCount,
    getEffectivePageUrl,
    getPreviousQuestions,
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const effectivePageUrl = getEffectivePageUrl();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg.content,
          sessionId,
          pageUrl: effectivePageUrl,
          ...(adminId ? { adminId } : {}),
        }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.answer || "Error: No answer" },
      ]);
      // Clear follow-up timer on user message
      if (followupTimer.current) clearTimeout(followupTimer.current);
      setFollowupSent(false);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Error: Could not get answer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
      <h3>Chatbot</h3>
      <div style={{ minHeight: 120, marginBottom: 12 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              margin: "8px 0",
              color: msg.role === "user" ? "#333" : "#0070f3",
            }}
          >
            <b>{msg.role === "user" ? "You" : "Bot"}:</b>{" "}
            {msg.role === "assistant" ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
        {loading && <div>Bot is typing...</div>}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents..."
        style={{ width: "80%", marginRight: 8 }}
        disabled={loading}
      />
      <button onClick={sendMessage} disabled={loading || !input.trim()}>
        Send
      </button>
    </div>
  );
};

export default Chatbot;
