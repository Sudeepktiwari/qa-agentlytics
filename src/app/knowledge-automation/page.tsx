"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Advancelytics — Solution: Knowledge Automation (Full Page, 8 sections)
// Calendly-style palette, accessible CTAs, modern motion. Chat/doc-sorting hero.

const brand = {
  primary: "#006BFF", // Calendly blue
  accent: "#0AE8F0", // Bright turquoise
  surface: "#F7FBFF", // Light hero/card
  surfaceAlt: "#F5F9FF",
  borderSubtle: "#E3EEFF",
};

export default function KnowledgeAutomationPage() {
  const [tick, setTick] = useState(0);
  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Smooth-scroll + close handler
  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const href = (e.currentTarget.getAttribute("href") || "").trim();
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.slice(1);
      let el = document.getElementById(id);
      if (!el && id === "demo") {
        el = document.getElementById("cta");
      }
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        try {
          history.replaceState(null, "", `#${id}`);
        } catch {}
      }
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  // Small looping content used in illustrations
  const heroChips = useMemo(
    () => ["Open Article", "Share in Chat", "Create Macro"],
    []
  );
  const ingestSources = useMemo(
    () => [
      { k: "PDFs" },
      { k: "FAQs" },
      { k: "Chat logs" },
      { k: "Confluence" },
      { k: "Zendesk" },
    ],
    []
  );
  const categories = useMemo(
    () => [
      { k: "Security" },
      { k: "Billing" },
      { k: "Setup" },
      { k: "Integrations" },
      { k: "Policies" },
    ],
    []
  );

  const brainPhases = [
    {
      k: "I",
      t: "Intent Detection",
      d: "Understands what users mean, not just keywords.",
    },
    {
      k: "A",
      t: "Auto‑Tagging",
      d: "Classifies by topic, entity, and product area.",
    },
    {
      k: "S",
      t: "Synonym Mapping",
      d: "‘SSO’ ↔ ‘Single sign‑on’, ‘Sign in with Okta’.",
    },
    {
      k: "I2",
      t: "Insights Loop",
      d: "Finds gaps, flags duplicates, and suggests updates.",
    },
  ];

  return (
    <div
      className="relative min-h-screen w-full text-slate-900 scroll-smooth overflow-x-hidden"
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
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[--brand-primary]" />
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Knowledge Automation
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
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
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg md:inline-block"
              style={{ backgroundColor: brand.primary }}
            >
              Start free
            </a>
            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen ? "true" : "false"}
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {menuOpen ? (
                  <g>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </g>
                ) : (
                  <g>
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </g>
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu panel */}
          <div
            id="mobile-menu"
            aria-hidden={!menuOpen}
            className={`md:hidden absolute right-0 top-full z-50 w-[60vw] bg-white rounded-b-2xl shadow-lg origin-top-right transform transition-all duration-300 ease-out ${
              menuOpen
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
            }`}
          >
            <nav className="mx-auto px-4 py-3 sm:px-6">
              <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <a
                  href="#why"
                  className="py-2 hover:text-slate-900"
                  onClick={handleMobileNavClick}
                >
                  Why
                </a>
                <a
                  href="#how"
                  className="py-2 hover:text-slate-900"
                  onClick={handleMobileNavClick}
                >
                  How it works
                </a>
                <a
                  href="#features"
                  className="py-2 hover:text-slate-900"
                  onClick={handleMobileNavClick}
                >
                  Features
                </a>
                <a
                  href="#cta"
                  className="py-2 hover:text-slate-900"
                  onClick={handleMobileNavClick}
                >
                  Pricing
                </a>
                <a
                  href="#demo"
                  className="mt-2 w-full rounded-xl border border-[--border-subtle] px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-[--surface]"
                  onClick={handleMobileNavClick}
                >
                  Watch demo
                </a>
                <a
                  href="#cta"
                  className="inline-flex w-full items-center justify-center rounded-2xl px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  style={{ backgroundColor: brand.primary }}
                  onClick={handleMobileNavClick}
                >
                  Start free
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Backdrop overlay — outside header for proper stacking */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* 1) HERO */}
      <section className="relative isolate rounded-b-[2rem] bg-[--surface] px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:mx-0">
              From Chaos to Clarity — Automate Your Knowledge Base
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
              Advancelytics ingests your docs, tags them intelligently, and
              surfaces the right answer across chat, help center, and product —
              automatically.
            </p>
            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              <a
                href="#how"
                className="rounded-2xl bg-[#004FCC] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#003BB5] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003BB5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                See How It Works
              </a>
              <a
                href="#cta"
                className="rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition hover:bg-[#004FCC] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Request Demo
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Works with Zendesk • Intercom • Confluence • Notion
            </p>
          </div>

          {/* Right: Animated Chat + Doc Sorting Illustration */}
          <div className="relative mx-auto h-[400px] w-full max-w-[560px]">
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
                    How do I set up SSO with Okta?
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
                    I found a verified article in{" "}
                    <span className="font-medium">Security › SSO</span>. Want to
                    open it or share in chat?
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

              {/* doc ingest icons → sorted categories */}
              <motion.div
                className="absolute left-5 right-5 bottom-24"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
              >
                <div className="grid grid-cols-5 gap-2 text-[11px]">
                  {/* ingest */}
                  <div className="col-span-2 rounded-2xl border border-[--border-subtle] bg-[--surface] p-3">
                    <div className="mb-1 font-semibold text-slate-600">
                      Ingest
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ingestSources.map((s, i) => (
                        <motion.span
                          key={s.k}
                          className="rounded-md border border-[--border-subtle] bg-white px-2 py-1"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                        >
                          {s.k}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  {/* arrow */}
                  <div className="grid place-items-center text-slate-400">
                    →
                  </div>
                  {/* categories */}
                  <div className="col-span-2 rounded-2xl border border-[--border-subtle] bg-[--surface] p-3">
                    <div className="mb-1 font-semibold text-slate-600">
                      Categories
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {categories.map((c, i) => (
                        <motion.span
                          key={c.k}
                          className="rounded-md border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2 py-1 text-[--brand-primary]"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                        >
                          {c.k}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* bottom CTA bar */}
              <motion.div
                className="absolute bottom-5 left-5 right-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between rounded-2xl border border-[--border-subtle] bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    Verified answer ready
                  </div>
                  <button className="rounded-2xl bg-[#004FCC] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003BB5]">
                    Open Article
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) WHY MANUAL KNOWLEDGE FAILS */}
      <section
        id="why"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      >
        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* Left copy */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why manual knowledge bases fail
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Static knowledge bases decay without constant tagging and cleanup.
              Duplicates creep in, search is keyword‑only, and agents can’t find
              what already exists.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "One‑size‑fits‑all tags — no intent understanding",
                "Duplicates & drift across chat, portal, docs",
                "No signal on what’s missing until tickets spike",
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

          {/* Right: Animated Static vs AI‑Led card */}
          <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Static vs AI‑Led
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Static</span>
                <span className="relative inline-flex h-5 w-10 items-center rounded-full bg-slate-200">
                  <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow" />
                </span>
                <span className="font-semibold text-slate-900">AI‑Led</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 text-sm">
                {["Outdated tags", "Poor discovery", "Repetitive answers"].map(
                  (t, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                    >
                      <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-50 text-[10px] text-rose-600 ring-1 ring-rose-200">
                        –
                      </span>
                      <span className="text-slate-800">{t}</span>
                    </div>
                  )
                )}
                {/* animated drop‑off bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Answer found</span>
                    <span>55%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-100">
                    <motion.div
                      className="h-2 rounded bg-rose-400"
                      initial={{ width: 0 }}
                      whileInView={{ width: "55%" }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {["Auto‑tagged", "Intent‑aware search", "Gap insights"].map(
                  (t, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                    >
                      <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-[10px] text-emerald-700 ring-1 ring-emerald-200">
                        ✓
                      </span>
                      <span className="text-slate-800">{t}</span>
                    </div>
                  )
                )}
                {/* animated improvement bar */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Answer found</span>
                    <span>92%</span>
                  </div>
                  <div className="h-2 w-full rounded bg-[--surface-alt]">
                    <motion.div
                      className="relative h-2 rounded bg-[--brand-primary]"
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
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
                <span>Missed answers</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span>Precision matches</span>
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
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24"
      >
        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Ingest, organize, surface, and learn — all automatically.
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

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-2">
          {/* Left: Animated vertical timeline */}
          <div className="relative">
            <div
              className="absolute left-5 top-0 bottom-0 hidden w-[2px] bg-gradient-to-b from-[--brand-primary]/30 via-[--brand-accent]/30 to-transparent lg:block"
              aria-hidden
            />
            {[
              {
                n: "1",
                t: "Ingest & Parse",
                d: "Connect help center, docs, and transcripts.",
              },
              {
                n: "2",
                t: "Organize & Enrich",
                d: "Auto‑categorize; map entities & synonyms.",
              },
              {
                n: "3",
                t: "Surface Everywhere",
                d: "Chat, portal, in‑product widget, API.",
              },
              {
                n: "4",
                t: "Learn & Improve",
                d: "Track failed searches; suggest new articles.",
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
                {/* node */}
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
                  {/* hover underline */}
                  <div className="mt-4 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-24" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Animated pipeline card */}
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              {/* Stage 1: Signals rolling */}
              <div className="min-h-[40px]">
                <AnimatePresence initial={false}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {ingestSources
                      .slice(tick % ingestSources.length)
                      .concat(
                        ingestSources.slice(0, tick % ingestSources.length)
                      )
                      .slice(0, 3)
                      .map((sig, i) => (
                        <motion.span
                          key={`${sig.k}-${i}-${tick}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                        >
                          {sig.k}
                        </motion.span>
                      ))}
                  </div>
                </AnimatePresence>
              </div>

              {/* Stage 2: Enrichment */}
              <div className="mt-4 rounded-2xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  Enrichment
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  Topics • Entities • Synonyms
                </div>
                <div className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]">
                  <AnimatePresence initial={false}>
                    {categories
                      .slice(tick % categories.length)
                      .concat(categories.slice(0, tick % categories.length))
                      .slice(0, 3)
                      .map((a, i) => (
                        <motion.button
                          key={`${a.k}-${i}-${tick}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 font-medium text-[--brand-primary] hover:bg-[--brand-primary]/5"
                        >
                          {a.k}
                        </motion.button>
                      ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Stage 3: Progress shimmer + donut */}
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="h-2 w-full rounded bg-[--surface-alt]">
                    <motion.div
                      className="relative h-2 rounded bg-[--brand-primary]"
                      initial={{ width: 0 }}
                      animate={{
                        width: prefersReducedMotion
                          ? "80%"
                          : ["0%", "80%", "70%", "80%"],
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
                    Knowledge quality ↑
                  </div>
                </div>
                {/* donut */}
                <div className="grid place-items-center">
                  <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#E3EEFF"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-[--brand-primary]"
                      strokeDasharray="97.4"
                      strokeDashoffset="97.4"
                      animate={{
                        strokeDashoffset: prefersReducedMotion
                          ? 20
                          : [97.4, 20, 28, 20],
                      }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 2.2,
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                  <div className="mt-1 text-[10px] text-slate-500">
                    Find rate
                  </div>
                </div>
              </div>

              {/* Stage 4: CTA row */}
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[--border-subtle] bg-white p-3 shadow-sm">
                <div className="text-sm font-medium text-slate-800">
                  Relevant answers ready
                </div>
                <button className="rounded-2xl bg-[#004FCC] px-3 py-2 text-xs font-semibold text-white hover:bg-[#003BB5]">
                  Preview results
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4) INSIDE THE KNOWLEDGE BRAIN */}
      <section
        id="brain"
        className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24"
      >
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Inside the Knowledge Brain
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Intent • Auto‑tagging • Synonyms • Insights
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

          {/* Right: Ring spins once on view, again on hover */}
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
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24"
      >
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Key Features
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Auto‑organize, enrich, and deliver precise answers — everywhere.
        </p>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              i: "🧠",
              t: "Auto‑Categorization",
              d: "Classifies by topic, persona, and product area.",
            },
            {
              i: "🔍",
              t: "Intent‑Aware Search",
              d: "Semantic retrieval that matches how users ask.",
            },
            {
              i: "🗂️",
              t: "Duplicate Detection",
              d: "Flags overlapping or redundant content.",
            },
            {
              i: "📈",
              t: "Gap Insights",
              d: "Shows what users search but can’t find.",
            },
            {
              i: "🔁",
              t: "Cross‑Channel Sync",
              d: "Keep chat and help center consistent.",
            },
            {
              i: "⚙️",
              t: "Native + API Integrations",
              d: "Zendesk, Intercom, Confluence, Notion, Slack.",
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
          Real Impact — Answers that Find You
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Repeat queries", v: "−38%" },
            { k: "Agent discovery speed", v: "+60%" },
            { k: "Duplicate content", v: "−43%" },
            { k: "Self‑serve deflection", v: "+25%" },
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
          Support and Docs teams recover time while users get precise answers.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Liam Chen",
              role: "Knowledge Ops Lead, CloudSuite",
              inc: "−50% repeats",
              quote:
                "We cut repeat queries in half — the AI finds the best doc and surfaces it in chat.",
            },
            {
              name: "Sofia Martins",
              role: "Head of CX, FinTechCo",
              inc: "+34% find rate",
              quote:
                "Tagging used to be a chore. Now the system flags gaps and keeps our content fresh.",
            },
            {
              name: "Diego Alvarez",
              role: "Docs Manager, DevStack",
              inc: "−41% dups",
              quote:
                "Duplicate detection finally gave us a clean, trustworthy KB.",
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
        className="mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
      >
        <h2 className="text-3xl font-bold">Make Knowledge Work for You</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Automate categorization, discovery, and improvement with AI.
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
