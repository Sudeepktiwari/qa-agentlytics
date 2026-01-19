"use client";

import React, { useMemo, useState } from "react";

/**
 * Agentlytics for Shopify - Landing Page (Shopify-inspired theme)
 * - Single-file React component suitable for Next.js (App Router or Pages Router)
 * - TailwindCSS required
 *
 * Notes
 * - The final CTA form redirects to /signup (per your requirement).
 * - This file includes lightweight dev-time assertions (DevTests) to catch truncation/JSX regressions.
 */

/** Shopify-inspired palette (approx.)
 * Background: #FBF7ED
 * Primary green: #008060
 * Dark text: #0B1F19
 * Muted text: #4E5A55
 * Border: #D7E1D4
 * Soft surface: #F1F6F0
 */

type IconProps = { className?: string };

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  desc?: string;
};

const CheckIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20 6L9 17l-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XIcon = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = ({ className = "h-5 w-5" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M5 12h14m-7-7l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function classNames(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function SectionHeader({ eyebrow, title, desc }: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <div className="inline-flex items-center rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-semibold text-[#0b1f19] ring-1 ring-[#d7e1d4]">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#0b1f19] sm:text-3xl">
        {title}
      </h2>
      {desc ? (
        <p className="mt-3 text-base leading-relaxed text-[#4e5a55]">{desc}</p>
      ) : null}
    </div>
  );
}

function ShopifyIntentIllustration() {
  /**
   * Self-contained SVG (no external assets).
   * Note: We use SVG2 `href` for <mpath>. If your environment complains, switch to `xlinkHref`.
   */
  return (
    <svg
      viewBox="0 0 640 420"
      className="h-full w-full"
      role="img"
      aria-label="Illustration showing Shopify visitor intent signals flowing into Agentlytics and converting to checkout completion"
    >
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBF7ED" />
          <stop offset="1" stopColor="#E8F5EF" />
        </linearGradient>
        <linearGradient id="green" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#008060" />
          <stop offset="1" stopColor="#00A37A" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="10"
            floodColor="#0B1F19"
            floodOpacity="0.12"
          />
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Motion paths */}
        <path id="p1" d="M175 120 C 250 120, 260 165, 315 190" fill="none" />
        <path id="p2" d="M175 190 C 250 190, 260 205, 315 210" fill="none" />
        <path id="p3" d="M175 260 C 255 260, 260 235, 315 225" fill="none" />
        <path id="out" d="M360 210 C 430 210, 470 210, 540 210" fill="none" />
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="640" height="420" rx="28" fill="url(#bg)" />

      {/* Left: Shopify store cards */}
      <g filter="url(#softShadow)">
        <rect
          x="60"
          y="78"
          width="160"
          height="90"
          rx="16"
          fill="#FFFFFF"
          stroke="#D7E1D4"
        />
        <rect
          x="78"
          y="96"
          width="60"
          height="42"
          rx="10"
          fill="#F1F6F0"
          stroke="#D7E1D4"
        />
        <rect x="148" y="98" width="55" height="10" rx="5" fill="#D7E1D4" />
        <rect x="148" y="116" width="38" height="10" rx="5" fill="#D7E1D4" />
        <rect x="78" y="146" width="125" height="10" rx="5" fill="#E8F5EF" />

        <rect
          x="60"
          y="174"
          width="160"
          height="90"
          rx="16"
          fill="#FFFFFF"
          stroke="#D7E1D4"
        />
        <rect
          x="78"
          y="192"
          width="60"
          height="42"
          rx="10"
          fill="#F1F6F0"
          stroke="#D7E1D4"
        />
        <rect x="148" y="194" width="55" height="10" rx="5" fill="#D7E1D4" />
        <rect x="148" y="212" width="38" height="10" rx="5" fill="#D7E1D4" />
        <rect x="78" y="242" width="125" height="10" rx="5" fill="#E8F5EF" />

        <rect
          x="60"
          y="270"
          width="160"
          height="90"
          rx="16"
          fill="#FFFFFF"
          stroke="#D7E1D4"
        />
        <rect
          x="78"
          y="288"
          width="60"
          height="42"
          rx="10"
          fill="#F1F6F0"
          stroke="#D7E1D4"
        />
        <rect x="148" y="290" width="55" height="10" rx="5" fill="#D7E1D4" />
        <rect x="148" y="308" width="38" height="10" rx="5" fill="#D7E1D4" />
        <rect x="78" y="338" width="125" height="10" rx="5" fill="#E8F5EF" />
      </g>

      {/* Subtle scroll indicator */}
      <g opacity="0.9">
        <rect x="232" y="110" width="6" height="200" rx="3" fill="#D7E1D4" />
        <rect x="232" y="130" width="6" height="40" rx="3" fill="#008060">
          <animate
            attributeName="y"
            values="130;230;130"
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>
      </g>

      {/* Center: Agentlytics AI node */}
      <g filter="url(#softShadow)">
        <rect
          x="290"
          y="150"
          width="140"
          height="140"
          rx="26"
          fill="#FFFFFF"
          stroke="#D7E1D4"
        />
        <rect
          x="304"
          y="165"
          width="112"
          height="26"
          rx="13"
          fill="#F1F6F0"
          stroke="#D7E1D4"
        />
        <circle cx="318" cy="178" r="6" fill="#008060" />
        <text
          x="332"
          y="183"
          fontSize="12"
          fontFamily="ui-sans-serif, system-ui"
          fill="#0B1F19"
          fontWeight="700"
        >
          Agentlytics AI
        </text>

        <circle
          cx="360"
          cy="230"
          r="34"
          fill="none"
          stroke="#D7E1D4"
          strokeWidth="10"
        />
        <circle
          cx="360"
          cy="230"
          r="34"
          fill="none"
          stroke="url(#green)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="70 160"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 360 230"
            to="360 360 230"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Incoming signal lines */}
      <g opacity="0.7" stroke="#4E5A55" strokeWidth="2" fill="none">
        <path d="M220 120 C 260 120, 270 170, 290 190" />
        <path d="M220 220 C 260 220, 270 215, 290 210" />
        <path d="M220 315 C 260 315, 270 255, 290 230" />
      </g>

      {/* Moving intent dots */}
      <g filter="url(#glow)">
        <circle r="6" fill="#008060">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            keyTimes="0;1"
            keySplines="0.42 0 0.58 1"
            calcMode="spline"
          >
            <mpath href="#p1" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.9;1"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="5" fill="#00A37A">
          <animateMotion
            dur="6s"
            begin="0.6s"
            repeatCount="indefinite"
            keyTimes="0;1"
            keySplines="0.42 0 0.58 1"
            calcMode="spline"
          >
            <mpath href="#p2" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.9;1"
            dur="6s"
            begin="0.6s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="4.5" fill="#008060">
          <animateMotion
            dur="6s"
            begin="1.2s"
            repeatCount="indefinite"
            keyTimes="0;1"
            keySplines="0.42 0 0.58 1"
            calcMode="spline"
          >
            <mpath href="#p3" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.9;1"
            dur="6s"
            begin="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Contextual chat bubble */}
      <g>
        <g opacity="0">
          <animate
            attributeName="opacity"
            values="0;0;1;1;0"
            keyTimes="0;0.35;0.45;0.75;1"
            dur="6s"
            repeatCount="indefinite"
          />
          <rect
            x="258"
            y="78"
            width="240"
            height="54"
            rx="18"
            fill="#FFFFFF"
            stroke="#D7E1D4"
            filter="url(#softShadow)"
          />
          <path d="M320 132 l-14 16 h22 z" fill="#FFFFFF" stroke="#D7E1D4" />
          <text
            x="278"
            y="110"
            fontSize="12"
            fontFamily="ui-sans-serif, system-ui"
            fill="#0B1F19"
            fontWeight="700"
          >
            Need help with delivery or returns?
          </text>
          <text
            x="278"
            y="126"
            fontSize="10"
            fontFamily="ui-sans-serif, system-ui"
            fill="#4E5A55"
          >
            Ask now - before you leave checkout.
          </text>
        </g>
      </g>

      {/* Outgoing flow to checkout */}
      <g
        opacity="0.9"
        stroke="#D7E1D4"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      >
        <path d="M430 220 C 470 220, 495 220, 540 220" />
      </g>
      <g filter="url(#glow)">
        <circle r="6" fill="#008060">
          <animateMotion
            dur="6s"
            begin="2.3s"
            repeatCount="indefinite"
            keyTimes="0;1"
            keySplines="0.42 0 0.58 1"
            calcMode="spline"
          >
            <mpath href="#out" />
          </animateMotion>
          <animate
            attributeName="opacity"
            values="0;0;1;1;0"
            keyTimes="0;0.3;0.35;0.85;1"
            dur="6s"
            begin="2.3s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* Right: checkout success */}
      <g filter="url(#softShadow)">
        <rect
          x="500"
          y="160"
          width="110"
          height="130"
          rx="18"
          fill="#FFFFFF"
          stroke="#D7E1D4"
        />
        <rect x="515" y="178" width="80" height="10" rx="5" fill="#D7E1D4" />
        <rect x="515" y="198" width="68" height="10" rx="5" fill="#D7E1D4" />
        <rect x="515" y="218" width="76" height="10" rx="5" fill="#D7E1D4" />

        <g>
          <circle cx="555" cy="252" r="18" fill="#E8F5EF" />
          <path
            d="M547 252 l6 6 14-16"
            fill="none"
            stroke="#008060"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="555"
            cy="252"
            r="18"
            fill="none"
            stroke="#008060"
            strokeWidth="3"
            opacity="0"
          >
            <animate
              attributeName="opacity"
              values="0;0;0.7;0"
              keyTimes="0;0.55;0.65;0.9"
              dur="6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="18;18;34;46"
              keyTimes="0;0.55;0.75;1"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </g>

      {/* Micro label chips */}
      <g
        fontFamily="ui-sans-serif, system-ui"
        fontSize="10"
        fontWeight="700"
        fill="#0B1F19"
        opacity="0.9"
      >
        <g>
          <rect
            x="64"
            y="46"
            width="130"
            height="22"
            rx="11"
            fill="#F1F6F0"
            stroke="#D7E1D4"
          />
          <text x="78" y="61">
            Shopify shopper
          </text>
        </g>
        <g>
          <rect
            x="292"
            y="316"
            width="150"
            height="22"
            rx="11"
            fill="#F1F6F0"
            stroke="#D7E1D4"
          />
          <text x="306" y="331">
            Behavioral intent
          </text>
        </g>
        <g>
          <rect
            x="500"
            y="300"
            width="130"
            height="22"
            rx="11"
            fill="#E8F5EF"
            stroke="#D7E1D4"
          />
          <text x="514" y="315" fill="#008060">
            Checkout done
          </text>
        </g>
      </g>
    </svg>
  );
}

