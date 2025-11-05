"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Tier = {
  id: string;
  title: string;
  blurb: string;
  badge?: string;
  monthly: number | null; // null => custom / contact sales
  yearly: number | null;
  cta?: { label: string; href?: string };
};

const TIERS: Tier[] = [
  {
    id: "starter",
    title: "Starter",
    blurb: "Everything to capture and qualify",
    badge: "Best for MVPs",
    monthly: 49,
    yearly: 490,
    cta: { label: "Get started", href: "#signup" },
  },
  {
    id: "pro",
    title: "Pro",
    blurb: "Deeper CRM sync & analytics",
    badge: "Most popular",
    monthly: 199,
    yearly: 1990,
    cta: { label: "Start free trial", href: "#signup" },
  },
  {
    id: "enterprise",
    title: "Enterprise",
    blurb: "SSO, audit logs, advanced controls",
    badge: "For scale",
    monthly: null,
    yearly: null,
    cta: { label: "Contact sales", href: "#contact" },
  },
];

function CTAPulse({
  href = "#",
  label = "See plans",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      className="relative inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: "linear-gradient(180deg, var(--brand), var(--brand-dark))",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(0,107,255,0.14)",
      }}
      aria-label={label}
    >
      <span>{label}</span>
      {/* subtle pulse */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: "-6px",
          borderRadius: "999px",
          boxShadow: "0 20px 40px rgba(0,107,255,0.08)",
          pointerEvents: "none",
        }}
      />
    </a>
  );
}

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const brandVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-dark" as any]: "#0050d6",
    ["--border-subtle" as any]: "rgba(2,6,23,0.06)",
    ["--surface" as any]: "#ffffff",
  };

  const priceVariant = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
      style={brandVars}
      data-testid="pricing"
      aria-label="Pricing"
    >
      <div
        className="rounded-3xl border p-6 sm:p-10"
        style={{
          borderColor: "var(--border-subtle)",
          background: "white",
          boxShadow: "0 8px 30px rgba(2,6,23,0.03)",
        }}
      >
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">
              See Plans — built for teams at every stage
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Starter for early traction, Pro for accelerating pipeline,
              Enterprise for scale and control.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Billing toggle */}
            <div className="flex items-center gap-3 rounded-full bg-slate-100 p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  !isYearly ? "bg-white shadow-sm" : "text-slate-600"
                }`}
                aria-pressed={!isYearly}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  isYearly ? "bg-white shadow-sm" : "text-slate-600"
                }`}
                aria-pressed={isYearly}
              >
                Yearly (save 2 months)
              </button>
            </div>

            <CTAPulse href="#cta" label="See plans" />
          </div>
        </div>

        {/* Tiers */}
        <div
          className="mt-6 grid gap-4 sm:grid-cols-3"
          role="list"
          aria-label="Pricing tiers preview"
        >
          {TIERS.map((tier) => {
            const isPro = tier.id === "pro";
            const price = isYearly ? tier.yearly : tier.monthly;
            const priceLabel =
              price === null
                ? "Contact sales"
                : `$${price}${isYearly ? "/yr" : "/mo"}`;

            return (
              <motion.article
                key={tier.id}
                role="listitem"
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, y: 8 }
                }
                whileInView={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`relative overflow-hidden rounded-2xl border bg-[--surface] p-6 focus-within:ring-2`}
                style={{
                  borderColor: isPro
                    ? "rgba(0,107,255,0.14)"
                    : "var(--border-subtle)",
                  transform: isPro ? "translateY(-6px) scale(1.02)" : undefined,
                  boxShadow: isPro
                    ? "0 24px 40px rgba(0,107,255,0.08)"
                    : "0 6px 18px rgba(2,6,23,0.04)",
                }}
                aria-label={`${tier.title} tier`}
              >
                {/* ribbon / recommended */}
                {isPro && (
                  <div
                    style={{ position: "absolute", right: 12, top: 12 }}
                    aria-hidden
                  >
                    <div className="rounded-full bg-[--brand] px-3 py-1 text-xs font-semibold text-white shadow">
                      Recommended
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {tier.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {tier.blurb}
                      </div>
                    </div>

                    <div className="text-right">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={String(isYearly) + tier.id}
                          variants={priceVariant}
                          initial="hidden"
                          animate="show"
                          exit="hidden"
                          transition={{ duration: 0.28 }}
                        >
                          <div
                            className="text-lg font-extrabold"
                            style={{
                              color: isPro ? "var(--brand)" : "#0f172a",
                            }}
                          >
                            {price === null ? (
                              <span className="text-sm font-semibold text-slate-700">
                                Contact sales
                              </span>
                            ) : (
                              <span aria-hidden>{priceLabel}</span>
                            )}
                          </div>
                          {price !== null && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {isYearly ? "billed yearly" : "billed monthly"}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        borderColor: "rgba(0,107,255,0.12)",
                        background: "rgba(0,107,255,0.04)",
                        color: "var(--brand)",
                      }}
                    >
                      {tier.badge}
                    </span>
                    <div className="text-xs text-slate-600">Up to 5 seats</div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <a
                      href={tier.cta?.href ?? "#"}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2"
                      style={{
                        background: isPro
                          ? "linear-gradient(180deg,var(--brand),var(--brand-dark))"
                          : "white",
                        color: isPro ? "white" : "var(--brand)",
                        border: isPro
                          ? "none"
                          : "1px solid rgba(0,107,255,0.12)",
                        boxShadow: isPro
                          ? "0 10px 30px rgba(0,107,255,0.12)"
                          : undefined,
                      }}
                      aria-label={tier.cta?.label ?? `${tier.title} action`}
                    >
                      {tier.cta?.label}
                    </a>

                    <a
                      href="#learn"
                      className="text-xs text-slate-500 underline"
                    >
                      Learn more
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
