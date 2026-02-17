"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

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
  return window.location.href;
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
  topicsDiscussed?: string[];
  sources?: string[];
}

// Type for backend bot response

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
  const [messageType, setMessageType] = useState<"question" | "data">(
    "question",
  );
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null,
  );
  const [editInput, setEditInput] = useState("");
  const [loading, setLoading] = useState(false);
  const followupTimer = useRef<NodeJS.Timeout | null>(null);
  const typingStopTimer = useRef<NodeJS.Timeout | null>(null);
  const [followupSent, setFollowupSent] = useState(false);
  const [followupCount, setFollowupCount] = useState(0);
  const isTestEnv = process.env.NEXT_PUBLIC_ENV === "test";
  // const [selectedLink, setSelectedLink] = useState<string | null>(null);
  // const [proactiveTriggered, setProactiveTriggered] = useState(false);
  const [emailInputValue, setEmailInputValue] = useState("");
  // Track user activity to prevent unnecessary followups
  const [userIsActive, setUserIsActive] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<number>(Date.now());
  // Track current bot mode for display indicator
  const [currentBotMode, setCurrentBotMode] = useState<
    "sales" | "lead_generation"
  >("lead_generation");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [othersInputValue, setOthersInputValue] = useState("");
  const [hasBeenGreeted, setHasBeenGreeted] = useState(false);
  const [currentSectionContext, setCurrentSectionContext] = useState("");
  const sectionFollowupTimer = useRef<NodeJS.Timeout | null>(null);
  const inactivityFollowupsEnabled = false;

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
      // Prefer common label-like fields, ensuring they are strings
      const candidate =
        (typeof raw.label === "string" ? raw.label : null) ??
        (typeof raw.text === "string" ? raw.text : null) ??
        (typeof raw.title === "string" ? raw.title : null) ??
        (typeof raw.name === "string" ? raw.name : null) ??
        (typeof raw.value === "string" ? raw.value : null) ??
        // Handle nested label objects
        (raw.label && typeof raw.label === "object" ? raw.label?.text : null);

      if (candidate) {
        raw = candidate;
      } else {
        // If it's an object but we can't find a string label, return empty
        // This prevents [object Object] from appearing
        return "";
      }
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
    t = t.replace(/[ \t]+/g, " ").trim();
    return t;
  };

  // Debug logging for bot mode state removed

  // Track bot mode changes removed

  // Component mount/unmount logging removed

  // Lead Generation Strategy: Keep followup timer running even when page is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // console.log removed
        // DO NOT clear the followup timer when page becomes hidden
        // This allows us to continue engaging users even when they switch tabs
      } else {
        // console.log removed
        // Update last user action time when they return to the page
        setLastUserAction(Date.now());

        // Lead Generation Strategy: If user returns and there's an active timer,
        // slightly accelerate it to re-engage them faster
        if (followupTimer.current && !followupSent) {
          // console.log removed
          clearTimeout(followupTimer.current);

          // Shorter timer since they just returned (shows renewed interest)
          const acceleratedDelay = currentBotMode === "sales" ? 5000 : 8000; // 5s for sales, 8s for lead gen

          followupTimer.current = setTimeout(() => {
            const timeSinceLastAction = Date.now() - lastUserAction;
            const bufferTime = 3000; // Shorter buffer for returning users

            if (!userIsActive && timeSinceLastAction >= bufferTime) {
              // console.log removed
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
          })),
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
    const adminIdParam = adminId ? `&adminId=${adminId}` : "";
    fetch(
      `/api/chat?sessionId=${sessionId}&pageUrl=${encodeURIComponent(
        effectivePageUrl,
      )}${adminIdParam}`,
    )
      .then((res) => res.json())
      .then((data) => {
        let shouldTriggerProactive = true;
        const alreadyGreeted =
          typeof window !== "undefined" &&
          localStorage.getItem("appointy_has_been_greeted") === "true";

        // Track visited pages
        let visitedPages: string[] = [];
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("appointy_visited_pages");
            visitedPages = stored ? JSON.parse(stored) : [];
            if (!Array.isArray(visitedPages)) visitedPages = [];
            if (!visitedPages.includes(effectivePageUrl)) {
              visitedPages.push(effectivePageUrl);
              localStorage.setItem(
                "appointy_visited_pages",
                JSON.stringify(visitedPages),
              );
            }
          } catch (e) {
            // console.error removed
          }
        }

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

          // Determine if we should trigger a "Welcome Back" message
          if (alreadyGreeted && mapped.length >= 2) {
            shouldTriggerProactive = true;
          } else {
            shouldTriggerProactive = false;
          }

          // Check if we should clear history before showing proactive message (after reset)
          const clearHistoryFirst =
            localStorage.getItem("clearHistoryBeforeProactive") === "true";
          if (clearHistoryFirst) {
            localStorage.removeItem("clearHistoryBeforeProactive");

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
                // Now show the proactive message with clean history
                return fetch("/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId,
                    pageUrl: effectivePageUrl,
                    proactive: true,
                    hasBeenGreeted: alreadyGreeted,
                    visitedPages: (() => {
                      if (typeof window === "undefined") return [];
                      try {
                        const stored = localStorage.getItem(
                          "appointy_visited_pages",
                        );
                        return stored ? JSON.parse(stored) : [];
                      } catch {
                        return [];
                      }
                    })(),
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
                      topicsDiscussed: data.topicsDiscussed,
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
                    topicsDiscussed: data.topicsDiscussed,
                  };
                  setMessages((msgs) => [...msgs, secMsg]);
                }
                // Start follow-up timer
                if (followupTimer.current) clearTimeout(followupTimer.current);
                setFollowupSent(false);
                setFollowupCount(0);
                setUserIsActive(false);
                setLastUserAction(Date.now());
                followupTimer.current = setTimeout(() => {
                  setFollowupSent(true);
                }, 30000); // 30 seconds
              })
              .catch((error) => {
                // console.error removed
              });
            return;
          }
        }

        if (!shouldTriggerProactive) return;

        // Always trigger proactive bot message and follow-up timer on mount or after link selection
        const initialSectionContext = getVisibleSectionContext();
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pageUrl: effectivePageUrl,
            proactive: true,
            hasBeenGreeted: alreadyGreeted,
            contextualPageContext: initialSectionContext,
            visitedPages: (() => {
              if (typeof window === "undefined") return [];
              try {
                const stored = localStorage.getItem("appointy_visited_pages");
                return stored ? JSON.parse(stored) : [];
              } catch {
                return [];
              }
            })(),
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

            if (data.answer) {
              // Mark as greeted if not already
              if (!alreadyGreeted) {
                localStorage.setItem("appointy_has_been_greeted", "true");
                setHasBeenGreeted(true);
              }

              setMessages((prev) => [
                ...prev,
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
                  topicsDiscussed: data.topicsDiscussed,
                },
              ]);
            }
            if (data.secondary) {
              const secParsed = parseBotResponse(data.secondary);
              const secMsg = {
                role: "assistant" as const,
                content: secParsed.mainText,
                buttons: secParsed.buttons,
                emailPrompt: secParsed.emailPrompt,
                botMode: data.botMode,
                userEmail: data.userEmail,
                topicsDiscussed: data.topicsDiscussed,
              };
              if ((data.secondary as any)?.sectionName) {
                console.log(
                  `You are viewing "${(data.secondary as any).sectionName}" from structured summary`,
                );
              }
              setMessages((msgs) => [...msgs, secMsg]);
            }
            setFollowupCount(0);
            setUserIsActive(false); // Reset user activity
            setLastUserAction(Date.now());
          });
      });
    // Cleanup timer on unmount
    return () => {
      if (followupTimer.current) {
        // console.log removed
        clearTimeout(followupTimer.current);
      }
      if (typingStopTimer.current) {
        // console.log removed
        clearTimeout(typingStopTimer.current);
        typingStopTimer.current = null;
      }
    };
  }, [
    pageUrl,
    adminId,
    isTestEnv,
    disableProactive,
    seedAssistantMessages /*, proactiveTriggered, selectedLink */,
  ]);

  const getVisibleSectionContext = () => {
    if (typeof document === "undefined") return "";

    const t0 = typeof performance !== "undefined" ? performance.now() : 0;

    const viewportHeight = window.innerHeight || 0;
    const viewportWidth = window.innerWidth || 0;
    if (!viewportHeight || !viewportWidth) return "";

    let occludedTop = 0;
    let occludedBottom = 0;

    try {
      const fixedCandidates = Array.from(
        document.querySelectorAll("*"),
      ) as HTMLElement[];
      for (const el of fixedCandidates) {
        const style = window.getComputedStyle(el);
        if (style.position !== "fixed" && style.position !== "sticky") continue;
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        )
          continue;
        const rect = el.getBoundingClientRect();
        if (!rect.height || !rect.width) continue;
        const isTopOverlay =
          rect.top <= 0 &&
          rect.bottom > 0 &&
          rect.height < viewportHeight * 0.5;
        const isBottomOverlay =
          rect.bottom >= viewportHeight &&
          rect.top < viewportHeight &&
          rect.height < viewportHeight * 0.5;
        if (isTopOverlay) {
          if (rect.bottom > occludedTop) occludedTop = rect.bottom;
        } else if (isBottomOverlay) {
          const overlap = viewportHeight - rect.top;
          if (overlap > occludedBottom) occludedBottom = overlap;
        }
      }
    } catch {}

    const visibleTop = Math.min(Math.max(0, occludedTop), viewportHeight);
    const visibleBottom = Math.max(
      visibleTop,
      viewportHeight - Math.max(0, occludedBottom),
    );
    const visibleHeight = visibleBottom - visibleTop;
    if (!visibleHeight) return "";

    let elements = document.querySelectorAll(
      "section, article, [data-section], [data-track-section], div[data-section-id]",
    );
    if (!elements.length) {
      elements = document.querySelectorAll(
        "h1, h2, h3, h4, section, article, header, p, li, div[id]",
      );
    }

    let mostVisibleElement: Element | null = null;
    let maxScore = 0;

    (elements as NodeListOf<HTMLElement>).forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (!rect.height || !rect.width) return;
      if (rect.height > viewportHeight * 2) return;

      const intersectionTop = Math.max(rect.top, visibleTop);
      const intersectionBottom = Math.min(rect.bottom, visibleBottom);
      const intersectionHeight = Math.max(
        0,
        intersectionBottom - intersectionTop,
      );
      if (!intersectionHeight) return;

      const text = (el.innerText || "").trim();
      if (text.length < 20) return;

      const elementVisibility = intersectionHeight / rect.height;
      const viewportCoverage = intersectionHeight / visibleHeight;
      const score = viewportCoverage * 2 + elementVisibility;

      if (score > maxScore) {
        maxScore = score;
        mostVisibleElement = el;
      }
    });

    let contextText = "";

    if (mostVisibleElement) {
      const visibleTexts: string[] = [];
      const children = Array.from((mostVisibleElement as HTMLElement).children);

      if (children.length) {
        for (const child of children) {
          const el = child as HTMLElement;
          const rect = el.getBoundingClientRect();
          if (!rect.height || !rect.width) continue;
          const intersectionTop = Math.max(rect.top, visibleTop);
          const intersectionBottom = Math.min(rect.bottom, visibleBottom);
          const intersectionHeight = Math.max(
            0,
            intersectionBottom - intersectionTop,
          );
          if (!intersectionHeight) continue;
          const text = (el.innerText || "").trim();
          if (!text) continue;
          visibleTexts.push(text);
          if (visibleTexts.join(" ").length > 1000) break;
        }
      }

      if (visibleTexts.length) {
        contextText = visibleTexts.join(" ").substring(0, 800);
      } else {
        contextText = (mostVisibleElement.innerText || "").substring(0, 800);
      }
    } else {
      contextText = document.body.innerText.substring(0, 800);
    }

    if (t0 && typeof performance !== "undefined") {
      const duration = performance.now() - t0;
      try {
        const w = window as any;
        if (!w.__sectionDetectionMetrics) {
          w.__sectionDetectionMetrics = {
            samples: 0,
            totalMs: 0,
            maxMs: 0,
          };
        }
        const m = w.__sectionDetectionMetrics;
        m.samples += 1;
        m.totalMs += duration;
        if (duration > m.maxMs) m.maxMs = duration;
      } catch {}
    }

    return contextText;
  };

  useEffect(() => {
    if (disableProactive) return;
    if (typeof window === "undefined") return;

    const handleSectionCheck = () => {
      const ctx = getVisibleSectionContext();
      if (!ctx) return;
      if (!currentSectionContext) {
        setCurrentSectionContext(ctx);
        return;
      }
      if (ctx === currentSectionContext) return;
      setCurrentSectionContext(ctx);
      if (sectionFollowupTimer.current) {
        clearTimeout(sectionFollowupTimer.current);
      }
      sectionFollowupTimer.current = setTimeout(() => {
        const lastMsg = messages[messages.length - 1];
        if (!lastMsg || lastMsg.role !== "assistant") {
          return;
        }
        if (userIsActive) {
          return;
        }
        const sessionId = getSessionId();
        const effectivePageUrl = pageUrl || getPageUrl();
        const previousQuestions = messages
          .filter((m) => m.role === "assistant")
          .map((m) => m.content);

        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            pageUrl: effectivePageUrl,
            leadQuestionRequest: true,
            previousQuestions,
            contextualPageContext: ctx,
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
                topicsDiscussed: data.topicsDiscussed,
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
          })
          .catch(() => {});
      }, 10000);
    };

    const handleScroll = () => {
      handleSectionCheck();
    };

    const handleResize = () => {
      handleSectionCheck();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (sectionFollowupTimer.current) {
        clearTimeout(sectionFollowupTimer.current);
        sectionFollowupTimer.current = null;
      }
    };
  }, [
    disableProactive,
    pageUrl,
    adminId,
    messages,
    followupCount,
    userIsActive,
    currentSectionContext,
  ]);

  useEffect(() => {
    if (!inactivityFollowupsEnabled) {
      return;
    }
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
        // Align client timer with backend gating (backend suppresses followup if user active < 25s)
        // Use a consistent 30s delay to avoid premature suppression
        // EXCEPTION: First follow-up (Lead Question) should be immediate
        let timerDelay = followupCount === 0 ? 500 : 30000; // 0.5s for first, 30s for others

        // console.log removed
        followupTimer.current = setTimeout(() => {
          // Only send followup if user is not currently active and hasn't interacted recently
          const timeSinceLastAction = Date.now() - lastUserAction;
          // No buffer for first follow-up to ensure it sends immediately
          const bufferTime = followupCount === 0 ? 0 : 25000; // 25 seconds to match backend suppression window

          if (!userIsActive && timeSinceLastAction >= bufferTime) {
            // console.log removed
            setFollowupSent(true);
          } else {
            // console.log removed
          }
        }, timerDelay);
      }
    } else if (lastMsg.role === "user") {
      if (followupTimer.current) {
        // console.log removed
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
      // Additional check: don't send if user is currently active (typing)
      if (userIsActive) {
        // console.log removed
        setFollowupSent(false);
        return;
      }

      // console.log removed
      const sessionId = getSessionId();

      // Include visible section context for first two follow-ups (count 0 & 1)
      // count 0 -> Lead Question 1
      // count 1 -> Lead Question 2
      const shouldSendContext = followupCount <= 1;
      const sectionContext = shouldSendContext
        ? getVisibleSectionContext()
        : null;

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
          ...(shouldSendContext
            ? {
                contextualPageContext: sectionContext,
              }
            : {}),
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
          if ((data as any)?.sectionName) {
            console.log(
              `You are viewing "${(data as any).sectionName}" from structured summary`,
            );
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
              topicsDiscussed: data.topicsDiscussed,
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
        })
        .catch((err) => {
          // console.error removed
        });
    }
    // Cleanup on unmount
    return () => {
      if (followupTimer.current) {
        // console.log removed
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
    // console.log removed

    if (!data) {
      // console.error removed
      return {
        mainText:
          "I'm here if you need anything else! Feel free to ask me anything.",
        buttons: ["Menu", "Contact Support"],
        emailPrompt: "",
      };
    }

    // If data is a string, try to parse as JSON, else treat as plain text
    if (typeof data === "string") {
      // console.log removed

      try {
        const cleanedData = cleanJsonString(data);
        // console.log removed

        const parsed = JSON.parse(cleanedData);
        if (
          typeof parsed === "object" &&
          (parsed.mainText || parsed.buttons || parsed.emailPrompt)
        ) {
          // console.log removed

          return {
            mainText: normalizeMainText(
              parsed.mainText || "Here are some options for you:",
            ),
            buttons: Array.isArray(parsed.buttons)
              ? parsed.buttons.map(sanitizeButtonLabel).filter(Boolean)
              : [],
            emailPrompt: parsed.emailPrompt || "",
          };
        } else {
          // console.log removed
        }
      } catch (parseError) {
        // Not JSON, treat as plain text
        // console.log removed
      }
      // Look for JSON blocks in the text - improved regex for multi-line JSON with arrays
      const jsonMatch = data.match(/\{[\s\S]*?"buttons"[\s\S]*?\}/);
      if (jsonMatch) {
        // console.log removed

        try {
          const jsonPart = cleanJsonString(jsonMatch[0]);
          // console.log removed

          const parsed = JSON.parse(jsonPart);
          // console.log removed

          // Extract the main text (everything before the JSON block)
          let mainText = data.replace(jsonMatch[0], "").trim();

          // console.log removed

          // Clean up the main text - remove any remaining JSON artifacts
          mainText = mainText.replace(/\{[\s\S]*?\}/g, "");
          mainText = mainText.replace(/"buttons":\s*\[[\s\S]*?\]/g, "");
          mainText = mainText.replace(/"emailPrompt":\s*"[^"]*"/g, "");
          mainText = mainText.replace(
            /#{1,3}\s*Action\s+Buttons?\s*:?\s*[\r\n]*/gi,
            "",
          );
          mainText = mainText.replace(/^[\s]*[-•*]\s*[^:\n]+[\r\n]*/gm, "");
          mainText = mainText.replace(/\\n\\n/g, "\n\n");
          mainText = mainText.replace(/\\n/g, "\n");

          // console.log removed

          return {
            mainText: normalizeMainText(mainText.trim()),
            buttons: Array.isArray(parsed.buttons)
              ? parsed.buttons.map(sanitizeButtonLabel).filter(Boolean)
              : [],
            emailPrompt: parsed.emailPrompt || "",
          };
        } catch (e) {
          // console.log removed
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
            // console.log removed
          }
        } catch (e) {
          // console.log removed
        }
      }

      // Look for email prompt in text format like: Email Prompt: "message"
      const emailMatch = data.match(/Email Prompt:\s*"([^"]+)"/);
      let extractedEmailPrompt = "";
      if (emailMatch) {
        extractedEmailPrompt = emailMatch[1];
        // console.log removed
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
        "",
      );
      cleaned = cleaned.replace(/^[\s]*[-•*]\s*[^:\n]+[\r\n]*/gm, ""); // Remove bullet points that look like buttons

      // Fix literal \n\n strings that should be actual line breaks
      cleaned = cleaned.replace(/\\n\\n/g, "\n\n");
      cleaned = cleaned.replace(/\\n/g, "\n");

      // console.log removed
      return {
        mainText: normalizeMainText(cleaned.trim()),
        buttons: extractedButtons.map(sanitizeButtonLabel).filter(Boolean),
        emailPrompt: extractedEmailPrompt,
      };
    }

    // If data is an object, extract fields safely
    // console.log removed

    let mainText = typeof data.mainText === "string" ? data.mainText : "";

    // console.log removed

    // If no mainText but we have buttons or emailPrompt, provide a default message
    if (
      !mainText &&
      ((Array.isArray(data.buttons) && data.buttons.length > 0) ||
        data.emailPrompt)
    ) {
      // console.log removed
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

    // console.log removed

    return result;
  }

  // Add a simple nudge tracking function
  async function trackNudge(label: string, context?: unknown) {
    // Log to the console
    // console.log removed
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

      messages.forEach((msg) => {
        const role = msg.role === "user" ? "You" : "Assistant";
        const timestamp = new Date().toLocaleString();

        conversationText += `[${role}] (${timestamp})\n`;
        conversationText += `${msg.content}\n`;

        // Add buttons if present
        // if (!msg.isSummary && msg.buttons && msg.buttons.length > 0) {
        //   conversationText += "Options: " + msg.buttons.join(", ") + "\n";
        // }

        conversationText += "\n";
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(conversationText);

      // Show success feedback (you could add a toast notification here)
      // console.log removed
    } catch (error) {
      // console.error removed

      // Fallback for older browsers
      try {
        let conversationText = "Chat Conversation\n";
        conversationText += "===================\n\n";

        messages.forEach((msg) => {
          const role = msg.role === "user" ? "You" : "Assistant";
          const timestamp = new Date().toLocaleString();

          conversationText += `[${role}] (${timestamp})\n`;
          conversationText += `${msg.content}\n`;

          // Add buttons if present
          // if (msg.buttons && msg.buttons.length > 0) {
          //   conversationText += "Options: " + msg.buttons.join(", ") + "\n";
          // }

          conversationText += "\n";
        });

        const textArea = document.createElement("textarea");
        textArea.value = conversationText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        // console.log removed
      } catch (fallbackError) {
        // console.error removed
      }
    }
  };

  // Handle clicking an action option button
  const handleActionClick = (action: string, msg: Message) => {
    // console.log removed
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

  // Helper to filter out buttons related to discussed topics
  const filterButtonsByTopics = (
    buttons: string[],
    topicsDiscussed: string[] = [],
  ): string[] => {
    const normalizedTopics = (topicsDiscussed || []).map((t) =>
      String(t || "").toLowerCase(),
    );
    return buttons.filter((btn) => {
      const lb = btn.toLowerCase();
      const isDiscussed = normalizedTopics.some((topic) => {
        if (topic.length < 3) return false;
        return lb.includes(topic) || topic.includes(lb);
      });
      if (isDiscussed) {
        // console.log removed
      }
      return !isDiscussed;
    });
  };

  // Fallback: extract actionable options from plain text bullets when buttons array is empty
  const extractButtonsFromText = (
    text: string,
    topicsDiscussed: string[] = [],
  ): string[] => {
    if (!text) return [];

    // console.log removed

    // Clean up the text and remove button headers
    let cleaned = text.replace(/^---+$/gm, "");
    cleaned = cleaned.replace(/\n{2,}/g, "\n");

    // Remove header patterns for action buttons (including the specific pattern from logs)
    cleaned = cleaned.replace(
      /^\s*(#{1,3}\s*)?(Quick\s+Actions?|Action\s+Buttons?|Buttons?|Options?|Choose\s+from|Select|Available\s+Actions?)\s*:?\s*$/gim,
      "",
    );

    const lines = cleaned.split(/\r?\n/);
    const buttons: string[] = [];

    // console.log removed

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
          // console.log removed
        } else {
          // console.log removed
        }
      }

      // Limit to 6 buttons max
      if (buttons.length >= 6) break;
    }

    // Filter out buttons related to discussed topics
    const filteredButtons = filterButtonsByTopics(buttons, topicsDiscussed);

    // console.log removed
    return filteredButtons;
  };

  const getDefaultBantButtons = (
    text: string,
    topicsDiscussed: string[] = [],
  ): string[] => {
    const t = String(text || "").toLowerCase();
    const budget = /(\$|usd|per\s*month|\bmo\b|budget|pricing|cost)/.test(t);
    const timeline =
      /(today|tomorrow|week|month|months|quarter|timeline|immediately|within)/.test(
        t,
      );
    const authority =
      /(manager|director|vp|cto|ceo|decision|approval|who\s*will\s*make)/.test(
        t,
      );
    const need =
      /(feature|need|priority|analytics|integration|project|team|collaboration)/.test(
        t,
      );
    let buttons: string[] = [];
    if (budget)
      buttons = ["Under $500/mo", "$500–$2k/mo", "$2k–$10k/mo", "$10k+"];
    else if (authority)
      buttons = ["Yes, I'm the decision maker", "No, I need approval"];
    else if (timeline)
      buttons = ["Today", "This week", "This month", "Within 3 months"];
    else if (need)
      buttons = [
        "Analytics",
        "Integration",
        "Lead qualification",
        "Support automation",
      ];

    // Filter out buttons related to discussed topics
    const filteredButtons = filterButtonsByTopics(buttons, topicsDiscussed);

    return filteredButtons;
  };

  const isLikelyBantQuestion = (msg: Message): boolean => {
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
      // console.log removed
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

    // console.log removed

    try {
      const sessionId = getSessionId();
      const effectivePageUrl = pageUrl || getPageUrl();

      // console.log removed

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMsg.content,
          sessionId,
          pageUrl: effectivePageUrl,
          assistantCountClient: messages.filter(
            (m) => m && m.role === "assistant",
          ).length,
          userInactiveForMs: Date.now() - lastUserAction,
          ...(adminId ? { adminId } : {}),
          messageType,
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
          ? (data.answer?.missingDims ?? data.missingDims)
          : undefined,
        domain: (data.answer?.domain ?? data.domain) || undefined,
        domainMatch:
          typeof (data.answer?.domainMatch ?? data.domainMatch) === "boolean"
            ? (data.answer?.domainMatch ?? data.domainMatch)
            : undefined,
        confidence:
          typeof (data.answer?.confidence ?? data.confidence) === "number"
            ? (data.answer?.confidence ?? data.confidence)
            : undefined,
        suggestedActions: Array.isArray(
          data.answer?.suggestedActions ?? data.suggestedActions,
        )
          ? (data.answer?.suggestedActions ?? data.suggestedActions)
          : undefined,
        topicsDiscussed: data.topicsDiscussed,
        sources: data.sources,
      };

      const assistantCountBefore = messages.filter(
        (m) => m && m.role === "assistant",
      ).length;
      setMessages((msgs) => {
        const newMessages = [...msgs, newMessage];
        return newMessages;
      });
      if (data.secondary) {
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
          topicsDiscussed: data.topicsDiscussed,
        };
        if ((data.secondary as any)?.sectionName) {
          console.log(
            `You are viewing "${(data.secondary as any).sectionName}" from structured summary`,
          );
        }
        if (assistantCountBefore > 0) {
          const words = String(newMessage.content || "")
            .replace(/<[^>]+>/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean).length;
          const delayMs = Math.max(4000, Math.min(words * 350, 20000));
          const totalDelayMs = delayMs + 120000;
          // console.log removed
          setTimeout(() => {
            // console.log removed
            setMessages((msgs) => [...msgs, secMsg]);
          }, totalDelayMs);
        } else {
          // console.log removed
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
      // console.log removed
      setUserIsActive(true);
      setLastUserAction(Date.now());

      // Detect when typing stops to mark user inactive even if input not cleared
      if (typingStopTimer.current) {
        clearTimeout(typingStopTimer.current);
      }
      typingStopTimer.current = setTimeout(() => {
        // console.log removed
        setUserIsActive(false);
      }, 3000);

      // Reset followup timer when user starts typing
      if (followupTimer.current) {
        // console.log removed
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
      if (typingStopTimer.current) {
        clearTimeout(typingStopTimer.current);
        typingStopTimer.current = null;
      }
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
              // console.log removed
            }}
          >
            {(() => {
              const indicatorText =
                currentBotMode === "sales" ? "SALES MODE" : "LEAD MODE";
              // console.log removed
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
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {msg.content}
                  </ReactMarkdown>
                  {msg.role === "assistant" &&
                    msg.sources &&
                    msg.sources.length > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          borderTop: "1px solid #eee",
                          paddingTop: "4px",
                        }}
                      >
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              fontSize: "12px",
                              color: "#6b7280",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            ℹ️ View Sources
                          </summary>
                          <ul
                            style={{
                              margin: "4px 0 0 0",
                              paddingLeft: "16px",
                              fontSize: "12px",
                            }}
                          >
                            {Array.from(new Set(msg.sources)).map(
                              (src, idx) => (
                                <li key={idx} style={{ marginBottom: "2px" }}>
                                  {src.startsWith("http") ? (
                                    <a
                                      href={src}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#2563eb",
                                        textDecoration: "underline",
                                        wordBreak: "break-all",
                                      }}
                                    >
                                      {src}
                                    </a>
                                  ) : (
                                    <span
                                      style={{
                                        color: "#4b5563",
                                        wordBreak: "break-all",
                                      }}
                                    >
                                      {src}
                                    </span>
                                  )}
                                </li>
                              ),
                            )}
                          </ul>
                        </details>
                      </div>
                    )}
                </div>
                {/* Always render action buttons if present */}
                {(() => {
                  // console.log removed

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

                  // If the API explicitly sent buttons, we should render them even if
                  // there are missing dimensions (typical for BANT flows).
                  const isExplicitApiButtons =
                    msg.buttons && msg.buttons.length > 0;

                  if (msg.buttons && msg.buttons.length > 0) {
                    finalButtons = filterButtonsByTopics(
                      msg.buttons,
                      msg.topicsDiscussed,
                    );
                    // console.log removed
                  } else if (allowOptions) {
                    // console.log removed
                    finalButtons = extractButtonsFromText(
                      msg.content,
                      msg.topicsDiscussed,
                    );
                    // console.log removed
                  }

                  // console.log removed

                  if (finalButtons.length === 0 && allowOptions) {
                    const fallback = getDefaultBantButtons(
                      msg.content,
                      msg.topicsDiscussed,
                    );
                    if (fallback.length > 0) {
                      finalButtons = fallback;
                      // console.log removed
                    }
                  }

                  // Render if we have buttons AND (we are allowed to show options OR they are explicit API buttons)
                  return finalButtons.length > 0 &&
                    (allowOptions || isExplicitApiButtons) ? (
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {finalButtons.map((action, idx) => {
                          // console.log removed
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                // console.log removed
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
                      {isLikelyBantQuestion(msg) && (
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
                      {isLikelyBantQuestion(msg) && (
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
                {msg.emailPrompt &&
                  msg.emailPrompt.trim() !== "" &&
                  currentBotMode !== "sales" &&
                  !currentUserEmail && (
                    <div style={{ marginTop: 8, color: "#000000" }}>
                      <div>{msg.emailPrompt}</div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (emailInputValue.trim()) {
                            // console.log removed
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
            ) : editingMessageIndex === i ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editInput.trim()) {
                    sendMessage(editInput);
                    setEditingMessageIndex(null);
                    setEditInput("");
                  }
                }}
                style={{ display: "inline-block", width: "100%" }}
              >
                <input
                  type="text"
                  value={editInput}
                  onChange={(e) => setEditInput(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "4px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
                <div style={{ marginTop: 4, fontSize: 11 }}>
                  Press Enter to send correction
                  <button
                    type="button"
                    onClick={() => setEditingMessageIndex(null)}
                    style={{
                      marginLeft: 8,
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span>{msg.content}</span>
                <button
                  onClick={() => {
                    setEditingMessageIndex(i);
                    setEditInput(msg.content);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: 0,
                    opacity: 0.6,
                  }}
                  title="Edit this message"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}>
        {/* <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: messageType === "question" ? "#0070f3" : "#666",
            }}
          >
            <input
              type="radio"
              name="messageType"
              value="question"
              checked={messageType === "question"}
              onChange={() => setMessageType("question")}
              style={{ marginRight: 4 }}
            />
            Ask a Question
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              color: messageType === "data" ? "#0070f3" : "#666",
            }}
          >
            <input
              type="radio"
              name="messageType"
              value="data"
              checked={messageType === "data"}
              onChange={() => setMessageType("data")}
              style={{ marginRight: 4 }}
            />
            Provide Answer/Data
          </label>
        </div> */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              messageType === "question"
                ? "Type your question..."
                : "Type your answer..."
            }
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              padding: "8px 16px",
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
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
