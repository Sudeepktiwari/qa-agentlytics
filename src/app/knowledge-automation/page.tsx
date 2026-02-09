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
import DemoVideoModal from "../components/DemoVideoModal";

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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [tick, setTick] = useState(0);
  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  // Scroll-based header states
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);
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

  // Track scroll to control crossfade headers
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const s = y > 2;
      setScrolled(s);
      setFloating(s && y > 120);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Smooth-scroll + close handler
  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
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
    [],
  );
  const ingestSources = useMemo(
    () => [
      { k: "PDFs" },
      { k: "FAQs" },
      { k: "Chat logs" },
      { k: "Confluence" },
      { k: "Zendesk" },
    ],
    [],
  );
  const categories = useMemo(
    () => [
      { k: "Security" },
      { k: "Billing" },
      { k: "Setup" },
      { k: "Integrations" },
      { k: "Policies" },
    ],
    [],
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
      {/* DESKTOP page-specific menu — match /ai-chatbots crossfade */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out hidden md:block ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 md:pr-12">
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Knowledge Automation
            </span>
          </div>
          <nav className="hidden md:flex flex-1 gap-6 text-sm text-slate-700">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#brain" className="hover:text-slate-900">
              Brain
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#testimonials" className="hover:text-slate-900">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-3" />
        </div>
      </header>

      {/* DESKTOP Floating bar — identical look/feel for smooth crossfade */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-opacity duration-300 ease-out hidden md:block ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-auto min-h-16 px-3 py-2 flex items-center justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-600 text-sm">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#brain" className="hover:text-slate-900">
              Brain
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#testimonials" className="hover:text-slate-900">
              Testimonials
            </a>
          </nav>
        </div>
      </header>

      {/* Spacer to avoid content jump when header is fixed (desktop only) */}
      <div className="hidden md:block h-16" aria-hidden />

      {/* Mobile page-specific menu — match /ai-chatbots style */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out md:hidden ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-full h-auto min-h-16 px-3 py-2 flex items-center justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-600 text-sm">
            <a
              href="#why"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Why
            </a>
            <a
              href="#how"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              How it works
            </a>
            <a
              href="#brain"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Brain
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Testimonials
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile floating bar — crossfades in when scrolled */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-opacity duration-300 ease-out md:hidden ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-auto min-h-16 px-3 py-2 flex items-center justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-600 text-sm">
            <a
              href="#why"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Why
            </a>
            <a
              href="#how"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              How it works
            </a>
            <a
              href="#brain"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Brain
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Testimonials
            </a>
          </nav>
        </div>
      </header>

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
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="rounded-2xl bg-[#E8F1FF] border border-[#004FCC] px-6 py-3 text-sm font-semibold text-[#004FCC] shadow-sm transition hover:bg-[#004FCC] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004FCC] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Watch a Demo
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day free trial · No credit card required
        </p>
      </section>
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
