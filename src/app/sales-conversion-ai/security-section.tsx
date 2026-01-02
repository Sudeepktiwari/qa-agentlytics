"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function SecurityTrustCard() {
  const prefersReducedMotion = useReducedMotion();

  // brand var (change here to swap the site brand)
  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-100" as any]: "rgba(0,107,255,0.08)",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
  };

  const badges = ["GDPR-ready", "SOC 2 (Type II)", "ISO 27001", "SSO/SAML"];

  return (
    <section
      className="mx-auto max-w-7xl px-4 pb-10 sm:px-6"
      style={brandVars}
      aria-label="Security and compliance"
    >
      <motion.div
        className="rounded-3xl border bg-white p-4 sm:p-8"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--surface)",
          boxShadow: "0 6px 24px rgba(2,6,23,0.04)",
        }}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        role="region"
        aria-labelledby="security-heading"
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="grid h-10 w-10 place-items-center rounded-xl"
            aria-hidden
            style={{
              backgroundColor: "var(--brand-100)",
              border: "1px solid rgba(0,107,255,0.08)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-[--brand]"
              role="img"
              aria-label="Lock icon"
            >
              <path
                fill="currentColor"
                d="M12 1a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V6a5 5 0 00-5-5zm-3 8V6a3 3 0 016 0v3H9z"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="min-w-0">
            <h3
              id="security-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Built for B2B trust — security by design
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Data encrypted in transit and at rest. Fine-grained access
              controls, audit trails, and regional data residency (EU / US)
              options for enterprise compliance.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {badges.map((b, i) => (
                <motion.span
                  key={b}
                  className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
                  initial={
                    prefersReducedMotion ? undefined : { opacity: 0, y: 6 }
                  }
                  animate={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: 0.08 * i, duration: 0.36 }}
                  style={{
                    border: "1px solid rgba(16,185,129,0.18)",
                    background: "rgba(16,185,129,0.06)",
                    color: "rgb(4 120 87)", // emerald-700
                  }}
                  aria-label={`${b} badge`}
                >
                  {/* optional tiny check icon */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    className="inline-block"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{b}</span>
                </motion.span>
              ))}
            </div>

            {/* CTA / Meta row */}
            <div className="mt-5 md:flex items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Enterprise-grade controls & flexible residency
              </div>

              <div className="flex items-center gap-3 mt-4 md:mt-0">
                <span className="text-xs font-medium text-slate-700">
                  Request SOC 2 report
                </span>
                <button
                  type="button"
                  className="rounded-md px-3 py-1 text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(180deg, var(--brand), var(--brand))",
                    color: "white",
                    boxShadow: "0 8px 20px rgba(0,107,255,0.12)",
                  }}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
