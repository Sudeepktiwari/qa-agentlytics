// components/TrustedLogos.jsx
import React from "react";
import {
  SiHubspot,
  SiSalesforce,
  SiSlack,
  SiStripe,
  SiGoogle,
} from "react-icons/si";
import { TfiMicrosoftAlt } from "react-icons/tfi";
import { FaAws } from "react-icons/fa";
/**
 * TrustedLogos (react-icons version)
 * - Uses react-icons/si logos for a realistic marquee
 * - Accepts optional `logos` prop to override
 */
export default function TrustedLogos({
  logos = DEFAULT_LOGOS,
  brand = { primary: "var(--brand-primary)" },
}) {
  const doubled = [...logos, ...logos];

  return (
    <section
      id="logos"
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 scroll-mt-24"
    >
      <div
        className="rounded-2xl bg-white/90 p-4 sm:p-6 shadow-md ring-1 ring-black/5"
        style={{ borderRadius: "1rem" }}
      >
        <p className="text-center text-sm font-semibold text-slate-600">
          Trusted by teams at
        </p>

        {/* marquee */}
        <div className="mt-4">
          <div className="hidden sm:block">
            <div className="relative overflow-hidden rounded-lg">
              <div
                className="trusted-track will-change-transform flex items-center gap-6 py-3"
                role="list"
                aria-label="Trusted company logos"
              >
                {doubled.map(({ name, Icon }, idx) => (
                  <div
                    key={`${name}-${idx}`}
                    role="listitem"
                    className="flex h-12 w-[160px] items-center justify-center rounded-xl px-3 transition-transform duration-200 hover:scale-105"
                    title={name}
                    aria-hidden={false}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-auto text-slate-700 opacity-95" />
                      <span className="sr-only">{name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Hover or touch to pause
            </p>
          </div>

          {/* mobile grid fallback */}
          <div className="grid grid-cols-3 gap-3 sm:hidden mt-2">
            {logos.slice(0, 6).map(({ name, Icon }) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-lg bg-white/60 p-2 shadow-sm"
              >
                <Icon className="h-6 w-auto text-slate-700" />
                <span className="sr-only">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* testimonials */}
        <div className="mt-6">
          <h3 className="text-center text-base font-semibold text-slate-700">
            What customers say
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              {
                quote:
                  "2.9× more captured leads in 30 days. Instantly visible in HubSpot.",
                name: "Priya S.",
                role: "Head of Growth, CloudScale",
              },
              {
                quote:
                  "Response times dropped by 42% and demo bookings jumped.",
                name: "Alex R.",
                role: "VP Sales, FinServe",
              },
              {
                quote:
                  "Behavior prompts qualify for us — reps focus only on closers.",
                name: "Maya T.",
                role: "PMM, TechFlow",
              },
            ].map((t, i) => (
              <figure
                key={i}
                className="rounded-2xl bg-[--surface] p-4 shadow-sm transition hover:shadow-md"
              >
                <blockquote className="text-sm text-slate-700">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-3 text-[13px] text-slate-600">
                  <span className="font-semibold text-slate-900">{t.name}</span>{" "}
                  · {t.role}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .trusted-track {
          display: flex;
          gap: 1.5rem;
          animation: marquee 22s linear infinite;
        }
        .trusted-track:hover,
        .trusted-track:active,
        .trusted-track:focus-within {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .trusted-track > * {
          flex: 0 0 auto;
        }
        @media (prefers-reduced-motion: reduce) {
          .trusted-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

/* -------------------------
   Default logos (react-icons)
   Replace or reorder as you like.
--------------------------*/
const DEFAULT_LOGOS = [
  { name: "HubSpot", Icon: SiHubspot },
  { name: "Salesforce", Icon: SiSalesforce },
  { name: "Slack", Icon: SiSlack },
  { name: "Stripe", Icon: SiStripe },
  { name: "AWS", Icon: FaAws },
  { name: "Google", Icon: SiGoogle },
  { name: "Microsoft", Icon: TfiMicrosoftAlt },
];
