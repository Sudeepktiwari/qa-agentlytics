import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function BeforeAfterAccuracy(): React.ReactElement {
  const reduce = useReducedMotion();

  // animation props that respect reduced motion
  const animateWidth = (w: string) =>
    reduce ? { width: w } : { width: ["0%", w] };

  return (
    <section
      className="mx-auto mt-8 max-w-5xl px-4 sm:px-6"
      aria-labelledby="before-after-title"
    >
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-50">
        <div className="mb-3 flex items-center justify-between">
          <h3
            id="before-after-title"
            className="text-base font-semibold text-slate-900"
          >
            Before vs After — Answer Accuracy
          </h3>
          <span className="text-[11px] text-slate-500">
            Realistic target example
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Before */}
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Before (Static KB)</span>
              <span className="font-medium text-slate-800">55%</span>
            </div>

            <div className="h-2 w-full overflow-visible rounded bg-slate-100">
              <motion.div
                className="h-2 rounded bg-rose-400"
                initial={{ width: "0%" }}
                animate={animateWidth("55%")}
                transition={{ duration: reduce ? 0 : 0.7, ease: "easeOut" }}
                aria-hidden={reduce || undefined}
                style={{ willChange: "width" }}
              />
            </div>
          </div>

          {/* After */}
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>After (AI-Led)</span>
              <span className="font-medium text-slate-800">92%</span>
            </div>

            <div className="h-2 w-full overflow-visible rounded bg-[--surface-alt]">
              <motion.div
                className="relative h-2 rounded bg-[--brand-primary]"
                initial={{ width: "0%" }}
                animate={animateWidth("92%")}
                transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
                aria-hidden={reduce || undefined}
                style={{ willChange: "width" }}
              >
                {/* subtle shimmer overlay — also respects reduced motion */}
                <motion.span
                  className="absolute inset-0 block rounded"
                  initial={{ opacity: 0 }}
                  animate={reduce ? { opacity: 0 } : { opacity: [0, 1, 0] }}
                  transition={{
                    delay: 0.2,
                    duration: reduce ? 0 : 0.6,
                    repeat: reduce ? 0 : 0,
                  }}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)",
                    backgroundSize: "200% 100%",
                    pointerEvents: "none",
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
