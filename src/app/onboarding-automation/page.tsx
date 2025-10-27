"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// If you are on Next.js, add this inside your page <Head> tag:
// <meta name="keywords" content="AI onboarding automation, SaaS activation software, customer onboarding AI, Advancelytics" />

// Advancelytics — Solution: Onboarding Automation (Full Page, 9 sections)
// Updates applied per request:
// 1) Short hero subheadline with numeric impact
// 2) Consistent CTA copy (hero & footer): "Start Free Trial — guide users faster"
// 3) Micro‑interaction: subtle shimmer/typing pulse on primary CTA
// 4) StoryBrand 3‑step plan (Connect → Guide → Activate) before testimonials
// 5) Trust logos row under testimonials (CloudScale, FinServe, DevSuite)
// 6) Accessibility: slightly darkened blue + hover:brightness‑90

const brand = {
  primary: "#006BFF", // Calendly-like blue
  accent: "#0AE8F0", // Bright turquoise
  surface: "#F7FBFF", // Light hero/card
  surfaceAlt: "#F5F9FF",
  borderSubtle: "#E3EEFF",
};

export default function OnboardingAutomationPage() {
  const [tick, setTick] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  // Small looping content used in illustrations
  const heroChips = useMemo(
    () => ["Invite team", "Connect Slack", "Import data"],
    []
  );
  const flowSignals = useMemo(
    () => [
      { k: "Role: Admin" },
      { k: "Plan: Pro" },
      { k: "Goal: Automations" },
      { k: "Industry: SaaS" },
    ],
    []
  );
  const flowActions = useMemo(
    () => [
      { txt: "Guide: Invite team" },
      { txt: "Explain: Permissions" },
      { txt: "Setup: Integrations" },
      { txt: "Tour: Workflows" },
    ],
    []
  );

  const brainPhases = [
    {
      k: "C",
      t: "Context Awareness",
      d: "Understands role, plan, and previous activity.",
    },
    { k: "P", t: "Personalization", d: "Adapts steps to goals and industry." },
    {
      k: "A",
      t: "Adaptive Prompts",
      d: "Explains the ‘why’ behind each step in plain language.",
    },
    {
      k: "O",
      t: "Optimization",
      d: "Detects friction and improves paths over time.",
    },
  ];

  // 🔎 Lightweight smoke tests (dev-only) to catch future regressions
  useEffect(() => {
    try {
      console.assert(
        Array.isArray(heroChips) && heroChips.length === 3,
        "heroChips should have 3 items"
      );
      console.assert(
        Array.isArray(flowSignals) && flowSignals.length === 4,
        "flowSignals should have 4 items"
      );
      console.assert(
        Array.isArray(flowActions) && flowActions.length === 4,
        "flowActions should have 4 items"
      );
      console.assert(
        Array.isArray(brainPhases) && brainPhases.length === 4,
        "brainPhases should have 4 items"
      );
    } catch (_) {
      // no-op in production
    }
  }, [heroChips, flowSignals, flowActions, brainPhases]);

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
              From Static Checklists to Conversational Onboarding
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
              Turn setup into success —{" "}
              <span className="font-semibold text-slate-800">
                65% faster activation
              </span>
              ,{" "}
              <span className="font-semibold text-slate-800">
                40% fewer tickets
              </span>
              .
            </p>
            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              <motion.a
                href="#cta"
                className="relative overflow-hidden rounded-2xl bg-[#004FCC] px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-90 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003BB5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
              >
                {/* shimmer layer */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.25) 30%, transparent 60%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{
                    backgroundPosition: prefersReducedMotion
                      ? "0% 0%"
                      : ["200% 0%", "-200% 0%"],
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 2.2,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10">
                  Start Free Trial — guide users faster
                </span>
              </motion.a>
              <a
                href="#demo"
                className="rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition hover:bg-[#004FCC] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                See It in Action
              </a>
            </div>
          </div>

          {/* Right: Animated Chat Illustration */}
          <div className="relative mx-auto h-[380px] w-full max-w-[540px]">
            {/* soft glow background */}
            <div
              className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-2xl"
              aria-hidden
            />
            <div className="relative h-full w-full rounded-[32px] border border-[--border-subtle] bg-white p-5 shadow-xl">
              {/* user question bubble */}
              <motion.div
                className="absolute left-5 top-5 right-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-[--brand-primary]/10" />
                  <div className="max-w-[75%] rounded-2xl border border-[--border-subtle] bg-[--surface] p-3 text-sm text-slate-800">
                    Why do I need to invite my team before setting up workflows?
                  </div>
                </div>
              </motion.div>

              {/* AI answer bubble */}
              <motion.div
                className="absolute left-5 right-5 top-28"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              >
                <div className="ml-11 max-w-[78%] rounded-2xl border border-[--border-subtle] bg-white p-3 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Advancelytics
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    Inviting teammates first gives them access and roles so your
                    workflow assignments sync correctly. Want help sending
                    invites?
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {heroChips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* typing indicator */}
              <motion.div
                className="absolute bottom-24 left-5 right-5"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-[--brand-primary]/10" />
                  <div className="max-w-[70%] rounded-2xl border border-[--border-subtle] bg-[--surface] p-3">
                    <div className="flex items-center gap-1">
                      <span className="sr-only">typing</span>
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
                          animate={{ y: prefersReducedMotion ? 0 : [0, -3, 0] }}
                          transition={{
                            repeat: prefersReducedMotion ? 0 : Infinity,
                            duration: 0.9,
                            delay: d * 0.15,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* bottom progress / CTA bar */}
              <motion.div
                className="absolute bottom-5 left-5 right-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between rounded-2xl border border-[--border-subtle] bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    Step 1 of 4 • Verified
                  </div>
                  <button className="rounded-2xl bg-[#004FCC] px-3 py-2 text-xs font-semibold text-white hover:brightness-90">
                    Continue
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) WHY TRADITIONAL FAILS */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Left: Copy with better visual bullets */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why traditional onboarding fails
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Static steps cause confusion and drop‑offs. Users need guidance,
              context, and the ability to ask questions in the moment.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Same flow for everyone, regardless of goals",
                "No in‑flow help → tickets spike, time‑to‑value increases",
                "CSMs repeat the same instructions",
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

          {/* Right: Animated Illustration — Static vs AI‑Led */}
          <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Static vs AI‑Led
              </div>
              {/* subtle toggle purely visual */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Static</span>
                <span className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200">
                  <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow" />
                </span>
                <span className="text-slate-900 font-semibold">AI‑Led</span>
              </div>
            </div>

            {/* Two columns: left static list, right ai‑led list */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 text-sm">
                {[
                  "One‑size‑fits‑all steps",
                  "No help mid‑step",
                  "Tickets escalate later",
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                  >
                    <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[10px] text-rose-600 ring-1 ring-rose-200">
                      –
                    </span>
                    <span className="text-slate-800">{t}</span>
                  </div>
                ))}

                {/* animated drop‑off bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Completion</span>
                    <span>38%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-100">
                    <motion.div
                      className="h-2 rounded bg-rose-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: "38%" }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  "Path adapts to role and goal",
                  "Explains the ‘why’ at each field",
                  "Resolves questions in‑flow",
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

                {/* animated improvement bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Completion</span>
                    <span>81%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-[--surface-alt]">
                    <motion.div
                      className="relative h-2 rounded bg-[--brand-primary]"
                      initial={{ width: 0 }}
                      whileInView={{ width: "81%" }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    >
                      <motion.span
                        className="absolute inset-0 block rounded"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                          backgroundSize: "200% 100%",
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Animated overlay arrows to imply motion from left → right */}
            <div className="pointer-events-none mt-6 grid grid-cols-2 gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <motion.span
                  initial={{ x: 0, opacity: 0 }}
                  whileInView={{ x: 6, opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  →
                </motion.span>
                <span>Drop‑off</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span>Guided progress</span>
                <motion.span
                  initial={{ x: 0, opacity: 0 }}
                  whileInView={{ x: -6, opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  →
                </motion.span>
              </div>
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
              Detect, guide, assist, and optimize — all automatically.
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
          {/* Steps */}
          <div className="space-y-4">
            {[
              {
                n: "1",
                t: "Detect & Personalize",
                d: "Reads role, plan, and behavior to tailor the path.",
              },
              {
                n: "2",
                t: "Guide & Explain",
                d: "Conversational coaching explains why each step matters.",
              },
              {
                n: "3",
                t: "Assist & Clarify",
                d: "In‑flow Q&A resolves blockers instantly.",
              },
              {
                n: "4",
                t: "Track & Optimize",
                d: "Analytics reveal drop‑offs; flows improve over time.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: i * 0.12,
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="group relative rounded-2xl border border-[--border-subtle] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
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

          {/* Right: Animated flow card */}
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="min-h-[40px]">
                <AnimatePresence initial={false}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {flowSignals
                      .slice(tick % flowSignals.length)
                      .concat(flowSignals.slice(0, tick % flowSignals.length))
                      .slice(0, 3)
                      .map((sig, i) => (
                        <motion.span
                          key={`${sig.k}-${i}-${tick}`}
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

              <div className="mt-4 rounded-2xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  Next Best Actions
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  Invite team • Set roles • Connect Slack
                </div>
                <div className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]">
                  <AnimatePresence initial={false}>
                    {flowActions
                      .slice(tick % flowActions.length)
                      .concat(flowActions.slice(0, tick % flowActions.length))
                      .slice(0, 3)
                      .map((a, i) => (
                        <motion.button
                          key={`${a.txt}-${i}-${tick}`}
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

              <div className="mt-5 h-2 w-full rounded bg-[--surface-alt]">
                <motion.div
                  className="relative h-2 rounded bg-[--brand-primary]"
                  initial={{ width: 0 }}
                  animate={{
                    width: prefersReducedMotion
                      ? "72%"
                      : ["0%", "72%", "64%", "72%"],
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 2.2,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.span
                    className="absolute inset-0 block rounded"
                    initial={{ backgroundPosition: "-200% 0" }}
                    animate={{
                      backgroundPosition: prefersReducedMotion
                        ? "0% 0"
                        : ["-200% 0", "200% 0"],
                    }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 1.8,
                      repeat: prefersReducedMotion ? 0 : Infinity,
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
                Activation progress ↑
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4) INSIDE THE ONBOARDING BRAIN */}
      <section
        id="brain"
        className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6"
      >
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Inside the Onboarding Brain
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Context • Personalization • Adaptive prompts • Optimization
        </p>

        <div className="mt-14 grid items-center gap-14 lg:grid-cols-2">
          {/* Left Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {brainPhases.map((b, i) => (
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

          {/* Right: ring spins once on reveal, again on hover */}
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
                    <linearGradient id="brainRing" x1="0" y1="0" x2="1" y2="1">
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
                    stroke="url(#brainRing)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                {[0, 90, 180, 270].map((angle, i) => (
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
                    const p = brainPhases[tick % brainPhases.length];
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
          Purpose‑built to guide users to value — faster.
        </p>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              i: "🎯",
              t: "Guided Setup Flows",
              d: "Convert static forms into interactive steps.",
            },
            {
              i: "🧩",
              t: "Role‑Based Journeys",
              d: "Tailor paths by role, goal, or plan.",
            },
            {
              i: "💬",
              t: "In‑Flow Q&A",
              d: "Explain every field and action in plain language.",
            },
            {
              i: "⚡",
              t: "Smart Nudges",
              d: "Detect hesitation and prompt help.",
            },
            {
              i: "📊",
              t: "Progress Analytics",
              d: "Track completion, time‑to‑value, and drop‑offs.",
            },
            {
              i: "🔁",
              t: "Continuous Learning",
              d: "Improve flows using real usage data.",
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

      {/* 5.5) STORYBRAND 3‑STEP PLAN */}
      <section id="plan" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Get started in 3 simple steps
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Connect → Guide → Activate
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              i: "🔗",
              t: "Connect",
              d: "Drop the snippet and connect tools you already use.",
            },
            {
              i: "👟",
              t: "Guide",
              d: "Conversational flows explain the ‘why’ and coach users inline.",
            },
            {
              i: "🚀",
              t: "Activate",
              d: "Watch activation speed rise and tickets fall.",
            },
          ].map((s, idx) => (
            <motion.div
              key={s.t}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              className="rounded-2xl border border-[--border-subtle] bg-white p-6 text-center shadow-sm"
            >
              <div className="text-3xl" aria-hidden>
                {s.i}
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">
                {s.t}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6) REAL IMPACT */}
      <section id="impact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Real Impact — Faster Activation
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Activation speed", v: "+65%" },
            { k: "Feature adoption", v: "2.8×" },
            { k: "Onboarding tickets", v: "−42%" },
            { k: "Setup completion", v: "+33%" },
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
          CS and Product teams accelerate activation and reduce tickets.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Alicia Gomez",
              role: "Product Manager, CloudScale",
              inc: "14→5 days",
              quote:
                "Our onboarding time dropped from 14 days to 5 — users finish in one sitting.",
            },
            {
              name: "Rahul Mehta",
              role: "CX Lead, FinServe",
              inc: "+29% completion",
              quote:
                "Explaining the ‘why’ at each step removed confusion and increased completion.",
            },
            {
              name: "Erin Park",
              role: "Head of CS, DevSuite",
              inc: "−38% tickets",
              quote:
                "In‑flow Q&A killed repetitive ‘how do I…’ tickets. CS focuses on value now.",
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

        {/* Trust Logos Row (grayscale for subtlety) */}
        <div className="mt-10 border-t border-[--border-subtle] pt-8">
          <p className="text-center text-xs font-semibold tracking-wide text-slate-500">
            TRUSTED BY GTM TEAMS AT
          </p>
          <div className="mt-4 grid grid-cols-3 items-center gap-6 sm:gap-10">
            {["CloudScale", "FinServe", "DevSuite"].map((logo) => (
              <div
                key={logo}
                className="mx-auto h-8 w-36 rounded-lg border border-[--border-subtle] bg-white/60 grayscale [filter:grayscale(100%)] flex items-center justify-center text-sm font-semibold text-slate-400"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6"
      >
        <h2 className="text-3xl font-bold">
          Make Every Onboarding Interactive
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Guide users like a human — automatically.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <motion.a
            href="#"
            className="relative overflow-hidden rounded-2xl bg-[#004FCC] px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-90 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003BB5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
          >
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.25) 30%, transparent 60%)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                backgroundPosition: prefersReducedMotion
                  ? "0% 0%"
                  : ["200% 0%", "-200% 0%"],
              }}
              transition={{
                duration: prefersReducedMotion ? 0 : 2.2,
                repeat: prefersReducedMotion ? 0 : Infinity,
                ease: "linear",
              }}
            />
            <span className="relative z-10">
              Start Free Trial — guide users faster
            </span>
          </motion.a>
          <a
            href="#"
            className="rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition hover:bg-[#004FCC] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Request Demo
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day free trial · No credit card required
        </p>
      </section>
    </div>
  );
}
