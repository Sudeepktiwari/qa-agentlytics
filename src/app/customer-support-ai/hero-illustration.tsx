"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  title: string;
  preview: string;
  sentiment: "negative" | "neutral" | "positive";
  action: string;
  details?: string;
};

const messages: Message[] = [
  {
    id: 1,
    title: `Can't find invoice`,
    preview: "Incoming message",
    details:
      "User says they can't locate their latest invoice in billing settings.",
    sentiment: "negative",
    action: "Proactive Help",
  },
  {
    id: 2,
    title: "Refund status?",
    preview: "Incoming message",
    details:
      "User is asking when they'll receive a refund for a returned order.",
    sentiment: "negative",
    action: "Proactive Help",
  },
  {
    id: 3,
    title: "Reset password",
    preview: "Incoming message",
    details: "User cannot login and requests a password reset link.",
    sentiment: "negative",
    action: "Proactive Help",
  },
  {
    id: 4,
    title: "Change payment method",
    preview: "Incoming message",
    details: "User wants to update their default card on file.",
    sentiment: "neutral",
    action: "Suggestion",
  },
];

const badgeColor = (s: Message["sentiment"]) => {
  if (s === "negative") return "bg-amber-100 text-amber-800";
  if (s === "positive") return "bg-emerald-100 text-emerald-800";
  return "bg-slate-100 text-slate-700";
};

const spring = { type: "spring", stiffness: 220, damping: 26 };

const ProactiveHelpIllustration: React.FC = () => {
  const [selected, setSelected] = useState<number>(messages[0].id);
  const [paused, setPaused] = useState<boolean>(false);

  // Automatically switch through each message every 3 seconds
  useEffect(() => {
    if (paused) return; // stop when hovered

    const interval = setInterval(() => {
      setSelected((prev) => {
        const currentIndex = messages.findIndex((m) => m.id === prev);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex].id;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [paused]);

  const active = messages.find((m) => m.id === selected) || messages[0];

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ scale: 0.995, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.38 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6"
        >
          <div className="flex-row space-y-4 md:space-y-0 md:flex items-start gap-6">
            {/* Left - messages */}
            <div className="md:w-[70%]">
              <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                Proactive Help Preview
              </h3>

              <div className="space-y-4">
                {messages.map((m) => {
                  const isActive = selected === m.id;
                  return (
                    <motion.div
                      layout
                      key={m.id}
                      onClick={() => setSelected(m.id)}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 26,
                      }}
                      className={`relative w-full text-left p-4 rounded-2xl border transition-shadow flex flex-col items-start gap-1 cursor-pointer select-none ${
                        isActive
                          ? "border-indigo-300 shadow-md bg-gradient-to-r from-white to-indigo-50"
                          : "border-slate-200 bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="text-lg font-medium text-slate-800">
                            {m.title}
                          </div>
                          <div className="text-sm text-slate-500">
                            {m.preview}
                          </div>
                        </div>

                        {/* sentiment dot */}
                        <div
                          className={`ml-3 ${
                            m.sentiment === "negative"
                              ? "text-amber-600"
                              : m.sentiment === "positive"
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="6" cy="6" r="6" fill="currentColor" />
                          </svg>
                        </div>
                      </div>

                      <AnimatePresence initial={false} mode="popLayout">
                        {isActive && (
                          <motion.p
                            layout
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.22 }}
                            className="text-sm text-slate-500 mt-2"
                          >
                            {m.details}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right - AI suggestion panel */}
            <div className="w-full relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, x: 22 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ ...spring, duration: 0.45 } as any}
                  className="p-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 shadow"
                >
                  <div className="flex items-start gap-4">
                    <div>
                      <div className="text-sm font-semibold text-indigo-600">
                        AI Suggestion
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mt-2">{`Looks like you're on Billing Settings — here's a suggestion for \"${active.title}\"`}</h4>
                      <p className="text-slate-600 mt-2">{active.details}</p>

                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.06,
                              delayChildren: 0.08,
                            },
                          },
                        }}
                        className="flex flex-wrap gap-3 mt-4"
                      >
                        {[
                          "Open latest invoice",
                          "Show refund policy",
                          "Send reset link",
                        ].map((label, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 rounded-full border border-indigo-300 text-indigo-700 font-medium bg-white"
                          >
                            {label}
                          </motion.button>
                        ))}
                      </motion.div>
                    </div>

                    <div className="ml-auto flex items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg">
                        AI
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-slate-500">
                    Suggested by the AI assistant. Click an action to perform it
                    automatically.
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <span
              className={`${badgeColor(
                active.sentiment
              )} px-3 py-1 rounded-full text-xs md:text-sm font-semibold`}
            >
              Sentiment: {active.sentiment}
            </span>
            <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
              Action: {active.action}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProactiveHelpIllustration;
