"use client";

import React, { useMemo } from "react";

type Testimonial = {
  name: string;
  role: string;
  inc: string;
  quote: string;
};

export default function TestimonialsSectionStatic() {
  const testimonials: Testimonial[] = useMemo(
    () => [
      {
        name: "Alicia Gomez",
        role: "Product Manager, CloudScale",
        inc: "14→5 days",
        quote:
          "Our onboarding time dropped from 14 days to 5 — users finish in one sitting.",
      },
      {
        name: "Rahul Mehta",
        role: "CX Lead, FinServe",
        inc: "+29% completion",
        quote:
          "Explaining the ‘why’ at each step removed confusion and increased completion.",
      },
      {
        name: "Erin Park",
        role: "Head of CS, DevSuite",
        inc: "−38% tickets",
        quote:
          "In-flow Q&A killed repetitive ‘how do I…’ tickets. CS focuses on value now.",
      },
    ],
    []
  );

  const logos = useMemo(
    () => [
      { id: "cloudscale", label: "CloudScale" },
      { id: "finserve", label: "FinServe" },
      { id: "devsuite", label: "DevSuite" },
    ],
    []
  );

  // brand shades derived from #006BFF
  const cssVars: React.CSSProperties = {
    ["--brand" as any]: "#006BFF",
    ["--brand-10" as any]: "rgba(0,107,255,0.06)",
    ["--brand-20" as any]: "rgba(0,107,255,0.12)",
    ["--brand-30" as any]: "rgba(0,107,255,0.18)",
    ["--border-subtle" as any]: "rgba(0,107,255,0.08)",
    ["--surface" as any]: "#ffffff",
  };

  return (
    <section
      id="testimonials"
      className="mx-auto max-w-7xl rounded-3xl px-4 py-16 sm:px-6 scroll-mt-24 bg-[--surface]"
      style={cssVars}
      aria-label="Customer testimonials"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          What Teams Are Saying
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
          CS and Product teams accelerate activation and reduce tickets.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={t.name}
            className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm"
            style={{ borderColor: "var(--border-subtle)" }}
            aria-labelledby={`tm-${i}-name`}
            role="article"
          >
            <blockquote className="text-slate-800">
              <div className="flex items-center gap-2" aria-hidden>
                <span className="sr-only">5 out of 5 stars</span>
                <span style={{ color: "var(--brand)" }}>★★★★★</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{t.quote}</p>
            </blockquote>

            <figcaption className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: "var(--brand-10)",
                    color: "var(--brand)",
                    border: "1px solid var(--brand-20)",
                  }}
                  aria-hidden
                >
                  {t.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="min-w-0">
                  <div
                    id={`tm-${i}-name`}
                    className="text-sm font-semibold text-slate-900"
                  >
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>

              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{
                  border: "1px solid var(--brand-20)",
                  background: "var(--brand-10)",
                  color: "var(--brand)",
                }}
              >
                {t.inc}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Trusted by — centered, static, brand-only shades */}
      <div className="mt-10 border-t border-[--border-subtle] pt-8">
        <p className="text-center text-xs font-semibold tracking-wide text-slate-500">
          TRUSTED BY GTM TEAMS AT
        </p>

        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 items-center justify-items-center">
            {logos.map((l) => (
              <div
                key={l.id}
                className="flex h-12 w-36 items-center justify-center rounded-lg border bg-[--brand-10]"
                style={{
                  borderColor: "var(--brand-20)",
                  color: "var(--brand)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
                role="img"
                aria-label={l.label}
                tabIndex={0}
              >
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Want your logo here?{" "}
          <strong className="text-slate-700">Contact sales</strong> to join
          other teams accelerating activation.
        </p>
      </div>
    </section>
  );
}
