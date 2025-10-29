// Advancelytics — Lead Generation (Full Page)
// Lighter hero, Calendly-style theme, and all sections restored
"use client";
// Advancelytics — Lead Generation (Updated Full Page)
// Fix: Define LOGOS and inline SVG logo components to resolve ReferenceError.
// Implements: pain‑point line, social proof logos + inline testimonials, numeric impact,
// CTA microcopy, Before→After mini‑graphic, SEO meta tags (commented Head),
// accessibility hover color (#004FCC), and marquee with hover‑to‑pause.

import React, { useEffect, useState } from "react";
// If you are on Next.js, uncomment the next line and the <Head> block below for SEO tags.
// import Head from "next/head";

const brand = {
  primary: "#006BFF",
  primaryHover: "#004FCC", // darker for WCAG AA
  accent: "#0AE8F0",
  bgFrom: "#F3F9FF",
  bgTo: "#FFFFFF",
  glow: "#CDE6FF",
  surface: "#FDFFFF", // bright hero/card surface
  surfaceAlt: "#F6FBFF",
  borderSubtle: "#E3EEFF",
};

// -------------------------
// Inline monochrome SVG logos
// (Replace with brand SVGs when available; these scale with currentColor.)
// -------------------------
const LogoCloudScale = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 28" {...props} aria-hidden="true">
    <g fill="currentColor">
      <path
        d="M18 20c-4.971 0-9-3.582-9-8 0-4.084 2.94-7.49 6.96-7.95C17.12 2.86 19.86 1 23 1c5.523 0 10 4.03 10 9 0 .34-.02.675-.06 1.005C37.3 11.45 40 14.38 40 18c0 4.418-4.029 8-9 8H18z"
        opacity=".18"
      />
      <circle cx="22" cy="11" r="4" opacity=".35" />
      <rect x="48" y="8" width="3" height="12" rx="1" />
      <rect x="54" y="6" width="3" height="14" rx="1" />
      <rect x="60" y="10" width="3" height="10" rx="1" />
      <rect x="66" y="4" width="3" height="16" rx="1" />
      <text
        x="78"
        y="18"
        fontFamily="Inter,system-ui,Arial"
        fontSize="10"
        fontWeight="600"
      >
        CloudScale
      </text>
    </g>
  </svg>
);

const LogoFinServe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 28" {...props} aria-hidden="true">
    <g fill="currentColor">
      <path d="M8 20l10-12 6 7 7-9 9 14H8z" opacity=".25" />
      <rect x="10" y="18" width="96" height="2" rx="1" opacity=".35" />
      <text
        x="14"
        y="16"
        fontFamily="Inter,system-ui,Arial"
        fontSize="10"
        fontWeight="600"
      >
        FinServe
      </text>
    </g>
  </svg>
);

const LogoTechFlow = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 28" {...props} aria-hidden="true">
    <g fill="currentColor">
      <circle cx="16" cy="12" r="6" opacity=".25" />
      <path
        d="M22 12h12m4 0h4m4 0h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text
        x="52"
        y="16"
        fontFamily="Inter,system-ui,Arial"
        fontSize="10"
        fontWeight="600"
      >
        TechFlow
      </text>
    </g>
  </svg>
);

const LogoGeneric = ({
  label,
  ...props
}: React.SVGProps<SVGSVGElement> & { label: string }) => (
  <svg viewBox="0 0 120 28" {...props} aria-hidden="true">
    <g fill="currentColor">
      <rect x="12" y="6" width="24" height="16" rx="6" opacity=".2" />
      <rect x="42" y="10" width="8" height="8" rx="2" opacity=".35" />
      <text
        x="54"
        y="16"
        fontFamily="Inter,system-ui,Arial"
        fontSize="10"
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  </svg>
);

