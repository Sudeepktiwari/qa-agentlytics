"use client";
import { useEffect, useRef, useState } from "react";
export default function AgentlyticsVsFreshchat() {
  // Page-specific sticky menu state
  const [scrolled, setScrolled] = useState(false);
  const [floating, setFloating] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") setScrolled(window.scrollY > 8);
    };
    const updateHeaderHeight = () => {
      if (headerRef.current)
        setHeaderHeight(headerRef.current.offsetHeight || 64);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", updateHeaderHeight);
      updateHeaderHeight();

      // Observe header size changes (e.g., wrapping to two lines)
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
  useEffect(() => {
    if (headerRef.current)
      setHeaderHeight(headerRef.current.offsetHeight || 64);
  }, [scrolled]);
  // Intercom-style header handoff: floating follows scrolled
  useEffect(() => {
    setFloating(scrolled);
  }, [scrolled]);
  return (
    <div className="bg-[#F8FAFF] text-gray-800 font-sans">
      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-[#0B1220] via-[#0E1B2A] to-[#102235] py-24 text-white"
        data-testid="hero"
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            data-testid="headline"
          >
            Freshchat Automates Replies. <br />
            <span className="text-white">Agentlytics Automates Outcomes.</span>
          </h1>
          <p
            className="mt-6 text-lg text-gray-200 max-w-3xl mx-auto"
            data-testid="subheadline"
          >
            Freshchat helps small teams manage conversations. <br />
            Agentlytics helps fast-growing SaaS teams detect intent, act
            instantly, and guide every visitor from curiosity to conversion.{" "}
            <br />
            Built for lifecycle engagement — from lead generation to onboarding
            and customer success.
          </p>

          <div
            className="mt-8 text-teal-200 font-semibold"
            data-testid="proof-hook"
          >
            ⚡ Teams switching from Freshchat see 39% higher activation rates
            and 2.1× faster response automation using Agentlytics’ adaptive AI
            layer.
          </div>

          <p
            className="mt-4 text-gray-300 text-md italic"
            data-testid="pain-line"
          >
            ⏳ Every delayed reply costs intent. Agentlytics makes sure it never
            happens again.
          </p>

          <div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            data-testid="cta-group"
          >
            <button
              className="px-6 py-3 rounded-full bg-teal-500 text-[#0B1220] font-medium hover:bg-teal-400 transition"
              data-testid="cta-primary"
            >
              Start Free — Engage Visitors Automatically
            </button>
            <button
              className="px-6 py-3 rounded-full border border-white text-white hover:bg-white/10 font-medium transition"
              data-testid="cta-secondary"
            >
              Book a Comparison Demo
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-300" data-testid="microcopy">
            🚀 Start Free — Engage Visitors Automatically <br />
            💡 See why 100+ SaaS teams switched this quarter.
          </div>
        </div>

        {/* Split Visual */}
        <div
          className="mt-16 flex flex-col md:flex-row items-center justify-center gap-12 px-6"
          data-testid="split-visual"
        >
          <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="font-semibold text-[#2C63F4] mb-2">
              Freshchat View
            </h3>
            <p className="text-sm text-gray-500">
              “If user asks about pricing → send canned response.”
            </p>
            <div className="mt-6 text-center text-gray-400 italic">
              Static rule boxes • Manual workflows
            </div>
          </div>
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#2C63F4]/10 to-[#00BFA6]/10 rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="font-semibold text-[#00BFA6] mb-2">
              Agentlytics View
            </h3>
            <p className="text-sm text-gray-600">
              AI detects scroll depth and idle time → triggers live prompt:
              <br />
              <span className="italic text-[#2C63F4]">
                “Looks like you’re evaluating plans — need a quick walkthrough?”
              </span>
            </p>
            <div className="mt-6 text-center text-gray-400 italic">
              Behavior-driven • Adaptive engagement
            </div>
          </div>
        </div>
      </section>

      {/* Intercom-style dual headers: sticky below global, floating at top */}
      <header
        className={`${scrolled ? "top-0" : "top-16"} fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out ${floating ? "opacity-0 -translate-y-1 pointer-events-none" : "opacity-100 translate-y-0"}`}
        ref={headerRef}
      >
        <div className="w-full h-auto min-h-[56px] sm:h-16 sm:min-h-0 py-2 sm:py-0 flex items-center justify-center px-3">
          <nav
            className="max-w-6xl w-full mx-auto flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-3 gap-y-2 sm:gap-6 text-slate-700 text-sm transform md:translate-x-6"
          >
            <a href="#overview" className="px-2 py-1 hover:text-slate-900">Overview</a>
            <a href="#switch" className="px-2 py-1 hover:text-slate-900">Why Switch</a>
            <a href="#engine" className="px-2 py-1 hover:text-slate-900">AI Engine</a>
            <a href="#outcomes" className="px-2 py-1 hover:text-slate-900">Outcomes</a>
            <a href="#integrations" className="px-2 py-1 hover:text-slate-900">Integrations</a>
          </nav>
        </div>
      </header>
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top,opacity,transform] duration-300 ease-out ${floating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
      >
        <div className="w-full h-auto min-h-[56px] sm:h-16 sm:min-h-0 py-2 sm:py-0 flex items-center justify-center px-3">
          <nav
            className="max-w-6xl w-full mx-auto flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-3 gap-y-2 sm:gap-6 text-slate-700 text-sm transform md:translate-x-6"
          >
            <a href="#overview" className="px-2 py-1 hover:text-slate-900">Overview</a>
            <a href="#switch" className="px-2 py-1 hover:text-slate-900">Why Switch</a>
            <a href="#engine" className="px-2 py-1 hover:text-slate-900">AI Engine</a>
            <a href="#outcomes" className="px-2 py-1 hover:text-slate-900">Outcomes</a>
            <a href="#integrations" className="px-2 py-1 hover:text-slate-900">Integrations</a>
          </nav>
        </div>
      </header>
      {/* Spacer to prevent content hiding under floating header */}
      <div style={{ height: floating ? headerHeight : 0 }} />

      {/* QUICK OVERVIEW */}
      <section
        id="overview"
        className="py-20 bg-white"
        data-testid="quick-overview"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#2C63F4] mb-10">
            The Freshchat Alternative for SaaS Teams
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse border border-gray-200">
              <thead className="bg-[#F3F8FF] text-[#2C63F4]">
                <tr>
                  <th className="p-3 font-semibold">Feature</th>
                  <th className="p-3 font-semibold">Agentlytics</th>
                  <th className="p-3 font-semibold">Freshchat (Freshworks)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {[
                  [
                    "Core Approach",
                    "Smart triggers from behavioral data",
                    "Rule-based workflows",
                  ],
                  [
                    "AI Intelligence",
                    "Adaptive learning across sessions",
                    "Predefined response rules",
                  ],
                  [
                    "Lifecycle Coverage",
                    "Lead → Onboard → Support → Retain",
                    "Primarily sales & support",
                  ],
                  [
                    "Personalization",
                    "Context memory + intent scoring",
                    "Static canned replies",
                  ],
                  [
                    "Setup Time",
                    "Go live in 10 minutes",
                    "Manual playbook setup",
                  ],
                  [
                    "Automation Depth",
                    "Dynamic playbooks, self-learning",
                    "Fixed if/then routing",
                  ],
                  [
                    "Integrations",
                    "HubSpot, Salesforce, Intercom, Calendly, Slack",
                    "Freshworks ecosystem only",
                  ],
                  [
                    "Reporting",
                    "Sentiment, intent, and drop-off heatmaps",
                    "Chat performance metrics",
                  ],
                ].map(([feature, ag, fr], i) => (
                  <tr key={i}>
                    <td className="p-3 font-medium">{feature}</td>
                    <td className="p-3 text-[#00BFA6] font-semibold">{ag}</td>
                    <td className="p-3 text-gray-600">{fr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* WHY TEAMS SWITCH */}
      <section
        id="switch"
        className="py-20 bg-[#F8FAFF]"
        data-testid="why-switch"
      >
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <h2 className="text-3xl font-bold text-center text-[#2C63F4]">
            💡 Why Teams Switch from Freshchat to Agentlytics
          </h2>
          {[
            {
              title: "1. From Rules to Real-Time Adaptation",
              desc: "Freshchat automates responses based on fixed conditions. Agentlytics learns from visitor behavior — scrolls, hesitations, revisit frequency — to engage at the right moment.",
            },
            {
              title: "2. From Replies to Results",
              desc: "Freshchat automates replies. Agentlytics automates outcomes — booked demos, activated accounts, retained customers.",
            },
            {
              title: "3. Beyond Support — Full Lifecycle Engagement",
              desc: "While Freshchat focuses on frontline support, Agentlytics unites marketing, sales, and CX by understanding each user’s journey and responding accordingly.",
            },
            {
              title: "4. Intelligence That Grows With Every Chat",
              desc: "Each interaction refines Agentlytics’ model — learning tone, sequence, and trigger timing for your audience over time.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold text-[#00BFA6]">
                {item.title}
              </h3>
              <p className="mt-2 text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ADAPTIVE AI ENGINE */}
      <section id="engine" className="py-20 bg-white" data-testid="engine">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#2C63F4] mb-10">
            🧠 Inside the Adaptive AI Engine
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-gray-200">
              <thead className="bg-[#F3F8FF] text-[#2C63F4]">
                <tr>
                  <th className="p-3 font-semibold">Layer</th>
                  <th className="p-3 font-semibold">Function</th>
                  <th className="p-3 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {[
                  [
                    "Behavioral Triggers",
                    "Detects hesitation, scroll depth, repeat visits",
                    "“Still exploring? Want a quick walkthrough?”",
                  ],
                  [
                    "Dynamic Prompting",
                    "Contextual replies based on journey stage",
                    "“Looks like you’re ready to connect calendars — need help?”",
                  ],
                  [
                    "Memory Layer",
                    "Recalls user preferences & past chats",
                    "“Welcome back! You were comparing Starter vs Pro last time.”",
                  ],
                  [
                    "Lifecycle Mode",
                    "Adapts tone & goals dynamically",
                    "“You’ve booked a demo — want setup guidance next?”",
                  ],
                ].map(([layer, func, ex], i) => (
                  <tr key={i}>
                    <td className="p-3 font-medium">{layer}</td>
                    <td className="p-3">{func}</td>
                    <td className="p-3 italic text-[#00BFA6]">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="outcomes"
        className="py-20 bg-[#F8FAFF]"
        data-testid="testimonials"
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#2C63F4] mb-10">
            📈 Real Outcomes
          </h2>
          <div className="space-y-6 text-gray-700">
            <p>
              “Freshchat worked fine for answering questions — Agentlytics
              started answering intent. We saw instant uplift in demo
              conversions.” <br />
              <span className="font-semibold text-[#00BFA6]">
                — Head of Growth, SaaS Startup
              </span>
            </p>
            <p>
              “Our small team couldn’t manage 24/7 engagement. Agentlytics
              filled the gap without adding headcount.” <br />
              <span className="font-semibold text-[#00BFA6]">
                — CX Lead, Mid-Market FinTech
              </span>
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              [
                "CloudScale",
                "Reduced response lag by 42% after switching from Freshchat.",
              ],
              ["FinServe", "Activated 28% more trial users in first month."],
              [
                "TechFlow",
                "AI detects user hesitation better than any bot we’ve tried.",
              ],
            ].map(([name, quote], i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
              >
                <p className="italic text-gray-600">“{quote}”</p>
                <div className="mt-4 font-semibold text-[#2C63F4]">
                  — {name}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-gray-700 font-medium">
            🌟 Trusted by <span className="text-[#00BFA6]">CloudScale</span>,{" "}
            <span className="text-[#00BFA6]">FinServe</span>,{" "}
            <span className="text-[#00BFA6]">TechFlow</span>, and 100+ Growth
            Teams
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section
        id="integrations"
        className="py-20 bg-white text-center"
        data-testid="integrations"
      >
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#2C63F4] mb-10">
            🧩 Works with Your Stack
          </h2>
          <p className="text-gray-700 mb-6">Integrates seamlessly with:</p>
          <div className="flex flex-wrap justify-center gap-4 text-[#00BFA6] font-semibold">
            {[
              "HubSpot",
              "Salesforce",
              "Intercom",
              "Slack",
              "Calendly",
              "Google Analytics",
            ].map((tool, i) => (
              <span key={i} className="px-4 py-2 bg-[#F3F8FF] rounded-full">
                {tool}
              </span>
            ))}
          </div>
          <div className="mt-8 text-gray-600">
            Add-ons: AI Trigger Mapper • Lifecycle Funnel Visualizer •
            Support-to-Sales Tracker
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="py-20 bg-gradient-to-br from-[#2C63F4] to-[#00BFA6] text-white text-center"
        data-testid="final-cta"
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">
            🚀 Ready to Go Beyond Automated Replies?
          </h2>
          <p className="mb-8 text-lg">
            Experience the difference between automation and adaptation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 rounded-full bg-white text-[#2C63F4] font-medium hover:bg-gray-100 transition">
              Start Free — Engage Visitors Automatically
            </button>
            <button className="px-6 py-3 rounded-full border border-white font-medium hover:bg-white/10 transition">
              Book a Comparison Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
