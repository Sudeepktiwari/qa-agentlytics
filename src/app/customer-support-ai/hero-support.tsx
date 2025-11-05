// components/HeroSupportSection.jsx
import React from "react";
import HeroSupportIllustration from "./hero-illustration";

/**
 * HeroSupportSectionPolished
 * - Polished visuals, fixed CTA backgrounds, animated mock preview
 * - Props: brand = { primary, primaryHover, accent } (CSS vars or hex)
 *
 * Usage:
 * <HeroSupportSectionPolished brand={{ primary: "var(--brand-primary)", primaryHover: "#0054d6", accent: "#38bdf8" }} />
 */
export default function HeroSupportSection({
  brand = {
    primary: "var(--brand-primary)",
    primaryHover: "var(--brand-primary-hover, #0054d6)",
    accent: "var(--brand-accent, #38bdf8)",
  },
}) {
  const suggestions = [
    {
      title:
        "Looks like you’re on Billing Settings — here’s your latest invoice.",
      actions: ["Open invoice", "Show refund policy", "Send reset link"],
    },
    {
      title: "Repeated failed logins detected — offer a password reset?",
      actions: ["Send reset link", "Show MFA help", "Contact support"],
    },
    {
      title:
        "Trial user — show quick onboarding checklist to increase activation.",
      actions: ["Open checklist", "Book onboarding call", "Send quickstart"],
    },
  ];

  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
      },
      { threshold: 0.16 }
    );
    if (rootRef.current) io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => {
      if (!paused && visible) setActive((s) => (s + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(id);
  }, [paused, visible]);

  const cssVars = {
    "--brand-primary": brand.primary,
    "--brand-primary-hover": brand.primaryHover,
    "--brand-accent": brand.accent,
  };

  return (
    <section
      id="why"
      ref={rootRef}
      className="relative isolate rounded-b-[2rem] bg-[--surface] px-4 sm:px-6"
      style={cssVars as React.CSSProperties}
      aria-labelledby="hero-support-heading"
    >
      <div
        className={`mx-auto max-w-7xl ${
          visible ? "animate-hero-in" : "opacity-0 translate-y-6"
        } grid md:grid-cols-2 gap-12 items-center`}
      >
        {/* LEFT: content */}
        <div>
          <h1
            id="hero-support-heading"
            className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900"
          >
            Transform Support from Reactive to Predictive
          </h1>

          <p className="mt-4 text-lg text-slate-600 max-w-xl">
            Don’t wait for tickets — detect frustration, intent, and sentiment
            in real time and guide users to answers before they even ask.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* primary CTA: always blue background + white text */}
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded-2xl px-6 bg-[#006BFF] py-3 text-sm font-semibold text-white shadow-lg transform-gpu transition-transform duration-150 focus:outline-none focus:ring-4 focus:ring-[--brand-primary]/20"
              aria-label="Start Free - Boost CSAT Today"
            >
              Start Free — Boost CSAT Today
            </a>

            {/* secondary CTA: outline -> filled on hover */}
            <a
              href="#demo"
              className="rounded-2xl px-6 py-3 text-sm font-semibold border border-[--brand-primary] text-[--brand-primary] transition-colors duration-150 hover:bg-[--brand-primary] hover:text-white focus:outline-none focus:ring-4 focus:ring-[--brand-primary]/20"
              aria-label="Watch Demo"
            >
              Watch Demo
            </a>
          </div>
          <div className="mt-2 sm:mt-6 sm:ml-3 inline-flex items-center gap-2 rounded-full border border-[--border-subtle] bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-dot-pulse" />
            14-day trial — no card needed
          </div>

          {/* integrations */}
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            {["Zendesk", "Intercom", "Freshdesk", "Salesforce"].map((b, i) => (
              <span
                key={b}
                className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: polished preview mock */}
        <HeroSupportIllustration />
      </div>

      {/* scoped polish animations */}
      <style jsx>{`
        /* entrance */
        .animate-hero-in {
          animation: heroIn 640ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* CTA dot pulse */
        .animate-dot-pulse {
          animation: dotPulse 1800ms infinite ease-in-out;
        }
        @keyframes dotPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* suggestion transitions use transform + opacity handled inline via classes above */

        /* reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-dot-pulse,
          .animate-hero-in {
            animation: none !important;
          }
        }

        /* CTA gradient hover nicety */
        .cta-gradient {
          transition: transform 0.14s ease, filter 0.14s ease;
        }
        .cta-gradient:hover {
          transform: translateY(-2px);
          filter: brightness(1.02) saturate(1.03);
        }

        /* small screens: make primary/secondary full width stack */
        @media (max-width: 640px) {
          .cta-gradient,
          .inline-flex[href="#cta"] {
            width: 100%;
            display: inline-flex;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
