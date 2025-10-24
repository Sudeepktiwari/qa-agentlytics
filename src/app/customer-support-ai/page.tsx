// Advancelytics — Customer Support AI (Full Page)
// Calendly-style theme; modern sections; no black buttons; airy hero
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const brand = {
  primary: "#006BFF",
  primaryHover: "#0055CC",
  accent: "#0AE8F0",
  bgFrom: "#F3F9FF",
  bgTo: "#FFFFFF",
  glow: "#CDE6FF",
  surface: "#FDFFFF", // bright hero/card surface
  surfaceAlt: "#F6FBFF",
  borderSubtle: "#E3EEFF",
};

export default function CustomerSupportAIPage() {
  // Framer Motion helpers for looping demo
  const intents = [
    { k: "Need refund" },
    { k: "Reset password" },
    { k: "Feature not working" },
    { k: "Change invoice email" },
    { k: "Cancel subscription" },
  ];
  const actions = [
    { txt: "Create macro" },
    { txt: "Add KB article" },
    { txt: "Route to Billing" },
    { txt: "Escalate to L2" },
  ];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);
  const rollingIntents = useMemo(() => {
    const a = tick % intents.length;
    const b = (a + 1) % intents.length;
    const c = (a + 2) % intents.length;
    return [intents[a], intents[b], intents[c]];
  }, [tick]);
  const rollingActions = useMemo(() => {
    const a = tick % actions.length;
    const b = (a + 1) % actions.length;
    const c = (a + 2) % actions.length;
    return [actions[a], actions[b], actions[c]];
  }, [tick]);
  return (
    <div
      className="relative min-h-screen w-full text-slate-900 antialiased"
      style={
        {
          "--brand-primary": brand.primary,
          "--brand-accent": brand.accent,
          "--surface": brand.surface,
          "--surface-alt": brand.surfaceAlt,
          "--border-subtle": brand.borderSubtle,
        } as React.CSSProperties
      }
    >
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            `radial-gradient(1000px 600px at 20% -10%, ${brand.bgFrom} 0%, transparent 60%),` +
            `radial-gradient(800px 400px at 85% 0%, ${brand.surfaceAlt} 0%, transparent 55%),` +
            `linear-gradient(180deg, ${brand.bgFrom} 0%, ${brand.bgTo} 55%)`,
        }}
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[--border-subtle] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[--brand-primary]" />
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Customer Support AI
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#brain" className="hover:text-slate-900">
              Inside the Brain
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#outcomes" className="hover:text-slate-900">
              Outcomes
            </a>
            <a href="#cta" className="hover:text-slate-900">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden rounded-xl border border-[--border-subtle] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[--surface] md:inline-block"
            >
              Watch demo
            </a>
            <a
              href="#cta"
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              style={{ backgroundColor: brand.primary }}
            >
              Start free
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative isolate rounded-b-[2rem] bg-[--surface] py-20 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${brand.primary}26 0%, transparent 60%)`,
          }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Transform Support from Reactive to Predictive
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Most teams wait for customers to ask for help. Advancelytics
              detects frustration, intent, and sentiment in real time — guiding
              users to answers before they need to reach out.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="#cta"
                className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                style={{ backgroundColor: brand.primary }}
              >
                Start Free Trial
              </a>
              <a
                href="#demo"
                className="rounded-2xl border border-[--brand-primary] px-6 py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = `linear-gradient(90deg, ${brand.primary} 0%, ${brand.accent} 100%)`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Watch Demo
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Works with Zendesk, Freshdesk, Intercom & more
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur" />
            <div className="relative rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="mb-4 text-sm font-semibold text-slate-700">
                Proactive Help Preview
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Left: user message list */}
                <div className="space-y-3">
                  {[
                    "Can’t find invoice",
                    "Refund status?",
                    "Reset password",
                  ].map((msg) => (
                    <div
                      key={msg}
                      className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                    >
                      <div className="text-sm font-medium text-slate-800">
                        {msg}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Incoming message
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: AI suggestions */}
                <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3">
                  <div className="text-[11px] font-semibold text-slate-500">
                    AI Suggestion
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    Looks like you’re on{" "}
                    <span className="font-semibold">Billing Settings</span> —
                    here’s your latest invoice.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {[
                      "Open latest invoice",
                      "Show refund policy",
                      "Send reset link",
                    ].map((cta) => (
                      <button
                        key={cta}
                        className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 font-medium text-[--brand-primary] hover:bg-[--brand-primary]/5"
                      >
                        {cta}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sentiment badge */}
              <div className="mt-5 flex items-center justify-end gap-2 text-xs">
                <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                  Sentiment: Negative
                </span>
                <span className="rounded-full bg-[--brand-primary]/10 px-2.5 py-1 font-semibold text-[--brand-primary]">
                  Action: Proactive Help
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS MATTERS */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Local animation styles */}
        <style>{`
          @keyframes floatIn {
            0% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes routeRight {
            0% { transform: translateX(0); opacity: .0; }
            30% { opacity: 1; }
            100% { transform: translateX(28px); opacity: 1; }
          }
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(0,107,255,0.20); }
            100% { box-shadow: 0 0 0 16px rgba(0,107,255,0); }
          }
          .animate-floatIn { animation: floatIn .5s ease-out both; }
          .animate-routeRight { animation: routeRight 1.2s ease-out both; }
          .animate-pulseGlow { animation: pulseGlow 1.6s ease-out infinite; }
        `}</style>

        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Copy + contrast cards */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why reactive support is failing you
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Every unresolved query is a missed opportunity to retain and
              delight. With Advancelytics, your AI agent becomes the first line
              of intelligent help — reducing load and improving CSAT.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[--border-subtle] bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-50 text-amber-700">
                    ⏳
                  </span>
                  Reactive Support
                </div>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                  <li>Waits for ticket creation</li>
                  <li>No context between chats</li>
                  <li>Long response cycles</li>
                  <li>Agents overwhelmed</li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[--brand-primary]">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-[--brand-primary]/10 text-[--brand-primary]">
                    🤖
                  </span>
                  Advancelytics Support AI
                </div>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                  <li>Detects intent & emotion early</li>
                  <li>Auto‑suggests personalized solutions</li>
                  <li>Summarizes chat context instantly</li>
                  <li>Improves CSAT up to 28%</li>
                </ul>
                {/* soft animated glow */}
                <div className="pointer-events-none absolute -inset-px rounded-2xl animate-pulseGlow" />
              </div>
            </div>
          </div>

          {/* Animated Illustration: Routing & Deflection */}
          <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Routing &amp; Deflection</span>
              <span className="rounded-full bg-[--brand-primary]/10 px-2.5 py-1 text-[11px] font-semibold text-[--brand-primary]">
                Live demo
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Before column */}
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="mb-2 font-bold text-slate-800">Before</div>
                {[
                  "Manual triage & slow assignment",
                  "Agents answer repeat questions",
                ].map((t, i) => (
                  <div
                    key={t}
                    className="mt-2 flex items-center gap-2 text-xs text-slate-600 animate-floatIn"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    {t}
                  </div>
                ))}
              </div>

              {/* After column with animated ticket flow */}
              <div className="relative overflow-hidden rounded-xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-4">
                <div className="mb-2 font-bold text-[--brand-primary]">
                  After
                </div>

                {/* flowing chips */}
                <div className="space-y-2">
                  {[
                    { txt: "Auto‑tag: Billing → Refund", to: "Billing queue" },
                    { txt: "Auto‑tag: Technical → Login", to: "Auth queue" },
                    {
                      txt: "Answer: Verified KB — Refund policy",
                      to: "Deflected",
                    },
                  ].map((row, i) => (
                    <div
                      key={row.txt}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span
                        className="rounded-full border border-[--brand-primary]/20 bg-white px-2.5 py-1 font-medium text-[--brand-primary] animate-routeRight"
                        style={{ animationDelay: `${i * 0.25}s` }}
                      >
                        {row.txt}
                      </span>
                      <span className="text-slate-500">→</span>
                      <span
                        className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 animate-floatIn"
                        style={{ animationDelay: `${i * 0.25 + 0.15}s` }}
                      >
                        {row.to}
                      </span>
                    </div>
                  ))}
                </div>

                {/* progress */}
                <div className="mt-4 h-2 w-full rounded bg-white/60">
                  <div
                    className="h-2 rounded bg-[--brand-primary]"
                    style={{ width: "72%" }}
                  />
                </div>
                <div className="mt-2 text-right text-[11px] text-slate-500">
                  Deflection 33% • Correct routing ↑
                </div>

                {/* arrow accent */}
                <svg
                  className="pointer-events-none absolute -right-8 -top-6 hidden h-24 w-24 md:block"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#006BFF" stopOpacity="0.6" />
                      <stop
                        offset="100%"
                        stopColor="#0AE8F0"
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 80 C 40 70, 60 40, 90 30"
                    stroke="url(#g)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M85 28 l8 2 l-5 6"
                    stroke="url(#g)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Resolve smarter in 4 steps
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Detect, respond, learn, and optimize — automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Signal‑ready
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privacy‑aware
            </span>
          </div>
        </div>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
          {/* Left: Animated Stepper (Framer Motion stagger) */}
          <div className="space-y-4">
            {[
              {
                n: "1",
                t: "Detect & Classify",
                d: "Identifies customer mood, intent, and topic across channels.",
              },
              {
                n: "2",
                t: "Auto‑respond or Route",
                d: "Uses KB, macros, and prior tickets to answer or assign instantly.",
              },
              {
                n: "3",
                t: "Learn & Suggest",
                d: "Finds gaps, proposes new macros/articles, and improves prompts.",
              },
              {
                n: "4",
                t: "Monitor & Optimize",
                d: "Dashboards reveal deflection, sentiment shifts, and backlogs.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="group relative rounded-2xl border border-[--border-subtle] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {i < 3 && (
                  <div className="absolute left-6 top-[64px] hidden h-8 w-px bg-gradient-to-b from-[--border-subtle] to-transparent md:block" />
                )}
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {s.t}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                  </div>
                </div>
                <div className="mt-4 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-24" />
              </motion.div>
            ))}
          </div>

          {/* Right: Animated Illustration (looping) */}
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              {/* incoming intents */}
              <div className="min-h-[40px]">
                <AnimatePresence initial={false}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {rollingIntents.map((sig) => (
                      <motion.span
                        key={`${sig.k}-${tick}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                      >
                        {sig.k}
                      </motion.span>
                    ))}
                  </div>
                </AnimatePresence>
              </div>

              {/* auto-tag explanation */}
              <div className="mt-4 rounded-2xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  Auto‑tagged
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  Billing → Refund • Technical → Login • Product → Feature
                  request
                </div>
                <div className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]">
                  <AnimatePresence initial={false}>
                    {rollingActions.map((a) => (
                      <motion.button
                        key={`${a.txt}-${tick}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 font-medium text-[--brand-primary] hover:bg-[--brand-primary]/5"
                      >
                        {a.txt}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* progress bar (looping) */}
              <div className="mt-5 h-2 w-full rounded bg-[--surface-alt]">
                <motion.div
                  className="relative h-2 rounded bg-[--brand-primary]"
                  initial={{ width: 0 }}
                  animate={{ width: ["0%", "68%", "60%", "68%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 block rounded"
                    initial={{ backgroundPosition: "-200% 0" }}
                    animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                </motion.div>
              </div>
              <div className="mt-2 text-right text-xs text-slate-500">
                Deflection 33%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSIDE THE PROACTIVE BRAIN */}
      <section id="brain" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Inside the Proactive Brain
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Agentlytics reads behavior, not just text — engaging at the perfect
          moment with the perfect message.
        </p>

        {/* Circle process animation (Framer Motion) */}
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          {/* Left: cards with subtle motion */}
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                k: "I",
                t: "Intent Detection",
                d: "Tone & urgency detection to pick the right action.",
              },
              {
                k: "S",
                t: "Smart Prompts",
                d: "Suggests refund policy, billing settings, reset links and more.",
              },
              {
                k: "C",
                t: "Context Memory",
                d: "Understands history, channel, macros, and prior outcomes.",
              },
              {
                k: "L",
                t: "Lifecycle Aware",
                d: "Responds differently for new, active, or at‑risk customers.",
              },
            ].map((b, i) => (
              <motion.div
                key={b.k}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                className="rounded-2xl border border-[--border-subtle] bg-white p-6"
              >
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                  {b.k}
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {b.t}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{b.d}</p>
              </motion.div>
            ))}
          </div>

          {/* Right: animated circular illustration */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-72 w-72 sm:h-80 sm:w-80">
              {/* outer glow */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-2xl"
                aria-hidden
              />

              {/* rotating ring with orbiting nodes */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#006BFF"
                        stopOpacity="0.55"
                      />
                      <stop
                        offset="100%"
                        stopColor="#0AE8F0"
                        stopOpacity="0.55"
                      />
                    </linearGradient>
                  </defs>
                  {/* base ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E3EEFF"
                    strokeWidth="1.5"
                  />
                  {/* gradient arc */}
                  <path
                    d="M50 10 A40 40 0 1 1 49.99 10"
                    stroke="url(#ring)"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

                {/* four orbiting nodes positioned at cardinal points (rotate container spins them) */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-3 w-3 rounded-full bg-[--brand-primary] shadow-md" />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                  <div className="h-3 w-3 rounded-full bg-[--brand-primary] shadow-md" />
                </div>
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">
                  <div className="h-3 w-3 rounded-full bg-[--brand-primary] shadow-md" />
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="h-3 w-3 rounded-full bg-[--brand-primary] shadow-md" />
                </div>
              </motion.div>

              {/* static labels around the circle */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-12px] -translate-x-1/2 text-center text-[10px] font-semibold text-slate-700">
                  I • Intent
                </div>
                <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 text-center text-[10px] font-semibold text-slate-700">
                  S • Prompts
                </div>
                <div className="absolute left-1/2 bottom-[-12px] -translate-x-1/2 text-center text-[10px] font-semibold text-slate-700">
                  C • Context
                </div>
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 text-center text-[10px] font-semibold text-slate-700">
                  L • Lifecycle
                </div>
              </div>

              {/* center content that cycles with existing tick */}
              <div className="absolute inset-0 grid place-items-center">
                <AnimatePresence mode="wait">
                  {(() => {
                    const phases = [
                      {
                        k: "I",
                        t: "Intent Detection",
                        d: "Tone & urgency • channel",
                      },
                      { k: "S", t: "Smart Prompts", d: "Next best action" },
                      {
                        k: "C",
                        t: "Context Memory",
                        d: "History • macros • KB",
                      },
                      {
                        k: "L",
                        t: "Lifecycle Aware",
                        d: "New • active • at‑risk",
                      },
                    ];
                    const idx =
                      ((tick % phases.length) + phases.length) % phases.length;
                    const p = phases[idx];
                    return (
                      <motion.div
                        key={`${p.k}-${idx}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="rounded-2xl border border-[--border-subtle] bg-white/90 px-5 py-4 text-center shadow"
                      >
                        <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-[--brand-primary]/10 text-xs font-bold text-[--brand-primary]">
                          {p.k}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {p.t}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {p.d}
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Designed to scale support without losing the human touch.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Self‑service
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Context‑aware
            </span>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🕒",
              t: "24/7 Self‑Service Layer",
              d: "Answers routine queries instantly with verified content.",
            },
            {
              icon: "😊",
              t: "Sentiment Detection",
              d: "Prioritizes frustrated or at‑risk customers first.",
            },
            {
              icon: "🔎",
              t: "Contextual Search",
              d: "Pulls from KB, past chats, and macros for precise answers.",
            },
            {
              icon: "📝",
              t: "AI Summaries",
              d: "Generates clean ticket recaps for agents automatically.",
            },
            {
              icon: "🤝",
              t: "Smart Handoff",
              d: "Passes full context and transcript to humans when needed.",
            },
            {
              icon: "📈",
              t: "Resolution Analytics",
              d: "Tracks deflection, CSAT, response time, and backlog.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div
                className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(260px 140px at 20% 0%, ${brand.primary}22 0%, transparent 70%)`,
                }}
                aria-hidden
              />
              <div className="relative z-10 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[--brand-primary]/10 text-xl text-[--brand-primary]">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {f.t}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{f.d}</p>
                </div>
              </div>
              <div className="relative z-10 mt-5 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* OUTCOMES */}
      <section id="outcomes" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Customer support that compounds
        </h2>
        <div className="mt-6 grid grid-cols-4 gap-3 text-center sm:grid-cols-2 md:grid-cols-4">
          {[
            { k: "Response time", v: "−40%" },
            { k: "Ticket deflection", v: "+33%" },
            { k: "CSAT", v: "+27%" },
            { k: "Backlog", v: "−25%" },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded-lg border border-[--border-subtle] bg-[--surface] p-4"
            >
              <div className="text-[11px] text-slate-500">{m.k}</div>
              <div className="mt-1 text-lg font-bold text-slate-800">{m.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Loved by support and CX teams
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Real companies reducing response time and improving CSAT with
              Advancelytics Support AI.
            </p>
          </div>
          <div className="hidden md:block text-sm text-slate-500">
            CSAT ↑, backlog ↓
          </div>
        </div>

        {/* Logo row (placeholder badges) */}
        <div className="mt-6 flex flex-wrap items-center gap-3 opacity-80">
          {["Nexora", "Logibase", "Northwind", "Globex", "Innotech"].map(
            (l) => (
              <span
                key={l}
                className="rounded-lg border border-[--border-subtle] bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {l}
              </span>
            )
          )}
        </div>

        {/* Testimonial cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Riya Deshmukh",
              role: "CX Head, Nexora",
              inc: "−40% response time",
              quote:
                "We reduced repetitive queries by 40% and our customers now get help even before asking.",
            },
            {
              name: "Andrew Park",
              role: "Support Ops, Logibase",
              inc: "2–3 mins saved/ticket",
              quote:
                "AI summaries save 2–3 minutes per ticket. Multiply that by thousands — it’s a game‑changer.",
            },
            {
              name: "Maya Kapoor",
              role: "VP Success, Northwind",
              inc: "+29% CSAT",
              quote:
                "Deflection rose immediately and agents focus on the complex cases that matter.",
            },
          ].map((t, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div
                className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(260px 140px at 20% 0%, ${brand.primary}22 0%, transparent 70%)`,
                }}
              />
              <blockquote className="relative z-10 text-slate-800">
                <div
                  className="flex items-center gap-1 text-amber-500"
                  aria-label="rating"
                >
                  {"★★★★★"}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {t.quote}
                </p>
              </blockquote>
              <figcaption className="relative z-10 mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {t.inc}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6"
      >
        <h2 className="text-3xl font-bold">
          Empower your support with proactive intelligence
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          One AI that listens, learns, and acts — before your team even opens a
          ticket.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="#"
            className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            style={{ backgroundColor: brand.primary }}
          >
            Start Free
          </a>
          <a
            href="#"
            className="rounded-2xl border border-[--brand-primary] px-6 py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = brand.primary)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            See Pricing
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day free trial · No credit card required
        </p>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-[--border-subtle] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} Advancelytics. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-slate-700">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-700">
                Terms
              </a>
              <a href="#" className="hover:text-slate-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
