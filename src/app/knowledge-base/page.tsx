// Updated page.tsx — Knowledge Base with richer card & illustration animations
"use client";
import React, { useState, useEffect } from "react";

// ===== Theme tokens (Calendly-ish) =====
const brand = {
  primary: "#006BFF", // Calendly Blue
  primaryHover: "#0055CC",
  accent: "#0AE8F0",
  bgFrom: "#CCE1FF",
  bgTo: "#FFFFFF",
  glow: "#99C3FF",
  surface: "#F5F9FF",
  surfaceAlt: "#ECF4FF",
  borderSubtle: "#E3EEFF",
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
  // Mobile nav helper
  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    const href = (e.currentTarget.getAttribute("href") || "").trim();
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      const el = document.querySelector(href);
      if (el) {
        setTimeout(
          () =>
            (el as HTMLElement).scrollIntoView({
              behavior: "smooth",
              block: "start",
            }),
          0
        );
        try {
          history.replaceState(null, "", href);
        } catch {}
      } else {
        try {
          history.replaceState(null, "", href);
        } catch {}
      }
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    const handleBackdropClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.id === "mobileMenuBackdrop") setIsMobileMenuOpen(false);
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

  // Reveal on scroll + animation stagger wiring
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Intersection observer for reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            // if element has children with data-anim-delay, add in-view with stagger
            if (el.querySelectorAll("[data-anim-delay]").length) {
              el.querySelectorAll<HTMLElement>("[data-anim-delay]").forEach(
                (child) => {
                  const d = Number(child.dataset.animDelay || "0");
                  setTimeout(() => child.classList.add("in-view"), d);
                }
              );
            }
            el.classList.add("in-view");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );

    const reveals = Array.from(document.querySelectorAll(".reveal"));
    if (prefersReduced) {
      reveals.forEach((r) => r.classList.add("in-view"));
    } else {
      reveals.forEach((r) => observer.observe(r));
    }

    // Respect reduced motion: remove animations inline
    if (prefersReduced) {
      document
        .querySelectorAll('[class*="anim-"], [class*="animate-"]')
        .forEach((el) => {
          (el as HTMLElement).style.animation = "none";
          (el as HTMLElement).style.transition = "none";
        });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden text-slate-900 scroll-smooth"
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
      {/* Global animation keyframes & small helpers injected locally so this file is self-contained */}
      <style jsx global>{`
        :root {
          --brand-primary: ${brand.primary};
          --brand-accent: ${brand.accent};
          --brand-midnight: #0b1b34;
        }
        /* Reveal */
        .reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        /* keyframes */
        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
        }
        @keyframes pingSoft {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          80%,
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes wobble {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-1.5%) rotate(-0.4deg);
          }
          75% {
            transform: translateX(1.5%) rotate(0.4deg);
          }
        }
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* utilities */
        .animate-floaty,
        .anim-floaty {
          animation: floaty 6s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-pulseGlow,
        .anim-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .animate-pingSoft,
        .anim-pingSoft {
          animation: pingSoft 2s ease-out infinite;
        }
        .animate-wobble,
        .anim-wobble {
          animation: wobble 1s ease-in-out infinite;
        }
        .animate-scaleIn,
        .anim-scaleIn {
          animation: scaleIn 0.45s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }
        .animate-shimmer,
        .anim-shimmer {
          animation: shimmer 1.6s linear infinite;
          background-size: 200% 100%;
        }

        /* stagger helper: elements with data-anim-delay will be initially invisible; in-view class set by JS */
        [data-anim-delay] {
          opacity: 0;
          transform: translateY(6px) scale(0.995);
          transition: opacity 0.45s ease, transform 0.45s ease;
        }
        [data-anim-delay].in-view {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* hover micro-interactions for cards */
        .card-hover {
          transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.2, 1),
            box-shadow 0.28s cubic-bezier(0.2, 0.9, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 18px 40px rgba(2, 6, 23, 0.08);
        }
        .card-hover:hover .card-icon {
          transform: translateY(-4px) rotate(-4deg);
          transition: transform 0.3s ease;
        }

        /* subtle decorative motion on illustration badges */
        .badge-float {
          transition: transform 0.4s ease;
        }
        .badge-float.animate {
          transform: translateY(-6px) scale(1.02);
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-floaty,
          .animate-pulseGlow,
          .animate-pingSoft,
          .animate-wobble,
          .animate-scaleIn,
          .animate-shimmer,
          .anim-floaty,
          .anim-pulseGlow,
          .anim-pingSoft,
          .anim-wobble,
          .anim-scaleIn,
          .anim-shimmer {
            animation: none !important;
            transition: none !important;
          }
          [data-anim-delay] {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .card-hover:hover {
            transform: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Background wash */}
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

      {/* NAV */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
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
              onClick={() => setIsMobileMenuOpen((s) => !s)}
              className="ml-2 md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-[--surface]"
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

        {/* Mobile menu */}
        <div
          id="mobileMenu"
          aria-hidden={!isMobileMenuOpen}
          className={`md:hidden absolute right-0 top-full z-50 w-[60vw] bg-white rounded-b-2xl shadow-lg origin-top-right transform transition-all duration-300 ease-out ${
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
                onClick={handleMobileNavClick}
              >
                Why
              </a>
              <a
                href="#how"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                How it works
              </a>
              <a
                href="#features"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Features
              </a>
              <a
                href="#compare"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                Compare
              </a>
              <a
                href="#faq"
                className="py-2 hover:text-slate-900"
                onClick={handleMobileNavClick}
              >
                FAQ
              </a>
              <div className="my-2 border-t border-[--border-subtle]" />
              <a
                href="#demo"
                className="mt-2 w-full rounded-xl border border-[--border-subtle] px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-[--surface]"
                onClick={handleMobileNavClick}
              >
                Watch demo
              </a>
              <a
                href="#cta"
                className="w-full rounded-2xl px-4 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                style={{ backgroundColor: brand.primary }}
                onClick={handleMobileNavClick}
              >
                Start free
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative isolate overflow-hidden bg-[--surface]"
        style={{
          backgroundImage:
            "radial-gradient(100% 50% at 0% 0%, rgba(0,105,255,.10), transparent 60%), radial-gradient(80% 40% at 100% 0%, rgba(59,163,255,.12), transparent 60%)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-20 -left-20 w-[520px] h-[520px] rounded-full bg-blue-100 blur-3xl animate-pulseGlow"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -right-24 w-[460px] h-[460px] rounded-full bg-sky-100 blur-3xl animate-pulseGlow"
          aria-hidden
        />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20">
          <div className="px-4 sm:px-0 reveal">
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
                Start free trial <ArrowRight className="ml-2 h-4 w-4" />
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

          {/* Hero Illustration — more animated cards */}
          <div className="relative px-4 sm:px-0 reveal" data-anim-delay="50">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#DCEBFF] to-[#F2F7FF]" />
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-card card-hover">
              <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm animate-floaty">
                <span className="size-2 rounded-full bg-blue-400 card-icon" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                  placeholder="Search articles, guides, and FAQs"
                />
              </div>

              <div className="mt-4 grid gap-3">
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
                ].map((r, i) => (
                  <div
                    key={r.t}
                    className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm relative overflow-visible card-hover"
                    data-anim-delay={`${i * 80}`}
                  >
                    {/* floating badge */}
                    <div className="absolute -top-3 right-3 flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-full bg-white flex items-center justify-center shadow-sm badge-float"
                        data-anim-delay={`${i * 80 + 30}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="9" fill="url(#g)" />
                        </svg>
                      </div>
                    </div>

                    <div className="text-base font-semibold text-slate-800">
                      {r.t}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                      {r.k.map((tag, j) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"
                          data-anim-delay={`${i * 80 + j * 40}`}
                        >
                          <span className="size-1.5 rounded-full bg-blue-400" />{" "}
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* decorative floating KPIs */}
              <div
                className="absolute -left-4 -top-6 w-36 rounded-xl border bg-white p-3 text-center shadow-sm animate-pulseGlow"
                style={{ borderColor: `${brand.primary}33` }}
                data-anim-delay="120"
              >
                <div className="text-sm font-bold text-[--brand-primary]">
                  +2.8x
                </div>
                <div className="text-[11px] text-slate-500">Leads</div>
              </div>

              <div
                className="absolute -right-4 bottom-10 w-40 rounded-xl border bg-white p-3 text-center shadow-sm animate-floaty"
                style={{ borderColor: `${brand.primary}33` }}
                data-anim-delay="180"
              >
                <div className="text-sm font-bold text-[--brand-primary]">
                  -40%
                </div>
                <div className="text-[11px] text-slate-500">
                  Time to onboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section
        id="why"
        className="mx-auto max-w-7xl rounded-3xl bg-white/60 px-0 py-12 shadow-[inset_0_1px_0_var(--border-subtle)] backdrop-blur-[2px] sm:px-6 scroll-mt-24 reveal"
        data-anim-delay="40"
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
              ].map((b, i) => (
                <li
                  key={b}
                  className="flex items-start gap-2"
                  data-anim-delay={`${i * 80}`}
                >
                  <Check className="mt-0.5 h-5 w-5 text-emerald-600 animate-scaleIn" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgraded Illustration (animated sparkline + floating badges) */}
          <div className="relative reveal" data-anim-delay="80">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[--brand-primary]/15 blur-xl animate-pulseGlow" />

              {/* Header + sparkline */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">
                  Search activity (last 7 days)
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <span className="relative inline-flex items-center justify-center">
                    <span className="inline-block h-2 w-2 rounded-full bg-[--brand-primary]" />
                    <span className="absolute h-2 w-2 rounded-full bg-[--brand-primary]/40 animate-pingSoft" />
                  </span>
                  Live
                </div>
              </div>

              {/* sparkline bars (staggered) */}
              <div className="mt-3">
                <div className="grid grid-cols-12 items-end gap-1 h-24">
                  {[18, 24, 30, 22, 34, 38, 44, 36, 28, 48, 52, 47].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="rounded-t bg-[--brand-primary]"
                        style={{
                          height: `${h}px`,
                          opacity: 0.32 + (i / 12) * 0.6,
                          transition:
                            "transform .6s cubic-bezier(.2,.9,.2,1), opacity .6s ease",
                          transform: "translateY(14px) scaleY(.9)",
                          transformOrigin: "bottom center",
                        }}
                        data-anim-delay={`${i * 30 + 60}`}
                      />
                    )
                  )}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-500">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span key={d} className="w-12 text-center">
                        {d}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[--border-subtle] bg-[--surface] p-4">
                  <div className="text-xs font-semibold text-slate-600">
                    Query → Article resolution
                  </div>
                  <div className="mt-3 rounded-xl border border-[--border-subtle] bg-white p-3 text-sm text-slate-700">
                    Query: "How do I set up pricing tiers?"
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Suggested article
                  </div>
                  <div
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-3 py-1.5 text-xs text-[--brand-primary]"
                    data-anim-delay="120"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[--brand-primary]" />{" "}
                    Pricing &amp; Plans →{" "}
                    <span className="text-slate-500">Guide</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                    {" "}
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 animate-scaleIn" />{" "}
                    Resolved via KB
                  </div>
                </div>

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
                    ].map((i, idx) => (
                      <div key={i.q} data-anim-delay={`${idx * 70 + 80}`}>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="truncate pr-2">{i.q}</span>
                          <span>{i.v}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded bg-[--surface-alt]">
                          <div
                            className="h-2 rounded bg-[--brand-primary]"
                            style={{
                              width: `${i.v}%`,
                              transition: "width .8s cubic-bezier(.2,.9,.2,1)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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

      {/* HOW */}
      <section
        id="how"
        className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-0 py-16 sm:px-6 scroll-mt-24 reveal"
        data-anim-delay="60"
      >
        <div className="px-4 sm:px-0">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                How it works
              </h2>
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
                className="relative rounded-xl border border-[--border-subtle] bg-white p-6 shadow-none card-hover reveal"
                data-anim-delay={`${idx * 90 + 80}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[--brand-primary]/10 text-sm font-bold text-[--brand-primary] card-icon animate-floaty"
                    style={{ transitionDelay: `${idx * 80}ms` }}
                  >
                    {c.k}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {c.t}
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">{c.d}</p>

                <div className="mt-5 h-1 w-20 rounded bg-[--brand-primary]" />
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Import sources",
                value: "Notion · Confluence · Drive · HTML · PDF",
              },
              {
                label: "Tagging helpers",
                value: "Synonyms · Entities · Owners",
              },
              {
                label: "Channels",
                value: "Chat Widget · Help Center · In-product",
              },
              {
                label: "Optimization",
                value: "No-result queries · CTR · Article health",
              },
            ].map((box, i) => (
              <div
                key={box.label}
                className="rounded-xl border border-[--border-subtle] bg-white p-4 reveal card-hover"
                data-anim-delay={`${i * 70 + 120}`}
              >
                <div className="font-semibold text-slate-700">{box.label}</div>
                <div className="mt-1 text-slate-500">{box.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-7xl rounded-3xl bg-white px-0 py-14 shadow-sm ring-1 ring-[--border-subtle] sm:px-6 scroll-mt-24 reveal"
        data-anim-delay="100"
      >
        <div className="px-4 sm:px-0">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-balance text-3xl font-bold tracking-tight">
                Core features
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Everything you need to make content useful, and keep it that
                way.
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
                className="relative rounded-xl border border-[--border-subtle] bg-white p-6 shadow-none card-hover reveal"
                data-anim-delay={`${i * 70 + 140}`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[--brand-primary]/10 text-xl text-[--brand-primary] card-icon animate-floaty">
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

      {/* ANALYTICS ILLUSTRATION */}
      <section
        id="demo"
        className="relative mx-4 max-w-7xl overflow-hidden rounded-3xl border border-[--border-subtle] bg-white px-0 py-10 shadow-sm sm:mx-auto sm:px-6 reveal"
        data-anim-delay="160"
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
              See how it works <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative">
            <div className="relative w-full overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-5">
              <div className="relative mx-auto h-64 w-full max-w-md rounded-2xl border border-[--border-subtle] bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500">
                  Top searches
                </div>
                <div className="mt-2 space-y-2">
                  {[
                    { q: "pricing setup", v: 80 },
                    { q: "sso login", v: 56 },
                    { q: "import csv", v: 38 },
                    { q: "cancel plan", v: 22 },
                  ].map((i, idx) => (
                    <div
                      key={i.q}
                      className="reveal"
                      data-anim-delay={`${idx * 90 + 180}`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{i.q}</span>
                        <span>{i.v}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded bg-[--surface-alt]">
                        <div
                          className="h-2 rounded bg-[--brand-primary]"
                          style={{
                            width: `${i.v}%`,
                            transition: "width .8s cubic-bezier(.2,.9,.2,1)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-500">
                  No-result queries
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                  {["data residency", "mfa device reset"].map((t, idx) => (
                    <div
                      key={t}
                      className="inline-flex items-center gap-2 rounded border border-[--brand-primary]/20 bg-[--brand-primary]/5 px-2 py-1 text-[--brand-primary] reveal"
                      data-anim-delay={`${idx * 80 + 240}`}
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

      {/* FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-7xl px-0 py-16 sm:px-6 scroll-mt-24 reveal"
        data-anim-delay="200"
      >
        <div className="px-4 sm:px-0">
          <h2 className="text-balance text-3xl font-bold tracking-tight">
            FAQ
          </h2>
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
            ].map((f, i) => (
              <details
                key={f.q}
                className="group reveal"
                data-anim-delay={`${i * 80 + 260}`}
              >
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

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-4 max-w-7xl overflow-hidden rounded-3xl border border-[--border-subtle] bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 shadow-sm sm:mx-auto sm:px-6 scroll-mt-24 reveal"
        data-anim-delay="320"
      >
        <div className="pointer-events-none absolute -top-12 right-0 h-72 w-72 rounded-full bg-[--brand-primary]/20 blur-3xl md:right-[-10%] animate-pulseGlow" />
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

          <div className="md:col-span-2 reveal" data-anim-delay="360">
            <div className="relative overflow-hidden rounded-2xl border border-[--border-subtle] bg-white p-6 shadow-lg card-hover">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 rounded-full bg-[--brand-primary]/10 blur-2xl md:translate-x-1/2 animate-pulseGlow" />
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
                ].map((step, i) => (
                  <li
                    key={step.n}
                    className="flex items-start gap-3 reveal"
                    data-anim-delay={`${i * 90 + 380}`}
                  >
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
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-scaleIn" />
                <span className="text-slate-600">
                  Safe defaults, easy rollback, no vendor lock-in.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[--border-subtle] bg-white">
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
