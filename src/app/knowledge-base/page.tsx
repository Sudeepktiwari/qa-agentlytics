// Advancelytics — Knowledge Base (Stable Full Page)
// Calendly-aligned theme, modernized sections, and fixed JSX syntax issues.
"use client";
import React, { useState, useEffect } from "react";

// ===== Theme tokens (Calendly-ish) =====
const brand = {
  primary: "#006BFF", // Calendly Blue
  primaryHover: "#0055CC",
  accent: "#0AE8F0", // Bright Turquoise
  bgFrom: "#CCE1FF", // light wash
  bgTo: "#FFFFFF",
  glow: "#99C3FF", // soft glow
  surface: "#F5F9FF", // card surface
  surfaceAlt: "#ECF4FF", // alt section wash
  borderSubtle: "#E3EEFF", // subtle borders
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

const Menu = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M3 12h18M3 6h18M3 18h18"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const X = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Dev-only theme sanity check (no-op in prod)
function devAssertTheme() {
  if (typeof window !== "undefined") {
    const required = [
      "primary",
      "accent",
      "surface",
      "surfaceAlt",
      "borderSubtle",
    ] as const;
    required.forEach((k: keyof typeof brand) => {
      if (!brand[k]) console.warn(`[KB Theme] Missing token: ${k}`);
    });
  }
}

devAssertTheme();

export default function KnowledgeBasePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const handleBackdropClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === "mobileMenuBackdrop") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("click", handleBackdropClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleBackdropClick);
    };
  }, [isMobileMenuOpen]);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden text-slate-900"
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
      {/* ===== Background Wash (layered) ===== */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            `radial-gradient(1200px 600px at 20% -10%, ${brand.bgFrom} 0%, transparent 60%),` +
            `radial-gradient(800px 400px at 85% 0%, ${brand.surfaceAlt} 0%, transparent 55%),` +
            `linear-gradient(180deg, ${brand.bgFrom} 0%, ${brand.bgTo} 55%)`,
        }}
      />

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-40 border-b border-[--border-subtle] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-0 py-3 sm:px-6">
          <div className="flex items-center gap-3 px-4 sm:px-0">
            <div className="h-8 w-8 rounded-xl bg-[--brand-primary]" />
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Knowledge Base
            </span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
            <a href="#why" className="hover:text-slate-900">
              Why
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#compare" className="hover:text-slate-900">
              Compare
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-[--surface] md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          id="mobileMenu"
          aria-hidden={!isMobileMenuOpen}
          className={`md:hidden absolute right-0 top-full z-50 w-[60vw] border-t border-l border-[--border-subtle] bg-white rounded-b-2xl shadow-lg origin-top-right transform transition-all duration-300 ease-out ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <nav className="mx-auto px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <a
                href="#why"
                className="py-2 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Why
              </a>
              <a
                href="#how"
                className="py-2 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#features"
                className="py-2 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#compare"
                className="py-2 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Compare
              </a>
              <a
                href="#faq"
                className="py-2 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="my-2 border-t border-[--border-subtle]" />
                <a
                  href="#demo"
                  className="mt-2 w-full rounded-xl border border-[--border-subtle] px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-[--surface]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Watch demo
                </a>
                <a
                  href="#cta"
                  className="w-full rounded-2xl px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  style={{ backgroundColor: brand.primary }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start free
                </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          id="mobileMenuBackdrop"
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* ===== HERO ===== */}
      <section className="relative isolate bg-[--surface]">
        <div
          className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full blur-3xl md:right-[-10%]"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${brand.primary}33 0%, transparent 60%)`,
          }}
          aria-hidden
        />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-0 py-16 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="px-4 sm:px-0">
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Turn Your Content into Answers — Instantly
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              A self-service knowledge library connected to your proactive AI
              agent. Give customers and teams consistent, instant answers across
              chat, portal and product.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition"
                style={{ backgroundColor: brand.primary }}
              >
                Start free trial
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
                Watch demo
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

          {/* Hero Illustration */}
          <div className="relative px-4 sm:px-0">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur md:-inset-0.5" />
            <div className="relative rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              {/* Search bar */}
              <div className="flex items-center gap-2 rounded-2xl border border-[--border-subtle] bg-[--surface] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-[--brand-primary]" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search articles, guides, and FAQs"
                />
              </div>
              {/* Results preview */}
              <div className="mt-4 space-y-3">
                {[
                  {
                    t: "Getting started: 3 step setup",
                    k: ["Install snippet", "Connect sources", "Publish KB"],
                  },
                  {
                    t: "What counts as a billable conversation?",
                    k: ["Billing", "Usage", "Fair policy"],
                  },
                  {
                    t: "Enable proactive prompts from the KB",
                    k: ["Signals", "Prompts", "Targeting"],
                  },
                ].map((r) => (
                  <div
                    key={r.t}
                    className="rounded-xl border border-[--border-subtle] bg-white p-3"
                  >
                    <div className="text-sm font-semibold text-slate-800">
                      {r.t}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      {r.k.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2 py-0.5 text-[10px] text-[--brand-primary]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY IT MATTERS ===== */}
      <section
        id="why"
        className="mx-auto max-w-7xl rounded-3xl bg-white/60 px-0 py-12 shadow-[inset_0_1px_0_var(--border-subtle)] backdrop-blur-[2px] sm:px-6"
      >
          <div className="grid items-center gap-10 px-4 sm:px-0 md:grid-cols-2">
            <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why a unified knowledge base matters
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Support teams repeat the same answers. Customers expect
              self-service. Without one source of truth, answers drift and cost
              rises.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              {[
                "Reduce repetitive tickets and cost per resolution",
                "Deliver consistent answers across chat, portal and app",
                "Unlock 24/7 self-service with search that understands intent",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-600" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgraded Illustration */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-5 shadow-sm">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">
                  Searches (last 7 days)
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-block h-2 w-2 rounded-full bg-[--brand-primary]" />{" "}
                  Live
                </div>
              </div>

              {/* Sparkline bars */}
              <div className="mt-3 grid grid-cols-12 items-end gap-1">
                {[18, 24, 30, 22, 34, 38, 44, 36, 28, 48, 52, 47].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="rounded-t bg-[--brand-primary]"
                      style={{
                        height: `${h}px`,
                        opacity: 0.35 + (i / 12) * 0.5,
                      }}
                    />
                  )
                )}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {/* Left: Chat → Article flow */}
                <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-4">
                  <div className="text-xs font-semibold text-slate-600">
                    Chat → Article resolution
                  </div>

                  {/* User bubble */}
                  <div className="mt-3 max-w-[92%] rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm ring-1 ring-[--border-subtle]">
                    "How do I set up pricing tiers?"
                  </div>

                  {/* Agent suggestion */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-block h-6 w-6 rounded-full bg-[--brand-primary]/10" />
                    <div className="text-xs text-slate-600">Agent suggests</div>
                  </div>

                  {/* Article pill */}
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-3 py-1.5 text-xs text-[--brand-primary]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[--brand-primary]" />{" "}
                    Pricing &amp; Plans →{" "}
                    <span className="text-slate-500">Guide</span>
                  </div>

                  {/* Success tag */}
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />{" "}
                    Resolved via KB
                  </div>
                </div>

                {/* Right: Top intents with progress */}
                <div className="rounded-xl border border-[--border-subtle] bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600">
                    Top intents
                  </div>
                  <div className="mt-3 space-y-3">
                    {[
                      { q: "pricing setup", v: 82 },
                      { q: "sso login", v: 63 },
                      { q: "import csv", v: 41 },
                      { q: "cancel plan", v: 24 },
                    ].map((i) => (
                      <div key={i.q}>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate pr-2">{i.q}</span>
                          <span>{i.v}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded bg-[--surface-alt]">
                          <div
                            className="h-2 rounded bg-[--brand-primary]"
                            style={{ width: `${i.v}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insight banner */}
                  <div className="mt-4 rounded-lg border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-3 text-[11px] text-[--brand-primary]">
                    Insight: 42% of searches relate to pricing setup. Add a
                    guided article.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS (Modernized) ===== */}
      <section
        id="how"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-0 py-16 sm:px-6"
      >
        <div className="px-4 sm:px-0">
          {/* Header Row */}
          <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Capture, organize, enable, and optimize — all in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Signal-ready
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privacy-aware
            </span>
          </div>
        </div>

        {/* Modern Stepper Grid */}
        <div className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              k: "1",
              t: "Capture & Import",
              d: "Bring in existing docs, FAQs, PDFs and chat transcripts.",
            },
            {
              k: "2",
              t: "Organize & Tag",
              d: "Categories, entities and synonyms power smarter search.",
            },
            {
              k: "3",
              t: "Enable Everywhere",
              d: "Expose in chat, portal and product with one toggle.",
            },
            {
              k: "4",
              t: "Optimize & Evolve",
              d: "Analytics reveal gaps; improve articles iteratively.",
            },
          ].map((c, idx) => (
            <div
              key={c.k}
              className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition duration-300 hover:shadow-md"
            >
              {/* Glow / Accent */}
              <div
                className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(300px 160px at 30% 0%, ${brand.primary}14 0%, transparent 70%)`,
                }}
                aria-hidden
              />

              {/* Step Badge */}
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                  {c.k}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{c.t}</h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{c.d}</p>

              {/* Progress underline */}
              <div className="mt-5 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-20" />

              {/* Connectors (only on larger screens) */}
              {idx !== 3 && (
                <div className="absolute right-[-12px] top-[38px] hidden h-px w-6 bg-gradient-to-r from-[--border-subtle] to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>

        {/* Inline Tips Row */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Import sources",
              value: "Notion · Confluence · Drive · HTML · PDF",
            },
            { label: "Tagging helpers", value: "Synonyms · Entities · Owners" },
            {
              label: "Channels",
              value: "Chat Widget · Help Center · In-product",
            },
            {
              label: "Optimization",
              value: "No-result queries · CTR · Article health",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-[--border-subtle] bg-white p-4 text-xs"
            >
              <div className="font-semibold text-slate-700">{label}</div>
              <div className="mt-1 text-slate-500">{value}</div>
            </div>
          ))}
        </div>
          </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        id="features"
        className="mx-auto max-w-7xl rounded-3xl bg-white px-0 py-14 shadow-sm ring-1 ring-[--border-subtle] sm:px-6"
      >
          <div className="px-4 sm:px-0">
            <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Core features
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Everything you need to make content useful, and keep it that way.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Built-in analytics
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Team workflows
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🔎",
              t: "Smart search",
              d: "Natural-language queries, typo-tolerant and context-aware suggestions.",
            },
            {
              icon: "📚",
              t: "Unified repository",
              d: "Centralize internal and external knowledge in one place.",
            },
            {
              icon: "📈",
              t: "Gap analytics",
              d: "Track no-result queries and article performance to fill gaps.",
            },
            {
              icon: "✍️",
              t: "Authoring & versioning",
              d: "Simple editor, drafts, approvals and change history.",
            },
            {
              icon: "🔐",
              t: "Permissions & roles",
              d: "Control access with RBAC and private collections.",
            },
            {
              icon: "🌐",
              t: "Multichannel delivery",
              d: "Serve content in chat, help center, app and mobile.",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition hover:shadow-md"
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
          </div>
      </section>

      {/* ===== COMPARE ===== */}
      <section
        id="compare"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface-alt] px-0 py-14 ring-1 ring-[--border-subtle] sm:px-6"
      >
        <div className="px-4 sm:px-0">
          <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-tight">
              Traditional KB vs Advancelytics KB
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Reactive content sits and waits. Our KB powers proactive answers
              in the moment of need.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Lifecycle-aware
            </span>
            <span className="ml-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Agent-integrated
            </span>
          </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Traditional */}
          <div className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Traditional KB</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                "Relies on users to search manually",
                "Limited understanding of intent",
                "Articles often go stale",
                "No insight into what is missing",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "Static", v: "Experience" },
                { k: "Low", v: "Find rate" },
                { k: "Manual", v: "Upkeep" },
              ].map((m) => (
                <div
                  key={m.v}
                  className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3 text-center"
                >
                  <div className="text-base font-bold text-slate-800">
                    {m.k}
                  </div>
                  <div className="text-[11px] text-slate-500">{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Advancelytics */}
          <div className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-[0_8px_30px_rgba(0,106,255,0.08)] transition hover:shadow-[0_10px_40px_rgba(0,106,255,0.15)]">
            <h3 className="text-lg font-semibold text-[--brand-primary]">
              Advancelytics KB
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {[
                "Proactive surfacing based on behavior signals",
                "Intent-aware suggestions in chat and portal",
                "Auto-gap detection and content recommendations",
                "Unified answers across channels",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 text-[--brand-primary]" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { k: "Dynamic", v: "Experience" },
                { k: "High", v: "Find rate" },
                { k: "Continuous", v: "Improvement" },
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
                "Search intent",
                "Pricing help",
                "Onboarding tips",
                "Troubleshooting",
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
        </div>
      </section>

      {/* ===== ANALYTICS ILLUSTRATION ===== */}
      <section
        id="demo"
        className="relative mx-4 max-w-7xl overflow-hidden rounded-3xl border border-[--border-subtle] bg-white px-0 py-10 shadow-sm sm:mx-auto sm:px-6"
      >
        <div className="px-4 sm:px-0 grid items-center gap-10 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold">
              See which questions your KB cannot answer yet
            </h3>
            <p className="mt-2 max-w-md text-slate-600">
              Gap analytics reveal what users search, what they click, and where
              they get stuck so you can prioritize new content.
            </p>
            <a
              href="#cta"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-md transition"
              style={{ backgroundColor: brand.primary }}
            >
              See how it works
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Illustration */}
          <div className="relative">
            <div className="relative w-full overflow-hidden rounded-2xl border border-[--border-subtle] bg-gradient-to-br from-slate-50 to-[--brand-primary]/5 p-5">
              <div className="relative mx-auto h-64 w-full max-w-md rounded-2xl border border-[--border-subtle] bg-white p-4 shadow">
                {/* Simple analytics bars */}
                <div className="text-xs font-semibold text-slate-500">
                  Top searches
                </div>
                <div className="mt-2 space-y-2">
                  {[
                    { q: "pricing setup", v: 80 },
                    { q: "sso login", v: 56 },
                    { q: "import csv", v: 38 },
                    { q: "cancel plan", v: 22 },
                  ].map((i) => (
                    <div key={i.q}>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{i.q}</span>
                        <span>{i.v}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded bg-[--surface-alt]">
                        <div
                          className="h-2 rounded bg-[--brand-primary]"
                          style={{ width: `${i.v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-500">
                  No-result queries
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                  {["data residency", "mfa device reset"].map((t) => (
                    <div
                      key={t}
                      className="inline-flex items-center gap-2 rounded border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2 py-1 text-[--brand-primary]"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Illustration preview (replace with product visuals anytime).
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="mx-auto max-w-7xl px-0 py-16 sm:px-6">
        <div className="px-4 sm:px-0">
          <h2 className="text-balance text-3xl font-bold tracking-tight">FAQ</h2>
          <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-[--border-subtle] bg-white">
          {[
            {
              q: "Can we import existing docs?",
              a: "Yes. Upload markdown, HTML or PDFs, or sync from tools like Notion, Confluence or Google Drive.",
            },
            {
              q: "Does it work with the Proactive Agent?",
              a: "Yes. The agent uses KB content to craft answers and proactive prompts, keeping context across channels.",
            },
            {
              q: "How long does setup take?",
              a: "Most teams go live in minutes using the import wizard and presets.",
            },
            {
              q: "What analytics are included?",
              a: "Search trends, click-through, no-result queries, article performance and satisfaction scores.",
            },
          ].map((f) => (
            <details key={f.q} className="group">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-800 transition hover:bg-[--surface]">
                {f.q}
              </summary>
              <div className="px-5 pb-5 text-sm text-slate-600">{f.a}</div>
              <div className="h-px w-full bg-slate-200" />
            </details>
          ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        id="cta"
        className="relative mx-4 max-w-7xl overflow-hidden rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 shadow-sm sm:mx-auto sm:px-6"
      >
        <div className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-[--brand-primary]/20 blur-3xl md:right-[-10%]" />
        <div className="grid items-start gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <h3 className="text-3xl font-bold">
              Transform content into conversions
            </h3>
            <p className="mt-2 max-w-xl text-slate-600">
              Publish once, answer everywhere. Your knowledge base fuels
              proactive support and onboarding.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition"
                style={{ backgroundColor: brand.primary }}
              >
                Book a demo
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
          </div>
          <div className="md:col-span-2">
            <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-lg">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 rounded-full bg-[--brand-primary]/10 blur-2xl md:translate-x-1/2" />
              <h4 className="text-sm font-semibold text-slate-700">
                Quick Setup
              </h4>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    n: 1,
                    t: "Import content",
                    s: "Upload or sync from docs, sites and tools.",
                  },
                  {
                    n: 2,
                    t: "Tag & organize",
                    s: "Create categories, synonyms and owners.",
                  },
                  {
                    n: 3,
                    t: "Enable in channels",
                    s: "Expose in chat, help center and inside your app.",
                  },
                  {
                    n: 4,
                    t: "Measure & improve",
                    s: "Use analytics to fill gaps and keep content fresh.",
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
              <div className="mt-5 rounded-xl border border-[--border-subtle] bg-[--surface] p-3 text-[11px] text-slate-700">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Install snippet
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px]">{`<script src="https://cdn.agentlytics.dev/knowledge-base.js" async></script>`}</pre>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[--border-subtle] bg-white p-3 text-[11px]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">
                  Safe defaults, easy rollback, no vendor lock-in.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[--border-subtle] bg-white">
        <div className="mx-auto max-w-7xl px-0 py-8 text-sm text-slate-500 sm:px-6">
          <div className="px-4 sm:px-0">
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
        </div>
      </footer>
    </div>
  );
}
