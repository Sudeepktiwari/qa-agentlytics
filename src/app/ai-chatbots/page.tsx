// Advancelytics — Proactive AI Agent (ai-chatbots)
// Full single-file React component using Calendly-aligned palette.
// Primary button is solid dark blue (#006BFF / rgb(0,107,255)) for strong contrast.

"use client";
// Advancelytics — Proactive AI Agent (ai-chatbots)
// Full single-file React component with requested updates:
// - Social Proof logos & testimonial carousel
// - StoryBrand "Before → After" success visual
// - CTA microcopy: "Start Free — Boost Conversions Now"
// - SEO meta: keywords + description via react-helmet
// - Accessibility: hover color #004FCC (WCAG AA)

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

// Calendly-ish brand tokens
const brand = {
  primary: "#006BFF", // rgb(0,107,255)
  primaryHover: "#004FCC", // darker for WCAG AA
  accent: "#0AE8F0", // Bright Turquoise
  bgFrom: "#CCE1FF", // light wash
  bgTo: "#FFFFFF",
  glow: "#99C3FF", // soft glow
};

const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M5 12h14m0 0-6-6m6 6-6 6"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ProactiveAIPage() {
  // Simple testimonial carousel
  const testimonials = [
    {
      logo: "CloudScale",
      quote: "We saw 2.9x more qualified demos in week one.",
      author: "VP Growth, CloudScale",
      metric: "+2.9x demos",
    },
    {
      logo: "FinServe",
      quote: "Onboarding time dropped by 42% without extra headcount.",
      author: "Head of CS, FinServe",
      metric: "-42% activation time",
    },
    {
      logo: "RetailOps",
      quote: "Behavior triggers rescued 18% of exit-intent visitors.",
      author: "Ecom Lead, RetailOps",
      metric: "+18% recovered",
    },
    {
      logo: "DevSuite",
      quote: "Sales loved the zero-handoff context. Cycle time shrank fast.",
      author: "RevOps, DevSuite",
      metric: "-23% cycle time",
    },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  // Close menu then smooth-scroll to target anchors for reliable navigation
  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const href = (e.currentTarget.getAttribute("href") || "").trim();
    if (href.startsWith("#")) {
      e.preventDefault();
      setMobileOpen(false);
      const el = document.querySelector(href);
      if (el) {
        setTimeout(() => {
          (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
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
      setMobileOpen(false);
    }
  };
  const [tIndex, setTIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setTIndex((i) => (i + 1) % testimonials.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  // Close mobile drawer on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) {
      document.addEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden text-slate-900 scroll-smooth"
      style={
        {
          "--brand-primary": brand.primary,
          "--brand-accent": brand.accent,
        } as React.CSSProperties
      }
    >
      <Helmet>
        <title>
          Advancelytics — Proactive AI That Turns Visitors into Customers
        </title>
        <meta
          name="keywords"
          content="proactive ai chatbot, lifecycle ai agent, ai sales automation, conversational intelligence"
        />
        <meta
          name="description"
          content="Boost conversions 2.8x with Advancelytics — a proactive AI chatbot that detects behavior triggers, engages instantly, and automates customer journeys."
        />
      </Helmet>

      {/* Background wash */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background: `radial-gradient(1200px 600px at 20% -10%, ${brand.bgFrom} 0%, transparent 60%), radial-gradient(1000px 500px at 80% -10%, ${brand.bgFrom} 0%, transparent 60%), linear-gradient(180deg, ${brand.bgFrom} 0%, ${brand.bgTo} 60%)`,
        }}
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 md:bg-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[--brand-primary]" />
            <span className="text-lg font-semibold tracking-tight">
              Agentlytics
            </span>
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              Proactive AI Agent
            </span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#benefits" className="hover:text-slate-900">
              Benefits
            </a>
            <a href="#proof" className="hover:text-slate-900">
              Social Proof
            </a>
            <a href="#compare" className="hover:text-slate-900">
              Compare
            </a>
            <a href="#demo" className="hover:text-slate-900">
              Demo
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="hidden rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:inline-block"
            >
              Watch demo
            </a>
            <a
              href="#cta"
              className="hidden md:inline-block rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              style={{ backgroundColor: brand.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primaryHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primary)
              }
            >
              Start Free — Boost Conversions Now
            </a>
            <button
              type="button"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen ? "true" : "false"}
              aria-label="Toggle menu"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileOpen((o) => !o)}
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
                {mobileOpen ? (
                  // X icon
                  <g>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </g>
                ) : (
                  // Hamburger icon
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
        {/* Mobile menu panel */}
        <div
          id="mobile-menu"
          aria-hidden={!mobileOpen}
          className={`md:hidden absolute right-0 top-full z-50 w-[60vw] border-t border-l border-slate-200 bg-white rounded-b-2xl shadow-lg origin-top-right transform transition-all duration-300 ease-out ${
            mobileOpen
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <nav className="mx-auto px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <a
                href="#how"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                How it works
              </a>
              <a
                href="#benefits"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Benefits
              </a>
              <a
                href="#proof"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Social Proof
              </a>
              <a
                href="#compare"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Compare
              </a>
              <a
                href="#demo"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Demo
              </a>
              <a
                href="#faq"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                FAQ
              </a>
              <div className="my-2 border-t border-slate-200" />
              <a
                href="#cta"
                className="w-full rounded-xl px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                style={{ backgroundColor: brand.primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primary)
                }
                onClick={handleMobileNavClick}
              >
                Start Free — Boost Conversions Now
              </a>
              <a
                href="#demo"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={handleMobileNavClick}
              >
                Watch demo
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Backdrop overlay — outside header to ensure proper stacking and click capture */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* HERO */}
      <section className="relative isolate">
        {/* Decorative orb */}
        <div
          className="pointer-events-none absolute -top-32 right-0 md:right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${brand.primary}33 0%, transparent 60%)`,
          }}
          aria-hidden
        />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Turn Visitors into Conversations —{" "}
              <span className="text-[--brand-primary]">Before They Leave</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Most chatbots wait.{" "}
              <span className="font-semibold">Agentlytics acts.</span> Our
              Proactive AI Agent detects intent from scroll depth, pricing-page
              dwell, and exit patterns — then starts the right conversation
              instantly.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition"
                style={{ backgroundColor: brand.primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primary)
                }
              >
                Start Free — Boost Conversions Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#demo"
                className="rounded-2xl border border-[--brand-primary] px-5 py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = `linear-gradient(90deg, ${brand.primary} 0%, ${brand.accent} 100%)`)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                See it in action
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>14-day free trial</span>
              <span>·</span>
              <span>No credit card</span>
              <span>·</span>
              <span>Setup in minutes</span>
            </div>
          </div>

          {/* Hero Demo Card */}
          <div className="relative">
            <div className="absolute inset-0 md:-inset-0.5 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur" />
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[--brand-primary]" />
                  <span className="text-sm font-semibold">
                    Agentlytics Chat
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  Live
                </span>
              </div>
              {/* Persona chips */}
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "Pricing Explorer",
                  "Comparing Vendors",
                  "Signup Hesitant",
                  "Support Seeking",
                ].map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                <ChatRow
                  who="agent"
                  text="Noticed you on Pricing for 45s — want a quick ROI snapshot?"
                />
                <ChatRow
                  who="user"
                  text={
                    "Yes. We're \u003C50 agents. What uplift can we expect?"
                  }
                />
                <ChatRow
                  who="agent"
                  text="Teams like yours see 2.8x more leads and 40% faster onboarding. Want the 3-step rollout plan?"
                />
                <ChatRow who="user" text="Show me." />
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: brand.primary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = brand.primaryHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = brand.primary)
                  }
                >
                  See ROI model
                </button>
                <button
                  className="rounded-xl border border-[--brand-primary] px-4 py-2 text-xs font-semibold text-[--brand-primary] transition hover:text-white"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = brand.primary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Talk to sales
                </button>
                <button
                  className="rounded-xl border border-[--brand-primary] px-4 py-2 text-xs font-semibold text-[--brand-primary] transition hover:text-white"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = brand.primary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Start Free — Boost Conversions Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-4">
          {[
            { k: "2.8x", v: "More Leads" },
            { k: "40%", v: "Faster Onboarding" },
            { k: "3x", v: "Faster Resolution" },
            { k: "24/7", v: "Always On" },
          ].map((m) => (
            <div key={m.k} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{m.k}</div>
              <div className="text-sm text-slate-600">{m.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF (logos + carousel) */}
      <section id="proof" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 scroll-mt-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-center text-xs font-semibold tracking-wide text-slate-500">
            TRUSTED BY TEAMS AT
          </p>
          <div className="mt-4 grid grid-cols-2 place-items-center gap-6 text-slate-400 sm:grid-cols-5">
            {[
              "CloudScale",
              "FinServe",
              "DevSuite",
              "RetailOps",
              "HealthStack",
            ].map((n) => (
              <LogoBadge key={n} name={n} />
            ))}
          </div>

          {/* Testimonial carousel */}
          <div className="mt-8 overflow-hidden">
            <div className="relative mx-auto max-w-3xl">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-center shadow-sm">
                <div className="mx-auto mb-2 flex items-center justify-center gap-2 text-slate-500">
                  <div className="h-6 w-6 rounded-full bg-slate-200" />
                  <span className="text-sm font-semibold">
                    {testimonials[tIndex].logo}
                  </span>
                </div>
                <blockquote className="text-balance text-lg font-medium text-slate-800">
                  “{testimonials[tIndex].quote}”
                </blockquote>
                <div className="mt-2 text-sm text-slate-600">
                  {testimonials[tIndex].author}
                </div>
                <div className="mt-3 inline-block rounded-full border border-[--brand-primary]/30 bg-[--brand-primary]/5 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
                  {testimonials[tIndex].metric}
                </div>
                <div className="mt-4 flex justify-center gap-1">
                  {testimonials.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full ${
                        i === tIndex ? "bg-[--brand-primary]" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARE (modern) */}
      <section id="compare" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 scroll-mt-24">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Reactive Bot vs Proactive AI Agent
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Reactive waits for input. Proactive reads behavior and acts at
              peak intent. Here’s the side‑by‑side reality.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Lifecycle‑aware
            </span>
            <span className="ml-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Human‑handoff ready
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Reactive card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-slate-100 blur-2xl" />
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                R
              </span>
              Reactive Chatbot
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Sits idle, lacks context, and responds only after the user types.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {[
                "Waits for user to message",
                "No understanding of visitor intent",
                "One‑size‑fits‑all answers",
                "Missed leads & poor timing",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "0%", v: "Proactive prompts" },
                { k: "1x", v: "Baseline conv." },
                { k: "Low", v: "Context depth" },
              ].map((m) => (
                <div
                  key={m.v}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
                >
                  <div className="text-base font-bold text-slate-800">
                    {m.k}
                  </div>
                  <div className="text-[11px] text-slate-500">{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Proactive card */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,106,255,0.08)] transition hover:shadow-[0_10px_40px_rgba(0,106,255,0.15)]">
            <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--brand-primary]/15 blur-2xl" />
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[--brand-primary]">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[--brand-primary]/10 text-[--brand-primary]">
                P
              </span>
              Proactive AI Agent
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Detects intent, personalizes the opener, and engages before
              drop‑off.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                "Detects scroll‑depth, dwell time, exit intent",
                "Predicts buying or churn signals",
                "Personalized prompts by journey stage",
                "Triggers at peak intent to convert",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 text-[--brand-primary]" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "2.8x", v: "Leads" },
                { k: "40%", v: "Faster onboard" },
                { k: "3x", v: "Faster support" },
              ].map((m) => (
                <div
                  key={m.v}
                  className="rounded-xl border border-[--brand-primary]/20 bg-white p-3 text-center shadow-sm"
                >
                  <div className="text-base font-bold text-[--brand-primary]">
                    {m.k}
                  </div>
                  <div className="text-[11px] text-slate-500">{m.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              {[
                "Pricing dwell",
                "Scroll 75%",
                "Exit intent",
                "Idle 30s",
                "FAQ loop",
                "Cart abandoned",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature matrix */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-12 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-700">
            <div className="col-span-6">Capability</div>
            <div className="col-span-3 text-center">Reactive</div>
            <div className="col-span-3 text-center">Proactive</div>
          </div>
          {[
            {
              cap: "Behavior signals (scroll, dwell, exit)",
              r: false,
              p: true,
            },
            { cap: "Journey‑aware prompts", r: false, p: true },
            { cap: "Auto‑qualify & route", r: false, p: true },
            { cap: "Knowledge search", r: true, p: true },
            { cap: "Human handoff with context", r: true, p: true },
            { cap: "Learning from outcomes", r: false, p: true },
          ].map((row, i) => (
            <div
              key={row.cap}
              className={`grid grid-cols-12 items-center px-4 py-3 text-sm ${
                i % 2 ? "bg-white" : "bg-slate-50/40"
              }`}
            >
              <div className="col-span-6 text-slate-700">{row.cap}</div>
              <div className="col-span-3 text-center">
                {row.r ? (
                  <Check className="mx-auto h-5 w-5 text-slate-500" />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
              <div className="col-span-3 text-center">
                {row.p ? (
                  <Check className="mx-auto h-5 w-5 text-[--brand-primary]" />
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 scroll-mt-24">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Inside the Proactive Brain
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Agentlytics reads behavior, not just text — engaging at the
              perfect moment with the perfect message.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Signal‑driven
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privacy‑aware
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px]">
          {[
            "Pricing dwell 45s",
            "Scroll 75%",
            "Exit intent",
            "Idle 30s",
            "FAQ loop",
            "Return visitor",
            "UTM:campaign",
            "Cart abandoned",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
            {[
              {
                key: "I",
                title: "Intent Detection",
                body: "Scrolls, clicks, dwell‑time & exit intent trigger the right opener.",
                tips: [
                  "Detect peak attention",
                  "Suppress during form‑fill",
                  "Respect cooldowns",
                ],
              },
              {
                key: "S",
                title: "Smart Prompts",
                body: "Pricing explorers, comparers, or support seekers get tailored lines.",
                tips: [
                  "Persona‑aware openers",
                  "Value props per page",
                  "A/B test prompts",
                ],
              },
              {
                key: "C",
                title: "Context Memory",
                body: "Remembers sessions & preferences to keep chats personal.",
                tips: [
                  "Session stitching",
                  "Recent views recall",
                  "Preferred channel",
                ],
              },
              {
                key: "L",
                title: "Lifecycle Aware",
                body: "Flows from Lead → Onboarding → Support without friction.",
                tips: [
                  "Auto‑qualify & route",
                  "Nudge for activation",
                  "Proactive success cues",
                ],
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[--brand-primary]/10 text-[--brand-primary] font-bold">
                    {card.key}
                  </div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">{card.body}</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  {card.tips.map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 h-1 w-0 bg-[--brand-primary] transition-all duration-300 group-hover:w-16" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700">
              Signal → Intent → Prompt → Outcome
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              How a proactive conversation is decided and delivered.
            </p>
            <div className="mt-4 space-y-4">
              {[
                {
                  label: "Signal",
                  desc: "User behavior + page context",
                  chips: ["Scroll 75%", "Pricing dwell", "Exit intent"],
                },
                {
                  label: "Intent",
                  desc: "Predict buy/churn/support probability",
                  chips: ["Compare vendors", "High purchase", "Needs help"],
                },
                {
                  label: "Prompt",
                  desc: "Personalized opener based on journey",
                  chips: [
                    "ROI snapshot?",
                    "2‑min walkthrough?",
                    "Troubleshoot now?",
                  ],
                },
                {
                  label: "Outcome",
                  desc: "Capture → Qualify → Handoff/Resolve",
                  chips: ["Lead scored", "Booked demo", "Resolved ticket"],
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      {row.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {row.desc}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {row.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2 py-0.5 text-[10px] text-[--brand-primary]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { k: "+2.8x", v: "Leads" },
                { k: "-40%", v: "Time to onboard" },
                { k: "3x", v: "Faster support" },
              ].map((m) => (
                <div
                  key={m.v}
                  className="rounded-xl border border-[--brand-primary]/20 bg-white p-3 text-center shadow-sm"
                >
                  <div className="text-base font-bold text-[--brand-primary]">
                    {m.k}
                  </div>
                  <div className="text-[11px] text-slate-500">{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEMO (illustration) */}
      <section
        id="demo"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white px-4 py-10 shadow-sm sm:px-6 scroll-mt-24"
      >
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">
              See the Proactive Agent in Action
            </h3>
            <p className="mt-2 max-w-md text-slate-600">
              Watch how behavior signals trigger targeted prompts that convert.
              No code required to get started — just drop‑in and go.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Web & SPA
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Mobile Ready
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Analytics Included
              </span>
            </div>
            <a
              href="#cta"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition"
              style={{ backgroundColor: brand.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primaryHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primary)
              }
            >
              Start Free — Boost Conversions Now
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Illustration with brand-aligned bubble borders */}
          <div className="relative">
            <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-[--brand-primary]/5 p-5">
              <div className="relative mx-auto h-64 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow">
                <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <div className="ml-3 h-5 flex-1 rounded bg-slate-100" />
                </div>
                <div className="grid grid-cols-12 gap-2 p-3">
                  <div className="col-span-8 space-y-2">
                    <div className="h-5 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-full rounded bg-slate-100" />
                    <div className="h-3 w-5/6 rounded bg-slate-100" />
                    <div className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50" />
                  </div>
                  <div className="col-span-4 space-y-2">
                    <div className="h-16 w-full rounded-lg border border-slate-200 bg-slate-50" />
                    <div className="h-16 w-full rounded-lg border border-slate-200 bg-slate-50" />
                  </div>
                </div>
                {/* Agent bubble with brand border */}
                <div
                  className="absolute -right-3 bottom-12 w-[70%] max-w-xs rounded-2xl border px-3 py-2 text-[13px] shadow-sm"
                  style={{
                    backgroundColor: `${brand.primary}1A`, // ~10% fill
                    color: brand.primary,
                    borderColor: brand.primary,
                  }}
                >
                  Noticed high pricing dwell — want a quick ROI snapshot?
                </div>
                {/* User bubble with soft brand-tinted border */}
                <div
                  className="absolute left-3 bottom-2 max-w-[60%] rounded-2xl border bg-white px-3 py-2 text-[13px] text-slate-800 shadow-sm"
                  style={{ borderColor: `${brand.primary}66` }}
                >
                  Yes, show me.
                </div>
              </div>
              {/* Floating KPI cards */}
              <div
                className="pointer-events-none absolute -left-4 -top-4 w-36 rounded-xl border bg-white p-3 text-center shadow-sm"
                style={{ borderColor: `${brand.primary}33` }}
              >
                <div className="text-sm font-bold text-[--brand-primary]">
                  +2.8x
                </div>
                <div className="text-[11px] text-slate-500">Leads</div>
              </div>
              <div
                className="pointer-events-none absolute -right-4 top-8 w-40 rounded-xl border bg-white p-3 text-center shadow-sm"
                style={{ borderColor: `${brand.primary}33` }}
              >
                <div className="text-sm font-bold text-[--brand-primary]">
                  -40%
                </div>
                <div className="text-[11px] text-slate-500">
                  Time to onboard
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                {["Pricing dwell", "Scroll 75%", "Exit intent"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-2.5 py-1 text-[--brand-primary]"
                    style={{
                      borderColor: `${brand.primary}33`,
                      backgroundColor: `${brand.primary}0D`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Illustration preview (replace with product visuals anytime).
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 scroll-mt-24">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Benefits that Compound
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Every conversation compounds value — from real-time
              personalization to business intelligence that drives better
              decisions.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              CX-driven
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Scalable
            </span>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "⚡",
              t: "Real-time Personalization",
              d: "Messages adapt dynamically to behavior and journey stage for higher relevance.",
            },
            {
              icon: "🚀",
              t: "Instant Engagement",
              d: "Eliminates wait time — the agent initiates conversation proactively before drop-off.",
            },
            {
              icon: "🤝",
              t: "Seamless Handoff",
              d: "Transitions to human agents smoothly with full context, transcripts, and tags.",
            },
            {
              icon: "📊",
              t: "Data to Decisions",
              d: "Each interaction feeds analytics dashboards for continuous optimization and insight.",
            },
            {
              icon: "⚙️",
              t: "Frictionless Setup",
              d: "Drop-in script, guided presets, and smart defaults help you go live in minutes.",
            },
            {
              icon: "🛡️",
              t: "Secure & Compliant",
              d: "Enterprise-grade security with privacy-first design and global compliance support.",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[--brand-primary]/10 text-xl text-[--brand-primary]">
                    {b.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {b.t}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-6">
          {[
            { k: "2.8x", v: "Leads" },
            { k: "40%", v: "Faster Onboarding" },
            { k: "3x", v: "Faster Resolution" },
            { k: "24/7", v: "Availability" },
            { k: "100%", v: "Data Privacy" },
            { k: "Zero", v: "Code Setup" },
          ].map((m) => (
            <div key={m.v} className="text-center">
              <div className="text-base font-bold text-[--brand-primary]">
                {m.k}
              </div>
              <div className="text-[11px] text-slate-500">{m.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE → AFTER (StoryBrand visual) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-stretch">
            <div className="flex-1 rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
              <h4 className="text-sm font-semibold text-rose-700">Before</h4>
              <ul className="mt-2 space-y-2 text-sm text-rose-900/90">
                {[
                  "Missed leads on pricing page",
                  "Visitors repeat themselves at handoffs",
                  "Reactive chat waits for input",
                  "Manual follow-ups, slow cycles",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10">
              <ArrowRight className="h-8 w-8 text-[--brand-primary]" />
            </div>
            <div className="flex-1 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
              <h4 className="text-sm font-semibold text-emerald-700">After</h4>
              <ul className="mt-2 space-y-2 text-sm text-emerald-900/90">
                {[
                  "Automated prompts at peak intent",
                  "Zero handoff repetition with context",
                  "2.8x leads, 40% faster onboarding",
                  "Seamless routing, faster resolutions",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 shadow-sm sm:px-6 scroll-mt-24"
      >
        <div className="pointer-events-none absolute -top-12 right-0 md:right-[-10%] h-72 w-72 rounded-full bg-[--brand-primary]/20 blur-3xl" />
        <div className="grid items-start gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <h3 className="text-3xl font-bold">Let Your Website Talk First</h3>
            <p className="mt-2 max-w-xl text-slate-600">
              Install once. Engage forever. Proactive conversations that
              capture, qualify, and convert on autopilot.
            </p>
            <ul className="mt-5 grid max-w-xl gap-2 text-sm text-slate-700 sm:grid-cols-2">
              {[
                "Drop-in JavaScript snippet",
                "Prebuilt proactive triggers",
                "Persona-aware prompts",
                "Human handoff with context",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition"
                style={{ backgroundColor: brand.primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primary)
                }
              >
                Start Free — Boost Conversions Now
              </a>
              <a
                href="#"
                className="rounded-2xl border border-[--brand-primary] px-5 py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                See pricing
              </a>
              <span className="text-xs text-slate-500">
                14-day free trial · No credit card required
              </span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                SOC 2 ready
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                GDPR-friendly
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                99.9% uptime
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                24/7 support
              </span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-[--brand-primary]/10 blur-2xl" />
              <h4 className="text-sm font-semibold text-slate-700">
                Quick Setup
              </h4>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    n: 1,
                    t: "Paste the script into your site",
                    s: "Add one snippet to your head or tag manager.",
                  },
                  {
                    n: 2,
                    t: "Choose proactive triggers",
                    s: "Pick from presets like pricing dwell, exit intent, or scroll 75%.",
                  },
                  {
                    n: 3,
                    t: "Pick journey prompts",
                    s: "Use persona-aware openers for pricing, comparison, or support.",
                  },
                  {
                    n: 4,
                    t: "Go live and measure",
                    s: "Track leads, onboarding time, and resolution speed in dashboard.",
                  },
                ].map((step) => (
                  <li key={step.n} className="flex items-start gap-3">
                    <div
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full border bg-[--brand-primary]/5 text-xs font-semibold text-[--brand-primary]"
                      style={{ borderColor: `${brand.primary}4D` }}
                    >
                      {step.n}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {step.t}
                      </div>
                      <div className="text-xs text-slate-500">{step.s}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Install snippet
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px]">{`<script src="https://cdn.agentlytics.dev/agent.js" async></script>`}</pre>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">
                  Safe defaults, easy rollback, no vendor lock-in.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-balance text-3xl font-bold tracking-tight">FAQ</h2>
        <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {[
            {
              q: "How is this different from a normal chatbot?",
              a: "Traditional chatbots wait for input. Agentlytics proactively detects behavior signals and initiates the right conversation at the right time.",
            },
            {
              q: "Do I need developers to set it up?",
              a: "No. Drop-in script + guided presets. You can go live in minutes and fine-tune triggers anytime.",
            },
            {
              q: "Can it hand off to my team?",
              a: "Yes. It escalates to humans with full context, tags, and transcripts in your helpdesk or inbox.",
            },
            {
              q: "Is it secure?",
              a: "Yes. We support role-based controls, PII redaction, and enterprise-grade privacy policies.",
            },
          ].map((f) => (
            <details key={f.q} className="group">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
                {f.q}
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600">{f.a}</div>
              <div className="h-px w-full bg-slate-200" />
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
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

// Chat bubble component — aligns with brand (no black borders)
function ChatRow({ who, text }: { who: "agent" | "user"; text: string }) {
  const isAgent = who === "agent";
  const border = isAgent ? brand.primary : `${brand.primary}66`;
  const bg = isAgent ? `${brand.primary}1A` : "#FFFFFF";
  const color = isAgent ? brand.primary : "#0f172a";
  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
      <div
        className="max-w-[85%] rounded-2xl border px-4 py-2 text-sm shadow-sm"
        style={{ borderColor: border, backgroundColor: bg, color }}
      >
        {text}
      </div>
    </div>
  );
}

function LogoBadge({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-500">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="2"
          y="4"
          width="20"
          height="16"
          rx="4"
          className="fill-slate-200"
        />
        <path d="M6 12h12" strokeWidth="2" className="stroke-slate-400" />
      </svg>
      <span className="text-sm font-semibold">{name}</span>
    </div>
  );
}
