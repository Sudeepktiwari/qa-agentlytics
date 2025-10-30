"use client";
import { useEffect, useState } from "react";

export default function DriftIntegrationPage() {
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
          <h1 className="text-3xl font-bold text-slate-900">Agentlytics + Drift</h1>
          <p className="mt-4 text-slate-700">
            Integrate Drift with Agentlytics to automate lead capture and qualify conversations in real time.
          </p>
        </section>
        <section id="setup" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Setup</h2>
          <ul className="mt-4 list-disc list-inside text-slate-700">
            <li>Create an API token and configure webhook endpoints.</li>
            <li>Enable event subscriptions for chat started and qualified lead events.</li>
            <li>Map Drift attributes to Agentlytics lead schema.</li>
          </ul>
        </section>
        <section id="analytics" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">Analytics</h2>
          <p className="mt-4 text-slate-700">Monitor conversion funnel and qualification accuracy.</p>
        </section>
        <section id="faq" className="scroll-mt-24 mt-12">
          <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
          <p className="mt-4 text-slate-700">Answers for auth scopes, webhook retries, and rate limits.</p>
        </section>
      </main>
    </div>
  );
}