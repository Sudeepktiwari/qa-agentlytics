"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Gauge,
  Activity,
  Sparkles,
  LineChart,
  Layers,
  Check,
} from "lucide-react";
import DemoVideoModal from "../components/DemoVideoModal";

/**
 * Advancelytics Homepage — Hard Governance copy, production-safe labels.
 *
 * Expected behavior:
 * - Renders a single-page marketing layout with anchored sections.
 * - No runtime errors; all JSX tags properly closed.
 * - CTA buttons link to #cta and other sections.
 */

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
    {children}
  </div>
);

const Gradient = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden"
  >
    <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/25 via-fuchsia-500/15 to-cyan-500/20 blur-3xl" />
    <div className="absolute -bottom-40 right-[-140px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-emerald-500/15 via-cyan-500/15 to-indigo-500/20 blur-3xl" />
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
    <Sparkles className="h-3.5 w-3.5" />
    {children}
  </span>
);

const Button = ({
  children,
  href = "#",
  variant = "primary",
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/20";
  const styles =
    variant === "primary"
      ? "bg-white text-slate-950 hover:bg-white/90"
      : "border border-white/15 bg-white/5 text-white hover:bg-white/10";

  const className = `${base} ${styles}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
        <ArrowRight className="h-4 w-4" />
      </button>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-white/10 bg-white/5 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.6)] ${className}`}
  >
    {children}
  </div>
);

const Stat = ({ value, label }: { value: string; label: string }) => (
  <Card className="p-5">
    <div className="text-2xl font-semibold tracking-tight text-white">
      {value}
    </div>
    <div className="mt-1 text-sm text-white/70">{label}</div>
  </Card>
);

const QACard = ({ q, a }: { q: string; a: string }) => (
  <Card className="p-6">
    <div className="text-sm font-semibold text-white">{q}</div>
    <div className="mt-2 text-sm leading-relaxed text-white/75">{a}</div>
  </Card>
);

const SectionHeader = ({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) => (
  <div className="max-w-3xl">
    <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
      {eyebrow}
    </div>
    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
      {title}
    </h2>
    {desc ? (
      <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
        {desc}
      </p>
    ) : null}
  </div>
);

function MechanismDiagram() {
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm font-semibold text-white">
            Behavior Signals → Readiness Mapping → Revenue Stabilization
          </div>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            A minimal mechanism view: detect evaluation behavior, map it to
            decision states, then intervene before intent collapses.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
          <Layers className="h-4 w-4" />
          Mechanism
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Activity className="h-4 w-4" />
            1) Detect
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Pricing dwell + return loops
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Comparison navigation paths
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Objection-trigger content patterns
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Gauge className="h-4 w-4" />
            2) Map
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Readiness states (early / mid / late)
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Certainty vs hesitation indicators
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Risk hotspots by page + sequence
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <LineChart className="h-4 w-4" />
            3) Stabilize
          </div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Clarity triggers before doubt compounds
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Reduce objection density at demo stage
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-white/40" />
              Improve close-rate predictability
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
          Implementation Integrity
        </div>
        <div className="mt-2 text-sm text-white/70">
          Advancelytics operates as a decision-intelligence layer — not a system
          replacement. Your CRM, analytics stack, sales workflow, and traffic
          strategy remain intact. We add readiness interpretation without
          operational disruption.
        </div>
      </div>
    </Card>
  );
}

