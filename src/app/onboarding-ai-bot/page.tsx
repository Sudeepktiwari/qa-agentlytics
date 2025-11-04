// Advancelytics — Onboarding AI Bot (Full Page)
// Calendly-style theme reused; lighter hero; modern sections
"use client";
import React, { useEffect, useRef, useState } from "react";
import HowItWorks from "./how-it-works";
import GuidedOnboardingPreview from "./hero-illustration";
import WhySection from "./why-section";
import BrainSection from "./brain-section";
import FeaturesSection from "./features-section";
import SecuritySection from "./security-section";

// Advancelytics — Onboarding AI Bot (Full Page)
// ✅ Animated "Proactive Brain" + synced list
// ✅ SEO meta injection (title, description, keywords)
// ✅ WCAG-friendly hover color (#004FCC)
// ✅ Dev-only runtime checks (no Node `process` usage)

const brand = {
  primary: "#006BFF",
  primaryHover: "#004FCC", // darker hover for contrast
  accent: "#0AE8F0",
  bgFrom: "#F3F9FF",
  bgTo: "#FFFFFF",
  surface: "#FDFFFF",
  surfaceAlt: "#F6FBFF",
  borderSubtle: "#E3EEFF",
};

// --- Shared data for the Proactive Brain ---
const brainItems = [
  {
    key: "I",
    title: "Intent Detection",
    desc: "Focus, errors, idle time, and docs viewed trigger the right guidance.",
  },
  {
    key: "S",
    title: "Smart Prompts",
    desc: "Offers next best actions like ‘Use sandbox key’ or ‘Map fields’.",
  },
  {
    key: "C",
    title: "Context Memory",
    desc: "Remembers answers and preferences to avoid repetition.",
  },
  {
    key: "L",
    title: "Lifecycle Aware",
    desc: "Moves from Trial → Activation → Expansion with the right steps.",
  },
];

