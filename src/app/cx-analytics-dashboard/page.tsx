"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Advancelytics — Solution: CX Analytics Dashboard (Full Page, 8 sections)
// Calendly-style palette, accessible CTAs, modern motion. Animated dashboard hero.

const brand = {
  primary: "#006BFF", // Calendly blue
  accent: "#0AE8F0", // Bright turquoise
  surface: "#F7FBFF", // Light hero/card
  surfaceAlt: "#F5F9FF",
  borderSubtle: "#E3EEFF",
};

export default function CxAnalyticsDashboardPage() {
  const [tick, setTick] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  const heroStats = useMemo(
    () => [
      { k: "Insights generated", v: 324 },
      { k: "Deflection", v: "27%" },
      { k: "CSAT", v: "4.7/5" },
    ],
    []
  );

  const enginePhases = [
    { k: "S", t: "Sentiment Flow", d: "Emotion shifts by journey stage." },
    { k: "R", t: "Resolution Score", d: "Quality, empathy, and clarity." },
    { k: "I", t: "Intent Clusters", d: "Auto-grouped topics and themes." },
    { k: "C", t: "CSAT Correlation", d: "Link tone with satisfaction." },
    { k: "H", t: "Churn Risk", d: "Language cues that signal risk." },
  ];

  return (
    <div
      className="relative min-h-screen w-full text-slate-900"
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
      {/* 1) HERO */}
      <section className="relative isolate rounded-b-[2rem] bg-[--surface] px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:mx-0">
              Turn Every Conversation into Actionable Insight
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
              Advancelytics transforms your chat, email, and support data into a
              unified view of sentiment, resolution quality, and intent trends —
              so you can coach smarter, prioritize better, and grow faster.
            </p>
            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              <a
                href="#live"
                className="rounded-2xl bg-[#004FCC] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#003BB5] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003BB5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                See Live Dashboard
              </a>
              <a
                href="#cta"
                className="rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition hover:bg-[#004FCC] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Request Demo
              </a>
            </div>
          </div>

          {/* Right: Animated Dashboard Illustration */}
          <div className="relative mx-auto h-[420px] w-full max-w-[560px]">
            {/* soft glow */}
            <div
              className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-2xl"
              aria-hidden
            />
            <div className="relative h-full w-full rounded-[32px] border border-[--border-subtle] bg-white p-5 shadow-xl">
              {/* Stat chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                {heroStats.map((s, i) => (
                  <motion.span
                    key={s.k}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                  >
                    {s.k}: <span className="font-semibold">{s.v}</span>
                  </motion.span>
                ))}
              </div>

              {/* Card: Sentiment gauge + rating bars */}
              <motion.div
                className="mt-4 grid gap-4 sm:grid-cols-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="rounded-2xl border border-[--border-subtle] p-4">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Sentiment
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <svg viewBox="0 0 36 18" className="h-14 w-28">
                      <defs>
                        <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="50%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M2,16 A16,16 0 0 1 34,16"
                        fill="none"
                        stroke="#E3EEFF"
                        strokeWidth="3"
                      />
                      <motion.path
                        d="M2,16 A16,16 0 0 1 34,16"
                        fill="none"
                        stroke="url(#gauge)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="50"
                        strokeDashoffset="50"
                        animate={{
                          strokeDashoffset: prefersReducedMotion
                            ? 8
                            : [50, 8, 14, 8],
                        }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 2.2,
                          repeat: prefersReducedMotion ? 0 : Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        Positive
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Last 7 days
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[--border-subtle] p-4">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Chat Ratings
                  </div>
                  {[
                    { k: "Response", v: 82 },
                    { k: "Empathy", v: 76 },
                    { k: "Clarity", v: 88 },
                  ].map((r, i) => (
                    <div key={r.k} className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{r.k}</span>
                        <span>{r.v}%</span>
                      </div>
                      <div className="h-2 w-full rounded bg-[--surface-alt]">
                        <motion.div
                          className="h-2 rounded bg-[--brand-primary]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${r.v}%` }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{
                            duration: 0.6 + i * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Card: Resolution trend (sparkline) + insight chip */}
              <motion.div
                className="mt-4 rounded-2xl border border-[--border-subtle] p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Resolution Trend
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    +12% this week
                  </span>
                </div>
                <svg viewBox="0 0 100 28" className="mt-2 h-14 w-full">
                  <polyline
                    points="0,20 10,22 20,18 30,17 40,15 50,16 60,14 70,12 80,13 90,11 100,10"
                    fill="none"
                    stroke="#E3EEFF"
                    strokeWidth="2"
                  />
                  <motion.polyline
                    points="0,20 10,22 20,18 30,17 40,15 50,16 60,14 70,12 80,13 90,11 100,10"
                    fill="none"
                    stroke={brand.primary}
                    strokeWidth="2"
                    strokeDasharray="140"
                    strokeDashoffset="140"
                    animate={{
                      strokeDashoffset: prefersReducedMotion ? 0 : [140, 0],
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 1.8,
                      ease: "easeOut",
                    }}
                  />
                </svg>
                <div className="mt-1 text-[11px] text-slate-500">
                  Automatic scoring across chats, emails, and tickets.
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) WHY IT MATTERS */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why it matters
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Raw transcripts contain the voice of your customer — but
              traditional reporting only shows numbers, not narratives.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Disconnected tools and manual tagging",
                "Surface metrics, no qualitative insights",
                "Hidden churn signals and burnout patterns",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                    ✕
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: AI advantage card */}
          <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                AI‑Driven Advantage
              </div>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                "Unified sentiment + topic correlation",
                "Automated resolution scoring across chats",
                "Trend detection for intent, tone, and risk",
                "Voice‑of‑customer themes for Product",
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                >
                  <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                    ✓
                  </span>
                  <span className="text-slate-800">{t}</span>
                </div>
              ))}
            </div>
            <div className="pointer-events-none mt-6 text-[11px] text-slate-500">
              “Teams spend hours compiling what Advancelytics detects in
              seconds.”
            </div>
          </div>
        </div>
      </section>

      {/* 3) HOW IT WORKS */}
      <section
        id="how"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Aggregate, analyze, visualize, and recommend — automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Multi‑channel
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privacy‑aware
            </span>
          </div>
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* Steps timeline */}
          <div className="relative">
            <div
              className="absolute left-5 top-0 bottom-0 hidden w-[2px] bg-gradient-to-b from-[--brand-primary]/30 via-[--brand-accent]/30 to-transparent lg:block"
              aria-hidden
            />
            {[
              {
                n: "1",
                t: "Aggregate Data Sources",
                d: "Chat, email, CSAT, CRM.",
              },
              {
                n: "2",
                t: "Analyze & Classify",
                d: "Sentiment, topic, and agent context.",
              },
              {
                n: "3",
                t: "Visualize Trends",
                d: "Dynamic dashboards for every team.",
              },
              {
                n: "4",
                t: "Recommend Actions",
                d: "Coaching, content, or workflow fixes.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="group relative pl-14"
              >
                <div className="absolute left-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                  {s.n}
                </div>
                <div className="rounded-2xl border border-[--border-subtle] bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {s.t}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                    </div>
                    <motion.span
                      aria-hidden
                      className="hidden h-2 w-2 rounded-full bg-[--brand-primary] lg:block"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.25 }}
                    />
                  </div>
                  <div className="mt-4 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-24" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Live dashboard flow card */}
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Intent clusters */}
                <div className="rounded-2xl border border-[--border-subtle] p-4">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Intent Clusters
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {[
                      "Billing",
                      "Login",
                      "Refunds",
                      "Integrations",
                      "Shipping",
                    ].map((c, i) => (
                      <motion.span
                        key={c}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 * i }}
                        className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                      >
                        {c}
                      </motion.span>
                    ))}
                  </div>
                </div>
                {/* Coaching suggestions */}
                <div className="rounded-2xl border border-[--border-subtle] p-4">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Coaching Suggestions
                  </div>
                  <ul className="mt-2 space-y-2 text-sm">
                    {[
                      "Clarify return window in macro",
                      "Add KB: SSO renewal steps",
                      "Nudge: follow-up empathy phrase",
                    ].map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 * i }}
                        className="flex items-start gap-2"
                      >
                        <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                          ✓
                        </span>
                        <span className="text-slate-800">{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                {/* CSAT correlation mini-chart */}
                <div className="rounded-2xl border border-[--border-subtle] p-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-500">
                      CSAT Correlation
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      91% accuracy
                    </span>
                  </div>
                  <svg viewBox="0 0 100 28" className="mt-2 h-14 w-full">
                    <polyline
                      points="0,18 20,16 40,14 60,12 80,10 100,8"
                      fill="none"
                      stroke="#E3EEFF"
                      strokeWidth="2"
                    />
                    <motion.polyline
                      points="0,18 20,16 40,14 60,12 80,10 100,8"
                      fill="none"
                      stroke={brand.primary}
                      strokeWidth="2"
                      strokeDasharray="140"
                      strokeDashoffset="140"
                      animate={{
                        strokeDashoffset: prefersReducedMotion ? 0 : [140, 0],
                      }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 1.6,
                        ease: "easeOut",
                      }}
                    />
                  </svg>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Higher clarity and empathy align with better CSAT.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4) INSIDE THE ANALYTICS ENGINE */}
      <section
        id="engine"
        className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6"
      >
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Inside the Analytics Engine
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Sentiment • Resolution • Intent • CSAT • Risk
        </p>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
          {/* Left: Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {enginePhases.map((b, i) => (
              <motion.div
                key={b.k}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm hover:shadow-md"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                  {b.k}
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {b.t}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{b.d}</p>
              </motion.div>
            ))}
          </div>

          {/* Right: rotating ring with nodes */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-80 w-80 sm:h-96 sm:w-96">
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-2xl"
                aria-hidden
              />
              <motion.div
                className="absolute inset-0"
                initial={{ rotate: 0 }}
                whileInView={prefersReducedMotion ? {} : { rotate: 360 }}
                whileHover={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 8,
                  ease: "linear",
                }}
                viewport={{ once: true, amount: 0.6 }}
              >
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <defs>
                    <linearGradient id="engineRing" x1="0" y1="0" x2="1" y2="1">
                      <stop
                        offset="0%"
                        stopColor={brand.primary}
                        stopOpacity="0.6"
                      />
                      <stop
                        offset="100%"
                        stopColor={brand.accent}
                        stopOpacity="0.6"
                      />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E3EEFF"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M50 10 A40 40 0 1 1 49.99 10"
                    stroke="url(#engineRing)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `rotate(${angle}deg) translate(50px) rotate(-${angle}deg)`,
                    }}
                  >
                    <div className="h-3 w-3 rounded-full bg-[--brand-primary] shadow-md" />
                  </div>
                ))}
              </motion.div>

              {/* Center cycling card */}
              <div className="absolute inset-0 grid place-items-center">
                <AnimatePresence mode="wait">
                  {(() => {
                    const p = enginePhases[tick % enginePhases.length];
                    return (
                      <motion.div
                        key={`${p.k}-${tick}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="rounded-2xl border border-[--border-subtle] bg-white/90 px-5 py-4 text-center shadow-sm"
                      >
                        <div className="mx-auto mb-1 grid h-8 w-8 place-items-center rounded-lg bg-[--brand-primary]/10 text-xs font-bold text-[--brand-primary]">
                          {p.k}
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {p.t}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-600">
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

      {/* 5) KEY FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6"
      >
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Key Features
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Unified analytics that coach teams and guide decisions.
        </p>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              i: "📊",
              t: "Unified Dashboard",
              d: "All channels, one analytics view.",
            },
            {
              i: "🤖",
              t: "AI‑Scored Chats",
              d: "Real‑time quality & empathy evaluation.",
            },
            {
              i: "🧭",
              t: "Intent Tracking",
              d: "Identify top recurring issues and requests.",
            },
            {
              i: "🪄",
              t: "Auto‑Coaching",
              d: "Pinpoint skill gaps by conversation type.",
            },
            { i: "💡", t: "VoC Feed", d: "Extract themes & feature requests." },
            {
              i: "⚙️",
              t: "Custom Reports",
              d: "Export for leadership, CS, and product teams.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm"
            >
              <div className="text-2xl">{f.i}</div>
              <h3 className="mt-2 font-semibold text-slate-900">{f.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6) REAL IMPACT */}
      <section id="impact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Real Impact — Measurable Improvements
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Response quality", v: "+38%" },
            { k: "CSAT correlation", v: "91%" },
            { k: "Coaching time saved", v: "−52%" },
            { k: "Churn precision", v: "88%" },
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

      {/* 7) TESTIMONIALS */}
      <section
        id="testimonials"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6"
      >
        <h2 className="text-3xl font-bold tracking-tight text-center">
          What Teams Are Saying
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Coach with data, not guesswork.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Priya Shah",
              role: "CX Director, CloudOps",
              inc: "+31% CSAT",
              quote:
                "Our dashboards finally connect empathy and efficiency. We found patterns no spreadsheet ever showed.",
            },
            {
              name: "Marco Silva",
              role: "Head of Support, RetailTech",
              inc: "−44% coaching time",
              quote: "We coach with data now — not guesswork.",
            },
            {
              name: "Jade Nguyen",
              role: "Product Lead, FinServe",
              inc: "+18% deflection",
              quote: "Intent trends directly informed our roadmap and macros.",
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

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6"
      >
        <h2 className="text-3xl font-bold">
          See What Your Conversations Reveal
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Unlock patterns, coaching insights, and sentiment trends hidden in
          your chat history.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="#"
            className="rounded-2xl bg-[#004FCC] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#003BB5] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003BB5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Start Free Trial
          </a>
          <a
            href="#"
            className="rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition hover:bg-[#004FCC] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            View Demo
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day free trial · No credit card required
        </p>
      </section>
    </div>
  );
}