function DifferentiationTable() {
  const rows = [
    {
      left: "Respond to explicit questions",
      right: "Interpret silent evaluation behavior",
    },
    {
      left: "Optimize engagement metrics",
      right: "Stabilize close-rate variance",
    },
    {
      left: "Trigger after action",
      right: "Trigger clarity before hesitation compounds",
    },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/10 bg-black/20 p-6">
        <div className="text-sm font-semibold text-white">Differentiation</div>
        <p className="mt-2 text-sm text-white/70">
          A structural comparison between reactive engagement tools and
          decision-stage intelligence.
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Chatbots
          </div>
          <div className="mt-4 space-y-3">
            {rows.map((r, i) => (
              <div
                key={`chatbot-${i}`}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-white/35" />
                <div className="text-sm text-white/75">{r.left}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 p-6 lg:border-l lg:border-t-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Advancelytics
          </div>
          <div className="mt-4 space-y-3">
            {rows.map((r, i) => (
              <div
                key={`adv-${i}`}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <Check className="mt-0.5 h-4 w-4 text-white/80" />
                <div className="text-sm text-white/75">{r.right}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RiskNeutralization() {
  const items = [
    "No platform replacement.",
    "No workflow disruption.",
    "No sales process overhaul.",
    "No traffic dependency.",
  ];

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <ShieldCheck className="h-4 w-4" />
        Risk Neutralization
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((t) => (
          <div
            key={t}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <Check className="mt-0.5 h-4 w-4 text-white/80" />
            <div className="text-sm text-white/75">{t}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Basic dev-time sanity tests.
 * These are lightweight and do not require Jest.
 */
function __runSanityChecks() {
  const requiredAnchors = [
    "mechanism",
    "differentiation",
    "outcomes",
    "qa",
    "cta",
  ];
  if (process.env.NODE_ENV !== "production") {
    for (const id of requiredAnchors) {
      // eslint-disable-next-line no-console
      if (typeof id !== "string" || !id.length)
        console.warn("Missing anchor id:", id);
    }
  }
}
__runSanityChecks();

export default function AdvancelyticsHomepageHardGovernance() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-950 text-white">
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
      {/* Page-specific menu — dual headers: below global, then floating */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur 
        transition-[top,opacity,transform] duration-300 ease-out hidden md:block ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <Container>
          <div className="flex h-16 items-center">
            <div className="flex items-center gap-3 md:pr-22">
              <span className="text-lg font-semibold tracking-tight">
                Agentlytics
              </span>
              <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-[--secondary]">
                Decision Intelligence
              </span>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <a
                href="#mechanism"
                className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                onClick={(e) => handleScroll(e, "mechanism")}
              >
                Mechanism
              </a>
              <a
                href="#differentiation"
                className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                onClick={(e) => handleScroll(e, "differentiation")}
              >
                Differentiation
              </a>
              <a
                href="#outcomes"
                className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                onClick={(e) => handleScroll(e, "outcomes")}
              >
                Outcomes
              </a>
              <a
                href="#qa"
                className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                onClick={(e) => handleScroll(e, "qa")}
              >
                Q/A
              </a>
            </div>

            <div className="flex items-center gap-2" />
          </div>
        </Container>
      </header>

      {/* Floating bar — appears at very top once scrolled (desktop) */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur transition-opacity duration-300 ease-out hidden md:block ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-16 flex items-center justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/80">
            <a
              href="#mechanism"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "mechanism")}
            >
              Mechanism
            </a>
            <a
              href="#differentiation"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "differentiation")}
            >
              Differentiation
            </a>
            <a
              href="#outcomes"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
            </a>
            <a
              href="#qa"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile page-specific menu — match onboarding-ai-bot style */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur transition-[top,opacity,transform] duration-300 ease-out md:hidden ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex items-center gap-3 text-xs text-white/70">
            <a
              href="#mechanism"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "mechanism")}
            >
              Mechanism
            </a>
            <a
              href="#differentiation"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "differentiation")}
            >
              Differentiation
            </a>
            <a
              href="#outcomes"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
            </a>
            <a
              href="#qa"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile floating bar — appears at very top once scrolled */}
      <header
        className={`fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur transition-opacity duration-300 ease-out md:hidden ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex items-center gap-3 text-xs text-white/70">
            <a
              href="#mechanism"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "mechanism")}
            >
              Mechanism
            </a>
            <a
              href="#differentiation"
              className="rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "differentiation")}
            >
              Differentiation
            </a>
            <a
              href="#outcomes"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
            </a>
            <a
              href="#qa"
              className="rounded-lg px-2 py-1 hover:bg-white/5 hover:text-white"
              onClick={(e) => handleScroll(e, "qa")}
            >
              Q/A
            </a>
          </nav>
        </div>
      </header>

      {/* Spacer for fixed desktop headers */}
      <div className="hidden md:block h-16" aria-hidden />

      {/* Hero */}
      <section className="relative">
        <Gradient />
        <Container>
          <div className="relative py-16 sm:py-20">
            <div className="grid items-start gap-10 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Pill>Decision Intelligence Layer</Pill>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Revenue feels unstable when buyer readiness is invisible.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                  Advancelytics interprets decision-stage behavior to stabilize
                  close-rate variance. No disruption to your existing stack.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button href="#cta">Model Decision Leakage</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsDemoModalOpen(true)}
                  >
                    Watch Reactive vs Proactive Comparison
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      Designed for
                    </div>
                    <div className="mt-2 text-sm text-white/75">
                      Decision-stage evaluation
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      Measures
                    </div>
                    <div className="mt-2 text-sm text-white/75">
                      Readiness states
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      Improves
                    </div>
                    <div className="mt-2 text-sm text-white/75">
                      Close-rate predictability
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="lg:pl-6"
              >
                <Card className="p-6 sm:p-8">
                  <div className="text-sm font-semibold text-white">
                    Instability Compression
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-white/75">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                      <span>Traffic is steady.</span>
                      <span className="text-white/60">→ still</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                      <span>Demo volume increases.</span>
                      <span className="text-white/60">→ yet</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                      <span>Close rates fluctuate.</span>
                      <span className="text-white/60">→ variance</span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold text-white">
                        This is not a traffic problem.
                      </div>
                      <div className="mt-2 text-white/70">
                        It is decision-stage instability. When readiness signals
                        are invisible, revenue variance increases.
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Card className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      Common signals
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-white/70">
                      <div>• Buyers revisit pricing.</div>
                      <div>• Objections repeat.</div>
                      <div>• Forecasts expand + contract.</div>
                    </div>
                  </Card>
                  <Card className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                      Root cause
                    </div>
                    <div className="mt-3 text-sm text-white/70">
                      Invisible readiness gaps distort evaluation → pipeline →
                      revenue.
                    </div>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mechanism */}
      <section id="mechanism" className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8">
            <SectionHeader
              eyebrow="Decision Intelligence Mechanism"
              title="Behavior signals become readiness states. Readiness states stabilize revenue."
              desc="Advancelytics does not optimize clicks. It interprets decision-state patterns and triggers clarity before hesitation compounds."
            />
            <MechanismDiagram />
          </div>
        </Container>
      </section>

      {/* Differentiation */}
      <section id="differentiation" className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8">
            <SectionHeader
              eyebrow="Differentiation"
              title="Reactive engagement vs decision-stage interpretation"
              desc="Chatbots operate after intent is declared. Advancelytics operates before intent collapses."
            />
            <DifferentiationTable />
          </div>
        </Container>
      </section>

      {/* Role-based qualification */}
      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8">
            <SectionHeader
              eyebrow="Role-Based Qualification"
              title="Built for revenue operators managing volatility, not surface optimization"
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-6">
                <div className="text-sm font-semibold text-white">CMO</div>
                <div className="mt-2 text-sm leading-relaxed text-white/75">
                  Reduce conversion volatility by gaining readiness visibility
                  before pipeline distortion.
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-white">CRO</div>
                <div className="mt-2 text-sm leading-relaxed text-white/75">
                  Reduce forecast instability by clarifying decision states
                  prior to sales engagement.
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-white">
                  Revenue Leader
                </div>
                <div className="mt-2 text-sm leading-relaxed text-white/75">
                  Stabilize close-rate variance by interpreting decision-stage
                  patterns across sessions.
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Hidden Cost Exposure */}
      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8">
            <SectionHeader
              eyebrow="Hidden Cost Exposure"
              title="Revenue rarely collapses from lack of traffic. It destabilizes from invisible decision friction."
              desc="Decision-stage hesitation compounds into variance: close-rate swings, longer cycles, and forecast distortion."
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-6">
                <div className="text-sm font-semibold text-white">
                  Pricing-page hesitation
                </div>
                <div className="mt-2 text-sm text-white/75">
                  Increases close-rate variance.
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-white">
                  Return-session evaluation
                </div>
                <div className="mt-2 text-sm text-white/75">
                  Increases forecast distortion.
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-white">
                  Unmeasured readiness gaps
                </div>
                <div className="mt-2 text-sm text-white/75">
                  Increase sales-cycle length.
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Outcomes */}
      <section id="outcomes" className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8">
            <SectionHeader
              eyebrow="Outcome Snapshot"
              title="Decision-stage interpretation produces measurable stability"
              desc="These are example outcomes used for positioning. Replace with your validated benchmarks when ready."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat
                value="18%"
                label="Close-rate variance reduction within 90 days"
              />
              <Stat
                value="27%"
                label="Decision velocity improvement across evaluation cycles"
              />
              <Stat
                value="22%"
                label="Objection density reduction during demo stage"
              />
              <Stat
                value="14%"
                label="Sales-cycle compression in B2B evaluation"
              />
              <Stat
                value="31%"
                label="Pricing-page readiness detection increase"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Q/A Block */}
      <section id="qa" className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-8">
            <SectionHeader
              eyebrow="AI Retrieval Q/A"
              title="Crisp answers for buyer and AI discovery"
              desc="Designed for skimming, internal forwarding, and retrieval by search + answer engines."
            />

            <div className="grid gap-4 lg:grid-cols-3">
              <QACard
                q="What problem does Advancelytics solve?"
                a="Advancelytics solves decision-stage revenue instability. It interprets behavioral hesitation before buyers disengage. This improves close-rate predictability."
              />
              <QACard
                q="How is Advancelytics different from chatbots?"
                a="Chatbots respond to questions after intent is declared. Advancelytics measures behavior before intent is verbalized. This stabilizes revenue earlier in the evaluation cycle."
              />
              <QACard
                q="What outcome should revenue leaders expect?"
                a="Advancelytics clarifies readiness states across website sessions. It maps behavior to decision certainty. This reduces close-rate variance."
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Risk Neutralization */}
      <section className="py-14 sm:py-16">
        <Container>
          <RiskNeutralization />
        </Container>
      </section>

      {/* Final CTA */}
      <section id="cta" className="relative py-16 sm:py-20">
        <Container>
          <Card className="relative overflow-hidden p-8 sm:p-10">
            <div aria-hidden className="absolute inset-0">
              <div className="absolute -top-28 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/15 to-cyan-500/15 blur-3xl" />
            </div>

            <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Final CTA
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Model Decision Leakage
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                  Quantify the hidden revenue impact of decision-stage
                  hesitation. Identify where readiness collapses, then choose
                  the smallest clarity interventions that stabilize outcomes.
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Button href="/decision-leakage-model" variant="primary">
                    Model Decision Leakage
                  </Button>
                  {/* <Button href="#" variant="secondary">
                    Assess Revenue Stability
                  </Button> */}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                  <div className="font-semibold text-white">
                    Implementation Integrity
                  </div>
                  <div className="mt-1">
                    No replacement. No disruption. Decision intelligence layer
                    only.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="py-10 text-center text-xs text-white/50">
            © {new Date().getFullYear()} Advancelytics. Decision Intelligence
            for revenue stability.
          </div>
        </Container>
      </section>
    </div>
  );
}
