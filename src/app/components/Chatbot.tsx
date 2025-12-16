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
  clarifierShown?: boolean;
  missingDims?: string[];
  domain?: string;
  domainMatch?: boolean;
  confidence?: number;
  suggestedActions?: { id: string; label: string; prereqSlots: string[] }[];
  isSummary?: boolean;
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
  prefillQuestions?: string[];
  disableProactive?: boolean;
  seedAssistantMessages?: string[];
}

const Chatbot: React.FC<ChatbotProps> = ({
  pageUrl,
  adminId,
  prefillQuestions = [],
  disableProactive,
  seedAssistantMessages = [],
}) => {
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
  const [othersInputValue, setOthersInputValue] = useState("");

  // Helper function to clean malformed JSON strings
  const cleanJsonString = (jsonStr: string): string => {
    try {
      // Remove extra comma-separated strings that break JSON syntax
      const cleaned = jsonStr
        // Remove lines with just quoted strings like "\n\n",
        .replace(/,?\s*"[^"]*",?\s*(?=\s*["}])/g, "")
        // Remove trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, "$1")
        // Remove multiple commas
        .replace(/,+/g, ",")
        // Remove comma at start after opening brace
        .replace(/({|\[)\s*,/g, "$1")
        // Clean up whitespace
        .trim();

      // Validate by trying to parse
      JSON.parse(cleaned);
      return cleaned;
    } catch {
      // If still invalid, return original
      return jsonStr;
    }
  };

  const sanitizeButtonLabel = (s: any): string => {
    let raw: any = s;
    if (raw && typeof raw === "object") {
      // Prefer common label-like fields
      raw =
        raw.label ??
        raw.text ??
        raw.title ??
        raw.name ??
        raw.value ??
        // Handle nested label objects
        (typeof raw.label === "object" ? raw.label?.text ?? "" : "");
    }
    return String(raw ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeMainText = (text: string): string => {
    let t = String(text || "");
    t = t.replace(/\\n\\n/g, "\n\n").replace(/\\n/g, "\n");
    t = t.replace(/\\'/g, "'");
    t = t.replace(/\\([!?:;.,(){}\\[\\]])/g, "$1");
    t = t
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");
    t = t.replace(/\s+/g, " ").trim();
    return t;
  };

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

  // Lead Generation Strategy: Keep followup timer running even when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(
          "[LeadGen] Page hidden - preserving followup timer for continued engagement"
        );
        // DO NOT clear the followup timer when page becomes hidden
        // This allows us to continue engaging users even when they switch tabs
      } else {
        console.log(
          "[LeadGen] Page visible - user returned, updating engagement strategy"
        );
        // Update last user action time when they return to the page
        setLastUserAction(Date.now());

        // Lead Generation Strategy: If user returns and there's an active timer,
        // slightly accelerate it to re-engage them faster
        if (followupTimer.current && !followupSent) {
          console.log(
            "[LeadGen] User returned to page - accelerating followup timer"
          );
          clearTimeout(followupTimer.current);

          // Shorter timer since they just returned (shows renewed interest)
          const acceleratedDelay = currentBotMode === "sales" ? 5000 : 8000; // 5s for sales, 8s for lead gen

          followupTimer.current = setTimeout(() => {
            const timeSinceLastAction = Date.now() - lastUserAction;
            const bufferTime = 3000; // Shorter buffer for returning users

            if (!userIsActive && timeSinceLastAction >= bufferTime) {
              console.log(
                "[LeadGen] Accelerated followup triggered after user return"
              );
              setFollowupSent(true);
            }
          }, acceleratedDelay);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [followupSent, currentBotMode, userIsActive, lastUserAction]);

  // Remove getEffectivePageUrl and getPreviousQuestions from component scope

  useEffect(() => {
    if (disableProactive) {
      const seeds = Array.isArray(seedAssistantMessages)
        ? seedAssistantMessages
        : [];
      if (seeds.length > 0) {
        setMessages(
          seeds.map((text) => ({
            role: "assistant" as const,
            content: text,
            buttons: [],
            emailPrompt: "",
          }))
        );
      }
      return;
    }
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
          const mapped = data.history.map((msg: Message) => {
            if (msg.role === "assistant") {
              try {
                const cleanedContent =
                  typeof msg.content === "string"
                    ? cleanJsonString(msg.content)
                    : msg.content;
                const parsed =
                  typeof cleanedContent === "string"
                    ? JSON.parse(cleanedContent)
                    : cleanedContent;
                return {
                  ...msg,
                  content: parsed.mainText || "",
                  buttons: Array.isArray(parsed.buttons)
                    ? parsed.buttons.map(sanitizeButtonLabel).filter(Boolean)
                    : [],
                  emailPrompt: parsed.emailPrompt || "",
                };
              } catch {
                return msg;
              }
            }
            return msg;
          });
          const summaryText =
            typeof (data as any).pageSummary === "string"
              ? String((data as any).pageSummary).trim()
              : "";
          if (summaryText) {
            const summaryMsg: Message = {
              role: "assistant",
              content: normalizeMainText(summaryText),
              buttons: [],
              emailPrompt: "",
              isSummary: true,
            };
            setMessages([summaryMsg, ...mapped]);
          } else {
            setMessages(mapped);
          }
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
                    content:
                      typeof data.answer === "string"
                        ? normalizeMainText(data.answer)
                        : data.answer,
                    buttons: Array.isArray(data.buttons)
                      ? data.buttons.map(sanitizeButtonLabel).filter(Boolean)
                      : [],
                    emailPrompt: "",
                    botMode: data.botMode,
                    userEmail: data.userEmail,
                    domain: data.domain,
                    domainMatch: data.domainMatch,
                    confidence:
                      typeof data.confidence === "number"
                        ? data.confidence
                        : undefined,
                    suggestedActions: Array.isArray(data.suggestedActions)
                      ? data.suggestedActions
                      : undefined,
                  },
                ]);
              if (data.secondary) {
                const secParsed = parseBotResponse(data.secondary);
                const secMsg = {
                  role: "assistant" as const,
                  content: secParsed.mainText,
                  buttons: secParsed.buttons,
                  emailPrompt: secParsed.emailPrompt,
                  botMode: data.botMode,
                  userEmail: data.userEmail,
                  domain: (data.secondary as any)?.domain,
                  domainMatch: (data.secondary as any)?.domainMatch,
                  confidence:
                    typeof (data.secondary as any)?.confidence === "number"
                      ? (data.secondary as any)?.confidence
                      : undefined,
                  suggestedActions: Array.isArray(
                    (data.secondary as any)?.suggestedActions
                  )
                    ? (data.secondary as any)?.suggestedActions
                    : undefined,
                };
                console.log("[Followup] Received", {
                  type: (data.secondary as any)?.type || "unknown",
                  preview:
                    typeof (data.secondary as any)?.mainText === "string"
                      ? (data.secondary as any)?.mainText.slice(0, 100)
                      : "",
                  buttonsCount: Array.isArray(secParsed.buttons)
                    ? secParsed.buttons.length
                    : 0,
                });
                setMessages((msgs) => [...msgs, secMsg]);
                console.log("[Followup] Appended to chat");
              }
              // Start follow-up timer
              if (followupTimer.current) clearTimeout(followupTimer.current);
              setFollowupSent(false);
              setFollowupCount(0);
              setUserIsActive(false);
              setLastUserAction(Date.now());
              followupTimer.current = setTimeout(() => {
                setFollowupSent(true);
              }, 120000); // 120 seconds (2 minutes)
            })
            .catch((error) => {
              console.error("[Chatbot] Proactive error", error);
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
                  content:
                    typeof data.answer === "string"
                      ? normalizeMainText(data.answer)
                      : data.answer,
                  buttons: Array.isArray(data.buttons)
                    ? data.buttons.map(sanitizeButtonLabel).filter(Boolean)
                    : [],
                  emailPrompt: "",
                  botMode: data.botMode,
                  userEmail: data.userEmail,
                },
              ]);
            if (data.secondary) {
              const secParsed = parseBotResponse(data.secondary);
              const secMsg = {
                role: "assistant" as const,
                content: secParsed.mainText,
                buttons: secParsed.buttons,
                emailPrompt: secParsed.emailPrompt,
                botMode: data.botMode,
                userEmail: data.userEmail,
              };
              console.log("[Followup] Received", {
                type: (data.secondary as any)?.type || "unknown",
                preview:
                  typeof (data.secondary as any)?.mainText === "string"
                    ? (data.secondary as any)?.mainText.slice(0, 100)
                    : "",
                buttonsCount: Array.isArray(secParsed.buttons)
                  ? secParsed.buttons.length
                  : 0,
              });
              setMessages((msgs) => [...msgs, secMsg]);
              console.log("[Followup] Appended to chat");
            }
            // Start follow-up timer
            if (followupTimer.current) clearTimeout(followupTimer.current);
            setFollowupSent(false);
            setFollowupCount(0); // Reset followup count for new URL
            setUserIsActive(false); // Reset user activity
            setLastUserAction(Date.now());
            followupTimer.current = setTimeout(() => {
              setFollowupSent(true);
            }, 120000); // 120 seconds (2 minutes)
          });
      });
    // Cleanup timer on unmount
    return () => {
      if (followupTimer.current) {
        console.log("[Chatbot] Clearing follow-up timer on unmount");
        clearTimeout(followupTimer.current);
      }
    };
  }, [
    pageUrl,
    adminId,
    isTestEnv,
    disableProactive,
    seedAssistantMessages /*, proactiveTriggered, selectedLink */,
  ]);

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
        // Dynamic timer based on SDR behavior and bot mode
        let timerDelay = 30000; // Default 30 seconds

        if (currentBotMode === "sales" && currentUserEmail) {
          // SDR mode: More aggressive timing for qualified leads
          timerDelay = followupCount === 0 ? 8000 : 15000; // 8s first, then 15s
        } else {
          // Lead generation mode: Still responsive but less aggressive
          timerDelay = followupCount === 0 ? 12000 : 25000; // 12s first, then 25s
        }

        console.log(
          `[Chatbot] Setting inactivity follow-up timer for ${
            timerDelay / 1000
          } seconds after bot message (mode: ${currentBotMode}, followup: ${followupCount})`
        );
        followupTimer.current = setTimeout(() => {
          // Only send followup if user is not currently active and hasn't interacted recently
          const timeSinceLastAction = Date.now() - lastUserAction;
          const bufferTime = currentBotMode === "sales" ? 5000 : 10000; // Shorter buffer for sales mode

          if (!userIsActive && timeSinceLastAction >= bufferTime) {
            console.log(
              `[Chatbot] Inactivity timer triggered (${
                timerDelay / 1000
              }s), setting followupSent to true`
            );
            setFollowupSent(true);
          } else {
            console.log(
              "[Chatbot] Skipping followup - user was active recently or currently typing"
            );
          }
        }, timerDelay);
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
          followupCount, // <-- backend uses follow-up stage
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
              isFollowup: true,
              clarifierShown: !!data.clarifierShown,
              missingDims: Array.isArray(data.missingDims)
                ? (data.missingDims as string[])
                : undefined,
              domain: data.domain,
              domainMatch: data.domainMatch,
              confidence:
                typeof data.confidence === "number"
                  ? data.confidence
                  : undefined,
              suggestedActions: Array.isArray(data.suggestedActions)
                ? data.suggestedActions
                : undefined,
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
  function parseBotResponse(data: any): {
    mainText: string;
    buttons: string[];
    emailPrompt: string;
  } {
    console.log("🔬 [PARSE] Starting parseBotResponse with:", {
      dataType: typeof data,
      dataValue: data,
      isString: typeof data === "string",
      isObject: typeof data === "object" && data !== null,
      isNull: data === null,
      isUndefined: data === undefined,
    });

    if (!data) {
      console.log("❌ [PARSE] No data provided, returning empty response");
      return { mainText: "", buttons: [], emailPrompt: "" };
    }

    // If data is a string, try to parse as JSON, else treat as plain text
    if (typeof data === "string") {
      console.log("📄 [PARSE] Processing string data:", {
        stringLength: data.length,
        stringPreview:
          data.substring(0, 200) + (data.length > 200 ? "..." : ""),
        looksLikeJSON: data.trim().startsWith("{") && data.trim().endsWith("}"),
        containsButtons: data.includes('"buttons"'),
        containsEmailPrompt: data.includes('"emailPrompt"'),
      });

      try {
        const cleanedData = cleanJsonString(data);
        console.log("🧹 [PARSE] Cleaned JSON string:", {
          originalLength: data.length,
          cleanedLength: cleanedData.length,
          cleanedPreview:
            cleanedData.substring(0, 200) +
            (cleanedData.length > 200 ? "..." : ""),
          changes: data !== cleanedData,
        });

        const parsed = JSON.parse(cleanedData);
        if (
          typeof parsed === "object" &&
          (parsed.mainText || parsed.buttons || parsed.emailPrompt)
        ) {
          console.log("✅ [PARSE] Successfully parsed JSON from string:", {
            hasMainText: !!parsed.mainText,
            mainTextLength: parsed.mainText ? parsed.mainText.length : 0,
            hasButtons: !!(parsed.buttons && Array.isArray(parsed.buttons)),
            buttonsCount: Array.isArray(parsed.buttons)
              ? parsed.buttons.length
              : 0,
            buttons: parsed.buttons,
            hasEmailPrompt: !!parsed.emailPrompt,
            emailPrompt: parsed.emailPrompt,
            fullParsed: parsed,
          });

          return {
            mainText: normalizeMainText(
              parsed.mainText || "Here are some options for you:"
            ),
            buttons: Array.isArray(parsed.buttons)
              ? parsed.buttons.map(sanitizeButtonLabel).filter(Boolean)
              : [],
            emailPrompt: parsed.emailPrompt || "",
          };
        } else {
          console.log("⚠️ [PARSE] Parsed JSON but missing expected fields:", {
            parsedType: typeof parsed,
            parsedKeys: Object.keys(parsed || {}),
            parsed: parsed,
          });
        }
      } catch (parseError) {
        // Not JSON, treat as plain text
        console.log("❌ [PARSE] JSON parsing failed, treating as plain text:", {
          error:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
          stringLength: data.length,
          stringStart: data.substring(0, 100),
        });
      }
      // Look for JSON blocks in the text - improved regex for multi-line JSON with arrays
      const jsonMatch = data.match(/\{[\s\S]*?"buttons"[\s\S]*?\}/);
      if (jsonMatch) {
        console.log("🔍 [PARSE] Found potential JSON block:", {
          matchedText: jsonMatch[0],
          matchLength: jsonMatch[0].length,
          originalDataLength: data.length,
        });

        try {
          const jsonPart = cleanJsonString(jsonMatch[0]);
          console.log("🧹 [PARSE] Cleaned JSON part:", jsonPart);

          const parsed = JSON.parse(jsonPart);
          console.log("✅ [PARSE] Successfully parsed JSON block from text:", {
            originalJsonMatch: jsonMatch[0],
            cleanedJson: jsonPart,
            parsedResult: parsed,
            hasButtons: !!(parsed.buttons && Array.isArray(parsed.buttons)),
            buttonCount: Array.isArray(parsed.buttons)
              ? parsed.buttons.length
              : 0,
          });

          // Extract the main text (everything before the JSON block)
          let mainText = data.replace(jsonMatch[0], "").trim();

          console.log("📝 [PARSE] Extracted main text before cleaning:", {
            mainTextLength: mainText.length,
            mainTextPreview: mainText.substring(0, 200),
            removedJsonLength: jsonMatch[0].length,
          });

          // Clean up the main text - remove any remaining JSON artifacts
          mainText = mainText.replace(/\{[\s\S]*?\}/g, "");
          mainText = mainText.replace(/"buttons":\s*\[[\s\S]*?\]/g, "");
          mainText = mainText.replace(/"emailPrompt":\s*"[^"]*"/g, "");
          mainText = mainText.replace(
            /#{1,3}\s*Action\s+Buttons?\s*:?\s*[\r\n]*/gi,
            ""
          );
          mainText = mainText.replace(/^[\s]*[-•*]\s*[^:\n]+[\r\n]*/gm, "");
          mainText = mainText.replace(/\\n\\n/g, "\n\n");
          mainText = mainText.replace(/\\n/g, "\n");

          console.log("🎉 [PARSE] Final result from JSON block extraction:", {
            finalMainText: mainText.trim(),
            finalMainTextLength: mainText.trim().length,
            finalButtons: Array.isArray(parsed.buttons)
              ? parsed.buttons.map(sanitizeButtonLabel).filter(Boolean)
              : [],
            finalButtonCount: Array.isArray(parsed.buttons)
              ? parsed.buttons.length
              : 0,
            finalEmailPrompt: parsed.emailPrompt || "",
            hasAllComponents: !!(
              mainText.trim() &&
              Array.isArray(parsed.buttons) &&
              parsed.buttons.length > 0
            ),
          });

          return {
            mainText: normalizeMainText(mainText.trim()),
            buttons: Array.isArray(parsed.buttons)
              ? parsed.buttons.map(sanitizeButtonLabel).filter(Boolean)
              : [],
            emailPrompt: parsed.emailPrompt || "",
          };
        } catch (e) {
          console.log("❌ [PARSE] Failed to parse JSON block:", {
            error: e instanceof Error ? e.message : String(e),
            jsonMatchedText: jsonMatch[0],
            dataLength: data.length,
          });
        }
      }

      // Look for buttons array in text format like: Buttons: ["item1", "item2"]
      const buttonsMatch = data.match(/Buttons:\s*\[([\s\S]*?)\]/);
      let extractedButtons: string[] = [];
      if (buttonsMatch) {
        try {
          const buttonsArrayStr = `[${buttonsMatch[1]}]`;
          const cleanedButtonsStr = cleanJsonString(buttonsArrayStr);
          const buttonsArray = JSON.parse(cleanedButtonsStr);
          if (Array.isArray(buttonsArray)) {
            extractedButtons = buttonsArray
              .map(sanitizeButtonLabel)
              .filter(Boolean);
            console.log(
              "[Chatbot] Extracted buttons from text format:",
              extractedButtons
            );
          }
        } catch (e) {
          console.log("[Chatbot] Failed to parse buttons from text:", e);
        }
      }

      // Look for email prompt in text format like: Email Prompt: "message"
      const emailMatch = data.match(/Email Prompt:\s*"([^"]+)"/);
      let extractedEmailPrompt = "";
      if (emailMatch) {
        extractedEmailPrompt = emailMatch[1];
        console.log(
          "[Chatbot] Extracted email prompt from text:",
          extractedEmailPrompt
        );
      }

      // Remove any JSON-like instructions from plain text
      // Remove JSON-like blocks and instructions (no 's' flag for compatibility)
      let cleaned = data.replace(/\{[^}]*\}/g, "");
      cleaned = cleaned.replace(/"buttons":\s*\[[^\]]*\]/g, "");
      cleaned = cleaned.replace(/"emailPrompt":\s*"[^"]*"/g, "");
      cleaned = cleaned.replace(/"mainText":\s*"[^"]*"/g, "");
      cleaned = cleaned.replace(/Buttons:\s*\[[\s\S]*?\]/g, "");
      cleaned = cleaned.replace(/Email Prompt:\s*"[^"]*"/g, "");

      // Remove any accidental button sections that might appear in text
      cleaned = cleaned.replace(
        /#{1,3}\s*Action\s+Buttons?\s*:?\s*[\r\n]*/gi,
        ""
      );
      cleaned = cleaned.replace(/^[\s]*[-•*]\s*[^:\n]+[\r\n]*/gm, ""); // Remove bullet points that look like buttons

      // Fix literal \n\n strings that should be actual line breaks
      cleaned = cleaned.replace(/\\n\\n/g, "\n\n");
      cleaned = cleaned.replace(/\\n/g, "\n");

      console.log("[Chatbot] Cleaned string content:", cleaned.trim());
      return {
        mainText: normalizeMainText(cleaned.trim()),
        buttons: extractedButtons.map(sanitizeButtonLabel).filter(Boolean),
        emailPrompt: extractedEmailPrompt,
      };
    }

    // If data is an object, extract fields safely
    console.log("🗂️ [PARSE] Processing object response:", {
      dataType: typeof data,
      dataKeys: Object.keys(data || {}),
      hasMainText: "mainText" in data,
      mainTextType: typeof data.mainText,
      mainTextValue: data.mainText,
      hasButtons: "buttons" in data,
      buttonsType: typeof data.buttons,
      buttonsIsArray: Array.isArray(data.buttons),
      buttonsLength: Array.isArray(data.buttons) ? data.buttons.length : "N/A",
      buttonsValue: data.buttons,
      hasEmailPrompt: "emailPrompt" in data,
      emailPromptType: typeof data.emailPrompt,
      emailPromptValue: data.emailPrompt,
      fullObject: data,
    });

    let mainText = typeof data.mainText === "string" ? data.mainText : "";

    console.log("📝 [PARSE] Initial mainText extraction:", {
      foundMainText: !!mainText,
      mainTextLength: mainText.length,
      mainTextPreview: mainText.substring(0, 100),
    });

    // If no mainText but we have buttons or emailPrompt, provide a default message
    if (
      !mainText &&
      ((Array.isArray(data.buttons) && data.buttons.length > 0) ||
        data.emailPrompt)
    ) {
      console.log(
        "🎯 [PARSE] No mainText found but has buttons/emailPrompt, using default message"
      );
      mainText = "Here are some options for you:";
    }

    // Fix literal \n\n strings in mainText if present
    if (mainText) {
      mainText = mainText.replace(/\\n\\n/g, "\n\n");
      mainText = mainText.replace(/\\n/g, "\n");
    }

    const result = {
      mainText: normalizeMainText(mainText),
      buttons: Array.isArray(data.buttons)
        ? data.buttons.map(sanitizeButtonLabel).filter(Boolean)
        : [],
      emailPrompt: typeof data.emailPrompt === "string" ? data.emailPrompt : "",
    };

    console.log("🎉 [PARSE] Final parsed result from object:", {
      finalMainText: result.mainText,
      finalMainTextLength: result.mainText.length,
      finalButtons: result.buttons,
      finalButtonsCount: result.buttons.length,
      finalEmailPrompt: result.emailPrompt,
      hasContent: !!result.mainText,
      hasButtons: result.buttons.length > 0,
      hasEmailPrompt: !!result.emailPrompt,
      completeResult: result,
    });

    return result;
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

  // Copy conversation to clipboard
  const copyConversation = async () => {
    try {
      let conversationText = "Chat Conversation\n";
      conversationText += "===================\n\n";

      messages.forEach((msg, index) => {
        const role = msg.role === "user" ? "You" : "Assistant";
        const timestamp = new Date().toLocaleString();

        conversationText += `[${role}] (${timestamp})\n`;
        conversationText += `${msg.content}\n`;

        // Add buttons if present
        if (!msg.isSummary && msg.buttons && msg.buttons.length > 0) {
          conversationText += "Options: " + msg.buttons.join(", ") + "\n";
        }

        conversationText += "\n";
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(conversationText);

      // Show success feedback (you could add a toast notification here)
      console.log("[Chatbot] Conversation copied to clipboard");
    } catch (error) {
      console.error("[Chatbot] Failed to copy conversation:", error);

      // Fallback for older browsers
      try {
        let conversationText = "Chat Conversation\n";
        conversationText += "===================\n\n";

        messages.forEach((msg, index) => {
          const role = msg.role === "user" ? "You" : "Assistant";
          const timestamp = new Date().toLocaleString();

          conversationText += `[${role}] (${timestamp})\n`;
          conversationText += `${msg.content}\n`;

          // Add buttons if present
          if (msg.buttons && msg.buttons.length > 0) {
            conversationText += "Options: " + msg.buttons.join(", ") + "\n";
          }

          conversationText += "\n";
        });

        const textArea = document.createElement("textarea");
        textArea.value = conversationText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.log("[Chatbot] Conversation copied to clipboard (fallback)");
      } catch (fallbackError) {
        console.error("[Chatbot] Copy fallback also failed:", fallbackError);
      }
    }
  };

  // Handle clicking an action option button
  const handleActionClick = (action: string, msg: Message) => {
    console.log("[Chatbot] Action option clicked", action);
    // Reset followup timer when button is clicked
    if (followupTimer.current) {
      clearTimeout(followupTimer.current);
      followupTimer.current = null;
    }
    setFollowupSent(false);
    setUserIsActive(false);
    setLastUserAction(Date.now());

    trackNudge(action, { pageUrl, adminId, message: msg });
    setInput("");
    sendMessage(action);
  };

  // Fallback: extract actionable options from plain text bullets when buttons array is empty
  const extractButtonsFromText = (text: string): string[] => {
    if (!text) return [];

    console.log("[BUTTON DEBUG] Extracting buttons from text:", text);

    // Clean up the text and remove button headers
    let cleaned = text.replace(/^---+$/gm, "");
    cleaned = cleaned.replace(/\n{2,}/g, "\n");

    // Remove header patterns for action buttons (including the specific pattern from logs)
    cleaned = cleaned.replace(
      /^\s*(#{1,3}\s*)?(Quick\s+Actions?|Action\s+Buttons?|Buttons?|Options?|Choose\s+from|Select|Available\s+Actions?)\s*:?\s*$/gim,
      ""
    );

    const lines = cleaned.split(/\r?\n/);
    const buttons: string[] = [];

    console.log("[BUTTON DEBUG] Processing lines:", lines);

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      let label = null;

      // Match bullet points: -, *, •, numbered lists, etc.
      const patterns = [
        /^[\s]*[•\-\*\u2022\u2013\u2014]\s*(.+)$/, // Bullets
        /^[\s]*\d+\.\s*(.+)$/, // Numbered
        /^\s*[\-\*\u2022]?\s*\[([^\]]+)\]\([^)]*\)/, // Markdown links
        /^\s*[\-\*\u2022]?\s*\[\s*\]\s*(.+)$/, // Checkboxes
      ];

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          label = match[1].trim();
          break;
        }
      }

      if (label) {
        // Clean up formatting
        label = label
          .replace(/^\*+|\*+$/g, "") // asterisks
          .replace(/^_+|_+$/g, "") // underscores
          .replace(/^`+|`+$/g, "") // backticks
          .replace(/[.!?]*$/, ""); // trailing punctuation
        label = sanitizeButtonLabel(label);

        // Simple validation: reasonable length and not empty
        if (label.length >= 3 && label.length <= 60) {
          buttons.push(label);
          console.log("[BUTTON DEBUG] Added button:", label);
        } else {
          console.log("[BUTTON DEBUG] Skipped (length):", label);
        }
      }

      // Limit to 6 buttons max
      if (buttons.length >= 6) break;
    }

    console.log("[BUTTON DEBUG] Final extracted buttons:", buttons);
    return buttons;
  };

  const getDefaultBantButtons = (text: string): string[] => {
    const t = String(text || "").toLowerCase();
    const budget = /(\$|usd|per\s*month|\bmo\b|budget|pricing|cost)/.test(t);
    const timeline =
      /(today|tomorrow|week|month|months|quarter|timeline|immediately|within)/.test(
        t
      );
    const authority =
      /(manager|director|vp|cto|ceo|decision|approval|who\s*will\s*make)/.test(
        t
      );
    const need =
      /(feature|need|priority|analytics|integration|project|team|collaboration)/.test(
        t
      );
    if (budget) return ["Under $500/mo", "$500–$2k/mo", "$2k–$10k/mo", "$10k+"];
    if (authority)
      return ["Yes, I'm the decision maker", "No, I need approval"];
    if (timeline)
      return ["Today", "This week", "This month", "Within 3 months"];
    if (need)
      return [
        "Analytics",
        "Integration",
        "Lead qualification",
        "Support automation",
      ];
    return [];
  };

  const isLikelyBantQuestion = (msg: Message, buttons: string[]): boolean => {
    const t = String(msg.content || "").toLowerCase();
    const phrases = [
      "what type of business are you",
      "what budget range are you considering",
      "who will make the decision",
      "which feature matters most right now",
      "what timeline are you targeting",
    ];
    return phrases.some((p) => t.includes(p));
  };

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

    console.log("🚀 [CHAT DEBUG] Starting message send process:", {
      userInput,
      sessionId: getSessionId(),
      pageUrl: pageUrl || getPageUrl(),
      adminId,
      timestamp: new Date().toISOString(),
    });

    try {
      const sessionId = getSessionId();
      const effectivePageUrl = pageUrl || getPageUrl();

      console.log("📤 [CHAT DEBUG] Sending API request:", {
        method: "POST",
        url: "/api/chat",
        body: {
          question: userMsg.content,
          sessionId,
          pageUrl: effectivePageUrl,
          ...(adminId ? { adminId } : {}),
        },
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg.content,
          sessionId,
          pageUrl: effectivePageUrl,
          assistantCountClient: messages.filter(
            (m) => m && m.role === "assistant"
          ).length,
          userInactiveForMs: Date.now() - lastUserAction,
          ...(adminId ? { adminId } : {}),
        }),
      });

      const data = await res.json();
      const parsed = parseBotResponse(data.answer || data);

      const newMessage = {
        role: "assistant" as const,
        content: parsed.mainText,
        buttons: parsed.buttons,
        emailPrompt: parsed.emailPrompt,
        botMode: data.botMode,
        userEmail: data.userEmail,
        clarifierShown: !!(data.answer?.clarifierShown ?? data.clarifierShown),
        missingDims: Array.isArray(data.answer?.missingDims ?? data.missingDims)
          ? data.answer?.missingDims ?? data.missingDims
          : undefined,
        domain: (data.answer?.domain ?? data.domain) || undefined,
        domainMatch:
          typeof (data.answer?.domainMatch ?? data.domainMatch) === "boolean"
            ? data.answer?.domainMatch ?? data.domainMatch
            : undefined,
        confidence:
          typeof (data.answer?.confidence ?? data.confidence) === "number"
            ? data.answer?.confidence ?? data.confidence
            : undefined,
        suggestedActions: Array.isArray(
          data.answer?.suggestedActions ?? data.suggestedActions
        )
          ? data.answer?.suggestedActions ?? data.suggestedActions
          : undefined,
      };

      const assistantCountBefore = messages.filter(
        (m) => m && m.role === "assistant"
      ).length;
      setMessages((msgs) => {
        const newMessages = [...msgs, newMessage];
        return newMessages;
      });
      if (data.secondary) {
        console.log("[Chatbot] Secondary follow-up received", {
          type: (data.secondary as any)?.type || "unknown",
          hasMainText: !!(data.secondary as any)?.mainText,
          buttonsCount: Array.isArray((data.secondary as any)?.buttons)
            ? (data.secondary as any)?.buttons.length
            : 0,
          preview:
            typeof (data.secondary as any)?.mainText === "string"
              ? (data.secondary as any)?.mainText.slice(0, 100)
              : "",
        });
        const secParsed = parseBotResponse(data.secondary);
        const secMsg = {
          role: "assistant" as const,
          content: secParsed.mainText,
          buttons: secParsed.buttons,
          emailPrompt: secParsed.emailPrompt,
          botMode: data.botMode,
          userEmail: data.userEmail,
          clarifierShown: !!(data.secondary as any)?.clarifierShown,
          missingDims: Array.isArray((data.secondary as any)?.missingDims)
            ? ((data.secondary as any)?.missingDims as string[])
            : undefined,
        };
        if (assistantCountBefore > 0) {
          const words = String(newMessage.content || "")
            .replace(/<[^>]+>/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
          const delayMs = Math.max(4000, Math.min(words * 350, 20000));
          const totalDelayMs = delayMs + 120000;
          console.log("⏳ [Chatbot] Total followup delay", {
            totalDelayMs,
            readerDelayMs: delayMs,
            words,
          });
          setTimeout(() => {
            console.log("[Chatbot] Appending follow-up message", {
              type: (data.secondary as any)?.type || "unknown",
              contentLength: secParsed.mainText?.length || 0,
              buttonsCount: Array.isArray(secParsed.buttons)
                ? secParsed.buttons.length
                : 0,
            });
            setMessages((msgs) => [...msgs, secMsg]);
          }, totalDelayMs);
        } else {
          console.log(
            "[Chatbot] Skipping follow-up for first assistant message"
          );
        }
      }
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
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={copyConversation}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 6px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            title="Copy conversation"
          >
            📋 Copy
          </button>
          <div
            style={{
              padding: "4px 8px",
              borderRadius: 12,
              fontSize: "12px",
              fontWeight: "bold",
              backgroundColor:
                currentBotMode === "sales" ? "#e3f2fd" : "#f3e5f5",
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
          {prefillQuestions && prefillQuestions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {prefillQuestions.slice(0, 5).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    trackNudge(`Quick Setup: ${q}`, { pageUrl, adminId });
                    sendMessage(q);
                  }}
                  style={{
                    backgroundColor: "#edf2f7",
                    color: "#1a202c",
                    border: "1px solid #cbd5e0",
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
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
                {/* Always render action buttons if present */}
                {(() => {
                  console.log(
                    "[BUTTON DEBUG] Starting button processing for message:",
                    {
                      messageIndex: i,
                      messageRole: msg.role,
                      messageContent: msg.content,
                      apiButtons: msg.buttons,
                      hasApiButtons: !!(msg.buttons && msg.buttons.length > 0),
                    }
                  );

                  // Always extract buttons from bullets if no buttons array, or if buttons array is empty
                  let finalButtons: string[] = [];
                  const clarifierActive =
                    !!msg.clarifierShown &&
                    Array.isArray(msg.missingDims) &&
                    msg.missingDims.length > 0;
                  const domainGateOk =
                    msg.domainMatch === true ||
                    (typeof msg.confidence === "number" &&
                      msg.confidence >= 0.75);
                  const missingGateOk =
                    !Array.isArray(msg.missingDims) ||
                    msg.missingDims.length === 0;
                  const allowOptions =
                    !clarifierActive && domainGateOk && missingGateOk;
                  if (msg.buttons && msg.buttons.length > 0) {
                    finalButtons = msg.buttons;
                    console.log(
                      "[BUTTON DEBUG] Using buttons from API response:",
                      finalButtons
                    );
                  } else if (allowOptions) {
                    console.log(
                      "[BUTTON DEBUG] No API buttons found, extracting from content..."
                    );
                    finalButtons = extractButtonsFromText(msg.content);
                    console.log(
                      "[BUTTON DEBUG] Extracted buttons from content:",
                      finalButtons
                    );
                  }

                  console.log(
                    "[BUTTON DEBUG] Final buttons to render:",
                    finalButtons
                  );

                  if (finalButtons.length === 0 && allowOptions) {
                    const fallback = getDefaultBantButtons(msg.content);
                    if (fallback.length > 0) {
                      finalButtons = fallback;
                      console.log(
                        "[BUTTON DEBUG] Using fallback BANT buttons:",
                        finalButtons
                      );
                    }
                  }

                  return finalButtons.length > 0 && allowOptions ? (
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {finalButtons.map((action, idx) => {
                          console.log(
                            `[BUTTON DEBUG] Rendering button ${
                              idx + 1
                            }: "${action}"`
                          );
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                console.log(
                                  "[Chatbot] Button clicked:",
                                  action
                                );
                                handleActionClick(action, msg);
                              }}
                              style={{
                                backgroundColor: "#edf2f7",
                                color: "#1a202c",
                                border: "1px solid #cbd5e0",
                                borderRadius: 16,
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#e2e8f0";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#edf2f7";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              {action}
                            </button>
                          );
                        })}
                      </div>
                      {isLikelyBantQuestion(msg, finalButtons) && (
                        <div style={{ marginTop: 8, color: "#000000" }}>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const v = String(othersInputValue || "").trim();
                              if (!v) return;
                              if (followupTimer.current) {
                                clearTimeout(followupTimer.current);
                                followupTimer.current = null;
                              }
                              setFollowupSent(false);
                              setUserIsActive(false);
                              setLastUserAction(Date.now());
                              sendMessage(v);
                              setOthersInputValue("");
                            }}
                          >
                            <input
                              type="text"
                              value={othersInputValue}
                              onChange={(e) => {
                                setOthersInputValue(e.target.value);
                                if (
                                  e.target.value.length > 0 &&
                                  !userIsActive
                                ) {
                                  setUserIsActive(true);
                                  setLastUserAction(Date.now());
                                }
                              }}
                              placeholder="Other (please specify)"
                              style={{
                                marginRight: 8,
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                border: "1px solid #ccc",
                                padding: "6px 10px",
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
                              Submit
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        [DEBUG: No buttons found to render]
                      </div>
                      {(() => {
                        const fallback = getDefaultBantButtons(msg.content);
                        return fallback.length > 0 ? (
                          <div style={{ marginTop: 8 }}>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {fallback.map((action, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleActionClick(action, msg)}
                                  style={{
                                    backgroundColor: "#edf2f7",
                                    color: "#1a202c",
                                    border: "1px solid #cbd5e0",
                                    borderRadius: 16,
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 600,
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                      {isLikelyBantQuestion(msg, finalButtons) && (
                        <div style={{ marginTop: 8, color: "#000000" }}>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const v = String(othersInputValue || "").trim();
                              if (!v) return;
                              if (followupTimer.current) {
                                clearTimeout(followupTimer.current);
                                followupTimer.current = null;
                              }
                              setFollowupSent(false);
                              setUserIsActive(false);
                              setLastUserAction(Date.now());
                              sendMessage(v);
                              setOthersInputValue("");
                            }}
                          >
                            <input
                              type="text"
                              value={othersInputValue}
                              onChange={(e) => {
                                setOthersInputValue(e.target.value);
                                if (
                                  e.target.value.length > 0 &&
                                  !userIsActive
                                ) {
                                  setUserIsActive(true);
                                  setLastUserAction(Date.now());
                                }
                              }}
                              placeholder="Other (please specify)"
                              style={{
                                marginRight: 8,
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                border: "1px solid #ccc",
                                padding: "6px 10px",
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
                              Submit
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* Always render email prompt/input if present */}
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
              <span>{msg.content}</span>
            )}
          </div>
        ))}
      </div>
      <button
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
        onClick={resetUser}
      >
        🔄 Reset User
      </button>
    </div>
  );
};

export default Chatbot;
