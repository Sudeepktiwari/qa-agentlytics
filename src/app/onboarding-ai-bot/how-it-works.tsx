"use client";
import React from "react";
// Shared props type for inline SVG icon components
type IconProps = React.SVGProps<SVGSVGElement>;

// Props for step data and card
interface StepData {
  title: string;
  subtitle: string;
  bullets?: string[];
  icon: React.ReactNode;
  gradient: string;
}

interface StepCardProps extends StepData {
  index: number;
}

/**
 * Docs → Done — Illustration Preview
 * Illustration-style, animated horizontal process with a glowing final "Agent Live" card.
 * - TailwindCSS expected
 * - No Node-only APIs; accessible; reduced-motion aware
 */

/* ----------------------------- Inline Icons ------------------------------ */
const IcoUpload = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M5 20h14v-2H5v2zm7-16-5 5h3v6h4v-6h3l-5-5z" />
  </svg>
);
const IcoCog = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.056 7.056 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 14.4 1h-3.8a.5.5 0 0 0-.49.4l-.36 2.54c-.57.22-1.11.52-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.3 7.86a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.42 13.5a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.32.62.22l2.39-.96c.51.41 1.06.72 1.63.94l.36 2.54c.06.24.26.4.49.4h3.8c.24 0 .44-.16.49-.4l.36-2.54c.57-.22 1.11-.52 1.63-.94l2.39.96c.23.09.49 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.02-1.56ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z"
    />
  </svg>
);
const IcoRocket = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M12 2c3.87 0 7 3.13 7 7 0 5-5 10-7 13-2-3-7-8-7-13 0-3.87 3.13-7 7-7zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 21l3-1-2-2-1 3z"
    />
  </svg>
);
const IcoBot = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M11 2h2v2h3a2 2 0 0 1 2 2v2h2v2h-2v6a2 2 0 0 1-2 2h-3v2h-2v-2H8a2 2 0 0 1-2-2v-6H4V8h2V6a2 2 0 0 1 2-2h3V2zm-3 8h2v2H8v-2zm6 0h2v2h-2v-2z"
    />
  </svg>
);
const IcoCheck = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M20 6L9 17l-5-5 1.5-1.5L9 14l9.5-9.5z" />
  </svg>
);

/* ---------------------------- Animation Styles ---------------------------- */
const AnimStyles = () => (
  <style>{`
    @keyframes glowPulse { 0%,100%{ box-shadow: 0 0 0 0 rgba(34,197,94,.45);} 50%{ box-shadow: 0 0 0 12px rgba(34,197,94,.0);} }
    @keyframes floatUp { 0%{ transform: translateY(6px); opacity:.9;} 50%{ transform: translateY(-6px); opacity:1;} 100%{ transform: translateY(6px); opacity:.9;} }
    @keyframes slideIn { from { transform: translateX(16px); opacity: 0;} to { transform: translateX(0); opacity: 1;} }
    @keyframes dashFlow { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
    .anim-slide { animation: slideIn .7s ease both; }
    .anim-float { animation: floatUp 3.5s ease-in-out infinite; }
    .anim-glow { animation: glowPulse 2s ease-in-out infinite; }
    .dash { stroke-dasharray: 6 6; }
    @media (prefers-reduced-motion: reduce) {
      .anim-slide, .anim-float, .anim-glow { animation: none !important; }
    }
  `}</style>
);

