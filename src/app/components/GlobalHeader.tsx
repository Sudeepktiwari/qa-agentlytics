"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GlobalHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const headerPositionClasses = "relative";
  // Mobile accordion refs so only one dropdown stays open at a time
  const productsRef = useRef<HTMLDetailsElement | null>(null);
  const solutionsRef = useRef<HTMLDetailsElement | null>(null);
  const platformsRef = useRef<HTMLDetailsElement | null>(null);
  const othersRef = useRef<HTMLDetailsElement | null>(null);
  // Root mobile menu ref for click-outside close
  const mobileMenuRef = useRef<HTMLDetailsElement | null>(null);

  // Desktop dropdown controlled hover state
  const [hoveredDropdown, setHoveredDropdown] = useState<
    null | "products" | "solutions" | "platforms" | "others"
  >(null);

  // Helper: close all <details> menus
  const closeAllMenus = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
    if (productsRef.current) productsRef.current.open = false;
    if (solutionsRef.current) solutionsRef.current.open = false;
    if (platformsRef.current) platformsRef.current.open = false;
    if (othersRef.current) othersRef.current.open = false;
    setHoveredDropdown(null);
  };

  // On route change, force-close any open menus and briefly suppress hover dropdowns
  useEffect(() => {
    // On route change, close mobile menus and ensure desktop dropdowns are hidden
    closeAllMenus();
  }, [pathname]);

  // Close mobile menu when clicking/touching outside
  useEffect(() => {
    const handlePointerDown = (e: Event) => {
      const target = e.target as Node | null;
      const mobileMenu = mobileMenuRef.current;
      if (!mobileMenu) return;
      if (!mobileMenu.open) return;
      if (target && mobileMenu.contains(target)) return;
      mobileMenu.open = false;
    };
    // Use capture so we catch early, and work for both mouse/touch/pointer
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);
  return (
    <header
      data-global-header
      className={`${headerPositionClasses} z-50 bg-white/80 backdrop-blur border-b border-slate-200`}
    >
      <div className="max-w-7xl mx-auto h-16 px-4 md:p-6 flex items-center justify-between">
        <Link
          href="/"
          // className="flex items-center gap-2 font-display font-extrabold tracking-tight text-[color:var(--brand-midnight)]"
        >
          {/* <span className="size-7 rounded-lg bg-[conic-gradient(from_220deg,#0069FF,#3BA3FF)] " /> */}
          <span className="font-bold text-lg hidden md:inline">
            Advancelytics
          </span>
          <span className="font-bold md:hidden">Agentlytics</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-6 text-slate-600"
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest("a")) {
              // Close any open desktop dropdown when a link is clicked
              setHoveredDropdown(null);
            }
          }}
        >
          {/* Products dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredDropdown("products")}
            onMouseLeave={() => setHoveredDropdown(null)}
          >
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
            <div
              className={`absolute left-0 top-full pt-3 z-[100] rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 ${
                hoveredDropdown === "products"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) setHoveredDropdown(null);
              }}
            >
              <div className="w-[300px]">
                <ul className="space-y-3">
                  <li>
                    <Link
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
                    </Link>
                  </li>
                  <li>
                    <Link
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
                    </Link>
                  </li>
                  <li>
                    <Link
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
                    </Link>
                  </li>
                  <li>
                    <Link
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
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Solutions dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredDropdown("solutions")}
            onMouseLeave={() => setHoveredDropdown(null)}
          >
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
            <div
              className={`absolute left-0 top-full pt-3 z-[100] rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 ${
                hoveredDropdown === "solutions"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) setHoveredDropdown(null);
              }}
            >
              <div className="w-[300px]">
                <ul className="space-y-3">
                  <li>
                    <Link
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
                          Contextual AI that learns from past chats and
                          knowledge bases.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
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
                          Proactive engagement and behavioral triggers.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
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
                          Interactive AI‑led guidance.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
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
                          Auto‑organize and surface information intelligently.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
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
                          Insights from every customer interaction.
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Platforms & Partners dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredDropdown("platforms")}
            onMouseLeave={() => setHoveredDropdown(null)}
          >
            <button className="inline-flex items-center gap-1 hover:text-slate-900">
              <span>Platforms & Partners</span>
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
            <div
              className={`absolute left-0 top-full pt-3 z-[100] rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 ${
                hoveredDropdown === "platforms"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) setHoveredDropdown(null);
              }}
            >
              <div className="w-[300px]">
                <ul className="space-y-3">
                  {[
                    "Agentlytics + Agentforce",
                    "Agentlytics + Hubspot",
                    "Agentlytics + Intercom",
                    "Agentlytics + Drift",
                    "Agentlytics + Freshworks",
                    "Agentlytics + Zoho",
                  ].map((label, idx) => (
                    <li key={label}>
                      {idx === 0 ? (
                        <Link
                          href="/agentlytics+agentforce"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            🤝
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </Link>
                      ) : idx === 1 ? (
                        <Link
                          href="/agentlytics+hubspot"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            ⚙️
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </Link>
                      ) : idx === 2 ? (
                        <Link
                          href="/agentlytics+intercom"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            💬
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </Link>
                      ) : idx === 3 ? (
                        <Link
                          href="/agentlytics+drift"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            🚀
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </Link>
                      ) : idx === 4 ? (
                        <Link
                          href="/agentlytics+freshworks"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            🌱
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </Link>
                      ) : idx === 5 ? (
                        <Link
                          href="/agentlytics+zoho"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            🔍
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <a
                          href="#"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                        >
                          <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                            🤝
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {label}
                            </div>
                            <div className="text-sm text-slate-600">
                              Integration overview and best practices
                            </div>
                          </div>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Others dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setHoveredDropdown("others")}
            onMouseLeave={() => setHoveredDropdown(null)}
          >
            <button className="inline-flex items-center gap-1 hover:text-slate-900">
              <span>Others</span>
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
            <div
              className={`absolute left-0 top-full pt-3 z-[100] rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 ${
                hoveredDropdown === "others"
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) setHoveredDropdown(null);
              }}
            >
              <div className="w-[300px]">
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/multipersona"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <span className="size-8 flex items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        👥
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          Multipersona
                        </div>
                        <div className="text-sm text-slate-600">
                          Build assistants for multiple roles.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/bant-based-qualification"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <span className="size-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        ✅
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          BANT‑Based Qualification
                        </div>
                        <div className="text-sm text-slate-600">
                          Qualify leads by Budget, Authority, Need, Timeline.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/behavioral-trigger"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <span className="size-8 flex items-center justify-center rounded-lg bg-lime-50 text-lime-600">
                        🔔
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          Behavioral Trigger
                        </div>
                        <div className="text-sm text-slate-600">
                          Automations based on real user behavior.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/crm-and-analytics-sync"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <span className="size-8 flex items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                        🔄
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          CRM & Analytics Sync
                        </div>
                        <div className="text-sm text-slate-600">
                          Keep CRM and analytics data in lockstep.
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/pricing"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50"
                    >
                      <span className="size-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        💵
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          Pricing
                        </div>
                        <div className="text-sm text-slate-600">
                          Plans for startups to enterprises.
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            Book a Demo
          </Link>
          <a
            href="#trial"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--brand-blue)] text-white hover:bg-blue-600"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile menu trigger */}
        <details ref={mobileMenuRef} className="md:hidden relative group">
          <summary
            className="list-none inline-flex items-center justify-center size-10 rounded-lg border border-slate-300 cursor-pointer"
            aria-label="Open menu"
          >
            ☰
          </summary>
          <div className="absolute right-0 top-full z-50 w-[80vw] ml-auto bg-white border-t border-slate-200 shadow-sm">
            <nav
              className="px-4 py-2 grid gap-4 text-slate-800"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) {
                  // Close on link click for mobile menu
                  closeAllMenus();
                }
              }}
            >
              {/* Mobile Products dropdown */}
              <details
                ref={productsRef}
                className="group border border-slate-200 rounded-lg"
                onToggle={() => {
                  if (productsRef.current?.open) {
                    if (solutionsRef.current) solutionsRef.current.open = false;
                    if (platformsRef.current) platformsRef.current.open = false;
                    if (othersRef.current) othersRef.current.open = false;
                  }
                }}
              >
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
                <div className="px-3 pb-2 grid gap-2 text-slate-800">
                  <Link
                    href="/ai-chatbots"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    AI Chatbots
                  </Link>
                  <Link
                    href="/knowledge-base"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Knowledge Base AI
                  </Link>
                  <Link
                    href="/lead-generation-basics"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Lead Generation AI
                  </Link>
                  <Link
                    href="/onboarding-ai-bot"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Onboarding AI Bot
                  </Link>
                </div>
              </details>

              {/* Mobile Solutions dropdown */}
              <details
                ref={solutionsRef}
                className="group border border-slate-200 rounded-lg"
                onToggle={() => {
                  if (solutionsRef.current?.open) {
                    if (productsRef.current) productsRef.current.open = false;
                    if (platformsRef.current) platformsRef.current.open = false;
                    if (othersRef.current) othersRef.current.open = false;
                  }
                }}
              >
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
                <div className="px-3 pb-2 grid gap-2 text-slate-800">
                  <Link
                    href="/customer-support-ai"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Customer Support AI
                  </Link>
                  <Link
                    href="/sales-conversion-ai"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Sales Conversion AI
                  </Link>
                  <Link
                    href="/onboarding-automation"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Onboarding Automation
                  </Link>
                  <Link
                    href="/knowledge-automation"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Knowledge Automation
                  </Link>
                  <Link
                    href="/cx-analytics-dashboard"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    CX Analytics Dashboard
                  </Link>
                </div>
              </details>

              {/* Mobile Platforms & Partners dropdown */}
              <details
                ref={platformsRef}
                className="group border border-slate-200 rounded-lg"
                onToggle={() => {
                  if (platformsRef.current?.open) {
                    if (productsRef.current) productsRef.current.open = false;
                    if (solutionsRef.current) solutionsRef.current.open = false;
                    if (othersRef.current) othersRef.current.open = false;
                  }
                }}
              >
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Platforms & Partners</span>
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
                  {[
                    "Agentlytics + Agentforce",
                    "Agentlytics + Hubspot",
                    "Agentlytics + Intercom",
                    "Agentlytics + Drift",
                    "Agentlytics + Freshworks",
                    "Agentlytics + Zoho",
                  ].map((label, idx) => {
                    const href =
                      idx === 0
                        ? "/agentlytics+agentforce"
                        : idx === 1
                        ? "/agentlytics+hubspot"
                        : idx === 2
                        ? "/agentlytics+intercom"
                        : idx === 3
                        ? "/agentlytics+drift"
                        : idx === 4
                        ? "/agentlytics+freshworks"
                        : idx === 5
                        ? "/agentlytics+zoho"
                        : "#";
                    return href === "#" ? (
                      <a
                        key={label}
                        href="#"
                        className="block px-2 py-1 rounded hover:bg-slate-50"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        key={label}
                        href={href}
                        className="block px-2 py-1 rounded hover:bg-slate-50"
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </details>
              {/* Mobile Others dropdown */}
              <details
                ref={othersRef}
                className="group border border-slate-200 rounded-lg"
                onToggle={() => {
                  if (othersRef.current?.open) {
                    if (productsRef.current) productsRef.current.open = false;
                    if (solutionsRef.current) solutionsRef.current.open = false;
                    if (platformsRef.current) platformsRef.current.open = false;
                  }
                }}
              >
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Others</span>
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
                <div className="px-3 pb-2 grid gap-2 text-slate-800">
                  <Link
                    href="/multipersona"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Multipersona
                  </Link>
                  <Link
                    href="/bant-based-qualification"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    BANT‑Based Qualification
                  </Link>
                  <Link
                    href="/behavioral-trigger"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Behavioral Trigger
                  </Link>
                  <Link
                    href="/crm-and-analytics-sync"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    CRM & Analytics Sync
                  </Link>

                  <Link
                    href="/pricing"
                    className="block px-2 py-1 rounded hover:bg-slate-50"
                  >
                    Pricing
                  </Link>
                </div>
              </details>
              <div className="flex-row space-y-2 pt-2 border-t border-slate-200 gap-3">
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-4 py-2 w-full justify-center rounded-lg border border-slate-300"
                >
                  Book a Demo
                </Link>
                <a
                  href="#trial"
                  className="inline-flex items-center gap-2 px-4 py-2 w-full justify-center rounded-lg bg-[color:var(--brand-blue)] text-white"
                >
                  Start Free Trial
                </a>
              </div>
            </nav>
          </div>
          {/* Click-outside backdrop: appears only when menu is open */}
          <div
            className="fixed inset-0 z-40 md:hidden hidden group-open:block bg-transparent"
            aria-label="Close menu"
            onClick={() => {
              if (mobileMenuRef.current) mobileMenuRef.current.open = false;
            }}
          />
        </details>
      </div>
    </header>
  );
}
