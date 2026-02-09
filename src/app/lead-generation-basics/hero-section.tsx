"use client";
import React from "react";
import DemoVideoModal from "../components/DemoVideoModal";

export default function HeroLeadSection({
  brand = {
    primary: "#006BFF", // solid brand blue
    primaryHover: "#0054D6",
    accent: "#38BDF8", // cyan accent
  },
}) {
  const [mounted, setMounted] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % 3);
    }, 2000);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, []);

  const signals = [
    "Exploring pricing page",
    "Scrolled 80%",
    "Hovering on contact link",
  ];

  return (
    <section
      className="relative isolate overflow-hidden rounded-b-[2rem] bg-[--surface] py-20 px-4 sm:px-6"
      style={
        {
          "--brand-primary": brand.primary,
          "--brand-primary-hover": brand.primaryHover,
          "--brand-accent": brand.accent,
        } as React.CSSProperties
      }
      aria-labelledby="hero-heading"
    >
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
      {/* decorative background halo */}
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${brand.primary}26 0%, transparent 60%)`,
        }}
      />

      <div
        className={`mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* LEFT COLUMN */}
        <div>
          <h1
            id="hero-heading"
            className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl"
          >
            Turn Visitors into Qualified Leads — Automatically
          </h1>

          <p className="mt-3 max-w-xl text-base font-medium text-rose-600">
            Every unengaged visitor is a lost opportunity — act before they
            leave.
          </p>

          <p className="mt-3 max-w-xl text-lg text-slate-600">
            Agentlytics detects behavior signals like scroll-depth, dwell time,
            and exit intent to trigger personalized prompts that capture
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

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a
              href="#cta"
              className="rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[--brand-primary] focus:ring-offset-2"
              style={{ backgroundColor: brand.primary }}
            >
              Start Free — Capture More Leads Instantly
            </a>

            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="rounded-2xl border border-[--brand-primary] px-6 py-3 text-sm font-semibold text-[--brand-primary] transition hover:bg-[--brand-primary] hover:text-white focus:outline-none focus:ring-4 focus:ring-[--brand-primary] focus:ring-offset-2"
            >
              Watch a Demo
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            No code required · 14-day free trial · No credit card
          </p>
        </div>

        {/* RIGHT COLUMN — Animated Illustration */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-[--brand-primary]/10 to-[--brand-accent]/10 blur-md opacity-60" />
          <div className="relative rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
            <div className="mb-4 text-sm font-semibold text-slate-700">
              Live Lead Capture Preview
            </div>

            <div className="space-y-3">
              {signals.map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center justify-between rounded-xl p-3 transition-all duration-300 ${
                    i === activeIdx
                      ? "bg-[--brand-primary]/10 shadow-sm"
                      : "bg-[--surface]"
                  }`}
                >
                  <span
                    className={`text-sm transition-colors ${
                      i === activeIdx
                        ? "text-[--brand-primary]"
                        : "text-slate-700"
                    }`}
                  >
                    {item}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                      i === activeIdx
                        ? "bg-[--brand-primary]/20 text-[--brand-primary]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {i === activeIdx ? "Detected" : "Idle"}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mt-4 rounded-xl border border-[--brand-primary]/20 bg-[--brand-primary]/5 p-3 text-sm text-[--brand-primary] transition-all duration-500"
              style={{
                transform: "scale(1.02)",
                boxShadow: "0 0 12px -2px var(--brand-primary-hover)/15",
              }}
            >
              AI Prompt: “Looks like you're exploring pricing. Want to see ROI
              in action?”
            </div>

            <div className="mt-4 text-xs text-slate-500 text-center">
              Real-time detection of high-intent visitor actions
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