const NAV = [
  { label: "Problem", href: "#problem" },
  { label: "Why", href: "#why" },
  { label: "How it works", href: "#how" },
  { label: "Use cases", href: "#use" },
  { label: "Comparison", href: "#compare" },
  { label: "For who", href: "#who" },
] as const;

const INTENT_SIGNALS = [
  "Product page dwell time",
  "Repeated price or shipping checks",
  "Scroll hesitation",
  "Idle checkout behavior",
  "Exit intent",
  "Mobile friction",
] as const;

const AI_SOLVES = [
  "Product comparisons",
  "Shipping & returns clarity",
  "Pricing or bundle questions",
  "Use-case validation",
] as const;

const OUTCOMES = [
  "Nudges add-to-cart",
  "Pushes checkout completion",
  "Routes high-value buyers to sales",
  "Captures qualified follow-ups",
] as const;

const USE_CASES = [
  {
    title: "Reduce cart abandonment before exit",
    desc: "Engage at checkout hesitation with contextual answers and a clear next step.",
  },
  {
    title: "Improve product discovery",
    desc: "Guide shoppers to the right SKU with intent-aware recommendations.",
  },
  {
    title: "Convert mobile traffic",
    desc: "Remove friction where mobile shoppers drop off most.",
  },
  {
    title: "Sell mid- and high-ticket products",
    desc: "Handle objections instantly and route high-value shoppers when needed.",
  },
  {
    title: "Increase revenue without more ad spend",
    desc: "Improve conversion from the traffic you already paid for.",
  },
] as const;

