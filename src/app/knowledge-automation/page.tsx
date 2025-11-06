"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import HeroSection from "./hero-section";
import WhySection from "./why-section";
import HowSection from "./how-section";
import BrainSection from "./brain-section";
import FeaturesSection from "./features-section";
import ImpactSection from "./impact-section";
import TestimonialsSection from "./testimonials-section";

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
      <HeroSection />

      {/* 2) WHY MANUAL KNOWLEDGE FAILS */}
      <WhySection />

      {/* 3) HOW IT WORKS */}
      <HowSection />

      {/* 4) INSIDE THE KNOWLEDGE BRAIN */}
      <BrainSection />

      {/* 5) KEY FEATURES */}
      <FeaturesSection />

      {/* 6) REAL IMPACT */}
      <ImpactSection />
      {/* 7) TESTIMONIALS */}
      <TestimonialsSection />

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-4 md:mx-auto mb-12 max-w-7xl rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
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
