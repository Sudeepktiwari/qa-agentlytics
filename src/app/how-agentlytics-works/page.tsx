"use client";
import React, { useEffect, useState } from "react";

/**
 * Page: How Advancelytics Works
 * Theme: clean, minimal, same structural tone as prior landing pages
 * Notes:
 * - No external UI libs required.
 * - Tailwind classes only.
 * - Single primary CTA repeated (same action).
 */

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
    {children}
  </span>
);

const SectionTitle: React.FC<{
  eyebrow?: string;
  title: string;
  desc?: string;
}> = ({ eyebrow, title, desc }) => (
  <div className="mx-auto max-w-3xl">
    {eyebrow ? (
      <div className="mb-3 flex flex-wrap gap-2">
        <Pill>{eyebrow}</Pill>
      </div>
    ) : null}
    <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
      {title}
    </h2>
    {desc ? (
      <p className="mt-3 text-base leading-7 text-white/70">{desc}</p>
    ) : null}
  </div>
);

const Card: React.FC<{
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, children, icon }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
    <div className="flex items-start gap-3">
      {icon ? (
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <div className="mt-2 text-sm leading-6 text-white/70">{children}</div>
      </div>
    </div>
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <div className="text-2xl font-semibold text-white">{value}</div>
    <div className="mt-1 text-sm text-white/65">{label}</div>
  </div>
);

const PrimaryButton: React.FC<{ children: React.ReactNode; href?: string }> = ({
  children,
  href = "/decision-leakage-model",
}) => (
  <a
    href={href}
    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40"
  >
    {children}
    <span className="ml-2 text-zinc-900/70">→</span>
  </a>
);

const SecondaryButton: React.FC<{
  children: React.ReactNode;
  href?: string;
}> = ({ children, href = "/decision-intelligence" }) => (
  <a
    href={href}
    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
  >
    {children}
  </a>
);

function MiniSignalChart() {
  // Inline SVG: pricing dwell up, conversion down
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">
            Example signal reference
          </div>
          <div className="mt-1 text-sm text-white/65">
            Pricing dwell <span className="font-semibold text-white">+42%</span>{" "}
            while conversion drops{" "}
            <span className="font-semibold text-white">-11%</span>
          </div>
        </div>
        <Pill>Evaluation friction</Pill>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-xs font-medium text-white/70">
            Pricing-page dwell
          </div>
          <svg viewBox="0 0 320 120" className="h-24 w-full">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            <path
              d="M10 95 C 60 75, 90 80, 130 60 S 200 40, 250 30 S 290 22, 310 18"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3"
            />
            <path
              d="M10 95 C 60 75, 90 80, 130 60 S 200 40, 250 30 S 290 22, 310 18 L310 110 L10 110 Z"
              fill="url(#g1)"
              opacity="0.75"
            />
            <line
              x1="10"
              y1="110"
              x2="310"
              y2="110"
              stroke="rgba(255,255,255,0.15)"
            />
          </svg>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-xs font-medium text-white/70">
            Conversion rate
          </div>
          <svg viewBox="0 0 320 120" className="h-24 w-full">
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="1" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            <path
              d="M10 30 C 60 40, 90 35, 130 48 S 200 70, 250 82 S 290 92, 310 98"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="3"
            />
            <path
              d="M10 30 C 60 40, 90 35, 130 48 S 200 70, 250 82 S 290 92, 310 98 L310 110 L10 110 Z"
              fill="url(#g2)"
              opacity="0.75"
            />
            <line
              x1="10"
              y1="110"
              x2="310"
              y2="110"
              stroke="rgba(255,255,255,0.15)"
            />
          </svg>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        Advancelytics measures this pattern before it distorts revenue
        forecasts.
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);

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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.10),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_80%_40%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Advancelytics</div>
            <div className="text-xs text-white/60">
              Decision-stage revenue intelligence
            </div>
          </div>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a className="hover:text-white" href="/decision-intelligence">
            Decision Intelligence
          </a>
          <a className="hover:text-white" href="/decision-leakage-model">
            Decision Leakage Model
          </a>
          <a className="hover:text-white" href="/how-it-works">
            How it works
          </a>
        </nav>
      </header>

      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-[top,opacity,transform] duration-300 ease-out hidden md:block ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <div className="flex items-center gap-3 lg:pr-24">
            <span className="text-lg font-semibold tracking-tight">
              Advancelytics
            </span>
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
              How it works
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm text-white/80">
            <a
              href="#instability"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "instability")}
            >
              Instability
            </a>
            <a
              href="#model"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#structure"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "structure")}
            >
              Structure
            </a>
            <a
              href="#exposure"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "exposure")}
            >
              Cost exposure
            </a>
            <a
              href="#methodology"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "methodology")}
            >
              Methodology
            </a>
            <a
              href="#qa"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-opacity duration-300 ease-out hidden md:block ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-4">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/80">
            <a
              href="#instability"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "instability")}
            >
              Instability
            </a>
            <a
              href="#model"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#structure"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "structure")}
            >
              Structure
            </a>
            <a
              href="#exposure"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "exposure")}
            >
              Cost exposure
            </a>
            <a
              href="#methodology"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "methodology")}
            >
              Methodology
            </a>
            <a
              href="#qa"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-[top,opacity,transform] duration-300 ease-out md:hidden ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/70">
            <a
              href="#instability"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "instability")}
            >
              Instability
            </a>
            <a
              href="#model"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#structure"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "structure")}
            >
              Structure
            </a>
            <a
              href="#exposure"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "exposure")}
            >
              Cost exposure
            </a>
            <a
              href="#methodology"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "methodology")}
            >
              Methodology
            </a>
            <a
              href="#qa"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      <header
        className={`fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-opacity duration-300 ease-out md:hidden ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/70">
            <a
              href="#instability"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "instability")}
            >
              Instability
            </a>
            <a
              href="#model"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#structure"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "structure")}
            >
              Structure
            </a>
            <a
              href="#exposure"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "exposure")}
            >
              Cost exposure
            </a>
            <a
              href="#methodology"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "methodology")}
            >
              Methodology
            </a>
            <a
              href="#qa"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-6 sm:pb-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              <Pill>How it works</Pill>
              <Pill>Close-rate variance</Pill>
              <Pill>Decision-stage behavior</Pill>
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Built for revenue leaders facing conversion stability gaps despite
              steady traffic.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
              We interpret decision-stage behavior to stabilize close-rate
              variance — without disrupting your CRM, attribution, or sales
              workflows.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton href="/decision-leakage-model">
                Measure Revenue Stability
              </PrimaryButton>
              <div className="text-sm text-white/60">
                No CRM replacement. No attribution disruption. No workflow
                re-architecture.
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-medium text-white/70">
                  Interprets
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Evaluation behavior
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-medium text-white/70">Maps</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Readiness states
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-medium text-white/70">
                  Stabilizes
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Forecast confidence
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <MiniSignalChart />
          </div>
        </div>
      </section>

      <section
        id="instability"
        className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16"
      >
        <SectionTitle
          eyebrow="Instability Compression"
          title="Revenue looks stable on the surface. The variance is inside evaluation behavior."
          desc="When hesitation is not interpreted, revenue confidence declines before revenue declines. Advancelytics operates in that invisible layer."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-medium text-white/70">
                    Surface signals
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li>Traffic volume holds</li>
                    <li>Demo requests continue</li>
                    <li>Pipeline dashboards look healthy</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-medium text-white/70">
                    Hidden instability
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li>Forecast variance rises quarter to quarter</li>
                    <li>Evaluation friction compounds silently</li>
                    <li>Confidence drops before revenue drops</li>
                  </ul>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                The instability sits inside evaluation behavior — not
                acquisition volume.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card
              title="What this changes"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              }
            >
              Teams stop guessing readiness.
              <br />
              They measure it.
              <br />
              Variance becomes actionable.
            </Card>
          </div>
        </div>
      </section>

      <section
        id="model"
        className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16"
      >
        <SectionTitle
          eyebrow="Decision-Stage Interpretation Model"
          title="Behavior Signals → Readiness Mapping → Revenue Stabilization"
          desc="A three-step stabilization loop that measures hesitation patterns before they distort forecasting and close-rate consistency."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card
            title="1) Capture behavior signals"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19V5" />
                <path d="M4 15h16" />
                <path d="M8 12h12" />
                <path d="M12 9h8" />
              </svg>
            }
          >
            Pricing dwell spikes, comparison loops, repeat-visit clusters.
          </Card>
          <Card
            title="2) Map readiness states"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10z" />
                <circle cx="12" cy="11" r="2" />
              </svg>
            }
          >
            Signal concentration → readiness state + hesitation probability.
          </Card>
          <Card
            title="3) Stabilize through calibrated support"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h6l3-8 3 16 3-8h3" />
              </svg>
            }
          >
            Reduce close-rate variance with decision-stage support timing.
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-white">Key example</div>
          <p className="mt-2 text-sm leading-6 text-white/70">
            When pricing-page dwell time rises{" "}
            <span className="font-semibold text-white">42%</span> while
            conversion drops{" "}
            <span className="font-semibold text-white">11%</span>, the issue is
            not traffic quality. It is unaddressed evaluation friction.
            Advancelytics measures this pattern before it distorts revenue
            forecasts.
          </p>
        </div>
      </section>

      {/* Structural Differentiation */}
      <section
        className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16"
        id="structure"
      >
        <SectionTitle
          eyebrow="Structural Differentiation"
          title="This is not chat automation. It is decision-stage interpretation."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-white">
                Reactive chat interfaces
              </div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>Wait for questions</li>
                <li>Optimize engagement metrics</li>
                <li>React after declared intent</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-white">
                Advancelytics
              </div>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>Interpret hesitation</li>
                <li>Stabilize revenue metrics</li>
                <li>Support decisions during evaluation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Qualification */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <SectionTitle
          eyebrow="Role-Based Qualification"
          title="Different leaders. Same instability. Different operational levers."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card
            title="CMOs"
            icon={<span className="text-sm font-bold">C</span>}
          >
            Readiness-based qualification clarity to reduce conversion
            instability.
          </Card>
          <Card
            title="CROs"
            icon={<span className="text-sm font-bold">R</span>}
          >
            Measurable hesitation mapping to reduce close-rate variance.
          </Card>
          <Card
            title="RevOps"
            icon={<span className="text-sm font-bold">O</span>}
          >
            Signal-driven stabilization logic to reduce forecast distortion.
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-white">
                Boundary condition
              </div>
              <div className="mt-1 text-sm text-white/70">
                Not for sub-$5M ARR teams optimizing traffic acquisition volume.
              </div>
            </div>
            <PrimaryButton href="/decision-leakage-model">
              Measure Revenue Stability
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section
        id="exposure"
        className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16"
      >
        <SectionTitle
          eyebrow="Hidden Cost Exposure"
          title="Revenue instability is operational — not traffic-driven."
          desc="Uninterpreted hesitation increases forecast variance, compresses allocation decisions, and inflates CAC without improving closed revenue."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Card title="Forecast variance compounding">
            Uninterpreted pricing hesitation increases quarterly forecast
            variance.
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-medium text-white/70">
                Operational trigger
              </div>
              <div className="mt-1">
                Forecast variance above 18% delays hiring approvals and
                compresses spend allocation.
              </div>
            </div>
          </Card>
          <Card title="CAC inflation without revenue lift">
            Silent comparison behavior increases CAC without increasing closed
            revenue.
            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs font-medium text-white/70">Mechanism</div>
              <div className="mt-1">
                More evaluation loops → higher acquisition cost → unchanged
                close consistency.
              </div>
            </div>
          </Card>
          <Card title="Sales cycle volatility">
            Delayed readiness detection increases sales cycle length and
            pipeline volatility.
          </Card>
          <Card title="Budget timing distortion">
            When confidence drops before revenue drops, teams freeze decisions
            and lose quarters.
          </Card>
        </div>
      </section>

      {/* Outcome Snapshot */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <SectionTitle
          eyebrow="Outcome Snapshot"
          title="What changes when evaluation behavior becomes measurable"
          desc="Data derived from 42 B2B SaaS revenue teams ($5M–$50M ARR range)."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat
            value="29%"
            label="reduction in forecast variance (2 quarters)"
          />
          <Stat value="31%" label="improvement in hesitation recovery rate" />
          <Stat value="17%" label="increase in Decision Velocity Index" />
          <Stat value="21%" label="reduction in sales-cycle fluctuation" />
          <Stat value="14%" label="increase in close-rate consistency" />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          These numbers describe stability outcomes, not engagement outcomes.
        </div>
      </section>

      <section
        id="methodology"
        className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16"
      >
        <SectionTitle
          eyebrow="Measurement Methodology"
          title="Decision Velocity Index (DVI)"
          desc="DVI measures the time between the first high-intent behavioral cluster and closed-won outcome."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <ol className="space-y-3 text-sm text-white/70">
                <li>
                  <span className="font-semibold text-white">1.</span> Identify
                  readiness signal concentration threshold.
                </li>
                <li>
                  <span className="font-semibold text-white">2.</span> Measure
                  time from threshold to deal resolution.
                </li>
                <li>
                  <span className="font-semibold text-white">3.</span> Track
                  variance reduction over rolling 90-day cohorts.
                </li>
              </ol>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                DVI improves when hesitation is interpreted earlier in the
                evaluation window.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <Card
              title="Why this matters"
              icon={<span className="text-sm font-bold">DVI</span>}
            >
              DVI turns readiness into an operational metric — so forecast
              confidence can be stabilized with timing, not guesswork.
            </Card>
          </div>
        </div>
      </section>

      <section id="qa" className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <SectionTitle
          eyebrow="AI Retrieval Q/A"
          title="Fast answers buyers look for during evaluation"
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card title="What does Advancelytics solve?">
            Revenue instability caused by unread evaluation behavior. It maps
            behavioral signals to readiness states to improve forecast
            consistency.
          </Card>
          <Card title="How is this different from chat automation?">
            It does not automate conversations. It interprets pricing dwell,
            comparison loops, and hesitation signals to stabilize close-rate
            variance.
          </Card>
          <Card title="How is performance measured?">
            Using Decision Velocity Index and forecast variance reduction —
            measuring time-to-resolution after readiness signals appear.
          </Card>
        </div>
      </section>

      {/* Risk Neutralization */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16">
        <SectionTitle
          eyebrow="Risk Neutralization"
          title="Layered intelligence. Zero stack disruption."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "No CRM replacement",
            "No attribution disruption",
            "No workflow re-architecture",
            "No engagement metric inflation",
          ].map((t) => (
            <div
              key={t}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70"
            >
              <div className="text-sm font-semibold text-white">{t}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          Only behavioral signal interpretation layered into your existing
          revenue stack.
        </div>
      </section>

      {/* Final Action */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                If forecast confidence fluctuates despite stable traffic, the
                instability exists inside the decision layer.
              </h2>
              <p className="mt-3 text-base leading-7 text-white/70">
                Measure it. Quantify leakage. Identify hesitation clusters. Then
                stabilize close-rate variance with calibrated decision-stage
                support.
              </p>
            </div>
            <div className="lg:col-span-4 lg:flex lg:justify-end">
              <PrimaryButton href="/decision-leakage-model">
                Measure Revenue Stability
              </PrimaryButton>
            </div>
          </div>
        </div>

        <footer className="mt-10 border-t border-white/10 pt-8 text-sm text-white/55">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Advancelytics</div>
            <div className="flex gap-4">
              <a className="hover:text-white" href="/privacy">
                Privacy
              </a>
              <a className="hover:text-white" href="/terms">
                Terms
              </a>
              <a className="hover:text-white" href="/contact">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
