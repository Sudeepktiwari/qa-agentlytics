// "use client";

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Hero Section */}
//       <div className="px-4 py-20">
//         <div className="max-w-6xl mx-auto text-center">
//           <h1 className="text-5xl font-bold text-gray-900 mb-6">
//             Welcome to our AI-Powered
//             <span className="text-blue-600"> Chatbot Platform</span>
//           </h1>
//           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
//             We provide intelligent conversational AI solutions for businesses of
//             all sizes. Our platform offers real-time customer support, lead
//             generation, and automated responses to help streamline your customer
//             interactions.
//           </p>
//           <div className="space-x-4">
//             <a
//               href="/pricing"
//               className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
//             >
//               Get Started Today
//             </a>
//             <a
//               href="/services"
//               className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
//             >
//               Learn More
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="px-4 py-16 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
//             Key Features
//           </h2>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             <div className="text-center p-6">
//               <div className="text-blue-600 text-4xl mb-4">🎤</div>
//               <h3 className="text-xl font-semibold mb-2">Voice Integration</h3>
//               <p className="text-gray-600">
//                 Advanced voice capabilities with natural speech recognition and
//                 synthesis
//               </p>
//             </div>
//             <div className="text-center p-6">
//               <div className="text-blue-600 text-4xl mb-4">🌍</div>
//               <h3 className="text-xl font-semibold mb-2">
//                 Multi-Language Support
//               </h3>
//               <p className="text-gray-600">
//                 Communicate with customers in their preferred language
//                 automatically
//               </p>
//             </div>
//             <div className="text-center p-6">
//               <div className="text-blue-600 text-4xl mb-4">📊</div>
//               <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
//               <p className="text-gray-600">
//                 Track customer engagement and chatbot performance with detailed
//                 insights
//               </p>
//             </div>
//             <div className="text-center p-6">
//               <div className="text-blue-600 text-4xl mb-4">🔧</div>
//               <h3 className="text-xl font-semibold mb-2">Custom Integration</h3>
//               <p className="text-gray-600">
//                 Seamlessly integrate with your existing systems and workflows
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Benefits Section */}
//       <div className="px-4 py-16 bg-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-6">
//                 Transform Your Customer Experience
//               </h2>
//               <p className="text-gray-600 mb-6">
//                 Whether you&apos;re a small startup or a large enterprise, our
//                 chatbot solutions can be customized to meet your specific needs
//                 and integrate seamlessly with your existing systems.
//               </p>
//               <ul className="space-y-4">
//                 <li className="flex items-center">
//                   <span className="text-green-500 mr-3">✓</span>
//                   <span className="text-gray-700">
//                     24/7 automated customer support
//                   </span>
//                 </li>
//                 <li className="flex items-center">
//                   <span className="text-green-500 mr-3">✓</span>
//                   <span className="text-gray-700">
//                     Intelligent lead generation and qualification
//                   </span>
//                 </li>
//                 <li className="flex items-center">
//                   <span className="text-green-500 mr-3">✓</span>
//                   <span className="text-gray-700">
//                     Reduced response times and improved satisfaction
//                   </span>
//                 </li>
//                 <li className="flex items-center">
//                   <span className="text-green-500 mr-3">✓</span>
//                   <span className="text-gray-700">
//                     Scalable solution that grows with your business
//                   </span>
//                 </li>
//               </ul>
//             </div>
//             <div className="bg-white p-8 rounded-lg shadow-lg">
//               <h3 className="text-xl font-semibold mb-4">
//                 Ready to get started?
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 Join over 500 companies that have already transformed their
//                 customer experience with our AI chatbot platform.
//               </p>
//               <a
//                 href="/contact"
//                 className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
//               >
//                 Contact Us Today
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CTA Section */}
//       <div className="px-4 py-16 bg-blue-600">
//         <div className="max-w-4xl mx-auto text-center">
//           <h2 className="text-3xl font-bold text-white mb-4">
//             Start Your AI Journey Today
//           </h2>
//           <p className="text-blue-100 mb-8 text-lg">
//             Get personalized assistance and discover how our chatbot platform
//             can revolutionize your customer interactions.
//           </p>
//           <div className="space-x-4">
//             <a
//               href="/pricing"
//               className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
//             >
//               View Pricing
//             </a>
//             <a
//               href="/about"
//               className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
//             >
//               Learn About Us
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import Head from "next/head";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    menuBtn?.addEventListener("click", () =>
      mobileMenu?.classList.toggle("hidden")
    );

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
          ?.textContent?.includes("Let Your Website")
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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <a
              href="#top"
              className="flex items-center gap-2 font-display font-extrabold tracking-tight text-[color:var(--brand-midnight)]"
            >
              <span className="size-7 rounded-lg bg-[conic-gradient(from_220deg,#0069FF,#3BA3FF)]" />
              <span>Agentlytics</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-slate-600">
              {/* Products dropdown */}
              <div className="relative group">
                <button className="inline-flex items-center gap-1 hover:text-slate-900">
                  <span>Products</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-slate-500 group-hover:text-slate-900"
                  >
                    <path
                      d="M5 7l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="absolute left-0 top-full pt-3 z-50  rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                  {/* <div className="grid grid-cols-2 gap-6"> */}
                  <div className="w-[300px]">
                    {/* Core Products */}
                    <div>
                      <div className="text-xs font-medium text-slate-600 mb-3">
                        Core Products
                      </div>
                      <ul className="space-y-3">
                        <li>
                          <a
                            href="/ai-chatbots"
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                          >
                            <span className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              🤖
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">
                                AI Chatbots
                              </div>
                              <div className="text-sm text-slate-600">
                                Advanced conversational AI
                              </div>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="/knowledge-base"
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                          >
                            <span className="size-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                              📚
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">
                                Knowledge Base AI
                              </div>
                              <div className="text-sm text-slate-600">
                                Intelligent self‑service portal
                              </div>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="/lead-generation-basics"
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                          >
                            <span className="size-8 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                              🎯
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">
                                Lead Generation AI
                              </div>
                              <div className="text-sm text-slate-600">
                                Smart lead capture & qualification
                              </div>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a
                            href="/onboarding-ai-bot"
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                          >
                            <span className="size-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                              📊
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">
                                Onboarding AI Bot
                              </div>
                              <div className="text-sm text-slate-600">
                                Onboarding assistant for new visitors
                              </div>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>

                    {/* Advanced Features */}
                    {/* <div>
                      <div className="text-xs font-medium text-slate-600 mb-3">Advanced Features</div>
                      <ul className="space-y-3">
                        <li>
                          <a href="#features" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                            <span className="size-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">🧑‍💻</span>
                            <div>
                              <div className="font-semibold text-slate-900">Live Chat Handoff</div>
                              <div className="text-sm text-slate-600">Seamless human escalation</div>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="/crm-and-analytics-sync" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                            <span className="size-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600">📈</span>
                            <div>
                              <div className="font-semibold text-slate-900">Analytics Dashboard</div>
                              <div className="text-sm text-slate-600">Real‑time performance insights</div>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="/crm-and-analytics-sync" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                            <span className="size-8 flex items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">🔗</span>
                            <div>
                              <div className="font-semibold text-slate-900">Smart Integrations</div>
                              <div className="text-sm text-slate-600">Connect your favorite tools</div>
                            </div>
                          </a>
                        </li>
                        <li>
                          <a href="/multipersona" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                            <span className="size-8 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600">⚙️</span>
                            <div>
                              <div className="font-semibold text-slate-900">Custom Workflows</div>
                              <div className="text-sm text-slate-600">Build custom automation</div>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Solutions dropdown */}
              <div className="relative group">
                <button className="inline-flex items-center gap-1 hover:text-slate-900">
                  <span>Solutions</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-slate-500 group-hover:text-slate-900"
                  >
                    <path
                      d="M5 7l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="absolute left-0 top-full pt-3 z-50 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                  <div className="w-[300px]">
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="/customer-support-ai"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            🤖
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              Customer Support AI
                            </div>
                            <div className="text-sm text-slate-600">
                              Help teams resolve faster with contextual AI that
                              learns from past chats and knowledge bases.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="/sales-conversion-ai"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                            🎯
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              Sales Conversion AI
                            </div>
                            <div className="text-sm text-slate-600">
                              Turn idle visitors into qualified leads through
                              proactive engagement and behavioral triggers.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="/onboarding-automation"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                            🚀
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              Onboarding Automation
                            </div>
                            <div className="text-sm text-slate-600">
                              Converts static onboarding into interactive AI‑led
                              guidance.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="/knowledge-automation"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            📚
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              Knowledge Automation
                            </div>
                            <div className="text-sm text-slate-600">
                              Auto‑organize and surface information
                              intelligently across your help center and
                              chatbots.
                            </div>
                          </div>
                        </a>
                      </li>
                      <li>
                        <a
                          href="/cx-analytics-dashboard"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                            📈
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              CX Analytics Dashboard
                            </div>
                            <div className="text-sm text-slate-600">
                              Gain actionable insights from every customer
                              interaction — sentiment, resolution, and intent.
                            </div>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

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
              <a
                href="/demo"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                Book a Demo
              </a>
              <a
                href="#trial"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--brand-blue)] text-white hover:bg-blue-600"
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
              {/* Mobile Products dropdown */}
              <details className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Products</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-slate-500 transition-transform group-open:rotate-180"
                  >
                    <path
                      d="M5 7l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="px-3 pb-3 grid gap-2 text-slate-800">
                  <a
                    href="/ai-chatbots"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    AI Chatbots
                  </a>
                  <a
                    href="/knowledge-base"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Knowledge Base AI
                  </a>
                  <a
                    href="/lead-generation-basics"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Lead Generation AI
                  </a>
                  <a
                    href="/onboarding-ai-bot"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Onboarding AI Bot
                  </a>
                </div>
              </details>

              {/* Mobile Solutions dropdown */}
              <details className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Solutions</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-slate-500 transition-transform group-open:rotate-180"
                  >
                    <path
                      d="M5 7l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="px-3 pb-3 grid gap-2 text-slate-800">
                  <a
                    href="/customer-support-ai"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Customer Support AI
                  </a>
                  <a
                    href="/sales-conversion-ai"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Sales Conversion AI
                  </a>
                  <a
                    href="/onboarding-automation"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Onboarding Automation
                  </a>
                  <a
                    href="/knowledge-automation"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    Knowledge Automation
                  </a>
                  <a
                    href="/cx-analytics-dashboard"
                    className="block px-2 py-2 rounded hover:bg-slate-50"
                  >
                    CX Analytics Dashboard
                  </a>
                </div>
              </details>
              <a href="#problem">Problem</a>
              <a href="#value">Value</a>
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <div className="pt-2 border-t border-slate-200 flex gap-3">
                <a
                  href="/demo"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300"
                >
                  Book a Demo
                </a>
                <a
                  href="#trial"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--brand-blue)] text-white"
                >
                  Start Free Trial
                </a>
              </div>
            </nav>
          </div>
        </header>

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
                  Let Your Website Talk First — and Win More Conversions
                </h1>
                <p className="text-slate-700 mt-4 max-w-xl">
                  Agentlytics greets high-intent visitors, qualifies leads,{" "}
                  <strong>books sales calls (no third-party tools)</strong>,
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

            <div className="mt-10 flex flex-wrap items-center gap-4 text-slate-500 text-sm reveal">
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
        </section>

        {/* PROBLEM */}
        <section
          id="problem"
          className="py-24 relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100/50"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[color:var(--brand-midnight)] mb-4">
              Reactive Chatbots Are Losing You Customers
            </h2>
            <p className="text-slate-700 max-w-3xl mx-auto mb-12">
              Most chatbots sit idle until someone types. Agentlytics initiates
              conversations when intent peaks — scroll depth, pricing page
              dwell, exit intent — so you capture leads before they leave.
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
            <div className="relative bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-[0_12px_34px_rgba(2,6,23,.08)] p-6 group hover:-translate-y-1 transition-transform">
              <h3 className="font-semibold text-lg text-slate-900 mb-1">
                Reactive Bot
              </h3>
              <p className="text-slate-700 mb-6">
                Stays idle · No context · Missed intent → <em>Bounce</em>
              </p>
              <div className="relative rounded-xl bg-slate-50 border border-slate-200 p-5 overflow-hidden">
                <p className="text-slate-500 italic">“Hi… anyone there?”</p>
                <div className="absolute top-3 right-3 text-slate-400 select-none text-2xl anim-pulseGlow">
                  😴
                </div>
                <div className="absolute bottom-3 left-4 flex items-center gap-1 text-xs text-slate-400">
                  <span className="inline-block size-1 rounded-full bg-slate-300 anim-scrollHint" />
                  <span>visitor scrolls…</span>
                </div>
              </div>
              <div className="absolute -top-3 -left-3 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-[0_6px_16px_rgba(2,6,23,.06)] text-xs anim-wobble">
                💤 Idle Bot
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-[color:var(--brand-blue)]/90 to-[color:var(--brand-sky)]/90 text-white rounded-2xl shadow-[0_12px_34px_rgba(2,6,23,.08)] p-6 group hover:shadow-lg transition-shadow">
              <div className="absolute inset-0 opacity-10 [background-image:url('https://www.toptal.com/designers/subtlepatterns/uploads/dot-grid.png')]" />
              <h3 className="relative font-semibold text-lg mb-1">
                Proactive AI
              </h3>
              <p className="relative mb-6">
                Greets at 60% scroll or price-page dwell · Guides to
                demo/sign-up → <em>Engagement</em>
              </p>
              <div className="relative rounded-xl bg-white/90 text-slate-900 border border-slate-100 p-5 overflow-hidden shadow-[0_6px_16px_rgba(2,6,23,.06)]">
                <p className="font-medium">
                  👋 “Noticed you’re on pricing. Want help picking the best
                  plan?”
                </p>
                <div
                  className="absolute -top-6 -left-6 size-24 rounded-full bg-sky-300/30 anim-radar"
                  aria-hidden="true"
                />
                <div
                  className="absolute -top-6 -left-6 size-24 rounded-full bg-blue-200/40 anim-radar [animation-delay:.6s]"
                  aria-hidden="true"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white text-slate-800 rounded-xl px-3 py-1.5 shadow-[0_6px_16px_rgba(2,6,23,.06)] text-xs anim-floaty pointer-events-none z-10">
                ⚡ Engaging in real time
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
        <section id="features" className="py-24 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 w-[34rem] h-[34rem] rounded-full bg-blue-50 blur-3xl opacity-60" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 w-[38rem] h-[38rem] rounded-full bg-sky-50 blur-3xl opacity-60" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center reveal">
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900">
                Inside the Agentlytics Engine
              </h2>
              <p className="text-slate-700 mt-3">
                Six modular intelligence blocks — working together to engage,
                qualify, and convert.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
              {/* Feature cards (1..6) */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <article
                  key={i}
                  className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-[color:var(--brand-blue)] via-[color:var(--brand-sky)] to-[color:var(--brand-blue)] anim-shimmer"
                >
                  <div className="relative rounded-2xl bg-white backdrop-blur-md p-5 border border-slate-200 shadow-[0_12px_34px_rgba(2,6,23,.08)] transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      <div className="size-10 grid place-items-center rounded-lg bg-blue-50 text-[color:var(--brand-blue)]">
                        {["🧭", "🤖", "✅", "📅", "📊", "🔗"][i - 1]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">
                          {
                            [
                              "Behavioral Triggers",
                              "Multi-Persona AI",
                              "BANT-Based Qualification",
                              "Built-in Scheduling",
                              "9-Metric Scoring",
                              "CRM & Analytics Sync",
                            ][i - 1]
                          }
                        </h3>
                        <p className="text-slate-700">
                          {
                            [
                              "Detects dwell time, scroll depth, and exit intent — adapts responses automatically.",
                              "Switches between Lead, Sales, Onboarding, and Support — with full context carryover.",
                              "Analyzes Budget, Authority, Need, and Timeline in real time to route high-intent prospects.",
                              "Offer slots, book instantly, and reschedule/cancel — right inside the chat.",
                              "Clarity, Accuracy, Tone, Empathy, Personalization, Speed, Resolution, Sentiment, Proactive Help.",
                              "HubSpot, Salesforce, GA4, Intercom, Slack — seamless data flow, zero manual exports.",
                            ][i - 1]
                          }
                        </p>
                        <a
                          className="inline-flex items-center gap-1 text-sm text-[color:var(--brand-blue)] opacity-0 group-hover:opacity-100 transition mt-2"
                          href={
                            i === 1
                              ? "/behavioral-trigger"
                              : i === 2
                              ? "/multipersona"
                              : i === 3
                              ? "/bant-based-qualification"
                              : i === 4
                              ? "/built-in-scheduling"
                              : i === 5
                              ? "https://www.advancelytics.com"
                              : i === 6
                              ? "/crm-and-analytics-sync"
                              : "#"
                          }
                        >
                          Learn more ▸
                        </a>
                      </div>
                    </div>
                    {i === 1 && (
                      <>
                        <div
                          className="absolute -right-2 -bottom-2 size-16 rounded-full bg-blue-100/60 anim-radar"
                          aria-hidden="true"
                        />
                        <div
                          className="absolute -right-6 -bottom-6 size-16 rounded-full bg-blue-200/40 anim-radar [animation-delay:.6s]"
                          aria-hidden="true"
                        />
                      </>
                    )}
                    {i === 2 && (
                      <div
                        className="pointer-events-none absolute right-4 bottom-4 flex gap-1"
                        aria-hidden="true"
                      >
                        <span className="inline-block size-2 rounded-full bg-[color:var(--brand-blue)] anim-breath" />
                        <span className="inline-block size-2 rounded-full bg-[color:var(--brand-sky)] anim-breath [animation-delay:.2s]" />
                        <span className="inline-block size-2 rounded-full bg-[color:var(--brand-blue)] anim-breath [animation-delay:.4s]" />
                      </div>
                    )}
                    {i === 4 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="h-6 rounded-md border border-slate-200 grid place-items-center text-center text-sm font-light">
                          10:00
                        </div>
                        <div className="h-6 rounded-md border border-slate-200 grid place-items-center text-center text-sm font-light">
                          12:30
                        </div>
                        <div className="h-6 rounded-md border border-slate-200 grid place-items-center text-center text-sm font-light">
                          15:00
                        </div>
                      </div>
                    )}
                    {i === 5 && (
                      <div className="mt-3 h-20 grid grid-rows-3 gap-1">
                        <div className="h-2 bg-slate-200 overflow-hidden rounded">
                          <div className="h-2 w-3/4 bg-gradient-to-r from-[color:var(--brand-blue)] to-[color:var(--brand-sky)] group-hover:w-[85%] transition-[width] duration-500" />
                        </div>
                        <div className="h-2 bg-slate-200 overflow-hidden rounded">
                          <div className="h-2 w-2/3 bg-gradient-to-r from-[color:var(--brand-blue)] to-[color:var(--brand-sky)] group-hover:w-[78%] transition-[width] duration-500" />
                        </div>
                        <div className="h-2 bg-slate-200 overflow-hidden rounded">
                          <div className="h-2 w-1/2 bg-gradient-to-r from-[color:var(--brand-blue)] to-[color:var(--brand-sky)] group-hover:w-[68%] transition-[width] duration-500" />
                        </div>
                      </div>
                    )}
                    {i === 6 && (
                      <div
                        className="pointer-events-none absolute right-4 bottom-3 flex items-center gap-1"
                        aria-hidden="true"
                      >
                        <span className="inline-block size-1.5 rounded-full bg-[color:var(--brand-blue)] anim-breath" />
                        <span className="inline-block w-6 h-[2px] bg-[color:var(--brand-sky)]" />
                        <span className="inline-block size-1.5 rounded-full bg-[color:var(--brand-blue)] anim-breath [animation-delay:.2s]" />
                      </div>
                    )}
                  </div>
                </article>
              ))}
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
