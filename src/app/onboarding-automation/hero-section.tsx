"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const brand = "#006BFF";
const brandLight = "rgba(0,107,255,0.08)";
const brandLighter = "rgba(0,107,255,0.05)";
const brandBorder = "rgba(0,107,255,0.15)";

const heroChips = ["Invite teammates", "Auto-assign", "Workflow templates"];

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative isolate rounded-b-[2rem] bg-[--surface] px-4 py-20 sm:px-6"
      style={{
        ["--surface" as any]: "#F8FAFF",
        ["--brand" as any]: brand,
      }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        {/* LEFT: Copy */}
        <div className="text-center lg:text-left">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:mx-0">
            From Static Checklists to Conversational Onboarding
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700 lg:mx-0">
            Turn setup into success —{" "}
            <span className="font-semibold text-[--brand]">
              65% faster activation
            </span>
            ,{" "}
            <span className="font-semibold text-[--brand]">
              40% fewer tickets
            </span>
            .
          </p>

          <div className="mt-8 flex justify-center gap-3 lg:justify-start">
            <motion.a
              href="#cta"
              className="relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: "linear-gradient(180deg, var(--brand), #0047D3)",
                boxShadow: "0 10px 25px rgba(0,107,255,0.2)",
              }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            >
              {/* shimmer */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, transparent 0%, rgba(255,255,255,.25) 30%, transparent 60%)",
                  backgroundSize: "200% 100%",
                }}
                animate={
                  prefersReducedMotion
                    ? {}
                    : {
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                        transition: {
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "linear",
                        },
                      }
                }
              />
              <span className="relative z-10">
                Start Free Trial — guide users faster
              </span>
            </motion.a>

            <a
              href="#demo"
              className="rounded-2xl border px-6 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                borderColor: brandBorder,
                background: brandLighter,
                color: brand,
              }}
            >
              See It in Action
            </a>
          </div>
        </div>

        {/* RIGHT: Animated Chat Illustration */}
        <div className="relative mx-auto w-full max-w-[540px]">
          {/* glow background */}
          <div
            className="absolute inset-0 rounded-[32px] blur-2xl"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${brandLight}, transparent 70%)`,
            }}
            aria-hidden
          />

          <div
            className="relative rounded-[32px] border bg-white p-5 shadow-xl"
            style={{
              borderColor: brandBorder,
              minHeight: 380,
            }}
          >
            <div className="flex flex-col gap-4 h-full">
              {/* USER message */}
              <motion.div
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: brandLight }}
                  aria-hidden
                />
                <div
                  className="max-w-[75%] rounded-2xl border p-3 text-sm font-medium text-slate-900"
                  style={{
                    borderColor: brandBorder,
                    background: "rgba(0,107,255,0.07)",
                    color: "#003B9E",
                  }}
                >
                  Why do I need to invite my team before setting up workflows?
                </div>
              </motion.div>

              {/* AI message */}
              <motion.div
                className="ml-11 max-w-[78%] rounded-2xl border bg-white p-3 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                style={{ borderColor: brandBorder }}
              >
                <div
                  className="text-[11px] font-semibold"
                  style={{ color: brand }}
                >
                  Advancelytics
                </div>
                <div className="mt-1 text-sm text-slate-800">
                  Inviting teammates first gives them roles so workflow
                  assignments sync correctly. Want help sending invites?
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {heroChips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border px-2.5 py-1 font-medium"
                      style={{
                        borderColor: brandBorder,
                        background: brandLighter,
                        color: brand,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>

              <div className="flex-1" />

              {/* typing indicator */}
              <motion.div
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <div
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: brandLight }}
                  aria-hidden
                />
                <div
                  className="max-w-[70%] rounded-2xl border p-3"
                  style={{ borderColor: brandBorder, background: brandLighter }}
                >
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((d) => (
                      <motion.span
                        key={d}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: brand }}
                        animate={
                          prefersReducedMotion ? undefined : { y: [0, -4, 0] }
                        }
                        transition={{
                          repeat: prefersReducedMotion ? 0 : Infinity,
                          duration: 0.9,
                          delay: d * 0.12,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* bottom CTA bar */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.55 }}
              >
                <div
                  className="flex items-center justify-between rounded-2xl border bg-white p-3 shadow-sm"
                  style={{ borderColor: brandBorder }}
                >
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                    <span
                      className="inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: brand }}
                    />
                    Step 1 of 4 • Verified
                  </div>
                  <button
                    className="rounded-2xl px-3 py-2 text-xs font-semibold text-white transition"
                    style={{
                      background: `linear-gradient(180deg, ${brand}, #0047D3)`,
                      boxShadow: `0 8px 20px rgba(0,107,255,0.2)`,
                    }}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
