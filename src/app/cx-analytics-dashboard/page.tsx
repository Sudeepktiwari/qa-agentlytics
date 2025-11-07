"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import HeroSection from "./hero-section";
import BeforeAfterAccuracy from "./before-after";
import WhySection from "./why-section";
import HowSection from "./how-section";
import BrainSection from "./brain-section";
import FeaturesSection from "./features-section";
import ImpactSection from "./impact-section";
import TestimonialSection from "./testimonial-section";

// Advancelytics — Knowledge Automation (FULL PAGE)
// Fixes: unterminated strings, no `process` usage, safe CTA colors, closed hrefs.
// Adds: lightweight in-browser self-tests (data-testid), button text visibility, trust logos,
// hero proof line, before-vs-after visual, and meta keywords injection.

const brand = {
  primary: "#006BFF",
  accent: "#0AE8F0",
  surface: "#F7FBFF",
  surfaceAlt: "#F5F9FF",
  borderSubtle: "#E3EEFF",
  cta: "#003BB5",
  ctaHover: "#002E99",
};

// --- Reusable CTA Button (inline colors to avoid Tailwind dynamic class pitfalls) ---
function CTAButton({
  href = "#!",
  children,
  variant = "primary",
  className = "",
  testId,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  testId?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isPrimary = variant === "primary";
  const base =
    "relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
  const style = isPrimary
    ? {
        backgroundColor: brand.cta,
        color: "#FFFFFF",
        border: `1px solid ${brand.cta}`,
      }
    : {
        backgroundColor: "#E8F1FF",
        color: brand.cta,
        border: `1px solid ${brand.cta}`,
      };
  return (
    <motion.a
      href={href}
      data-testid={testId}
      data-ctabtn
      className={`${base} ${className}`}
      style={style}
      initial={{ scale: 1 }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* shimmer */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ backgroundPosition: "-200% 0%" }}
        whileHover={
          prefersReducedMotion ? undefined : { backgroundPosition: "200% 0%" }
        }
        transition={{
          duration: 1.6,
          ease: "linear",
          repeat: prefersReducedMotion ? 0 : Infinity,
        }}
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.22) 50%, rgba(255,255,255,0) 100%)",
          backgroundSize: "200% 100%",
          maskImage: "linear-gradient(#000, #000)",
          WebkitMaskImage: "linear-gradient(#000, #000)",
        }}
      />
      {/* content */}
      <motion.span className="relative z-[1]">{children}</motion.span>
    </motion.a>
  );
}
type ShimmerVariants = "primary" | "outline";
interface ShimmerButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  variant?: ShimmerVariants;
  ariaLabel?: string;
}

function ShimmerButton({
  href = "#",
  children,
  className = "",
  variant = "primary",
  ariaLabel,
}: ShimmerButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition shadow-md";

  const variants: Record<ShimmerVariants, string> = {
    primary:
      "text-white bg-[#004FCC] hover:bg-[#003BB5] focus-visible:ring-[#003BB5]",
    outline:
      "text-[#004FCC] bg-[#E8F1FF] border border-[#004FCC] hover:bg-[#004FCC] hover:text-white focus-visible:ring-[#004FCC]",
  };

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {/* shimmer layer */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, transparent 30%, rgba(255,255,255,0.4) 45%, transparent 60%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0%", "-100% 0%"] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      />
      <span className="relative z-10">{children}</span>
    </a>
  );
}

export default function CxAnalyticsDashboardPage() {
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
  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  // Scroll-based header states for crossfade behavior
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);

  // Inject meta keywords (no next/head dependency)
  useEffect(() => {
    const name = "keywords";
    const content =
      "AI knowledge base automation, semantic tagging, intent search, CX automation";
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  }, []);

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
  // Track scroll to control floating/fixed headers
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

  // Illustration data
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

  // Stats shown as chips in the hero illustration
  const heroStats = useMemo(
    (): Array<{ k: string; v: string }> => [
      { k: "CSAT", v: "92%" },
      { k: "FRT", v: "12s" },
      { k: "AHT", v: "2.8m" },
      { k: "Resolution", v: "88%" },
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

  // --- Lightweight browser self-tests (no Node globals) ---
  useEffect(() => {
    try {
      console.assert(
        typeof CTAButton === "function",
        "CTAButton should be a function"
      );
      const ctas = document.querySelectorAll("a[data-ctabtn]");
      console.assert(
        ctas.length >= 3,
        `Expected at least 3 CTA buttons, found ${ctas.length}`
      );
      ctas.forEach((a) =>
        console.assert(
          (a.textContent || "").trim().length > 0,
          "CTA text should not be empty"
        )
      );
      const meta = document.querySelector('meta[name="keywords"]');
      console.assert(!!meta, "Meta keywords should exist");
    } catch (_) {
      // ignore in preview
    }
  }, []);

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
        } as React.CSSProperties & CSSVars
      }
    >
      {/* DESKTOP page-specific menu — crossfade like /ai-chatbots */}
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
              CX Analytics Dashboard
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

      {/* 1.5) BEFORE vs AFTER Metric Visual */}
      <BeforeAfterAccuracy />

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
      <TestimonialSection />

      {/* 8) CTA */}
      <section
        id="cta"
        className="mx-4 md:mt-12 mt-4 md:mx-auto mb-12 max-w-7xl rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
      >
        <h2 className="text-3xl font-bold">Make Knowledge Work for You</h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Automate categorization, discovery, and improvement with AI.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <CTAButton href="#!" testId="cta-start">
            Start Free Trial
          </CTAButton>
          <CTAButton href="#!" variant="secondary" testId="cta-request">
            Request Demo
          </CTAButton>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day free trial · No credit card required
        </p>
      </section>
    </div>
  );
}
