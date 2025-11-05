import React from "react";

// OutcomesSection.tsx — polished blue theme version
// - Adds gradients, icons, and smooth hover motion
// - Clean and cohesive with other sections

const METRICS = [
  { k: "Response time", v: "−40%", icon: "⏱️" },
  { k: "Ticket deflection", v: "+33%", icon: "📤" },
  { k: "CSAT", v: "+27%", icon: "😊" },
  { k: "Backlog", v: "−25%", icon: "📉" },
];

export default function OutcomesSection() {
  return (
    <section
      id="outcomes"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24 bg-gradient-to-b from-white to-blue-50/40 rounded-3xl"
    >
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center">
        Customer support that compounds
      </h2>

      <div className="mt-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {METRICS.map((m) => (
          <div
            key={m.k}
            className="group relative rounded-2xl bg-white p-6 shadow-md ring-1 ring-blue-50 transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg"
          >
            {/* subtle blue glow */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(240px 120px at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 70%)",
              }}
              aria-hidden
            />

            <div className="relative z-10 flex flex-col items-center">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-blue-100 to-blue-50 text-lg text-blue-700">
                {m.icon}
              </div>
              <div className="mt-3 text-[12px] font-medium text-slate-600 uppercase tracking-wide">
                {m.k}
              </div>
              <div className="mt-1 text-2xl font-bold text-blue-700">{m.v}</div>
              <div className="mt-2 h-1 w-0 rounded bg-blue-600 transition-all duration-500 group-hover:w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
