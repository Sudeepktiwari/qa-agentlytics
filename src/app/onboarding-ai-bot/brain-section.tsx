"use client";
// components/BrainSection.jsx
import React from "react";

/**
 * BrainSection (no layout-shift on mobile)
 * - Desktop: inline details (no big change)
 * - Mobile (<md): open a fixed bottom-sheet overlay for details (prevents pushing content)
 * - Auto-cycles every 3s; pause on hover/focus or manual select (6s)
 * - Tailwind-only, SSR-safe
 */
export default function BrainSection({
  brand = { primary: "var(--brand-primary)", sky: "var(--brand-sky)" },
}) {
  const options = [
    {
      id: "intent",
      title: "Intent Detection",
      short:
        "Focus, errors, idle time, and docs viewed trigger the right guidance.",
      detail:
        "Focus, validation errors, long idle time and the docs a user views are combined to detect intent and decide when to step in.",
      node: { cx: 72, cy: 84, r: 6 },
      color: brand.primary,
      label: "I",
    },
    {
      id: "prompts",
      title: "Smart Prompts",
      short: "Offers next best actions like ‘Use sandbox key’ or ‘Map fields’.",
      detail:
        "Contextual prompts suggest the next best action (e.g. 'Use sandbox key', 'Map example fields') to reduce friction and speed completion.",
      node: { cx: 112, cy: 62, r: 5 },
      color: brand.sky,
      label: "S",
    },
    {
      id: "context",
      title: "Context Memory",
      short: "Remembers answers and preferences to avoid repetition.",
      detail:
        "The agent remembers user answers and preferences during the session and across steps, avoiding repeated questions and keeping flow smooth.",
      node: { cx: 148, cy: 96, r: 5.5 },
      color: brand.primary,
      label: "C",
    },
    {
      id: "lifecycle",
      title: "Lifecycle Aware",
      short: "Moves from Trial → Activation → Expansion with the right steps.",
      detail:
        "The brain adapts messaging by lifecycle stage — onboarding for trials, activation nudges, and tailored expansion prompts later.",
      node: { cx: 120, cy: 132, r: 5 },
      color: brand.sky,
      label: "L",
    },
  ];

  const [activeIdx, setActiveIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const cycleRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // mobile overlay state
  const [isMobile, setIsMobile] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // detect mobile (md breakpoint) client-side only
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // prevent body scroll when sheet open
  React.useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sheetOpen]);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // auto-cycle every 3s unless paused
  React.useEffect(() => {
    if (cycleRef.current) {
      clearInterval(cycleRef.current);
      cycleRef.current = null;
    }
    if (!paused) {
      cycleRef.current = setInterval(() => {
        setActiveIdx((s) => (s + 1) % options.length);
      }, 3000);
    }
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [paused]);

  function manualSelect(idx: number) {
    setActiveIdx(idx);
    // if mobile, open sheet overlay instead of expanding inline
    if (isMobile) {
      setSheetOpen(true);
    }
    setPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setPaused(false), 6000);
  }

  return (
    <section
      id="brain"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 h-auto md:min-h-[64vh]"
    >
      <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start lg:justify-between">
        {/* LEFT: options */}
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Inside the Proactive Brain
          </h2>
          <p className="mt-3 text-slate-600">
            Agentlytics reads behavior, not just text — engaging at the perfect
            moment with the perfect message.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {options.map((opt, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={opt.id}
                  onClick={() => manualSelect(i)}
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                  className={`group flex w-full items-start gap-3 rounded-2xl p-4 text-left transition-all duration-200 focus:outline-none ${
                    isActive
                      ? "bg-gradient-to-b from-white to-[--surface] shadow-md"
                      : "bg-white/90 hover:shadow-sm"
                  }`}
                  aria-pressed={isActive}
                  aria-current={isActive}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 text-sm font-semibold"
                    style={{
                      background: isActive
                        ? `linear-gradient(180deg, ${opt.color}18, ${opt.color}10)`
                        : `linear-gradient(180deg, ${opt.color}08, ${opt.color}04)`,
                      color: opt.color,
                    }}
                    aria-hidden
                  >
                    {opt.label}
                  </span>

                  <div className="flex-1">
                    <div
                      className={`text-sm font-semibold ${
                        isActive ? "text-slate-900" : "text-slate-800"
                      }`}
                    >
                      {opt.title}
                    </div>
                    <div
                      className={`mt-1 text-sm ${
                        isActive ? "text-slate-600" : "text-slate-500"
                      }`}
                    >
                      {opt.short}
                    </div>

                    {/* show detail inline only on desktop (prevent mobile layout shift) */}
                    {!isMobile && isActive && (
                      <div className="mt-3 text-xs text-slate-500">
                        {opt.detail}
                      </div>
                    )}
                  </div>

                  <div className="ml-3 flex items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-transform duration-200 ${
                        isActive
                          ? "scale-105 bg-[--brand-primary] text-white shadow"
                          : "bg-slate-100 text-slate-700"
                      }`}
                      aria-hidden
                    >
                      {i + 1}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: brain card + svg */}
        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div
            className={`relative rounded-3xl bg-white/95 p-6 shadow-2xl transform transition-all duration-400 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Proactive brain preview
              </div>
              <div className="text-xs text-slate-500">Interactive demo</div>
            </div>

            <div className="flex flex-col items-center justify-center">
              {/* svg */}
              <div className="relative">
                <svg
                  className="absolute -z-10 h-60 w-60 opacity-30"
                  viewBox="0 0 200 200"
                  aria-hidden
                >
                  <defs>
                    <radialGradient id="rgradA" cx="50%" cy="40%">
                      <stop
                        offset="0%"
                        stopColor="var(--brand-sky)"
                        stopOpacity="0.12"
                      />
                      <stop
                        offset="100%"
                        stopColor="transparent"
                        stopOpacity="0"
                      />
                    </radialGradient>
                  </defs>
                  <circle cx="100" cy="100" r="85" fill="url(#rgradA)" />
                </svg>

                <svg
                  className="h-[220px] w-[220px]"
                  viewBox="0 0 220 220"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M44 96c-2-18 4-38 22-48 18-10 38-6 52 2 8 5 22 3 34-2 14-6 36-8 52 2 18 11 25 28 23 48-2 18-16 30-34 34-22 5-38-1-50-8-7-4-20-3-30 1-14 5-34 11-54-3-12-9-22-24-21-60z"
                    stroke="rgba(6,30,85,0.12)"
                    strokeWidth="2"
                    fill="white"
                  />
                  <path
                    d="M70 85 C90 70, 130 60, 150 75"
                    stroke="rgba(0,107,255,0.08)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M90 120 C110 135, 140 140, 160 120"
                    stroke="rgba(16,185,129,0.06)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {options.map((opt, i) => {
                    const isActive = i === activeIdx;
                    const { cx, cy, r } = opt.node;
                    const fillActive = opt.color;
                    const fillInactive = "rgba(100,116,139,0.18)";
                    return (
                      <g key={opt.id}>
                        {isActive && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r * 2.6}
                            fill={opt.color}
                            opacity="0.08"
                          />
                        )}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill={isActive ? fillActive : fillInactive}
                          stroke={
                            isActive ? "transparent" : "rgba(100,116,139,0.06)"
                          }
                          style={{ transition: "all .28s ease" }}
                        />
                        {isActive && (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill={opt.color}
                            opacity="0.001"
                          >
                            <animate
                              attributeName="r"
                              values={`${r}; ${r * 2.4}; ${r}`}
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.9;0.18;0.9"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* caption + desktop inline detail */}
              <div className="mt-4 w-full max-w-[44rem] text-center">
                <div className="text-sm font-semibold text-slate-800">
                  {options[activeIdx].title}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {options[activeIdx].detail}
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() =>
                      manualSelect(
                        (activeIdx - 1 + options.length) % options.length
                      )
                    }
                    className="rounded-full bg-white p-2 shadow-sm hover:shadow-md focus:outline-none"
                    aria-label="Previous"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() => setPaused((p) => !p)}
                    className={`rounded-full px-3 py-1 text-sm font-medium focus:outline-none ${
                      paused ? "bg-slate-100" : "bg-white"
                    } shadow-sm`}
                    aria-pressed={paused}
                  >
                    {paused ? "Resume" : "Pause"}
                  </button>

                  <button
                    onClick={() =>
                      manualSelect((activeIdx + 1) % options.length)
                    }
                    className="rounded-full bg-white p-2 shadow-sm hover:shadow-md focus:outline-none"
                    aria-label="Next"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-slate-500">
                Tap an option on mobile to open details.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom-sheet overlay for details (prevents layout shift) */}
      {isMobile && sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`${options[activeIdx].title} details`}
          onClick={() => setSheetOpen(false)}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* sheet */}
          <div
            className="relative z-10 w-full max-w-3xl rounded-t-2xl bg-white p-4 pb-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "78vh", overflowY: "auto" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {options[activeIdx].title}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {options[activeIdx].short}
                </div>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-700">
              {options[activeIdx].detail}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() =>
                  manualSelect(
                    (activeIdx - 1 + options.length) % options.length
                  )
                }
                className="rounded-full bg-slate-100 px-3 py-1 text-sm"
                aria-label="Previous"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                className="rounded-full bg-white px-4 py-1 text-sm shadow-sm"
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={() => manualSelect((activeIdx + 1) % options.length)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm"
                aria-label="Next"
              >
                Next ›
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
