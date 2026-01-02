import React from "react";

// TestimonialsSectionPolished.tsx
// - Consistent blue theme, lighter glow, subtle animation
// - Highlights numeric change in color (+ green, − red)

const TESTIMONIALS = [
  {
    name: "Priya Shah",
    role: "CX Director, CloudOps",
    inc: "+31% CSAT",
    quote:
      "Our dashboards finally connect empathy and efficiency. We found patterns no spreadsheet ever showed.",
  },
  {
    name: "Marco Silva",
    role: "Head of Support, RetailTech",
    inc: "−44% coaching time",
    quote: "We coach with data now — not guesswork.",
  },
  {
    name: "Jade Nguyen",
    role: "Product Lead, FinServe",
    inc: "+18% deflection",
    quote: "Intent trends directly informed our roadmap and macros.",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-b from-white to-blue-50 px-4 py-16 sm:px-6"
    >
      <h2 className="text-3xl font-bold tracking-tight text-center text-slate-900">
        What Teams Are Saying
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-slate-600">
        Coach with data, not guesswork.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((t, i) => {
          const isNegative = t.inc.includes("−") || t.inc.includes("-");
          return (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-white p-4 md:p-6 shadow-sm ring-1 ring-blue-50 transition hover:shadow-md"
            >
              <div
                className="pointer-events-none absolute inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(260px 140px at 20% 0%, rgba(59,130,246,0.15) 0%, transparent 70%)",
                }}
              />

              <blockquote className="relative z-10 text-slate-800">
                <div
                  className="flex items-center gap-1 text-amber-500"
                  aria-label="rating"
                >
                  {"★★★★★"}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {t.quote}
                </p>
              </blockquote>

              <figcaption className="relative z-10 mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                    {t.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    isNegative
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {t.inc}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Trusted by marquee */}
      <div className="mt-12">
        <div className="text-center text-sm font-medium text-slate-600">Trusted by teams at</div>
        <div
          className="relative mx-auto mt-4 max-w-6xl overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="marquee flex animate-[marquee_16s_linear_infinite] gap-6 sm:gap-8 opacity-90">
            {["CloudOps", "FinServe", "RetailTech", "DevSuite", "HealthScale", "PayFlow"].map(
              (logo, i) => (
                <div
                  key={`logo-${i}`}
                  className="flex h-10 w-28 sm:h-12 sm:w-36 items-center justify-center rounded-xl bg-white px-3 ring-1 ring-blue-50"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">{logo}</span>
                </div>
              )
            )}
            {["CloudOps", "FinServe", "RetailTech", "DevSuite", "HealthScale", "PayFlow"].map(
              (logo, i) => (
                <div
                  key={`dup-${i}`}
                  className="flex h-10 w-28 sm:h-12 sm:w-36 items-center justify-center rounded-xl bg-white px-3 ring-1 ring-blue-50"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">{logo}</span>
                </div>
              )
            )}
          </div>
        </div>
        <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee { animation: none !important; } }`}</style>
      </div>
    </section>
  );
}
