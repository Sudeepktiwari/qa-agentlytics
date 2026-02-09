"use client";
// components/SecuritySection.jsx
import React from "react";

export default function SecuritySection({
  brand = { primary: "var(--brand-primary)" },
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const rows = [
    { k: "Data residency", v: "EU · US · IN", icon: "🌐" },
    { k: "SSO / SAML", v: "Okta, Azure AD", icon: "🔐" },
    { k: "PII controls", v: "Redact & mask", icon: "🛡️" },
    { k: "Audit", v: "Full event log", icon: "📜" },
  ];

  return (
    <section
      id="security"
      className="mx-auto max-w-7xl rounded-3xl bg-[--surface] px-4 py-16 sm:px-6 scroll-mt-24"
      aria-labelledby="security-heading"
    >
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: headline + copy */}
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <h2
            id="security-heading"
            className="text-3xl font-bold tracking-tight text-slate-900"
          >
            Built for security-first teams
          </h2>
          <p className="mt-3 max-w-xl text-slate-600">
            Enterprise-grade controls ensure privacy at every step — from
            field-level redaction to audit trails.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/60 text-[14px]">
                🛡️
              </span>
              <span>Field-level redaction and least-privilege scopes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/60 text-[14px]">
                📍
              </span>
              <span>Region-aware data residency and encryption at rest</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/60 text-[14px]">
                🔐
              </span>
              <span>SSO / SAML, SCIM provisioning, and role-based access</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/60 text-[14px]">
                🧾
              </span>
              <span>Full audit trail of agent actions and admin events</span>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              SOC 2
            </span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              GDPR Compliant
            </span>

            <a
              href="#compliance"
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:shadow-md"
              style={{ border: `1px solid rgba(15,23,42,0.04)` }}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 3v12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 7h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download compliance pack
            </a>
          </div>
        </div>

        {/* Right: compliance snapshot cards */}
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">
                Compliance Snapshot
              </div>
              <div className="text-xs text-slate-500">Enterprise-ready</div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {rows.map((r) => (
                <div key={r.k} className="rounded-xl bg-[--surface] p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500">{r.k}</div>
                      <div className="mt-1 font-medium text-slate-800">
                        {r.v}
                      </div>
                    </div>
                    <div className="ml-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg">
                        {r.icon}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-[--surface] p-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-500">
                    Risk level
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    Low
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Data encryption</div>
                  <div className="mt-1 text-sm font-medium text-slate-800">
                    AES-256
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="#security-details"
                className="inline-flex items-center gap-2 rounded-md bg-[--brand-primary] px-4 py-2 text-sm font-semibold text-white shadow"
                style={{ backgroundColor: brand.primary }}
              >
                View security docs
              </a>
              <a
                href="#contact-sales"
                className="text-sm font-medium text-slate-700"
              >
                Request enterprise review
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
