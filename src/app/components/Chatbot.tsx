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
  botMode?: "sales" | "lead_generation";
  userEmail?: string | null;
}

// Type for backend bot response
interface BotResponse {
  mainText: string;
  buttons?: string[];
  emailPrompt?: string;
  botMode?: "sales" | "lead_generation";
  userEmail?: string | null;
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
  // Add state for selected radio button
  const [selectedRadio, setSelectedRadio] = useState<number | null>(null);
  // Track user activity to prevent unnecessary followups
  const [userIsActive, setUserIsActive] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<number>(Date.now());
  // Track current bot mode for display indicator
  const [currentBotMode, setCurrentBotMode] = useState<
    "sales" | "lead_generation"
  >("lead_generation");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Debug logging for bot mode state
  console.log("[Chatbot] Current bot mode state:", {
    currentBotMode,
    currentUserEmail,
    timestamp: new Date().toISOString(),
  });

  // Track bot mode changes
  useEffect(() => {
    console.log("[Chatbot] Bot mode state changed:", {
      currentBotMode,
      currentUserEmail,
      timestamp: new Date().toISOString(),
    });
  }, [currentBotMode, currentUserEmail]);

  // Component mount/unmount logging
  useEffect(() => {
    console.log("[Chatbot] Component mounted with props:", {
      pageUrl,
      adminId,
      timestamp: new Date().toISOString(),
    });

    return () => {
      console.log("[Chatbot] Component unmounting");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    console.log(
      `[Chatbot] URL changed to: ${effectivePageUrl}, resetting followup state`
    );
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

        // Check if we should clear history before showing proactive message (after reset)
        const clearHistoryFirst =
          localStorage.getItem("clearHistoryBeforeProactive") === "true";
        if (clearHistoryFirst) {
          localStorage.removeItem("clearHistoryBeforeProactive");
          console.log(
            "[Chatbot] Clearing chat history before showing proactive message"
          );

          // Clear chat history from backend first
          fetch("/api/chat", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              clearHistory: true,
            }),
          })
            .then(() => {
              console.log(
                "[Chatbot] Chat history cleared, now showing proactive message"
              );
              // Now show the proactive message with clean history
              return fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId,
                  pageUrl: effectivePageUrl,
                  proactive: true,
                  ...(adminId ? { adminId } : {}),
                }),
              });
            })
            .then((res) => res.json())
            .then((data) => {
              // Update bot mode tracking
              if (data.botMode) {
                setCurrentBotMode(data.botMode);
              }
              if (data.userEmail !== undefined) {
                setCurrentUserEmail(data.userEmail);
              }

              if (data.answer)
                setMessages([
                  {
                    role: "assistant",
                    content: data.answer,
                    botMode: data.botMode,
                    userEmail: data.userEmail,
                  },
                ]);
              // Start follow-up timer
              if (followupTimer.current) clearTimeout(followupTimer.current);
              setFollowupSent(false);
              setFollowupCount(0);
              setUserIsActive(false);
              setLastUserAction(Date.now());
              console.log("[Chatbot] Setting follow-up timer for 30 seconds");
              followupTimer.current = setTimeout(() => {
                console.log(
                  "[Chatbot] Follow-up timer triggered, setting followupSent to true"
                );
                setFollowupSent(true);
              }, 30000);
            })
            .catch((error) => {
              console.error(
                "[Chatbot] Error clearing history or showing proactive message:",
                error
              );
            });
          return;
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
            console.log("[Chatbot] Proactive API Response:", {
              botMode: data.botMode,
              userEmail: data.userEmail,
              hasAnswer: !!data.answer,
              timestamp: new Date().toISOString(),
            });

            // Update bot mode tracking
            if (data.botMode) {
              console.log(
                "[Chatbot] Proactive - Updating bot mode from:",
                currentBotMode,
                "to:",
                data.botMode
              );
              setCurrentBotMode(data.botMode);
            } else {
              console.log("[Chatbot] Proactive - No botMode in API response");
            }
            if (data.userEmail !== undefined) {
              console.log(
                "[Chatbot] Proactive - Updating user email from:",
                currentUserEmail,
                "to:",
                data.userEmail
              );
              setCurrentUserEmail(data.userEmail);
            } else {
              console.log("[Chatbot] Proactive - No userEmail in API response");
            }

            if (data.answer)
              setMessages([
                {
                  role: "assistant",
                  content: data.answer,
                  botMode: data.botMode,
                  userEmail: data.userEmail,
                },
              ]);
            // Start follow-up timer
            if (followupTimer.current) clearTimeout(followupTimer.current);
            setFollowupSent(false);
            setFollowupCount(0); // Reset followup count for new URL
            setUserIsActive(false); // Reset user activity
            setLastUserAction(Date.now());
            console.log("[Chatbot] Setting follow-up timer for 30 seconds");
            followupTimer.current = setTimeout(() => {
              // Only send follow-up if user hasn't responded
              console.log(
                "[Chatbot] Follow-up timer triggered, setting followupSent to true"
              );
              setFollowupSent(true);
            }, 30000); // 30 seconds
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
      setUserIsActive(false); // Reset user activity state
      if (followupCount < 3) {
        console.log(
          "[Chatbot] Setting inactivity follow-up timer for 30 seconds after bot message"
        );
        followupTimer.current = setTimeout(() => {
          // Only send followup if user is not currently active and hasn't interacted recently
          const timeSinceLastAction = Date.now() - lastUserAction;
          if (!userIsActive && timeSinceLastAction >= 25000) {
            // 25 seconds buffer
            console.log(
              "[Chatbot] Inactivity timer triggered, setting followupSent to true"
            );
            setFollowupSent(true);
          } else {
            console.log(
              "[Chatbot] Skipping followup - user was active recently or currently typing"
            );
          }
        }, 30000); // 30 seconds
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
      setUserIsActive(false); // Reset after user sends message
      setLastUserAction(Date.now());
    }
    // Send follow-up if triggered and last message is from bot, and limit to 3
    if (followupSent && lastMsg.role === "assistant" && followupCount < 3) {
      // Additional check: don't send if user has been active recently
      const timeSinceLastAction = Date.now() - lastUserAction;
      if (userIsActive || timeSinceLastAction < 25000) {
        console.log("[Chatbot] Skipping followup - user was active recently");
        setFollowupSent(false);
        return;
      }

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
          followupCount, // <-- added so backend knows which follow-up to send
          ...(adminId ? { adminId } : {}),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          // Update bot mode tracking
          if (data.botMode) {
            setCurrentBotMode(data.botMode);
          }
          if (data.userEmail !== undefined) {
            setCurrentUserEmail(data.userEmail);
          }

          // Use parseBotResponse for follow-up responses
          const parsed = parseBotResponse(data);
          setMessages((msgs) => [
            ...msgs,
            {
              role: "assistant",
              content: parsed.mainText,
              buttons: parsed.buttons,
              emailPrompt: parsed.emailPrompt,
              botMode: data.botMode,
              userEmail: data.userEmail,
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
  }, [
    messages,
    followupSent,
    adminId,
    pageUrl,
    followupCount,
    userIsActive,
    lastUserAction,
  ]);

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
  async function trackNudge(label: string, context?: unknown) {
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
    } catch {
      // Ignore analytics errors
    }
  }

  const sendMessage = async (userInput: string) => {
    if (!userInput.trim()) return;

    // Clear followup timer and reset activity state when user sends message
    if (followupTimer.current) {
      console.log("[Chatbot] User sending message, clearing followup timer");
      clearTimeout(followupTimer.current);
      followupTimer.current = null;
    }
    setFollowupSent(false);
    setUserIsActive(false);
    setLastUserAction(Date.now());

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

      console.log("[Chatbot] API Response received:", {
        botMode: data.botMode,
        userEmail: data.userEmail,
        hasAnswer: !!data.answer,
        timestamp: new Date().toISOString(),
      });

      // Update bot mode tracking
      if (data.botMode) {
        console.log(
          "[Chatbot] Updating bot mode from:",
          currentBotMode,
          "to:",
          data.botMode
        );
        setCurrentBotMode(data.botMode);
      } else {
        console.log("[Chatbot] No botMode in API response");
      }
      if (data.userEmail !== undefined) {
        console.log(
          "[Chatbot] Updating user email from:",
          currentUserEmail,
          "to:",
          data.userEmail
        );
        setCurrentUserEmail(data.userEmail);
      } else {
        console.log("[Chatbot] No userEmail in API response");
      }

      const parsed = parseBotResponse(data);
      setMessages((msgs) => [
        ...msgs,
        {
          role: "assistant",
          content: parsed.mainText,
          buttons: parsed.buttons,
          emailPrompt: parsed.emailPrompt,
          botMode: data.botMode,
          userEmail: data.userEmail,
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

  // Handle input changes to detect when user is typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // Mark user as active when they start typing
    if (e.target.value.length > 0 && !userIsActive) {
      console.log("[Chatbot] User started typing, marking as active");
      setUserIsActive(true);
      setLastUserAction(Date.now());

      // Reset followup timer when user starts typing
      if (followupTimer.current) {
        console.log("[Chatbot] User typing, resetting followup timer");
        clearTimeout(followupTimer.current);
        setFollowupSent(false);

        // Start a new timer if there's a bot message to follow up on
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && followupCount < 3) {
          followupTimer.current = setTimeout(() => {
            const timeSinceLastAction = Date.now() - lastUserAction;
            if (!userIsActive && timeSinceLastAction >= 25000) {
              setFollowupSent(true);
            }
          }, 30000);
        }
      }
    } else if (e.target.value.length === 0 && userIsActive) {
      // User cleared the input, mark as less active but don't reset timer
      setUserIsActive(false);
    }
  };

  const resetUser = () => {
    // Clear all chatbot-related localStorage items
    localStorage.removeItem("chatSessionId");
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("userActivity");
    localStorage.removeItem("lastUserAction");

    // Set a flag to clear history before showing proactive message
    localStorage.setItem("clearHistoryBeforeProactive", "true");

    // Reset component state
    setMessages([]);
    setInput("");
    setEmailInputValue("");
    setFollowupSent(false);
    setFollowupCount(0);
    setUserIsActive(false);
    setLastUserAction(Date.now());

    // Clear any existing timer
    if (followupTimer.current) {
      clearTimeout(followupTimer.current);
      followupTimer.current = null;
    }

    // Force re-initialization by triggering a new session
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h3 style={{ color: "#000000", margin: 0 }}>Chatbot</h3>
        <div
          style={{
            padding: "4px 8px",
            borderRadius: 12,
            fontSize: "12px",
            fontWeight: "bold",
            backgroundColor: currentBotMode === "sales" ? "#e3f2fd" : "#f3e5f5",
            color: currentBotMode === "sales" ? "#1976d2" : "#7b1fa2",
            border: `1px solid ${
              currentBotMode === "sales" ? "#bbdefb" : "#e1bee7"
            }`,
          }}
          onMouseEnter={() => {
            console.log("[Chatbot] Indicator hover - Current state:", {
              currentBotMode,
              currentUserEmail,
              indicatorText:
                currentBotMode === "sales" ? "SALES MODE" : "LEAD MODE",
            });
          }}
        >
          {(() => {
            const indicatorText =
              currentBotMode === "sales" ? "SALES MODE" : "LEAD MODE";
            console.log("[Chatbot] Rendering indicator:", {
              currentBotMode,
              currentUserEmail,
              indicatorText,
              backgroundColor:
                currentBotMode === "sales" ? "#e3f2fd" : "#f3e5f5",
              timestamp: new Date().toISOString(),
            });
            return indicatorText;
          })()}
          {currentUserEmail && (
            <span style={{ marginLeft: 4, opacity: 0.7 }}>
              • {currentUserEmail}
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          minHeight: 120,
          marginBottom: 12,
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              margin: "8px 0",
              color: msg.role === "user" ? "#000000" : "#000000",
            }}
          >
            <b style={{ color: "#000000" }}>
              {msg.role === "user" ? "You" : "Bot"}:
            </b>{" "}
            {msg.role === "assistant" ? (
              <>
                <div style={{ color: "#000000" }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {/* Render action buttons if present and no email prompt */}
                {msg.buttons &&
                  msg.buttons.length > 0 &&
                  (!msg.emailPrompt || msg.emailPrompt.trim() === "") && (
                    <div style={{ marginTop: 8 }}>
                      <form>
                        {msg.buttons.map((action, idx) => (
                          <div
                            key={idx}
                            style={{
                              marginBottom: 4,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <input
                              type="radio"
                              id={`action-${i}-${idx}`}
                              name={`actions-${i}`}
                              value={idx}
                              checked={selectedRadio === idx}
                              onChange={() => {
                                console.log(
                                  "[Chatbot] Button clicked, resetting followup timer"
                                );
                                setSelectedRadio(idx);
                                // Reset followup timer when button is clicked
                                if (followupTimer.current) {
                                  clearTimeout(followupTimer.current);
                                  followupTimer.current = null;
                                }
                                setFollowupSent(false);
                                setUserIsActive(false);
                                setLastUserAction(Date.now());

                                trackNudge(action, {
                                  pageUrl,
                                  adminId,
                                  message: msg,
                                });
                                setInput("");
                                sendMessage(action);
                                setSelectedRadio(null);
                              }}
                              style={{ marginRight: 8, cursor: "pointer" }}
                            />
                            <label
                              htmlFor={`action-${i}-${idx}`}
                              style={{ cursor: "pointer", color: "#000000" }}
                            >
                              {action}
                            </label>
                          </div>
                        ))}
                      </form>
                    </div>
                  )}
                {/* Render email prompt/input if present (prioritize email over buttons) */}
                {msg.emailPrompt && msg.emailPrompt.trim() !== "" && (
                  <div style={{ marginTop: 8, color: "#000000" }}>
                    <div>{msg.emailPrompt}</div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (emailInputValue.trim()) {
                          console.log(
                            "[Chatbot] Email submitted, resetting followup timer"
                          );
                          // Reset followup timer when email is submitted
                          if (followupTimer.current) {
                            clearTimeout(followupTimer.current);
                            followupTimer.current = null;
                          }
                          setFollowupSent(false);
                          setUserIsActive(false);
                          setLastUserAction(Date.now());

                          sendMessage(emailInputValue.trim());
                          setEmailInputValue("");
                        }
                      }}
                      style={{ marginTop: 8 }}
                    >
                      <input
                        type="email"
                        value={emailInputValue}
                        onChange={(e) => {
                          setEmailInputValue(e.target.value);
                          // Mark user as active when typing email
                          if (e.target.value.length > 0 && !userIsActive) {
                            setUserIsActive(true);
                            setLastUserAction(Date.now());
                          }
                        }}
                        placeholder="Enter your email"
                        required
                        style={{
                          marginRight: 8,
                          backgroundColor: "#ffffff",
                          color: "#000000",
                          border: "1px solid #ccc",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#0070f3",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        {msg.emailPrompt.toLowerCase().includes("support")
                          ? "Contact Support"
                          : msg.emailPrompt.toLowerCase().includes("setup")
                          ? "Send Setup Guide"
                          : msg.emailPrompt.toLowerCase().includes("demo")
                          ? "Get Demo"
                          : "Submit"}
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: "#000000" }}>{msg.content}</span>
            )}
          </div>
        ))}
        {loading && <div style={{ color: "#000000" }}>Bot is typing...</div>}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents..."
        style={{
          width: "65%",
          marginRight: 8,
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "1px solid #ccc",
          padding: "8px",
        }}
        disabled={loading}
      />
      <button
        onClick={() => sendMessage(input)}
        disabled={loading || !input.trim()}
        style={{
          backgroundColor: "#0070f3",
          color: "#ffffff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          opacity: loading || !input.trim() ? 0.6 : 1,
          marginRight: "8px",
        }}
      >
        Send
      </button>
      <button
        onClick={resetUser}
        style={{
          backgroundColor: "#dc3545",
          color: "#ffffff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
        }}
        title="Reset user session and start as a new user"
      >
        🔄 Reset User
      </button>
    </div>
  );
};

export default Chatbot;
