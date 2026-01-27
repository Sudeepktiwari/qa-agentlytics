"use client";

import React, { useMemo, useState, useEffect } from "react";

/**
 * Agentlytics vs SiteGPT — Comparison Landing Page (Calendly-inspired)
 * - Single-file React component (Next.js compatible)
 * - TailwindCSS required
 *
 * Defaults
 * - "Start free" routes to /signup
 * - "Book a demo" scrolls to #demo (can be swapped to external Calendly)
 *
 * Note
 * Some sandboxes don’t compile TS syntax in .tsx reliably. This file is plain JSX (no TS types).
 */

const BRAND_BLUE = "#006BFF";
const BRAND_BLUE_DARK = "#005BE0";

const rows = [
  {
    dimension: "Core product type",
    sitegpt: "Website AI chatbot",
    agentlytics: "Proactive AI agent + intelligence platform",
    tag: "strategy",
  },
  {
    dimension: "Primary design philosophy",
    sitegpt: "Answer questions when users ask",
    agentlytics: "Drive outcomes by acting proactively",
    tag: "strategy",
  },
  {
    dimension: "Interaction trigger",
    sitegpt: "User must start the conversation",
    agentlytics: "System + user (behavior-driven triggers)",
    tag: "execution",
  },
  {
    dimension: "Engagement model",
    sitegpt: "Reactive",
    agentlytics: "Proactive + reactive",
    tag: "execution",
  },
  {
    dimension: "Visitor intent detection",
    sitegpt: "Primarily from typed messages",
    agentlytics: "Behavior, page context, hesitation signals",
    tag: "intelligence",
  },
  {
    dimension: "Outbound initiation",
    sitegpt: "Not supported",
    agentlytics: "Nudges, follow-ups, re-engagement",
    tag: "execution",
  },
  {
    dimension: "Goal-driven behavior",
    sitegpt: "No goal awareness",
    agentlytics: "Outcome-oriented (conversion, booking, retention)",
    tag: "strategy",
  },
  {
    dimension: "Multi-step workflows",
    sitegpt: "Single-response oriented",
    agentlytics: "Plans, sequences, executes",
    tag: "execution",
  },
  {
    dimension: "Autonomous actions",
    sitegpt: "Cannot act beyond chat",
    agentlytics: "Triggers workflows across systems",
    tag: "execution",
  },
  {
    dimension: "Cross-tool execution",
    sitegpt: "Chat-first, limited integrations",
    agentlytics: "CRM, email, calendar, sales ops",
    tag: "execution",
  },
  {
    dimension: "Memory & context retention",
    sitegpt: "Session-based / limited context",
    agentlytics: "Persistent + contextual memory",
    tag: "intelligence",
  },
  {
    dimension: "Drop-off / ghost detection",
    sitegpt: "Not built-in",
    agentlytics: "Built-in detection + re-engagement",
    tag: "measurement",
  },
  {
    dimension: "Analytics focus",
    sitegpt: "Chat volume & answer quality",
    agentlytics: "Intent, drop-offs, conversion signals",
    tag: "measurement",
  },
  {
    dimension: "Performance scoring & coaching",
    sitegpt: "Not available",
    agentlytics: "9-metric HX scoring + optimization layer",
    tag: "measurement",
  },
  {
    dimension: "Business value",
    sitegpt: "Support automation",
    agentlytics: "Revenue, conversion, CX intelligence",
    tag: "strategy",
  },
];

const faqs = [
  {
    q: "Is Agentlytics just a better chatbot?",
    a: "No. Chatbots primarily respond to questions. Agentlytics is built to detect intent, initiate the right engagement, and execute multi-step actions toward outcomes like booking, qualification, and retention.",
  },
  {
    q: "Can I still use Agentlytics for support FAQs?",
    a: "Yes. Agentlytics supports reactive Q&A, but the differentiation is proactive intent detection and workflow execution—so support is one use case, not the product ceiling.",
  },
  {
    q: "What does proactive mean in practice?",
    a: "It means the system can act without waiting for a typed question—for example, nudging a visitor on pricing, capturing leads at exit intent, or triggering follow-ups and CRM updates.",
  },
  {
    q: "Do I need engineering help to set this up?",
    a: "You can start with a lightweight install. More advanced workflows (CRM, email, routing) can be configured progressively based on your stack and goals.",
  },
];

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Pill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "brand" | "muted" | "neutral";
}) {
  const styles =
    tone === "brand"
      ? "bg-[#006BFF]/10 text-[#005BE0] ring-[#006BFF]/25"
      : tone === "muted"
        ? "bg-slate-500/10 text-slate-700 ring-slate-500/20"
        : "bg-sky-500/10 text-sky-700 ring-sky-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
        styles,
      )}
    >
      {label}
    </span>
  );
}

