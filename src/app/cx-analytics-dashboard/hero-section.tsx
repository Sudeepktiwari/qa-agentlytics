import React, { JSX, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import DemoVideoModal from "../components/DemoVideoModal";

// DashboardHeroSection.tsx — Fix semicircle clipping and reposition label
// - Renders semicircle SVG without clipping (overflow-visible)
// - Places "Positive" and "Last 7 days" below the arc (outside the semicircle)
// - Keeps animations and reduced-motion behavior

type ShimmerProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  ariaLabel?: string;
  onClick?: () => void;
};

function ShimmerButton({
  href = "#",
  children,
  variant = "solid",
  ariaLabel,
  onClick,
}: ShimmerProps) {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const solid =
    "bg-blue-600 text-white shadow-md hover:bg-blue-700 focus-visible:ring-blue-500";
  const outline = "bg-white text-blue-700 ring-1 ring-blue-50 hover:bg-blue-50";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`${base} ${variant === "solid" ? solid : outline}`}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${variant === "solid" ? solid : outline}`}
    >
      {children}
    </a>
  );
}

const brand = { primary: "#1E40AF", accent: "#60A5FA" };
const heroStats = [
  { k: "Find rate", v: "+72%" },
  { k: "Deflection", v: "+25%" },
  { k: "Avg handle", v: "−12%" },
];

export default function DashboardHeroSection(): React.ReactElement {
  const prefersReducedMotion = useReducedMotion();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <section className="rounded-b-[2rem] bg-gradient-to-b from-white to-blue-50 px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:mx-0 text-slate-900">
            Turn Every Conversation into Actionable Insight
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 lg:mx-0">
            Advancelytics transforms your chat, email, and support data into a
            unified view of sentiment, resolution quality, and intent trends —
            so you can coach smarter, prioritize better, and grow faster.
          </p>
          <div className="mt-8 flex justify-center gap-3 lg:justify-start">
            <ShimmerButton href="#live" ariaLabel="See Live Dashboard">
              See Live Dashboard
            </ShimmerButton>
            <ShimmerButton
              onClick={() => setIsDemoModalOpen(true)}
              variant="outline"
              ariaLabel="Request a demo"
            >
              Watch a Demo
            </ShimmerButton>
          </div>
        </div>

        {/* Right: Dashboard Illustration */}
        <div className="relative mx-auto w-full max-w-[560px] lg:h-[420px]">
          <div
            className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-50/60 to-blue-100/25 blur-3xl opacity-80"
            aria-hidden
          />

          <div className="relative w-full rounded-[28px] bg-white p-5 shadow-[0_14px_40px_rgba(14,30,60,0.06)] ring-1 ring-blue-50">
            {/* Stat chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              {heroStats.map((s, i) => (
                <motion.span
                  key={s.k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    s.v.includes("−") || s.v.includes("-")
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {s.k}: <span className="font-semibold">{s.v}</span>
                </motion.span>
              ))}
            </div>

            {/* Stat cards grid: Sentiment + Chat Ratings side-by-side */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Sentiment gauge card */}
              <motion.div
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-50 flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <div className="w-full text-[11px] font-semibold text-slate-500">
                  Sentiment
                </div>

                {/* SVG semicircle: use a slightly larger viewBox and allow overflow so the arc isn't clipped */}
                <div className="mt-3 flex justify-center w-full">
                  <svg
                    viewBox="0 0 36 20"
                    className="h-16 w-32 overflow-visible"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </linearGradient>
                    </defs>
                    {/* background arc */}
                    <path
                      d="M2,18 A16,16 0 0 1 34,18"
                      fill="none"
                      stroke="#E9F4FF"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* animated colored arc */}
                    <motion.path
                      d="M2,18 A16,16 0 0 1 34,18"
                      fill="none"
                      stroke="url(#gauge)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="50"
                      strokeDashoffset="50"
                      animate={{
                        strokeDashoffset: prefersReducedMotion
                          ? 8
                          : [50, 8, 14, 8],
                      }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 2.2,
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </svg>
                </div>

                {/* Label placed below the semicircle (outside) */}
                <div className="mt-3 text-center">
                  <div className="text-sm font-semibold text-slate-800">
                    Positive
                  </div>
                  <div className="text-[11px] text-slate-500">Last 7 days</div>
                </div>
              </motion.div>

              {/* Chat Ratings card */}
              <motion.div
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="text-[11px] font-semibold text-slate-500">
                  Chat Ratings
                </div>
                {[
                  { k: "Response", v: 82 },
                  { k: "Empathy", v: 76 },
                  { k: "Clarity", v: 88 },
                ].map((r, i) => (
                  <div key={r.k} className="mt-2">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{r.k}</span>
                      <span>{r.v}%</span>
                    </div>
                    <div className="h-2 w-full rounded bg-slate-100">
                      <motion.div
                        className="h-2 rounded bg-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${r.v}%` }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{
                          duration: 0.6 + i * 0.1,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Resolution trend + sparkline */}
            <motion.div
              className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-50"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-500">
                  Resolution Trend
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  +12% this week
                </span>
              </div>

              <svg
                viewBox="0 0 100 28"
                className="mt-2 h-14 w-full"
                aria-hidden
              >
                <polyline
                  points="0,20 10,22 20,18 30,17 40,15 50,16 60,14 70,12 80,13 90,11 100,10"
                  fill="none"
                  stroke="#E9F4FF"
                  strokeWidth="2"
                />
                <motion.polyline
                  points="0,20 10,22 20,18 30,17 40,15 50,16 60,14 70,12 80,13 90,11 100,10"
                  fill="none"
                  stroke={brand.primary}
                  strokeWidth="2"
                  strokeDasharray="140"
                  strokeDashoffset="140"
                  animate={{
                    strokeDashoffset: prefersReducedMotion ? 0 : [140, 0],
                  }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 1.8,
                    ease: "easeOut",
                  }}
                />
              </svg>

              <div className="mt-1 text-[11px] text-slate-500">
                Automatic scoring across chats, emails, and tickets.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
