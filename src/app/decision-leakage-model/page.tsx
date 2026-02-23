"use client";
import React, { useEffect, useMemo, useState } from "react";

/**
 * Decision Leakage Model — /decision-leakage-model
 * React + Tailwind (single file)
 *
 * Notes:
 * - Assumes Tailwind is configured.
 * - No external UI libs required.
 * - Includes scoring logic exactly as specified by user.
 */

type SeverityTier =
  | "Low Leakage"
  | "Moderate Leakage"
  | "High Leakage"
  | "Severe Leakage";

type ForecastRisk = "Stable" | "Unstable" | "Volatile";

type DriverKey = "Qual" | "Var" | "Hes" | "Obj";

type Band = "2–6%" | "6–12%" | "12–18%" | "18–26%" | "26–35%";

type Inputs = {
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
  Q5: number;
  Q6: number;
  Q7: number;
};

const clamp04 = (n: number) => Math.max(0, Math.min(4, Math.round(n)));
const norm = (q: number) => clamp04(q) / 4;

const WEIGHTS: Record<keyof Inputs, number> = {
  Q1: 12,
  Q2: 20,
  Q3: 12,
  Q4: 18,
  Q5: 14,
  Q6: 10,
  Q7: 14,
};

const QUESTIONS: Array<{ key: keyof Inputs; label: string }> = [
  { key: "Q1", label: "How often do buyers revisit pricing before booking?" },
  {
    key: "Q2",
    label: "How often does close-rate fluctuate despite stable traffic?",
  },
  {
    key: "Q3",
    label:
      "How often do sales calls repeat the same objections around clarity?",
  },
  {
    key: "Q4",
    label: "How often does demo-to-close ratio vary month-to-month?",
  },
  {
    key: "Q5",
    label:
      "How often do leads reach sales without measurable readiness signals?",
  },
  {
    key: "Q6",
    label: "How often do buyers return multiple times before disappearing?",
  },
  {
    key: "Q7",
    label:
      "How often does forecast variance affect hiring or budget decisions?",
  },
];

const SCALE = [
  { v: 0, t: "Never" },
  { v: 1, t: "Rarely" },
  { v: 2, t: "Sometimes" },
  { v: 3, t: "Often" },
  { v: 4, t: "Frequently" },
] as const;

function leakageBand(leakageScore: number): Band {
  if (leakageScore < 20) return "2–6%";
  if (leakageScore < 40) return "6–12%";
  if (leakageScore < 60) return "12–18%";
  if (leakageScore < 80) return "18–26%";
  return "26–35%";
}

function severityTier(leakageScore: number): SeverityTier {
  if (leakageScore <= 24) return "Low Leakage";
  if (leakageScore <= 49) return "Moderate Leakage";
  if (leakageScore <= 74) return "High Leakage";
  return "Severe Leakage";
}

function forecastRiskFromIndex(idx: number): ForecastRisk {
  if (idx < 34) return "Stable";
  if (idx <= 66) return "Unstable";
  return "Volatile";
}

function format0to100(n: number) {
  const v = Math.max(0, Math.min(100, n));
  return Math.round(v);
}

function pct(n: number) {
  return `${format0to100(n)}%`;
}

function progressWidth(n: number) {
  return { width: `${format0to100(n)}%` };
}

function badgeTone(sev: SeverityTier) {
  switch (sev) {
    case "Low Leakage":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
    case "Moderate Leakage":
      return "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/20";
    case "High Leakage":
      return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20";
    case "Severe Leakage":
      return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20";
  }
}

function riskTone(risk: ForecastRisk) {
  switch (risk) {
    case "Stable":
      return "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";
    case "Unstable":
      return "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20";
    case "Volatile":
      return "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20";
  }
}

function driverLabel(k: DriverKey) {
  switch (k) {
    case "Qual":
      return "Qualification Driver";
    case "Var":
      return "Variance Driver";
    case "Hes":
      return "Hesitation Driver";
    case "Obj":
      return "Objection Driver";
  }
}

function interventionForDriver(k: DriverKey) {
  switch (k) {
    case "Qual":
      return "Readiness thresholding before sales escalation";
    case "Var":
      return "Variance monitoring + readiness mapping at decision stage";
    case "Hes":
      return "Hesitation interpretation at pricing and comparison moments";
    case "Obj":
      return "Clarity gap isolation driving repetitive objections";
  }
}

