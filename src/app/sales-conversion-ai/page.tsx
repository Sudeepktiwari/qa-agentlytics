"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import DemoVideoModal from "../components/DemoVideoModal";
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
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
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
      </motion.button>
    );
  }

  return (
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
};

export default function SalesConversionAIPage() {
  // Allow CSS custom properties on the style object
  type CSSVars = {
    "--brand-primary": string;
    "--brand-accent": string;
    "--surface": string;
    "--surface-alt": string;
    "--border-subtle": string;
  };
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
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

  // Scroll state for floating headers
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(typeof window !== "undefined" ? window.scrollY > 1 : false);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);
  useEffect(() => {
    setFloating(scrolled);
  }, [scrolled]);

  // Close menu then smooth-scroll to target anchors (match onboarding handler)
  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
      {/* DESKTOP page-specific menu — match /ai-chatbots crossfade */}
      <header
        className={`${scrolled ? "top-0" : "top-16"} fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out hidden md:block ${floating ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 md:pr-14">
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Sales Conversion AI
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
          <div className="flex items-center gap-3" />
        </div>
      </header>

      {/* DESKTOP Floating bar — identical look/feel for smooth crossfade */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-opacity duration-300 ease-out hidden md:block ${floating ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
        </div>
      </header>

      {/* Spacer to avoid content jump when header is fixed (desktop only) */}
      <div className="hidden md:block h-16" aria-hidden />

      {/* Mobile page-specific menu — match /ai-chatbots style */}
      <header
        className={`${scrolled ? "top-0" : "top-16"} fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out md:hidden ${floating ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"}`}
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
              Inside the Brain
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Features
            </a>
            <a
              href="#outcomes"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Outcomes
            </a>
            <a
              href="#testimonials"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Spacer to avoid content being overlapped by fixed header (mobile only) */}
      <div className="md:hidden h-16" aria-hidden />

      {/* Mobile floating bar — crossfades in when scrolled */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-opacity duration-300 ease-out md:hidden ${floating ? "opacity-100" : "opacity-0 pointer-events-none"}`}
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
              Inside the Brain
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Features
            </a>
            <a
              href="#outcomes"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Outcomes
            </a>
            <a
              href="#testimonials"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Pricing
            </a>
          </nav>
        </div>
      </header>
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
          <CTAPulse
            onClick={(e) => {
              e.preventDefault();
              setIsDemoModalOpen(true);
            }}
            variant="secondary"
            label="Request demo"
          >
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
