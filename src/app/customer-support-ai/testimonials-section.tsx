import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// TestimonialsSection.tsx
// - Unified blue theme, border-free cards, accessible auto-rotating carousel
// - Logo band with soft badges, video placeholder, 3-up quote cards with avatars
// - Dots + pause on hover, keyboard accessible

const SAMPLE_LOGOS = ["Nexora", "Logibase", "Northwind", "Globex", "Innotech"];

const TESTIMONIALS = [
  {
    name: "Anita Bose",
    role: "Head of Support, Nexora",
    quote:
      "Advancelytics cut our response time in half — agents are happier and customers too.",
    stat: "CSAT +22%",
  },
  {
    name: "Martin Cole",
    role: "Ops Lead, Logibase",
    quote:
      "Automatic routing meant fewer escalations and faster resolutions across the team.",
    stat: "Backlog −18%",
  },
  {
    name: "Priya Sharma",
    role: "Customer Success, Northwind",
    quote:
      "The AI suggestions are shockingly relevant — it feels like an extra senior hire.",
    stat: "Deflection +31%",
  },
  {
    name: "Diego Ruiz",
    role: "Support Manager, Globex",
    quote: "We saw measurable CSAT improvements in the first month.",
    stat: "CSAT +19%",
  },
  {
    name: "Lina Park",
    role: "Product, Innotech",
    quote: "Summaries save us hours on handoffs — cleaner context for agents.",
    stat: "Time Saved 12h/wk",
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // autoplay
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(id);
  }, [isPaused]);

  // keyboard left/right
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setActiveIndex(
          (i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
        );
      if (e.key === "ArrowRight")
        setActiveIndex((i) => (i + 1) % TESTIMONIALS.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // show three cards centered on activeIndex
  const visible = (offset: number) =>
    TESTIMONIALS[(activeIndex + offset) % TESTIMONIALS.length];

  return (
    <section
      id="testimonials"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            What customers are saying
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Video / logo carousel for credibility — rotates automatically.
          </p>
        </div>
        <div className="hidden md:block text-sm text-slate-500">
          CSAT ↑, backlog ↓
        </div>
      </div>

      {/* logo badges */}
      <div className="mt-6 flex flex-wrap items-center gap-3 opacity-90">
        {SAMPLE_LOGOS.map((l) => (
          <span
            key={l}
            className="rounded-lg bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
          >
            {l}
          </span>
        ))}
      </div>

      {/* carousel */}
      <div
        ref={rootRef}
        className="relative mt-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative min-h-[220px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.48, ease: "easeOut" }}
              className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3"
            >
              {Array.from({ length: 3 }).map((_, col) => {
                const t = visible(col);
                return (
                  <figure
                    key={col}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg"
                  >
                    {/* large quote mark */}
                    <svg
                      className="absolute -left-4 -top-4 h-20 w-20 text-blue-50"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M7.17 6A4 4 0 003 10v2a4 4 0 004 4h1v2a2 2 0 002 2h1v-2a4 4 0 00-4-4V10a2 2 0 012-2h1V6H7.17zM17.17 6A4 4 0 0013 10v2a4 4 0 004 4h1v2a2 2 0 002 2h1v-2a4 4 0 00-4-4V10a2 2 0 012-2h1V6h-3.83z" />
                    </svg>

                    <blockquote className="relative z-10 text-slate-800">
                      <div
                        className="flex items-center gap-2 text-sm text-amber-500"
                        aria-hidden
                      >
                        {"★★★★★"}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {t.quote}
                      </p>
                    </blockquote>

                    <figcaption className="relative z-10 mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 text-sm font-bold text-blue-700">
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

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {t.stat}
                      </span>
                    </figcaption>
                  </figure>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls: dots */}
        <div className="mt-6 flex justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === activeIndex ? "bg-blue-600 scale-110" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* small video row below (placeholder) */}
      <div className="mt-8 grid gap-4 md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-24 rounded-lg bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-sm font-semibold text-blue-700 shadow-inner">
            Video
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Customer Stories
            </div>
            <div className="text-xs text-slate-500">
              Short clips from product teams
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm text-slate-500">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 5v14M19 12H5"
              stroke="#94A3B8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <div>Trusted by teams worldwide</div>
        </div>
      </div>
    </section>
  );
}
