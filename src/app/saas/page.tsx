"use client";

import React, { useMemo, useState } from "react";

/**
 * Agentlytics for SaaS — Landing Page (Next.js + Tailwind)
 *
 * Preview mode:
 * - Next.js App Router: place at app/saas/page.tsx
 * - TailwindCSS must be configured.
 *
 * Stripe-inspired theme notes:
 * - Uses an indigo/violet core with soft gradients and glassy surfaces.
 * - Hero illustration is a single inline SVG with lightweight CSS animations.
 */

type CTAProps = {
  primaryHref?: string;
  secondaryHref?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

type IconProps = { className?: string };

const ArrowRight = ({ className = "h-4 w-4" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12h12m0 0-5-5m5 5-5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Check = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 6 9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spark = ({ className = "h-5 w-5" }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Section({
  id,
  eyebrow,
  title,
  desc,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
              <Spark className="h-4 w-4 text-indigo-600" />
              <span>{eyebrow}</span>
            </div>
          ) : null}
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>
          {desc ? (
            <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
              {desc}
            </p>
          ) : null}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function CTA({
  primaryHref = "/signup",
  secondaryHref = "/demo",
  primaryLabel = "Start Free",
  secondaryLabel = "Watch a Demo",
}: CTAProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a
        href={primaryHref}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
      >
        {primaryLabel}
        <ArrowRight className="ml-2" />
      </a>
      <a
        href={secondaryHref}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
      >
        {secondaryLabel}
      </a>
    </div>
  );
}

// Hero illustration removed intentionally — no visual adds value here.

function ComparisonTable() {
  const rows = useMemo(
    () => [
      { k: "Engagement timing", a: "User-initiated", b: "Intent-driven" },
      { k: "Lead qualification", a: "Manual / None", b: "Automated" },
      { k: "Buyer context awareness", a: "Limited", b: "Deep" },
      { k: "Demo readiness filtering", a: "No", b: "Yes" },
      { k: "SDR efficiency", a: "Low", b: "High" },
      { k: "Focus", a: "Lead capture", b: "Pipeline quality" },
    ],
    [],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 sm:border-b-0 sm:border-r">
          Capability
        </div>
        <div className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-900 sm:border-b-0 sm:border-r">
          Forms & Chat Widgets
        </div>
        <div className="px-5 py-4 text-sm font-semibold text-slate-900">
          Agentlytics
        </div>

        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900">
              {r.k}
            </div>
            <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-700 sm:border-r">
              {r.a}
            </div>
            <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-900">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-600/10 px-3 py-1 font-medium text-indigo-900">
                <Check className="h-4 w-4 text-indigo-700" />
                {r.b}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-indigo-700" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnchorLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2"
    >
      {label}
    </a>
  );
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm">
              A
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Agentlytics</div>
              <div className="text-xs text-slate-500">for SaaS</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 sm:flex">
            <AnchorLink href="#problem" label="Problem" />
            <AnchorLink href="#how" label="How it works" />
            <AnchorLink href="#compare" label="Compare" />
            <AnchorLink href="#who" label="Who it's for" />
            <AnchorLink href="#demo" label="CTA" />
          </nav>

          <div className="hidden sm:block">
            <CTA
              primaryHref="/signup"
              secondaryHref="/demo"
              primaryLabel="Start Free"
              secondaryLabel="Watch a Demo"
            />
          </div>

          <button
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 sm:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            Menu
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={classNames(
            "border-t border-slate-200 bg-white sm:hidden",
            menuOpen ? "block" : "hidden",
          )}
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3">
              <AnchorLink href="#problem" label="Problem" />
              <AnchorLink href="#how" label="How it works" />
              <AnchorLink href="#compare" label="Compare" />
              <AnchorLink href="#who" label="Who it's for" />
              <AnchorLink href="#demo" label="CTA" />
              <div className="pt-2">
                <CTA />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="py-10 sm:py-14">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:grid-cols-2 sm:px-6">
            {/* Hero copy (LEFT) */}
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur">
                <Spark className="h-4 w-4 text-indigo-600" />
                Late Consideration → Decision
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Turn SaaS Website Visitors Into Qualified Demos — Automatically,
                in Real Time
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Agentlytics is a proactive AI agent for SaaS websites that
                identifies high-intent visitors, qualifies them in real time,
                and books demos or sales calls automatically — before they leave
                your site.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-700">
                    <Spark className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Proof hook
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      SaaS teams using proactive AI engagement see higher demo
                      show-up rates, better lead quality, and shorter sales
                      cycles from the same traffic.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <CTA
                  primaryHref="/signup"
                  secondaryHref="/demo"
                  primaryLabel="Increase Demo Conversions"
                  secondaryLabel="Watch a Demo — See a Live SaaS Flow"
                />
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Works with any SaaS website · Live in minutes · No form
                replacement required
              </div>
            </div>

            {/* Right column: Live Qualification Snapshot */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    Live qualification snapshot
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">
                    Visitor intent detected
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-slate-600">Pages viewed</span>
                      <span className="font-medium text-slate-900">
                        Pricing, Security
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-slate-600">Role</span>
                      <span className="font-medium text-slate-900">
                        VP Engineering
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-slate-600">Company size</span>
                      <span className="font-medium text-slate-900">
                        200–500
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-slate-600">Use case</span>
                      <span className="font-medium text-slate-900">
                        Security compliance
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      <span className="text-slate-600">Timeline</span>
                      <span className="font-medium text-slate-900">
                        This quarter
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
                    <span className="text-sm font-semibold text-indigo-700">
                      Recommended action
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      Book demo
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  Example of how Agentlytics qualifies visitors in real time
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <Section
          id="problem"
          eyebrow="Problem statement"
          title="Why SaaS Websites Leak Pipeline"
          desc="Your product is solid. Your marketing is driving traffic. Yet most visitors still leave — because intent goes unqualified."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <MiniCard
              title="What buyers do"
              bullets={[
                "Spend time on pricing, security, and integrations",
                "Compare competitors silently",
                "Question fit, complexity, or cost",
                "Leave without raising their hand",
              ]}
            />
            <MiniCard
              title="What traditional tools do"
              bullets={[
                "Forms capture data, not intent",
                "Calendars feel premature",
                "SDRs chase low-quality leads",
                "Reactive chat starts too late",
              ]}
            />
            <MiniCard
              title="What it costs"
              bullets={[
                "Wasted demos and lower close rates",
                "SDR overload and burnout",
                "Slower pipeline velocity",
                "Unclear ‘why’ behind drop-offs",
              ]}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-indigo-200/50 bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-sm">
            <div className="text-sm font-semibold text-white/90">
              Category-defining statement
            </div>
            <div className="mt-2 text-xl font-semibold leading-snug">
              SaaS companies don’t lose deals because of traffic — they lose
              deals because intent goes unqualified.
            </div>
            <div className="mt-2 text-sm text-white/80">
              This is not a volume problem. It’s a qualification problem.
            </div>
          </div>
        </Section>

        {/* Why fail */}
        <Section
          eyebrow="Contrast"
          title="Why Forms & Reactive Chat Fail in SaaS"
          desc="Traditional conversion tools wait for buyers to act. High-intent buyers often don’t fill forms, while low-intent visitors often do."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="text-base font-semibold text-slate-900">
                Traditional model
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {[
                  "Wait for form submits",
                  "Treat all leads equally",
                  "Push demos too early",
                  "Create SDR overload",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-800">
                      •
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="text-base font-semibold text-slate-900">
                Agentlytics model
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {[
                  "Detect intent in real time",
                  "Engage contextually",
                  "Qualify without friction",
                  "Route buyers to the right next step",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-indigo-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* How it works */}
        <Section
          id="how"
          eyebrow="How it works"
          title="Detect → Engage → Qualify → Route"
          desc="Agentlytics adapts to buyer intent and drives the right outcome — demos for sales-ready, content for mid-intent, and follow-ups for qualified leads."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <MiniCard
              title="1) Detect intent"
              bullets={[
                "Pricing / security / integrations depth",
                "Repeat visits",
                "Scroll and hesitation patterns",
                "Entry source context",
              ]}
            />
            <MiniCard
              title="2) Engage"
              bullets={[
                "Context-aware prompts",
                "No pop-ups",
                "No interruption",
                "Only relevance",
              ]}
            />
            <MiniCard
              title="3) Qualify"
              bullets={[
                "Use case",
                "Company size",
                "Role / authority",
                "Budget and timeline",
              ]}
            />
            <MiniCard
              title="4) Route"
              bullets={[
                "Book demos for sales-ready",
                "Route mid-intent to content",
                "Capture qualified follow-ups",
                "Filter low-fit traffic",
              ]}
            />
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="text-base font-semibold text-slate-900">
              SaaS micro-scenario
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              If a <span className="font-semibold">VP Engineering</span> spends
              several minutes on security and integrations, Agentlytics adapts
              the conversation toward compliance, scale, and architecture fit.
              If a <span className="font-semibold">founder</span> is comparing
              pricing, it shifts toward ROI, speed to value, and use-case
              clarity.
            </p>
            <p className="mt-3 text-sm text-slate-700">
              Same website. Different intent.{" "}
              <span className="font-semibold">Different conversation.</span>
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-indigo-50/60 p-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  See how qualification works in real time
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  A mid-page CTA for visitors who are ready to evaluate.
                </div>
              </div>
              <CTA
                primaryHref="/signup"
                secondaryHref="#demo"
                primaryLabel="Start Free"
                secondaryLabel="Watch a Live Flow"
              />
            </div>
          </div>
        </Section>

        {/* Use cases */}
        <Section
          eyebrow="Use cases"
          title="What SaaS Teams Use Agentlytics For"
          desc="Improve demo conversion and pipeline quality — not vanity lead volume."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <MiniCard
              title="Pipeline quality"
              bullets={[
                "Better MQL-to-SQL",
                "Fewer low-fit demos",
                "Higher show-up rates",
                "Shorter sales cycles",
              ]}
            />
            <MiniCard
              title="Sales efficiency"
              bullets={[
                "Reduced SDR burnout",
                "Smarter routing",
                "Less manual qualification",
                "Cleaner handoffs",
              ]}
            />
            <MiniCard
              title="Buyer insights"
              bullets={[
                "Why buyers hesitate",
                "Which pages convert",
                "What questions block conversion",
                "Which segments need nurture",
              ]}
            />
          </div>
        </Section>

        {/* Fit */}
        <Section
          eyebrow="Fit"
          title="Built for Modern SaaS Growth Teams"
          desc="Works across marketing, pricing, and product pages. Complements forms and calendars. No redesign required."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="text-base font-semibold text-slate-900">
                Seamless fit
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {[
                  "Sales-led, PLG, and hybrid models",
                  "No form replacement required",
                  "Works with existing site and flows",
                  "Designed to scale with traffic",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-indigo-700" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
              <div className="text-base font-semibold text-slate-900">
                Light trust signal
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Already used by SaaS teams focused on turning traffic into
                pipeline — not vanity leads.
              </p>
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Add logos or anonymized segments here later (e.g., “B2B SaaS ·
                Mid-market · Hybrid PLG”).
              </div>
            </div>
          </div>
        </Section>

        {/* Comparison */}
        <Section
          id="compare"
          eyebrow="Comparison"
          title="Agentlytics vs Forms & SaaS Chat Widgets"
          desc="Forms collect data. Agentlytics creates qualified conversations."
        >
          <ComparisonTable />
        </Section>

        {/* Who it's for */}
        <Section
          id="who"
          eyebrow="Target fit"
          title="Who This Is For"
          desc="Ideal for SaaS companies that run traffic and want fewer demos — but better ones."
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <MiniCard
              title="Teams"
              bullets={[
                "Head of Growth",
                "VP Sales / Revenue",
                "Founders (B2B SaaS)",
                "Hybrid PLG + Sales orgs",
              ]}
            />
            <MiniCard
              title="Signals"
              bullets={[
                "Traffic but low qualification",
                "Poor demo-to-close",
                "SDR overload",
                "Need intent visibility",
              ]}
            />
            <MiniCard
              title="Best-fit motions"
              bullets={[
                "Demo-led",
                "Sales-led",
                "Hybrid PLG",
                "Mid-market to enterprise",
              ]}
            />
          </div>
        </Section>

        {/* Final CTA */}
        <Section
          id="demo"
          eyebrow="Decision point"
          title="Turn SaaS Traffic Into Qualified Demos — Automatically"
          desc="Your buyers are already evaluating options. The missing step is intelligent qualification."
        >
          <div className="rounded-2xl border border-indigo-200/50 bg-gradient-to-r from-indigo-600 to-violet-600 p-7 text-white shadow-sm">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-semibold tracking-tight">
                The missing step is timely engagement
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                No credit card required · Works with your existing SaaS site ·
                Go live fast
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  Start Free
                  <ArrowRight className="ml-2" />
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Watch a Demo
                </a>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-sm text-slate-600">
              © {year} Agentlytics. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <a
                className="text-slate-600 hover:text-slate-900"
                href="/privacy"
              >
                Privacy
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="/terms">
                Terms
              </a>
              <a
                className="text-slate-600 hover:text-slate-900"
                href="/contact"
              >
                Contact
              </a>
              <a
                className="text-slate-600 hover:text-slate-900"
                href="/support"
              >
                Support
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
