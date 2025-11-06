import React from "react";
import { motion } from "framer-motion";

// ImpactSectionPolished.tsx (with negative values highlighted in red)
// - Negative metrics now show in red, positive in blue

const METRICS = [
  { k: "Repeat queries", v: "−38%" },
  { k: "Agent discovery speed", v: "+60%" },
  { k: "Duplicate content", v: "−43%" },
  { k: "Self-serve deflection", v: "+25%" },
];

export default function ImpactSectionPolished() {
  return (
    <section id="impact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        Real Impact — Answers that Find You
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {METRICS.map((m, i) => {
          const isNegative = m.v.includes("−") || m.v.includes("-");
          return (
            <motion.div
              key={m.k}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
              className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-blue-50 hover:shadow-md hover:-translate-y-1 transition-transform"
            >
              <div className="text-[12px] font-medium text-slate-500">
                {m.k}
              </div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  isNegative ? "text-red-600" : "text-blue-700"
                }`}
              >
                {m.v}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
