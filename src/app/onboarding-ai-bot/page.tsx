// Advancelytics — Onboarding AI Bot (Full Page)
// Calendly-style theme reused; lighter hero; modern sections
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

export default function OnboardingAIBotPage() {
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
              Onboarding AI Bot
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
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
            <a href="#security" className="hover:text-slate-900">
              Security
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
              Turn onboarding steps into a guided conversation
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Traditional onboarding makes people guess what to do next.
              Agentlytics explains why each field matters, answers questions
              in-flow, and adapts the path so users finish faster — and happier.
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
              No code required · Works with your stack · Go live in minutes
            </p>
          </div>

          {/* Hero Illustration */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur" />
            <div className="relative rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="mb-4 text-sm font-semibold text-slate-700">
                Guided Onboarding Preview
              </div>

              {/* Form + Bot Assist */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  {[
                    { k: "Company name", v: "Acme Inc" },
                    { k: "Billing email", v: "billing@acme.co" },
                    { k: "Webhook URL", v: "https://api.acme.co/hook" },
                  ].map((f) => (
                    <div
                      key={f.k}
                      className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                    >
                      <div className="text-[11px] text-slate-500">{f.k}</div>
                      <div className="text-sm font-medium text-slate-800">
                        {f.v}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Agent Tip
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    Webhook URL lets us send event updates to your system.
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {["Why required?", "Use sample data", "Skip for now"].map(
                      (cta) => (
                        <button
                          key={cta}
                          className="rounded-full border border-[--brand-primary]/20 bg-white px-3 py-1 font-medium text-[--brand-primary] hover:bg-[--brand-primary]/5"
                        >
                          {cta}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: "Setup", v: 72 },
                  { k: "Validated", v: 56 },
                  { k: "Complete", v: 38 },
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

      {/* WHY THIS MATTERS */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Why AI‑guided onboarding wins
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Static checklists create drop‑offs. Our agent makes onboarding
              conversational, contextual, and confidence‑building.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[--border-subtle] bg-white p-4">
                <div className="mb-2 text-sm font-semibold text-slate-700">
                  Traditional Onboarding
                </div>
                <ul className="list-inside list-disc text-sm text-slate-600 space-y-1">
                  <li>One‑size‑fits‑all checklist</li>
                  <li>Confusing fields, no context</li>
                  <li>Support pings for basic questions</li>
                  <li>High drop‑off on technical steps</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-4">
                <div className="mb-2 text-sm font-semibold text-[--brand-primary]">
                  Agentlytics Onboarding AI
                </div>
                <ul className="list-inside list-disc text-sm text-slate-700 space-y-1">
                  <li>Explains the why behind each field</li>
                  <li>Instant answers, in‑flow</li>
                  <li>Detects friction & adapts the path</li>
                  <li>Faster time‑to‑value</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[--border-subtle] bg-[--surface] p-4 text-sm text-slate-700">
              Insight: 42% of users pause on API credentials. A guided “Why this
              matters” tooltip + sample keys increased completion by 28%.
            </div>
          </div>

          {/* Illustration card */}
          <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow">
            <div className="text-sm font-semibold text-slate-700 mb-4">
              Before vs After
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="font-bold text-slate-800 mb-2">Traditional</div>
                <p>Confusion on API scopes</p>
                <p>Idle 40s on “Webhook” step</p>
              </div>
              <div className="rounded-xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-4">
                <div className="font-bold text-[--brand-primary] mb-2">
                  With Agent
                </div>
                <p>Explains scopes with examples</p>
                <p>Offers sandbox key + test ping</p>
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
              Explain, assist, validate, personalize, and orchestrate — all
              automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Signal‑ready
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Privacy‑aware
            </span>
          </div>
        </div>

        <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
          {/* Left: Stepper */}
          <div className="space-y-4">
            {[
              {
                n: "1",
                t: "Explain",
                d: "Shows why each field is required with formats and examples.",
              },
              {
                n: "2",
                t: "Assist",
                d: "Answers questions instantly and links exact docs or a 20‑sec explainer.",
              },
              {
                n: "3",
                t: "Validate",
                d: "Pre‑checks inputs, scopes, and connectivity with in‑place fixes.",
              },
              {
                n: "4",
                t: "Personalize",
                d: "Adapts flow by intent (trial, POC, migration) and role.",
              },
              {
                n: "5",
                t: "Orchestrate",
                d: "Connects integrations, seeds sample data, and triggers milestones.",
              },
            ].map((s, i) => (
              <div
                key={s.n}
                className="group relative rounded-2xl border border-[--border-subtle] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {i < 4 && (
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

          {/* Right: Illustration */}
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/20 to-[--brand-accent]/20 blur"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-[--border-subtle] bg-white p-6 shadow-xl">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  "Field focus",
                  "Error: invalid key",
                  "Docs opened",
                  "Idle 30s",
                ].map((sig) => (
                  <span
                    key={sig}
                    className="rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2.5 py-1 text-[--brand-primary]"
                  >
                    {sig}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-[--border-subtle] bg-[--surface] p-4">
                <div className="text-[11px] font-semibold text-slate-500">
                  Agent Tip
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  Need a sandbox key? I can generate one and test the webhook.
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {[
                    "Fix format",
                    "Paste from clipboard",
                    "Use sandbox key",
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
              <div className="mt-5 h-2 w-full rounded bg-[--surface-alt]">
                <div
                  className="h-2 rounded bg-[--brand-primary]"
                  style={{ width: "72%" }}
                />
              </div>
              <div className="mt-2 text-right text-xs text-slate-500">
                Setup 72%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSIDE THE PROACTIVE BRAIN */}
      <section id="brain" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Inside the Proactive Brain
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Agentlytics reads behavior, not just text — engaging at the perfect
          moment with the perfect message.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              k: "I",
              t: "Intent Detection",
              d: "Focus, errors, idle time, and docs viewed trigger the right guidance.",
            },
            {
              k: "S",
              t: "Smart Prompts",
              d: "Offers next best actions like ‘Use sandbox key’ or ‘Map fields’.",
            },
            {
              k: "C",
              t: "Context Memory",
              d: "Remembers answers and preferences to avoid repetition.",
            },
            {
              k: "L",
              t: "Lifecycle Aware",
              d: "Moves from Trial → Activation → Expansion with the right steps.",
            },
          ].map((b) => (
            <div
              key={b.k}
              className="rounded-2xl border border-[--border-subtle] bg-white p-6"
            >
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
                {b.k}
              </div>
              <h3 className="text-base font-semibold text-slate-900">{b.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Designed to move users from “What is this?” to “I’m live.” — with
              fewer tickets.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-[--brand-primary]/10 px-3 py-1 text-xs font-semibold text-[--brand-primary]">
              Inline guidance
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              CRM & Docs aware
            </span>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🧭",
              t: "Guided Explanations",
              d: "Inline ‘Why this field?’ clarity for every step with examples.",
            },
            {
              icon: "💬",
              t: "Instant Q&A",
              d: "Ask anything; get precise, contextual answers from your docs.",
            },
            {
              icon: "✅",
              t: "Real‑time Validation",
              d: "Format checks, connectivity tests, dependency alerts and fixes.",
            },
            {
              icon: "🧠",
              t: "Adaptive Paths",
              d: "Auto‑skip irrelevant steps; insert only what’s needed.",
            },
            {
              icon: "📦",
              t: "Sample Data & Presets",
              d: "Seed a working setup in seconds with safe defaults.",
            },
            {
              icon: "🤝",
              t: "Human Handoff",
              d: "Escalate to a human with full context and transcript when needed.",
            },
            {
              icon: "📊",
              t: "Analytics Dashboard",
              d: "See drop‑offs, time‑to‑value, and friction hotspots.",
            },
            {
              icon: "🔗",
              t: "Smart Integrations",
              d: "Pull config from HubSpot, Salesforce, Slack, Segment and more.",
            },
            {
              icon: "🔒",
              t: "Compliance Ready",
              d: "PII controls, redact rules, and audit logs for enterprises.",
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

      {/* SECURITY & PRIVACY */}
      <section
        id="security"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Built for security‑first teams
            </h2>
            <p className="mt-3 max-w-xl text-slate-600">
              Enterprise‑grade controls ensure privacy at every step.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700">
              <li>Field‑level redaction and least‑privilege scopes</li>
              <li>Region‑aware data residency</li>
              <li>SSO/SAML, SCIM, and role‑based access</li>
              <li>Full audit trail of agent actions</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[--border-subtle] bg-white p-6">
            <div className="text-sm font-semibold text-slate-700 mb-3">
              Compliance Snapshot
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { k: "Data residency", v: "EU/US/IN" },
                { k: "SSO/SAML", v: "Okta, Azure AD" },
                { k: "PII controls", v: "Redact & mask" },
                { k: "Audit", v: "Full event log" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-xl border border-[--border-subtle] bg-[--surface] p-3"
                >
                  <div className="text-[11px] text-slate-500">{row.k}</div>
                  <div className="text-slate-800 font-medium">{row.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
          <div className="hidden md:block text-sm text-slate-500">
            CSAT ↑, time‑to‑value ↓
          </div>
        </div>

        {/* Logo row (placeholder badges) */}
        <div className="mt-6 flex flex-wrap items-center gap-3 opacity-80">
          {["Acme", "Northwind", "Globex", "Innotech", "Umbrella"].map((l) => (
            <span
              key={l}
              className="rounded-lg border border-[--border-subtle] bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {l}
            </span>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Sarah Chen",
              role: "Head of Product, Acme",
              inc: "+27% activation",
              quote:
                "Explaining the *why* behind fields cut our drop‑offs dramatically. Users finish setup without Slack pings.",
            },
            {
              name: "Diego Morales",
              role: "CX Lead, Northwind",
              inc: "−31% setup tickets",
              quote:
                "Inline Q&A and validation removed most “what does this mean?” questions. Our team can focus on complex cases.",
            },
            {
              name: "Priya Nair",
              role: "Growth PM, Innotech",
              inc: "TTFV −29%",
              quote:
                "Adaptive paths skip irrelevant steps. Time‑to‑first‑value is down and expansion trials go smoother.",
            },
          ].map((t, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-sm transition hover:shadow-md"
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
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary]">
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
        className="relative mx-auto max-w-7xl rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6"
      >
        <h2 className="text-3xl font-bold">
          Let your onboarding explain itself
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Install once. From there, your agent guides, validates, and gets users
          live — faster.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="#"
            className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            style={{ backgroundColor: brand.primary }}
          >
            Start Free
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
          14‑day free trial · No credit card required
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
