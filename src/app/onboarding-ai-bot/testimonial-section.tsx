// components/TestimonialsSection.jsx
import React from "react";

/**
 * TestimonialsSection
 * - Tailwind-only, mobile-first, SSR-safe mount reveal
 * - Props: brand = { primary: 'var(--brand-primary)' }
 */
export default function TestimonialsSection({
  brand = { primary: "var(--brand-primary)" },
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const companies = ["CloudScale", "FinServe", "TechFlow"];
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Product, CloudScale",
      inc: "+27% activation",
      quote:
        "Explaining the why behind fields cut our drop-offs dramatically. Users finish setup without Slack pings.",
    },
    {
      name: "Diego Morales",
      role: "CX Lead, FinServe",
      inc: "−31% setup tickets",
      quote:
        "Inline Q&A and validation removed most ‘what does this mean?’ questions. Our team can focus on complex cases.",
    },
    {
      name: "Priya Nair",
      role: "Growth PM, TechFlow",
      inc: "TTFV −29%",
      quote:
        "Adaptive paths skip irrelevant steps. Time-to-first-value is down and expansion trials go smoother.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      aria-labelledby="testimonials-heading"
    >
      <div className="flex flex-col-reverse gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2
            id="testimonials-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Loved by product and success teams
          </h2>
          <p className="mt-2 text-slate-600">
            Real companies accelerating activation and reducing setup tickets
            with Agentlytics Onboarding AI.
          </p>
        </div>

        <div className="hidden text-sm text-slate-500 md:flex md:items-center md:gap-2">
          CSAT ↑ — time-to-value ↓
        </div>
      </div>

      {/* Logos */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {companies.map((c) => (
          <span
            key={c}
            className="inline-flex items-center justify-center rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
            aria-hidden
          >
            {c}
          </span>
        ))}
      </div>

      {/* Testimonial cards */}
      <div className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
        {testimonials.map((t, i) => (
          <figure
            key={t.name}
            className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-transform duration-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            } hover:-translate-y-1 hover:shadow-lg`}
            style={{ transitionDelay: `${i * 80}ms` }}
            aria-labelledby={`quote-${i}`}
          >
            {/* Soft hover glow (brand) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-60"
              style={{
                background: `radial-gradient(260px 140px at 20% 0%, ${brand.primary}22 0%, transparent 70%)`,
              }}
            />

            <blockquote
              id={`quote-${i}`}
              className="relative z-10 text-slate-800"
            >
              <div
                className="flex items-center gap-2 text-amber-500"
                aria-hidden
              >
                {/* star visual */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm font-medium">Rated highly</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">{t.quote}</p>
            </blockquote>

            <figcaption className="relative z-10 mt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-full bg-[--brand-primary]/10 text-sm font-bold"
                  style={{ color: brand.primary }}
                  aria-hidden
                >
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

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {t.inc}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