function computeAll(inputs: Inputs) {
  // A) Weighted Leakage Score (0–100)
  const leakageScoreRaw =
    norm(inputs.Q1) * WEIGHTS.Q1 +
    norm(inputs.Q2) * WEIGHTS.Q2 +
    norm(inputs.Q3) * WEIGHTS.Q3 +
    norm(inputs.Q4) * WEIGHTS.Q4 +
    norm(inputs.Q5) * WEIGHTS.Q5 +
    norm(inputs.Q6) * WEIGHTS.Q6 +
    norm(inputs.Q7) * WEIGHTS.Q7;

  const leakageScore = Math.max(0, Math.min(100, leakageScoreRaw));

  // B) DVI (0–100)
  const dvi = format0to100(100 - leakageScore);

  // C) Close-Rate Variance Exposure Band
  const exposureBand = leakageBand(leakageScore);

  // D) Hesitation Density Score (0–100)
  const hesitationDensityRaw =
    (inputs.Q1 / 4) * 40 + (inputs.Q3 / 4) * 35 + (inputs.Q6 / 4) * 25;
  const hesitationDensity = Math.max(0, Math.min(100, hesitationDensityRaw));

  // E) Forecast Risk Indicator
  const forecastRiskIndexRaw =
    (inputs.Q7 / 4) * 50 + (inputs.Q2 / 4) * 30 + (inputs.Q4 / 4) * 20;
  const forecastRiskIndex = Math.max(0, Math.min(100, forecastRiskIndexRaw));
  const forecastRisk = forecastRiskFromIndex(forecastRiskIndex);

  // Severity tiers
  const severity = severityTier(leakageScore);

  // Drivers
  const qual = (inputs.Q5 / 4) * 60 + (inputs.Q4 / 4) * 40;
  const vari = (inputs.Q2 / 4) * 70 + (inputs.Q7 / 4) * 30;
  const hes = hesitationDensity; // already 0–100
  const obj = (inputs.Q3 / 4) * 70 + (inputs.Q1 / 4) * 30;

  const drivers: Record<DriverKey, number> = {
    Qual: Math.max(0, Math.min(100, qual)),
    Var: Math.max(0, Math.min(100, vari)),
    Hes: Math.max(0, Math.min(100, hes)),
    Obj: Math.max(0, Math.min(100, obj)),
  };

  const sortedDrivers = (Object.keys(drivers) as DriverKey[])
    .map((k) => ({ k, v: drivers[k] }))
    .sort((a, b) => b.v - a.v);

  const topDriver = sortedDrivers[0]?.k ?? "Var";
  const recommendedIntervention = interventionForDriver(topDriver);

  return {
    leakageScore,
    dvi,
    exposureBand,
    hesitationDensity,
    forecastRiskIndex,
    forecastRisk,
    severity,
    drivers,
    sortedDrivers,
    topDriver,
    recommendedIntervention,
  };
}

function SectionTitle({
  kicker,
  title,
  desc,
}: {
  kicker?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="space-y-2">
      {kicker ? (
        <div className="text-xs tracking-widest uppercase text-zinc-400">
          {kicker}
        </div>
      ) : null}
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-50">
        {title}
      </h2>
      {desc ? (
        <p className="text-zinc-300 leading-relaxed max-w-3xl">{desc}</p>
      ) : null}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: string;
}) {
  return (
    <Card>
      <div className="p-5 md:p-6 space-y-2">
        <div className="text-xs uppercase tracking-widest text-zinc-400">
          {label}
        </div>
        <div className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50">
          {value}
        </div>
        {sub ? (
          <div className={"text-sm text-zinc-300 " + (tone ?? "")}>{sub}</div>
        ) : null}
      </div>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-medium text-zinc-200">{label}</div>
        <div className="text-sm text-zinc-300 tabular-nums">{pct(value)}</div>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-white/20"
          style={progressWidth(value)}
        />
      </div>
      {hint ? <div className="text-xs text-zinc-400">{hint}</div> : null}
    </div>
  );
}

