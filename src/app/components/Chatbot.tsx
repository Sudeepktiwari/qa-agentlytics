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
  buttons?: string[];
  emailPrompt?: string;
}

// Type for backend bot response
interface BotResponse {
  mainText: string;
  buttons?: string[];
  emailPrompt?: string;
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
  // const [selectedLink, setSelectedLink] = useState<string | null>(null);
  // const [proactiveTriggered, setProactiveTriggered] = useState(false);
  const [emailInputValue, setEmailInputValue] = useState("");

  // Remove getEffectivePageUrl and getPreviousQuestions from component scope

  useEffect(() => {
    if (isTestEnv) {
      // In test, only run after a link is selected
      // if (!proactiveTriggered || !selectedLink) return;
    } else {
      // In prod, only run on mount (or when pageUrl/adminId changes)
      // if (proactiveTriggered || selectedLink) return;
    }
    // Fetch chat history on mount or after link selection
    const sessionId = getSessionId();
    const effectivePageUrl = isTestEnv /* && selectedLink */
      ? /* selectedLink */ "/"
      : pageUrl || getPageUrl();
    fetch(
      `/api/chat?sessionId=${sessionId}&pageUrl=${encodeURIComponent(
        effectivePageUrl
      )}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.history) {
          setMessages(
            data.history.map((msg: Message) => {
              if (msg.role === "assistant") {
                try {
                  const parsed =
                    typeof msg.content === "string"
                      ? JSON.parse(msg.content)
                      : msg.content;
                  return {
                    ...msg,
                    content: parsed.mainText || "",
                    buttons: parsed.buttons || [],
                    emailPrompt: parsed.emailPrompt || "",
                  };
                } catch {
                  return msg;
                }
              }
              return msg;
            })
          );
        }
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
  }, [pageUrl, adminId, isTestEnv /*, proactiveTriggered, selectedLink */]);

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
          if (followupCount < 2) {
            // Only trigger if less than 2, so the next will be the 3rd
            console.log(
              "[Chatbot] Inactivity timer triggered, setting followupSent to true"
            );
            setFollowupSent(true);
          } else {
            // After 3 followups, do not trigger again
            if (followupTimer.current) clearTimeout(followupTimer.current);
            setFollowupSent(false);
          }
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
          // Use parseBotResponse for follow-up responses
          const parsed = parseBotResponse(data);
          setMessages((msgs) => [
            ...msgs,
            {
              role: "assistant",
              content: parsed.mainText,
              buttons: parsed.buttons,
              emailPrompt: parsed.emailPrompt,
            },
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

  // Helper: Parse backend response (now JSON with mainText, buttons, emailPrompt)
  function parseBotResponse(data: BotResponse | string): {
    mainText: string;
    buttons: string[];
    emailPrompt: string;
  } {
    if (!data) return { mainText: "", buttons: [], emailPrompt: "" };
    if (typeof data === "string")
      return { mainText: data, buttons: [], emailPrompt: "" };
    return {
      mainText: data.mainText || "",
      buttons: Array.isArray(data.buttons) ? data.buttons : [],
      emailPrompt: data.emailPrompt || "",
    };
  }

  // Add a simple nudge tracking function
  async function trackNudge(label: string, context?: any) {
    // Log to the console
    console.log(`[Nudge Track] Button clicked: ${label}`, context);
    // Send to backend analytics endpoint
    try {
      await fetch("/api/track-nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      // Ignore analytics errors
    }
  }

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;
    const userMsg: Message = { role: "user", content: userInput };
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
      const parsed = parseBotResponse(data);
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: parsed.mainText,
          buttons: parsed.buttons,
          emailPrompt: parsed.emailPrompt,
        },
      ]);
      // Clear follow-up timer on user message
      if (followupTimer.current) clearTimeout(followupTimer.current);
      setFollowupSent(false);
    } catch {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: "Error: Could not get answer.",
          buttons: [],
          emailPrompt: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) sendMessage(input);
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
              <>
                {/* Highlight nudges that start with '💡 Assistant Tip:' */}
                {typeof msg.content === "string" &&
                msg.content.trim().startsWith("💡 Assistant Tip:") ? (
                  <div
                    style={{
                      background: "#f0f8ff",
                      borderLeft: "4px solid #0070f3",
                      padding: "8px 12px",
                      borderRadius: 4,
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
                {/* Render actionable buttons if present */}
                {Array.isArray(msg.buttons) && msg.buttons.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {msg.buttons.map((action: string) => (
                      <button
                        key={action}
                        onClick={() => {
                          trackNudge(action, {
                            pageUrl,
                            adminId,
                            message: msg,
                          });
                          setInput("");
                          sendMessage(action);
                        }}
                        style={{ margin: "4px", padding: "6px 12px" }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
                {/* Render email prompt/input if present */}
                {msg.emailPrompt && msg.emailPrompt.trim() !== "" && (
                  <div style={{ marginTop: 8 }}>
                    <div>{msg.emailPrompt}</div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (emailInputValue.trim()) {
                          sendMessage(emailInputValue.trim());
                          setEmailInputValue("");
                        }
                      }}
                      style={{ marginTop: 8 }}
                    >
                      <input
                        type="email"
                        value={emailInputValue}
                        onChange={(e) => setEmailInputValue(e.target.value)}
                        placeholder="Enter your email"
                        required
                        style={{ marginRight: 8 }}
                      />
                      <button type="submit">Send My Setup Instructions</button>
                    </form>
                  </div>
                )}
              </>
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
      <button
        onClick={() => sendMessage(input)}
        disabled={loading || !input.trim()}
      >
        Send
      </button>
    </div>
  );
};

export default Chatbot;