// LOGOS used by the marquee — duplicated for seamless loop
const LOGOS = [
  { name: "CloudScale", Icon: LogoCloudScale },
  { name: "FinServe", Icon: LogoFinServe },
  { name: "TechFlow", Icon: LogoTechFlow },
  {
    name: "RetailX",
    Icon: (p: React.SVGProps<SVGSVGElement>) => (
      <LogoGeneric label="RetailX" {...p} />
    ),
  },
  {
    name: "DevSuite",
    Icon: (p: React.SVGProps<SVGSVGElement>) => (
      <LogoGeneric label="DevSuite" {...p} />
    ),
  },
  {
    name: "DataPilot",
    Icon: (p: React.SVGProps<SVGSVGElement>) => (
      <LogoGeneric label="DataPilot" {...p} />
    ),
  },
];

export default function LeadGenerationPage() {
  const styleVars = {
    "--brand-primary": brand.primary,
    "--brand-accent": brand.accent,
    "--surface": brand.surface,
    "--surface-alt": brand.surfaceAlt,
    "--border-subtle": brand.borderSubtle,
  } as React.CSSProperties;

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="relative min-h-screen w-full text-slate-900 antialiased"
      style={styleVars}
    >
      {/*
      <Head>
        <title>Advancelytics — Lead Generation</title>
        <meta
          name="description"
          content="Capture and convert visitors instantly using behavioral AI triggers — 2.8× more leads, 40% faster response."
        />
        <meta
          name="keywords"
          content="lead capture automation, behavioral ai chatbot, conversion intelligence, crm lead sync"
        />
        <link rel="canonical" href="https://www.advancelytics.com/lead-generation" />
      </Head>
      */}

      {/* Global styles for marquee animation */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .trusted-wrap{ overflow: hidden; }
        .trusted-mask{ mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        .trusted-track{ display: flex; gap: 2.5rem; width: max-content; align-items: center; animation: marquee 26s linear infinite; }
        .trusted-track:hover{ animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .trusted-track{ animation: none; } }
      `}</style>

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
      <header className="sticky top-0 z-40 border-b border-[--border-subtle] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[--brand-primary]" />
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Lead Generation
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
            <a href="#logos" className="hover:text-slate-900">
              Trusted by
            </a>
            <a href="#cta" className="hover:text-slate-900">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle — match ai-chatbots */}
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
            <a
              href="#demo"
              className="hidden rounded-xl border border-[--border-subtle] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[--surface] md:inline-block"
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
              Start Free — Capture More Leads Instantly
            </a>
          </div>
        </div>
        {/* Mobile menu panel — match ai-chatbots animation and CSS */}
        <div
          id="mobile-menu"
          aria-hidden={!menuOpen}
          className={`md:hidden absolute right-0 top-full z-50 w-[60vw] border-t border-l border-slate-200 bg-white rounded-b-2xl shadow-lg origin-top-right transform transition-all duration-300 ease-out ${
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
                onClick={() => setMenuOpen(false)}
              >
                Why
              </a>
              <a
                href="#how"
                className="py-2 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#features"
                className="py-2 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#logos"
                className="py-2 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Trusted by
              </a>
              <a
                href="#cta"
                className="py-2 hover:text-slate-900"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </a>
              {/* Buttons in dropdown */}
              <a
                href="#cta"
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                style={{ backgroundColor: brand.primary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = brand.primary)
                }
                onClick={() => setMenuOpen(false)}
              >
                Start Free — Capture More Leads Instantly
              </a>
              <a
                href="#demo"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                Watch demo
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Backdrop overlay — match ai-chatbots (no tint, click to close) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* HERO */}
      <section className="relative isolate rounded-b-[2rem] bg-[--surface] py-20 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${brand.primary}26 0%, transparent 60%)`,
          }}
          aria-hidden
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Turn Visitors into Qualified Leads — Automatically
            </h1>
            <p className="mt-3 max-w-xl text-base font-medium text-rose-600">
              Every unengaged visitor is a lost opportunity — act before they
              leave.
            </p>
            <p className="mt-3 max-w-xl text-lg text-slate-600">
              Agentlytics detects behavior signals like scroll-depth, dwell
              time, and exit intent to trigger personalized prompts that capture
              high-intent leads before they leave.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-slate-500">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                2.8× more leads
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                40% faster response
              </span>
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 font-semibold text-cyan-700">
                Live in minutes
              </span>
            </div>
            <div className="mt-8 flex gap-3">
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
                Start Free — Capture More Leads Instantly
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
            <p className="mt-4 text-sm text-slate-500">
              No code required · 14-day free trial · No credit card
            </p>
          </div>
          {/* Lead Capture Preview */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur" />
            <div className="relative rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="mb-4 text-sm font-semibold text-slate-700">
                Live Lead Capture Preview
              </div>
              <div className="space-y-3">
                {[
                  "Exploring pricing page",
                  "Scrolled 80%",
                  "Hovering on contact link",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                  >
                    <span className="text-sm text-slate-700">{item}</span>
                    <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-[11px] text-[--brand-primary]">
                      Detected
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-3 text-sm text-[--brand-primary]">
                AI Prompt: “Looks like you're exploring pricing. Want to see ROI
                in action?”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY / LOGOS + Inline Testimonials */}
      <section id="logos" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="rounded-2xl border border-[--border-subtle] bg-white/70 p-4">
          <p className="text-center text-sm font-semibold text-slate-600">
            Trusted by teams at
          </p>
          {/* Marquee logos with SVG components */}
          <div className="trusted-wrap trusted-mask mt-4">
            <div className="trusted-track text-slate-500">
              {[...LOGOS, ...LOGOS].map(({ name, Icon }, idx) => (
                <div
                  key={`${name}-${idx}`}
                  className="group flex h-10 w-[160px] items-center justify-center rounded-xl border border-transparent px-3 transition hover:border-[--border-subtle]"
                  aria-label={name}
                  title={name}
                >
                  <Icon className="h-6 w-auto opacity-80 transition-opacity group-hover:opacity-100" />
                  <span className="sr-only">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            Hover to pause
          </p>

          {/* Inline Testimonials (inside the same card) */}
          <div className="mt-6">
            <h3 className="text-center text-base font-semibold text-slate-700">
              What customers say
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                {
                  quote:
                    "2.9× more captured leads in 30 days. Instantly visible in HubSpot.",
                  name: "Priya S.",
                  role: "Head of Growth, CloudScale",
                },
                {
                  quote:
                    "Response times dropped by 42% and demo bookings jumped.",
                  name: "Alex R.",
                  role: "VP Sales, FinServe",
                },
                {
                  quote:
                    "Behavior prompts qualify for us — reps focus only on closers.",
                  name: "Maya T.",
                  role: "PMM, TechFlow",
                },
              ].map((t, i) => (
                <figure
                  key={i}
                  className="rounded-2xl border border-[--border-subtle] bg-[--surface] p-4"
                >
                  <blockquote className="text-sm text-slate-700">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-3 text-[13px] text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {t.name}
                    </span>{" "}
                    · {t.role}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY SECTION with Before→After mini-graphic */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why proactive lead capture matters
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Most website visitors leave without engaging. Traditional forms
              wait for users — Agentlytics acts first, detecting intent and
              starting contextual conversations that convert.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>2.8× more leads with behavior-driven prompts</li>
              <li>40% faster response → faster pipeline velocity</li>
              <li>Automated capture, scoring, and CRM sync</li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow">
            <div className="mb-4 text-sm font-semibold text-slate-700">
              Before vs After
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="mb-2 font-bold text-slate-800">Static Form</div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Waits for input</li>
                  <li>Low intent signal</li>
                  <li>Drop-offs</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-4">
                <div className="mb-2 font-bold text-[--brand-primary]">
                  AI Conversation
                </div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Detects & engages</li>
                  <li>Context-aware prompts</li>
                  <li>CRM-ready leads</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Detect, engage, qualify, and route — all automatically.
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
        <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
          <div className="space-y-4">
            {[
              {
                n: "1",
                t: "Detect & Trigger",
                d: "Behavior signals detect high-intent visitors.",
              },
              {
                n: "2",
                t: "Engage & Capture",
                d: "AI prompts start conversations and collect data.",
              },
              {
                n: "3",
                t: "Qualify & Route",
                d: "Lead scoring and routing to right team instantly.",
              },
              {
                n: "4",
                t: "Nurture & Close",
                d: "Workflows and insights drive conversions.",
              },
            ].map((s, i) => (
              <div
                key={s.n}
                className="group relative rounded-2xl border border-[--border-subtle] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {i < 3 && (
                  <div className="absolute left-6 top-[64px] hidden h-8 w-px bg-gradient-to-b from-[--border-subtle] to-transparent md:block" />
                )}
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {s.t}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                  </div>
                </div>
                <div className="mt-4 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-20" />
              </div>
            ))}
          </div>
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {["Scroll 75%", "Dwell 45s", "Exit intent", "Pricing page"].map(
                  (sig) => (
                    <span
                      key={sig}
                      className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                    >
                      {sig}
                    </span>
                  )
                )}
              </div>
              <div className="mt-4 rounded-2xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  AI Prompt
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  “Comparing plans? I can estimate your ROI in 30s.”
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {[
                    "ROI Estimator",
                    "Book 15‑min demo",
                    "Send pricing PDF",
                  ].map((cta) => (
                    <button
                      key={cta}
                      className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 font-medium text-[--brand-primary] hover:bg-[--brand-primary]/5"
                    >
                      {cta}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[--border-subtle] bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600">
                    Lead capture
                  </div>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-800">
                        alex@acme.co
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Company</span>
                      <span className="font-medium text-slate-800">
                        Acme Inc
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Use case</span>
                      <span className="font-medium text-slate-800">
                        Pricing rollout
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[--border-subtle] bg-white p-4">
                  <div className="text-xs font-semibold text-slate-600">
                    Score & route
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      Score 86
                    </span>
                    <span className="rounded-full bg-[--brand-primary]/10 px-2.5 py-1 text-[--brand-primary]">
                      AE • West
                    </span>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500">
                    Rules: Pricing intent + Company size (50‑250) + ICP match
                  </div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "Capture rate", v: 72 },
                  { k: "Qualified", v: 58 },
                  { k: "Booked", v: 21 },
                ].map((m) => (
                  <div
                    key={m.k}
                    className="rounded-lg border border-[--border-subtle] bg-[--surface] p-3"
                  >
                    <div className="text-[11px] text-slate-500">{m.k}</div>
                    <div className="mt-1 text-base font-bold text-slate-800">
                      {m.v}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Designed to capture every qualified lead effortlessly.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Signal-driven
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              CRM-ready
            </span>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "⚡",
              t: "Behavioral Triggers",
              d: "Scroll depth, dwell time, exit intent and more — precisely detected without perf hit.",
            },
            {
              icon: "💬",
              t: "Smart Prompts",
              d: "Micro‑copy tailored to journey stage and intent. Inline chips for one‑tap actions.",
            },
            {
              icon: "🎯",
              t: "Lead Scoring",
              d: "Score high‑intent sessions in real time and prioritize handoffs automatically.",
            },
            {
              icon: "🔗",
              t: "CRM Sync",
              d: "Instant push to HubSpot, Salesforce and more with field mapping and dedupe.",
            },
            {
              icon: "📊",
              t: "Analytics Dashboard",
              d: "Capture rate, time‑to‑contact, source mix and drop‑offs — all live.",
            },
            {
              icon: "🤖",
              t: "Automation Workflows",
              d: "Auto‑route, nurture sequences, and SLAs with alerts when action is needed.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div
                className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(260px 140px at 20% 0%, ${brand.primary}22 0%, transparent 70%)`,
                }}
                aria-hidden
              />
              <div className="relative z-10 flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[--brand-primary]/10 text-xl text-[--brand-primary]">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {f.t}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{f.d}</p>
                </div>
              </div>
              <div className="relative z-10 mt-5 h-1 w-0 rounded bg-[--brand-primary] transition-all duration-500 group-hover:w-20" />
            </div>
          ))}
        </div>
      </section>

      {/* (Removed standalone testimonial section; testimonials now live inside the Trusted by card) */}

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-4 sm:mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6"
      >
        <h2 className="text-3xl font-bold">
          Capture high-intent leads before they bounce
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Paste the script, choose triggers, and watch Agentlytics automatically
          start conversations that convert visitors into qualified leads.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="#"
            className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            style={{ backgroundColor: brand.primary }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = brand.primaryHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = brand.primary)
            }
          >
            Start Free — Capture More Leads Instantly
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
          14-day free trial · No credit card required
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
