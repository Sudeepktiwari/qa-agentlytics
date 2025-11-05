import React from "react";

// PlanSection.tsx — refined blue theme version
// - Adds soft blue gradients, subtle icon backgrounds, and cohesive hover motion
// - Maintains clarity and hierarchy

export default function PlanSection() {
  const steps = [
    {
      icon: "🔗",
      title: "Connect",
      text: "Plug into Zendesk, Freshdesk, Intercom, or Salesforce in minutes.",
    },
    {
      icon: "🧠",
      title: "Learn",
      text: "AI reads tickets, macros, and KB to understand your support patterns.",
    },
    {
      icon: "⚙️",
      title: "Automate",
      text: "Deflect FAQs, route correctly, and summarize for agents instantly.",
    },
  ];

  return (
    <section
      id="plan"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24 bg-gradient-to-b from-white to-blue-50/30 rounded-3xl"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Your 3‑step plan
        </h2>
        <p className="mt-2 text-slate-600">
          Make adoption look effortless: connect, learn, and automate.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-md transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            {/* glow on hover */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(300px 160px at 50% -20%, rgba(59,130,246,0.25) 0%, transparent 70%)",
              }}
              aria-hidden
            />

            {/* card content */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-blue-100 to-blue-50 text-3xl">
                {s.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
                {s.text}
              </p>
              <div className="mt-5 h-1 w-0 rounded bg-blue-500 transition-all duration-500 group-hover:w-24" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
