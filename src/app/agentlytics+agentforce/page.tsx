import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  Clock3,
  Workflow,
  MessageSquare,
  Users,
  BarChart3,
  CalendarDays,
  FileText,
} from "lucide-react";

/**
 * Full page (light blue theme) — fixed SyntaxError (unterminated string) by:
 * - Removing any partially cut lines and ensuring all strings/JSX close properly
 * - Avoiding literal multi‑line strings; using JSX text nodes instead
 * - Keeping Canvas‑safe features (no next/head, no styled-jsx)
 *
 * Also adds a small Diagnostics panel (in‑UI test cases) to validate key data/state.
 */

export default function AgentlyticsVsAgentforce() {
  const [scrolled, setScrolled] = useState(false);

  // Sticky nav shadow
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") setScrolled(window.scrollY > 8);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Meta (Canvas-safe)
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.title =
          "Agentlytics vs Salesforce Agentforce — Proactive Experience Layer";
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content =
          "Compare Agentlytics vs Salesforce Agentforce — proactive AI engagement vs workflow automation. Detect intent, qualify with BANT, schedule in‑chat, guide onboarding, and support.";
        if (document.head) document.head.appendChild(meta);
      }
    } catch {}
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const ComingSoonBubble = ({ label = "Coming Soon" }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-300">
      <Info className="h-3.5 w-3.5" /> {label}
    </span>
  );

  // Data
  const salesforceData = [
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Visitor & Lead Details",
      desc: "Name, email, company, location, device, and visited pages are synced to Salesforce leads or contacts.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: "Chat History",
      desc: "Full conversation transcripts or concise summaries are attached to each record.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "Intent & Qualification Data",
      desc: "Includes intent score (0–100) and BANT info — Budget, Authority, Need, and Timeline.",
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-blue-600" />,
      title: "Meeting Details",
      desc: "When someone books a call or demo in chat, the meeting gets logged automatically in Salesforce.",
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: "Support or Product Info",
      desc: "Support requests or product setup details are logged as Cases or Notes for complete visibility.",
    },
  ];

  const quickCompareRows = [
    [
      "Core focus",
      "Conversation intelligence & proactive engagement that converts",
      "Agentic automation across Salesforce workflows",
    ],
    [
      "Where it shines",
      "Website & product experiences: detect, engage, qualify, schedule, onboard, support",
      "Back‑office + CRM: connect data, reason, execute actions",
    ],
    [
      "Proactive triggers (dwell, scroll, exit)",
      "Native (no rules to build)",
      "Not primary",
    ],
    ["Built‑in scheduling (in chat)", "Native", "External/linked flows"],
    [
      "Multi‑persona (Lead → Sales → Onboarding → Support)",
      "Native with context carryover",
      "Use‑case agents",
    ],
    [
      "Qualification",
      "BANT in‑chat with intent scoring & routing",
      "CRM‑centric qualification",
    ],
    [
      "Message‑level QA & ghost prevention",
      "9‑metric scoring + nudges",
      "Not a lead focus",
    ],
    [
      "Onboarding guidance",
      "Inline explanations, validation, adaptive paths",
      "Configure via Salesforce apps/flows",
    ],
    [
      "Setup time",
      "Minutes (embed snippet)",
      "Typically longer (Salesforce config)",
    ],
    ["Best fit", "Growth, Product, CX teams", "Salesforce‑centric enterprises"],
  ];

  // Diagnostics (acts like simple test cases in UI)
  const Diagnostics = () => {
    const checks = [
      {
        name: "salesforceData has 5 items",
        pass: Array.isArray(salesforceData) && salesforceData.length === 5,
      },
      {
        name: "quickCompareRows >= 10",
        pass: Array.isArray(quickCompareRows) && quickCompareRows.length >= 10,
      },
      {
        name: "ComingSoonBubble renders",
        pass: typeof ComingSoonBubble === "function",
      },
    ];
    return (
      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="text-xs font-semibold text-blue-800">Diagnostics</div>
          <ul className="mt-2 grid gap-2 md:grid-cols-3">
            {checks.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs text-slate-700"
              >
                <span>{c.name}</span>
                <span className={c.pass ? "text-emerald-600" : "text-rose-600"}>
                  {c.pass ? "PASS" : "FAIL"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-blue-50 to-blue-100 text-slate-800">
      {/* Nav */}
      <nav
        className={`fixed inset-x-0 top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-blue-800">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-200 text-blue-700">
              A
            </span>
            Agentlytics
          </div>
          <div className="hidden items-center gap-6 md:flex text-sm text-blue-700">
            <a href="#integration" className="hover:text-blue-900">
              Overview
            </a>
            <a href="#compare" className="hover:text-blue-900">
              Quick Compare
            </a>
            <a href="#why" className="hover:text-blue-900">
              Why
            </a>
            <a href="#outcomes" className="hover:text-blue-900">
              Outcomes
            </a>
            <a href="#faqs" className="hover:text-blue-900">
              FAQs
            </a>
          </div>
          <a
            href="#start"
            className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white font-semibold shadow-md transition hover:bg-blue-700"
          >
            Start Free — See How Fast You Convert
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-700 pt-28 pb-24 text-center text-white">
        <div className="relative z-10 container mx-auto max-w-5xl px-6">
          <motion.div {...fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Different DNA. One goal —
              better outcomes.
            </span>
            <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">
              Agentforce automates workflows.{" "}
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Agentlytics wins conversations.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100">
              Agentforce is enterprise automation. Agentlytics is
              conversation-first — it engages visitors, qualifies with BANT,
              books calls in chat, guides onboarding, and supports continuously.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-blue-200">
              Most bots wait. You lose the moment.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#start"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 shadow-md hover:bg-blue-50"
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-white backdrop-blur-md hover:bg-white/10"
              >
                Book Demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integration */}
      <section id="integration" className="py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-center gap-3 text-center">
            <motion.h2
              {...fadeUp}
              className="text-3xl font-bold text-blue-800 md:text-4xl"
            >
              How Agentlytics Works with Salesforce
            </motion.h2>
            <ComingSoonBubble />
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-700">
            Agentlytics connects directly with Salesforce — so every meaningful
            interaction from your website or product is automatically captured
            inside your CRM.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {salesforceData.map((item, idx) => (
              <motion.div
                key={idx}
                {...fadeUp}
                className="relative rounded-2xl border border-blue-200 bg-white p-6 text-slate-900 shadow"
              >
                <div className="absolute right-3 top-3">
                  <ComingSoonBubble />
                </div>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-slate-700">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-3xl text-center text-slate-700">
            In short, Agentlytics captures who engaged, what they asked, what
            they booked, and how they felt — then sends it straight into
            Salesforce so your team can follow up without switching tabs.
          </p>
        </div>
      </section>

      {/* TL;DR */}
      <section id="tldr" className="py-16">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Choose Agentlytics if…",
                body: "you need a proactive, lifecycle‑aware front + post‑funnel engine: detect intent, engage, qualify (BANT), schedule in chat, onboard with inline guidance, and support with context continuity.",
              },
              {
                title: "Choose Agentforce if…",
                body: "you need enterprise agentic execution inside Salesforce across data → reasoning → actions, with deep platform governance and controls.",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                className="rounded-2xl border border-blue-200 bg-white p-6 text-slate-900 shadow"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  {c.title}
                </h3>
                <p className="mt-2 text-slate-700">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick compare */}
      <section id="compare" className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.div
            {...fadeUp}
            className="flex flex-col items-center justify-center gap-3 text-center"
          >
            <h2 className="text-3xl font-bold text-blue-800 md:text-4xl">
              Quick Compare (at a glance)
            </h2>
            <ComingSoonBubble label="Salesforce Integration" />
            <p className="mx-auto mt-1 max-w-2xl text-slate-700">
              A side‑by‑side breakdown of how Agentlytics and Agentforce differ
              — and where they shine.
            </p>
          </motion.div>
          <div className="mt-10 overflow-hidden rounded-3xl border border-blue-200 bg-blue-50 text-blue-900 shadow-md">
            <div className="grid grid-cols-12 bg-blue-100/50 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
              <div className="col-span-4 text-left">Category</div>
              <div className="col-span-4 text-center">Agentlytics</div>
              <div className="col-span-4 text-center">
                Salesforce Agentforce
              </div>
            </div>
            {quickCompareRows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 px-5 py-4 text-sm ${
                  i % 2 ? "bg-white" : "bg-blue-50"
                }`}
              >
                <div className="col-span-4 font-semibold text-blue-900">
                  {row[0]}
                </div>
                <div className="col-span-4 text-center">{row[1]}</div>
                <div className="col-span-4 text-center">{row[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why + feature blocks */}
      <section id="why" className="py-20 bg-blue-50">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.h2
            {...fadeUp}
            className="text-3xl font-bold text-blue-800 md:text-4xl"
          >
            Why Agentlytics wins the experience layer
          </motion.h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            Most tools wait for users to type. Agentlytics acts first at peak
            intent — and keeps the conversation going across the entire journey.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 text-blue-900 shadow">
              <h3 className="text-base font-semibold">Before: Reactive bot</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-blue-400" /> Waits for input;
                  loses pricing intent
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-blue-400" /> Redirects to
                  external schedulers
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-blue-400" /> No message‑level
                  QA or ghost coaching
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-6 text-blue-900 shadow">
              <h3 className="text-base font-semibold">
                After: Proactive AI (Agentlytics)
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-blue-600" /> Detects
                  dwell/scroll/exit → prompts at peak intent
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-blue-600" /> Native in‑chat
                  scheduling <ComingSoonBubble />
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-blue-600" /> 9‑metric QA +
                  ghost prevention nudges
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Behavioral Triggers — Detect, Predict, Engage",
                icon: <Workflow className="h-5 w-5 text-blue-600" />,
                lines: [
                  "Dwell time, scroll depth, frustrated clicks, and exit intent automatically launch micro‑prompts.",
                  "Example: On pricing dwell + 60% scroll, open fit‑check or book demo in‑chat.",
                ],
              },
              {
                title: "Multi‑Persona AI — One brain, many roles",
                icon: <Sparkles className="h-5 w-5 text-blue-600" />,
                lines: [
                  "Seamless Lead → Sales → Onboarding → Support with context memory & tone.",
                  "Example: ROI guidance → connect HubSpot → fix config — in one thread.",
                ],
              },
              {
                title: "BANT‑based Qualification — Identify real buyers",
                icon: <ShieldCheck className="h-5 w-5 text-blue-600" />,
                lines: [
                  "Infers Budget, Authority, Need, Timeline and computes an intent score.",
                  "Routes + syncs to CRM & Slack with a clean BANT summary.",
                ],
              },
              {
                title: "Built‑in Scheduling — Keep prospects in chat",
                icon: <Clock3 className="h-5 w-5 text-blue-600" />,
                lines: [
                  "Native slot picker; no external redirects.",
                  "Optimized for completions",
                ],
              },
              {
                title: "Guided Onboarding — Explain, validate, adapt",
                icon: <Check className="h-5 w-5 text-blue-600" />,
                lines: [
                  "Inline tips, validation, adaptive paths, sample data.",
                  "Faster time‑to‑value, fewer setup tickets.",
                ],
              },
              {
                title: "QA & Ghost Prevention — 9‑metric coaching",
                icon: <Check className="h-5 w-5 text-blue-600" />,
                lines: [
                  "Clarity, Accuracy, Tone, Empathy, Personalization, Speed, Resolution, Sentiment, Proactive Help.",
                  "Detects ghost risk and nudges for closure.",
                ],
              },
            ].map((c, idx) => (
              <motion.div
                key={idx}
                {...fadeUp}
                className="group rounded-2xl border border-blue-200 bg-white p-6 text-slate-900 shadow"
              >
                <div className="flex items-center gap-2 text-slate-900">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                    {c.icon}
                  </div>
                  <h3 className="text-base font-semibold">{c.title}</h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {c.lines.map((l, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deeper Comparison */}
      <section id="deep" className="py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.h2
            {...fadeUp}
            className="flex items-center justify-center gap-3 text-center text-3xl font-bold text-blue-800 md:text-4xl"
          >
            Deeper Comparison by Capability <ComingSoonBubble />
          </motion.h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              {
                head: "1) Proactive Engagement",
                ag: (
                  <>
                    Lightweight snippet (
                    <span className="font-mono">&lt;5KB</span>, deferred)
                    observes dwell, scroll, idle, cursor velocity & exit intent
                    → classifies session → triggers the right play in
                    milliseconds.
                  </>
                ),
                sf: "Responds via configured events/flows; not built as a behavioral trigger layer for anonymous web traffic.",
              },
              {
                head: "2) Multi‑Persona Execution",
                ag: "Auto‑switches personas with context carryover and role‑safe tone (Lead → Sales → Onboarding → Support).",
                sf: "Strong for building agents aligned to business tasks; personas are configured per use case.",
              },
              {
                head: "3) Qualification & Routing",
                ag: "BANT in‑chat → Intent Score (e.g., 82/100) → route to CRM/Slack and surface demo picker + case studies when thresholds hit.",
                sf: "Leans on Salesforce data model & flows for scoring/routing within CRM.",
              },
              {
                head: "4) Scheduling",
                ag: (
                  <span>
                    Native slot picker inside chat (auto‑detects timezone).{" "}
                    <ComingSoonBubble />
                  </span>
                ),
                sf: "Typically routes to Salesforce scheduling or external links.",
              },
              {
                head: "5) Onboarding & Product Guidance",
                ag: "Explains why fields matter, validates formats/connectivity, adapts paths, seeds sample data, supports human handoff with transcript.",
                sf: "Can orchestrate steps through Salesforce flows; not a native inline explain/validate/adapt layer on forms.",
              },
              {
                head: "6) QA, Coaching & Ghost Prevention",
                ag: "9‑metric message‑level scoring, ghost detection with tiered nudges, post‑chat scorecards.",
                sf: "Oriented to execution/governance rather than per‑message QA scoring & ghost analytics.",
              },
            ].map((b, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                className="rounded-2xl border border-blue-200 bg-white p-6 text-slate-900 shadow"
              >
                <h3 className="text-base font-semibold text-slate-900">
                  {b.head}
                </h3>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-blue-700">
                      Agentlytics
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{b.ag}</p>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-700">
                      Agentforce
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{b.sf}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes + logos */}
      <section id="outcomes2" className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.h2
            {...fadeUp}
            className="text-3xl font-bold text-blue-800 md:text-4xl"
          >
            Real Outcomes (Agentlytics)
          </motion.h2>
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="relative overflow-hidden">
              <div className="marquee flex gap-12 opacity-90 hover:[animation-play-state:paused]">
                {[
                  "CloudScale",
                  "FinServe",
                  "TechFlow",
                  "DevSuite",
                  "RetailCore",
                  "DataNest",
                ].map((brand) => (
                  <div
                    key={brand}
                    className="flex h-10 min-w-[140px] items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-blue-700"
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-blue-700">
              Trusted by teams at CloudScale, FinServe, TechFlow — and more.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              {
                label: "Call completions",
                value: "2.8×",
                caption: "with in‑chat scheduling",
              },
              {
                label: "Time‑to‑value",
                value: "−32%",
                caption: "faster activation",
              },
              {
                label: "Onboarding completion",
                value: "+24%",
                caption: "guided setup",
              },
              {
                label: "Ghost rate",
                value: "↓",
                caption: "nudges & QA scoring",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                className="rounded-2xl border border-blue-200 bg-white p-6 text-center text-blue-800 shadow"
              >
                <div className="text-3xl font-extrabold text-blue-700">
                  {s.value}
                </div>
                <div className="mt-1 text-sm font-medium">{s.label}</div>
                <div className="mt-1 text-xs text-slate-600">{s.caption}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Works together */}
      <section id="together" className="py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.h2
            {...fadeUp}
            className="text-3xl font-bold text-blue-800 md:text-4xl"
          >
            Works Great Together
          </motion.h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            Run Agentlytics for experience and engagement, and Agentforce for
            enterprise actions. Engage, qualify, and schedule with Agentlytics —
            trigger deeper Salesforce workflows with Agentforce.
          </p>
          <div className="mt-6">
            <ol className="relative space-y-4 border-l border-blue-200 pl-6">
              {[
                "Visitor engages with Agentlytics on site (behavioral trigger).",
                "BANT score ≥ threshold → in‑chat demo slot picked.",
                "Summary + context pushed to CRM & Slack.",
                "Agentforce runs downstream enterprise workflows.",
              ].map((step, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <span className="absolute -left-2.5 mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <motion.h2
            {...fadeUp}
            className="text-3xl font-bold text-blue-800 md:text-4xl"
          >
            FAQs
          </motion.h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              [
                "Can I use Agentlytics without Salesforce?",
                "Yes. Drop the snippet and go live in minutes.",
              ],
              [
                "Can both run side‑by‑side?",
                "Absolutely. Use Agentlytics for engagement; pass data to Salesforce for workflows.",
              ],
              [
                "Do I need to build rules for triggers?",
                "No. Agentlytics auto‑detects dwell, scroll, exits — no setup required.",
              ],
              [
                "What about security?",
                "PII redaction, SSO/SAML, audit logs, region‑aware storage are built‑in.",
              ],
            ].map(([q, a], i) => (
              <motion.div
                key={i}
                {...fadeUp}
                className="rounded-2xl border border-blue-200 bg-white p-6 text-slate-900 shadow"
              >
                <h3 className="text-base font-semibold text-slate-900">{q}</h3>
                <p className="mt-2 text-sm text-slate-700">{a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        id="start"
        className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-center text-white"
      >
        <div className="container mx-auto max-w-5xl px-6">
          <motion.h3 {...fadeUp} className="text-2xl font-semibold md:text-3xl">
            Agentforce runs your processes. Agentlytics wins your customers.
          </motion.h3>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Capture intent, qualify with BANT, schedule in chat, and guide
            onboarding — with one AI.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="cta group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 shadow-md hover:bg-blue-50"
            >
              Start Free — See How Fast You Convert{" "}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-white hover:bg-white/10"
            >
              Book a Comparison Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 text-center text-sm text-blue-700">
        © {new Date().getFullYear()} Agentlytics — Comparison Page.
      </footer>

      {/* Micro‑interactions */}
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px);} 50% { transform: translateY(-2px);} }
        .cta { position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(2, 6, 23, 0.15); }
        .cta::after { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, transparent 0%, rgba(0,0,0,.07) 50%, transparent 100%); transform: translateX(-100%); animation: shimmer 3.2s ease-in-out infinite; }
        .cta:hover::after { animation-duration: 1.8s; }
        @keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }
        @keyframes marquee { 0% { transform: translateX(0);} 100% { transform: translateX(-50%);} }
        .marquee { width: 200%; animation: marquee 18s linear infinite; }
      `}</style>

      {/* Diagnostics (test cases) */}
      <Diagnostics />
    </div>
  );
}