function IconCheck({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconX({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Animated hero illustration
 * - Left: pricing page + scroll, hesitation, dwell, exit intent
 * - Center: engine detects
 * - Right: demo booked, lead qualified, CRM created
 */
function HeroIllustration() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
      <style>{`
        @keyframes flow {
          0% { stroke-dashoffset: 240; opacity: .22; }
          40% { opacity: .9; }
          100% { stroke-dashoffset: 0; opacity: .22; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); opacity: .9; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes pingRing {
          0% { transform: scale(.85); opacity: .35; }
          70% { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes barFill {
          0% { width: 14%; }
          50% { width: 78%; }
          100% { width: 14%; }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: .25; }
          30% { opacity: 1; }
          60% { transform: translateY(42px); opacity: 1; }
          100% { transform: translateY(0); opacity: .25; }
        }
        @keyframes cursorNudge {
          0% { transform: translate(0,0); opacity: .55; }
          40% { opacity: 1; }
          60% { transform: translate(-10px,-10px); opacity: 1; }
          100% { transform: translate(0,0); opacity: .55; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#006BFF]/12 blur-3xl" />
        <div className="absolute -bottom-44 -left-28 h-[520px] w-[520px] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-44 -right-28 h-[520px] w-[520px] rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative px-6 sm:px-10 py-14">
        <div className="mx-auto max-w-6xl">
          <svg
            className="pointer-events-none absolute left-0 top-0 h-full w-full"
            viewBox="0 0 1200 420"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M260 120 C 420 120, 420 160, 520 190"
              fill="none"
              stroke="rgba(0,107,255,0.30)"
              strokeWidth="3"
              strokeDasharray="10 16"
              style={{ animation: "flow 2.9s linear infinite" }}
            />
            <path
              d="M260 210 C 420 210, 420 210, 520 210"
              fill="none"
              stroke="rgba(0,107,255,0.22)"
              strokeWidth="3"
              strokeDasharray="10 18"
              style={{ animation: "flow 3.4s linear infinite" }}
            />
            <path
              d="M260 300 C 420 300, 420 260, 520 232"
              fill="none"
              stroke="rgba(0,107,255,0.28)"
              strokeWidth="3"
              strokeDasharray="10 16"
              style={{ animation: "flow 3.8s linear infinite" }}
            />
            <path
              d="M680 190 C 780 160, 820 120, 940 120"
              fill="none"
              stroke="rgba(0,107,255,0.30)"
              strokeWidth="3"
              strokeDasharray="10 16"
              style={{ animation: "flow 3.0s linear infinite" }}
            />
            <path
              d="M680 210 C 780 210, 820 210, 940 210"
              fill="none"
              stroke="rgba(0,107,255,0.22)"
              strokeWidth="3"
              strokeDasharray="10 18"
              style={{ animation: "flow 3.3s linear infinite" }}
            />
            <path
              d="M680 232 C 780 260, 820 300, 940 300"
              fill="none"
              stroke="rgba(0,107,255,0.28)"
              strokeWidth="3"
              strokeDasharray="10 16"
              style={{ animation: "flow 3.7s linear infinite" }}
            />
          </svg>

          <div className="relative grid grid-cols-12 items-center gap-y-10">
            {/* LEFT */}
            <div className="col-span-12 md:col-span-4">
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Pricing page
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      Signals detected
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#006BFF]/10 px-3 py-1 text-xs font-semibold text-[#005BE0] ring-1 ring-[#006BFF]/20">
                    Live
                  </span>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <div className="ml-2 h-2 w-28 rounded bg-slate-200" />
                  </div>
                  <div className="px-4 py-4">
                    <div className="h-3 w-40 rounded bg-slate-200" />
                    <div className="mt-3 h-8 w-full rounded-xl bg-slate-100" />
                    <div className="mt-3 h-24 w-full rounded-xl bg-slate-100" />

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-600">
                        Scroll
                      </div>
                      <div className="relative h-16 w-3 rounded-full bg-slate-100 ring-1 ring-slate-200">
                        <div
                          className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#006BFF]"
                          style={{
                            animation: "scrollDot 1.9s ease-in-out infinite",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-slate-600">
                          Dwell
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          00:18
                        </div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#006BFF]"
                          style={{
                            animation: "barFill 3.4s ease-in-out infinite",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-600">
                        Hesitation
                      </div>
                      <div className="relative">
                        <div
                          className="h-7 w-7 rounded-full bg-[#006BFF]/10 ring-1 ring-[#006BFF]/20"
                          style={{
                            animation: "pulseSoft 1.4s ease-in-out infinite",
                          }}
                        />
                        <div
                          className="absolute inset-0 rounded-full ring-2 ring-[#006BFF]/25"
                          style={{
                            animation: "pingRing 1.6s ease-out infinite",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-600">
                        Exit intent
                      </div>
                      <div className="relative h-8 w-14">
                        <div
                          className="absolute right-0 top-0 h-4 w-4 rounded-sm border border-slate-300 bg-white shadow-sm"
                          style={{
                            animation: "cursorNudge 2.3s ease-in-out infinite",
                          }}
                        />
                        <div className="absolute left-0 bottom-0 text-[11px] text-slate-500">
                          Detected
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER */}
            <div className="col-span-12 md:col-span-4 flex justify-center">
              <div
                className="relative"
                style={{ animation: "floatY 3.2s ease-in-out infinite" }}
              >
                <div
                  className="absolute inset-0 rounded-full blur-2xl"
                  style={{
                    width: 380,
                    height: 380,
                    background: "rgba(0,107,255,0.16)",
                  }}
                />

                <div
                  className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-white to-slate-50 ring-1 ring-slate-200 shadow-[0_30px_90px_-45px_rgba(0,107,255,0.55)]"
                  style={{ width: 320, height: 320 }}
                >
                  <div className="absolute inset-8 rounded-full ring-1 ring-slate-200/70" />
                  <div className="absolute inset-14 rounded-full ring-1 ring-[#006BFF]/25" />
                  <div className="absolute inset-[88px] rounded-full ring-1 ring-[#006BFF]/20" />

                  <div className="relative text-center px-8">
                    <div className="inline-flex items-center justify-center rounded-full bg-[#006BFF]/10 px-3 py-1 text-xs font-semibold text-[#005BE0]">
                      Engine
                    </div>
                    <div className="mt-4 text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                      Detects intent
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Signals → decision → action
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2 text-[11px]">
                      {["Signals", "Reason", "Execute"].map((t, i) => (
                        <div
                          key={t}
                          className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 ring-1 ring-slate-200"
                          style={{
                            animation: `pulseSoft ${1.8 + i * 0.2}s ease-in-out infinite`,
                          }}
                        >
                          {t}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006BFF]" />
                      <span className="text-xs text-slate-600">
                        Behavior-aware
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-600">
                        Goal-driven
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-span-12 md:col-span-4">
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm">
                <div className="text-xs font-semibold text-slate-500">
                  Outcomes
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  Automated execution
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { label: "Demo booked", sub: "Calendar event created" },
                    { label: "Lead qualified", sub: "BANT + intent score" },
                    { label: "CRM created", sub: "Deal + contact synced" },
                  ].map((o, idx) => (
                    <div
                      key={o.label}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                      style={{
                        animation: `floatY ${3 + idx * 0.35}s ease-in-out infinite`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {o.label}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {o.sub}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-[#006BFF]/10 ring-1 ring-[#006BFF]/20 grid place-items-center text-[#005BE0] font-semibold">
                            ✓
                          </div>
                          <div
                            className="absolute inset-0 rounded-full ring-2 ring-[#006BFF]/20"
                            style={{
                              animation: `pingRing ${2.1 + idx * 0.2}s ease-out infinite`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 h-2 w-full rounded-full bg-slate-100 ring-1 ring-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#006BFF]"
                          style={{
                            animation: `barFill ${3.2 + idx * 0.3}s ease-in-out infinite`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-[#F5F9FF] p-4 ring-1 ring-slate-200">
                  <div className="text-xs font-semibold text-slate-600">
                    Proactive message
                  </div>
                  <div className="mt-2 text-sm text-slate-900">
                    “Looks like you’re comparing plans—want me to recommend the
                    best one based on your traffic?”
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006BFF]" />
            Animated illustration: pricing signals → decision engine → outcomes
          </div>
        </div>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#006BFF] text-white flex items-center justify-center font-semibold">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 leading-tight">
                Agentlytics
              </div>
              <div className="text-xs text-slate-500">Comparison</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#difference"
              className="text-slate-600 hover:text-slate-900"
            >
              Difference
            </a>
            <a href="#table" className="text-slate-600 hover:text-slate-900">
              Table
            </a>
            <a
              href="#scenarios"
              className="text-slate-600 hover:text-slate-900"
            >
              Scenarios
            </a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#006BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005BE0]"
            >
              Start free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              SiteGPT
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              Reactive website chatbot
            </div>
          </div>
          <Pill label="Responds" tone="muted" />
        </div>
        <ul className="mt-5 space-y-3 text-sm text-slate-700">
          <li className="flex gap-3">
            <span className="mt-0.5 text-slate-400">
              <IconCheck />
            </span>
            Content-trained answers (FAQ, docs)
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-slate-400">
              <IconCheck />
            </span>
            Works well for support deflection
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-slate-400">
              <IconCheck />
            </span>
            Basic lead capture and routing
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-rose-500">
              <IconX />
            </span>
            No proactive outreach from behavior signals
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 text-rose-500">
              <IconX />
            </span>
            Limited autonomous, multi-step execution
          </li>
        </ul>
      </div>

      <div className="rounded-3xl border border-[#006BFF]/20 bg-gradient-to-br from-[#006BFF]/10 via-white to-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              Agentlytics
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              Proactive AI agent platform
            </div>
          </div>
          <Pill label="Decides + Acts" tone="brand" />
        </div>
        <ul className="mt-5 space-y-3 text-sm text-slate-700">
          {[
            "Detects intent from behavior + context",
            "Initiates re-engagement (nudges, follow-ups)",
            "Executes workflows across systems (CRM, email, calendar)",
            "Measures what converts (intent, drop-off, conversion signals)",
            "Optimization layer (9-metric HX scoring + coaching)",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-0.5 text-[#005BE0]">
                <IconCheck />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Scenario() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">
          Scenario: High-intent visitor
        </div>
        <div className="mt-2 text-sm text-slate-600">Behavior signals</div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {[
            "Visits pricing twice",
            "Scrolls feature comparisons",
            'Pauses on "Book demo"',
            "Moves cursor toward exit",
          ].map((x) => (
            <li key={x} className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
              {x}
            </li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            SiteGPT outcome
          </div>
          <div className="mt-2 text-sm text-slate-800">
            No action unless the visitor types a question.
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">
          What Agentlytics does
        </div>
        <ol className="mt-4 space-y-3 text-sm text-slate-700">
          {[
            "Detects high intent + hesitation",
            "Triggers a contextual proactive nudge",
            "Offers the next best step (recommend plan / book demo)",
            "Captures lead and schedules demo",
            "Logs intent signals + updates CRM",
          ].map((x, i) => (
            <li key={x} className="flex gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#006BFF] text-white text-xs font-semibold">
                {i + 1}
              </span>
              <div className="pt-1">{x}</div>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-2xl bg-[#0B1B3A] p-5">
          <div className="text-xs font-semibold tracking-wide text-white/70">
            Example proactive message
          </div>
          <div className="mt-2 text-sm text-white">
            “Not sure which plan fits? Share traffic + goal and I’ll recommend
            the fastest path in 30 seconds.”
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ filter }: { filter: string }) {
  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.tag === filter);
  }, [filter]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="col-span-5 text-xs font-semibold tracking-wide text-slate-500">
          Dimension
        </div>
        <div className="col-span-3 text-xs font-semibold tracking-wide text-slate-500">
          SiteGPT
        </div>
        <div className="col-span-4 text-xs font-semibold tracking-wide text-slate-500">
          Agentlytics
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {filtered.map((r) => (
          <div key={r.dimension} className="grid grid-cols-12 gap-4 px-6 py-5">
            <div className="col-span-12 md:col-span-5">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  {r.dimension}
                </div>
                {r.tag ? (
                  <span className="hidden sm:inline-flex">
                    <Pill
                      label={
                        r.tag === "strategy"
                          ? "Strategy"
                          : r.tag === "execution"
                            ? "Execution"
                            : r.tag === "intelligence"
                              ? "Intelligence"
                              : "Measurement"
                      }
                      tone={
                        r.tag === "execution"
                          ? "brand"
                          : r.tag === "measurement"
                            ? "muted"
                            : "neutral"
                      }
                    />
                  </span>
                ) : null}
              </div>
            </div>
            <div className="col-span-12 md:col-span-3 text-sm text-slate-700">
              {r.sitegpt}
            </div>
            <div className="col-span-12 md:col-span-4 text-sm text-slate-900 font-medium">
              {r.agentlytics}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTA() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#006BFF] to-[#005BE0] p-8 sm:p-10 shadow-2xl ring-1 ring-[#006BFF]/20">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <div className="text-2xl sm:text-3xl font-semibold text-white">
            Do not buy a better chatbot.
            <span className="block text-white/80">Buy an outcome engine.</span>
          </div>
          <div className="mt-3 text-sm sm:text-base text-white/85">
            Agentlytics is built for conversion, retention, and
            intelligence—where acting early matters more than answering late.
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {[
              "Proactive engagement",
              "Intent signals",
              "Workflow execution",
              "CX + revenue analytics",
            ].map((x) => (
              <span
                key={x}
                className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15"
              >
                {x}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
            <div className="text-sm font-semibold text-white">Get started</div>
            <div className="mt-2 text-sm text-white/80">
              Start free or route to a demo flow.
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white/95"
              >
                Start free
              </a>
              <a
                href="#demo"
                className="inline-flex w-full items-center justify-center rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
              >
                Book a demo
              </a>
            </div>
            <div className="mt-3 text-xs text-white/70">
              No credit card required • Works on any website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            FAQ
          </div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            Common evaluation questions
          </div>
        </div>
        <a
          href="/signup"
          className="hidden sm:inline-flex text-sm font-semibold text-slate-900 hover:text-slate-700"
        >
          Start free →
        </a>
      </div>

      <div className="mt-6 divide-y divide-slate-100">
        {faqs.map((f, idx) => {
          const isOpen = open === idx;
          return (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpen(isOpen ? -1 : idx)}
              className="w-full py-4 text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-slate-900">
                  {f.q}
                </div>
                <div
                  className={cn(
                    "h-8 w-8 rounded-full grid place-items-center ring-1",
                    isOpen
                      ? "bg-[#006BFF] text-white ring-[#006BFF]"
                      : "bg-white text-slate-900 ring-slate-200",
                  )}
                >
                  <span className="text-base leading-none">
                    {isOpen ? "–" : "+"}
                  </span>
                </div>
              </div>
              {isOpen ? (
                <div className="mt-3 text-sm text-slate-600">{f.a}</div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DemoSection() {
  return (
    <div
      id="demo"
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            Demo
          </div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            See the proactive flow in action
          </div>
          <div className="mt-2 text-sm text-slate-600 max-w-2xl">
            Tell us your traffic source and goal; we will show how Agentlytics
            detects pricing intent and converts it into booked demos and CRM
            updates.
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-[#006BFF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005BE0]"
          >
            Start free
          </a>
          <a
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Book a demo
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {["Pricing intent", "Lead qualification", "CRM + routing"].map((x) => (
          <div
            key={x}
            className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200"
          >
            <div className="text-sm font-semibold text-slate-900">{x}</div>
            <div className="mt-2 text-sm text-slate-600">
              Configure triggers, actions, and measurement—without losing the
              visitor to hesitation.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-10 flex items-center justify-between text-xs text-slate-500">
      <div>© {new Date().getFullYear()} Agentlytics</div>
      <div className="flex gap-4">
        <a className="hover:text-slate-700" href="#">
          Privacy
        </a>
        <a className="hover:text-slate-700" href="#">
          Terms
        </a>
        <a className="hover:text-slate-700" href="#">
          Contact
        </a>
      </div>
    </div>
  );
}

function DevTests({
  filterButtons,
}: {
  filterButtons: { id: string; label: string }[];
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    try {
      if (!Array.isArray(rows) || rows.length < 8)
        throw new Error("rows unexpectedly small");
      const allowed = new Set([
        "strategy",
        "execution",
        "intelligence",
        "measurement",
      ]);
      const invalid = rows.find((r) => r.tag && !allowed.has(r.tag));
      if (invalid) throw new Error(`Invalid row tag: ${String(invalid.tag)}`);

      const dims = rows.map((r) => r.dimension);
      const dup = dims.find((d, i) => dims.indexOf(d) !== i);
      if (dup) throw new Error(`Duplicate row dimension: ${dup}`);

      if (!BRAND_BLUE.startsWith("#") || BRAND_BLUE.length !== 7)
        throw new Error("BRAND_BLUE invalid");
      if (!BRAND_BLUE_DARK.startsWith("#") || BRAND_BLUE_DARK.length !== 7)
        throw new Error("BRAND_BLUE_DARK invalid");

      if (!Array.isArray(filterButtons) || filterButtons.length !== 5)
        throw new Error("filterButtons invalid");
      const ids = filterButtons.map((b) => b.id).join(",");
      if (ids !== "all,strategy,execution,intelligence,measurement")
        throw new Error("filterButtons ids mismatch");

      if (typeof HeroIllustration !== "function")
        throw new Error("HeroIllustration missing");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("DevTests failed:", e);
      throw e;
    }
  }, [filterButtons]);

  return null;
}

export default function AgentlyticsVsSiteGPTLanding() {
  const [filter, setFilter] = useState("all");

  const filterButtons = [
    { id: "all", label: "All" },
    { id: "strategy", label: "Strategy" },
    { id: "execution", label: "Execution" },
    { id: "intelligence", label: "Intelligence" },
    { id: "measurement", label: "Measurement" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F9FF] via-white to-white text-slate-900">
      <DevTests filterButtons={filterButtons} />
      <TopNav />

      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Pill label="Reactive chatbot vs proactive agent" tone="muted" />
            <Pill label="Calendly-style clarity" tone="brand" />
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
            Agentlytics vs SiteGPT
            <span className="block text-slate-500">
              Proactive AI agents, not reactive chatbots
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Most website AI tools wait for visitors to ask questions.
            Agentlytics detects intent, makes decisions, and executes actions
            automatically—before opportunities are lost.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#006BFF] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#005BE0]"
            >
              Start free
            </a>
            <a
              href="#table"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              View comparison
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Book a demo
            </a>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            No credit card required • Works on any website
          </div>
        </div>

        <div className="mt-16">
          <HeroIllustration />
        </div>
      </header>

      <section
        id="difference"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              Core difference
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              SiteGPT answers questions. Agentlytics acts on intent.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
              This is not a feature gap. It is a product class gap: from
              conversation-only to goal-driven execution.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="#scenarios"
              className="inline-flex items-center justify-center rounded-xl bg-[#006BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#005BE0]"
            >
              See scenario
            </a>
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Start free
            </a>
          </div>
        </div>

        <div className="mt-7">
          <ComparisonCards />
        </div>
      </section>

      <section
        id="table"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500">
              Decision-grade
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              Side-by-side comparison
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
              Filter by what matters: strategy, execution, intelligence, or
              measurement.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterButtons.map((b) => {
              const active = filter === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setFilter(b.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                    active
                      ? "bg-[#006BFF] text-white ring-[#006BFF]"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7">
          <ComparisonTable filter={filter} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Chatbots wait",
              d: "They respond after a question is typed.",
            },
            {
              t: "Agents decide",
              d: "They infer intent from signals and context.",
            },
            {
              t: "Agentlytics executes",
              d: "They run workflows that move outcomes forward.",
            },
          ].map((c) => (
            <div
              key={c.t}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-900">{c.t}</div>
              <div className="mt-2 text-sm text-slate-600">{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="scenarios"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14"
      >
        <div>
          <div className="text-xs font-semibold tracking-wide text-slate-500">
            Proof by scenario
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            Same visitor. Two outcomes.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
            This illustrates why proactive systems impact revenue and
            retention—because they act before the user leaves.
          </p>
        </div>
        <div className="mt-7">
          <Scenario />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
        <CTA />
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14">
        <DemoSection />
      </section>

      <section
        id="faq"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 pb-16"
      >
        <FAQSection />
        <Footer />
      </section>
    </div>
  );
}
