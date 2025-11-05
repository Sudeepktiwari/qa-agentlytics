"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import HeroSection from "./hero-section";
import WhySection from "./why-section";
import HowItWorksSection from "./how-it-works";
import BrainSection from "./brain-section";
import FeaturesSection from "./features-section";
import SecurityTrustCard from "./security-section";
import OutcomesSection from "./outcomes-section";
import TestimonialsSection from "../customer-support-ai/testimonials-section";
import PricingSection from "./pricing-section";

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

const CTAPulse = ({
  children,
  href = "#",
  variant = "primary",
  label,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  label: string;
}) => (
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
      style={
        {
          "--brand-primary": brand.primary,
          "--brand-accent": brand.accent,
          "--surface": brand.surface,
          "--surface-alt": brand.surfaceAlt,
          "--border-subtle": brand.borderSubtle,
        } as React.CSSProperties & CSSVars
      }
    >
      {/* Header — match onboarding mobile menu CSS and structure */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl"
              style={{ backgroundColor: brand.primary }}
            />
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Sales Conversion AI
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
            <a href="#testimonials" className="hover:text-slate-900">
              Testimonials
            </a>
            <a href="#pricing" className="hover:text-slate-900">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#cta"
              className="hidden rounded-xl border border-[--border-subtle] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[--surface] md:inline-block"
            >
              Watch demo
            </a>
            <a
              href="#cta"
              className="hidden rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg md:inline-block"
              style={{ backgroundColor: brand.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primary)
              }
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
        </div>
        {/* Mobile menu panel — dropdown under header */}
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
                href="#brain"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Inside the Brain
              </a>
              <a
                href="#features"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Features
              </a>
              <a
                href="#outcomes"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Outcomes
              </a>
              <a
                href="#testimonials"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Pricing
              </a>
              {/* Buttons in dropdown */}
              <a
                href="#cta"
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
      </header>

      {/* Backdrop overlay — outside header for proper stacking */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* 0) Invisible SEO helper for keyword variants (non-indexed in canvas, illustrative only) */}
      <p className="sr-only">
        sales conversion AI, proactive chatbot, SDR automation software
      </p>

      {/* 1) HERO */}
      <HeroSection />

      {/* 2) WHY IT MATTERS */}
      <WhySection />

      {/* 3) HOW IT WORKS */}
      <HowItWorksSection />

      {/* 4) INSIDE THE PROACTIVE BRAIN */}
      <BrainSection />

      {/* 5) KEY FEATURES */}
      <FeaturesSection />

      {/* 5.1) SECURITY & COMPLIANCE */}
      <SecurityTrustCard />

      {/* 6) REAL IMPACT */}
      <OutcomesSection />

      {/* 7) TESTIMONIALS */}
      <TestimonialsSection />

      {/* 7.5) PRICING TEASER */}
      <PricingSection />

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-auto mb-12 max-w-7xl rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
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
