"use client";
import { useEffect, useState, useRef } from "react";
export default function DriftComparisonPage() {
  // Brand palette inspired by Drift blue and neutral base
  const BRAND_BLUE = "#0A5BFF"; // Drift Blue per Brandfetch
  const BRAND_DARK = "#0B1020"; // deep navy for headings
  const BRAND_GRAY = "#0F172A"; // slate-like for body text

  // Match Agentforce sticky menu behavior
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") setScrolled(window.scrollY > 8);
    };
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight || 64);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", updateHeaderHeight);
      updateHeaderHeight();

      // Observe header size changes (e.g., wrapping to two lines) and update spacer height automatically
      let ro: ResizeObserver | null = null;
      if (headerRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver((entries) => {
          const rect = entries[0]?.contentRect;
          const next = rect?.height ?? headerRef.current?.offsetHeight ?? 64;
          setHeaderHeight(next);
        });
        ro.observe(headerRef.current);
      }

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", updateHeaderHeight);
        if (ro) ro.disconnect();
      };
    }
  }, []);

  // Also update height when sticky state toggles
  useEffect(() => {
    if (headerRef.current)
      setHeaderHeight(headerRef.current.offsetHeight || 64);
  }, [scrolled]);

  return (
    <div
      className="min-h-screen bg-white text-slate-800"
      style={{ "--brand": BRAND_BLUE } as React.CSSProperties}
    >
      {/* SEO / Metadata (works in Next.js; safe to keep for other setups) */}
      <head>
        <title>Agentlytics vs Drift | Proactive AI Alternative for SaaS</title>
        <meta
          name="description"
          content="Compare Agentlytics vs Drift — see how proactive AI detects intent, qualifies leads via BANT, and boosts demo bookings by 41%."
        />
        <meta property="og:title" content="Agentlytics vs Drift" />
        <meta
          property="og:description"
          content="Discover how proactive AI outperforms playbook-based chatbots for B2B SaaS teams."
        />
        <meta
          property="og:image:alt"
          content="Split view showing Drift’s static playbook vs Agentlytics’ proactive AI detection."
        />
      </head>

      {/* Page-specific menu to match Agentforce header */}
      <header
        className={`${
          scrolled ? "top-0" : "top-16"
        } fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top] duration-200`}
        ref={headerRef}
      >
        <div className="w-full h-auto min-h-[56px] sm:h-16 sm:min-h-0 py-3 sm:py-0 flex items-center justify-center relative md:right-[84px] px-3">
          <nav className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-3 gap-y-2 sm:gap-6 text-slate-600 text-sm">
            <a href="#overview" className="hover:text-slate-900">
              Overview
            </a>
            <a href="#switch" className="hover:text-slate-900">
              Why Switch
            </a>
            <a href="#brain" className="hover:text-slate-900">
              Proactive Brain
            </a>
            <a href="#outcomes" className="hover:text-slate-900">
              Outcomes
            </a>
            <a href="#integrations" className="hover:text-slate-900">
              Integrations
            </a>
          </nav>
        </div>
      </header>
      {/* Spacer to prevent content from hiding under fixed header when stuck */}
      <div style={{ height: scrolled ? headerHeight : 0 }} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              "radial-gradient(1200px 600px at 10% -10%, rgba(10,91,255,0.15), transparent 60%), radial-gradient(1200px 600px at 90% -20%, rgba(10,91,255,0.12), transparent 60%)",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs uppercase tracking-wide text-slate-600 bg-white/70 backdrop-blur">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: BRAND_BLUE }}
                />{" "}
                Drift‑style theme
              </p>

              <h1
                className="mt-4 text-4xl sm:text-5xl font-extrabold leading-tight"
                style={{ color: BRAND_DARK }}
              >
                Drift Waits for Form Fills.{" "}
                <span style={{ color: BRAND_BLUE }}>
                  Agentlytics Detects Intent Instantly.
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-700">
                Drift engages when visitors click.{" "}
                <br className="hidden sm:block" />
                Agentlytics engages when they think. By reading behavior
                patterns, Agentlytics detects high‑intent users, triggers
                tailored messages, qualifies them via BANT, and routes them to
                your SDR — before a form is ever filled.
                <span className="block mt-2 font-medium text-slate-900">
                  ⚠️ Every second of hesitation costs a demo.
                </span>
              </p>

              {/* Proof above CTA */}
              <div className="mt-6 flex items-center gap-3 text-sm font-semibold">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: BRAND_BLUE, color: "white" }}
                >
                  ⚡
                </span>
                <span className="text-slate-900">
                  Teams switching from Drift see{" "}
                  <span style={{ color: BRAND_BLUE }}>41% faster</span> demo
                  bookings and{" "}
                  <span style={{ color: BRAND_BLUE }}>28% higher</span>{" "}
                  qualified lead rates.
                </span>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#start"
                  className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-white shadow-sm transition hover:shadow-md"
                  style={{ background: BRAND_BLUE }}
                >
                  Start Free Trial
                  <span className="translate-x-0 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-slate-900 hover:bg-slate-50 transition"
                >
                  Book a Comparison Demo
                </a>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                🚀 Start engaging visitors automatically in minutes — 14‑day
                free trial, no card required.
              </p>
            </div>

            {/* Visual Suggestion (split view mock) */}
            <div className="relative">
              <div className="space-y-4 md:grid grid-cols-2 gap-4 ">
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-3">
                    Drift — Static Chat Flow
                  </div>
                  <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <div className="mb-2 text-sm">
                        Rule tree • if/then arrows
                      </div>
                      <div
                        className="mx-auto h-1 w-24 animate-pulse rounded-full"
                        style={{ background: BRAND_BLUE }}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 mb-3">
                    Agentlytics — Proactive Detection
                  </div>
                  <div className="aspect-[4/3] rounded-lg border bg-white relative overflow-hidden">
                    {/* Scroll tracking bar */}
                    <div
                      className="absolute left-0 top-0 h-1 w-0 animate-[grow_3s_ease-in-out_infinite]"
                      style={{ background: BRAND_BLUE }}
                    />
                    {/* Live bubble */}
                    <div className="absolute bottom-4 right-4 max-w-[220px] rounded-2xl border bg-white px-4 py-3 shadow-md">
                      <p className="text-sm">
                        Need help choosing the right plan?
                      </p>
                      <button
                        className="mt-2 text-sm font-semibold"
                        style={{ color: BRAND_BLUE }}
                      >
                        Compare plans →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* keyframes for the progress bar */}
              <style>{`
                @keyframes grow { 0%{width:0} 60%{width:85%} 100%{width:0} }
              `}</style>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Overview Table */}
      <section className="mx-auto max-w-7xl px-6 py-14" id="overview">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: BRAND_DARK }}
        >
          🔍 Quick Overview
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Feature</th>
                <th className="p-4">Agentlytics</th>
                <th className="p-4">Drift</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                [
                  "Core Approach",
                  "Behavior-triggered, proactive AI conversations",
                  "Rule-based playbooks and chat flows",
                ],
                [
                  "Qualification",
                  "BANT-based (Budget, Authority, Need, Timeline) auto-qualification",
                  "Manual question sequence",
                ],
                [
                  "Engagement Style",
                  "Lifecycle-aware (Lead → Onboarding → Support)",
                  "Marketing-focused",
                ],
                [
                  "Personalization",
                  "Context memory + persona switching",
                  "Static responses",
                ],
                [
                  "Analytics",
                  "Intent heatmaps, journey scoring, drop-off analysis",
                  "Chat volume metrics",
                ],
                [
                  "Routing",
                  "Smart SDR routing based on lead score",
                  "Basic rep assignment",
                ],
                [
                  "Setup Time",
                  "Go live in 10 minutes",
                  "Complex playbook setup",
                ],
                [
                  "Integration",
                  "Works with HubSpot, Salesforce, Intercom, Calendly",
                  "Primarily CRM-centric",
                ],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-4 font-medium text-slate-900">{row[0]}</td>
                  <td className="p-4">{row[1]}</td>
                  <td className="p-4">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why Teams Switch */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="switch">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: BRAND_DARK }}
        >
          💡 Why Teams Switch from Drift to Agentlytics
        </h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Static Playbooks vs Real-Time Behavior",
              body: "Drift relies on pre-written playbooks. Agentlytics detects real-time actions — scroll depth, hesitation, and idle time — to trigger the right conversation before visitors drop off.",
            },
            {
              title: "Conversational Marketing vs Conversational Intelligence",
              body: "Agentlytics doesn’t just ask; it understands. Each chat trains the AI to recognize buying signals, objections, and friction — making every interaction smarter than the last.",
            },
            {
              title: "From Lead Capture to Lifecycle Automation",
              body: "Drift stops at qualification. Agentlytics continues through onboarding and support, guiding users across the full customer journey with AI-driven workflows.",
            },
            {
              title: "Unified Dashboard for Sales & CX",
              body: "Track conversation intent, AI qualification score, and pipeline influence — all in one dashboard designed for Sales + Success alignment.",
            },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl border p-6 shadow-sm bg-white">
              <h3
                className="text-lg font-semibold"
                style={{ color: BRAND_DARK }}
              >
                {c.title}
              </h3>
              <p className="mt-2 text-slate-700">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Inside the Proactive Brain */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="brain">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: BRAND_DARK }}
        >
          🧠 Inside the Proactive Brain
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Layer</th>
                <th className="p-4">Function</th>
                <th className="p-4">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                [
                  "Intent Detection",
                  "Reads user scroll, click hesitation, or form abandonment",
                  "“Looks like you’re exploring pricing — want help comparing plans?”",
                ],
                [
                  "Smart Prompts",
                  "Suggests next steps automatically",
                  "“Want to see ROI for your use case?”",
                ],
                [
                  "Context Memory",
                  "Remembers answers for future steps",
                  "“I recall you mentioned a 20‑member team last visit.”",
                ],
                [
                  "Lifecycle Awareness",
                  "Adapts tone & goals per stage",
                  "Trial → Onboarding → Renewal",
                ],
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="p-4 font-medium">{row[0]}</td>
                  <td className="p-4">{row[1]}</td>
                  <td className="p-4">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Real Outcomes — Testimonial Carousel */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="outcomes">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: BRAND_DARK }}
        >
          📈 Real Outcomes
        </h2>
        <p className="mt-2 text-slate-700">
          “Our SDRs used to chase cold leads. With Agentlytics, 60% of booked
          demos now come from AI‑qualified conversations — not forms.” — Growth
          Manager, B2B SaaS
        </p>
        <p className="mt-2 text-slate-700">
          “It felt like adding a 24/7 SDR that knows exactly when to step in.
          Drift couldn’t match that depth.” — VP Sales, Enterprise Software
        </p>

        {/* Metrics row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ["+41%", "Faster Demo Bookings"],
            ["+28%", "Higher Qualified Leads"],
            ["-34%", "Drop in Idle Sessions"],
          ].map((m, i) => (
            <div
              key={i}
              className="rounded-2xl border p-6 text-center bg-white"
            >
              <div
                className="text-3xl font-extrabold"
                style={{ color: BRAND_BLUE }}
              >
                {m[0]}
              </div>
              <div className="mt-1 text-slate-600">{m[1]}</div>
            </div>
          ))}
        </div>

        {/* Logo row */}
        <div className="mt-10">
          <div className="text-sm font-semibold text-slate-500">
            🌟 Trusted by 100+ SaaS Growth Teams
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 items-center opacity-80">
            {[
              "CloudScale",
              "FinServe",
              "TechFlow",
              "BrightEdge",
              "SalesPilot",
            ].map((l, i) => (
              <div
                key={i}
                className="rounded-xl border p-4 text-center text-slate-600 bg-white"
              >
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Rotating testimonial cards with pause on hover */}
        <Carousel />
      </section>

      {/* Integrations & Add‑ons */}
      <section className="mx-auto max-w-7xl px-6 py-16" id="integrations">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: BRAND_DARK }}
        >
          🧩 Works with Your Stack
        </h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            "HubSpot",
            "Salesforce",
            "Slack",
            "Intercom",
            "Calendly",
            "Google Analytics",
          ].map((x, i) => (
            <div
              key={i}
              className="rounded-xl border bg-white px-4 py-3 text-center text-sm"
            >
              {x}
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            ["AI Playbook Importer", "Auto‑learns from Drift flows"],
            ["SDR Routing Intelligence", "Routes by score & availability"],
            ["Conversion Funnel Analyzer", "Finds drop‑offs & friction"],
          ].map((a, i) => (
            <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold" style={{ color: BRAND_DARK }}>
                {a[0]}
              </h3>
              <p className="mt-2 text-slate-700">{a[1]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative" id="cta">
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background: `linear-gradient(180deg, rgba(10,91,255,0.08), rgba(10,91,255,0.02))`,
          }}
        />
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold" style={{ color: BRAND_DARK }}>
            🚀 Ready to Engage Smarter?
          </h2>
          <p className="mt-3 text-slate-700">
            See how proactive AI replaces manual playbooks with measurable
            outcomes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#start"
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-white shadow-sm transition hover:shadow-md"
              style={{ background: BRAND_BLUE }}
            >
              Start Free — Go Live in 10 Minutes
              <span className="translate-x-0 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </a>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-slate-900 hover:bg-slate-50 transition"
            >
              Book a Comparison Demo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Agentlytics</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-700">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-700">
              Terms
            </a>
            <a href="#" className="hover:text-slate-700">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Carousel() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Only run auto-scroll on mobile viewports
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches;
    if (!isMobile) return;

    let rafId: number;
    let paused = false;
    const step = () => {
      if (!paused) {
        el.scrollLeft += 1; // ~60px/sec
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0; // loop back to start
        }
      }
      rafId = requestAnimationFrame(step);
    };

    const onPointerDown = () => {
      paused = true;
    };
    const onPointerUp = () => {
      paused = false;
    };

    rafId = requestAnimationFrame(step);
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);
  const items = [
    {
      logo: "CloudScale",
      quote:
        "“We replaced forms with Agentlytics and watched qualified demos jump.”",
      metric: "+41% faster demos",
    },
    {
      logo: "TechFlow",
      quote: "“It feels like a 24/7 SDR that engages at the perfect moment.”",
      metric: "+28% qualified leads",
    },
    {
      logo: "SalesPilot",
      quote:
        "“Proactive prompts reduced idle sessions across our pricing pages.”",
      metric: "-34% idle sessions",
    },
  ];

  return (
    <div className="mt-10">
      <div
        className="group relative overflow-x-auto sm:overflow-hidden rounded-2xl border bg-white"
        ref={containerRef}
      >
        <div className="flex gap-0 snap-x snap-mandatory sm:snap-none sm:animate-[slide_16s_linear_infinite] sm:group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, idx) => (
            <div
              key={idx}
              className="w-[60vw] sm:w-1/3 shrink-0 p-6 snap-center"
            >
              <div className="h-full rounded-xl border p-6 shadow-sm bg-white">
                <div className="text-xs font-semibold text-slate-500">
                  {item.logo}
                </div>
                <p className="mt-3 text-slate-800">{item.quote}</p>
                <div
                  className="mt-4 text-sm font-semibold"
                  style={{ color: "#0A5BFF" }}
                >
                  {item.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes slide { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
      <p className="mt-2 hidden sm:block text-xs text-slate-500">
        Hover to pause
      </p>
      <p className="mt-2 sm:hidden text-xs text-slate-500 text-center">
        Touch and hold to pause
      </p>
    </div>
  );
}
