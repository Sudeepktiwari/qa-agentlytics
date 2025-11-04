// components/WhySectionAuto.jsx
import React from "react";

export default function WhySectionAuto({
  brand = { primary: "var(--brand-primary)" },
}) {
  const [isAfter, setIsAfter] = React.useState(true);
  const [isPaused, setIsPaused] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  // Store the numeric ID returned by window.setInterval
  const intervalRef = React.useRef<number | null>(null);

  // Mount reveal
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Auto-switch every 2 s
  React.useEffect(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isPaused) {
      intervalRef.current = window.setInterval(() => {
        setIsAfter((prev) => !prev);
      }, 2000);
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused]);

  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="grid items-start gap-10 md:grid-cols-2">
        {/* LEFT: Text */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why AI-guided onboarding wins
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Static checklists create drop-offs. Our agent makes onboarding
            conversational, contextual, and confidence-building.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-slate-700">
                Traditional Onboarding
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                <li>One-size-fits-all checklist</li>
                <li>Confusing fields, no context</li>
                <li>Support pings for basic questions</li>
                <li>High drop-off on technical steps</li>
              </ul>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                background: `linear-gradient(180deg, ${brand.primary}08, ${brand.primary}04)`,
              }}
            >
              <div className="mb-2 text-sm font-semibold text-[--brand-primary]">
                Agentlytics Onboarding AI
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
                <li>Explains the why behind each field</li>
                <li>Instant answers, in-flow</li>
                <li>Detects friction & adapts the path</li>
                <li>Faster time-to-value</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[--surface] p-4 text-sm text-slate-700">
            <strong>Insight:</strong> 42% of users pause on API credentials. A
            guided “Why this matters” tooltip + sample keys increased completion
            by 28%.
          </div>
        </div>

        {/* RIGHT: Before vs After */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white p-6 shadow transition-transform duration-300"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Header + improved toggle */}
          <div className="mb-5 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Before vs After</span>
            <div className="relative flex h-9 w-48 items-center rounded-full bg-slate-100 p-1 text-xs font-medium shadow-inner">
              {/* Sliding indicator */}
              <span
                className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full transition-all duration-300 ${
                  isAfter ? "translate-x-[calc(100%+0.25rem)]" : "translate-x-0"
                }`}
                style={{ background: brand.primary }}
              />
              {/* Labels */}
              <button
                type="button"
                onClick={() => setIsAfter(false)}
                className={`relative z-10 flex-1 text-center transition-colors duration-300 ${
                  !isAfter ? "text-white" : "text-slate-600"
                }`}
              >
                Before
              </button>
              <button
                type="button"
                onClick={() => setIsAfter(true)}
                className={`relative z-10 flex-1 text-center transition-colors duration-300 ${
                  isAfter ? "text-white" : "text-slate-600"
                }`}
              >
                After
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="md:grid grid-cols-2 gap-3 text-sm text-slate-600">
            {/* Before */}
            <div
              className={`rounded-xl p-4 transition-all duration-500 ${
                isAfter
                  ? "scale-[0.96] opacity-60"
                  : "scale-100 opacity-100 shadow-sm"
              } bg-[--surface]`}
            >
              <div className="mb-2 font-bold text-slate-800">Traditional</div>
              <p>Confusion on API scopes</p>
              <p>Idle 40s on “Webhook” step</p>
            </div>

            {/* After */}
            <div
              className={`rounded-xl p-4 transition-all duration-500 ${
                isAfter
                  ? "scale-100 opacity-100 shadow-md"
                  : "scale-[0.96] opacity-60"
              }`}
              style={{
                background: `linear-gradient(180deg, ${brand.primary}10, ${brand.primary}05)`,
              }}
            >
              <div className="mb-2 font-bold text-[--brand-primary]">
                With Agent
              </div>
              <p>Explains scopes with examples</p>
              <p>Offers sandbox key + test ping</p>

              <div
                className={`mt-3 flex items-center gap-2 text-xs ${
                  isAfter ? "text-[--brand-primary]" : "text-slate-500"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{isAfter ? "Reduced friction" : "––"}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              className="w-full rounded-lg bg-[--brand-primary] px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md sm:w-auto"
              style={{ backgroundColor: brand.primary }}
            >
              Try guided onboarding
            </button>
            <a
              href="#learn-more"
              className="w-full text-center text-sm font-medium text-slate-700 sm:w-auto"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
