"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  ClipboardList,
  Timer,
  GaugeCircle,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  UserCheck,
  PhoneCall,
  ChartBarBig,
  Quote,
  Star,
} from "lucide-react";
import {
  SiGoogle,
  SiSlack,
  SiStripe,
  SiHubspot,
  SiSalesforce,
} from "react-icons/si";
import { TfiMicrosoftAlt } from "react-icons/tfi";
import { FaAws } from "react-icons/fa";

/**
 * Agentlytics – BANT-Based Qualification (FULL PAGE, UPDATED + FULL TESTIMONIALS)
 * - Next.js-ready single file
 * - TailwindCSS + framer-motion + lucide-react
 * - Adds pain line, proof logos, testimonial chips, a full Testimonials section, urgent CTAs, and animated lead score card
 * - Includes lightweight smoke tests to catch common syntax issues
 */

// 🔎 HOW-IT-WORKS data (pulled out so we can test it too)
const HOW_IT_WORKS = [
  {
    icon: <GaugeCircle className="size-6 text-blue-600" />,
    title: "Ask Contextually",
    text: "AI asks lightweight, conversational questions to infer B-A-N-T without feeling like a form.",
  },
  {
    icon: <ChartBarBig className="size-6 text-indigo-600" />,
    title: "Score & Prioritize",
    text: "Signals combine into an intent score. SQL thresholds are auto-tuned per funnel.",
  },
  {
    icon: <MessageSquare className="size-6 text-cyan-600" />,
    title: "Route & Sync",
    text: "Qualified leads are pushed to CRM, Slack, and scheduling — with transcript + BANT summary.",
  },
];

