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
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm" />
            <span className="font-semibold tracking-tight">Agentlytics</span>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-600">
              Built‑in Scheduling
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
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Built‑in Scheduling —
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Let Customers Pick Their Slot
            </span>
          </h1>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Give your website visitors a simple, interactive way to select their
            preferred date and time for a call — right inside chat. Once they
            pick a slot, your team receives the request and manually assigns it
            internally.
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
        <div className="mx-auto max-w-xl mt-10 p-6 border border-slate-200 bg-white rounded-3xl shadow-sm">
          <SchedulerCanvas />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10">
          Why Businesses Love It
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <CalendarCheck2 className="size-6 text-blue-600" />,
              title: "Fewer Missed Leads",
              desc: "Capture customer interest instantly when it’s at its peak — right inside chat. No external links, no friction.",
            },
            {
              icon: <Clock className="size-6 text-indigo-600" />,
              title: "Flexible Scheduling",
              desc: "Let customers choose their preferred time slots, while your team manages assignments manually in the backend.",
            },
            {
              icon: <Users className="size-6 text-cyan-600" />,
              title: "Better Coordination",
              desc: "Every selected slot is logged and shared with your internal team, so they can plan and follow up effectively.",
            },
            {
              icon: <ThumbsUp className="size-6 text-green-600" />,
              title: "Improved Experience",
              desc: "Customers feel acknowledged immediately with an instant acknowledgment message confirming their booking request.",
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
        className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-center py-14 mt-16"
      >
        <h2 className="text-3xl font-extrabold tracking-tight">
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
          Try it now
        </a>
      </section>

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Agentlytics
      </footer>
    </div>
  );
}

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
          text="Sure! Please select your preferred date and time below. Our team will confirm your booking manually."
        />

        {/* Date and time picker inside chat */}
        <div className="flex justify-start">
          <div className="max-w-[95%] w-full rounded-2xl border bg-white border-slate-200 px-3 py-3 text-sm shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Globe className="size-3.5" />
              <span>Asia/Kolkata (auto)</span>
            </div>

            {/* date buttons */}
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

            {/* time slots */}
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

            <button className="mt-4 w-full rounded-xl bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 flex items-center justify-center gap-1">
              Submit preferred slot <ChevronRight className="size-4" />
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

function Chat({ who, text }: { who: "ai" | "user"; text: string }) {
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
