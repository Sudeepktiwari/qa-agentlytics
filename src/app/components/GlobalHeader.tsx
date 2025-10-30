"use client";
import React from "react";

export default function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2 font-display font-extrabold tracking-tight text-[color:var(--brand-midnight)]"
        >
          <span className="size-7 rounded-lg bg-[conic-gradient(from_220deg,#0069FF,#3BA3FF)]" />
          <span>Agentlytics</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-slate-600">
          {/* Products dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1 hover:text-slate-900">
              <span>Products</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-500 group-hover:text-slate-900">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute left-0 top-full pt-3 z-50 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              <div className="w-[300px]">
                <ul className="space-y-3">
                  <li>
                    <a href="/ai-chatbots" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">🤖</span>
                      <div>
                        <div className="font-semibold text-slate-900">AI Chatbots</div>
                        <div className="text-sm text-slate-600">Advanced conversational AI</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/knowledge-base" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">📚</span>
                      <div>
                        <div className="font-semibold text-slate-900">Knowledge Base AI</div>
                        <div className="text-sm text-slate-600">Intelligent self‑service portal</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/lead-generation-basics" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">🎯</span>
                      <div>
                        <div className="font-semibold text-slate-900">Lead Generation AI</div>
                        <div className="text-sm text-slate-600">Smart lead capture & qualification</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/onboarding-ai-bot" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600">📊</span>
                      <div>
                        <div className="font-semibold text-slate-900">Onboarding AI Bot</div>
                        <div className="text-sm text-slate-600">Onboarding assistant for new visitors</div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Solutions dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1 hover:text-slate-900">
              <span>Solutions</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-500 group-hover:text-slate-900">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute left-0 top-full pt-3 z-50 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              <div className="w-[300px]">
                <ul className="space-y-3">
                  <li>
                    <a href="/customer-support-ai" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">🤖</span>
                      <div>
                        <div className="font-semibold text-slate-900">Customer Support AI</div>
                        <div className="text-sm text-slate-600">Contextual AI that learns from past chats and knowledge bases.</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/sales-conversion-ai" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">🎯</span>
                      <div>
                        <div className="font-semibold text-slate-900">Sales Conversion AI</div>
                        <div className="text-sm text-slate-600">Proactive engagement and behavioral triggers.</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/onboarding-automation" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600">🚀</span>
                      <div>
                        <div className="font-semibold text-slate-900">Onboarding Automation</div>
                        <div className="text-sm text-slate-600">Interactive AI‑led guidance.</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/knowledge-automation" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">📚</span>
                      <div>
                        <div className="font-semibold text-slate-900">Knowledge Automation</div>
                        <div className="text-sm text-slate-600">Auto‑organize and surface information intelligently.</div>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="/cx-analytics-dashboard" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                      <span className="size-8 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600">📈</span>
                      <div>
                        <div className="font-semibold text-slate-900">CX Analytics Dashboard</div>
                        <div className="text-sm text-slate-600">Insights from every customer interaction.</div>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Platforms & Partners dropdown */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1 hover:text-slate-900">
              <span>Platforms & Partners</span>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-500 group-hover:text-slate-900">
                <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="absolute left-0 top-full pt-3 z-50 rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(2,6,23,.10)] p-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
              <div className="w-[300px]">
                <ul className="space-y-3">
                  {[
                    "Agentlytics + Agentforce",
                    "Agentlytics + Hubspot",
                    "Agentlytics + Intercom",
                    "Agentlytics + Drift",
                    "Agentlytics + Freshworks",
                    "Agentlytics + Zoho",
                  ].map((label) => (
                    <li key={label}>
                      <a href="#" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50">
                        <span className="size-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600">🤝</span>
                        <div>
                          <div className="font-semibold text-slate-900">{label}</div>
                          <div className="text-sm text-slate-600">Integration overview and best practices</div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/demo" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50">
            Book a Demo
          </a>
          <a href="#trial" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--brand-blue)] text-white hover:bg-blue-600">
            Start Free Trial
          </a>
        </div>

        {/* Mobile menu trigger */}
        <details className="md:hidden relative">
          <summary className="list-none inline-flex items-center justify-center size-10 rounded-lg border border-slate-300 cursor-pointer" aria-label="Open menu">
            ☰
          </summary>
          <div className="absolute right-0 top-full z-50 w-[60vw] ml-auto bg-white border-t border-slate-200 shadow-sm">
            <nav className="px-6 py-4 grid gap-4 text-slate-800">
              {/* Mobile Products dropdown */}
              <details className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Products</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-500 transition-transform group-open:rotate-180">
                    <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-3 pb-3 grid gap-2 text-slate-800">
                  <a href="/ai-chatbots" className="block px-2 py-2 rounded hover:bg-slate-50">AI Chatbots</a>
                  <a href="/knowledge-base" className="block px-2 py-2 rounded hover:bg-slate-50">Knowledge Base AI</a>
                  <a href="/lead-generation-basics" className="block px-2 py-2 rounded hover:bg-slate-50">Lead Generation AI</a>
                  <a href="/onboarding-ai-bot" className="block px-2 py-2 rounded hover:bg-slate-50">Onboarding AI Bot</a>
                </div>
              </details>

              {/* Mobile Solutions dropdown */}
              <details className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Solutions</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-500 transition-transform group-open:rotate-180">
                    <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-3 pb-3 grid gap-2 text-slate-800">
                  <a href="/customer-support-ai" className="block px-2 py-2 rounded hover:bg-slate-50">Customer Support AI</a>
                  <a href="/sales-conversion-ai" className="block px-2 py-2 rounded hover:bg-slate-50">Sales Conversion AI</a>
                  <a href="/onboarding-automation" className="block px-2 py-2 rounded hover:bg-slate-50">Onboarding Automation</a>
                  <a href="/knowledge-automation" className="block px-2 py-2 rounded hover:bg-slate-50">Knowledge Automation</a>
                  <a href="/cx-analytics-dashboard" className="block px-2 py-2 rounded hover:bg-slate-50">CX Analytics Dashboard</a>
                </div>
              </details>

              {/* Mobile Platforms & Partners dropdown */}
              <details className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-3 py-2 cursor-pointer">
                  <span>Platforms & Partners</span>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="text-slate-500 transition-transform group-open:rotate-180">
                    <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  ].map((label) => (
                    <a key={label} href="#" className="block px-2 py-2 rounded hover:bg-slate-50">{label}</a>
                  ))}
                </div>
              </details>

              <div className="flex-row space-y-2 pt-2 border-t border-slate-200 gap-3">
                <a href="/demo" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300">Book a Demo</a>
                <a href="#trial" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--brand-blue)] text-white">Start Free Trial</a>
              </div>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}