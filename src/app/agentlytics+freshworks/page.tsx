"use client";
import { useEffect, useState } from "react";

export default function FreshworksIntegrationPage() {
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
          <h1 className="text-3xl font-bold text-slate-900">Agentlytics + Freshworks</h1>
          <p className="mt-4 text-slate-700">
            Connect Freshworks to Agentlytics to unify support analytics and automate workflows.
          </p>
        </section>
        <section id="setup" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Setup</h2>
          <ul className="mt-4 list-disc list-inside text-slate-700">
            <li>Create an API key and set base URL.</li>
            <li>Enable ticket and conversation webhooks.</li>
            <li>Configure user and account field mappings.</li>
          </ul>
        </section>
        <section id="analytics" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
          <p className="mt-4 text-slate-700">Measure deflection, resolution SLAs, and agent assist impact.</p>
        </section>
        <section id="faq" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
          <p className="mt-4 text-slate-700">Details on authentication, rate limits, and sync cadence.</p>
        </section>
      </main>
    </div>
  );
}