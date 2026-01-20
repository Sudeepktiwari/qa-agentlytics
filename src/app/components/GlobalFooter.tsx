"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function GlobalFooter() {
  const pathname = usePathname();

  // Don't render on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
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
          <a href="/#features" className="block text-slate-700">
            Features
          </a>
          <a href="/#how" className="block text-slate-700">
            How it works
          </a>
          <a href="/#pricing" className="block text-slate-700">
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
          <a
            href="https://www.advancelytics.com/privacy"
            className="block text-slate-700"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.advancelytics.com/terms"
            className="block text-slate-700"
          >
            Terms of Service
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-slate-500">
        © 2025 Agentlytics. All rights reserved.
      </div>
    </footer>
  );
}
