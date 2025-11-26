"use client";
import Head from "next/head";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mobile menu with outside-click and Escape close
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const backdrop = document.getElementById("mobileMenuBackdrop");
    const toggleMenu = () => {
      mobileMenu?.classList.toggle("hidden");
      backdrop?.classList.toggle("hidden");
    };
    const closeMenu = () => {
      mobileMenu?.classList.add("hidden");
      backdrop?.classList.add("hidden");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    menuBtn?.addEventListener("click", toggleMenu);
    backdrop?.addEventListener("click", closeMenu);
    document.addEventListener("keydown", onKey);

    // Reveal on scroll
    const revObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            revObserver.unobserve(e.target as Element);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (!prefersReduced) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => revObserver.observe(el));
    }

    // How It Works interactions
    const howButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>("[data-how-step]")
    );
    const howViews = Array.from(
      document.querySelectorAll<HTMLElement>("[data-how-view]")
    );
    const howProgress = document.getElementById(
      "howProgress"
    ) as HTMLDivElement | null;
    const howIndex = document.getElementById(
      "howIndex"
    ) as HTMLSpanElement | null;
    const playHowBtn = document.getElementById(
      "playHow"
    ) as HTMLButtonElement | null;

    let howCurrent = 1;
    let howTimer: ReturnType<typeof setInterval> | null = null;

    function showHow(n: number) {
      howCurrent = n;
      howButtons.forEach((btn, i) => {
        btn.setAttribute("aria-selected", String(i === n - 1));
      });
      howViews.forEach((view, i) => {
        if (i === n - 1) {
          view.classList.remove("hidden");
          requestAnimationFrame(() => {
            view.classList.add("anim-fadeUp");
            (view.style as any).opacity = 1;
          });
        } else {
          view.classList.remove("anim-fadeUp");
          (view.style as any).opacity = "0";
          view.classList.add("hidden");
        }
      });
      const pct = (n - 1) / (howButtons.length - 1);
      if (howProgress) howProgress.style.height = `${pct * 100}%`;
      if (howIndex) howIndex.textContent = `${n}/${howButtons.length}`;
    }

    howButtons.forEach((btn) =>
      btn.addEventListener("click", () => showHow(Number(btn.dataset.howStep)))
    );

    function playHow() {
      if (!playHowBtn) return;
      if (howTimer) {
        clearInterval(howTimer);
        howTimer = null;
        playHowBtn.textContent = "▶ Play Sequence";
        return;
      }
      playHowBtn.textContent = "⏸ Pause";
      howTimer = setInterval(
        () => {
          const next = (howCurrent % howButtons.length) + 1;
          showHow(next);
        },
        prefersReduced ? 1 : 1600
      );
    }
    playHowBtn?.addEventListener("click", playHow);

    if (howButtons.length) showHow(1);

    if (prefersReduced) {
      document.querySelectorAll('[class*="anim-"]').forEach((el) => {
        (el as HTMLElement).style.animation = "none";
      });
    }

    // Self-tests
    (function runSelfTests() {
      const tests: { name: string; pass: boolean }[] = [];
      function expect(name: string, cond: any) {
        tests.push({ name, pass: !!cond });
      }
      expect(
        "Hero title exists",
        document
          .querySelector("#top h1")
          ?.textContent?.includes("Meet the AI Salesperson")
      );
      expect("Problem section present", !!document.getElementById("problem"));
      expect(
        "How storyboard has 5 steps",
        document.querySelectorAll("[data-how-step]").length === 5
      );
      expect(
        "How views has 5 panels",
        document.querySelectorAll("[data-how-view]").length === 5
      );
      const failed = tests.filter((t) => !t.pass);
      if (failed.length) {
        console.group(
          "%cAgentlytics self-tests",
          "color:#b91c1c;font-weight:700"
        );
        failed.forEach((t) => console.error("❌", t.name));
        console.groupEnd();
      } else {
        console.log(
          "%cAgentlytics self-tests: all passed",
          "color:#16a34a;font-weight:700"
        );
      }
    })();

    return () => {
      menuBtn?.replaceWith(menuBtn.cloneNode(true)); // remove listeners
      backdrop?.replaceWith(backdrop.cloneNode(true));
      document.removeEventListener("keydown", onKey);
      playHowBtn?.replaceWith(playHowBtn.cloneNode(true) as Node);
      if (howTimer) clearInterval(howTimer);
      revObserver.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <title>
          Agentlytics — Proactive AI That Turns Visitors into Customers
        </title>
        <meta
          name="description"
          content="Agentlytics is a lifecycle-aware AI agent that proactively engages visitors, qualifies leads, schedules sales calls, onboards customers, and supports them — all inside one chat."
        />
        <link rel="canonical" href="https://www.agentlytics.example/" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Global styles to mimic your inline CSS + custom animations without Tailwind config */}
      <style jsx global>{`
        :root {
          --brand-blue: #0069ff;
          --brand-sky: #3ba3ff;
          --brand-midnight: #0b1b34;
        }
        body {
          background: #fff;
          color: #0f172a;
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial,
            sans-serif;
        }
        .font-display {
          font-family: Poppins, Inter, system-ui, sans-serif;
        }
        .reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        /* Custom keyframes + utility classes (no Tailwind config required) */
        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes typeDots {
          0% {
            opacity: 0.2;
          }
          33% {
            opacity: 0.6;
          }
          66% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }
        @keyframes wobble {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-1.5%) rotate(-0.4deg);
          }
          75% {
            transform: translateX(1.5%) rotate(0.4deg);
          }
        }
        @keyframes zzDrift {
          0% {
            transform: translateY(0);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-14px);
            opacity: 0;
          }
        }
        @keyframes radar {
          0% {
            transform: scale(0.6);
            opacity: 0.35;
          }
          70% {
            transform: scale(1.15);
            opacity: 0;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        @keyframes slideIn {
          0% {
            transform: translateX(-8px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scrollHint {
          0% {
            transform: translateY(0);
            opacity: 0.7;
          }
          100% {
            transform: translateY(20px);
            opacity: 0.7;
          }
        }
        @keyframes dash {
          0% {
            stroke-dashoffset: 160;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes breath {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }
        @keyframes pingSoft {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          80%,
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.98);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-floaty,
        .anim-floaty {
          animation: floaty 6s ease-in-out infinite;
        }
        .animate-pulseGlow,
        .anim-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .animate-typeDots,
        .anim-typeDots {
          animation: typeDots 1.2s ease-in-out infinite;
        }
        .animate-wobble,
        .anim-wobble {
          animation: wobble 0.9s ease-in-out;
        }
        .animate-zzDrift,
        .anim-zzDrift {
          animation: zzDrift 1.6s ease-out forwards;
        }
        .animate-radar,
        .anim-radar {
          animation: radar 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
        }
        .animate-slideIn,
        .anim-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        .animate-scrollHint,
        .anim-scrollHint {
          animation: scrollHint 1.2s ease-in-out infinite alternate;
        }
        .animate-dash,
        .anim-dash {
          animation: dash 4s ease-in-out infinite;
        }
        .animate-breath,
        .anim-breath {
          animation: breath 6s ease-in-out infinite;
        }
        .animate-pingSoft,
        .anim-pingSoft {
          animation: pingSoft 2.2s ease-out infinite;
        }
        .animate-fadeUp,
        .anim-fadeUp {
          animation: fadeUp 0.5s ease-out both;
        }
        .animate-scaleIn,
        .anim-scaleIn {
          animation: scaleIn 0.4s ease-out both;
        }
        .animate-shimmer,
        .anim-shimmer {
          animation: shimmer 1.6s linear infinite;
          background-size: 200% 100%;
        }
      `}</style>

      {/* PAGE */}
      <div className="scroll-smooth">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="w-full h-16 flex items-center justify-center relative md:right-[84px]">
            <nav className="flex items-center gap-4 md:gap-6 text-slate-600 text-sm">
              <a href="#problem" className="hover:text-slate-900">
                Problem
              </a>
              <a href="#value" className="hover:text-slate-900">
                Value
              </a>
              <a href="#how" className="hover:text-slate-900">
                How it works
              </a>
              <a href="#features" className="hover:text-slate-900">
                Features
              </a>
              <a href="#pricing" className="hover:text-slate-900">
                Pricing
              </a>
            </nav>
            <div className="hidden md:flex items-center gap-3"></div>
          </div>
        </header>

        {/* Backdrop overlay for mobile menu (transparent, captures outside clicks) */}
        <div
          id="mobileMenuBackdrop"
          className="md:hidden hidden fixed inset-0 z-10 bg-transparent"
          aria-label="Close menu"
        />

        {/* HERO */}
        <section
          id="top"
          className="relative overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(100% 50% at 0% 0%, rgba(0,105,255,.10), transparent 60%), radial-gradient(80% 40% at 100% 0%, rgba(59,163,255,.12), transparent 60%)",
          }}
        >
          <div className="pointer-events-none absolute -top-20 -left-20 w-[520px] h-[520px] rounded-full bg-blue-100 blur-3xl animate-pulseGlow" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 w-[460px] h-[460px] rounded-full bg-sky-100 blur-3xl animate-pulseGlow" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 reveal">
                <span className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                  Proactive, Lifecycle-Aware AI Agent
                </span>
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mt-4 text-slate-900">
                  Meet the AI Salesperson Who Never Sleeps
                </h1>
                <p className="text-slate-700 mt-4 max-w-xl">
                  Turns visitors into customers 24/7. Greets high‑intent
                  traffic, qualifies leads, <strong>books sales calls</strong>,
                  onboards customers, and supports them — in one continuous
                  chat.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <a
                    href="#trial"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[color:var(--brand-blue)] text-white shadow-[0_12px_34px_rgba(2,6,23,.08)]"
                  >
                    Start Free Trial
                  </a>
                  <a
                    href="/demo"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-slate-900"
                  >
                    Book a Demo
                  </a>
                </div>
                <p className="text-slate-500 mt-3 text-sm">
                  No credit card. Get live in minutes.
                </p>
              </div>

              <aside className="lg:col-span-6 reveal">
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.08)] p-5">
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-3 gap-2">
                      <span className="size-2 rounded-full bg-red-300" />
                      <span className="size-2 rounded-full bg-yellow-300" />
                      <span className="size-2 rounded-full bg-green-300" />
                      <span className="ml-2 text-sm text-slate-500">
                        Agentlytics · Live
                      </span>
                    </div>
                    <div className="p-4 space-y-3 bg-white">
                      <div className="max-w-[80%] bg-blue-50 border border-blue-200 text-slate-900 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm animate-floaty">
                        👋 Hi there! I noticed you were comparing plans. Want
                        help picking the right one?
                      </div>
                      <div className="max-w-[70%] ml-auto bg-slate-100 border border-slate-200 text-slate-900 rounded-2xl rounded-br-md px-3 py-2 shadow-sm">
                        Yes—can you walk me through ROI?
                      </div>
                      <div className="max-w-[82%] bg-blue-50 border border-blue-200 text-slate-900 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                        Absolutely. Most teams see a <strong>2–3× lift</strong>{" "}
                        in lead capture. Want a quick 15-min fit call?
                      </div>
                      <div className="flex items-center gap-1 w-16 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                        <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots" />
                        <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots [animation-delay:.2s]" />
                        <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots [animation-delay:.4s]" />
                      </div>
                    </div>
                    <div className="h-12 bg-slate-50 border-t border-slate-200 flex items-center px-3 gap-2">
                      <div className="flex-1 bg-white border border-slate-300 rounded-lg h-8" />
                      <button className="px-3 py-1.5 rounded-lg bg-[color:var(--brand-blue)] text-white">
                        Send
                      </button>
                    </div>
                  </div>
                  <div className="absolute -top-4 -left-4 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-[0_6px_16px_rgba(2,6,23,.06)] animate-floaty">
                    ⚡ Proactive prompts
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-[0_6px_16px_rgba(2,6,23,.06)] animate-floaty [animation-delay:.8s]">
                    📅 Built-in scheduling
                  </div>
                </div>
              </aside>
            </div>

            {/* Proof: testimonial + logos */}
            <div className="mt-10 grid lg:grid-cols-12 gap-6 items-center reveal">
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <p className="text-slate-800 text-sm sm:text-base">
                    “We saw a{" "}
                    <span className="font-semibold">2.8× increase</span> in demo
                    bookings within 30 days. The proactive prompts just work.”
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center justify-center size-8 rounded-full bg-slate-100">
                      GL
                    </span>
                    <div>
                      <span className="font-medium">Maya R.</span> · Head of
                      Growth, GrowthLabs
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                  <span className="opacity-80">Seen on:</span>
                  <a href="#" className="underline-offset-4 hover:underline">
                    TechCrunch
                  </a>
                  <span>•</span>
                  <a href="#" className="underline-offset-4 hover:underline">
                    G2
                  </a>
                  <span>•</span>
                  <a href="#" className="underline-offset-4 hover:underline">
                    Product Hunt
                  </a>
                </div>
              </div>
            </div>
            {/* Quick Demo Preview */}
            <div className="mt-10 reveal">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-card p-5">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs text-slate-500">Step 1</div>
                    <div className="font-semibold">Detect</div>
                    <p className="text-slate-700 text-sm mt-1">
                      Scroll depth · pricing dwell · exit intent.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs text-slate-500">Step 2</div>
                    <div className="font-semibold">Engage</div>
                    <p className="text-slate-700 text-sm mt-1">
                      Lead bot greets at the perfect moment.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="text-xs text-slate-500">Step 3</div>
                    <div className="font-semibold">Convert</div>
                    <p className="text-slate-700 text-sm mt-1">
                      Qualify, book a call, or start trial.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <a
                    href="#how"
                    className="inline-flex items-center gap-2 text-brand-blue font-medium"
                  >
                    ▶ Watch 20‑sec storyboard
                  </a>
                  <div className="text-slate-500 text-sm">
                    Smooth animations for seamless scroll ↓
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-[#F7F9FC] text-slate-800 py-20 px-4 md:px-8 border-t border-slate-200/70">
          <div className="mx-auto max-w-6xl text-left">
            {/* Eyebrow + Heading */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-blue-600/80 mb-3">
              Revenue Leaks · Problem Space
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-slate-900">
              Why Your Website Is Losing Revenue Today
            </h2>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl">
              You don’t have a traffic problem — you have a
              <span className="font-semibold text-slate-900">
                {" "}
                buyer journey problem
              </span>
              . Visitors come with intent, but your systems don’t meet them at
              the right moment.
            </p>

            {/* 3-column bar layout – light theme */}
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* Column 1 */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col h-full">
                <div className="h-1 w-12 rounded-full bg-blue-500 mb-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Problem #1
                </p>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                  Visitors show intent, but never convert.
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  High-intent visitors check pricing and compare plans — then
                  leave without starting a conversation.
                </p>
                <ul className="mt-auto space-y-1.5 text-sm text-slate-500">
                  <li>• Reactive bots wait for users to type first.</li>
                  <li>• Demo links and redirects break momentum.</li>
                </ul>
              </div>

              {/* Column 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col h-full">
                <div className="h-1 w-12 rounded-full bg-blue-500 mb-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Problem #2
                </p>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                  Sales time goes to the wrong conversations.
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Reps jump between tools and manually qualify leads, spending
                  hours on low-fit prospects.
                </p>
                <ul className="mt-auto space-y-1.5 text-sm text-slate-500">
                  <li>• No automated scoring or routing.</li>
                  <li>• Pipeline looks full but win rates stay flat.</li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col h-full">
                <div className="h-1 w-12 rounded-full bg-blue-500 mb-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">
                  Problem #3
                </p>
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                  Onboarding and support repeat the same work.
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Customers don’t reach first value quickly, and every new issue
                  feels like starting from scratch.
                </p>
                <ul className="mt-auto space-y-1.5 text-sm text-slate-500">
                  <li>• Static onboarding makes users stall or churn.</li>
                  <li>• Support can’t see full journey context.</li>
                </ul>
              </div>
            </div>

            {/* Bottom Summary */}
            <div className="mt-10 rounded-xl border border-green-300 bg-green-50 px-5 py-5 flex flex-col md:flex-row md:items-center gap-3 shadow-sm">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-green-800 font-bold text-lg">
                ✓
              </div>
              <p className="text-sm md:text-base text-green-800">
                These aren’t random issues — they’re the everyday revenue leaks
                across your lifecycle.
                <span className="font-semibold">
                  Agentlytics fixes them by turning anonymous visitors into one
                  continuous AI-driven journey from lead → sales → onboarding →
                  support.
                </span>
              </p>
            </div>
          </div>
        </section>
        {/* Problem */}
        <section id="problem" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
            <div className="reveal">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
                Reactive Chatbots Are Losing You Customers
              </h2>
              <p className="text-slate-700 mt-3 max-w-prose">
                Most chatbots sit idle until someone types. Agentlytics
                initiates conversations when intent peaks — scroll depth,
                pricing page dwell, exit intent — so you capture leads before
                they leave.
              </p>
            </div>
            <div className="grid gap-4 reveal">
              {/* Reactive card */}
              <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-card group overflow-hidden transition-transform duration-700 ease-in-out">
                <strong className="block text-slate-900">Reactive Bot</strong>
                <p className="text-slate-700">
                  Stays idle · No context · Missed intent → <em>Bounce</em>
                </p>
                <span
                  className="absolute top-3 right-3 text-slate-400 select-none"
                  aria-hidden="true"
                >
                  😴
                </span>
                <span
                  className="absolute top-6 right-5 text-slate-400/70 select-none animate-zzDrift"
                  style={{ animationDelay: ".2s" }}
                  aria-hidden="true"
                >
                  z
                </span>
                <span
                  className="absolute top-8 right-7 text-slate-400/70 select-none animate-zzDrift"
                  style={{ animationDelay: ".5s" }}
                  aria-hidden="true"
                >
                  Z
                </span>
                <div className="pointer-events-none mt-4 max-w-[82%] bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl rounded-bl-md px-3 py-2 opacity-100 transition-opacity duration-700">
                  “Hi… anyone there?”
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-slate-400">
                  <span className="inline-block size-1 rounded-full bg-slate-300 animate-scrollHint" />
                  <span>visitor scrolls…</span>
                </div>
                <div className="absolute inset-0 pointer-events-none group-hover:animate-wobble" />
              </div>

              {/* Proactive card */}
              <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-card overflow-visible transition-transform duration-700 ease-in-out">
                <div
                  className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-100/60 animate-radar"
                  aria-hidden="true"
                />
                <div
                  className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-200/40 animate-radar"
                  style={{ animationDelay: ".6s" }}
                  aria-hidden="true"
                />
                <strong className="relative block text-slate-900">
                  Proactive AI
                </strong>
                <p className="relative text-slate-700">
                  Greets at 60% scroll or price‑page dwell · Guides to
                  demo/sign‑up → <em>Engagement</em>
                </p>
                <div className="mt-4 max-w-[86%] bg-blue-50 border border-blue-200 text-slate-900 rounded-2xl rounded-bl-md px-3 py-2 opacity-0 -translate-x-2 animate-[slideIn_.5s_ease-out_.35s_forwards]">
                  👋 “Noticed you’re on pricing. Want help picking the best
                  plan?”
                </div>
                <span
                  className="absolute -bottom-4 -right-3 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-soft translate-y-0 animate-floaty z-10"
                  aria-hidden="true"
                >
                  ⚡ Proactive
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE */}
        <section id="value" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 reveal">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
                  One AI for the Whole Journey
                </h2>
                <p className="text-slate-700 mt-3 max-w-prose">
                  Lead → Sales → Onboarding → Support. Agentlytics changes roles
                  automatically and keeps context across every step.
                </p>
                <ul className="mt-6 space-y-3 text-slate-700">
                  <li className="flex items-start gap-3">
                    <span className="mt-1">🧠</span>
                    <div>
                      <strong>Proactive Engagement</strong>
                      <div className="text-slate-600">
                        Triggers on behavior; starts timely conversations.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1">🔁</span>
                    <div>
                      <strong>Lifecycle Automation</strong>
                      <div className="text-slate-600">
                        Lead → Sales → Onboarding → Support, hands-free.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1">📅</span>
                    <div>
                      <strong>Built-in Scheduling</strong>
                      <div className="text-slate-600">
                        Choose time, book instantly, reschedule/cancel — inside
                        chat.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1">📈</span>
                    <div>
                      <strong>Insight Intelligence</strong>
                      <div className="text-slate-600">
                        See conversions, ghosted chats, and outcomes.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-7 reveal">
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.08)] overflow-hidden p-6">
                  <div className="pointer-events-none -z-10 absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full md:blur-3xl blur-none opacity-70" />
                  <div className="pointer-events-none -z-10 absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-sky-50 rounded-full md:blur-3xl blur-none opacity-70" />
                  <svg
                    viewBox="0 0 800 420"
                    className="hidden md:block w-full h-[360px]"
                  >
                    <defs>
                      <linearGradient id="g" x1="0" x2="1">
                        <stop offset="0%" stopColor="#0069FF" />
                        <stop offset="100%" stopColor="#3BA3FF" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M40 340 C 220 120, 380 120, 560 260 S 760 360, 760 160"
                      fill="none"
                      stroke="url(#g)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="10 10"
                      className="anim-dash"
                    />
                  </svg>
                  <div className="hidden md:block">
                    <div className="absolute left-[4%] bottom-[10%]">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)] hover:shadow-[0_12px_34px_rgba(2,6,23,.08)] transition">
                        <div className="text-xs text-slate-500">Lead</div>
                        <div className="font-semibold">
                          Proactive Engagement
                        </div>
                        <p className="text-sm text-slate-600">
                          Greets at the right moment.
                        </p>
                      </div>
                    </div>
                    <div className="absolute left-[25%] top-[28%]">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)] hover:shadow-[0_12px_34px_rgba(2,6,23,.08)] transition">
                        <div className="text-xs text-slate-500">Sales</div>
                        <div className="font-semibold">Qualify & Schedule</div>
                        <p className="text-sm text-slate-600">
                          Books a call inside chat.
                        </p>
                      </div>
                    </div>
                    <div className="absolute left-[52%] top-[56%]">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)] hover:shadow-[0_12px_34px_rgba(2,6,23,.08)] transition">
                        <div className="text-xs text-slate-500">Onboarding</div>
                        <div className="font-semibold">Collect & Explain</div>
                        <p className="text-sm text-slate-600">
                          Captures details, answers questions.
                        </p>
                      </div>
                    </div>
                    <div className="absolute left-[72%] top-[22%]">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)] hover:shadow-[0_12px_34px_rgba(2,6,23,.08)] transition">
                        <div className="text-xs text-slate-500">Support</div>
                        <div className="font-semibold">Resolve & Learn</div>
                        <p className="text-sm text-slate-600">
                          Helps with full context.
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-6 text-xs text-slate-500">
                      Context flows forward automatically · No handoffs lost
                    </div>
                  </div>

                  {/* Mobile stacked layout */}
                  <div className="md:hidden antialiased relative z-10 grid grid-cols-1 gap-4 mt-2">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="flex-1 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)]">
                        <div className="text-xs text-slate-500">Lead</div>
                        <div className="font-semibold">
                          Proactive Engagement
                        </div>
                        <p className="text-sm text-slate-600">
                          Greets at the right moment.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="flex-1 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)]">
                        <div className="text-xs text-slate-500">Sales</div>
                        <div className="font-semibold">Qualify & Schedule</div>
                        <p className="text-sm text-slate-600">
                          Books a call inside chat.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="flex-1 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)]">
                        <div className="text-xs text-slate-500">Onboarding</div>
                        <div className="font-semibold">Collect & Explain</div>
                        <p className="text-sm text-slate-600">
                          Captures details, answers questions.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <span
                          className="absolute inset-0 rounded-full bg-blue-200/40 size-6 anim-pingSoft"
                          aria-hidden="true"
                        />
                        <div className="relative size-6 rounded-full bg-[color:var(--brand-blue)] shadow-[0_6px_16px_rgba(2,6,23,.06)]" />
                      </div>
                      <div className="flex-1 p-3 rounded-xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(2,6,23,.06)]">
                        <div className="text-xs text-slate-500">Support</div>
                        <div className="font-semibold">Resolve & Learn</div>
                        <p className="text-sm text-slate-600">
                          Helps with full context.
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Context flows forward automatically · No handoffs lost
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 reveal">
                  How It Works
                </h2>
                <p className="text-slate-700 mt-3 reveal">
                  From first hello to ongoing support — with{" "}
                  <strong>calendar booking built-in</strong> (no third-party
                  tools).
                </p>
              </div>
              <div className="flex items-center gap-2 reveal">
                <button
                  id="playHow"
                  className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-slate-300 text-slate-900"
                >
                  ▶ Play Sequence
                </button>
                <span id="howIndex" className="text-slate-500 text-sm">
                  1/5
                </span>
              </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-12 gap-8">
              <ol className="lg:col-span-5 relative">
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-200" />
                <div
                  id="howProgress"
                  className="absolute left-4 top-0 w-[2px] bg-gradient-to-b from-[color:var(--brand-blue)] to-[color:var(--brand-sky)] h-0 transition-all duration-500"
                />

                {[1, 2, 3, 4, 5].map((n) => (
                  <li key={n} className={`pl-12 ${n !== 5 ? "pb-6" : ""}`}>
                    <button
                      className="group w-full text-left"
                      data-how-step={n}
                      aria-selected={n === 1}
                    >
                      <div className="relative mb-2">
                        <span className="absolute -left-12 top-0 grid place-items-center size-8 rounded-full border-2 border-slate-300 bg-white text-slate-600 group-aria-selected:border-[color:var(--brand-blue)] group-aria-selected:text-[color:var(--brand-blue)]">
                          {n}
                        </span>
                        <h4 className="font-semibold text-slate-900">
                          {
                            [
                              "Detect & Identify",
                              "Engage, Qualify & Schedule",
                              "Convert & Pitch",
                              "Onboard & Guide",
                              "Support & Retain",
                            ][n - 1]
                          }
                        </h4>
                      </div>
                      <p className="text-slate-700">
                        {
                          [
                            "New vs returning; behavior & session context.",
                            "Lead Bot chats, captures email, and books a sales call with reschedule/cancel inside chat.",
                            "Sales Bot tailors benefits and ROI to the use case.",
                            "Collects needed details, explains why, answers questions.",
                            "Support Bot helps with full journey context.",
                          ][n - 1]
                        }
                      </p>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="lg:col-span-7">
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.08)] overflow-hidden p-6 min-h-[420px]">
                  <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-sky-50 rounded-full blur-3xl opacity-70" />

                  <div id="howViews" className="relative">
                    {/* 1 */}
                    <div data-how-view="1" className="opacity-100 anim-fadeUp">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-1">
                            Signals
                          </div>
                          <ul className="text-slate-800 text-sm space-y-1">
                            <li>👀 Pricing page dwell · 42s</li>
                            <li>⬇️ Scroll depth · 63%</li>
                            <li>🚪 Exit intent detected</li>
                          </ul>
                        </div>
                        <div className="relative rounded-xl border border-slate-200 p-4 overflow-hidden">
                          <div className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-100/60 anim-radar" />
                          <div className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-200/40 anim-radar [animation-delay:.6s]" />
                          <div className="text-sm text-slate-700">
                            Visitor identified:{" "}
                            <span className="font-medium text-slate-900">
                              New lead
                            </span>
                          </div>
                          <div className="mt-3 text-slate-700">
                            Next action:{" "}
                            <span className="text-slate-900">
                              Proactive greet
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2 */}
                    <div data-how-view="2" className="hidden opacity-0">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Chat
                          </div>
                          <div className="space-y-2">
                            <div className="max-w-[90%] bg-blue-50 border border-blue-200 rounded-2xl rounded-bl-md px-3 py-2">
                              Hi! Want help choosing a plan?
                            </div>
                            <div className="max-w-[80%] ml-auto bg-slate-100 border border-slate-200 rounded-2xl rounded-br-md px-3 py-2">
                              Yes. Can we talk today?
                            </div>
                            <div className="flex items-center gap-1 w-16 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                              <span className="size-1.5 rounded-full bg-blue-400 anim-typeDots" />
                              <span className="size-1.5 rounded-full bg-blue-400 anim-typeDots [animation-delay:.2s]" />
                              <span className="size-1.5 rounded-full bg-blue-400 anim-typeDots [animation-delay:.4s]" />
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Pick a time
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              "10:00",
                              "12:30",
                              "15:00",
                              "16:30",
                              "17:15",
                              "18:00",
                            ].map((t) => (
                              <button
                                key={t}
                                className="h-10 rounded-lg border border-slate-300 hover:border-[color:var(--brand-blue)]"
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                          <div className="mt-3 text-xs text-slate-500">
                            Reschedule/cancel anytime · Calendar sync +
                            reminders
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3 */}
                    <div data-how-view="3" className="hidden opacity-0">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Personalized pitch
                          </div>
                          <p className="text-slate-800 text-sm">
                            For <strong>SaaS marketing</strong>, teams like
                            yours see <strong>2–3×</strong> more leads captured
                            in 14 days.
                          </p>
                          <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-2 w-2/3 bg-gradient-to-r from-[color:var(--brand-blue)] to-[color:var(--brand-sky)]" />
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Projected uplift
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Next best action
                          </div>
                          <button className="w-full h-10 rounded-lg bg-[color:var(--brand-blue)] text-white">
                            Start Free Trial
                          </button>
                          <button className="w-full h-10 rounded-lg mt-2 border border-slate-300">
                            Book a Demo
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4 */}
                    <div data-how-view="4" className="hidden opacity-0">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <form className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Required details
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              className="rounded-lg border border-slate-300 h-10 px-3"
                              placeholder="Company name"
                            />
                            <input
                              className="rounded-lg border border-slate-300 h-10 px-3"
                              placeholder="Website"
                            />
                            <input
                              className="rounded-lg border border-slate-300 h-10 px-3"
                              placeholder="Industry"
                            />
                            <input
                              className="rounded-lg border border-slate-300 h-10 px-3"
                              placeholder="Team size"
                            />
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            Why we ask: to auto-configure triggers & CRM
                            mapping.
                          </div>
                        </form>
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Help in context
                          </div>
                          <div className="space-y-2">
                            <div className="rounded-lg border border-slate-200 p-2">
                              ℹ️ We use your industry to tailor prompts and
                              scoring.
                            </div>
                            <div className="rounded-lg border border-slate-200 p-2">
                              🔒 Data is never used to train public models.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5 */}
                    <div data-how-view="5" className="hidden opacity-0">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Conversation
                          </div>
                          <div className="space-y-2">
                            <div className="max-w-[90%] bg-blue-50 border border-blue-200 rounded-2xl rounded-bl-md px-3 py-2">
                              How do I export chat transcripts?
                            </div>
                            <div className="rounded-lg border border-slate-200 p-2">
                              Here’s how → Settings › Exports. Want me to email
                              you the report?
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Recommended answers
                          </div>
                          <ul className="text-sm text-slate-700 space-y-1">
                            <li>• Connect to Slack</li>
                            <li>• Map fields to HubSpot</li>
                            <li>• Track events in GA4</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 reveal">
                  Feature Snapshot
                </h2>
                <p className="text-slate-600 mt-2 reveal">
                  Everything you need to{" "}
                  <span className="font-medium text-slate-900">
                    engage → convert → support
                  </span>{" "}
                  — in one AI.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 reveal">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200">
                  ✨ New motion & badges
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {/* cards preserved exactly */}
              <a
                href="/behavioral-trigger"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal"
              >
                <div
                  className="absolute -top-8 -left-8 size-24 rounded-full bg-blue-100/50 blur-2xl"
                  aria-hidden="true"
                />
                <div className="size-10 rounded-xl bg-blue-50 grid place-items-center text-brand-blue">
                  🧭
                </div>
                <h3 className="mt-3 font-semibold text-lg text-slate-900">
                  Behavioral Triggers
                </h3>
                <p className="text-slate-700 mt-1">
                  Scroll depth, inactivity, exit intent — fire the{" "}
                  <em>right</em> prompt at the <em>right</em> time.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Pricing dwell
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Segment rules
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    UTM aware
                  </li>
                </ul>
              </a>

              <a
                href="/multipersona"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal"
              >
                <div
                  className="absolute -top-8 -right-8 size-24 rounded-full bg-sky-100/50 blur-2xl"
                  aria-hidden="true"
                />
                <div className="size-10 rounded-xl bg-blue-50 grid place-items-center text-brand-blue">
                  🤖
                </div>
                <h3 className="mt-3 font-semibold text-lg text-slate-900">
                  Multi‑Persona AI
                </h3>
                <p className="text-slate-700 mt-1">
                  Lead, Sales, Onboarding, and Support —{" "}
                  <span className="font-medium">one agent</span> that swaps
                  roles as context changes.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Memory across steps
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Tone control
                  </li>
                </ul>
              </a>

              <a
                href="/bant-based-qualification"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal"
              >
                <div className="size-10 rounded-xl bg-blue-50 grid place-items-center text-brand-blue">
                  ✅
                </div>
                <h3 className="mt-3 font-semibold text-lg text-slate-900">
                  BANT‑Based Qualification
                </h3>
                <p className="text-slate-700 mt-1">
                  Surfaces high‑intent prospects and routes to the best next
                  action automatically.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Score thresholds
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Disqualify logic
                  </li>
                </ul>
              </a>

              <a
                href="/built-in-scheduling"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal"
              >
                <div
                  className="absolute -bottom-10 -left-8 size-24 rounded-full bg-blue-100/50 blur-2xl"
                  aria-hidden="true"
                />
                <div className="size-10 rounded-xl bg-blue-50 grid place-items-center text-brand-blue">
                  📅
                </div>
                <h3 className="mt-3 font-semibold text-lg text-slate-900">
                  Built‑in Scheduling
                </h3>
                <p className="text-slate-700 mt-1">
                  Offer slots, book, reschedule/cancel — with reminders and
                  calendar sync.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Time‑zone aware
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    No add‑ons
                  </li>
                </ul>
              </a>

              <a
                href="https://www.advancelytics.com"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal"
              >
                <div className="size-10 rounded-xl bg-blue-50 grid place-items-center text-brand-blue">
                  📊
                </div>
                <div className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  NEW
                </div>
                <h3 className="mt-3 font-semibold text-lg text-slate-900">
                  9‑Metric Scoring
                </h3>
                <p className="text-slate-700 mt-1">
                  Measure quality & outcomes across every conversation.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Clarity
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Empathy
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Resolution
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    +6 more
                  </li>
                </ul>
              </a>

              <a
                href="/crm-and-analytics-sync"
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal"
              >
                <div
                  className="absolute -bottom-10 -right-8 size-24 rounded-full bg-sky-100/50 blur-2xl"
                  aria-hidden="true"
                />
                <div className="size-10 rounded-xl bg-blue-50 grid place-items-center text-brand-blue">
                  🔗
                </div>
                <h3 className="mt-3 font-semibold text-lg text-slate-900">
                  CRM & Analytics Sync
                </h3>
                <p className="text-slate-700 mt-1">
                  Push leads, events, and outcomes to your stack in real time.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    HubSpot
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Salesforce
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    GA4
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Intercom
                  </li>
                  <li className="px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                    Slack
                  </li>
                </ul>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <a
                href="#trial"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 transition"
              >
                Explore all features → Start free
              </a>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 reveal">
              Start Free — Scale As You Grow
            </h2>
            <div className="grid lg:grid-cols-3 gap-5 mt-6">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(2,6,23,.08)] reveal">
                <h3 className="font-semibold text-xl">Starter</h3>
                <p className="text-slate-700 text-sm">
                  Test proactive chat on 1 site.
                </p>
                <div className="font-display text-3xl font-extrabold my-2">
                  Free
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li>✔ 1 AI Agent</li>
                  <li>✔ Basic triggers</li>
                  <li>✔ Essential dashboard</li>
                </ul>
                <a
                  href="#trial"
                  className="inline-flex mt-4 items-center px-4 py-2 rounded-lg border border-slate-300"
                >
                  Start Free Trial
                </a>
              </article>
              <article className="rounded-xl border-2 border-[color:var(--brand-blue)]/30 bg-white p-6 shadow-[0_12px_34px_rgba(2,6,23,.08)] reveal">
                <h3 className="font-semibold text-xl">Pro</h3>
                <p className="text-slate-700 text-sm">
                  Lifecycle automation + CRM sync.
                </p>
                <div className="font-display text-3xl font-extrabold my-2">
                  $49<span className="text-base font-semibold">/mo</span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li>✔ Advanced lifecycle automation</li>
                  <li>✔ CRM sync</li>
                  <li>✔ Analytics dashboard</li>
                </ul>
                <a
                  href="#trial"
                  className="inline-flex mt-4 items-center px-4 py-2 rounded-lg bg-[color:var(--brand-blue)] text-white"
                >
                  Start Free Trial
                </a>
              </article>
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(2,6,23,.08)] reveal">
                <h3 className="font-semibold text-xl">Enterprise</h3>
                <p className="text-slate-700 text-sm">
                  Unlimited agents, SSO, SOC-2 on request.
                </p>
                <div className="font-display text-3xl font-extrabold my-2">
                  Custom
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li>✔ Unlimited agents</li>
                  <li>✔ Full analytics</li>
                  <li>✔ Dedicated success manager</li>
                </ul>
                <a
                  href="#trial"
                  className="inline-flex mt-4 items-center px-4 py-2 rounded-lg border border-slate-300"
                >
                  Start Free Trial
                </a>
              </article>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 reveal">
              Let Your Website Talk First
            </h2>
            <p className="text-slate-700 mt-3 reveal">
              Turn passive traffic into booked calls, qualified leads, and
              supported customers.
            </p>
            <div className="flex justify-center gap-3 mt-6 reveal">
              <a
                href="#trial"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[color:var(--brand-blue)] text-white"
              >
                Start Free Trial
              </a>
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300"
              >
                Book a Demo
              </a>
            </div>
          </div>
        </section>

        {/* Signup anchor */}
        <section id="trial" className="py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
              Start Free Trial
            </h2>
            <p className="text-slate-700 mt-2">
              Create your account to deploy a proactive AI agent in minutes.
            </p>
            <form
              className="mt-6 grid sm:grid-cols-3 gap-3"
              action="/signup"
              method="post"
            >
              <input
                className="sm:col-span-1 w-full rounded-lg bg-white border border-slate-300 px-4 py-3 placeholder-slate-400"
                type="text"
                name="name"
                placeholder="Full name"
                required
              />
              <input
                className="sm:col-span-1 w-full rounded-lg bg-white border border-slate-300 px-4 py-3 placeholder-slate-400"
                type="email"
                name="email"
                placeholder="Work email"
                required
              />
              <button
                className="sm:col-span-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[color:var(--brand-blue)] text-white"
                type="submit"
              >
                Create Account
              </button>
            </form>
            <p className="text-slate-500 text-sm mt-3">
              No credit card required.
            </p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 font-display font-extrabold tracking-tight text-slate-900">
                <span className="size-7 rounded-lg bg-[conic-gradient(from_220deg,#0069FF,#3BA3FF)]" />
                <span>Agentlytics</span>
              </div>
              <p className="text-slate-700 mt-3">
                Proactive AI that engages, converts, onboards, and supports —
                automatically.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Runs on Google Cloud. GDPR-ready. No PII used for model
                training.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-slate-900">Product</h5>
              <a href="#features" className="block text-slate-700">
                Features
              </a>
              <a href="#how" className="block text-slate-700">
                How it works
              </a>
              <a href="#pricing" className="block text-slate-700">
                Pricing
              </a>
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-slate-900">Company</h5>
              <a href="#" className="block text-slate-700">
                About
              </a>
              <a href="#" className="block text-slate-700">
                Careers
              </a>
              <a href="#" className="block text-slate-700">
                Blog
              </a>
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-slate-900">Legal</h5>
              <a href="#" className="block text-slate-700">
                Privacy Policy
              </a>
              <a href="#" className="block text-slate-700">
                Terms of Service
              </a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-slate-500">
            © 2025 Agentlytics. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