const COMPARE_ROWS = [
  {
    capability: "Engagement style",
    widget: "Reactive",
    agentlytics: "Proactive",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Handles buyer hesitation",
    widget: "No",
    agentlytics: "Yes",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Product context awareness",
    widget: "Limited",
    agentlytics: "Deep",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Cart abandonment prevention",
    widget: "Post-fact",
    agentlytics: "Pre-exit",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Focus",
    widget: "Support",
    agentlytics: "Revenue",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Mobile optimization",
    widget: "Generic",
    agentlytics: "Intent-aware",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Buyer qualification",
    widget: "No",
    agentlytics: "Yes",
    widgetOk: false,
    agentlyOk: true,
  },
  {
    capability: "Sales routing",
    widget: "Manual",
    agentlytics: "Automated",
    widgetOk: false,
    agentlyOk: true,
  },
] as const;

const FOOTER_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
] as const;

function DevTests() {
  if (process.env.NODE_ENV !== "development") return null;

  try {
    console.assert(NAV.length >= 3, "NAV should have at least 3 items");
    console.assert(
      INTENT_SIGNALS.length >= 4,
      "INTENT_SIGNALS should have at least 4 items"
    );
    console.assert(
      COMPARE_ROWS.length >= 6,
      "COMPARE_ROWS should have at least 6 rows"
    );
    console.assert(
      FOOTER_LINKS.length === 3,
      "FOOTER_LINKS should have exactly 3 links"
    );

    const caps = COMPARE_ROWS.map((r) => r.capability);
    console.assert(
      new Set(caps).size === caps.length,
      "COMPARE_ROWS capability values should be unique"
    );

    const hrefs = NAV.map((n) => n.href);
    console.assert(
      new Set(hrefs).size === hrefs.length,
      "NAV hrefs should be unique"
    );

    const labels = NAV.map((n) => n.label);
    console.assert(
      new Set(labels).size === labels.length,
      "NAV labels should be unique"
    );

    // Additional tests: ensure expected anchors exist
    const required = ["#problem", "#why", "#how", "#use", "#compare", "#who"];
    required.forEach((id) =>
      console.assert(hrefs.includes(id), `NAV should include ${id}`)
    );

    // Defensive checks for component presence
    console.assert(
      typeof ShopifyIntentIllustration === "function",
      "ShopifyIntentIllustration should be a function component"
    );
    console.assert(
      typeof SectionHeader === "function",
      "SectionHeader should be a function component"
    );
    console.assert(
      typeof classNames === "function",
      "classNames should be a function"
    );
  } catch {
    // no-op
  }

  return null;
}