// --- Components ---
function BrainList() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onTick = (e: Event) => {
      if (e && typeof (e as CustomEvent).detail === "number")
        setActive((e as CustomEvent).detail);
    };
    window.addEventListener("brain-tick", onTick);
    return () => window.removeEventListener("brain-tick", onTick);
  }, []);

  return (
    <div className="mt-6 grid gap-3">
      {brainItems.map((b, i) => (
        <div
          key={b.key}
          className={`group rounded-2xl border p-4 transition ${
            i === active
              ? "border-[--brand-primary]/30 bg-[--brand-primary]/5"
              : "border-[--border-subtle] bg-white hover:bg-[--surface]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-bold ${
                i === active
                  ? "bg-[--brand-primary]/20 text-[--brand-primary]"
                  : "bg-[--brand-primary]/10 text-[--brand-primary]"
              }`}
            >
              {b.key}
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900">
                {b.title}
              </div>
              <p className="mt-1 text-sm text-slate-600">{b.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnimatedBrain() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIdx((n) => (n + 1) % brainItems.length),
      2600
    );
    return () => clearInterval(id);
  }, []);

  // Broadcast active index to BrainList
  useEffect(() => {
    const evt = new CustomEvent("brain-tick", { detail: idx });
    window.dispatchEvent(evt);
  }, [idx]);

  const labels = brainItems.map((b) => b.key);

  return (
    <div className="relative w-full max-w-[460px]">
      {/* Inline keyframes for portability */}
      <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes pulseDot { 0%,100%{ transform: scale(1); opacity:.9;} 50%{ transform: scale(1.25); opacity:1;}}
        @keyframes floatY { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-6px);} }
      `}</style>

      <div className="relative aspect-square w-full">
        {/* Outer glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(200px 200px at 50% 50%, ${brand.primary}14 0%, transparent 70%)`,
          }}
        />

        {/* Rotating ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="ring" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={brand.primary} stopOpacity="0.35" />
              <stop offset="100%" stopColor={brand.accent} stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="url(#ring)"
            strokeWidth="6"
            style={{
              transformOrigin: "100px 100px",
              animation: "spinSlow 18s linear infinite",
            }}
          />
        </svg>

        {/* Orbiting nodes I,S,C,L */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI * 2) / 4; // quarters
          const r = 72;
          const x = 100 + r * Math.cos(angle);
          const y = 100 + r * Math.sin(angle);
          const isActive = i === idx;
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: x - 16, top: y - 16 }}
            >
              <div
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-bold transition ${
                  isActive
                    ? "border-[--brand-primary] bg-[--brand-primary]/10 text-[--brand-primary]"
                    : "border-[--border-subtle] bg-white text-slate-600"
                }`}
                style={{
                  animation: isActive
                    ? "pulseDot 1.4s ease-in-out infinite"
                    : undefined,
                }}
              >
                {labels[i]}
              </div>
            </div>
          );
        })}

        {/* Center nucleus */}
        <div
          className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-[--brand-primary]/30 bg-[--brand-primary]/5 text-[10px] font-semibold text-[--brand-primary]"
          style={{ animation: "floatY 5s ease-in-out infinite" }}
        >
          PROACTIVE
        </div>
      </div>

      {/* Caption synced with active node */}
      <div className="mt-4 text-center text-sm text-slate-600">
        <span className="font-semibold text-slate-900">
          {brainItems[idx].title}
        </span>
        <span className="mx-1">—</span>
        {brainItems[idx].desc}
      </div>
    </div>
  );
}

// --- SEO injection (no external deps) ---
function useSEO() {
  useEffect(() => {
    const title =
      "Onboarding AI Bot – Guide users to activation | Advancelytics";
    document.title = title;
    const ensure = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    ensure(
      "description",
      "AI onboarding software for SaaS: conversational setup guidance, real-time validation, adaptive paths, and faster activation."
    );
    ensure(
      "keywords",
      "AI onboarding software, SaaS activation automation, guided setup assistant, onboarding automation, AI setup guide, SaaS activation bot"
    );
  }, []);
}

export default function OnboardingAIBotPage() {
  useSEO();

  // Before/After toggle in WHY section
  const [isAfter, setIsAfter] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setIsAfter((s) => !s), 3000);
    return () => clearInterval(id);
  }, []);

  // Mobile menu state and Escape-to-close
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

  // Reveal on scroll for testimonials
  const revealRef = useRef(null);
  useEffect(() => {
    const root = revealRef.current;
    if (!root) return;
    const cards = (root as Element).querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target.classList.add("opacity-100", "translate-y-0");
        });
      },
      { threshold: 0.12 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  // --- DEV RUNTIME CHECKS (browser-safe, no Node `process`) ---
  const containerRef = useRef(null);
  useEffect(() => {
    const isDev =
      typeof window !== "undefined" &&
      (/localhost|127\.0\.0\.1/.test(window.location.hostname) ||
        (window as any).__DEV__ === true);
    if (!isDev) return;
    try {
      console.assert(
        typeof BrainList === "function",
        "BrainList should be defined"
      );
      console.assert(
        typeof AnimatedBrain === "function",
        "AnimatedBrain should be defined"
      );
      console.assert(
        Array.isArray(brainItems) && brainItems.length === 4,
        "brainItems should have 4 entries"
      );
      const metaDesc = document.querySelector('meta[name="description"]');
      const metaKeys = document.querySelector('meta[name="keywords"]');
      console.assert(
        metaDesc?.getAttribute("content")?.length ?? 0 > 0,
        "Meta description should be set"
      );
      console.assert(
        metaKeys && /onboarding/.test(metaKeys.getAttribute("content") || ""),
        "Meta keywords should include 'onboarding'"
      );
      if (containerRef.current) {
        const styles = getComputedStyle(containerRef.current);
        console.assert(
          styles.getPropertyValue("--brand-primary").trim().length > 0,
          "CSS var --brand-primary should be applied on container"
        );
      }
    } catch (err) {
      console.warn("Dev checks encountered an error (non-fatal):", err);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-x-hidden text-slate-900 antialiased scroll-smooth"
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

      {/* NAVBAR */}
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
              Onboarding AI Bot
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#brain" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#brain" className="hover:text-slate-900">
              Inside the Brain
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#security" className="hover:text-slate-900">
              Security
            </a>
            <a href="#cta" className="hover:text-slate-900">
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
                (e.currentTarget.style.backgroundColor = brand.primaryHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primary)
              }
            >
              Start free
            </a>
            {/* Mobile menu toggle — match Lead Generation Basics */}
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
        {/* Mobile menu panel — match Lead Generation Basics */}
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
                href="#brain"
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
                href="#security"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Security
              </a>
              <a
                href="#cta"
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primary)
                }
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

      {/* HERO */}
      <section className="relative isolate rounded-b-[2rem] bg-[--surface] py-16 sm:py-20 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl hidden sm:block"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${brand.primary}26 0%, transparent 60%)`,
          }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Turn onboarding steps into a guided conversation
            </h1>
            <p className="mt-3 text-base font-medium text-rose-600">
              Every confusing step costs adoption — guide users before they give
              up.
            </p>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Traditional onboarding makes people guess what to do next.
              Agentlytics explains why each field matters, answers questions
              in‑flow, and adapts the path so users finish faster — and happier.
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex gap-3">
                <a
                  href="#cta"
                  className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  style={{ backgroundColor: brand.primary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = brand.primaryHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = brand.primary)
                  }
                >
                  Start Free Trial
                </a>
                <a
                  href="#demo"
                  className="rounded-2xl border border-[--brand-primary] px-6 py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = `linear-gradient(90deg, ${brand.primary} 0%, ${brand.accent} 100%)`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Book a Demo
                </a>
              </div>
              <p className="text-xs text-slate-500">
                Go live in minutes · Start guiding users today
              </p>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              No code required · Works with your stack
            </p>
          </div>

          {/* Hero Illustration */}
          <GuidedOnboardingPreview />
        </div>
      </section>
      <section id="how-it-works">
        <HowItWorks />
      </section>
      {/* WHY THIS MATTERS */}
      <section id="why">
        <WhySection />
      </section>

      {/* INSIDE THE PROACTIVE BRAIN — modernized + animated */}
      <BrainSection />

      {/* FEATURES */}
      <FeaturesSection />

      {/* SECURITY & PRIVACY */}
      <SecuritySection />

      {/* OUTCOMES */}
      <section id="outcomes" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Activation that compounds
        </h2>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { k: "Time‑to‑value", v: "−32%" },
            { k: "Completion rate", v: "+24%" },
            { k: "Setup tickets", v: "−18%" },
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

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
        ref={revealRef}
      >
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Loved by product and success teams
            </h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Real companies accelerating activation and reducing setup tickets
              with Agentlytics Onboarding AI.
            </p>
          </div>
          <div className="hidden text-sm text-slate-500 md:block">
            CSAT ↑, time‑to‑value ↓
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 opacity-90">
          {["CloudScale", "FinServe", "TechFlow"].map((l) => (
            <span
              key={l}
              className="rounded-lg border border-[--border-subtle] bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {l}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Sarah Chen",
              role: "Head of Product, CloudScale",
              inc: "+27% activation",
              quote:
                "Explaining the why behind fields cut our drop‑offs dramatically. Users finish setup without Slack pings.",
            },
            {
              name: "Diego Morales",
              role: "CX Lead, FinServe",
              inc: "−31% setup tickets",
              quote:
                "Inline Q&A and validation removed most ‘what does this mean?’ questions. Our team can focus on complex cases.",
            },
            {
              name: "Priya Nair",
              role: "Growth PM, TechFlow",
              inc: "TTFV −29%",
              quote:
                "Adaptive paths skip irrelevant steps. Time‑to‑first‑value is down and expansion trials go smoother.",
            },
          ].map((t, i) => (
            <figure
              key={i}
              data-reveal
              className="opacity-0 translate-y-3 group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
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
                    className="grid h-10 w-10 place-items-center rounded-full bg-[--brand-primary]/10 text-sm font-bold"
                    style={{ color: brand.primary }}
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
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-4 sm:mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/6 px-3 sm:px-6 py-12 sm:py-16 text-center shadow-md scroll-mt-24"
      >
        <h2 className="text-2xl sm:text-3xl font-bold">
          Let your onboarding explain itself
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Install once. From there, your agent guides, validates, and gets users
          live — faster.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <div className="flex gap-3">
            <a
              href="#"
              className="rounded-2xl px-4 py-2 sm:px-6 sm:py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              style={{ backgroundColor: brand.primary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primaryHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = brand.primary)
              }
            >
              Start Free — Get Users Live Faster
            </a>
            <a
              href="#"
              className="rounded-2xl border border-[--brand-primary] px-4 py-2 sm:px-6 sm:py-3 text-sm font-semibold text-[--brand-primary] transition hover:text-white"
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
          <p className="text-xs text-slate-500">
            14‑day free trial · No credit card required
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-[--border-subtle] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} Advancelytics. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#" className="hover:text-slate-700">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-700">
                Terms
              </a>
              <a href="#" className="hover:text-slate-700">
                Contact
              </a>
              <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                SOC 2
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
