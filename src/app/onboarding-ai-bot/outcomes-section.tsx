// components/OutcomesSection.jsx
import React from "react";

export default function OutcomesSection({
  brand = { primary: "var(--brand-primary)" },
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const metrics = [
    { k: "Time-to-value", v: "−32%", type: "decrease" },
    { k: "Completion rate", v: "+24%", type: "increase" },
    { k: "Setup tickets", v: "−18%", type: "decrease" },
  ];

  return (
    <section
      id="outcomes"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 scroll-mt-24"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Activation that compounds
        </h2>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
          See measurable improvement in onboarding speed, success rate, and
          support load.
        </p>

        <div
          className={`mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          } transition-all duration-500`}
        >
          {metrics.map((m, i) => {
            const isIncrease = m.type === "increase";
            const color = isIncrease ? "text-emerald-600" : "text-rose-600";
            const bgGradient = isIncrease
              ? `from-emerald-50/80 to-white`
              : `from-rose-50/80 to-white`;

            return (
              <div
                key={m.k}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${bgGradient} p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                {/* subtle highlight ring */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-60"
                  style={{
                    background: `radial-gradient(240px 120px at 50% 0%, ${brand.primary}15 0%, transparent 70%)`,
                  }}
                />
                <div className="relative z-10">
                  <div className="text-[12px] uppercase tracking-wide text-slate-500 font-medium">
                    {m.k}
                  </div>
                  <div
                    className={`mt-2 text-3xl font-bold ${color}`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    {m.v}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {isIncrease
                      ? "Improvement from last quarter"
                      : "Reduction from baseline"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
