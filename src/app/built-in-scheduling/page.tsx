"use client";
import { motion } from "framer-motion";
import {
  CalendarCheck2,
  Globe,
  ChevronRight,
  Clock,
  Users,
  ThumbsUp,
} from "lucide-react";

/**
 * Agentlytics – Built‑in Scheduling (Simplified with Benefits)
 * Updated to reflect that customers choose date/time and the business assigns calls manually.
 * Added Benefits section to enrich the page.
 */

export default function BuiltInSchedulingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10 text-center">
          <p className="text-sm text-blue-600 font-semibold mb-2">
            Every missed booking link is a lost opportunity. Keep prospects
            inside the chat.
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Built-in Scheduling —
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Let Customers Pick Their Slot
            </span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Let visitors choose a time — you confirm manually. No
            back-and-forth.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Teams using Agentlytics see 2.8× more call completions.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
              Try it free — start booking instantly
            </a>
          </div>
        </div>

        {/* Illustration */}
        <div className="mx-auto max-w-xl mt-10 p-4 md:p-6 border border-slate-200 bg-white rounded-3xl shadow-sm">
          <SchedulerCanvas />
        </div>
      </section>

      {/* LOGOS */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-slate-600 text-xs sm:text-sm uppercase tracking-wider">
          Trusted by growth and CX teams at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 mt-4 opacity-80">
          {["TechFlow", "CloudScale", "InnovateCorp"].map((logo, i) => (
            <div
              key={i}
              className="text-slate-500 text-base sm:text-lg font-semibold"
            >
              {logo}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
          What teams say
        </h2>
        <p className="text-center text-slate-600 mt-2 max-w-2xl mx-auto">
          Real stories from GTM and CX teams using Agentlytics to capture intent
          and reduce back‑and‑forth.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm h-full flex flex-col"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white grid place-items-center text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
              <p className="mt-4 text-slate-700 text-sm leading-relaxed">
                “{t.quote}”
              </p>
              <div className="mt-4 text-xs text-slate-500">{t.company}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-10">
          Why businesses love it
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                {b.icon}
                <h3 className="font-semibold text-lg">{b.title}</h3>
              </div>
              <p className="text-sm text-slate-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-center py-14 mt-4"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Collect availability effortlessly.
        </h2>
        <p className="mt-2 text-blue-100 max-w-xl mx-auto">
          Customers choose a date and time directly in chat. Your team takes it
          from there.
        </p>
        <a
          href="#"
          className="inline-block mt-6 px-5 py-3 rounded-2xl bg-white text-slate-900 font-medium shadow hover:bg-blue-50"
        >
          Try it free — start booking instantly
        </a>
      </section>

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Agentlytics
      </footer>
    </div>
  );
}

// ---------- DATA ----------
const benefits = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="size-6 text-blue-600 fill-current"
      >
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H5V10h14v8Zm0-10H5V6h14v2Z" />
      </svg>
    ),
    title: "Fewer Missed Leads",
    desc: "Capture interest at its peak — inside chat. No external links, no friction.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="size-6 text-indigo-600 fill-current"
      >
        <path d="M12 7a5 5 0 1 1 0 10A5 5 0 0 1 12 7Zm0-5a1 1 0 0 1 1 1v2.07A7.001 7.001 0 0 1 19.93 11H22a1 1 0 1 1 0 2h-2.07A7.001 7.001 0 0 1 13 19.93V22a1 1 0 1 1-2 0v-2.07A7.001 7.001 0 0 1 4.07 13H2a1 1 0 1 1 0-2h2.07A7.001 7.001 0 0 1 11 4.07V2a1 1 0 0 1 1-1Z" />
      </svg>
    ),
    title: "Flexible Scheduling",
    desc: "Customers pick preferred slots; your team assigns internally in the backend.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="size-6 text-cyan-600 fill-current"
      >
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3ZM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Zm8 0c-.29 0-.62.02-.97.05C16.4 13.5 18 14.34 18 17v2h6v-2c0-2.66-5.33-4-8-4Z" />
      </svg>
    ),
    title: "Better Coordination",
    desc: "Every selection is logged and shared so follow‑ups are timely and organized.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="size-6 text-green-600 fill-current"
      >
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 15-5-5 1.41-1.41L11 13.17l6.59-6.58L19 8l-8 9Z" />
      </svg>
    ),
    title: "Improved Experience",
    desc: "Instant acknowledgment reassures customers their request is received.",
  },
];

const testimonials = [
  {
    initials: "RS",
    name: "Riya Sharma",
    role: "Growth Lead",
    company: "TechFlow",
    quote:
      "We stopped losing prospects to calendar links. The in‑chat slot picker boosted completions immediately.",
  },
  {
    initials: "AD",
    name: "Arjun Desai",
    role: "Head of CX",
    company: "CloudScale",
    quote:
      "Our SDRs love it — clear availability from visitors, zero back‑and‑forth, and faster follow‑ups.",
  },
  {
    initials: "NP",
    name: "Nisha Patel",
    role: "RevOps Manager",
    company: "InnovateCorp",
    quote:
      "Moving scheduling inside chat lifted call completions by ~2.8× for us. Simple and effective.",
  },
];

// ---------- SUB‑COMPONENTS ----------
function SchedulerCanvas() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="flex items-center gap-2">
        <div className="size-2.5 rounded-full bg-red-400" />
        <div className="size-2.5 rounded-full bg-yellow-400" />
        <div className="size-2.5 rounded-full bg-green-400" />
      </div>

      <div className="mt-4 space-y-3">
        <Chat who="user" text="I’d like to schedule a quick consultation." />
        <Chat
          who="ai"
          text="Sure! Select your preferred date and time below. Our team will confirm manually."
        />

        {/* Date/Time picker inside chat */}
        <div className="flex justify-start">
          <div className="max-w-[95%] w-full rounded-2xl border bg-white border-slate-200 px-3 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="size-3.5 fill-current"
              >
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z" />
              </svg>
              <span>Asia/Kolkata (auto)</span>
            </div>

            {/* days */}
            <div className="mt-2 grid grid-cols-7 gap-2 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                <button
                  key={i}
                  className={`h-9 w-full rounded-full border px-3 text-[11px] font-medium leading-none flex items-center justify-center ${
                    i === 2
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* times */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                "9:00 AM",
                "9:30 AM",
                "10:00 AM",
                "10:30 AM",
                "11:00 AM",
                "11:30 AM",
              ].map((t, i) => (
                <button
                  key={i}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                    i === 2
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* animated submit */}
            <button className="mt-4 w-full rounded-xl bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 active:scale-[0.99] transition-transform">
              Submit preferred slot
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="ml-1 inline size-4 fill-current"
              >
                <path d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
              </svg>
            </button>
          </div>
        </div>

        <Chat
          who="user"
          text="Selected Wednesday 10:00 AM — Booking confirmed. Our team will contact you soon."
        />
      </div>
    </div>
  );
}

function Chat({ who, text }: { who: "user" | "ai"; text: string }) {
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