function CopyToClipboard({
  getText,
  label,
}: {
  getText: () => string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // no-op
        }
      }}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
    >
      {copied ? "Copied" : label}
      <span className="text-xs text-zinc-400">↗</span>
    </button>
  );
}

function RadioScale({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (n: number) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {SCALE.map((s) => (
        <label
          key={s.v}
          className={
            "cursor-pointer select-none rounded-xl border px-3 py-2 text-xs md:text-sm transition " +
            (value === s.v
              ? "border-white/20 bg-white/10 text-zinc-50"
              : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10")
          }
        >
          <input
            type="radio"
            name={name}
            value={s.v}
            checked={value === s.v}
            onChange={() => onChange(s.v)}
            className="sr-only"
          />
          <span className="font-medium">{s.t}</span>
          <span className="ml-2 text-zinc-400">({s.v})</span>
        </label>
      ))}
    </div>
  );
}

export default function DecisionLeakageModelPage() {
  const [inputs, setInputs] = useState<Inputs>({
    Q1: 2,
    Q2: 2,
    Q3: 2,
    Q4: 2,
    Q5: 2,
    Q6: 2,
    Q7: 2,
  });

  const [showFull, setShowFull] = useState(false);
  const results = useMemo(() => computeAll(inputs), [inputs]);

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

  const canCalculate = useMemo(() => {
    // Inputs always numeric; keep for future validation.
    return (Object.values(inputs) as number[]).every((n) => n >= 0 && n <= 4);
  }, [inputs]);

  const sharePayload = useMemo(() => {
    const payload = {
      inputs,
      outputs: {
        LeakageScore: Math.round(results.leakageScore),
        DVI: results.dvi,
        Severity: results.severity,
        ExposureBand: results.exposureBand,
        HesitationDensity: Math.round(results.hesitationDensity),
        ForecastRisk: results.forecastRisk,
        ForecastRiskIndex: Math.round(results.forecastRiskIndex),
        TopDriver: results.topDriver,
        RecommendedIntervention: results.recommendedIntervention,
      },
      drivers: Object.fromEntries(
        (Object.keys(results.drivers) as DriverKey[]).map((k) => [
          k,
          Math.round(results.drivers[k]),
        ]),
      ),
    };

    return JSON.stringify(payload, null, 2);
  }, [inputs, results]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Background accents */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-56 -left-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Desktop page-specific menu — below global header, then fades out */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-[top,opacity,transform] duration-300 ease-out hidden md:block ${
          floating
            ? "opacity-0 -translate-y-1 pointer-events-none"
            : "opacity-100 translate-y-0"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl py-4 px-4 sm:px-6 lg:px-8 flex">
          <div className="flex items-center gap-3 md:pr-42">
            <span className="text-lg font-semibold tracking-tight">
              Agentlytics
            </span>
            <span className="ml-2 rounded-full bg-[--surface] px-2 py-0.5 text-xs font-medium text-[--secondary]">
              Decision Intelligence
            </span>
          </div>

          <nav className="flex items-center gap-3 text-sm text-zinc-200">
            <a
              href="#model"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#assessment"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "assessment")}
            >
              Assessment
            </a>
            <a
              href="#results"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "results")}
            >
              Results
            </a>
          </nav>
        </div>
      </header>

      {/* Desktop floating bar — at very top when scrolled */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-opacity duration-300 ease-out hidden md:block ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-4">
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-200">
            <a
              href="#model"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#assessment"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "assessment")}
            >
              Assessment
            </a>
            <a
              href="#results"
              className="rounded-xl px-3 py-2 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "results")}
            >
              Results
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile page-specific menu — below global header, then fades out */}
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
          <nav className="flex items-center gap-3 text-xs text-zinc-200">
            <a
              href="#model"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#assessment"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "assessment")}
            >
              Assessment
            </a>
            <a
              href="#results"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "results")}
            >
              Results
            </a>
          </nav>
        </div>
      </header>

      {/* Mobile floating bar — at very top when scrolled */}
      <header
        className={`fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur transition-opacity duration-300 ease-out md:hidden ${
          floating ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!floating}
      >
        <div className="w-full h-14 flex items-center justify-center px-3">
          <nav className="flex items-center gap-3 text-xs text-zinc-200">
            <a
              href="#model"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "model")}
            >
              Model
            </a>
            <a
              href="#assessment"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "assessment")}
            >
              Assessment
            </a>
            <a
              href="#results"
              className="rounded-lg px-2 py-1 hover:bg-white/10"
              onClick={(e) => handleScroll(e, "results")}
            >
              Results
            </a>
          </nav>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed desktop headers */}
      <div className="hidden md:block h-16" aria-hidden />

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-12 items-start">
            <div className="md:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                Defensible scoring • executive-friendly outputs
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                Revenue instability often starts in unmeasured buyer hesitation.
              </h1>
              <p className="text-zinc-300 text-lg leading-relaxed max-w-2xl">
                Model decision-stage behavior to quantify close-rate variance
                exposure. No replacement of your existing systems.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#assessment"
                  className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-950 px-5 py-3 text-sm font-medium hover:opacity-90 transition"
                >
                  Model Decision Leakage
                </a>
                <a
                  href="#model"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-200 hover:bg-white/10 transition"
                >
                  See how the model works
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-zinc-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  No CRM replacement
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  No workflow disruption
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Interpretation layer only
                </span>
              </div>
            </div>

            {/* Right-side preview card */}
            <div className="md:col-span-5">
              <Card>
                <div className="p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        Partial Output Preview
                      </div>
                      <div className="text-sm text-zinc-300 mt-1">
                        Calculate to see DVI, severity, exposure band,
                        hesitation density, and forecast risk.
                      </div>
                    </div>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                        badgeTone(results.severity)
                      }
                    >
                      {results.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        DVI
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        {results.dvi}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Stability (0–100)
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        Leakage
                      </div>
                      <div className="mt-1 text-2xl font-semibold tabular-nums">
                        {Math.round(results.leakageScore)}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
                        Leakage score (0–100)
                      </div>
                    </div>
                  </div>

                  <ProgressRow
                    label="Hesitation Density"
                    value={results.hesitationDensity}
                    hint="Concentration of hesitation during evaluation (Q1, Q3, Q6)."
                  />

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        Exposure band
                      </div>
                      <div className="text-sm text-zinc-200 mt-1">
                        Estimated close-rate variance exposure
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm tabular-nums">
                      {results.exposureBand}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        Forecast risk
                      </div>
                      <div className="text-sm text-zinc-200 mt-1">
                        Operational exposure indicator
                      </div>
                    </div>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                        riskTone(results.forecastRisk)
                      }
                    >
                      {results.forecastRisk}
                    </span>
                  </div>

                  <a
                    href="#assessment"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-white text-zinc-950 px-5 py-3 text-sm font-medium hover:opacity-90 transition"
                  >
                    Calculate Decision Leakage
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Instability Compression */}
      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            kicker="Instability Compression"
            title="Pipeline can look full while readiness collapses silently."
            desc="This model isolates the hidden instability layer where evaluation hesitation translates into close-rate variance and forecast volatility."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                h: "Traffic appears steady",
                p: "But evaluation behavior can degrade without changing top-of-funnel volume.",
              },
              {
                h: "Demo volume appears healthy",
                p: "But demo-to-close variability indicates instability in readiness progression.",
              },
              {
                h: "Pipeline looks full",
                p: "Yet close rates fluctuate when decision-stage clarity is missing.",
              },
            ].map((x) => (
              <Card key={x.h}>
                <div className="p-6 space-y-2">
                  <div className="text-lg font-semibold">{x.h}</div>
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    {x.p}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Decision Intelligence Model */}
      <section id="model" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            kicker="Decision Intelligence Model"
            title="Behavior Signals → Readiness Mapping → Revenue Stabilization"
            desc="Capture evaluation behaviors, map signal clusters to readiness states, quantify variance exposure, then select the smallest clarity intervention."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card>
                <div className="p-6 md:p-7">
                  <div className="flex flex-col gap-4">
                    {[
                      "Behavior Signals",
                      "Readiness Mapping",
                      "Revenue Stabilization",
                    ].map((t, idx) => (
                      <div key={t} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="text-base font-semibold">{t}</div>
                          <div className="text-sm text-zinc-300 leading-relaxed">
                            {t === "Behavior Signals" &&
                              "Capture evaluation behaviors during pricing, comparison, and repeat visits."}
                            {t === "Readiness Mapping" &&
                              "Map signal clusters to readiness states that explain variance."}
                            {t === "Revenue Stabilization" &&
                              "Quantify exposure, then choose the smallest clarity interventions to stabilize outcomes."}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            <div className="md:col-span-5">
              <Card>
                <div className="p-6 md:p-7 space-y-3">
                  <div className="text-xs uppercase tracking-widest text-zinc-400">
                    Structural Differentiation
                  </div>
                  <div className="space-y-2 text-sm text-zinc-200">
                    <div className="flex gap-2">
                      <span className="text-zinc-400">Chatbots:</span>
                      <span>Wait for questions.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-400">This model:</span>
                      <span>Measures readiness collapse.</span>
                    </div>
                    <div className="h-px bg-white/10 my-3" />
                    <div className="flex gap-2">
                      <span className="text-zinc-400">Chatbots:</span>
                      <span>Report engagement.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-400">This model:</span>
                      <span>Quantifies variance exposure.</span>
                    </div>
                    <div className="h-px bg-white/10 my-3" />
                    <div className="flex gap-2">
                      <span className="text-zinc-400">Chatbots:</span>
                      <span>Optimize conversations.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-400">This model:</span>
                      <span>Stabilizes decision outcomes.</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnostic Assessment */}
      <section
        id="assessment"
        className="relative z-10 border-t border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            kicker="Diagnostic Assessment"
            title="Decision Leakage Assessment"
            desc="Answer these to calculate your Decision Velocity Index. Scale: Never (0) · Rarely (1) · Sometimes (2) · Often (3) · Frequently (4)."
          />

          <div className="mt-8 grid gap-6">
            {QUESTIONS.map((q) => (
              <Card key={q.key}>
                <div className="p-6 md:p-7 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        {q.key} • Weight {WEIGHTS[q.key]}%
                      </div>
                      <div className="text-base md:text-lg font-semibold leading-snug">
                        {q.label}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm tabular-nums text-zinc-200">
                      {clamp04(inputs[q.key])}
                    </div>
                  </div>

                  <RadioScale
                    name={q.key}
                    value={inputs[q.key]}
                    onChange={(n) =>
                      setInputs((p) => ({ ...p, [q.key]: clamp04(n) }))
                    }
                  />
                </div>
              </Card>
            ))}

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                type="button"
                disabled={!canCalculate}
                onClick={() => {
                  // results already computed via memo; this ensures focus scroll for UX
                  const el = document.getElementById("results");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={
                  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition " +
                  (canCalculate
                    ? "bg-white text-zinc-950 hover:opacity-90"
                    : "bg-white/10 text-zinc-500 cursor-not-allowed")
                }
              >
                Calculate Decision Leakage
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputs({
                    Q1: 0,
                    Q2: 0,
                    Q3: 0,
                    Q4: 0,
                    Q5: 0,
                    Q6: 0,
                    Q7: 0,
                  });
                }}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-200 hover:bg-white/10 transition"
              >
                Reset
              </button>

              <div className="sm:ml-auto">
                <CopyToClipboard
                  label="Copy results JSON"
                  getText={() => sharePayload}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div id="results" className="mt-10 grid gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <StatCard
                label="Decision Velocity Index"
                value={<span className="tabular-nums">{results.dvi}</span>}
                sub="Higher indicates more stable decision progression during evaluation."
              />
            </div>
            <div className="md:col-span-4">
              <StatCard
                label="Leakage Severity Tier"
                value={
                  <span className="tabular-nums">
                    {Math.round(results.leakageScore)}
                  </span>
                }
                sub={
                  <span
                    className={
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                      badgeTone(results.severity)
                    }
                  >
                    {results.severity}
                  </span>
                }
              />
            </div>
            <div className="md:col-span-4">
              <StatCard
                label="Estimated Close-Rate Variance Exposure"
                value={
                  <span className="tabular-nums">{results.exposureBand}</span>
                }
                sub="Banded range to stay executive-friendly without overclaiming."
              />
            </div>

            <div className="md:col-span-6">
              <Card>
                <div className="p-6 md:p-7 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        Hesitation Density
                      </div>
                      <div className="text-sm text-zinc-300 mt-1">
                        Focused on hesitation proxies (Q1, Q3, Q6).
                      </div>
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                      {Math.round(results.hesitationDensity)}
                    </div>
                  </div>
                  <ProgressRow
                    label="Hesitation Density Score"
                    value={results.hesitationDensity}
                  />
                </div>
              </Card>
            </div>

            <div className="md:col-span-6">
              <Card>
                <div className="p-6 md:p-7 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400">
                        Forecast Risk Indicator
                      </div>
                      <div className="text-sm text-zinc-300 mt-1">
                        Primary Q7, supported by Q2 and Q4.
                      </div>
                    </div>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                        riskTone(results.forecastRisk)
                      }
                    >
                      {results.forecastRisk}
                    </span>
                  </div>
                  <ProgressRow
                    label="Forecast Risk Index"
                    value={results.forecastRiskIndex}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Full report unlock preview */}
          <div className="mt-10">
            <Card>
              <div className="p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-zinc-400">
                      Full report
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      Driver breakdown + smallest clarity intervention
                    </div>
                    <div className="text-sm text-zinc-300 mt-1 max-w-3xl">
                      The model selects one intervention type based on dominant
                      structural drivers—no broad guessing.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFull((s) => !s)}
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10 transition"
                    >
                      {showFull ? "Hide preview" : "Preview driver logic"}
                    </button>
                    <a
                      href="#register"
                      className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-950 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      Register
                    </a>
                  </div>
                </div>

                {showFull ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Card>
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-widest text-zinc-400">
                              Top driver
                            </div>
                            <div className="text-lg font-semibold mt-1">
                              {driverLabel(results.topDriver)}
                            </div>
                            <div className="text-sm text-zinc-300 mt-1">
                              Recommended:{" "}
                              <span className="text-zinc-100">
                                {results.recommendedIntervention}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm tabular-nums text-zinc-200">
                            {Math.round(results.drivers[results.topDriver])}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {results.sortedDrivers.map((d) => (
                            <ProgressRow
                              key={d.k}
                              label={driverLabel(d.k)}
                              value={d.v}
                              hint={
                                d.k === "Qual"
                                  ? "Q5 and Q4 signal qualification failure."
                                  : d.k === "Var"
                                    ? "Q2 and Q7 indicate variance exposure."
                                    : d.k === "Hes"
                                      ? "Q1/Q3/Q6 capture evaluation hesitation."
                                      : "Q3 and Q1 indicate clarity gap repetition."
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6 space-y-4">
                        <div className="text-xs uppercase tracking-widest text-zinc-400">
                          Defensibility notes
                        </div>
                        <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5">
                          <li>
                            LeakageScore is a weighted sum of normalized
                            frequencies; weights sum to 100 for direct
                            interpretability.
                          </li>
                          <li>
                            DVI is inverted leakage (stability framing) to keep
                            executive output intuitive.
                          </li>
                          <li>
                            Exposure uses bands (not point estimates) to avoid
                            overclaiming.
                          </li>
                          <li>
                            Forecast risk is anchored primarily to Q7, with
                            Q2/Q4 as supporting variance signals.
                          </li>
                          <li>
                            Intervention selection uses dominant driver
                            only—structural recommendation, not feature
                            guessing.
                          </li>
                        </ul>
                      </div>
                    </Card>
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Role-Based Qualification */}
      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            kicker="Role-Based Qualification"
            title="Built for revenue teams where stability matters."
            desc="Same model. Different operational lens."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                r: "For CMOs",
                d: "Reducing conversion plateau: quantify readiness instability before it hits pipeline quality.",
              },
              {
                r: "For CROs",
                d: "Reducing close-rate variance: expose decision-stage leakage drivers that collapse certainty.",
              },
              {
                r: "For RevOps",
                d: "Improving forecast accuracy: flag variance and risk drivers tied to spend and hiring exposure.",
              },
            ].map((x) => (
              <Card key={x.r}>
                <div className="p-6 space-y-2">
                  <div className="text-lg font-semibold">{x.r}</div>
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    {x.d}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hidden Cost Exposure */}
      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            kicker="Hidden Cost Exposure"
            title="These costs compound when decision signals are missing."
            desc="A stability gap is rarely visible in analytics dashboards—but it shows up in spend decisions, hiring timing, and pipeline confidence."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card>
                <div className="p-6 md:p-7 space-y-3">
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    <div className="flex gap-2">
                      <span className="text-zinc-400">•</span>
                      <span>
                        Unmeasured hesitation increases revenue forecast error.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-400">•</span>
                      <span>
                        Readiness variance increases sales cycle friction cost.
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-zinc-400">•</span>
                      <span>
                        Repetitive objections increase close-rate instability.
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="text-xs text-zinc-400">
                    Outputs are directional and banded. This model is designed
                    for diagnosis and prioritization.
                  </div>
                </div>
              </Card>
            </div>

            <div className="md:col-span-5">
              <Card>
                <div className="p-6 md:p-7 space-y-4">
                  <div className="text-xs uppercase tracking-widest text-zinc-400">
                    AI Retrieval Q/A
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold">
                        What is the Decision Leakage Model?
                      </div>
                      <div className="text-sm text-zinc-300 leading-relaxed mt-1">
                        A diagnostic that quantifies decision-stage hesitation
                        and its revenue impact by mapping behavior signals to
                        readiness instability.
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        What does the Decision Velocity Index mean?
                      </div>
                      <div className="text-sm text-zinc-300 leading-relaxed mt-1">
                        A 0–100 stability score estimating how consistent
                        decision progression is during evaluation. Higher
                        indicates lower leakage risk.
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Does this replace CRM or sales workflow?
                      </div>
                      <div className="text-sm text-zinc-300 leading-relaxed mt-1">
                        No. It measures decision-stage instability without
                        replacing systems. Interpretation layer only.
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Neutralization */}
      <section className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            kicker="Risk Neutralization"
            title="Decision intelligence layer only."
            desc="No replacement. No disruption. No attribution dependency changes."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "No CRM replacement",
              "No sales workflow disruption",
              "No attribution dependency changes",
            ].map((t) => (
              <Card key={t}>
                <div className="p-6">
                  <div className="text-sm font-semibold">{t}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA + Registration */}
      {/* <section id="register" className="relative z-10 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <Card>
            <div className="p-7 md:p-10 grid gap-8 md:grid-cols-12 items-start">
              <div className="md:col-span-7 space-y-4">
                <div className="text-xs uppercase tracking-widest text-zinc-400">
                  Final CTA
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Unlock your full Decision Stability Report.
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Get driver breakdowns and intervention guidance mapped to the
                  smallest clarity moves that stabilize outcomes.
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Driver breakdown
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Intervention selector
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Exportable results
                  </span>
                </div>
              </div>

              <div className="md:col-span-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Hook this to your auth/registration endpoint.
                    // e.g., POST /api/register-decision-stability
                    alert("Connect this form to your registration flow.");
                  }}
                  className="space-y-3"
                >
                  <label className="block">
                    <span className="text-xs text-zinc-400">Work email</span>
                    <input
                      required
                      type="email"
                      placeholder="you@company.com"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs text-zinc-400">Company</span>
                    <input
                      required
                      type="text"
                      placeholder="Company name"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs text-zinc-400">Role</span>
                    <select
                      className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-50 focus:outline-none focus:ring-2 focus:ring-white/20"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      <option>CMO</option>
                      <option>CRO</option>
                      <option>RevOps</option>
                      <option>Founder</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center rounded-xl bg-white text-zinc-950 px-5 py-3 text-sm font-medium hover:opacity-90 transition"
                  >
                    Register to See Full Stability Model
                  </button>

                  <div className="text-xs text-zinc-500 leading-relaxed">
                    No CRM access required. Your inputs stay at assessment-level
                    unless you opt into deeper integration.
                  </div>
                </form>
              </div>
            </div>
          </Card>

          <footer className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500">
            <div>© {new Date().getFullYear()} Advancelytics</div>
            <div className="flex items-center gap-3">
              <a className="hover:text-zinc-300 transition" href="#assessment">
                Re-run assessment
              </a>
              <a className="hover:text-zinc-300 transition" href="#model">
                Model
              </a>
              <a className="hover:text-zinc-300 transition" href="#register">
                Register
              </a>
            </div>
          </footer>
        </div>
      </section> */}
    </div>
  );
}
