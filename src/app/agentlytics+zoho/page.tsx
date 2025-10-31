"use client";
import { motion } from "framer-motion";

// Lightweight local UI primitives to avoid external modules
function Button({ children, className = "", ...props }: any) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-md transition ${className}`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }: any) {
  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>{children}</div>
  );
}

function CardContent({ children, className = "" }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

// Zoho SalesIQ-inspired palette
// Peach background: #FCE9E3 / #FDF3EF
// Primary accent (red/coral): #E94F2E
// Dark accent: #C53E20
// Soft table header: #FBE2DA

export default function ZohoComparisonPage() {
  return (
    <div className="bg-[#FCE9E3] text-gray-900 font-inter">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold leading-tight text-black"
        >
          Zoho Knows Your CRM.{" "}
          <span className="text-[#E94F2E]">
            Agentlytics Knows Your Visitors.
          </span>
        </motion.h1>

        <p className="mt-6 text-lg text-gray-800 max-w-2xl mx-auto">
          Zoho SalesIQ helps you see who’s in your CRM. <br />
          Agentlytics shows you why they’re here now. It reads real-time
          behavior and intent signals — scrolls, hesitation, revisits — to start
          the right conversation before a lead ever fills a form.
        </p>

        <p className="mt-6 text-[#E94F2E] font-semibold">
          ⚡ Teams switching from Zoho SalesIQ see a 32% higher
          conversion-to-meeting rate and 45% faster response time after adopting
          Agentlytics’ AI-Tied Intent engine.
        </p>

        <p className="mt-6 text-gray-800 italic">
          🕒 CRM data tells you who someone is — but by the time you act, their
          intent is gone.
        </p>

        <div className="mt-8 space-y-3">
          <p className="text-gray-900 font-medium">
            💡 Turn every CRM record into a live conversation.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Button className="bg-[#E94F2E] hover:bg-[#C53E20] text-white rounded-md px-6 py-3 text-lg shadow-lg transition">
              Start Free Trial
            </Button>
            <Button className="bg-white border border-[#E94F2E] text-[#E94F2E] hover:bg-[#FDECE8] rounded-md px-6 py-3 text-lg transition">
              Book a Comparison Demo
            </Button>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            🚀 Start Free — Engage High-Intent Visitors in Minutes | No Card
            Required
          </p>
        </div>

        {/* VISUAL STORYTELLING */}
        <div className="relative mt-16 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1 bg-white shadow-md rounded-xl p-6 text-left">
            <h3 className="font-semibold text-[#E94F2E] mb-2">
              Visitor Signals
            </h3>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Scroll depth</li>
              <li>Click patterns</li>
              <li>Dwell/hesitation</li>
              <li>Revisits</li>
            </ul>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="md:col-span-1 flex justify-center"
          >
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-[#E94F2E]/20 animate-ping"></div>
              <div className="absolute inset-2 rounded-full bg-[#E94F2E]/30 blur"></div>
              <div className="absolute inset-4 rounded-full bg-[#E94F2E]"></div>
            </div>
          </motion.div>
          <div className="md:col-span-1 bg-white shadow-md rounded-xl p-6 text-left">
            <h3 className="font-semibold text-[#C53E20] mb-2">
              Agentlytics Prompt
            </h3>
            <p className="text-sm text-gray-700">
              AI auto-initiates:{" "}
              <span className="italic">
                “Need help choosing the right plan?”
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Page Menu */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-2 flex gap-4 overflow-x-auto text-sm text-gray-800">
          <a href="#overview" className="px-2 py-1 hover:text-black">Overview</a>
          <a href="#switch" className="px-2 py-1 hover:text-black">Why Switch</a>
          <a href="#engine" className="px-2 py-1 hover:text-black">Intent Engine</a>
          <a href="#outcomes" className="px-2 py-1 hover:text-black">Outcomes</a>
          <a href="#integrations" className="px-2 py-1 hover:text-black">Integrations</a>
        </div>
      </div>

      {/* QUICK OVERVIEW TABLE */}
      <section id="overview" className="bg-[#FDF3EF] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#E94F2E] mb-10">
            🔍 Quick Overview
          </h2>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#FBE2DA] text-[#7A271A]">
                <tr>
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold">Agentlytics</th>
                  <th className="p-4 font-semibold">Zoho SalesIQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800 bg-white">
                {[
                  [
                    "Core Approach",
                    "Behavior + Intent AI across lifecycle",
                    "CRM-linked visitor tracking",
                  ],
                  [
                    "Trigger Logic",
                    "Predictive behavior signals",
                    "Rule-based conditions",
                  ],
                  [
                    "Context Source",
                    "Real-time actions + conversation memory",
                    "CRM fields and lead score",
                  ],
                  [
                    "Lifecycle Coverage",
                    "Lead → Onboard → Support → Renew",
                    "Marketing & Support",
                  ],
                  [
                    "Personalization",
                    "Dynamic tone + journey-aware messaging",
                    "Predefined chat scripts",
                  ],
                  [
                    "Integration Flexibility",
                    "Works with HubSpot, Salesforce, Zoho CRM, Calendly",
                    "Limited to Zoho ecosystem",
                  ],
                  [
                    "AI Learning",
                    "Self-optimizing conversation engine",
                    "Manual workflow tuning",
                  ],
                  [
                    "Analytics",
                    "Intent heatmaps + drop-off reasons",
                    "Visitor tracking + chat volume",
                  ],
                ].map(([feature, a, z]) => (
                  <tr key={feature} className="hover:bg-[#FFF6F3] transition">
                    <td className="p-4 font-medium">{feature}</td>
                    <td className="p-4">{a}</td>
                    <td className="p-4">{z}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* WHY TEAMS SWITCH */}
      <section id="switch" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-[#E94F2E] mb-10">
          💡 Why Teams Switch from Zoho SalesIQ to Agentlytics
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            [
              "CRM Visibility vs Visitor Intent",
              "Zoho shows static records. Agentlytics shows live intent — who’s ready to buy, who’s hesitating, and why they’re leaving.",
            ],
            [
              "From Reactive Monitoring to Proactive Engagement",
              "Agentlytics auto-initiates contextual chat with BANT-based qualification instead of waiting for reps to notice.",
            ],
            [
              "AI That Understands the Journey",
              "Agentlytics adapts tone and goals automatically based on visitor stage — awareness, trial, adoption.",
            ],
            [
              "Cross-Platform Freedom",
              "Agentlytics isn’t locked to CRM. It works across marketing, sales, and support stacks.",
            ],
            [
              "Zoho Alternative for SaaS Teams",
              "Purpose-built for SaaS and mid-market growth teams seeking AI-powered lifecycle automation beyond CRM limitations.",
            ],
          ].map(([title, desc]) => (
            <Card
              key={title}
              className="shadow-md rounded-2xl border border-[#FBE2DA] bg-white hover:shadow-lg transition"
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#C53E20] mb-2">
                  {title}
                </h3>
                <p className="text-gray-800">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* INSIDE INTENT ENGINE */}
      <section id="engine" className="bg-[#FDF3EF] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#E94F2E] mb-10">
            🧠 Inside the Intent Engine
          </h2>
          <div className="overflow-x-auto rounded-xl shadow">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#FBE2DA] text-[#7A271A]">
                <tr>
                  <th className="p-4 font-semibold">Layer</th>
                  <th className="p-4 font-semibold">Function</th>
                  <th className="p-4 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800 bg-white">
                {[
                  [
                    "Intent Signals",
                    "Detects focus time, scroll depth, exit intent",
                    "“Looks like you’re comparing Enterprise vs Pro — need help?”",
                  ],
                  [
                    "Behavioral Memory",
                    "Remembers returning users and last interactions",
                    "“Welcome back! Ready to finalize your demo?”",
                  ],
                  [
                    "Smart Qualification",
                    "Applies BANT logic automatically",
                    "“Do you handle purchasing for your team?”",
                  ],
                  [
                    "Adaptive Routing",
                    "Routes based on intent score and journey stage",
                    "High intent → SDR chat; Low intent → nurture sequence",
                  ],
                ].map(([layer, func, ex]) => (
                  <tr key={layer} className="hover:bg-[#FFF6F3]">
                    <td className="p-4 font-medium">{layer}</td>
                    <td className="p-4">{func}</td>
                    <td className="p-4 italic text-gray-700">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* OUTCOMES & TESTIMONIALS */}
      <section id="outcomes" className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-[#E94F2E] mb-10">
          📈 Real Outcomes
        </h2>
        <p className="text-lg text-gray-800 mb-8 max-w-3xl mx-auto">
          “We used Zoho for years but never knew who was ready to convert until
          it was too late. Agentlytics pinpoints intent instantly.”
          <br />—{" "}
          <span className="font-semibold">
            Head of Demand Gen, B2B Software Co.
          </span>
        </p>
        <p className="text-lg text-gray-800 mb-8 max-w-3xl mx-auto">
          “It’s like our CRM and chat had a brain transplant — suddenly
          everything talks to each other in real time.”
          <br />—{" "}
          <span className="font-semibold">VP Sales Ops, Enterprise SaaS</span>
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            ["CloudScale", "+32% more meetings booked"],
            ["FinServe", "-40% chat response lag"],
            ["TechFlow", "+28% faster lead qualification"],
          ].map(([company, result]) => (
            <Card
              key={company}
              className="rounded-2xl border border-[#FBE2DA] bg-white hover:shadow-lg transition"
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-[#C53E20]">
                  {company}
                </h3>
                <p className="text-gray-800">{result}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-10 text-gray-700">
          🌟 Trusted by CloudScale, FinServe, TechFlow, and 100+ Growth Teams
        </p>
      </section>

      {/* INTEGRATION SECTION */}
      <section id="integrations" className="bg-[#FDF3EF] py-20 text-center">
        <h2 className="text-3xl font-bold text-[#E94F2E] mb-10">
          🧩 Works with Your Stack
        </h2>
        <p className="text-gray-800 mb-8">
          Integrates with: HubSpot • Salesforce • Zoho CRM{" "}
          <span className="bg-white px-2 py-1 rounded text-sm font-medium text-[#E94F2E]">
            Works with Zoho CRM
          </span>{" "}
          • Slack • Calendly • Google Analytics
        </p>
        <p className="text-gray-700 mb-10">
          Add-Ons: AI Intent Heatmap Module • CRM Sync Optimizer • SDR Routing
          Automation
        </p>
        <div className="flex justify-center gap-4">
          <Button className="bg-[#E94F2E] hover:bg-[#C53E20] text-white rounded-md px-6 py-3 text-lg shadow-lg transition">
            Start Free — Engage Visitors Automatically
          </Button>
          <Button className="bg-white border border-[#E94F2E] text-[#E94F2E] hover:bg-[#FDECE8] rounded-md px-6 py-3 text-lg transition">
            Book a Comparison Demo
          </Button>
        </div>
        <p className="text-sm text-gray-700 mt-4">
          “See how Agentlytics turns CRM data into live conversations and closed
          deals.”
        </p>
      </section>
    </div>
  );
}
