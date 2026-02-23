// Advancelytics — Lead Generation (Full Page)
// Lighter hero, Calendly-style theme, and all sections restored
"use client";
// Advancelytics — Lead Generation (Updated Full Page)
// Fix: Define LOGOS and inline SVG logo components to resolve ReferenceError.
// Implements: pain‑point line, social proof logos + inline testimonials, numeric impact,
// CTA microcopy, Before→After mini‑graphic, SEO meta tags (commented Head),
// accessibility hover color (#004FCC), and marquee with hover‑to‑pause.

import React, { useEffect, useState } from "react";
import HeroSection from "./hero-section";
import TrustedLogos from "./trusted-by";
import WhySection from "./why-section";
import HowItWorks from "./how-it-works";
import FeaturesLeadSection from "./features-section";
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

  // Mobile sticky/floating header state (match Agentforce feel)
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string,
  ) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled(y > 1);
      setFloating(y > 1);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      className="relative min-h-screen w-full overflow-x-hidden text-slate-900 antialiased scroll-smooth"
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

      {/* Mobile page-specific menu — match Agentforce style */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out md:hidden ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-full h-14 flex items-center justify-center">
          <nav className="flex items-center gap-3 text-slate-600 text-sm">
            <a
              href="#why"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "why")}
            >
              Why
            </a>
            <a
              href="#how"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "how")}
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "features")}
            >
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* Floating bar — identical look/feel for smooth crossfade */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-opacity duration-300 ease-out md:hidden ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center">
          <nav className="flex items-center gap-3 text-slate-600 text-sm">
            <a
              href="#why"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "why")}
            >
              Why
            </a>
            <a
              href="#how"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "how")}
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "features")}
            >
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* DESKTOP page-specific menu — match Knowledge Base crossfade */}
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
          <div className="flex items-center gap-2 md:pr-20">
            <span className="text-lg font-semibold tracking-tight">
              Agentlytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-slate-600">
              Lead Generation
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex ml-28">
            <a
              href="#why"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "why")}
            >
              Why
            </a>
            <a
              href="#how"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "how")}
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "features")}
            >
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* DESKTOP Floating bar — identical look/feel for smooth crossfade */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-opacity duration-300 ease-out hidden md:block ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center">
          <nav className="flex items-center gap-3 text-slate-600 text-sm">
            <a
              href="#why"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "why")}
            >
              Why
            </a>
            <a
              href="#how"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "how")}
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-slate-900"
              onClick={(e) => handleScroll(e, "features")}
            >
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* Spacer to avoid content jump when header is fixed (desktop only) */}
      <div className="hidden md:block h-16" aria-hidden />

      {/* NAVBAR */}

      {/* Backdrop overlay — match ai-chatbots (no tint, click to close) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* HERO */}
      <HeroSection />

      {/* TRUSTED BY / LOGOS + Inline Testimonials */}
      <TrustedLogos />

      {/* WHY SECTION with Before→After mini-graphic */}
      <WhySection />

      {/* HOW IT WORKS */}
      <HowItWorks />

      {/* FEATURES */}
      <FeaturesLeadSection />

      {/* (Removed standalone testimonial section; testimonials now live inside the Trusted by card) */}

      {/* CTA */}
      <section
        id="cta"
        className="relative mx-4 sm:mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-white to-[--brand-primary]/5 px-4 py-16 text-center sm:px-6 scroll-mt-24"
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
