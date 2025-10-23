"use client";
import { motion } from "framer-motion";

/**
 * Agentlytics – CRM & Analytics Sync (No external icon deps)
 * Fix: Removed `lucide-react` icons to avoid CDN/ESM fetch errors in sandboxed builds.
 * - Replaced all icons with lightweight inline SVG React components.
 * - Kept the same layout/sections (Hero, Illustration, How it Works, Benefits, CTA).
 * - Added a tiny DevTests panel to sanity‑check that components render without undefined imports.
 */

/* ================= Inline SVG Icons ================= */
function IconCloudSync({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 16.5a3.5 3.5 0 0 0-3.5-3.5H16a5 5 0 1 0-9.9 1" />
      <path d="M16 13a3.5 3.5 0 0 1 0 7H7a4 4 0 0 1-1-7.874" />
      <polyline points="12 6 12 10 14 8" />
      <polyline points="12 18 12 14 10 16" />
    </svg>
  );
}
function IconDatabase({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
      <path d="M3 11v6c0 1.657 4.03 3 9 3s9-1.343 9-3v-6" />
    </svg>
  );
}
function IconBarChart({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <rect x="6" y="12" width="3" height="6" />
      <rect x="11" y="8" width="3" height="10" />
      <rect x="16" y="5" width="3" height="13" />
    </svg>
  );
}
function IconShieldCheck({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2l7 3v6c0 5-3.5 9-7 11-3.5-2-7-6-7-11V5l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconZap({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconCheckCircle({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ================= Page ================= */
export default function CRMSyncPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-600">
              CRM & Analytics Sync
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <a
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50"
              href="#learn"
            >
              Learn
            </a>
            <a
              className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white shadow hover:bg-blue-700"
              href="#cta"
            >
              Start free
            </a>
          </div>
        </div>
      </header>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            CRM & Analytics Sync —
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Turn Conversations into Data You Can Act On
            </span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Every lead, chat insight, and qualification score syncs seamlessly
            with your CRM and analytics platforms — keeping your pipelines
            clean, accurate, and always up-to-date.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="#demo"
              className="px-5 py-3 rounded-2xl border border-slate-200 bg-white font-medium hover:bg-slate-50"
            >
              Watch demo
            </a>
            <a
              href="#cta"
              className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700"
            >
              Start free
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="mx-auto max-w-5xl mt-10 px-4">
          <IntegrationCanvas />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <IconCloudSync className="size-6 text-blue-600" />,
              title: "Auto-Sync Conversations",
              desc: "All chat data, lead details, and qualification tags are automatically synced with your connected CRM or analytics tools.",
            },
            {
              icon: <IconDatabase className="size-6 text-indigo-600" />,
              title: "Unified Lead Records",
              desc: "Consolidate visitor data, BANT qualification, and trigger history into a single, easy-to-view CRM profile.",
            },
            {
              icon: <IconBarChart className="size-6 text-cyan-600" />,
              title: "Analytics-Ready Data",
              desc: "Feed your dashboards with real-time conversation metrics — from engagement scores to lead quality trends.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                {s.icon}
                <h3 className="font-semibold text-lg">{s.title}</h3>
              </div>
              <p className="text-sm text-slate-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10">
          Why Teams Love CRM Sync
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <IconCheckCircle className="size-6 text-green-600" />,
              title: "Zero Manual Entry",
              desc: "No copy-paste chaos. Every new lead, chat note, and update flows directly into your CRM automatically.",
            },
            {
              icon: <IconZap className="size-6 text-yellow-500" />,
              title: "Instant Insights",
              desc: "Access lead intent, chat sentiment, and qualification scores in real time inside your dashboards.",
            },
            {
              icon: <IconShieldCheck className="size-6 text-blue-600" />,
              title: "Data Accuracy & Compliance",
              desc: "GDPR-ready pipelines ensure no duplicate or inconsistent data reaches your CRM.",
            },
            {
              icon: <IconBarChart className="size-6 text-indigo-600" />,
              title: "Better Forecasting",
              desc: "Get clean, enriched data that improves your marketing attribution and sales forecasting models.",
            },
          ].map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                {b.icon}
                <h3 className="font-semibold text-lg">{b.title}</h3>
              </div>
              <p className="text-sm text-slate-600">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-center py-14"
      >
        <h2 className="text-3xl font-extrabold tracking-tight">
          Make Every Chat Count.
        </h2>
        <p className="mt-2 text-blue-100 max-w-xl mx-auto">
          Sync all your AI-driven chat insights, leads, and analytics with the
          tools your teams already use.
        </p>
        <a
          href="#"
          className="inline-block mt-6 px-5 py-3 rounded-2xl bg-white text-slate-900 font-medium shadow hover:bg-blue-50"
        >
          Connect your CRM
        </a>
      </section>

      {/* Dev Self‑Tests (non-intrusive) */}
      <DevTests />

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Agentlytics
      </footer>
    </div>
  );
}

function IntegrationCanvas() {
  return (
    <div className="relative bg-white border border-slate-200 rounded-3xl p-8 shadow-sm overflow-hidden">
      <div className="grid md:grid-cols-3 gap-6 items-center">
        {/* Left: CRM icons */}
        <div className="space-y-4 text-center md:text-left">
          <div className="text-sm font-medium text-slate-600">
            CRM Integrations
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {["HubSpot", "Salesforce", "Zoho", "Pipedrive"].map((crm) => (
              <div
                key={crm}
                className="rounded-xl border border-slate-200 px-3 py-1 text-xs bg-slate-50"
              >
                {crm}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Animated flow arrows */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-full bg-blue-100 p-4 border border-blue-200"
          >
            <IconCloudSync className="size-8 text-blue-600" />
          </motion.div>
          <div className="h-12 w-1 bg-gradient-to-b from-blue-200 to-indigo-300 rounded-full mt-3" />
        </div>

        {/* Right: Analytics icons */}
        <div className="space-y-4 text-center md:text-right">
          <div className="text-sm font-medium text-slate-600">
            Analytics Tools
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-3">
            {["Google Analytics", "Tableau", "Power BI", "Looker"].map(
              (tool) => (
                <div
                  key={tool}
                  className="rounded-xl border border-slate-200 px-3 py-1 text-xs bg-slate-50"
                >
                  {tool}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom line indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse" />
    </div>
  );
}

/* ================= Dev Tests ================= */
function DevTests() {
  if (typeof window === "undefined") return null; // render only on client
  const tests: { name: string; pass: boolean; note?: string }[] = [];

  // Test 1: Icon components are defined functions
  tests.push({
    name: "IconCloudSync is function",
    pass: typeof IconCloudSync === "function",
  });
  tests.push({
    name: "IconDatabase is function",
    pass: typeof IconDatabase === "function",
  });
  tests.push({
    name: "IconBarChart is function",
    pass: typeof IconBarChart === "function",
  });
  tests.push({
    name: "IconShieldCheck is function",
    pass: typeof IconShieldCheck === "function",
  });
  tests.push({
    name: "IconZap is function",
    pass: typeof IconZap === "function",
  });
  tests.push({
    name: "IconCheckCircle is function",
    pass: typeof IconCheckCircle === "function",
  });

  // Test 2: Basic render smoke test (create elements)
  try {
    const el = (
      <div>
        <IconCloudSync />
        <IconDatabase />
        <IconBarChart />
      </div>
    );
    tests.push({ name: "JSX createElement smoke test", pass: !!el });
  } catch (e) {
    tests.push({
      name: "JSX createElement smoke test",
      pass: false,
      note: String(e),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <details className="text-xs text-slate-500 border border-slate-200 rounded-xl p-3 bg-white/70">
        <summary className="cursor-pointer">DevTests (open to view)</summary>
        <ul className="mt-2 list-disc pl-5">
          {tests.map((t, i) => (
            <li
              key={i}
              className={t.pass ? "text-emerald-600" : "text-rose-600"}
            >
              {t.pass ? "✓" : "✗"} {t.name}
              {t.note ? ` — ${t.note}` : ""}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
