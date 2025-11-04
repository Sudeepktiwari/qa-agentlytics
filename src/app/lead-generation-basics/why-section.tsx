import React from "react";

export default function WhyLeadCapture({
  brand = {
    primary: "var(--brand-primary)",
    accent: "var(--brand-accent)",
  },
}) {
  const [mounted, setMounted] = React.useState(false);
  const [showAfter, setShowAfter] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 70);
    const s = setInterval(() => setShowAfter((v) => !v), 2500);
    return () => {
      clearTimeout(t);
      clearInterval(s);
    };
  }, []);

  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="grid items-center gap-10 md:grid-cols-2">
        {/* Left column */}
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why proactive lead capture matters
          </h2>

          <p className="mt-3 max-w-xl text-slate-600">
            Most website visitors leave without engaging. Traditional forms wait
            for users — Agentlytics acts first, detecting intent and starting
            contextual conversations that convert.
          </p>

          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-[--brand-primary]/10 text-[--brand-primary] font-semibold">
                ✓
              </span>
              <span>2.8× more leads with behavior-driven prompts</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                ⚡
              </span>
              <span>40% faster response → faster pipeline velocity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 font-semibold">
                🔁
              </span>
              <span>Automated capture, scoring, and CRM sync</span>
            </li>
          </ul>
        </div>

        {/* Right column - comparison card */}
        <div
          className={`relative transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Before vs After
              </div>

              {/* Fixed toggle control */}
              <div
                className="inline-flex h-9 items-center rounded-full bg-slate-100 p-1 text-xs font-medium"
                role="tablist"
                aria-label="Comparison view"
              >
                <button
                  role="tab"
                  aria-selected={!showAfter}
                  onClick={() => setShowAfter(false)}
                  className={`relative z-10 px-3 py-1 rounded-full transition-all duration-300 ${
                    !showAfter
                      ? "text-white shadow-md"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                  style={{
                    backgroundColor: !showAfter ? brand.primary : "transparent",
                  }}
                >
                  Before
                </button>
                <button
                  role="tab"
                  aria-selected={showAfter}
                  onClick={() => setShowAfter(true)}
                  className={`relative z-10 px-3 py-1 rounded-full transition-all duration-300 ${
                    showAfter
                      ? "text-white shadow-md"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                  style={{
                    backgroundColor: showAfter ? brand.primary : "transparent",
                  }}
                >
                  After
                </button>
              </div>
            </div>

            {/* Comparison cards */}

            <div className="mt-4 md:grid grid-cols-2 gap-3 text-sm text-slate-600">
              {/* Before card */}
              <div
                className={`rounded-xl p-4 transition-all duration-300 ${
                  showAfter
                    ? "opacity-80 scale-[0.98] bg-[--surface]"
                    : "opacity-100 scale-100 shadow-md bg-gradient-to-b from-white to-[--brand-primary]/5"
                }`}
              >
                <div className="mb-2 font-semibold text-slate-800">
                  Static Form
                </div>
                <ul className="list-inside list-disc space-y-1">
                  <li>Waits for input</li>
                  <li>Low intent signal</li>
                  <li>Higher drop-offs</li>
                </ul>
                <div className="mt-3 text-xs text-slate-500">
                  Passive capture — relies on user action
                </div>
              </div>

              {/* After card */}
              <div
                className={`rounded-xl p-4 transition-all duration-300 ${
                  showAfter
                    ? "opacity-100 scale-100 shadow-md bg-gradient-to-b from-[--brand-primary]/6 to-white"
                    : "opacity-80 scale-[0.98] bg-[--surface]"
                }`}
              >
                <div className="mb-2 font-semibold text-[--brand-primary]">
                  AI Conversation
                </div>
                <ul className="list-inside list-disc space-y-1 text-slate-700">
                  <li>Detects & engages at the moment of intent</li>
                  <li>Context-aware prompts and micro-questions</li>
                  <li>CRM-ready, scored leads — less noise</li>
                </ul>

                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[--brand-primary]/10 px-2 py-1 text-[--brand-primary] text-xs font-semibold">
                    Live demo
                  </span>
                  <span className="text-xs text-slate-500">
                    Higher conversion & better lead quality
                  </span>
                </div>
              </div>
            </div>

            {/* footer CTA inside card */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[--brand-primary]"
                style={{ backgroundColor: brand.primary }}
              >
                See the live demo
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              <div className="text-xs text-slate-500">
                No code · Start in minutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
