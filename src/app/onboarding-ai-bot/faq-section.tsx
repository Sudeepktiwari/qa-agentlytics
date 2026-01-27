"use client";
import React from "react";

const faqs = [
  {
    q: "Can I use my website URL instead of a sitemap?",
    a: "Yes! Our crawler is designed to work with both. You can provide your main website URL (e.g., https://example.com) and we will automatically discover and index your pages. Alternatively, you can provide a direct sitemap URL (e.g., https://example.com/sitemap.xml) for more precise control.",
  },
  {
    q: "What is the difference between providing a Sitemap vs Website URL?",
    a: "Providing a Website URL lets our crawler explore your site naturally, following links to find content. Providing a Sitemap URL gives us a direct list of exactly which pages you want indexed, which can be faster for large sites.",
  },
  {
    q: "How does the onboarding bot use my data?",
    a: "The onboarding bot uses your provided documentation and website content to learn about your product. It then uses this knowledge to guide new users, answer their questions contextually, and help them set up their accounts.",
  },
  {
    q: "Is the onboarding bot secure?",
    a: "Yes. The bot operates within strict boundaries, using only the data you provide. It respects role-based access controls and ensures that sensitive information is handled according to your privacy policies.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {faqs.map((f, i) => (
          <details key={i} className="group p-6 open:bg-slate-50">
            <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-slate-900">
              {f.q}
              <span className="ml-4 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500 group-open:rotate-90 transition">
                ›
              </span>
            </summary>
            <p className="mt-4 text-sm leading-6 text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
