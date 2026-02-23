"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Activity,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Layers,
  BarChart3,
  Target,
} from "lucide-react";
import DemoVideoModal from "../components/DemoVideoModal";

type StatProps = {
  value: string;
  label: string;
};

type BulletProps = {
  children: React.ReactNode;
};

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  desc?: string;
  children: React.ReactNode;
};

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type PillProps = {
  icon: IconComponent;
  title: string;
  desc: string;
};

type QAProps = {
  q: string;
  a: string;
};

const Stat: React.FC<StatProps> = ({ value, label }: StatProps) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
    <div className="text-2xl font-semibold tracking-tight text-white">
      {value}
    </div>
    <div className="mt-1 text-sm leading-snug text-white/70">{label}</div>
  </div>
);

const Bullet: React.FC<BulletProps> = ({ children }: BulletProps) => (
  <li className="flex gap-3">
    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
      <Check className="h-3.5 w-3.5 text-white/80" />
    </span>
    <span className="text-white/80">{children}</span>
  </li>
);

const NoBullet: React.FC<BulletProps> = ({ children }: BulletProps) => (
  <li className="flex gap-3">
    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
      <X className="h-3.5 w-3.5 text-white/60" />
    </span>
    <span className="text-white/70">{children}</span>
  </li>
);

const Section: React.FC<SectionProps> = ({
  id,
  eyebrow,
  title,
  desc,
  children,
}: SectionProps) => (
  <section id={id} className="scroll-mt-24 py-14 sm:py-16">
    <div className="mx-auto max-w-6xl px-5">
      <div className="max-w-3xl">
        {eyebrow ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
        ) : null}
        {title ? (
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h2>
        ) : null}
        {desc ? (
          <p className="mt-3 text-base leading-relaxed text-white/75">{desc}</p>
        ) : null}
      </div>
      <div className="mt-10">{children}</div>
    </div>
  </section>
);

const Divider: React.FC = () => (
  <div className="mx-auto max-w-6xl px-5">
    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);

const Pill: React.FC<PillProps> = ({ icon: Icon, title, desc }: PillProps) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <Icon className="h-4.5 w-4.5 text-white/80" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-white/70">{desc}</div>
      </div>
    </div>
  </div>
);

const QA: React.FC<QAProps> = ({ q, a }: QAProps) => (
  <details className="group rounded-2xl border border-white/10 bg-white/5 p-5">
    <summary className="cursor-pointer list-none select-none">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm font-semibold text-white">{q}</div>
        <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition group-open:rotate-45">
          <span className="text-lg leading-none">+</span>
        </div>
      </div>
    </summary>
    <p className="mt-3 text-sm leading-relaxed text-white/75">{a}</p>
  </details>
);

function TopNav() {
  return null;
}

