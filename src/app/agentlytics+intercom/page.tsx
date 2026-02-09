"use client";
import React, { useEffect, useRef, useState } from "react";
import DemoVideoModal from "../components/DemoVideoModal";

// Intercom-style light theme — white backgrounds, blue accents, soft (light) shadows, minimal borders

const Check = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
    <path
      fill="currentColor"
      d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z"
    />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={props.className}>
    <path
      fill="currentColor"
      d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"
    />
  </svg>
);

const Dot = () => <span className="mx-2 text-slate-300">•</span>;

const Logo = ({ label = "Logo" }) => (
  <div className="h-9 w-28 rounded-md bg-white/70 shadow flex items-center justify-center text-xs font-semibold text-slate-500 ring-1 ring-slate-200/70">
    {label}
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow ring-1 ring-slate-200/70">
    {children}
  </span>
);

const FadeIn = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          (el as HTMLElement | null)?.classList.add(
            "opacity-100",
            "translate-y-0",
          );
      },
      { threshold: 0.12 },
    );
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
};

const Row = ({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 gap-4 rounded-xl bg-white p-4 shadow sm:grid-cols-2">
    <div className="font-medium text-slate-800">{left}</div>
    <div className="text-slate-600">{right}</div>
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F1FF] px-3 py-1 text-xs font-semibold text-[#1E73E8]">
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
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition shadow focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-[#006EFF] text-white hover:brightness-95 focus:ring-[#1E73E8]"
      : "bg-white text-[#0B1F33] ring-1 ring-slate-200/70 hover:bg-slate-50 focus:ring-slate-300";
  if (onClick) {
    return (
      <button className={`${base} ${styles}`} onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <a className={`${base} ${styles}`} href={href}>
      {children}
    </a>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl bg-white/95 p-4 text-center shadow">
    <div className="text-2xl font-bold text-[#0B1F33]">{value}</div>
    <div className="mt-1 text-xs text-slate-500">{label}</div>
  </div>
);

const TestimonialCard = ({
  quote,
  author,
}: {
  quote: string;
  author: string;
}) => (
  <div className="min-w-[280px] max-w-sm shrink-0 snap-start rounded-xl bg-white/95 p-4 sm:p-5 shadow">
    <p className="text-[15px] leading-relaxed text-slate-700">“{quote}”</p>
    <div className="mt-3 text-sm font-semibold text-slate-900">{author}</div>
  </div>
);

const Carousel = () => (
  <div className="group relative overflow-x-auto md:overflow-hidden">
    <div className="hidden md:block absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#F9FBFF] to-transparent pointer-events-none" />
    <div className="hidden md:block absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#F9FBFF] to-transparent pointer-events-none" />
    <div className="flex gap-4 snap-x snap-mandatory md:animate-[scroll_25s_linear_infinite] md:group-hover:[animation-play-state:paused] will-change-transform">
      {[
        {
          quote:
            "We used Intercom for years — Agentlytics finally made our chat proactive.",
          author: "Head of CX, CloudScale",
        },
        {
          quote:
            "Engagement jumped 37%; demos doubled with in‑chat scheduling.",
          author: "Growth Lead, SaaSify",
        },
        {
          quote: "Onboarding completion +28% in week one — fewer tickets.",
          author: "Product Manager, FinServe",
        },
        {
          quote: "BANT qualification inside chat simplified our SDR workflow.",
          author: "Revenue Ops, DevSuite",
        },
      ].map((t, i) => (
        <TestimonialCard key={i} quote={t.quote} author={t.author} />
      ))}
      {[
        {
          quote:
            "We used Intercom for years — Agentlytics finally made our chat proactive.",
          author: "Head of CX, CloudScale",
        },
        {
          quote:
            "Engagement jumped 37%; demos doubled with in‑chat scheduling.",
          author: "Growth Lead, SaaSify",
        },
        {
          quote: "Onboarding completion +28% in week one — fewer tickets.",
          author: "Product Manager, FinServe",
        },
        {
          quote: "BANT qualification inside chat simplified our SDR workflow.",
          author: "Revenue Ops, DevSuite",
        },
      ].map((t, i) => (
        <TestimonialCard key={`d-${i}`} quote={t.quote} author={t.author} />
      ))}
    </div>
  </div>
);

export default function Page() {
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setFloating(scrolled);
  }, [scrolled]);
  return (
    <div className="min-h-screen bg-[#F9FBFF] text-[#0B1F33]">
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>

      {/* Sticky header (below global until scrolled) */}
      <header
        className={`${scrolled ? "top-0" : "top-16"} fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out ${floating ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"}`}
      >
        <div className="w-full h-16 flex items-center justify-center relative md:right-[84px]">
          <nav className="flex items-center gap-4 md:gap-6 text-slate-600 text-sm">
            <a href="#overview" className="hover:text-slate-900">
              Overview
            </a>
            <a href="#difference" className="hover:text-slate-900">
              Difference
            </a>
            <a href="#compare" className="hover:text-slate-900">
              Deep Compare
            </a>
            <a href="#integrations" className="hover:text-slate-900">
              Integrations
            </a>
          </nav>
        </div>
      </header>
      {/* Floating header (on top at handoff) */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out ${floating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
      >
        <div className="w-full h-16 flex items-center justify-center">
          <nav className="flex items-center gap-4 md:gap-6 text-slate-600 text-sm">
            <a href="#overview" className="hover:text-slate-900">
              Overview
            </a>
            <a href="#difference" className="hover:text-slate-900">
              Difference
            </a>
            <a href="#compare" className="hover:text-slate-900">
              Deep Compare
            </a>
            <a href="#integrations" className="hover:text-slate-900">
              Integrations
            </a>
          </nav>
        </div>
      </header>
      {/* Spacer to prevent content overlap */}
      <div className="h-16" />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,#E8F1FF_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Intercom Waits for Questions.{" "}
                <span className="text-[#1E73E8]">
                  Agentlytics Starts Conversations.
                </span>
              </h1>
              <p className="mt-4 text-[17px] leading-7 text-slate-700">
                Intercom’s inbox is great for managing support chats.
                Agentlytics detects visitor intent, greets high‑intent users
                automatically, qualifies with BANT, books calls inside chat, and
                continues through onboarding and support.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Badge>
                  ⚡ Teams switching from Intercom see 37% higher engagement and
                  2.4× faster lead qualification.
                </Badge>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="#start">
                  Start Free — Engage Visitors Automatically
                </Button>
                <Button
                  onClick={() => setIsDemoModalOpen(true)}
                  variant="secondary"
                >
                  Watch a Comparison Demo
                </Button>
              </div>
              <div className="mt-3 text-sm text-slate-500">
                Your proactive AI live in 10 minutes.
              </div>

              {/* Visual storytelling hint */}
              <div className="mt-8 flex items-center gap-3 text-xs text-slate-500">
                <Pill>
                  <span className="h-2 w-2 rounded-full bg-[#1E73E8]" />
                  Short scroll animation: Left → idle chat; Right → proactive
                  bubble on pricing dwell (~40s)
                </Pill>
              </div>
            </div>

            {/* Hero Mock Illustration (soft ring instead of border) */}
            <div className="relative">
              <div className="mx-auto w-full max-w-md rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100/70">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[#006EFF]" />
                    <div className="text-sm font-semibold">Pricing</div>
                  </div>
                  <div className="text-xs text-slate-500">Visitor • 00:40</div>
                </div>
                <div className="mt-4 space-y-3">
                  {/* Left idle chat */}
                  <div className="flex gap-2">
                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
                    <div className="rounded-2xl rounded-tl-none ring-1 ring-slate-200/70 bg-white px-3 py-2 text-sm text-slate-600 shadow">
                      <div className="h-3 w-24 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
                    </div>
                  </div>
                  {/* Right proactive bubble */}
                  <div className="flex items-start gap-2 justify-end">
                    <div className="rounded-2xl rounded-tr-none ring-1 ring-[#1E73E8]/20 bg-[#E8F1FF] px-3 py-2 text-sm text-[#0B1F33] shadow max-w-[80%]">
                      Noticed you’re on pricing — want help picking the best
                      plan?
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-md bg-white px-2 py-1 shadow ring-1 ring-slate-200/70">
                          Show 2‑min ROI guide
                        </span>
                        <span className="rounded-md bg-white px-2 py-1 shadow ring-1 ring-slate-200/70">
                          Book 15‑min fit call
                        </span>
                      </div>
                    </div>
                    <div className="h-7 w-7 shrink-0 rounded-full bg-[#1E73E8]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK OVERVIEW */}
      <section id="overview" className="mx-auto max-w-7xl px-4 pb-8">
        <FadeIn>
          <div className="rounded-2xl bg-white/95 p-5 shadow">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold">🔍 Quick Overview</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Logo label="CloudScale" /> <Logo label="FinServe" />{" "}
                <Logo label="TechFlow" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Row
                left={<span className="font-semibold">Purpose</span>}
                right={
                  <>
                    <span className="font-semibold text-[#1E73E8]">
                      Proactive, AI‑powered lifecycle engagement
                    </span>
                    <Dot />
                    Unified inbox for reactive support & sales
                  </>
                }
              />
              <Row
                left={<span className="font-semibold">Core Focus</span>}
                right={
                  <>
                    <span>
                      Behavior triggers, BANT qualification, in‑chat scheduling,
                      onboarding guidance
                    </span>
                    <Dot />
                    Live chat, ticketing, Articles, bots
                  </>
                }
              />
              <Row
                left={<span className="font-semibold">Engagement</span>}
                right={
                  <>
                    <span>Proactive (detects intent; starts chat)</span>
                    <Dot />
                    Reactive (waits for click/message)
                  </>
                }
              />
              <Row
                left={<span className="font-semibold">AI Layer</span>}
                right={
                  <>
                    <span>
                      Multi‑persona LLM (Lead → Sales → Onboarding → Support)
                    </span>
                    <Dot />
                    Fin (AI) for FAQ answers
                  </>
                }
              />
              <Row
                left={<span className="font-semibold">Coverage</span>}
                right={
                  <>
                    <span>Lead → Sales → Onboarding → Support</span>
                    <Dot />
                    Sales/Support only
                  </>
                }
              />
              <Row
                left={<span className="font-semibold">Setup Time</span>}
                right={
                  <>
                    <span className="text-emerald-600 font-medium">
                      &lt; 15 min (embed script)
                    </span>
                    <Dot />
                    Workspace + routing config
                  </>
                }
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* WHY IT MATTERS */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <FadeIn>
          <div className="rounded-2xl bg-white/95 p-4 sm:p-6 shadow">
            <h3 className="text-base sm:text-lg font-semibold">
              ⚡ Why It Matters
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-700">
              Most tools react after users ask for help. Agentlytics acts when
              intent peaks.
            </p>
            <blockquote className="mt-3 rounded-xl bg-[#F9FBFF] p-3 sm:p-4 text-sm sm:text-base text-slate-700 ring-1 ring-slate-200/70">
              “Every missed scroll, pause, or exit is a silent dropout —
              Agentlytics catches them before they leave.”
            </blockquote>
          </div>
        </FadeIn>
      </section>

      {/* CORE DIFFERENCE */}
      <section id="difference" className="mx-auto max-w-7xl px-4 py-4">
        <FadeIn>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/95 p-6 shadow">
              <h3 className="text-lg font-semibold">Intercom</h3>
              <ul className="mt-3 space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-emerald-600" /> Excellent
                  for inbound support & help‑desk workflows
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-emerald-600" /> Fin
                  answers FAQs; agent handoff via inbox
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-emerald-600" />{" "}
                  Centralizes conversations for teams
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white/95 p-6 shadow">
              <h3 className="text-lg font-semibold">Agentlytics</h3>
              <ul className="mt-3 space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-[#1E73E8]" /> Detects
                  dwell, scroll depth, frustrated clicks, exit intent
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-[#1E73E8]" /> Starts the
                  right conversation automatically
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-5 w-5 text-[#1E73E8]" /> Runs BANT,
                  books meetings inside chat, guides onboarding
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* DEEP COMPARISON TABLE */}
      <section id="compare" className="mx-auto max-w-7xl px-4 py-8">
        <FadeIn>
          <div className="overflow-hidden rounded-2xl bg-white/95 shadow">
            <div className="grid grid-cols-3 bg-[#E8F1FF] p-4 text-sm font-semibold text-[#0B1F33]">
              <div>Area</div>
              <div className="text-center">Agentlytics</div>
              <div className="text-center">Intercom</div>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                {
                  area: "Engagement",
                  a: "Proactive triggers • Contextual prompts",
                  b: "User‑initiated chat",
                },
                {
                  area: "AI",
                  a: "Multi‑persona LLM • Tone/intent aware",
                  b: "FAQ assistant (Fin)",
                },
                {
                  area: "Qualification",
                  a: "Conversational BANT • Intent score & routing",
                  b: "Static forms/fields",
                },
                {
                  area: "Scheduling",
                  a: "Built‑in slot picker (in‑chat)",
                  b: "External meeting link",
                },
                {
                  area: "Onboarding",
                  a: "Inline guidance, validation, adaptive paths",
                  b: "Articles/Guides (static)",
                },
                {
                  area: "Continuity",
                  a: "Context memory across stages",
                  b: "Inbox routing; context resets",
                },
                {
                  area: "QA & Coaching",
                  a: "9‑metric scoring • Ghost detection",
                  b: "CSAT, response time",
                },
                {
                  area: "Setup",
                  a: "Script install (10 min)",
                  b: "Workspace + rules",
                },
                {
                  area: "Integrations",
                  a: "HubSpot, Salesforce, GA4, Slack, Intercom (Works with Intercom ✅)",
                  b: "Intercom apps & APIs",
                },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 text-sm">
                  <div className="p-4 font-medium text-slate-700">
                    {row.area}
                  </div>
                  <div className="p-4 text-slate-700">
                    <div className="flex items-start justify-center gap-2 text-center md:justify-start md:text-left">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#1E73E8]" />
                      <span>{row.a}</span>
                    </div>
                  </div>
                  <div className="p-4 text-slate-700">
                    <div className="flex items-start justify-center gap-2 text-center md:justify-start md:text-left">
                      <XIcon className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                      <span>{row.b}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* TRUST LAYER */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <FadeIn>
          <div className="rounded-2xl bg-white/95 p-6 shadow">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="text-base sm:text-lg font-semibold">
                ✨ What customers say
              </h3>
              <div className="flex items-center gap-2">
                <Logo label="CloudScale" />
                <Logo label="FinServe" />
                <Logo label="TechFlow" />
              </div>
            </div>
            <Carousel />
            <div className="mt-4 hidden md:block text-right text-xs text-slate-500">
              Hover to pause
            </div>
            <div className="mt-4 md:hidden text-center text-xs text-slate-500">
              Swipe to scroll
            </div>
          </div>
        </FadeIn>
      </section>

      {/* HOW AGENTLYTICS WINS THE MOMENT */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <FadeIn>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Proactive Engagement",
                body: "Detects behavior in real time → launches timely micro‑prompts. ‘On pricing — want a 2‑min ROI guide or book a 15‑min fit call?’",
              },
              {
                title: "Multi‑Persona Intelligence",
                body: "Switches roles fluidly: Lead (greet), Sales (ROI), Onboarding (validate), Support (resolve with past context).",
              },
              {
                title: "Smart Qualification",
                body: "Conversational BANT → Intent score → Auto‑route to CRM & Slack with summary.",
              },
              {
                title: "In‑Chat Scheduling",
                body: "Timezone‑aware slot picker inside chat → 2.8× more demo completions (no redirects).",
              },
              {
                title: "Guided Onboarding",
                body: "Inline ‘why this field?’, validation, sample data, adaptive paths, human handoff with full context.",
              },
              {
                title: "Continuity",
                body: "Context memory across stages keeps conversations coherent over time.",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-white/95 p-6 shadow">
                <h4 className="text-base font-semibold">{f.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* IMPACT METRICS */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <FadeIn>
          <div className="rounded-2xl bg-white/95 p-6 shadow">
            <h3 className="text-lg font-semibold">📈 Measurable Impact</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-5">
              <Stat label="Lead Engagement" value="↑ +37%" />
              <Stat label="Demo Completions" value="↑ 2.8×" />
              <Stat label="Time‑to‑Value" value="↓ −32%" />
              <Stat label="Setup Tickets" value="↓ −18%" />
              <Stat label="Ghost Rate" value="↓ −40%" />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* WHEN TO USE EACH */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <FadeIn>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/95 p-6 shadow">
              <h4 className="text-base font-semibold">
                Choose Agentlytics if you want to:
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-[#1E73E8]" /> Engage
                  visitors automatically based on behavior
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-[#1E73E8]" /> Qualify with
                  BANT & route instantly
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-[#1E73E8]" /> Book
                  meetings in‑chat and guide onboarding
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-[#1E73E8]" /> Score
                  quality & detect ghosts in real time
                </li>
              </ul>
            </div>
            <div className="rounded-2xl bg-white/95 p-6 shadow">
              <h4 className="text-base font-semibold">
                Choose Intercom if you want to:
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-emerald-600" /> Centralize
                  support in an inbox
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-emerald-600" /> Use Fin
                  for FAQ resolution
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 text-emerald-600" /> Stay
                  within Intercom’s ecosystem
                </li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* INTEGRATIONS */}
      <section id="integrations" className="mx-auto max-w-7xl px-4 py-8">
        <FadeIn>
          <div className="rounded-2xl bg-white/95 p-6 shadow">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">🧰 Integrations</h3>
              <Badge>Works with Intercom ✅</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              <Logo label="HubSpot" />
              <Logo label="Salesforce" />
              <Logo label="GA4" />
              <Logo label="Slack" />
              <Logo label="Intercom" />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FINAL CTA */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,#E8F1FF_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-2xl bg-white p-8 shadow">
            <div className="grid items-center gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold">
                  Intercom Waits. Agentlytics Wins the Moment.
                </h3>
                <p className="mt-2 text-slate-700">
                  Stop reacting — start engaging. Capture, qualify, and convert
                  before visitors bounce.
                </p>
                <div className="mt-1 text-sm text-slate-500">
                  Your proactive AI live in 10 minutes.
                </div>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Button href="#start">
                  Start Free — Engage Visitors Automatically
                </Button>
                <Button
                  onClick={() => setIsDemoModalOpen(true)}
                  variant="secondary"
                >
                  Watch a Comparison Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white ring-1 ring-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#006EFF]" />
              <span>© {new Date().getFullYear()} Agentlytics</span>
            </div>
            <div className="flex items-center gap-4">
              <a className="hover:text-slate-700" href="#">
                Privacy
              </a>
              <a className="hover:text-slate-700" href="#">
                Terms
              </a>
              <a className="hover:text-slate-700" href="#">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
