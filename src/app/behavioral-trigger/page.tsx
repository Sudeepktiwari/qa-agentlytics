"use client";
import { motion } from "framer-motion";
import {
  Activity,
  AlarmClock,
  MousePointerClick,
  Scroll,
  Target,
  Eye,
  LineChart,
  Clock4,
} from "lucide-react";

/**
 * Agentlytics – Behavioral Triggers (FULL PAGE)
 * - Next.js-ready single file
 * - TailwindCSS + framer-motion + lucide-react
 * - Mobile-first, fully responsive
 * - Autonomous messaging: no misleading toggles
 */

export default function BehavioralTriggersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-600">
              Behavioral Triggers
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50"
              href="#learn"
            >
              Learn
            </a>
            <a
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white shadow hover:bg-blue-700"
              href="#cta"
            >
              Start free
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background orbs */}
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-32 -left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm">
                <Activity className="size-3.5 text-green-600" /> Real‑time
                intent engine
              </div>
              <h1 className="mt-4 text-4xl/tight sm:text-5xl/tight font-extrabold tracking-tight">
                Behavioral Triggers —
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {" "}
                  Detect, Predict, and Engage
                </span>
              </h1>
              <p className="mt-4 text-slate-600 max-w-xl">
                Agentlytics <strong>automatically</strong> observes dwell time,
                scroll depth, rage clicks, and exit intent — launching the right
                message at the right moment before visitors bounce. No rule
                building required.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#cta"
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700"
                >
                  Start free
                </a>
                <a
                  href="#demo"
                  className="px-5 py-3 rounded-2xl border border-slate-200 bg-white font-medium hover:bg-slate-50"
                >
                  Watch demo
                </a>
              </div>

              {/* chips */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
                {[
                  {
                    icon: <Clock4 className="size-3.5" />,
                    label: "Dwell time",
                  },
                  {
                    icon: <Scroll className="size-3.5" />,
                    label: "Scroll depth",
                  },
                  {
                    icon: <MousePointerClick className="size-3.5" />,
                    label: "Rage clicks",
                  },
                  { icon: <Eye className="size-3.5" />, label: "Exit intent" },
                ].map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm"
                  >
                    {chip.icon}
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                {/* mock page */}
                <div className="h-64 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 p-4 relative overflow-hidden">
                  {/* header dots */}
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-red-400" />
                    <div className="size-2.5 rounded-full bg-yellow-400" />
                    <div className="size-2.5 rounded-full bg-green-400" />
                  </div>
                  {/* content lines */}
                  <div className="mt-4 space-y-3">
                    <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-slate-200 animate-pulse" />
                  </div>
                  {/* cards */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100 transition"
                      >
                        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
                        <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                        <div className="mt-3 h-7 w-full rounded-lg bg-slate-100" />
                      </div>
                    ))}
                  </div>

                  {/* animated beacons */}
                  <AnimatedBeacon
                    className="left-6 top-10"
                    label="Scroll 60%"
                  />
                  <AnimatedBeacon
                    className="right-10 top-24"
                    label="30s dwell"
                    color="indigo"
                  />
                  <AnimatedBeacon
                    className="left-24 bottom-8"
                    label="Exit intent"
                    color="cyan"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="learn"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Eye className="size-6 text-blue-600" />,
              title: "Observe",
              text: "Track micro‑interactions like scroll, idle time, cursor velocity, and rage clicks—privacy‑safe and cookie‑light.",
            },
            {
              icon: <Activity className="size-6 text-indigo-600" />,
              title: "Classify",
              text: "Classify the session as researching, comparing, or exiting with a lightweight intent model.",
            },
            {
              icon: <Target className="size-6 text-cyan-600" />,
              title: "Trigger",
              text: "Launch the right play: nudge, assistance, or demo offer—within milliseconds.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {s.icon}
                <h3 className="font-semibold text-lg">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI PLAYBOOK (reframed from recipes) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              AI Trigger Playbook
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              Examples of automated plays the AI runs on your site. No setup
              required. Labels below indicate how the AI optimizes each play in
              real time.
            </p>
          </div>

          <div className="mt-6 grid lg:grid-cols-3 gap-4">
            {playbook.map((p, i) => (
              <PlayCard key={i} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              kpi: "−32%",
              label: "Bounce on pricing",
            },
            {
              kpi: "+2.4×",
              label: "Chat engagement",
            },
            {
              kpi: "+18%",
              label: "Demo bookings",
            },
            {
              kpi: "<200ms",
              label: "Trigger latency",
            },
          ].map((k, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-3xl font-extrabold tracking-tight">
                {k.kpi}
              </div>
              <div className="mt-1 text-sm text-slate-600">{k.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f, i) => (
            <details key={i} className="group p-5 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <span className="ml-4 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 group-open:rotate-90 transition">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Turn intent into action.
              </h2>
              <p className="mt-2 text-blue-100">
                Install the lightweight snippet and go live in minutes. No
                redesign. No cookies needed for core signals.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-medium shadow hover:bg-blue-50"
                  href="#"
                >
                  Start free
                </a>
                <a
                  className="px-5 py-3 rounded-2xl border border-white/30 font-medium hover:bg-white/10"
                  href="#demo"
                >
                  Book a demo
                </a>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-white/10 p-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <MiniStat
                  icon={<AlarmClock className="size-4" />}
                  title="Dwell > 25s"
                  value="Auto‑assist"
                />
                <MiniStat
                  icon={<Scroll className="size-4" />}
                  title="Scroll > 70%"
                  value="Nudge CTA"
                />
                <MiniStat
                  icon={<MousePointerClick className="size-4" />}
                  title="Rage clicks"
                  value="Open help"
                />
                <MiniStat
                  icon={<LineChart className="size-4" />}
                  title="High prop score"
                  value="Offer demo"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Agentlytics
      </footer>
    </div>
  );
}

/* ==== helpers ==== */
function AnimatedBeacon({
  className = "",
  label,
  color = "blue",
}: {
  className?: string;
  label: string;
  color?: "blue" | "indigo" | "cyan";
}) {
  const colorMap = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    cyan: "bg-cyan-500",
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
      className={`absolute ${className} flex items-center`}
    >
      <span className={`relative inline-flex`}>
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${colorMap[color]} opacity-30 animate-ping`}
        />
        <span
          className={`relative inline-flex size-3 rounded-full ${colorMap[color]}`}
        />
      </span>
      <div className="ml-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 shadow-sm">
        {label}
      </div>
    </motion.div>
  );
}

const playbook = [
  {
    icon: <Target className="size-5 text-indigo-600" />,
    title: "Exit‑Intent Rescue",
    desc: "When exit intent is detected for a first‑time visitor, the AI offers a helpful guide or light‑weight lead magnet.",
    status: "AI‑Optimized",
    lines: [
      "when exit_intent == true",
      "and user.isReturning == false",
      "→ guide/offer shown contextually",
    ],
  },
  {
    icon: <LineChart className="size-5 text-blue-600" />,
    title: "Pricing Page Saver",
    desc: "On pricing dwell + scroll depth, the AI surfaces ROI snippets and invites to a 15‑min fit check.",
    status: "Auto‑Detected",
    lines: [
      "page == 'pricing'",
      "dwell > 25s & scroll > 50%",
      "→ open chat with demo picker",
    ],
  },
  {
    icon: <Scroll className="size-5 text-cyan-600" />,
    title: "PLG Nudge",
    desc: "On docs dwell, the AI nudges users toward Quick Start and search to reduce friction.",
    status: "Self‑Tuning",
    lines: ["page == 'docs'", "dwell > 40s", "→ suggest Quick Start / search"],
  },
];

function PlayCard({ icon, title, desc, status, lines }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="px-2.5 py-1 text-[10px] rounded-full border border-slate-200 bg-slate-50 text-slate-600">
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 font-mono text-[11px] leading-relaxed text-slate-700">
        {lines.map((l: string, i: number) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 text-slate-900">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {icon} {title}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

const faqs = [
  {
    q: "Do I need to configure rules?",
    a: "No. The AI runs these plays autonomously. You can optionally scope behavior by path, device, or UTM if desired.",
  },
  {
    q: "Do you require cookies to detect intent?",
    a: "No. Core signals (scroll, dwell, exit) are collected in‑session and aren’t tied to identity. Cookie‑less mode is available.",
  },
  {
    q: "Will this slow down my site?",
    a: "The snippet is <5KB gzipped and loads deferred. Trigger evaluation runs in a worker and averages under 200ms.",
  },
];
