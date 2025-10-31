"use client";
import React from "react";
import { motion } from "framer-motion";

// HubSpot-style palette helpers
const hs = {
  coral: "#FF7A59",
  coralDeep: "#FF5C35",
  mint: "#00BDA5",
  blue: "#00A4BD",
  navy: "#33475B",
  navy2: "#425B76",
  bgAlt: "#F5F8FA",
};

const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  center?: boolean;
}) => (
  <div className={`${center ? "text-center" : "text-left"} space-y-3 mb-10`}>
    {eyebrow && (
      <div className="inline-block rounded-full bg-[#FFF2EE] text-[13px] font-semibold px-3 py-1 tracking-wide text-[#FF5C35]">
        {eyebrow}
      </div>
    )}
    {title && (
      <h2 className="text-3xl md:text-4xl font-bold" style={{ color: hs.navy }}>
        {title}
      </h2>
    )}
    {subtitle && (
      <p className="text-base md:text-lg" style={{ color: hs.navy2 }}>
        {subtitle}
      </p>
    )}
  </div>
);

const PrimaryBtn = ({ children }: { children: React.ReactNode }) => (
  <button
    className="px-5 md:px-6 py-3 rounded-full bg-gradient-to-r from-[#FF7A59] to-[#FF5C35] text-white font-semibold shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7A59]"
    aria-label={typeof children === "string" ? children : "Primary button"}
  >
    {children}
  </button>
);

const GhostBtn = ({ children }: { children: React.ReactNode }) => (
  <button
    className="px-5 md:px-6 py-3 rounded-full border border-[#FF7A59] text-[#FF7A59] font-semibold bg-white hover:bg-[#FFF2EE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF7A59]"
    aria-label={typeof children === "string" ? children : "Secondary button"}
  >
    {children}
  </button>
);

const Tick = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    className="inline -mt-1 mr-2"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke={hs.mint}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUp = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    className="inline -mt-1 ml-1"
  >
    <path
      d="M7 17L17 7M17 7H9M17 7v8"
      stroke={hs.mint}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Metric = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="text-sm md:text-base" style={{ color: hs.navy2 }}>
    <span className="font-semibold" style={{ color: hs.navy }}>
      {label}:{" "}
    </span>
    <span className="font-semibold" style={{ color: hs.mint }}>
      {value}
    </span>
  </div>
);

