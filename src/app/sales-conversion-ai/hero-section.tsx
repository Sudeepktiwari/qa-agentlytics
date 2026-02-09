import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DemoVideoModal from "../components/DemoVideoModal";

type CTAPulseProps = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
};

function CTAPulse({
  href,
  onClick,
  variant = "primary",
  children,
}: CTAPulseProps) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer";
  const primary =
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500";
  const secondary =
    "bg-white border border-blue-100 text-blue-700 hover:bg-blue-50";
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${base} ${variant === "primary" ? primary : secondary}`}
      >
        {children}
      </button>
    );
  }
  
  return (
    <a
      href={href || "#"}
      className={`${base} ${variant === "primary" ? primary : secondary}`}
    >
      {children}
    </a>
  );
}

export default function HeroSection() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const reduce = useReducedMotion();

  const bubble = {
    hidden: { opacity: 0, y: 8 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" },
    }),
  };

  return (
    <section
      className="relative isolate rounded-b-[2rem] bg-gradient-to-b from-white to-blue-50 px-4 py-20 sm:px-6 overflow-hidden"
      data-testid="hero"
    >
      <DemoVideoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        {/* Left: Copy */}
        <div className="text-center md:text-left">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:mx-0">
            Convert more visitors with AI that knows when to engage
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
            Automate your SDR’s first 3 steps — identify, engage, and qualify —
            while routing only high-intent prospects to your team.
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-rose-600 lg:mx-0">
            Every minute delay costs a demo — don’t let interest slip away.
          </p>

          <div className="mt-8 flex justify-center gap-3 lg:justify-start">
            <CTAPulse onClick={() => setIsDemoModalOpen(true)} variant="primary">
              Watch demo
            </CTAPulse>
            <CTAPulse href="#cta" variant="secondary">
              Start free trial
            </CTAPulse>
          </div>

          {/* trust row */}
          <div className="mt-6 flex items-center gap-4 justify-center md:justify-start text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Trusted by sales teams</span>
            </div>
            <span className="text-slate-300">•</span>
            <div>Free 14-day trial</div>
          </div>
        </div>

        {/* Right: Conversation mockup */}
        <div className="relative mx-auto h-[380px] w-full max-w-[560px]">
          {/* layered glow */}
          <div
            className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-100/20 blur-3xl opacity-70"
            aria-hidden
          />

          {/* device card */}
          <div className="relative h-full w-full rounded-3xl bg-white p-4 md:p-6 shadow-[0_10px_30px_rgba(14,30,60,0.08)]">
            {/* top header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 grid place-items-center text-blue-700 font-bold">
                  AI
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Advancelytics
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    Proactive chat
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                Live demo
              </div>
            </div>

            {/* mock messages */}
            <div className="mt-6 flex flex-col gap-4">
              <motion.div
                initial="hidden"
                animate="show"
                variants={bubble as any}
                custom={0}
                className="flex items-start gap-3"
              >
                <div className="h-9 w-9 rounded-full bg-blue-50 grid place-items-center text-blue-700 font-semibold">
                  U
                </div>
                <div className="rounded-2xl bg-blue-50/60 p-3 text-sm text-slate-800 max-w-[72%]">
                  I'm comparing plans — which fits our usage?
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={bubble as any}
                custom={1}
                className="flex items-start gap-3 ml-10"
              >
                <div className="h-9 w-9 rounded-full bg-white border border-blue-50 grid place-items-center text-blue-700 font-semibold">
                  A
                </div>
                <div className="rounded-2xl bg-white p-3 text-sm text-slate-800 shadow-sm max-w-[72%]">
                  I can help — quick compare or schedule a demo?{" "}
                  <span className="inline-block ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    Compare plans
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={bubble as any}
                custom={2}
                className="flex items-start gap-3"
              >
                <div className="h-9 w-9 rounded-full bg-blue-50 grid place-items-center text-blue-700 font-semibold">
                  U
                </div>
                <div
                  className="rounded-2xl bg-blue-50/60 p-3 text-sm text-slate-800 max-w-[72%]"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <span className="sr-only">Agent is typing</span>
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="inline-block h-2 w-2 rounded-full bg-blue-400"
                        animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.9,
                          delay: d * 0.12,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CTA bar */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 grid place-items-center text-blue-700">
                    🤖
                  </div>
                  <div className="text-sm text-slate-800">
                    Peak intent detected
                  </div>
                </div>
                <CTAPulse href="#cta" variant="primary">
                  Book demo
                </CTAPulse>
              </div>
            </div>

            {/* decorative device SVG bottom-right */}
            <svg
              className="absolute -right-8 -bottom-10 opacity-30"
              width="220"
              height="120"
              viewBox="0 0 220 120"
              fill="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="d1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#BFDBFE" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
              </defs>
              <circle cx="30" cy="40" r="8" fill="#fff" />
              <circle cx="70" cy="50" r="8" fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
