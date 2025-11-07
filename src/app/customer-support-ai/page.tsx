// // Advancelytics — Customer Support AI (Full Page)
// // Calendly-style theme; modern sections; no black buttons; airy hero
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroSupportSection from "./hero-support";
import WhySection from "./why-section";
import HowSection from "./stpes-section";
import PlanSection from "./plan-section";
import FeaturesSection from "./features-section";
import OutcomesSection from "./outcomes-section";
import TestimonialsSection from "./testimonials-section";

const brand = {
  primary: "#006BFF",
  primaryHover: "#0055CC",
  accent: "#0AE8F0",
  bgFrom: "#F3F9FF",
  bgTo: "#FFFFFF",
  glow: "#CDE6FF",
  surface: "#FDFFFF",
  surfaceAlt: "#F6FBFF",
  borderSubtle: "#E3EEFF",
};

// (Optional) SEO meta tags for real deployment (commented out for canvas preview)
// export const Head = () => (
//   <>
//     <title>Advancelytics — Customer Support AI that Boosts CSAT</title>
//     <meta name="description" content="Proactive CX platform for AI support automation and deflection. Connect your helpdesk, learn from conversations, and automate resolutions to boost CSAT." />
//     <meta name="keywords" content="proactive CX platform, AI support automation, AI deflection tools" />
//   </>
// );

export default function CustomerSupportAIPage() {
  // Framer Motion helpers for looping demo
  const intents = [
    { k: "Need refund" },
    { k: "Reset password" },
    { k: "Feature not working" },
    { k: "Change invoice email" },
    { k: "Cancel subscription" },
  ];
  const actions = [
    { txt: "Create macro" },
    { txt: "Add KB article" },
    { txt: "Route to Billing" },
    { txt: "Escalate to L2" },
  ];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);
  const rollingIntents = useMemo(() => {
    const a = tick % intents.length;
    const b = (a + 1) % intents.length;
    const c = (a + 2) % intents.length;
    return [intents[a], intents[b], intents[c]];
  }, [tick]);
  const rollingActions = useMemo(() => {
    const a = tick % actions.length;
    const b = (a + 1) % actions.length;
    const c = (a + 2) % actions.length;
    return [actions[a], actions[b], actions[c]];
  }, [tick]);

  // Testimonials carousel state
  const testimonials = [
    {
      logo: "Nexora",
      name: "Riya Deshmukh",
      role: "CX Head, Nexora",
      stat: "−40% response time",
      quote:
        "We reduced repetitive queries by 40% and our customers now get help even before asking.",
    },
    {
      logo: "Logibase",
      name: "Andrew Park",
      role: "Support Ops, Logibase",
      stat: "2–3 mins saved/ticket",
      quote:
        "AI summaries save 2–3 minutes per ticket. Multiply that by thousands — it’s a game‑changer.",
    },
    {
      logo: "Northwind",
      name: "Maya Kapoor",
      role: "VP Success, Northwind",
      stat: "+29% CSAT",
      quote:
        "Deflection rose immediately and agents focus on the complex cases that matter.",
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(id);
  }, [testimonials.length]);

  // Mobile menu state and Escape-to-close
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Floating header state (match /ai-chatbots behavior)
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") setScrolled(window.scrollY > 1);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);
  useEffect(() => {
    setFloating(scrolled);
  }, [scrolled]);

  // Close menu then smooth-scroll to target anchors for reliable navigation
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

  return (
    <div
      className="relative min-h-screen w-full text-slate-900 antialiased scroll-smooth overflow-x-hidden"
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
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            `radial-gradient(1000px 600px at 20% -10%, ${brand.bgFrom} 0%, transparent 60%),` +
            `radial-gradient(800px 400px at 85% 0%, ${brand.surfaceAlt} 0%, transparent 55%),` +
            `linear-gradient(180deg, ${brand.bgFrom} 0%, ${brand.bgTo} 55%)`,
        }}
      />

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
          <div className="flex items-center gap-3 md:pr-14">
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Customer Support AI
            </span>
          </div>
          <nav className="hidden md:flex flex-1 gap-6 text-sm text-slate-700">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#plan" className="hover:text-slate-900">
              Plan
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#testimonials" className="hover:text-slate-900">
              Testimonials
            </a>
            <a href="#cta" className="hover:text-slate-900">
              Pricing
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
            <a href="#plan" className="hover:text-slate-900">
              Plan
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#testimonials" className="hover:text-slate-900">
              Testimonials
            </a>
            <a href="#cta" className="hover:text-slate-900">
              Pricing
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
              href="#plan"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Plan
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
            <a
              href="#cta"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile Floating bar — identical look/feel for smooth crossfade */}
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
              href="#plan"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Plan
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
            <a
              href="#cta"
              className="hover:text-slate-900"
              onClick={handleMobileNavClick}
            >
              Pricing
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <HeroSupportSection />

      {/* WHY THIS MATTERS */}
      <WhySection />

      {/* HOW IT WORKS */}
      <HowSection />

      {/* STORYBRAND PLAN */}
      <PlanSection />

      {/* FEATURES */}
      <FeaturesSection />

      {/* OUTCOMES */}
      <OutcomesSection />

      {/* TESTIMONIALS — Carousel */}
      <TestimonialsSection />

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-4 sm:mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
      >
        <h2 className="text-3xl font-bold">
          Empower your support with proactive intelligence
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          One AI that listens, learns, and acts — before your team even opens a
          ticket.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="#"
            className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            style={{ backgroundColor: brand.primary }}
          >
            Start Free — Boost CSAT Today
          </a>
          <a
            href="#"
            className="rounded-2xl border border-[--brand-primary] px-6 py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = brand.primary)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            See Pricing
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          14‑day trial — no card needed (start in 60 sec)
        </p>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-[--border-subtle] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} Advancelytics. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#" className="hover:text-slate-700">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-700">
                Terms
              </a>
              <a href="#" className="hover:text-slate-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