export default function BANTQualificationPage() {
  // 🧪 Smoke tests (run in browser only)
  useEffect(() => {
    try {
      console.assert(
        Array.isArray(faqs) && faqs.length >= 3,
        "FAQ list missing or too short"
      );
      console.assert(
        faqs.every(
          (f) =>
            typeof f.q === "string" && typeof f.a === "string" && f.q && f.a
        ),
        "Each FAQ item must have string q & a"
      );
      console.assert(
        Array.isArray(HOW_IT_WORKS) && HOW_IT_WORKS.length === 3,
        "HOW_IT_WORKS malformed"
      );
      console.assert(
        HOW_IT_WORKS.every(
          (s) => typeof s.text === "string" && !/\n$/.test(s.text)
        ),
        "HOW_IT_WORKS text contains an unexpected trailing newline"
      );
      console.assert(
        Array.isArray(flows) && flows.length === 3,
        "flows data missing"
      );
    } catch (e) {
      // Avoid throwing in production; just log
      console.warn("Smoke test warning:", e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-600">
              BANT-Based Qualification
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
              Start free — qualify smarter today.
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* background orbs */}
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute top-32 -left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-600 shadow-sm">
                <GaugeCircle className="size-3.5 text-blue-600" /> Real-time
                lead scoring
              </div>
              <h1 className="mt-4 text-4xl/tight sm:text-5xl/tight font-extrabold tracking-tight">
                BANT-Based Qualification —
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Identify Real Buyers Faster
                </span>
              </h1>

              {/* Pain line */}
              <p className="mt-3 text-slate-500 text-sm italic">
                “Your reps spend hours qualifying leads that never close.”
              </p>

              {/* Conversion microcopy */}
              <p className="mt-4 text-slate-700 max-w-xl">
                AI that knows{" "}
                <span className="font-semibold">which leads will buy</span>. It
                automatically uncovers Budget, Authority, Need, and Timeline
                in-chat, scores intent, and routes qualified leads to your CRM —
                no scripts to maintain.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#cta"
                  className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700"
                >
                  Start free — qualify smarter today.
                </a>
                <a
                  href="#demo"
                  className="px-5 py-3 rounded-2xl border border-slate-200 bg-white font-medium hover:bg-slate-50"
                >
                  Watch demo
                </a>
              </div>

              {/* Trust logos */}
              <TrustLogos />

              {/* BANT chips */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
                {[
                  {
                    icon: <BadgeDollarSign className="size-3.5" />,
                    label: "Budget",
                  },
                  {
                    icon: <UserCheck className="size-3.5" />,
                    label: "Authority",
                  },
                  {
                    icon: <ClipboardList className="size-3.5" />,
                    label: "Need",
                  },
                  { icon: <Timer className="size-3.5" />, label: "Timeline" },
                ].map((chip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm"
                  >
                    {chip.icon}
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Illustration – BANT Canvas with animated score card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <BANTCanvas />

                {/* Animated scorecard */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-4 right-4 bg-blue-50/90 backdrop-blur rounded-xl p-3 text-xs font-medium shadow border border-blue-200"
                >
                  <p className="text-slate-700">Lead Score</p>
                  <div className="mt-1 flex gap-2">
                    {["A", "B", "C"].map((g, i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.35,
                        }}
                        className={`size-7 rounded-md flex items-center justify-center font-semibold ${
                          g === "A"
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                        aria-label={`Lead grade ${g}`}
                      >
                        {g}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="learn"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                {s.icon}
                <h3 className="font-semibold text-lg">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* QUALIFICATION PLAYS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              AI Qualification Flow (Examples)
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              Illustrative flows the AI runs automatically — not manual
              playbooks. It adapts questions based on responses and context.
            </p>
          </div>

          <div className="mt-6 grid lg:grid-cols-3 gap-4">
            {flows.map((f, i) => (
              <FlowCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS + MICRO TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              kpi: "+28%",
              label: "SQL rate",
            },
            {
              kpi: "−44%",
              label: "SDR time/lead",
            },
            {
              kpi: "+19%",
              label: "Win rate",
            },
            {
              kpi: "<1 min",
              label: "Avg. qual time",
            },
          ].map((k, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-3xl font-extrabold tracking-tight">
                {k.kpi}
              </div>
              <div className="mt-1 text-sm text-slate-600">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tiny testimonial chips */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {[
            {
              quote: "Qualified more in 2 weeks than the last quarter.",
              name: "GTM Lead, SaaS",
            },
            {
              quote: "Reps only talk to buyers now — huge time saver.",
              name: "Head of Sales, DTC",
            },
            {
              quote: "Zero scripts to maintain. Set it and it learns.",
              name: "RevOps, Fintech",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <Quote className="size-4 text-indigo-600 mt-1" />
                <div>
                  <p className="text-sm text-slate-700">{t.quote}</p>
                  <p className="mt-2 text-xs text-slate-500">{t.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FULL TESTIMONIALS SECTION */}
      <TestimonialsSection />

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f, i) => (
            <details key={i} className="group p-5 open:bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                {f.q}
                <span className="ml-4 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 group-open:rotate-90 transition">
                  ›
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Qualify while they chat.
              </h2>
              <p className="mt-2 text-blue-100">
                Send hot leads to sales with BANT summaries and calendar links —
                completely automated.
              </p>
              <div className="mt-6 flex gap-3">
                <a
                  className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-medium shadow hover:bg-blue-50"
                  href="#"
                >
                  Start free — qualify smarter today.
                </a>
                <a
                  className="px-5 py-3 rounded-2xl border border-white/30 font-medium hover:bg-white/10"
                  href="#demo"
                >
                  Book a demo
                </a>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-white/10 p-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <MiniStat
                  icon={<BadgeDollarSign className="size-4" />}
                  title="Budget"
                  value="Inferred"
                />
                <MiniStat
                  icon={<UserCheck className="size-4" />}
                  title="Authority"
                  value="Verified"
                />
                <MiniStat
                  icon={<ClipboardList className="size-4" />}
                  title="Need"
                  value="Qualified"
                />
                <MiniStat
                  icon={<Timer className="size-4" />}
                  title="Timeline"
                  value="< 90 days"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Agentlytics
      </footer>
    </div>
  );
}

/* ===== Illustration Components ===== */
function BANTCanvas() {
  return (
    <div className="relative">
      {/* mock chat + right side score panel */}
      <div className="grid grid-cols-5 gap-4">
        {/* chat panel */}
        <div className="col-span-5 md:col-span-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-red-400" />
            <div className="size-2.5 rounded-full bg-yellow-400" />
            <div className="size-2.5 rounded-full bg-green-400" />
          </div>
          <div className="mt-4 space-y-3">
            <Bubble
              who="user"
              text="We’re exploring AI for our support team."
            />
            <Bubble
              who="ai"
              text="Happy to help! What’s your team size and current monthly ticket volume?"
            />
            <Bubble who="user" text="8 agents, ~4k tickets/month." />
            <Bubble
              who="ai"
              text="Got it. Do you already have budget approval for an AI project this quarter?"
            />
            <ChipRow
              items={["<$500/mo", "$500–$1.5k/mo", ">$1.5k+/mo"]}
              highlight={1}
            />
            <Bubble
              who="user"
              text="We can allocate around $1k/mo if the ROI is clear."
            />
            <Bubble
              who="ai"
              text="Understood. Who would sign off on the purchase?"
            />
            <ChipRow items={["Ops Manager", "CTO", "CEO"]} highlight={0} />
            <Bubble who="user" text="Operations Manager (me) + CTO." />
            <Bubble
              who="ai"
              text="Great. What problem are you hoping to solve first?"
            />
            <ChipRow
              items={["Deflection", "Lead capture", "Onboarding"]}
              highlight={0}
            />
            <Bubble
              who="user"
              text="Primarily deflection and faster responses."
            />
            <Bubble
              who="ai"
              text="Thanks! Last one — when do you plan to go live if it fits?"
            />
            <ChipRow
              items={["This month", "1–3 months", "> 3 months"]}
              highlight={1}
            />
            <Bubble who="user" text="Likely within 1–3 months." />
          </div>
        </div>

        {/* score panel */}
        <div className="col-span-5 md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">BANT Summary</h4>
            <span className="text-[10px] rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
              Auto-generated
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <ScoreTag
              icon={<BadgeDollarSign className="size-4 text-blue-600" />}
              label="Budget"
              value="$500–$1.5k"
              status="Good"
            />
            <ScoreTag
              icon={<UserCheck className="size-4 text-indigo-600" />}
              label="Authority"
              value="Ops + CTO"
              status="Strong"
            />
            <ScoreTag
              icon={<ClipboardList className="size-4 text-cyan-600" />}
              label="Need"
              value="Deflection"
              status="High"
            />
            <ScoreTag
              icon={<Timer className="size-4 text-emerald-600" />}
              label="Timeline"
              value="1–3 months"
              status="Soon"
            />
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <GaugeCircle className="size-4" />
              <span className="font-medium">Intent Score:</span>{" "}
              <span className="ml-1 font-semibold text-slate-900">82/100</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Rationale: budget in range, decision authority present, clear
              need, near-term timeline.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <RoutePill
              icon={<PhoneCall className="size-3.5" />}
              label="Sales notified"
            />
            <RoutePill
              icon={<MessageSquare className="size-3.5" />}
              label="Slack alert"
            />
            <RoutePill
              icon={<CheckCircle2 className="size-3.5" />}
              label="CRM synced"
            />
            <RoutePill
              icon={<ArrowRight className="size-3.5" />}
              label="Demo link sent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustLogos() {
  return (
    <div className="mt-8">
      <p className="text-xs uppercase text-slate-400 font-semibold mb-2">
        Trusted by GTM teams at
      </p>
      <div className="flex flex-wrap gap-6 items-center">
        <span title="Google" aria-label="Google" className="inline-flex items-center justify-center">
          <SiGoogle className="size-6 text-slate-500" />
        </span>
        <span title="Microsoft" aria-label="Microsoft" className="inline-flex items-center justify-center">
          <TfiMicrosoftAlt className="size-6 text-slate-500" />
        </span>
        <span title="AWS" aria-label="AWS" className="inline-flex items-center justify-center">
          <FaAws className="size-6 text-slate-500" />
        </span>
        <span title="Slack" aria-label="Slack" className="inline-flex items-center justify-center">
          <SiSlack className="size-6 text-slate-500" />
        </span>
        <span title="Stripe" aria-label="Stripe" className="inline-flex items-center justify-center">
          <SiStripe className="size-6 text-slate-500" />
        </span>
        <span title="HubSpot" aria-label="HubSpot" className="inline-flex items-center justify-center">
          <SiHubspot className="size-6 text-slate-500" />
        </span>
        <span title="Salesforce" aria-label="Salesforce" className="inline-flex items-center justify-center">
          <SiSalesforce className="size-6 text-slate-500" />
        </span>
      </div>
    </div>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="size-8 rounded-full bg-slate-100 text-slate-700 grid place-items-center font-semibold text-xs">
      {initials}
    </div>
  );
}

function TestimonialsSection() {
  const items: Array<{
    quote: string;
    name: string;
    role: string;
    rating: number;
  }> = [
    {
      quote: "Qualified more in 2 weeks than the last quarter.",
      name: "Aisha Khan",
      role: "GTM Lead, SaaS",
      rating: 5,
    },
    {
      quote: "Reps only talk to buyers now — huge time saver.",
      name: "Marcus Lee",
      role: "Head of Sales, DTC",
      rating: 5,
    },
    {
      quote: "Zero scripts to maintain. Set it and it learns.",
      name: "Priya Shah",
      role: "RevOps, Fintech",
      rating: 5,
    },
    {
      quote: "The BANT summaries drop straight into our CRM. Chef’s kiss.",
      name: "Diego Alvarez",
      role: "Sales Ops, B2B",
      rating: 5,
    },
    {
      quote: "Intent scores are scarily accurate. Fewer demos, higher close.",
      name: "Hannah Wright",
      role: "Founder, PLG SaaS",
      rating: 5,
    },
    {
      quote: "Went live in a day and it just… works.",
      name: "Kenji Tanaka",
      role: "Growth PM, eCom",
      rating: 5,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            What customers say
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Testimonials
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-amber-500">
          <Star className="size-5 fill-amber-400" />
          <Star className="size-5 fill-amber-400" />
          <Star className="size-5 fill-amber-400" />
          <Star className="size-5 fill-amber-400" />
          <Star className="size-5 fill-amber-400" />
          <span className="ml-2 text-sm text-slate-600">5.0 average</span>
        </div>
      </div>

      {/* cards */}
      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Quote className="size-4 text-indigo-600 mt-1" />
            </div>
            <blockquote className="mt-3 text-slate-700 text-sm">
              {t.quote}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <InitialAvatar name={t.name} />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {t.name}
                </div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      {/* small helper */}
      <p className="mt-6 text-xs text-slate-500">
        Avatars use initials for reliability. Logos are omitted in cards.
      </p>
    </section>
  );
}

function Bubble({ who, text }: { who: "ai" | "user"; text: string }) {
  const isAI = who === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl border ${
          isAI
            ? "bg-white border-slate-200"
            : "bg-blue-600 border-blue-600 text-white"
        } px-3 py-2 text-sm shadow-sm`}
      >
        {text}
      </div>
    </div>
  );
}

function ChipRow({
  items,
  highlight,
}: {
  items: string[];
  highlight?: number;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((t, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] shadow-sm ${
            i === highlight
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-slate-200 text-slate-600"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function ScoreTag({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {icon} <span className="font-medium text-slate-700">{label}</span>{" "}
        <span className="ml-auto rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
          {status}
        </span>
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function RoutePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 shadow-sm">
      {icon}
      {label}
    </div>
  );
}

function MiniStat({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/90 p-4 text-slate-900">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {icon} {title}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

const flows = [
  {
    icon: <BadgeDollarSign className="size-5 text-blue-600" />,
    title: "Budget in Range",
    desc: "If budget ≥ target tier and problem fit is clear → fast-track to demo scheduling.",
    lines: [
      "budget >= 500",
      "need == 'deflection'",
      "→ send demo picker + ROI snippet",
    ],
    badge: "AI-Optimized",
  },
  {
    icon: <UserCheck className="size-5 text-indigo-600" />,
    title: "Authority Verified",
    desc: "Decision maker present or approval chain confirmed → push summary to CRM + Slack.",
    lines: [
      "authority in ['CTO','Ops']",
      "intent_score > 75",
      "→ push CRM + Slack alert",
    ],
    badge: "Auto-Detected",
  },
  {
    icon: <Timer className="size-5 text-emerald-600" />,
    title: "Near-Term Timeline",
    desc: "Timeline ≤ 90 days with budget range set → surface success stories and book fit-check.",
    lines: ["timeline <= 90d", "budget in range", "→ show case study + demo"],
    badge: "Self-Tuning",
  },
];

function FlowCard({ icon, title, desc, lines, badge }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className="px-2.5 py-1 text-[10px] rounded-full border border-slate-200 bg-slate-50 text-slate-600">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 font-mono text-[11px] leading-relaxed text-slate-700">
        {lines.map((l: string, i: number) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "Do reps have to ask these questions manually?",
    a: "No. The AI asks conversationally and adapts based on answers; reps get a BANT summary + transcript in CRM.",
  },
  {
    q: "Is the BANT score configurable?",
    a: "You can set guardrails or thresholds, but the default model auto-tunes using your funnel performance.",
  },
  {
    q: "Where does the data go?",
    a: "Lead + BANT summary + intent score sync to your CRM and optional Slack channel. PII handling follows your data policy.",
  },
];