const VisualCue = () => (
  <div className="grid md:grid-cols-2 gap-6 mt-12">
    {/* Left: HubSpot rule flow fade */}
    <motion.div
      className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-sm font-semibold mb-3" style={{ color: hs.navy2 }}>
        HubSpot Rule Flow
      </div>
      <div className="h-48 relative overflow-hidden">
        {[
          "Start",
          "Ask Email?",
          "If Yes → Create Lead",
          "If No → Ask Again",
        ].map((t, i) => (
          <motion.div
            key={i}
            className="absolute left-4 right-4 mx-auto bg-[#F5F8FA] border border-[#E0E6EB] rounded-xl px-4 py-3 mb-3"
            style={{ top: 8 + i * 56 }}
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.25 }}
          >
            <div className="text-sm" style={{ color: hs.navy }}>
              {t}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>

    {/* Right: Agentlytics proactive chat */}
    <motion.div
      className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="text-sm font-semibold mb-3" style={{ color: hs.navy2 }}>
        Agentlytics Proactive Chat
      </div>
      <div className="h-48 flex flex-col gap-3">
        <motion.div
          className="self-start max-w-[85%] rounded-2xl px-4 py-3 text-sm text-white"
          style={{
            background: `linear-gradient(90deg, ${hs.coral}, ${hs.coralDeep})`,
          }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Peak intent detected — need help choosing a plan?
        </motion.div>
        <motion.div
          className="self-end max-w-[85%] rounded-2xl px-4 py-3 text-sm"
          style={{ background: hs.bgAlt, color: hs.navy }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          I’m comparing Enterprise vs Pro.
        </motion.div>
        <motion.div
          className="self-start max-w-[85%] rounded-2xl px-4 py-3 text-sm text-white"
          style={{
            background: `linear-gradient(90deg, ${hs.coral}, ${hs.coralDeep})`,
          }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Here’s a quick ROI compare and a slot picker to book a demo.
        </motion.div>
      </div>
    </motion.div>
  </div>
);

const OverviewTable = () => (
  <div className="overflow-x-auto rounded-xl border border-[#E0E6EB] shadow-sm">
    <table className="min-w-full bg-white text-left">
      <thead className="bg-[#F5F8FA] sticky top-0 z-10">
        <tr className="text-[15px]" style={{ color: hs.navy }}>
          <th className="py-3 px-4">&nbsp;</th>
          <th className="py-3 px-4">Agentlytics</th>
          <th className="py-3 px-4">HubSpot Chatbot Builder</th>
        </tr>
      </thead>
      <tbody className="text-[15px]" style={{ color: hs.navy2 }}>
        {[
          [
            "Purpose",
            "Proactive AI engagement & lifecycle automation",
            "Rule-based chatbot for lead capture",
          ],
          [
            "Approach",
            "Behavior-first AI (intent, tone, triggers)",
            "Decision-tree logic (if/then rules)",
          ],
          [
            "Coverage",
            "Lead → Sales → Onboarding → Support",
            "Lead capture only",
          ],
          ["AI Level", "Generative & contextual", "Static & flow-based"],
          [
            "Setup Time",
            "<15 min — drop a snippet",
            "Manual setup via Chatflows",
          ],
          ["CRM Dependency", "Works with any CRM", "Requires HubSpot CRM"],
        ].map((row, i) => (
          <tr key={i} className="border-t border-[#E0E6EB]">
            <td className="py-3 px-4 font-medium" style={{ color: hs.navy }}>
              {row[0]}
            </td>
            <td className="py-3 px-4">{row[1]}</td>
            <td className="py-3 px-4">{row[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BulletTable = () => (
  <div className="overflow-x-auto rounded-xl border border-[#E0E6EB] shadow-sm">
    <table className="min-w-full bg-white text-left">
      <thead className="bg-[#F5F8FA]">
        <tr className="text-[15px]" style={{ color: hs.navy }}>
          <th className="py-3 px-4">Feature Area</th>
          <th className="py-3 px-4">Agentlytics</th>
          <th className="py-3 px-4">HubSpot Chatbot Builder</th>
        </tr>
      </thead>
      <tbody className="text-[15px]" style={{ color: hs.navy2 }}>
        {[
          [
            "Engagement",
            ["Proactive triggers", "Detects behavior", "Launches timely chats"],
            ["Waits for clicks", "Static chatflows"],
          ],
          [
            "Qualification",
            ["AI-driven BANT", "Auto-scores leads", "Routes to CRM/Slack"],
            ["Manual forms", "Rule-based Q&A"],
          ],
          [
            "Scheduling",
            ["Built-in slot picker", "No external links"],
            ["Redirects to Meetings link"],
          ],
          [
            "Lifecycle Coverage",
            ["Lead → Sales → Onboarding → Support"],
            ["Lead capture only"],
          ],
          [
            "Context & Memory",
            ["Retains full conversation context"],
            ["Restarts each flow"],
          ],
          [
            "Analytics",
            ["9-Metric QA + Ghost tracking", "Sentiment & closure scoring"],
            ["Basic chat logs"],
          ],
          [
            "Setup & Use",
            ["Drop snippet, live in minutes"],
            ["Manual flow builder"],
          ],
          [
            "CRM Integration",
            ["HubSpot, Salesforce, GA4, Slack, Intercom"],
            ["HubSpot only"],
          ],
        ].map(([feature, agen, hub], idx) => (
          <tr key={idx} className="border-t border-[#E0E6EB] align-top">
            <td className="py-4 px-4 font-medium" style={{ color: hs.navy }}>
              {feature}
            </td>
            <td className="py-4 px-4">
              <ul className="space-y-1 list-none">
                {Array.isArray(agen) &&
                  agen.map((x, i) => (
                    <li key={i}>
                      <Tick />
                      {x}
                    </li>
                  ))}
              </ul>
            </td>
            <td className="py-4 px-4">
              <ul className="space-y-1 list-none">
                {Array.isArray(hub) &&
                  hub.map((x, i) => (
                    <li key={i}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E0E6EB] mr-2" />
                      {x}
                    </li>
                  ))}
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TestimonialCarousel = () => (
  <div className="relative overflow-hidden">
    <div className="[--w:100%] flex gap-6 whitespace-nowrap animate-[marquee_22s_linear_infinite] hover:[animation-play-state:paused]">
      {[
        {
          quote:
            "Agentlytics replaced our HubSpot chatbot. Qualified leads up 40%, demos nearly doubled.",
          author: "Growth Lead, SaaSify",
        },
        {
          quote:
            "HubSpot chat was fine, but Agentlytics feels alive — it engages before visitors drop off.",
          author: "CX Director, FinServe",
        },
        {
          quote:
            "The built-in scheduler boosted completions 2.8× — we stopped losing leads to links.",
          author: "RevOps Manager, CloudScale",
        },
      ].map((t, i) => (
        <figure
          key={i}
          className="shrink-0 w-[85%] md:w-[46%] lg:w-[32%] rounded-2xl border border-[#E0E6EB] bg-white p-6 shadow-sm"
        >
          <blockquote
            className="text-[15px] md:text-base"
            style={{ color: hs.navy2 }}
          >
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-3 font-semibold" style={{ color: hs.navy }}>
            — {t.author}
          </figcaption>
        </figure>
      ))}
    </div>
    <style>{`
      @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-100%); } }
    `}</style>
  </div>
);

export default function AgentlyticsVsHubSpotPage() {
  return (
    <main className="font-sans bg-white text-[#33475B]">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#FFF7F5] to-[#F5F8FA] py-20 md:py-24">
        <Container className="text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            HubSpot Builds Flows. <br className="hidden md:block" />
            Agentlytics Builds Conversations.
          </motion.h1>
          <p
            className="mt-6 text-lg md:text-xl mx-auto max-w-3xl"
            style={{ color: hs.navy2 }}
          >
            HubSpot’s Chatbot Builder helps capture leads inside your CRM.{" "}
            <strong style={{ color: hs.navy }}>Agentlytics</strong> turns your
            website into a proactive, lifecycle-aware AI agent — detecting
            behavior, qualifying leads with BANT, booking calls{" "}
            <strong>inside chat</strong>, onboarding customers, and supporting
            them — all automatically.
          </p>
          <p className="mt-4 text-base" style={{ color: hs.navy2 }}>
            ⚡ Teams see{" "}
            <span className="font-semibold" style={{ color: hs.mint }}>
              42% more qualified demos
            </span>{" "}
            after switching from static chatflows.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryBtn>Start Free Trial</PrimaryBtn>
            <GhostBtn>Book a Comparison Demo</GhostBtn>
          </div>
          <p className="mt-4 text-sm" style={{ color: hs.navy2 }}>
            🔥 14-day free trial — no card needed (go live in minutes).
          </p>
          <VisualCue />
        </Container>
      </section>

      {/* Page Menu */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <Container className="flex gap-4 overflow-x-auto py-2 text-sm text-slate-700">
          <a href="#overview" className="px-2 py-1 hover:text-slate-900">Overview</a>
          <a href="#why" className="px-2 py-1 hover:text-slate-900">Why It Matters</a>
          <a href="#compare" className="px-2 py-1 hover:text-slate-900">Compare</a>
          <a href="#differentiators" className="px-2 py-1 hover:text-slate-900">Differentiators</a>
          <a href="#outcomes" className="px-2 py-1 hover:text-slate-900">Outcomes</a>
          <a href="#testimonials" className="px-2 py-1 hover:text-slate-900">Testimonials</a>
          <a href="#decision" className="px-2 py-1 hover:text-slate-900">Decision</a>
        </Container>
      </div>

      {/* Quick Overview */}
      <section id="overview" className="py-16 md:py-20" style={{ background: hs.bgAlt }}>
        <Container>
          <SectionTitle
            center
            eyebrow="Quick Overview"
            title="Proactive Conversations vs Reactive Chatflows"
          />
          <OverviewTable />
        </Container>
      </section>

      {/* Why It Matters */}
      <section id="why" className="py-16 md:py-20">
        <Container>
          <SectionTitle
            title="Why It Matters"
            subtitle="Most chatbots wait to be clicked. Agentlytics acts first. Every second of silence is a lost opportunity."
          />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: hs.navy }}
              >
                HubSpot Chatbot Builder
              </h3>
              <ul className="space-y-2 text-[15px]" style={{ color: hs.navy2 }}>
                <li>• Rule-based logic flows inside HubSpot CRM</li>
                <li>• Great for basic lead collection</li>
                <li>• Reactive: waits for clicks to trigger</li>
                <li>• Limited personalization or memory</li>
              </ul>
            </div>
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: hs.navy }}
              >
                Agentlytics
              </h3>
              <ul className="space-y-2 text-[15px]" style={{ color: hs.navy2 }}>
                <li>
                  <Tick />
                  Behaviorally triggered AI (dwell, scroll, exit)
                </li>
                <li>
                  <Tick />
                  Detects, engages, qualifies, and books calls instantly
                </li>
                <li>
                  <Tick />
                  Adaptive personas (Lead → Sales → Onboarding → Support)
                </li>
                <li>
                  <Tick />
                  Works across any CRM, not just HubSpot
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Deep Comparison Bullets */}
      <section id="compare" className="py-16 md:py-20" style={{ background: hs.bgAlt }}>
        <Container>
          <SectionTitle center title="Deep Comparison (Simplified)" />
          <BulletTable />
        </Container>
      </section>

      {/* Key Differentiators */}
      <section id="differentiators" className="py-16 md:py-20">
        <Container>
          <SectionTitle title="Key Differentiators" />
          <div className="grid md:grid-cols-2 gap-6">
            {/* 1 Proactive Engagement */}
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                1️⃣ Proactive Engagement
              </h4>
              <p className="text-[15px]" style={{ color: hs.navy2 }}>
                Detects scrolls, idle time, or exit intent → launches smart
                prompt:
              </p>
              <div
                className="mt-3 rounded-xl px-4 py-3 text-sm text-white inline-block"
                style={{
                  background: `linear-gradient(90deg, ${hs.coral}, ${hs.coralDeep})`,
                }}
              >
                “Looks like you’re comparing plans — want to see ROI in action?”
              </div>
              <p className="mt-3 text-[15px]" style={{ color: hs.navy2 }}>
                <span className="font-semibold">HubSpot:</span> waits for user
                click → pre-set questions → static answers.
              </p>
            </div>

            {/* 2 Multi-Persona AI */}
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                2️⃣ Multi-Persona AI
              </h4>
              <ul className="text-[15px] space-y-1" style={{ color: hs.navy2 }}>
                <li>
                  <Tick />
                  Lead: Curious, welcoming
                </li>
                <li>
                  <Tick />
                  Sales: ROI-focused
                </li>
                <li>
                  <Tick />
                  Onboarding: Explains steps
                </li>
                <li>
                  <Tick />
                  Support: Resolves with empathy
                </li>
              </ul>
              <p className="mt-3 text-[15px]" style={{ color: hs.navy2 }}>
                <span className="font-semibold">HubSpot:</span> Separate flows;
                no persona intelligence.
              </p>
            </div>

            {/* 3 Smart Qualification */}
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                3️⃣ Smart Qualification
              </h4>
              <p className="text-[15px]" style={{ color: hs.navy2 }}>
                <span className="font-semibold">Agentlytics:</span>{" "}
                Conversational BANT — Budget, Authority, Need, Timeline →
                instant scoring + routing.
              </p>
              <p className="text-[15px] mt-1" style={{ color: hs.navy2 }}>
                <span className="font-semibold">HubSpot:</span> Manual
                multi-choice questions logged to CRM.
              </p>
            </div>

            {/* 4 Built-in Scheduling */}
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                4️⃣ Built-in Scheduling
              </h4>
              <p className="text-[15px]" style={{ color: hs.navy2 }}>
                <span className="font-semibold">Agentlytics:</span> In-chat
                calendar → visitor picks slot → higher completions (2.8×).
              </p>
              <p className="text-[15px] mt-1" style={{ color: hs.navy2 }}>
                <span className="font-semibold">HubSpot:</span> Opens separate
                meetings link → higher drop-offs.
              </p>
            </div>

            {/* 5 Guided Onboarding */}
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                5️⃣ Guided Onboarding
              </h4>
              <p className="text-[15px]" style={{ color: hs.navy2 }}>
                <span className="font-semibold">Agentlytics:</span> Inline help,
                validation, adaptive paths, human handoff.
              </p>
              <p className="text-[15px] mt-1" style={{ color: hs.navy2 }}>
                <span className="font-semibold">HubSpot:</span> Redirects to KB
                articles.
              </p>
            </div>

            {/* 6 QA & Analytics */}
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                6️⃣ QA & Analytics
              </h4>
              <p className="text-[15px]" style={{ color: hs.navy2 }}>
                <span className="font-semibold">Agentlytics:</span> 9-metric
                message scoring, sentiment trends, ghost detection.
              </p>
              <p className="text-[15px] mt-1" style={{ color: hs.navy2 }}>
                <span className="font-semibold">HubSpot:</span> Basic
                conversation counts.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Proof & Outcomes */}
      <section id="outcomes" className="py-16 md:py-20" style={{ background: hs.bgAlt }}>
        <Container>
          <SectionTitle center title="Proof & Outcomes" />
          <div className="overflow-x-auto rounded-xl border border-[#E0E6EB] shadow-sm bg-white">
            <table className="min-w-full text-left">
              <thead className="bg-[#F5F8FA]">
                <tr className="text-[15px]" style={{ color: hs.navy }}>
                  <th className="py-3 px-4">Metric</th>
                  <th className="py-3 px-4">Agentlytics</th>
                  <th className="py-3 px-4">HubSpot Builder</th>
                </tr>
              </thead>
              <tbody className="text-[15px]" style={{ color: hs.navy2 }}>
                <tr className="border-t border-[#E0E6EB]">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: hs.navy }}
                  >
                    Qualified Leads
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold" style={{ color: hs.mint }}>
                      ↑ 42%
                    </span>
                    <ArrowUp />
                  </td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr className="border-t border-[#E0E6EB]">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: hs.navy }}
                  >
                    Demo Completions
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold" style={{ color: hs.mint }}>
                      ↑ 2.8×
                    </span>
                    <ArrowUp />
                  </td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr className="border-t border-[#E0E6EB]">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: hs.navy }}
                  >
                    Setup Time
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold" style={{ color: hs.mint }}>
                      ↓ 90%
                    </span>
                  </td>
                  <td className="py-3 px-4">Longer</td>
                </tr>
                <tr className="border-t border-[#E0E6EB]">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: hs.navy }}
                  >
                    Drop-offs
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold" style={{ color: hs.mint }}>
                      ↓ 31%
                    </span>
                  </td>
                  <td className="py-3 px-4">Higher</td>
                </tr>
                <tr className="border-t border-[#E0E6EB]">
                  <td
                    className="py-3 px-4 font-medium"
                    style={{ color: hs.navy }}
                  >
                    Support Tickets
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold" style={{ color: hs.mint }}>
                      ↓ 18%
                    </span>
                  </td>
                  <td className="py-3 px-4">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-20">
        <Container>
          <SectionTitle
            center
            title="Trusted by teams at CloudScale · FinServe · TechFlow"
            subtitle="What customers are saying"
          />
          <TestimonialCarousel />
        </Container>
      </section>

      {/* When to choose which */}
      <section id="decision" className="py-16 md:py-20" style={{ background: hs.bgAlt }}>
        <Container>
          <SectionTitle title="When to Choose Which" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                ✅ Use Agentlytics if you want to:
              </h4>
              <ul className="space-y-2 text-[15px]" style={{ color: hs.navy2 }}>
                <li>
                  <Tick />
                  Engage high-intent visitors automatically
                </li>
                <li>
                  <Tick />
                  Qualify with AI & BANT logic
                </li>
                <li>
                  <Tick />
                  Book meetings directly in chat
                </li>
                <li>
                  <Tick />
                  Guide onboarding & support with context
                </li>
              </ul>
            </div>
            <div className="rounded-2xl p-6 bg-white border border-[#E0E6EB] shadow-sm">
              <h4
                className="text-lg font-semibold mb-2"
                style={{ color: hs.navy }}
              >
                🟠 Use HubSpot Chat Builder if you want to:
              </h4>
              <ul className="space-y-2 text-[15px]" style={{ color: hs.navy2 }}>
                <li>• Stay inside HubSpot CRM ecosystem</li>
                <li>• Build simple rule-based lead collection</li>
                <li>• Run basic chatflows for small teams</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-16 md:py-20 text-center text-white bg-gradient-to-r from-[#FF7A59] to-[#FF5C35]">
        <Container>
          <h2 className="text-3xl md:text-4xl font-bold">
            HubSpot Collects Leads. Agentlytics Converts Them.
          </h2>
          <p className="mt-4 text-lg opacity-90">
            Upgrade from static chatflows to proactive, intelligent
            conversations that detect, qualify, and convert automatically.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button className="px-6 py-3 rounded-full bg-white text-[#FF5C35] font-semibold hover:bg-[#FFF2EE]">
              Start Free Trial — No Credit Card
            </button>
            <button className="px-6 py-3 rounded-full border border-white hover:bg-white/10">
              Book Comparison Demo
            </button>
          </div>
          <p className="mt-4 text-sm opacity-90">
            Go live in minutes. Works with or without HubSpot CRM.
          </p>
        </Container>
      </section>

      {/* Footer mini */}
      <footer className="py-8" style={{ background: "#ffffff" }}>
        <Container className="text-center text-sm text-[#425B76]">
          © {new Date().getFullYear()} Agentlytics. Comparison for educational
          purposes.
        </Container>
      </footer>
    </main>
  );
}
