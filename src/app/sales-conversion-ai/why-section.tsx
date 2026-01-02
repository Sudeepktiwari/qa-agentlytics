"use client";
import { motion } from "framer-motion";

export default function WhySection() {
  const chatSteps = [
    "Visitor browses pricing → AI triggers assistance",
    "AI: “Need help choosing the right plan?”",
    "User: “I’m comparing Enterprise vs Pro”",
    "AI: “Let me show a quick comparison and book a call.”",
  ];

  return (
    <section
      id="why"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 scroll-mt-24"
    >
      <div className="grid items-start gap-16 lg:grid-cols-2">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            Why reactive chatbots lose conversions
          </h2>
          <p className="mt-4 max-w-xl text-lg text-gray-600 leading-relaxed">
            Traditional bots wait for users to act. Advancelytics detects buyer
            intent early and engages proactively — turning missed opportunities
            into booked demos.
          </p>

          <ul className="mt-8 space-y-3 text-gray-700">
            {[
              "Identifies visitor intent before they leave",
              "Engages automatically with contextual prompts",
              "Routes qualified leads to the right rep instantly",
              "Increases conversions and reduces SDR workload",
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex items-center gap-3 text-base"
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/80 p-4 md:p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="mb-4 text-sm font-semibold text-slate-700 tracking-wide uppercase">
            Intent Detection in Action
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            {chatSteps.map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.4,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                className={`rounded-xl border border-gray-100 p-3 transition-all ${
                  i % 2 === 0
                    ? "bg-gray-50 hover:shadow-md"
                    : "bg-blue-50/50 hover:shadow-md"
                }`}
              >
                {text}
              </motion.div>
            ))}
          </div>

          {/* Floating Glow Effect */}
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-blue-100/50 via-transparent to-transparent blur-3xl"></div>
        </motion.div>
      </div>
    </section>
  );
}