export default function ShopifyLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-[#fbf7ed] text-[#0b1f19]">
      <DevTests />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#d7e1d4] bg-[#fbf7ed]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1f19] text-sm font-semibold text-white">
              A
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Agentlytics</div>
              <div className="text-xs text-[#4e5a55]">for Shopify</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#0b1f19] md:flex">
            {NAV.map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="text-[#0b1f19]/80 hover:text-[#0b1f19]"
              >
                {i.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#final"
              className="rounded-full bg-[#008060] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#006a50]"
            >
              Start Free
            </a>
            <a
              href="#final"
              className="rounded-full border border-[#d7e1d4] bg-white px-4 py-2 text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0]"
            >
              Book a Demo
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-[#d7e1d4] bg-white px-3 py-2 text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Mobile nav */}
        <div
          id="mobile-nav"
          className={classNames("md:hidden", mobileOpen ? "block" : "hidden")}
        >
          <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
            <div className="rounded-2xl border border-[#d7e1d4] bg-white p-3">
              <div className="grid gap-1">
                {NAV.map((i) => (
                  <a
                    key={i.href}
                    href={i.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0]"
                  >
                    {i.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href="#final"
                  className="rounded-xl bg-[#008060] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#006a50]"
                >
                  Start Free
                </a>
                <a
                  href="#final"
                  className="rounded-xl border border-[#d7e1d4] bg-white px-3 py-2 text-center text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0]"
                >
                  Book a Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-semibold text-[#0b1f19] ring-1 ring-[#d7e1d4]">
              <span
                className="h-2 w-2 rounded-full bg-[#008060]"
                aria-hidden="true"
              />
              Proactive commerce conversion
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#0b1f19] sm:text-5xl">
              Convert Shopify Traffic Into Sales - Without Discounts or More Ads
            </h1>

            <p className="mt-5 text-base leading-relaxed text-[#4e5a55] sm:text-lg">
              Agentlytics is a proactive AI chatbot for Shopify stores that
              engages high-intent shoppers in real time, answers buying
              questions, removes hesitation, and drives checkout completion -
              automatically.
            </p>

            <div className="mt-6 rounded-2xl border border-[#d7e1d4] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#008060]">
                  <CheckIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#0b1f19]">
                    Proof hook
                  </div>
                  <div className="mt-1 text-sm text-[#4e5a55]">
                    Shopify stores using proactive AI engagement see higher
                    add-to-cart rates, lower cart abandonment, and faster
                    purchase decisions from the same traffic.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#final"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#008060] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#006a50]"
              >
                Increase Shopify Conversions
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#final"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e1d4] bg-white px-6 py-3 text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0]"
              >
                Book a Demo - See a Live Store Flow
              </a>
            </div>

            <div className="mt-4 text-xs font-medium text-[#66736e]">
              Works on any Shopify theme · Live in minutes · No checkout changes
              required
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2rem] bg-[#e8f5ef] blur-2xl"
              aria-hidden="true"
            />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7e1d4] bg-white shadow-sm">
              <div className="border-b border-[#d7e1d4] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#0b1f19]">
                      From intent to checkout - automatically
                    </div>
                    <div className="mt-1 text-xs text-[#66736e]">
                      Signals appear only when shoppers hesitate. Then
                      Agentlytics engages and converts.
                    </div>
                  </div>
                  <span className="rounded-full bg-[#0b1f19] px-3 py-1 text-xs font-semibold text-white">
                    Live
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="aspect-[16/10] w-full rounded-2xl bg-[#fbf7ed] ring-1 ring-[#d7e1d4]">
                  <ShopifyIntentIllustration />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    "Detect intent",
                    "Engage contextually",
                    "Complete checkout",
                  ].map((t) => (
                    <div
                      key={t}
                      className="rounded-xl bg-[#f1f6f0] px-3 py-2 text-center text-xs font-semibold text-[#0b1f19] ring-1 ring-[#d7e1d4]"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section id="problem" className="border-t border-[#d7e1d4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            eyebrow="Problem statement"
            title="Shopify revenue leakage is a timing problem"
            desc="Shoppers do not leave because they are uninterested. They leave because the last buying questions show up and nobody answers them in time."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#d7e1d4] bg-[#fbf7ed] p-6">
                <div className="text-sm font-semibold text-[#0b1f19]">
                  What it looks like on a real store
                </div>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#4e5a55]">
                  <p>
                    A shopper lands on a product page, scrolls, checks variants,
                    then jumps to shipping and returns. They are not browsing -
                    they are validating risk.
                  </p>
                  <p>
                    If they cannot resolve that doubt instantly, they leave. Not
                    because your product is wrong - because the moment passed.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Sizing / fit uncertainty",
                    "Shipping timelines",
                    "Return policy anxiety",
                    "Variant comparison overload",
                    "Trust signals missing",
                    "Mobile checkout friction",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm text-[#4e5a55] ring-1 ring-[#d7e1d4]"
                    >
                      <span
                        className="mt-1 h-2 w-2 rounded-full bg-[#008060]"
                        aria-hidden="true"
                      />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#d7e1d4] bg-white p-6">
                <div className="text-sm font-semibold text-[#0b1f19]">
                  Why typical fixes do not work
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Pop-ups",
                      desc: "Interrupt intent and reduce trust, especially on mobile.",
                    },
                    {
                      title: "Discounts",
                      desc: "Convert some buyers but permanently weaken margins.",
                    },
                    {
                      title: "Forms",
                      desc: "Too slow. The shopper is already gone.",
                    },
                    {
                      title: "Reactive chat",
                      desc: "Waits for a question, but hesitation is usually silent.",
                    },
                  ].map((i) => (
                    <div
                      key={i.title}
                      className="rounded-xl bg-[#f1f6f0] p-4 ring-1 ring-[#d7e1d4]"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0b1f19]">
                        <XIcon className="h-4 w-4" />
                        {i.title}
                      </div>
                      <div className="mt-1 text-sm text-[#4e5a55]">
                        {i.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#d7e1d4] bg-[#0b1f19] p-6 text-white">
                <div className="text-sm font-semibold">The business impact</div>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  When buying questions appear late in the session, every second
                  without an answer increases drop-off risk.
                </p>

                <div className="mt-6 grid gap-4">
                  {[
                    "High-intent shoppers hesitate in silence",
                    "Mobile drop-offs compound across sessions",
                    "Each unanswered objection becomes lost revenue",
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-start gap-2 rounded-xl bg-white/10 p-4"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4" />
                      <span className="text-sm text-white/85">{t}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-white/10 p-4">
                  <div className="text-xs font-semibold">
                    Problem statement (one line)
                  </div>
                  <div className="mt-1 text-sm">
                    Shopify stores lose sales because hesitation happens late
                    and support is not present in that moment.
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href="#how"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0]"
                  >
                    See how Agentlytics fixes this
                    <ArrowRight className="h-5 w-5" />
                  </a>
                  <div className="mt-2 text-center text-[11px] text-white/70">
                    No interruption. Just timely answers that move checkout
                    forward.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="border-t border-[#d7e1d4] bg-[#fbf7ed]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            eyebrow="Revenue leakage"
            title="Why Shopify stores lose revenue"
            desc="Your traffic is not low. Your store is not broken. Shoppers leave because buying questions go unanswered in the moment that matters."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#d7e1d4] bg-white p-6">
              <div className="text-sm font-semibold">What happens</div>
              <ul className="mt-4 space-y-2 text-sm text-[#4e5a55]">
                {[
                  "They browse products",
                  "They compare options",
                  "They hesitate at shipping/returns/fit",
                  "Then they disappear",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span
                      className="mt-1 h-2 w-2 rounded-full bg-[#008060]"
                      aria-hidden="true"
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#d7e1d4] bg-white p-6">
              <div className="text-sm font-semibold">Why old tactics fail</div>
              <ul className="mt-4 space-y-2 text-sm text-[#4e5a55]">
                {[
                  "Forms do not help in the moment",
                  "Pop-ups interrupt",
                  "Discounts kill margins",
                  "Reactive chat waits too long",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <XIcon className="mt-0.5 h-4 w-4 text-[#0b1f19]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#d7e1d4] bg-[#0b1f19] p-6 text-white">
              <div className="text-sm font-semibold">Core truth</div>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Shopify stores do not lose buyers due to lack of interest - they
                lose them due to unanswered buying questions.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                Fix timing, not traffic
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-[#d7e1d4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            eyebrow="System design"
            title="How Agentlytics works on Shopify"
            desc="Detect intent. Engage without interrupting. Remove blockers instantly. Drive checkout completion."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#d7e1d4] bg-[#fbf7ed] p-6">
              <div className="text-sm font-semibold text-[#0b1f19]">
                1) Detect buying intent
              </div>
              <p className="mt-2 text-sm text-[#4e5a55]">
                Agentlytics observes real-time signals such as:
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {INTENT_SIGNALS.map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm text-[#4e5a55] ring-1 ring-[#d7e1d4]"
                  >
                    <span
                      className="mt-1 h-2 w-2 rounded-full bg-[#008060]"
                      aria-hidden="true"
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#d7e1d4] bg-white p-6">
              <div className="text-sm font-semibold text-[#0b1f19]">
                2) Engage proactively (without interrupting)
              </div>
              <p className="mt-2 text-sm text-[#4e5a55]">
                Instead of pop-ups, Agentlytics opens a contextual conversation
                only when hesitation shows up.
              </p>
              <div className="mt-4 rounded-2xl border border-[#d7e1d4] bg-[#f1f6f0] p-4">
                <div className="text-xs font-semibold text-[#0b1f19]">
                  Example prompt
                </div>
                <div className="mt-2 text-sm text-[#0b1f19]">
                  "Want help choosing the right size or delivery option?"
                </div>
              </div>

              <div className="mt-6 text-sm font-semibold text-[#0b1f19]">
                3) Resolve the buying blocker
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#4e5a55]">
                {AI_SOLVES.map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 text-[#008060]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 text-sm font-semibold text-[#0b1f19]">
                4) Drive the right outcome
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[#4e5a55]">
                {OUTCOMES.map((t) => (
                  <li key={t} className="flex gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-[#0b1f19]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-2xl border border-[#d7e1d4] bg-[#fbf7ed] p-4 text-sm text-[#0b1f19]">
                This is{" "}
                <span className="font-semibold">
                  commerce intent conversion
                </span>
                , not customer support chat.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use" className="border-t border-[#d7e1d4] bg-[#fbf7ed]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            eyebrow="What teams do with it"
            title="What Shopify stores use Agentlytics for"
            desc="Practical conversion wins that compound across traffic, SKUs, and devices."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-[#d7e1d4] bg-white p-6"
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ef] text-[#008060]">
                    <CheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0b1f19]">
                      {c.title}
                    </div>
                    <div className="mt-1 text-sm text-[#4e5a55]">{c.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#d7e1d4] bg-white p-6">
            <div className="text-sm font-semibold text-[#0b1f19]">
              Built for Shopify growth teams
            </div>
            <div className="mt-2 grid gap-3 text-sm text-[#4e5a55] sm:grid-cols-2">
              {[
                "Works across product, collection, and checkout pages",
                "No theme rebuilds",
                "No checkout disruption",
                "No coupon dependency",
                "Scales with traffic and SKUs",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-2 w-2 rounded-full bg-[#008060]"
                    aria-hidden="true"
                  />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="border-t border-[#d7e1d4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            eyebrow="Positioning"
            title="Agentlytics vs Shopify chat widgets"
            desc="If your goal is support, chat widgets are fine. If your goal is sales, Agentlytics is built for it."
          />

          <div className="mt-10 overflow-hidden rounded-2xl border border-[#d7e1d4]">
            <div className="grid grid-cols-12 bg-[#fbf7ed] px-4 py-3 text-xs font-semibold text-[#0b1f19]">
              <div className="col-span-6 sm:col-span-5">Capability</div>
              <div className="col-span-3 text-center">Chat widgets</div>
              <div className="col-span-3 text-center">Agentlytics</div>
            </div>
            <div className="divide-y divide-[#d7e1d4]">
              {COMPARE_ROWS.map((r) => (
                <div
                  key={r.capability}
                  className="grid grid-cols-12 items-center px-4 py-4"
                >
                  <div className="col-span-6 text-sm font-semibold text-[#0b1f19] sm:col-span-5">
                    {r.capability}
                  </div>
                  <div className="col-span-3 text-center">
                    <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f1f6f0] px-3 py-1 text-xs font-semibold text-[#0b1f19] ring-1 ring-[#d7e1d4]">
                      {r.widgetOk ? (
                        <CheckIcon className="h-4 w-4 text-[#008060]" />
                      ) : (
                        <XIcon className="h-4 w-4" />
                      )}
                      <span>{r.widget}</span>
                    </div>
                  </div>
                  <div className="col-span-3 text-center">
                    <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8f5ef] px-3 py-1 text-xs font-semibold text-[#008060] ring-1 ring-[#d7e1d4]">
                      {r.agentlyOk ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <XIcon className="h-4 w-4" />
                      )}
                      <span>{r.agentlytics}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who */}
      <section id="who" className="border-t border-[#d7e1d4] bg-[#fbf7ed]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            eyebrow="Best fit"
            title="Who this is for"
            desc="Agentlytics is ideal for Shopify stores that already have traffic and want more conversions without margin-killing discounts."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#d7e1d4] bg-white p-6">
              <div className="text-sm font-semibold">Ideal signals</div>
              <div className="mt-4 space-y-3 text-sm text-[#4e5a55]">
                {[
                  "Running paid ads or influencer traffic",
                  "Selling mid- to high-ticket products",
                  "Caring about margins",
                  "Seeing abandoned carts",
                  "Wanting clarity on why buyers do not convert",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 text-[#008060]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e1d4] bg-white p-6">
              <div className="text-sm font-semibold">What you get</div>
              <div className="mt-4 space-y-3 text-sm text-[#4e5a55]">
                {[
                  "More add-to-carts from the same sessions",
                  "Less silent abandonment",
                  "Faster purchase decisions",
                  "Better buyer qualification",
                  "Cleaner handoff to sales",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-[#0b1f19]" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e1d4] bg-[#0b1f19] p-6 text-white">
              <div className="text-sm font-semibold">Decision point</div>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Your Shopify traffic is already paid for. Your shoppers are
                already interested. The missing piece is timely engagement.
              </p>
              <div className="mt-6 rounded-2xl bg-white/10 p-4">
                <div className="text-xs font-semibold">Outcome</div>
                <div className="mt-1 text-sm">
                  Turn Shopify visitors into customers - automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="final" className="border-t border-[#d7e1d4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-[2rem] border border-[#d7e1d4] bg-[#fbf7ed] p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0b1f19] ring-1 ring-[#d7e1d4]">
                  No credit card required · Go live fast
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#0b1f19] sm:text-3xl">
                  Turn Shopify visitors into customers - automatically
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4e5a55]">
                  Share your store URL and we will route you to signup right
                  away.
                </p>
                <div className="mt-6 grid gap-3 text-sm text-[#4e5a55] sm:grid-cols-2">
                  {[
                    "Works with your existing Shopify setup",
                    "No checkout changes required",
                    "Deploy in minutes",
                    "Designed for conversion teams",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-2">
                      <CheckIcon className="mt-0.5 h-4 w-4 text-[#008060]" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#d7e1d4] bg-white p-6">
                <div className="text-sm font-semibold text-[#0b1f19]">
                  Get started
                </div>
                <p className="mt-1 text-xs text-[#66736e]">
                  Enter your details and continue to signup.
                </p>

                <form
                  className="mt-5 grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = "/signup";
                  }}
                >
                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-[#0b1f19]">
                      Work email
                    </span>
                    <input
                      required
                      type="email"
                      placeholder="you@company.com"
                      className="h-11 rounded-xl border border-[#d7e1d4] bg-white px-3 text-sm text-[#0b1f19] placeholder:text-[#9aa6a0] focus:outline-none focus:ring-2 focus:ring-[#008060]/40"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-semibold text-[#0b1f19]">
                      Shopify store URL
                    </span>
                    <input
                      required
                      type="url"
                      placeholder="https://yourstore.com"
                      className="h-11 rounded-xl border border-[#d7e1d4] bg-white px-3 text-sm text-[#0b1f19] placeholder:text-[#9aa6a0] focus:outline-none focus:ring-2 focus:ring-[#008060]/40"
                    />
                  </label>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-[#008060] px-4 py-3 text-sm font-semibold text-white hover:bg-[#006a50]"
                    >
                      Start Free
                    </button>
                    <a
                      href="/signup"
                      className="rounded-xl border border-[#d7e1d4] bg-white px-4 py-3 text-center text-sm font-semibold text-[#0b1f19] hover:bg-[#f1f6f0]"
                    >
                      Book a Demo
                    </a>
                  </div>

                  <div className="text-[11px] text-[#66736e]">
                    No credit card required · Works with your existing Shopify
                    setup · Go live fast
                  </div>
                </form>
              </div>
            </div>
          </div>

          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#d7e1d4] pt-6 text-xs text-[#66736e] sm:flex-row">
            <div>© {year} Agentlytics. All rights reserved.</div>
            <div className="flex items-center gap-4">
              {FOOTER_LINKS.map((l) => (
                <a key={l.label} className="hover:text-[#0b1f19]" href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
