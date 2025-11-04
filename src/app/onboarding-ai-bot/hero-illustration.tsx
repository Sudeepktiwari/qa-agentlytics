// components/GuidedOnboardingPreview.jsx
import React from "react";

/**
 * GuidedOnboardingPreview (updated)
 * - Improved Agent Tip card look (clean header, icon, subtle divider)
 * - Mobile-first responsive layout (stacks on small screens)
 * - Soft backgrounds / chips for actions, accessible focus states
 *
 * Props:
 * - brand.primary (default 'var(--brand-primary)')
 * - brand.accent  (default 'var(--brand-accent)')
 */
export default function GuidedOnboardingPreview({
  brand = { primary: "var(--brand-primary)", accent: "var(--brand-accent)" },
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const fields = [
    { k: "Company name", v: "CloudScale" },
    { k: "Billing email", v: "ops@cloudscale.io" },
    { k: "Webhook URL", v: "https://api.cloudscale.io/hook" },
  ];

  const actions = [
    { label: "Why required?", hint: "Explains why we need the webhook." },
    { label: "Use sample data", hint: "Pre-fill fields with sample values." },
    { label: "Skip for now", hint: "Continue without webhook; add later." },
  ];

  const metrics = [
    { k: "Setup", v: 72 },
    { k: "Validated", v: 56 },
    { k: "Complete", v: 38 },
  ];

  return (
    <div className="relative">
      {/* halo (low-impact, decorative) */}
      <div
        className="absolute -inset-1 rounded-3xl blur-3xl opacity-50"
        style={{
          background: `linear-gradient(180deg, ${brand.primary}12, ${brand.accent}06)`,
          zIndex: 0,
        }}
        aria-hidden
      />

      <div
        className={`relative rounded-3xl bg-white/95 p-4 sm:p-6 shadow-xl transform transition-all duration-400 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ zIndex: 1 }}
      >
        <div className="mb-4 text-sm font-semibold text-slate-700">
          Guided Onboarding Preview
        </div>

        {/* layout: stacks on small, two columns on md+ */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* left: fields list */}
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div
                key={f.k}
                className="rounded-lg p-3"
                style={{
                  background:
                    i % 2 === 0
                      ? "linear-gradient(180deg, rgba(245,248,255,0.9), rgba(255,255,255,0.9))"
                      : "linear-gradient(180deg, rgba(250,251,255,0.98), rgba(255,255,255,0.98))",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">{f.k}</div>
                  <div className="text-[11px] text-slate-400">Editable</div>
                </div>
                <div className="mt-1 text-sm font-medium text-slate-800 truncate">
                  {f.v}
                </div>
              </div>
            ))}
          </div>

          {/* right: improved Agent Tip card */}
          <div
            className="rounded-lg p-3"
            style={{ background: "linear-gradient(180deg,#fff,#fbfdff)" }}
          >
            <div className="flex items-start gap-3">
              {/* icon */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(180deg, ${brand.primary}10, ${brand.accent}08)`,
                }}
                aria-hidden
              >
                <svg
                  className="h-5 w-5 text-[--brand-primary]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 2v6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 11c2-3 5-5 7-5s5 2 7 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 13v9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      Agent Tip
                    </div>
                    <div className="mt-1 text-sm text-slate-800">
                      Webhook URL lets us send event updates to your system.
                    </div>
                  </div>
                </div>

                {/* subtle divider */}
                <div className="my-3 h-px w-full bg-slate-100" />

                {/* action chips: responsive, accessible */}
                <div className="flex flex-wrap gap-2">
                  {actions.map((a, idx) => (
                    <button
                      key={a.label}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{
                        borderColor: `${brand.primary}30`,
                        color: "var(--brand-primary)",
                        background: "white",
                      }}
                      aria-label={`${a.label} — ${a.hint}`}
                    >
                      <span className="text-xs font-semibold" aria-hidden>
                        {idx + 1}
                      </span>
                      <span className="text-xs">{a.label}</span>
                    </button>
                  ))}
                </div>

                {/* small help text visible under chips on mobile */}
                <div className="mt-3 text-xs text-slate-500 md:hidden">
                  Tips: tap an action to learn more about the field.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* metrics row: stacks to 1-col on small screens */}
        <div className="mt-5 grid grid-cols-3 gap-3 text-center sm:grid-cols-3 xs:grid-cols-1">
          {metrics.map((m, idx) => (
            <div
              key={m.k}
              className="rounded-lg p-3"
              style={{
                background: "linear-gradient(180deg,#fff,#fbfdff)",
                boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
              }}
            >
              <div className="text-[11px] text-slate-500">{m.k}</div>
              <div className="mt-1 text-lg font-bold text-slate-800">
                {m.v}%
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: mounted ? `${m.v}%` : "0%",
                    transition: `width 900ms cubic-bezier(.2,.9,.2,1) ${
                      idx * 80
                    }ms`,
                    background: `linear-gradient(90deg, ${brand.primary}, ${brand.accent})`,
                  }}
                />
              </div>

              {/* small meta row */}
              <div className="mt-2 text-xs text-slate-500">Updated 2h ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
