"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Users,
  User,
  Headphones,
  Handshake,
  ClipboardCheck,
  MessageSquare,
  Sparkles,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  History,
} from "lucide-react";

/**
 * Agentlytics – Multi‑Persona AI (FULL PAGE)
 * - Next.js-ready single file
 * - TailwindCSS + framer-motion + lucide-react
 * - Mobile-first, fully responsive
 * - Emphasizes AUTONOMOUS persona switching & context carryover
 */

export default function MultiPersonaAIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-600">Multi‑Persona AI</span>
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
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-32 -left-16 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm">
                <BrainCircuit className="size-3.5 text-indigo-600" />{" "}
                Lifecycle‑aware intelligence
              </div>
              <h1 className="mt-4 text-4xl/tight sm:text-5xl/tight font-extrabold tracking-tight">
                Multi‑Persona AI —
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                  {" "}
                  One Brain, Many Roles
                </span>
              </h1>
              <p className="mt-4 text-slate-600 max-w-xl">
                A single AI that <strong>autonomously switches personas</strong>{" "}
                across Lead, Sales, Onboarding, and Support — carrying full
                context so conversations feel seamless.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#cta"
                  className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700"
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
                    icon: <Users className="size-3.5" />,
                    label: "Lead → Sales → Success",
                  },
                  {
                    icon: <History className="size-3.5" />,
                    label: "Context memory",
                  },
                  {
                    icon: <ShieldCheck className="size-3.5" />,
                    label: "Role‑safe tone",
                  },
                  {
                    icon: <Sparkles className="size-3.5" />,
                    label: "Self‑tuning",
                  },
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

            {/* Illustration – Persona Switch Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <PersonaTimeline />
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
              icon: <BrainCircuit className="size-6 text-indigo-600" />,
              title: "Detect Stage",
              text: "Signals like page type, intent score, CRM status, and behavior indicate whether the user is a lead, buyer, or customer.",
            },
            {
              icon: <Bot className="size-6 text-blue-600" />,
              title: "Switch Persona",
              text: "Tone, prompts, and goals adapt instantly: Sales for pricing questions, Onboarding for new customers, Support for issues.",
            },
            {
              icon: <ClipboardCheck className="size-6 text-cyan-600" />,
              title: "Carry Context",
              text: "Conversation history and attributes (company, plan, past chats) carry forward — no repetition for the user.",
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

      {/* PERSONA CARDS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Personas (Auto‑Switched)
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              The AI chooses the right role and tone — you don’t configure
              anything. Below are examples of how messaging shifts by persona.
            </p>
          </div>

          <div className="mt-6 grid lg:grid-cols-4 gap-4">
            <PersonaCard
              icon={<Users className="size-5" />}
              title="Lead"
              tone="Curious • Value‑focused"
              sample="Welcome! I can help you decide if Agentlytics fits your goals. Want a quick fit‑check?"
            />
            <PersonaCard
              icon={<Handshake className="size-5" />}
              title="Sales"
              tone="Consultative • ROI‑driven"
              sample="Based on your traffic, teams like yours increased demos by 18%. Shall I open slots for a 15‑min demo?"
            />
            <PersonaCard
              icon={<ClipboardCheck className="size-5" />}
              title="Onboarding"
              tone="Guiding • Step‑wise"
              sample="Great to have you onboard! Let’s set your triggers and connect HubSpot — takes ~3 minutes."
            />
            <PersonaCard
              icon={<Headphones className="size-5" />}
              title="Support"
              tone="Calm • Resolutive"
              sample="I can help with that. I’ve pulled your last session logs — here’s the fix, and I’ve applied it for you."
            />
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              kpi: "+27%",
              label: "Leads to demos",
            },
            {
              kpi: "+21%",
              label: "Onboarding completion",
            },
            {
              kpi: "−35%",
              label: "Support hand‑offs",
            },
            {
              kpi: "100%",
              label: "Context retention",
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
        className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                One AI, zero hand‑offs.
              </h2>
              <p className="mt-2 text-indigo-100">
                Go live with autonomous personas that keep context from first
                visit to loyal customer — no playbooks to maintain.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-medium shadow hover:bg-indigo-50"
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
                  icon={<MessageSquare className="size-4" />}
                  title="Lead → Sales"
                  value="Seamless"
                />
                <MiniStat
                  icon={<ClipboardCheck className="size-4" />}
                  title="Sales → Onboarding"
                  value="Hand‑off‑free"
                />
                <MiniStat
                  icon={<Headphones className="size-4" />}
                  title="Onboarding → Support"
                  value="No context loss"
                />
                <MiniStat
                  icon={<Sparkles className="size-4" />}
                  title="Self Tuning"
                  value="Continual"
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

/* ===== Illustration Components ===== */
function PersonaTimeline() {
  const steps = [
    {
      icon: <Users className="size-4 text-indigo-600" />,
      label: "Lead",
      caption: "Browsing pricing",
    },
    {
      icon: <Handshake className="size-4 text-blue-600" />,
      label: "Sales",
      caption: "ROI questions",
    },
    {
      icon: <ClipboardCheck className="size-4 text-cyan-600" />,
      label: "Onboarding",
      caption: "Connected HubSpot",
    },
    {
      icon: <Headphones className="size-4 text-emerald-600" />,
      label: "Support",
      caption: "Setup question",
    },
  ];
  return (
    <div className="relative">
      {/* mock chat panel */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-yellow-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
        </div>
        <div className="mt-4 space-y-3">
          <ChatBubble who="user" text="Can you help me choose a plan?" />
          <PersonaPill
            icon={<Handshake className="size-3" />}
            label="Sales persona"
          />
          <ChatBubble
            who="ai"
            text="Sure! Typical ROI for teams like yours is 2.4×. Want a 15‑min fit check?"
          />
          <ChatBubble
            who="user"
            text="Booked. Also — how do I connect HubSpot?"
          />
          <PersonaPill
            icon={<ClipboardCheck className="size-3" />}
            label="Onboarding persona"
          />
          <ChatBubble
            who="ai"
            text="I’ve detected your workspace and can auto‑connect. Done! Next: enable triggers."
          />
          <ChatBubble who="user" text="I see an error on the docs page." />
          <PersonaPill
            icon={<Headphones className="size-3" />}
            label="Support persona"
          />
          <ChatBubble
            who="ai"
            text="I pulled your last session logs — fixed the config and added a test booking. All set!"
          />
        </div>
      </div>

      {/* timeline below */}
      <div className="mt-5 grid grid-cols-4 gap-3">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center"
          >
            <div className="mx-auto mb-1 flex size-8 items-center justify-center rounded-full bg-slate-50">
              {s.icon}
            </div>
            <div className="text-[8px] md:text-xs font-semibold">{s.label}</div>
            <div className="text-[6px] text-slate-500">{s.caption}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PersonaPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 shadow-sm">
      {icon}
      {label}
    </div>
  );
}

function ChatBubble({ who, text }: { who: "ai" | "user"; text: string }) {
  const isAI = who === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border ${
          isAI
            ? "bg-white border-slate-200"
            : "bg-indigo-600 border-indigo-600 text-white"
        } px-3 py-2 text-sm shadow-sm`}
      >
        {text}
      </div>
    </div>
  );
}

function PersonaCard({
  icon,
  title,
  tone,
  sample,
}: {
  icon: React.ReactNode;
  title: string;
  tone: string;
  sample: string;
}) {
  const [active, setActive] = useState(false);
  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="px-2.5 py-1 text-[10px] rounded-full border border-slate-200 bg-slate-50 text-slate-600">
          Auto‑Selected
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Tone: {tone}</p>
      <div
        className={`mt-3 rounded-xl ${
          active
            ? "bg-indigo-50 border-indigo-200"
            : "bg-slate-50 border-slate-200"
        } border p-3 text-sm`}
      >
        {sample}
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
    q: "Do we have to define personas manually?",
    a: "No. The AI detects stage and switches personas automatically based on signals like page intent, CRM status, and interaction history.",
  },
  {
    q: "Is context shared securely across personas?",
    a: "Yes. Context is retained in‑session and scoped to your data permissions. Role‑safe guidelines ensure each persona responds appropriately.",
  },
  {
    q: "Can we restrict or customize behavior?",
    a: "Optional guardrails let you adjust tone, off‑limits topics, or escalation rules — without building playbooks.",
  },
];
