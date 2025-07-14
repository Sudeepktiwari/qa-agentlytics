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
  const isTestEnv = process.env.NEXT_PUBLIC_ENV === "test";
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [proactiveTriggered, setProactiveTriggered] = useState(false);

  // Remove getEffectivePageUrl and getPreviousQuestions from component scope

  useEffect(() => {
    if (isTestEnv) {
      // In test, only run after a link is selected
      if (!proactiveTriggered || !selectedLink) return;
    } else {
      // In prod, only run on mount (or when pageUrl/adminId changes)
      if (proactiveTriggered || selectedLink) return;
    }
    // Fetch chat history on mount or after link selection
    const sessionId = getSessionId();
    const effectivePageUrl =
      isTestEnv && selectedLink ? selectedLink : pageUrl || getPageUrl();
    fetch(
      `/api/chat?sessionId=${sessionId}&pageUrl=${encodeURIComponent(
        effectivePageUrl
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setMessages(data.history);
        // Always trigger proactive bot message and follow-up timer on mount or after link selection
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
  }, [pageUrl, adminId, isTestEnv, proactiveTriggered, selectedLink]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    const effectivePageUrl = pageUrl || getPageUrl();
    const previousQuestions = messages
      .filter((msg) => msg.role === "assistant")
      .map((msg) => msg.content);
    // If last message is from bot, start inactivity timer
    if (lastMsg.role === "assistant") {
      if (followupTimer.current) clearTimeout(followupTimer.current);
      setFollowupSent(false);
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
  }, [messages, followupSent, adminId, pageUrl, followupCount]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const effectivePageUrl = pageUrl || getPageUrl();
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

  // Handler to be called when a link is selected from the dropdown in admin test env
  const handleLinkSelect = (link: string) => {
    setSelectedLink(link);
    setProactiveTriggered(true);
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