/* ---------------------------- Step Card Component ---------------------------- */
function StepCard({
  index,
  title,
  subtitle,
  icon,
  bullets,
  gradient,
}: StepCardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 anim-slide`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="absolute -top-3 -left-3 h-10 w-10 rounded-xl grid place-items-center text-white shadow-sm"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div className="pl-10">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          Step {index + 1}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {subtitle}
        </p>
        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <IcoCheck className="text-emerald-600 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Connector (SVG) ----------------------------- */
function Connector({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 260 90"
      className="hidden lg:block w-full h-[90px]"
      aria-hidden
    >
      <defs>
        <linearGradient id="gLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      <path
        d={
          flip
            ? "M10 45 C 90 10, 170 10, 250 45"
            : "M10 45 C 90 80, 170 80, 250 45"
        }
        fill="none"
        stroke="url(#gLine)"
        strokeWidth="2"
        className="dash"
        style={{ animation: "dashFlow 2.2s linear infinite" }}
      />
      <circle cx="10" cy="45" r="4" fill="#2563EB" />
      <circle cx="250" cy="45" r="4" fill="#10B981" />
    </svg>
  );
}

/* ------------------------------ Live Agent Card ----------------------------- */
function LiveAgentCard() {
  return (
    <div className="relative rounded-2xl border border-emerald-300/60 dark:border-emerald-400/30 bg-emerald-50/70 dark:bg-emerald-500/10 p-6 overflow-hidden">
      <div
        className="absolute -inset-1 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 blur-2xl"
        aria-hidden
      />
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white grid place-items-center anim-glow">
          <IcoBot />
        </div>
        <div>
          <div className="text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Your AI Onboarding Agent
          </div>
          <div className="text-xl font-bold">Live and guiding users now</div>
          <div className="text-sm text-emerald-800/90 dark:text-emerald-200/90">
            Answers questions, verifies steps, and drives activation —
            automatically.
          </div>
        </div>
      </div>
      {/* Chat bubble shimmer */}
      <div className="relative mt-4 grid gap-2 max-w-md">
        <div className="rounded-xl bg-white/80 dark:bg-white/10 border border-white/50 dark:border-white/10 p-3 anim-float">
          <div className="text-xs text-gray-500">Agent</div>
          <div className="text-sm">
            Need help connecting your webhook? I can test it for you.
          </div>
        </div>
        <div
          className="rounded-xl bg-emerald-100/80 dark:bg-emerald-400/10 border border-emerald-200/60 dark:border-emerald-400/20 p-3 anim-float"
          style={{ animationDelay: "250ms" }}
        >
          <div className="text-xs text-gray-600 dark:text-gray-300">User</div>
          <div className="text-sm">Yes, please run a test ping.</div>
        </div>
        <div
          className="rounded-xl bg-white/80 dark:bg-white/10 border border-white/50 dark:border-white/10 p-3 anim-float"
          style={{ animationDelay: "500ms" }}
        >
          <div className="text-xs text-gray-500">Agent</div>
          <div className="text-sm">
            Verification passed ✅ You’re good to go.
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Section -------------------------------- */
function DocsToDoneIllustration() {
  const steps: StepData[] = [
    {
      title: "Upload or connect your docs",
      subtitle: "Paste a URL or drop files — PDF, Markdown, OpenAPI, Postman.",
      bullets: [
        "Understands auth & environments",
        "Reads prerequisites & rate limits",
      ],
      icon: <IcoUpload />,
      gradient: "linear-gradient(135deg,#3B82F6,#06B6D4)",
    },
    {
      title: "We auto-build the flow",
      subtitle:
        "We convert prose and specs into steps with dependencies and checks.",
      bullets: [
        "Extracts endpoints, params, scopes",
        "Builds dependency graph & validations",
      ],
      icon: <IcoCog />,
      gradient: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    },
    {
      title: "Review, edit, and publish",
      subtitle:
        "Tweak copy or constraints, then publish your guide in one click.",
      bullets: ["Smart prompts & fallbacks", "Live verification of key steps"],
      icon: <IcoRocket />,
      gradient: "linear-gradient(135deg,#10B981,#34D399)",
    },
  ];

  return (
    <section
      aria-labelledby="docs-done-title"
      className="mx-auto max-w-7xl px-4 sm:px-6 py-16"
    >
      <AnimStyles />

      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-900 px-3 py-1 text-2xl md:text-3xl font-bold ring-1 ring-blue-100">
          How it works
        </span>
        <h2
          id="docs-done-title"
          className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight"
        >
          From docs → done, in three easy steps
        </h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Upload once. Our system parses your onboarding docs, builds the flow,
          and your AI agent goes live.
        </p>
      </div>

      {/* Horizontal process (cards + connectors) */}
      <div className="mt-10 grid gap-4 lg:grid-cols-[1fr,auto,1fr,auto,1fr] items-center">
        <StepCard index={0} {...steps[0]} />
        <Connector />
        <StepCard index={1} {...steps[1]} />
        <Connector flip />
        <StepCard index={2} {...steps[2]} />
      </div>

      {/* Finale: Agent Live */}
      <div className="mt-10">
        <LiveAgentCard />
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href="#"
          className="px-5 py-3 text-sm font-semibold rounded-xl text-white"
          style={{ background: "#0062FF" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#004FCC")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#0062FF")}
        >
          Go Live — Your Agent’s Ready
        </a>
        <a
          href="#"
          className="px-5 py-3 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/10"
        >
          Try with a Sample Doc
        </a>
        <span className="text-xs text-gray-500">
          14‑day free trial · No credit card
        </span>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  return (
    <div className="dark min-h-screen bg-white text-gray-900 dark:bg-[#0a0f25] dark:text-gray-100">
      <main className="py-10">
        <DocsToDoneIllustration />
      </main>
    </div>
  );
}