function Hero() {
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
    <header className="relative overflow-hidden">
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur transition-[top,opacity,transform] duration-300 ease-out hidden md:block ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center lg:pl-8 px-5">
          <div className="flex items-center gap-3 lg:pr-28">
            <span className="text-lg font-semibold tracking-tight text-white">
              Agentlytics
            </span>
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80">
              Who it’s for
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm text-white/80">
            <a
              href="#model"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#qualification"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qualification")}
            >
              Qualification
            </a>
            <a
              href="#filters"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "filters")}
            >
              Filters
            </a>
            <a
              href="#outcomes"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
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
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur transition-opacity duration-300 ease-out hidden md:block ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-4">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/80">
            <a
              href="#model"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#qualification"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qualification")}
            >
              Qualification
            </a>
            <a
              href="#filters"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "filters")}
            >
              Filters
            </a>
            <a
              href="#outcomes"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
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
        } fixed left-0 right-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur transition-[top,opacity,transform] duration-300 ease-out md:hidden ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/70">
            <a
              href="#model"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#qualification"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qualification")}
            >
              Qualification
            </a>
            <a
              href="#filters"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "filters")}
            >
              Filters
            </a>
            <a
              href="#outcomes"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
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
        className={`fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur transition-opacity duration-300 ease-out md:hidden ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/70">
            <a
              href="#model"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#qualification"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "qualification")}
            >
              Qualification
            </a>
            <a
              href="#filters"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "filters")}
            >
              Filters
            </a>
            <a
              href="#outcomes"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "outcomes")}
            >
              Outcomes
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
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-[12%] h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 right-[8%] h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-16 sm:pb-16 sm:pt-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
              <Activity className="h-3.5 w-3.5" />
              Strategic Qualification Page
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Who Advancelytics Is Built For
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Revenue feels unstable when buyer readiness is invisible.
              Advancelytics interprets decision-stage behavior to stabilize
              close-rate variance — without disrupting your existing stack.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/decision-leakage-model"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Assess Readiness Signals
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Watch a demo
                <Target className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white">
                  Core Thesis
                </div>
                <div className="mt-1 text-sm leading-relaxed text-white/70">
                  Decision-stage instability is a revenue problem.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white">
                  Designed For
                </div>
                <div className="mt-1 text-sm leading-relaxed text-white/70">
                  Consultative, multi-touch sales environments.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-white">Not A</div>
                <div className="mt-1 text-sm leading-relaxed text-white/70">
                  Chat volume tool or chatbot automation layer.
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-white/80">
                    Instability Compression
                  </div>
                  <div className="mt-1 text-lg font-semibold tracking-tight text-white">
                    The pattern you can’t forecast
                  </div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <BarChart3 className="h-5 w-5 text-white/80" />
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-white/75">
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <span>Traffic holds steady</span>
                  <span className="text-white/60">Stable input</span>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <span>Demo requests increase</span>
                  <span className="text-white/60">More volume</span>
                </div>
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <span>Close rates fluctuate</span>
                  <span className="text-white/60">Variance</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/75">
                Pricing pages show high dwell without action. Buyers return
                multiple times before disappearing. When certainty can’t be
                measured, revenue can’t be forecasted.
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-white/60">
                <ShieldCheck className="h-4 w-4" />
                No disruption · No CRM replacement · No process redesign
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ModelBand() {
  return (
    <Section
      id="model"
      eyebrow="Decision Intelligence Model"
      title="Behavior signals → readiness mapping → revenue stabilization"
      desc="Advancelytics operates in environments where decision clarity is missing. It detects hesitation before intent collapses and maps engagement patterns into readiness states for signal-based qualification."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Pill
          icon={Activity}
          title="Detect behavioral hesitation"
          desc="Surface the moments where confidence erodes before disengagement shows up in analytics."
        />
        <Pill
          icon={Layers}
          title="Map readiness states"
          desc="Translate engagement patterns into decision readiness — not vanity engagement metrics."
        />
        <Pill
          icon={Target}
          title="Stabilize qualification quality"
          desc="Reduce close-rate variance by escalating only when readiness signals justify it."
        />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <div className="text-sm font-semibold text-white">
              Operating constraints
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              No feature dashboards. No reactive prompts. Only decision-stage
              interpretation.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <Bullet>
                Interpret implicit behavior — not explicit questions.
              </Bullet>
              <Bullet>Optimize certainty — not chat volume.</Bullet>
              <Bullet>
                Clarify before doubt compounds — not after objections surface.
              </Bullet>
            </ul>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="text-xs font-semibold text-white/80">
                Structural Differentiation
              </div>
              <div className="mt-3 space-y-3 text-sm text-white/75">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-semibold text-white">Chatbots</span>{" "}
                  react to questions.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-semibold text-white">
                    Advancelytics
                  </span>{" "}
                  interprets hesitation.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-semibold text-white">Chatbots</span>{" "}
                  optimize engagement volume.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-semibold text-white">
                    Advancelytics
                  </span>{" "}
                  stabilizes revenue predictability.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Qualification() {
  const roles = [
    {
      title: "CMOs reducing conversion plateau",
      body: "Readiness visibility across high-intent traffic — especially pricing and return-session behavior.",
    },
    {
      title: "CROs reducing close-rate variance",
      body: "Signal-based qualification that improves sales-readiness consistency and protects forecasting confidence.",
    },
    {
      title: "Revenue leaders stabilizing pipeline quality",
      body: "Decision-state clarity before demo escalation — fewer low-readiness calls, less objection density.",
    },
    {
      title: "Founders managing consultative sales cycles",
      body: "Behavioral insight before scaling acquisition spend — fix readiness leakage before buying more traffic.",
    },
  ];

  return (
    <Section
      id="qualification"
      eyebrow="Role-Based Qualification"
      title="If your responsibility includes revenue predictability, this environment applies"
      desc="This is a decision filter page. It is designed to attract the right operators and repel mismatched expectations."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {roles.map((r) => (
          <div
            key={r.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Target className="h-4.5 w-4.5 text-white/80" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {r.title}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-white/70">
                  {r.body}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Filters() {
  return (
    <Section
      id="filters"
      eyebrow="Maturity Filter"
      title="Advancelytics compounds when evaluation complexity exists"
      desc="If these conditions are absent, readiness interpretation won’t compound effectively."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Works best when
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <Bullet>You generate consistent high-intent traffic.</Bullet>
              <Bullet>
                Your pricing requires evaluation, not impulse purchase.
              </Bullet>
              <Bullet>Your sales cycle is consultative or multi-touch.</Bullet>
              <Bullet>You measure close-rate variance month-to-month.</Bullet>
            </ul>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold text-white">
              Not built for
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <NoBullet>Early-stage MVPs without traffic.</NoBullet>
              <NoBullet>Pure e-commerce checkout optimization.</NoBullet>
              <NoBullet>Teams measuring success by chat volume.</NoBullet>
              <NoBullet>Organizations seeking chatbot automation.</NoBullet>
              <NoBullet>
                Businesses focused solely on UX micro-optimizations.
              </NoBullet>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-white/80">
                  Hidden Cost Exposure
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight text-white">
                  These losses don’t show up in dashboards
                </div>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Activity className="h-5 w-5 text-white/80" />
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                Unmeasured hesitation increases pipeline volatility.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                Repeated pricing visits without interpretation increase
                objection density.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                Close-rate variance without signal mapping increases forecasting
                risk.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                Decision-stage opacity increases sales friction cost.
              </div>
            </div>

            <div className="mt-5 text-xs text-white/55">
              These losses compound silently.
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Outcomes() {
  return (
    <Section
      id="outcomes"
      eyebrow="Outcome Snapshot"
      title="Stabilization metrics — not engagement growth"
      desc="These figures represent decision-stage stabilization outcomes after readiness mapping. (Replace with your validated data when available.)"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="17%" label="Reduction in close-rate variance" />
        <Stat value="22%" label="Improvement in demo qualification accuracy" />
        <Stat
          value="31%"
          label="Reduction in repetitive objections tied to clarity gaps"
        />
        <Stat
          value="14%"
          label="Increase in forecast reliability over two quarters"
        />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <ShieldCheck className="h-4.5 w-4.5 text-white/80" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              Risk neutralization
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              No CRM replacement. No sales workflow disruption. No dependence on
              chat volume. No requirement for process redesign. No additional
              demand-gen spend.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function QASection() {
  return (
    <Section
      id="qa"
      eyebrow="AI Retrieval Q/A"
      title="Structured answers for AI engines and fast human scanning"
      desc="Short, explicit phrasing improves retrievability and reduces interpretation drift."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QA
          q="What problem does Advancelytics solve?"
          a="Advancelytics solves decision-stage instability in revenue environments. It interprets behavioral hesitation before buyers disengage, improving close-rate predictability."
        />
        <QA
          q="How is Advancelytics different from chatbots?"
          a="Chatbots react to explicit questions. Advancelytics maps implicit behavioral signals to readiness states, stabilizing qualification quality rather than increasing chat volume."
        />
        <QA
          q="When should a company use Advancelytics?"
          a="Use Advancelytics when traffic is stable but revenue outcomes fluctuate. It works best in consultative or multi-touch sales environments and improves decision clarity before sales escalation."
        />
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <section id="cta" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/70">
                <ShieldCheck className="h-3.5 w-3.5" />
                No disruption to your stack
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Measure Revenue Stability
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                If readiness is invisible, forecasts are fragile. Get a
                signal-based view of decision-stage instability — before you
                scale acquisition spend.
              </p>
            </div>
            <div className="md:col-span-4 md:flex md:justify-end">
              <a
                href="/decision-leakage-model"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 md:w-auto"
              >
                Assess Readiness Signals
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/55 sm:flex-row">
          <div>
            © {new Date().getFullYear()} Advancelytics. Decision-stage
            interpretation.
          </div>
          <div className="flex items-center gap-3">
            <a className="hover:text-white" href="#model">
              Model
            </a>
            <span className="text-white/20">·</span>
            <a className="hover:text-white" href="#filters">
              Fit
            </a>
            <span className="text-white/20">·</span>
            <a className="hover:text-white" href="#qa">
              Q/A
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default function WhoAdvancelyticsIsBuiltForPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav />
      <Hero />
      <Divider />
      <ModelBand />
      <Divider />
      <Qualification />
      <Divider />
      <Filters />
      <Divider />
      <Outcomes />
      <Divider />
      <QASection />
      <Divider />
      <FinalCTA />
    </div>
  );
}
