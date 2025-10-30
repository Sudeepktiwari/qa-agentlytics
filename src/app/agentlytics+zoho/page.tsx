"use client";
import { useEffect, useState } from "react";

export default function ZohoIntegrationPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="scroll-smooth">
      <header
        className={`${scrolled ? "top-0" : "top-16"} fixed left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 transition-[top] duration-200`}
      >
        <div className="w-full h-16 flex items-center justify-center">
          <nav className="flex items-center gap-4 md:gap-6 text-slate-600 text-sm">
            <a href="#integration" className="hover:text-slate-900">Overview</a>
            <a href="#setup" className="hover:text-slate-900">Setup</a>
            <a href="#analytics" className="hover:text-slate-900">Analytics</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
        </div>
      </header>
      <div className={scrolled ? "h-16" : "h-0"} />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <section id="integration" className="scroll-mt-24">
          <h1 className="text-3xl font-bold text-slate-900">Agentlytics + Zoho</h1>
          <p className="mt-4 text-slate-700">
            Integrate Zoho with Agentlytics to analyze omnichannel support and automate data flows.
          </p>
        </section>
        <section id="setup" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Setup</h2>
          <ul className="mt-4 list-disc list-inside text-slate-700">
            <li>Generate OAuth credentials and configure callback URLs.</li>
            <li>Enable event subscriptions for tickets and chats.</li>
            <li>Map Zoho modules to Agentlytics entities.</li>
          </ul>
        </section>
        <section id="analytics" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
          <p className="mt-4 text-slate-700">Track SLA adherence, automation assist, and CSAT trends.</p>
        </section>
        <section id="faq" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
          <p className="mt-4 text-slate-700">Guidance on permissions, rate limiting, and data sync.</p>
        </section>
      </main>
    </div>
  );
}