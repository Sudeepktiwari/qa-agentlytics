"use client";

import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";
import DemoVideoModal from "./components/DemoVideoModal";

const HomePage: React.FC = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const menuHandler = () => mobileMenu?.classList.toggle("hidden");
    menuBtn?.addEventListener("click", menuHandler);

    // Reveal on scroll (smoothed)
    try {
      const revObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in-view");
              revObserver.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
      );

      const reveals = Array.from(
        document.querySelectorAll(".reveal"),
      ) as HTMLElement[];
      if (!prefersReduced) {
        reveals.forEach((el, i) => {
          el.style.transitionDelay = (i % 4) * 60 + "ms";
          revObserver.observe(el);
        });
      } else {
        reveals.forEach((el) => el.classList.add("in-view"));
      }
    } catch {
      // ignore if IntersectionObserver not supported
    }

    // How It Works interactions
    const howButtons = Array.from(
      document.querySelectorAll("[data-how-step]"),
    ) as HTMLElement[];
    const howViews = Array.from(
      document.querySelectorAll("[data-how-view]"),
    ) as HTMLElement[];
    const howProgress = document.getElementById("howProgress");
    const howIndex = document.getElementById("howIndex");
    const playHowBtn = document.getElementById("playHow");

    let howCurrent = 1;
    let howTimer: number | null = null;

    function showHow(n: number) {
      howCurrent = n;
      howButtons.forEach((btn, i) => {
        btn.setAttribute("aria-pressed", String(i === n - 1));
      });
      howViews.forEach((view, i) => {
        if (i === n - 1) {
          view.classList.remove("hidden");
          requestAnimationFrame(() => {
            view.classList.add("animate-fadeUp");
            (view as HTMLElement).style.opacity = "1";
          });
        } else {
          view.classList.remove("animate-fadeUp");
          (view as HTMLElement).style.opacity = "0";
          view.classList.add("hidden");
        }
      });
      const pct = (n - 1) / Math.max(1, howButtons.length - 1);
      if (howProgress)
        (howProgress as HTMLElement).style.height = `${pct * 100}%`;
      if (howIndex) howIndex.textContent = `${n}/${howButtons.length}`;
    }

    howButtons.forEach((btn) =>
      btn.addEventListener("click", () =>
        showHow(Number((btn as HTMLElement).dataset.howStep)),
      ),
    );

    function playHow() {
      if (!playHowBtn) return;
      if (howTimer) {
        window.clearInterval(howTimer);
        howTimer = null;
        playHowBtn.textContent = "▶ Play Sequence";
        return;
      }
      playHowBtn.textContent = "⏸ Pause";
      howTimer = window.setInterval(
        () => {
          const next = (howCurrent % howButtons.length) + 1;
          showHow(next);
        },
        prefersReduced ? 1000 : 1600,
      ) as unknown as number;
    }
    playHowBtn?.addEventListener("click", playHow);

    if (howButtons.length) showHow(1);

    // Reduced-motion stop
    if (prefersReduced) {
      document.querySelectorAll('[class*="animate-"]').forEach((el) => {
        (el as HTMLElement).style.animation = "none";
      });
    }

    // Sanity checks
    (function runSelfTests() {
      try {
        const tests: { name: string; pass: boolean }[] = [];
        function expect(name: string, cond: boolean) {
          tests.push({ name, pass: !!cond });
        }
        function tailwindApplied() {
          const el = document.createElement("div");
          el.className = "hidden";
          document.body.appendChild(el);
          const applied = getComputedStyle(el).display === "none";
          el.remove();
          return applied;
        }
        expect("Tailwind loaded", tailwindApplied());
        expect(
          "Hero title exists",
          !!document
            .querySelector("#top h1")
            ?.textContent?.includes("AI Salesperson"),
        );
        expect("Problem section present", !!document.getElementById("problem"));
        expect(
          "Value journey map path anim",
          !!document.querySelector("#value svg path.animate-dash"),
        );
        expect(
          "How storyboard has 5 steps",
          document.querySelectorAll("[data-how-step]").length === 5,
        );
        expect(
          "How views has 5 panels",
          document.querySelectorAll("[data-how-view]").length === 5,
        );
        expect(
          "Features cards visible",
          document.querySelectorAll("#features .group").length === 6,
        );
        const failed = tests.filter((t) => !t.pass);
        if (failed.length) {
          console.group(
            "%cAgentlytics self-tests",
            "color:#b91c1c;font-weight:700",
          );
          failed.forEach((t) => console.error("❌", t.name));
          console.groupEnd();
        } else {
          console.log(
            "%cAgentlytics self-tests: all passed",
            "color:#16a34a;font-weight:700",
          );
        }
      } catch {
        // ignore
      }
    })();

    // cleanup
    return () => {
      menuBtn?.removeEventListener("click", menuHandler);
      playHowBtn?.removeEventListener("click", playHow);
      if (howTimer) window.clearInterval(howTimer);
    };
  }, []);

  return (
    <>
      <Script id="set-js" strategy="beforeInteractive">
        {"document.documentElement.classList.add('js');"}
      </Script>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script id="tailwind-config" strategy="beforeInteractive">
        {`tailwind.config = { theme: { extend: { colors: { brand: { blue: '#0069FF', sky: '#3BA3FF', midnight: '#0B1B34' } }, boxShadow: { card: '0 12px 34px rgba(2,6,23,.08)', soft: '0 6px 16px rgba(2,6,23,.06)' }, backgroundImage: { 'hero-bg': 'radial-gradient(100% 50% at 0% 0%, rgba(0,105,255,.10), transparent 60%), radial-gradient(80% 40% at 100% 0%, rgba(59,163,255,.12), transparent 60%)' }, keyframes: {}, animation: {} } } }`}
      </Script>
      <Head>
        <title>Agentlytics — Meet the AI Salesperson Who Never Sleeps</title>
        <meta
          name="description"
          content="Agentlytics is a lifecycle‑aware AI agent that proactively engages visitors, qualifies leads, schedules sales calls, onboards customers, and supports them — all inside one chat."
        />
        <link rel="canonical" href="https://www.agentlytics.example/" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`html,body{min-height:100%} body{background:#fff;color:#0F172A;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif} h1,h2,h3{color:#0b1220} .font-display{font-family:Poppins,Inter,system-ui,sans-serif} .js .reveal{opacity:0;transform:translateY(10px);transition:opacity .6s cubic-bezier(.22,.61,.36,1),transform .6s cubic-bezier(.22,.61,.36,1)} .js .reveal.in-view{opacity:1;transform:translateY(0)} section{scroll-margin-top:84px}`}</style>
      </Head>

      <main className="scroll-smooth">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <a
              href="#top"
              className="flex items-center gap-2 font-display font-extrabold tracking-tight text-brand-midnight"
            >
              <span className="size-7 rounded-lg bg-[conic-gradient(from_220deg,#0069FF,#3BA3FF)]" />
              <span>Agentlytics</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-slate-600">
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
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                Watch a Demo
              </button>
              <a
                href="#trial"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white hover:bg-blue-600"
              >
                Start Free Trial
              </a>
            </div>
            <button
              id="menuBtn"
              className="md:hidden inline-flex items-center justify-center size-10 rounded-lg border border-slate-300"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
          <div
            id="mobileMenu"
            className="md:hidden hidden border-t border-slate-200 bg-white"
          >
            <nav className="max-w-7xl mx-auto px-6 py-4 grid gap-4 text-slate-800">
              <a href="#problem">Problem</a>
              <a href="#value">Value</a>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <div className="pt-2 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300"
                >
                  Watch a Demo
                </button>
                <a
                  href="#trial"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue text-white"
                >
                  Start Free Trial
                </a>
              </div>
            </nav>
          </div>
        </header>

        {/* HERO */}
        <section id="top" className="relative overflow-hidden bg-hero-bg">
          <div className="pointer-events-none absolute -top-20 -left-20 w-[520px] h-[520px] rounded-full bg-blue-100 blur-3xl animate-pulseGlow" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 w-[460px] h-[460px] rounded-full bg-sky-100 blur-3xl animate-pulseGlow" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              {/* Copy */}
              <div className="lg:col-span-6 reveal">
                <span className="inline-flex items-center gap-2 text-sm text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                  Proactive, Lifecycle‑Aware AI Agent
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
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-blue text-white shadow-card"
                  >
                    Start Free Trial
                  </a>
                  <button
                    onClick={() => setIsDemoModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300 text-slate-900"
                  >
                    Watch a Demo
                  </button>
                </div>
                <p className="text-slate-500 mt-3 text-sm">
                  No setup needed • Start in 2 mins.
                </p>
              </div>

              {/* Visual */}
              <aside className="lg:col-span-6 reveal">
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-card p-5">
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
                        in lead capture. Want a quick 15‑min fit call?
                      </div>
                      <div className="flex items-center gap-1 w-16 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                        <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots" />
                        <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots [animation-delay:.2s]" />
                        <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots [animation-delay:.4s]" />
                      </div>
                    </div>
                    <div className="h-12 bg-slate-50 border-t border-slate-200 flex items-center px-3 gap-2">
                      <div className="flex-1 bg-white border border-slate-300 rounded-lg h-8" />
                      <button className="px-3 py-1.5 rounded-lg bg-brand-blue text-white">
                        Send
                      </button>
                    </div>
                  </div>

                  {/* floating badges */}
                  <div className="absolute -top-4 -left-4 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-soft animate-floaty">
                    ⚡ Proactive prompts
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-soft animate-floaty [animation-delay:.8s]">
                    📅 Built‑in scheduling
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
              <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-card overflow-hidden transition-transform duration-700 ease-in-out">
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
                  className="absolute -bottom-3 -right-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-soft translate-y-0 animate-floaty"
                  aria-hidden="true"
                >
                  ⚡ Proactive
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Value */}
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
                        Lead → Sales → Onboarding → Support, hands‑free.
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1">📅</span>
                    <div>
                      <strong>Built‑in Scheduling</strong>
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

              {/* Journey Map */}
              <div className="lg:col-span-7 reveal">
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden p-6">
                  <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70" />
                  <div className="pointer-events-none absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-sky-50 rounded-full blur-3xl opacity-70" />
                  <svg viewBox="0 0 800 420" className="w-full h-[360px]">
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
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray="10 10"
                      className="[stroke-dashoffset:160] animate-dash"
                    />
                  </svg>

                  <div className="absolute left-[3%] bottom-[18%]">
                    <div className="relative">
                      <span
                        className="absolute inset-0 rounded-full bg-blue-200/40 size-6 animate-pingSoft"
                        aria-hidden="true"
                      ></span>
                      <div className="relative size-6 rounded-full bg-brand-blue shadow-soft" />
                    </div>
                    <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-soft hover:shadow-card transition">
                      <div className="text-xs text-slate-500">Lead</div>
                      <div className="font-semibold">Proactive Engagement</div>
                      <p className="text-sm text-slate-600">
                        Greets at the right moment.
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-[35%] top-[18%]">
                    <div className="relative">
                      <span
                        className="absolute inset-0 rounded-full bg-blue-200/40 size-6 animate-pingSoft"
                        aria-hidden="true"
                      ></span>
                      <div className="relative size-6 rounded-full bg-brand-blue shadow-soft" />
                    </div>
                    <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-soft hover:shadow-card transition">
                      <div className="text-xs text-slate-500">Sales</div>
                      <div className="font-semibold">Qualify & Schedule</div>
                      <p className="text-sm text-slate-600">
                        Books a call inside chat.
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-[62%] top-[48%]">
                    <div className="relative">
                      <span
                        className="absolute inset-0 rounded-full bg-blue-200/40 size-6 animate-pingSoft"
                        aria-hidden="true"
                      ></span>
                      <div className="relative size-6 rounded-full bg-brand-blue shadow-soft" />
                    </div>
                    <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-soft hover:shadow-card transition">
                      <div className="text-xs text-slate-500">Onboarding</div>
                      <div className="font-semibold">Collect & Explain</div>
                      <p className="text-sm text-slate-600">
                        Captures details, answers questions.
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-[82%] top-[22%]">
                    <div className="relative">
                      <span
                        className="absolute inset-0 rounded-full bg-blue-200/40 size-6 animate-pingSoft"
                        aria-hidden="true"
                      ></span>
                      <div className="relative size-6 rounded-full bg-brand-blue shadow-soft" />
                    </div>
                    <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white shadow-soft hover:shadow-card transition">
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
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 reveal">
                  How It Works
                </h2>
                <p className="text-slate-700 mt-3 reveal">
                  From first hello to ongoing support — with{" "}
                  <strong>calendar booking built‑in</strong> (no third‑party
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
              {/* LEFT: Vertical steps */}
              <ol className="lg:col-span-5 relative">
                <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-200" />
                <div
                  id="howProgress"
                  className="absolute left-4 top-0 w-[2px] bg-gradient-to-b from-brand-blue to-sky-300 h-0 transition-all duration-500"
                />
                <li className="pl-12 pb-6">
                  <button
                    className="group w-full text-left"
                    data-how-step="1"
                    aria-pressed="true"
                  >
                    <div className="relative mb-2">
                      <span className="absolute -left-12 top-0 grid place-items-center size-8 rounded-full border-2 border-slate-300 bg-white text-slate-600">
                        1
                      </span>
                      <h4 className="font-semibold text-slate-900">
                        Detect & Identify
                      </h4>
                    </div>
                    <p className="text-slate-700">
                      New vs returning; behavior & session context.
                    </p>
                  </button>
                </li>
                <li className="pl-12 pb-6">
                  <button className="group w-full text-left" data-how-step="2">
                    <div className="relative mb-2">
                      <span className="absolute -left-12 top-0 grid place-items-center size-8 rounded-full border-2 border-slate-300 bg-white text-slate-600">
                        2
                      </span>
                      <h4 className="font-semibold text-slate-900">
                        Engage, Qualify & Schedule
                      </h4>
                    </div>
                    <p className="text-slate-700">
                      Lead Bot chats, captures email, and books a sales call
                      with reschedule/cancel inside chat.
                    </p>
                  </button>
                </li>
                <li className="pl-12 pb-6">
                  <button className="group w-full text left" data-how-step="3">
                    <div className="relative mb-2">
                      <span className="absolute -left-12 top-0 grid place-items-center size-8 rounded-full border-2 border-slate-300 bg-white text-slate-600">
                        3
                      </span>
                      <h4 className="font-semibold text-slate-900">
                        Convert & Pitch
                      </h4>
                    </div>
                    <p className="text-slate-700">
                      Sales Bot tailors benefits and ROI to the use case.
                    </p>
                  </button>
                </li>
                <li className="pl-12 pb-6">
                  <button className="group w-full text-left" data-how-step="4">
                    <div className="relative mb-2">
                      <span className="absolute -left-12 top-0 grid place-items-center size-8 rounded-full border-2 border-slate-300 bg-white text-slate-600">
                        4
                      </span>
                      <h4 className="font-semibold text-slate-900">
                        Onboard & Guide
                      </h4>
                    </div>
                    <p className="text-slate-700">
                      Collects needed details, explains why, answers questions.
                    </p>
                  </button>
                </li>
                <li className="pl-12">
                  <button className="group w-full text-left" data-how-step="5">
                    <div className="relative mb-2">
                      <span className="absolute -left-12 top-0 grid place-items-center size-8 rounded-full border-2 border-slate-300 bg-white text-slate-600">
                        5
                      </span>
                      <h4 className="font-semibold text-slate-900">
                        Support & Retain
                      </h4>
                    </div>
                    <p className="text-slate-700">
                      Support Bot helps with full journey context.
                    </p>
                  </button>
                </li>
              </ol>

              {/* RIGHT: storyboard preview */}
              <div className="lg:col-span-7">
                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden p-6 min-h-[420px]">
                  <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-70" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 w-[28rem] h-[28rem] bg-sky-50 rounded-full blur-3xl opacity-70" />
                  <div id="howViews" className="relative">
                    <div
                      data-how-view="1"
                      className="opacity-100 animate-fadeUp"
                    >
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
                          <div className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-100/60 animate-radar" />
                          <div
                            className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-200/40 animate-radar"
                            style={{ animationDelay: ".6s" }}
                          />
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
                              <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots" />
                              <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots [animation-delay:.2s]" />
                              <span className="size-1.5 rounded-full bg-blue-400 animate-typeDots [animation-delay:.4s]" />
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Pick a time
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button className="h-10 rounded-lg border border-slate-300 hover:border-brand-blue">
                              10:00
                            </button>
                            <button className="h-10 rounded-lg border border-slate-300 hover:border-brand-blue">
                              12:30
                            </button>
                            <button className="h-10 rounded-lg border border-slate-300 hover:border-brand-blue">
                              15:00
                            </button>
                            <button className="h-10 rounded-lg border border-slate-300 hover:border-brand-blue">
                              16:30
                            </button>
                            <button className="h-10 rounded-lg border border-slate-300 hover:border-brand-blue">
                              17:15
                            </button>
                            <button className="h-10 rounded-lg border border-slate-300 hover:border-brand-blue">
                              18:00
                            </button>
                          </div>
                          <div className="mt-3 text-xs text-slate-500">
                            Reschedule/cancel anytime · Calendar sync +
                            reminders
                          </div>
                        </div>
                      </div>
                    </div>
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
                            <div className="h-2 w-2/3 bg-gradient-to-r from-brand-blue to-sky-300" />
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Projected uplift
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                          <div className="text-xs text-slate-500 mb-2">
                            Next best action
                          </div>
                          <button className="w-full h-10 rounded-lg bg-brand-blue text-white">
                            Start Free Trial
                          </button>
                          <button className="w-full h-10 rounded-lg mt-2 border border-slate-300">
                            Watch a Demo
                          </button>
                        </div>
                      </div>
                    </div>
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
                            Why we ask: to auto‑configure triggers & CRM
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

        {/* Features */}
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
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal">
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
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal">
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
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal">
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
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal">
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
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal">
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
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(2,6,23,.10)] reveal">
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
              </div>
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

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 reveal">
              Start Free — Scale As You Grow
            </h2>
            <div className="grid lg:grid-cols-3 gap-5 mt-6">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-card reveal">
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

              <article className="rounded-xl border-2 border-brand-blue/30 bg-white p-6 shadow-card reveal">
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
                  className="inline-flex mt-4 items-center px-4 py-2 rounded-lg bg-brand-blue text-white"
                >
                  Start Free Trial
                </a>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-card reveal">
                <h3 className="font-semibold text-xl">Enterprise</h3>
                <p className="text-slate-700 text-sm">
                  Unlimited agents, SSO, SOC‑2 on request.
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-brand-blue text-white"
              >
                Start Free Trial
              </a>
              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-300"
              >
                Watch a Demo
              </button>
            </div>
            <p className="text-slate-500 mt-3 text-sm reveal">
              No setup needed • Start in 2 mins.
            </p>
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
                className="sm:col-span-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-brand-blue text-white"
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

        {/* Footer */}
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
                Runs on Google Cloud. GDPR‑ready. No PII used for model
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
        <DemoVideoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
        />
      </main>
    </>
  );
};

export default HomePage;
