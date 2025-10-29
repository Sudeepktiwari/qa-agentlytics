"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// Advancelytics — Sales Conversion AI (Full Page, 11 sections)
// Adds: Trust Logos, Pricing Teaser, Agitation line, Security/Compliance, CTA micro‑interactions, accessibility alt/labels.
// Calendly-style theme. Buttons accessible. "Brain" ring spins once on reveal and on hover (no endless spin).

const brand = {
  primary: "#006BFF",
  accent: "#0AE8F0",
  surface: "#F7FBFF",
  surfaceAlt: "#F5F9FF",
  borderSubtle: "#E3EEFF",
};

const CTAPulse = ({ children, href = "#", variant = "primary", label }: { children: React.ReactNode; href?: string; variant?: "primary" | "secondary"; label: string }) => (
  <motion.a
    href={href}
    aria-label={label}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className={
      variant === "primary"
        ? "rounded-2xl bg-[#004FCC] px-6 py-3 text-sm font-semibold text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003BB5] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        : "rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    }
    style={{ position: "relative", overflow: "hidden" }}
    data-testid={label?.toLowerCase().replace(/\s+/g, "-")}
  >
    <span className="relative z-10">{children}</span>
    {/* gradient shimmer */}
    <motion.span
      aria-hidden
      className="absolute inset-0"
      initial={{ x: "-100%", opacity: 0 }}
      whileHover={{ x: "100%", opacity: 1 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
      style={{
        background:
          "linear-gradient(120deg, transparent 0%, rgba(255,255,255,.15) 50%, transparent 100%)",
      }}
    />
  </motion.a>
);

export default function SalesConversionAIPage() {
  // Allow CSS custom properties on the style object
  type CSSVars = {
    "--brand-primary": string;
    "--brand-accent": string;
    "--surface": string;
    "--surface-alt": string;
    "--border-subtle": string;
  };
  const [tick, setTick] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Mobile menu state and Escape-to-close (match onboarding page)
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close menu then smooth-scroll to target anchors (match onboarding handler)
  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const href = (e.currentTarget.getAttribute("href") || "").trim();
    if (href.startsWith("#")) {
      e.preventDefault();
      setMenuOpen(false);
      const el = document.querySelector(href);
      if (el) {
        setTimeout(() => {
          (el as HTMLElement).scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          try {
            history.replaceState(null, "", href);
          } catch {}
        }, 0);
      } else {
        try {
          history.replaceState(null, "", href);
        } catch {}
      }
    } else {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);

  // Chips used in HOW section
  const intents = useMemo(
    () => [
      { k: "Pricing viewed 40s" },
      { k: "Compare plans" },
      { k: "ROI calculator" },
      { k: "Enterprise features" },
      { k: "Integration check" },
    ],
    []
  );
  const actions = useMemo(
    () => [
      { txt: "Show plan compare" },
      { txt: "Offer ROI sheet" },
      { txt: "Book a demo" },
      { txt: "Share case study" },
    ],
    []
  );

  // 🔎 Dev sanity tests (lightweight, non-blocking)
  useEffect(() => {
    console.assert(
      Array.isArray(intents) && intents.length >= 3,
      "[TEST] intents should be an array with >=3 items"
    );
    console.assert(
      Array.isArray(actions) && actions.length >= 3,
      "[TEST] actions should be an array with >=3 items"
    );
    console.assert(
      typeof brand.primary === "string" && brand.primary.startsWith("#"),
      "[TEST] brand.primary should be a hex color string"
    );
  }, [intents, actions]);

  const rollingIntents = useMemo(() => {
    const a = tick % intents.length;
    const b = (a + 1) % intents.length;
    const c = (a + 2) % intents.length;
    return [intents[a], intents[b], intents[c]];
  }, [tick, intents]);
  const rollingActions = useMemo(() => {
    const a = tick % actions.length;
    const b = (a + 1) % actions.length;
    const c = (a + 2) % actions.length;
    return [actions[a], actions[b], actions[c]];
  }, [tick, actions]);

  const brainPhases = [
    {
      k: "I",
      t: "Intent Detection",
      d: "Understands tone, urgency, and scroll behavior.",
    },
    {
      k: "S",
      t: "Smart Prompts",
      d: "Suggests ROI, pricing, or demo offers contextually.",
    },
    {
      k: "C",
      t: "Context Memory",
      d: "Learns from CRM data and past conversations.",
    },
    {
      k: "L",
      t: "Lifecycle Aware",
      d: "Adapts to prospect stage for maximum conversion.",
    },
  ];

  return (
    <div
      className="relative min-h-screen w-full text-slate-900 scroll-smooth"
      style={{
        "--brand-primary": brand.primary,
        "--brand-accent": brand.accent,
        "--surface": brand.surface,
        "--surface-alt": brand.surfaceAlt,
        "--border-subtle": brand.borderSubtle,
      } as React.CSSProperties & CSSVars}
    >
      {/* Header — match onboarding mobile menu CSS and structure */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl" style={{ backgroundColor: brand.primary }} />
            <span className="text-lg font-semibold tracking-tight">Advancelytics</span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">Sales Conversion AI</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#why" className="hover:text-slate-900">Why</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#brain" className="hover:text-slate-900">Inside the Brain</a>
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#outcomes" className="hover:text-slate-900">Outcomes</a>
            <a href="#testimonials" className="hover:text-slate-900">Testimonials</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#cta" className="hidden rounded-xl border border-[--border-subtle] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[--surface] md:inline-block">Watch demo</a>
            <a
              href="#cta"
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg md:inline-block"
              style={{ backgroundColor: brand.primary }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = brand.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = brand.primary)}
            >
              Start free
            </a>
            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen ? "true" : "false"}
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
        </div>
        {/* Mobile menu panel — dropdown under header */}
        <div
          id="mobile-menu"
          aria-hidden={!menuOpen}
          className={`md:hidden absolute right-0 top-full z-50 w-[60vw] bg-white rounded-b-2xl shadow-lg origin-top-right transform transition-all duration-300 ease-out ${
            menuOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <nav className="mx-auto px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <a href="#why" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>Why</a>
              <a href="#how" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>How it works</a>
              <a href="#brain" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>Inside the Brain</a>
              <a href="#features" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>Features</a>
              <a href="#outcomes" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>Outcomes</a>
              <a href="#testimonials" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>Testimonials</a>
              <a href="#pricing" className="py-2 hover:text-slate-900" onClick={handleMobileNavClick}>Pricing</a>
              {/* Buttons in dropdown */}
              <a href="#cta" className="mt-2 w-full rounded-xl border border-[--border-subtle] px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-[--surface]" onClick={handleMobileNavClick}>Watch demo</a>
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
      </header>

      {/* Backdrop overlay — outside header for proper stacking */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-transparent md:hidden" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
      )}
      {/* 0) Invisible SEO helper for keyword variants (non-indexed in canvas, illustrative only) */}
      <p className="sr-only">
        sales conversion AI, proactive chatbot, SDR automation software
      </p>

      {/* 1) HERO */}
      <section
        className="relative isolate rounded-b-[2rem] bg-[--surface] px-4 py-20 sm:px-6"
        data-testid="hero"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:mx-0">
              Convert More Visitors with AI that Knows When to Engage
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
              Automate your SDR’s first 3 steps — identify, engage, and qualify
              — while routing only high‑intent prospects to your team.
            </p>
            {/* Agitation line */}
            <p className="mx-auto mt-2 max-w-2xl text-sm text-rose-600 lg:mx-0">
              Every minute delay costs a demo — don’t let interest slip away.
            </p>
            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              <CTAPulse href="#cta" variant="primary" label="Watch demo">
                Watch Demo
              </CTAPulse>
              <CTAPulse
                href="#cta"
                variant="secondary"
                label="Start free trial"
              >
                Start Free Trial
              </CTAPulse>
            </div>
          </div>

          {/* Right: Animated Illustration */}
          <div
            className="relative mx-auto h-[360px] w-full max-w-[520px]"
            aria-label="Proactive AI conversation mockup"
          >
            {/* soft glow background */}
            <div
              className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-2xl"
              aria-hidden
            />
            <div className="relative h-full w-full rounded-[32px] border border-[--border-subtle] bg-white p-5 shadow-xl">
              {/* floating bubbles */}
              <motion.div
                className="absolute left-5 top-5 right-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-8 w-8 rounded-full bg-[--brand-primary]/10"
                    aria-hidden
                  />
                  <div className="max-w-[75%] rounded-2xl border border-[--border-subtle] bg-[--surface] p-3 text-sm text-slate-800">
                    Not sure which plan fits our usage?
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute left-5 right-5 top-24"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              >
                <div className="ml-11 max-w-[78%] rounded-2xl border border-[--border-subtle] bg-white p-3 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Advancelytics
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    I can help. Want a quick compare and a demo slot?
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {["Compare plans", "See ROI", "Book demo"].map((c) => (
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

              {/* typing indicator card */}
              <motion.div
                className="absolute bottom-24 left-5 right-5"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-8 w-8 rounded-full bg-[--brand-primary]/10"
                    aria-hidden
                  />
                  <div
                    className="max-w-[70%] rounded-2xl border border-[--border-subtle] bg-[--surface] p-3"
                    aria-live="polite"
                  >
                    <div className="flex items-center gap-1">
                      <span className="sr-only">typing</span>
                      {[0, 1, 2].map((d) => (
                        <motion.span
                          key={d}
                          className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
                          animate={{ y: [0, -3, 0] }}
                          transition={{
                            repeat: Infinity,
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

              {/* bottom CTA bar inside illustration */}
              <motion.div
                className="absolute bottom-5 left-5 right-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between rounded-2xl border border-[--border-subtle] bg-white p-3 shadow-sm">
                  <div className="text-sm font-medium text-slate-800">
                    Peak intent detected
                  </div>
                  <CTAPulse
                    href="#cta"
                    variant="primary"
                    label="Book demo from chat"
                  >
                    Book demo
                  </CTAPulse>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2) WHY IT MATTERS */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why reactive chatbots lose conversions
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Traditional bots wait for user input. Advancelytics detects buyer
              intent and engages at the right moment, turning missed
              opportunities into booked demos.
            </p>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-sm text-slate-700">
              <li>Identifies visitor intent before they leave</li>
              <li>Engages automatically with contextual prompts</li>
              <li>Routes qualified leads to the right rep instantly</li>
              <li>Increases conversion and reduces SDR workload</li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              Intent Detection in Action
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3">
                Visitor browses pricing → AI triggers assistance
              </div>
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3">
                AI: “Need help choosing the right plan?”
              </div>
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3">
                User: “I’m comparing Enterprise vs Pro”
              </div>
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3">
                AI: “Let me show a quick comparison and book a call.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3) HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          How It Works
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Detect, engage, qualify, and route — all automatically.
        </p>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
          {/* Steps */}
          <div className="space-y-4">
            {[
              {
                n: "1",
                t: "Detect & Trigger",
                d: "Behavior signals detect high‑intent visitors in real time.",
              },
              {
                n: "2",
                t: "Engage & Capture",
                d: "AI prompts start personalized conversations and collect lead info.",
              },
              {
                n: "3",
                t: "Qualify & Route",
                d: "Scores leads and sends hot prospects directly to your CRM.",
              },
              {
                n: "4",
                t: "Nurture & Close",
                d: "Automated follow‑ups re‑engage silent prospects.",
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

          {/* Animated Lead Flow */}
          <div className="relative" aria-label="Lead flow animation">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
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

              <div className="mt-4 rounded-2xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  Actions
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  Plan compare • ROI sheet • Calendar handoff
                </div>
                <motion.div layout className="mt-3 min-h-[34px] flex flex-wrap gap-2 text-[11px]" style={{ willChange: "transform" }}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {rollingActions.map((a) => (
                      <motion.button
                        layout
                        key={`${a.txt}-${tick}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 font-medium text-[--brand-primary] hover:bg-[--brand-primary]/5"
                        aria-label={a.txt}
                      >
                        {a.txt}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>

              <div
                className="mt-5 h-2 w-full rounded bg-[--surface-alt]"
                aria-hidden
              >
                <motion.div
                  className="relative h-2 rounded bg-[--brand-primary]"
                  initial={{ width: 0 }}
                  animate={{
                    width: prefersReducedMotion
                      ? "68%"
                      : ["0%", "68%", "60%", "68%"],
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
                Conversion likelihood ↑
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4) INSIDE THE PROACTIVE BRAIN */}
      <section id="brain" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Inside the Proactive Brain
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Predicts, learns, and personalizes every sales interaction.
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

          {/* Right: ring spins ONCE when visible, then only on hover */}
          <div className="relative flex items-center justify-center">
            <div
              className="relative h-80 w-80 sm:h-96 sm:w-96"
              aria-label="Proactive brain visual"
            >
              {/* Glow */}
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
                aria-hidden
              >
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full"
                  role="img"
                  aria-label="Animated ring with four nodes"
                >
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
                  <title>Adaptive decision ring</title>
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

                {/* Nodes */}
                {[0, 90, 180, 270].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `rotate(${angle}deg) translate(50px) rotate(-${angle}deg)`,
                    }}
                  >
                    <div
                      className="h-3 w-3 rounded-full bg-[--brand-primary] shadow-md"
                      aria-hidden
                    />
                  </div>
                ))}
              </motion.div>

              {/* Center card cycles text */}
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
                        aria-live="polite"
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
      <section id="features" className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24">
        <h2 className="text-3xl font-bold tracking-tight text-center">
          Key Features
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Designed to replicate your best SDR’s instincts — instantly, 24/7.
        </p>
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              i: "⚡",
              t: "Behavioral Triggers",
              d: "Scroll depth, dwell time, and hesitation detection.",
            },
            {
              i: "💬",
              t: "Smart Messaging",
              d: "Adaptive prompts for pricing, ROI, and comparisons.",
            },
            {
              i: "🎯",
              t: "Lead Scoring",
              d: "Automatic prioritization of hot leads.",
            },
            {
              i: "🔗",
              t: "CRM Sync",
              d: "Seamless handoff to HubSpot, Salesforce, and Pipedrive.",
            },
            {
              i: "📊",
              t: "Conversion Analytics",
              d: "Visualize engagement → demo flow in real‑time.",
            },
            {
              i: "🤖",
              t: "Automation Sequences",
              d: "Personalized follow‑ups and reactivation workflows.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm"
            >
              <div className="text-2xl" aria-hidden>
                {f.i}
              </div>
              <h3 className="mt-2 font-semibold text-slate-900">{f.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5.1) SECURITY & COMPLIANCE */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="rounded-3xl border border-[--border-subtle] bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div
              className="grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10"
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                role="img"
                aria-label="Lock icon"
              >
                <path
                  fill="currentColor"
                  d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 016 0v3H9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Built for B2B trust — security by design
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Data encrypted in transit and at rest. Fine‑grained access
                controls and audit trails. EU/US data residency options.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {["GDPR-ready", "SOC 2 (Type II)", "ISO 27001", "SSO/SAML"].map(
                  (b) => (
                    <span
                      key={b}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700"
                    >
                      {b}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6) REAL IMPACT */}
      <section id="outcomes" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24">
        <h2 className="text-3xl font-bold tracking-tight">
          Real Impact — Revenue that Speaks
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Demo bookings", v: "+42%" },
            { k: "Lead quality", v: "+36%" },
            { k: "Response speed", v: "−45%" },
            { k: "Conversion rate", v: "+28%" },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded-lg border border-[--border-subtle] bg-[--surface] p-4"
              aria-label={m.k}
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
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24"
        data-testid="testimonials"
      >
        <h2 className="text-3xl font-bold tracking-tight text-center">
          What Sales Teams Are Saying
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          Teams automate SDR grunt‑work and focus on conversations that convert.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Priya Sharma",
              role: "Head of Growth, GrowthLabs",
              inc: "+31% demo rate",
              quote:
                "Our inbound conversions doubled within two weeks. AI engages leads faster than SDRs could.",
            },
            {
              name: "Tom Alvarez",
              role: "RevOps, TechFlow",
              inc: "−70% manual sorting",
              quote:
                "The bot qualifies precisely and pushes to HubSpot instantly. SDRs focus on selling, not sifting.",
            },
            {
              name: "Maya Kapoor",
              role: "VP Sales, ScaleUP",
              inc: "+22% close‑won",
              quote:
                "Feels like a 24/7 SDR assistant that never misses a lead.",
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
                  <div
                    className="grid h-10 w-10 place-items-center rounded-full bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]"
                    aria-label={`Avatar for ${t.name}`}
                  >
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

        {/* Trust Logos under testimonials */}
        <div className="mx-auto mt-12 max-w-6xl" data-testid="trust-logos">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { name: "TechFlow", alt: "TechFlow — customer logo" },
              { name: "GrowthLabs", alt: "GrowthLabs — customer logo" },
              { name: "ScaleUP", alt: "ScaleUP — customer logo" },
              { name: "CloudScale", alt: "CloudScale — customer logo" },
            ].map((l) => (
              <div
                key={l.name}
                className="flex items-center justify-center rounded-xl border border-[--border-subtle] bg-white p-4"
              >
                <svg
                  viewBox="0 0 120 40"
                  className="h-6 w-auto"
                  role="img"
                  aria-label={l.alt}
                >
                  <title>{l.name}</title>
                  <rect
                    x="1"
                    y="6"
                    width="118"
                    height="28"
                    rx="6"
                    fill="#EEF4FF"
                  />
                  <text
                    x="60"
                    y="26"
                    textAnchor="middle"
                    fontSize="14"
                    fill="#3B82F6"
                  >
                    {l.name}
                  </text>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7.5) PRICING TEASER */}
      <section
        id="pricing"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
        data-testid="pricing"
      >
        <div className="rounded-3xl border border-[--border-subtle] bg-white p-6 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-semibold">
                See Plans — built for teams at every stage
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Starter for early traction, Pro for accelerating pipeline,
                Enterprise for scale and control.
              </p>
            </div>
            <CTAPulse href="#cta" variant="primary" label="See plans">
              See Plans
            </CTAPulse>
          </div>
          <div
            className="mt-6 grid gap-4 sm:grid-cols-3"
            role="list"
            aria-label="Pricing tiers preview"
          >
            {[
              {
                t: "Starter",
                b: "Everything to capture and qualify",
                p: "Best for MVPs",
              },
              { t: "Pro", b: "Deeper CRM sync & analytics", p: "Most popular" },
              {
                t: "Enterprise",
                b: "SSO, audit logs, advanced controls",
                p: "For scale",
              },
            ].map((card) => (
              <div
                key={card.t}
                className="rounded-2xl border border-[--border-subtle] bg-[--surface] p-4"
              >
                <div className="text-sm font-semibold text-slate-900">
                  {card.t}
                </div>
                <div className="mt-1 text-xs text-slate-600">{card.b}</div>
                <div className="mt-3 inline-block rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                  {card.p}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
      >
        <h2 className="text-3xl font-bold">
          Boost Conversions with Intelligent Engagement
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Automate your SDR’s first contact — engage, qualify, and convert
          high‑intent visitors instantly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <CTAPulse href="#" variant="primary" label="Get started">
            Get Started
          </CTAPulse>
          <CTAPulse href="#cta" variant="secondary" label="Request demo">
            Request Demo
          </CTAPulse>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day free trial · No credit card required
        </p>
      </section>
    </div>
  );
}
