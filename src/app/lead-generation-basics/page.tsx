// Advancelytics — Lead Generation (Full Page)
// Lighter hero, Calendly-style theme, and all sections restored
"use client";
import React from "react";

const brand = {
  primary: "#006BFF",
  primaryHover: "#0055CC",
  accent: "#0AE8F0",
  bgFrom: "#F3F9FF",
  bgTo: "#FFFFFF",
  glow: "#CDE6FF",
  surface: "#FDFFFF", // bright hero/card surface
  surfaceAlt: "#F6FBFF",
  borderSubtle: "#E3EEFF",
};

export default function LeadGenerationPage() {
  return (
    <div
      className="relative min-h-screen w-full text-slate-900 antialiased"
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
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              style={{ backgroundColor: brand.primary }}
            >
              Start free
            </a>
          </div>
        </div>
      </header>

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
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Agentlytics detects behavior signals like scroll-depth, dwell
              time, and exit intent to trigger personalized prompts that capture
              high-intent leads before they leave.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="#cta"
                className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                style={{ backgroundColor: brand.primary }}
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
            <p className="mt-4 text-sm text-slate-500">
              No code required · Live in minutes · Capture more leads
            </p>
          </div>
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

      {/* WHY SECTION */}
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
              <li>Reduce bounce rate with real-time engagement</li>
              <li>Boost lead quality using behavior-based qualification</li>
              <li>Automate capture, scoring, and CRM sync</li>
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow">
            <div className="mb-4 text-sm font-semibold text-slate-700">
              Before vs After Agentlytics
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="mb-2 font-bold text-slate-800">Traditional</div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Static forms</li>
                  <li>Low conversion</li>
                  <li>No personalization</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-4">
                <div className="mb-2 font-bold text-[--brand-primary]">
                  Agentlytics
                </div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Behavior-driven prompts</li>
                  <li>Context-aware capture</li>
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

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6"
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
          >
            Get Started
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
