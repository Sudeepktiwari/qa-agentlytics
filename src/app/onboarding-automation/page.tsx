"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import HeroSection from "./hero-section";
import WhySection from "./why-section";
import HowItWorksFlow from "./howitworks-section";
import BrainSection from "./brain-section";
import FeaturesSection from "./features-section";
import PlanSection from "./plan-section";
import ImpactSection from "./impact-section";
import TestimonialsSection from "./testimonials-section";
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
  // Mobile menu state and handlers
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[--brand-primary]" />
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Onboarding Automation
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
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[--surface] md:inline-block"
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
      <HeroSection />

      {/* 2) WHY TRADITIONAL FAILS */}
      <WhySection />

      {/* 3) HOW IT WORKS */}
      <HowItWorksFlow />

      {/* 4) INSIDE THE ONBOARDING BRAIN */}
      <BrainSection />

      {/* 5) KEY FEATURES */}
      <FeaturesSection />

      {/* 5.5) STORYBRAND 3‑STEP PLAN */}
      <PlanSection />

      {/* 6) REAL IMPACT */}
      <ImpactSection />

      {/* 7) TESTIMONIALS */}
      <TestimonialsSection />

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-4 md:mx-auto mb-12 max-w-7xl rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
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
