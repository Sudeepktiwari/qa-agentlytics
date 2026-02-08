import React from "react";

function HeroIllustrationAnimated() {
  // SVG-only (no external assets) so Canvas preview works reliably.
  // Subtle motion: chat bubble slides in, typing dots animate, and a path/arrow guides the eye.
  return (
    <div className="relative">
      <svg
        viewBox="0 0 1200 420"
        className="block h-auto w-full"
        role="img"
        aria-label="Illustration: a buyer browsing a property website, Agentlytics engaging via chat, booking a site visit, and a car heading to the show site."
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EFF6FF" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="city" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#93C5FD" stopOpacity="0.55" />
            <stop offset="1" stopColor="#60A5FA" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="road" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#DBEAFE" />
            <stop offset="1" stopColor="#EFF6FF" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="14"
              floodColor="#1D4ED8"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        {/* Background */}
        <rect x="0" y="0" width="1200" height="420" fill="url(#sky)" />
        <path
          d="M0 270 C240 220, 360 300, 540 250 C720 200, 860 290, 1200 240 L1200 420 L0 420 Z"
          fill="#EFF6FF"
        />

        {/* Skyline */}
        <g opacity="0.9">
          <rect
            x="360"
            y="90"
            width="86"
            height="170"
            rx="10"
            fill="url(#city)"
          />
          <rect
            x="455"
            y="70"
            width="110"
            height="190"
            rx="12"
            fill="url(#city)"
          />
          <rect
            x="580"
            y="110"
            width="90"
            height="150"
            rx="10"
            fill="url(#city)"
          />
          <rect
            x="685"
            y="80"
            width="130"
            height="180"
            rx="12"
            fill="url(#city)"
          />
          <rect
            x="830"
            y="120"
            width="90"
            height="140"
            rx="10"
            fill="url(#city)"
          />
        </g>

        {/* Ferris wheel */}
        <g transform="translate(150 195)" opacity="0.85">
          <circle r="70" fill="none" stroke="#60A5FA" strokeWidth="8" />
          <circle r="8" fill="#2563EB" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI * 2) / 12;
            const x = Math.cos(a) * 70;
            const y = Math.sin(a) * 70;
            const x2 = Math.cos(a) * 8;
            const y2 = Math.sin(a) * 8;
            return (
              <g key={i}>
                <line
                  x1={x2}
                  y1={y2}
                  x2={x}
                  y2={y}
                  stroke="#60A5FA"
                  strokeWidth="4"
                />
                <circle cx={x} cy={y} r="6" fill="#93C5FD" />
              </g>
            );
          })}
        </g>

        {/* Road / journey path */}
        <path
          d="M260 330 C420 270, 560 360, 720 310 C870 265, 980 300, 1120 270"
          fill="none"
          stroke="url(#road)"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M260 330 C420 270, 560 360, 720 310 C870 265, 980 300, 1120 270"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="3"
          strokeDasharray="8 10"
          opacity="0.6"
        />

        {/* Left: buyer browsing */}
        <g transform="translate(90 250)" filter="url(#softShadow)">
          <rect
            x="0"
            y="0"
            width="250"
            height="120"
            rx="20"
            fill="#FFFFFF"
            stroke="#DBEAFE"
          />
          <rect x="18" y="18" width="214" height="70" rx="12" fill="#EFF6FF" />
          <rect x="28" y="28" width="120" height="10" rx="5" fill="#93C5FD" />
          <rect x="28" y="48" width="180" height="10" rx="5" fill="#BFDBFE" />
          <rect x="28" y="68" width="150" height="10" rx="5" fill="#BFDBFE" />
          <rect x="18" y="96" width="120" height="10" rx="5" fill="#DBEAFE" />
          <rect x="144" y="96" width="88" height="10" rx="5" fill="#DBEAFE" />
          <text
            x="18"
            y="-10"
            fill="#1D4ED8"
            fontSize="14"
            fontFamily="ui-sans-serif, system-ui"
          >
            Buyer browsing
          </text>
        </g>

        {/* Booking confirmation */}
        <g transform="translate(480 170)" filter="url(#softShadow)">
          <rect
            x="0"
            y="0"
            width="280"
            height="110"
            rx="22"
            fill="#FFFFFF"
            stroke="#DBEAFE"
          />
          <text
            x="22"
            y="38"
            fill="#1D4ED8"
            fontSize="18"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
          >
            Site Visit Confirmed
          </text>
          <rect x="22" y="52" width="236" height="40" rx="14" fill="#EFF6FF" />
          <rect x="34" y="62" width="26" height="26" rx="8" fill="#2563EB" />
          <path
            d="M41 75 L46 80 L55 68"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="74"
            y="79"
            fill="#1D4ED8"
            fontSize="16"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
          >
            Saturday 11:00 AM
          </text>
        </g>

        {/* Right: show site */}
        <g transform="translate(980 170)" filter="url(#softShadow)">
          <rect
            x="0"
            y="0"
            width="170"
            height="120"
            rx="22"
            fill="#FFFFFF"
            stroke="#DBEAFE"
          />
          <rect x="22" y="38" width="70" height="48" rx="10" fill="#93C5FD" />
          <polygon points="22,38 57,18 92,38" fill="#60A5FA" />
          <rect x="104" y="40" width="44" height="18" rx="8" fill="#EFF6FF" />
          <text
            x="110"
            y="54"
            fill="#1D4ED8"
            fontSize="10"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
          >
            SHOW
          </text>
          <rect x="104" y="62" width="44" height="18" rx="8" fill="#EFF6FF" />
          <text
            x="112"
            y="76"
            fill="#1D4ED8"
            fontSize="10"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
          >
            SITE
          </text>
          <text
            x="22"
            y="104"
            fill="#1D4ED8"
            fontSize="12"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
          >
            Show site
          </text>
        </g>

        {/* Car (moving slightly) */}
        <g>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur="2.8s"
              values="0 0; 6 -2; 0 0"
              repeatCount="indefinite"
            />
            <g transform="translate(785 295)" filter="url(#softShadow)">
              <path
                d="M10 45 C30 10, 70 0, 120 0 L210 0 C260 0, 290 18, 300 45 L320 62 C326 70, 320 80, 308 80 L22 80 C8 80, 0 70, 6 60 Z"
                fill="#2563EB"
              />
              <path
                d="M55 18 H245"
                stroke="#93C5FD"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle cx="78" cy="80" r="18" fill="#1E3A8A" />
              <circle cx="78" cy="80" r="8" fill="#BFDBFE" />
              <circle cx="256" cy="80" r="18" fill="#1E3A8A" />
              <circle cx="256" cy="80" r="8" fill="#BFDBFE" />
              <rect
                x="95"
                y="18"
                width="70"
                height="24"
                rx="10"
                fill="#1D4ED8"
                opacity="0.85"
              />
              <rect
                x="170"
                y="18"
                width="60"
                height="24"
                rx="10"
                fill="#1D4ED8"
                opacity="0.85"
              />
            </g>
          </g>
        </g>

        {/* Animated chat bubble (moves along a short path) */}
        <g filter="url(#softShadow)">
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur="2.6s"
              values="0 0; 24 -12; 0 0"
              repeatCount="indefinite"
            />
            <g transform="translate(280 155)">
              <path
                d="M0 22 C0 9, 10 0, 22 0 H270 C282 0, 292 9, 292 22 V72 C292 84, 282 94, 270 94 H66 L38 114 V94 H22 C10 94, 0 84, 0 72 Z"
                fill="#2563EB"
              />
              <text
                x="18"
                y="34"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="700"
                fontFamily="ui-sans-serif, system-ui"
              >
                Agentlytics
              </text>
              <text
                x="18"
                y="58"
                fill="#DBEAFE"
                fontSize="14"
                fontFamily="ui-sans-serif, system-ui"
              >
                Looking at 3BHK options?
              </text>
              <text
                x="18"
                y="78"
                fill="#DBEAFE"
                fontSize="14"
                fontFamily="ui-sans-serif, system-ui"
              >
                I can book a site visit.
              </text>

              {/* Typing dots */}
              <g transform="translate(250 30)">
                <circle cx="0" cy="0" r="3" fill="#FFFFFF" opacity="0.85">
                  <animate
                    attributeName="opacity"
                    dur="1.2s"
                    values="0.25;0.9;0.25"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="10" cy="0" r="3" fill="#FFFFFF" opacity="0.65">
                  <animate
                    attributeName="opacity"
                    dur="1.2s"
                    begin="0.2s"
                    values="0.25;0.9;0.25"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="20" cy="0" r="3" fill="#FFFFFF" opacity="0.5">
                  <animate
                    attributeName="opacity"
                    dur="1.2s"
                    begin="0.4s"
                    values="0.25;0.9;0.25"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          </g>
        </g>

        {/* Directional arrows */}
        <g
          opacity="0.55"
          stroke="#60A5FA"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M365 210 C420 190, 440 190, 470 200" />
          <path d="M470 200 L458 192" />
          <path d="M470 200 L458 208" />
          <path d="M770 220 C840 210, 900 200, 960 210" />
          <path d="M960 210 L948 202" />
          <path d="M960 210 L948 218" />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-between text-[11px] text-blue-700">
        <span className="rounded-full border border-blue-100 bg-white/90 px-3 py-1">
          Detect intent
        </span>
        <span className="rounded-full border border-blue-100 bg-white/90 px-3 py-1">
          Engage
        </span>
        <span className="rounded-full border border-blue-100 bg-white/90 px-3 py-1">
          Book visit
        </span>
        <span className="rounded-full border border-blue-100 bg-white/90 px-3 py-1">
          Show site
        </span>
      </div>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
}

const Badge = ({ children }: BadgeProps) => (
  <span className="inline-flex items-center rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
    {children}
  </span>
);

interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

const Button = ({ variant = "primary", children }: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600"
      : "bg-white text-blue-900 border border-blue-100 hover:bg-blue-50 focus:ring-blue-600";
  return <button className={`${base} ${styles}`}>{children}</button>;
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`rounded-2xl border border-blue-100 bg-white p-6 shadow-sm ${className}`}
  >
    {children}
  </div>
);

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
}

const SectionHeader = ({ kicker, title, subtitle }: SectionHeaderProps) => (
  <div className="mx-auto max-w-3xl text-center">
    {kicker ? (
      <div className="mb-3 flex items-center justify-center gap-2">
        <Badge>{kicker}</Badge>
      </div>
    ) : null}
    <h2 className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
      {title}
    </h2>
    {subtitle ? (
      <p className="mt-3 text-base text-blue-700">{subtitle}</p>
    ) : null}
  </div>
);

interface StatProps {
  label: string;
  value: string;
}

const Stat = ({ label, value }: StatProps) => (
  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
    <div className="text-2xl font-bold text-blue-900">{value}</div>
    <div className="mt-1 text-sm text-blue-700">{label}</div>
  </div>
);

export default function AgentlyticsBuildersLanding() {
  return (
    <div className="min-h-screen bg-blue-50 text-blue-900" id="top">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-center md:justify-start px-4 py-3 sm:px-6">
          <div className="md:flex items-center hidden gap-3">
            {/* <div className="h-9 w-9 rounded-xl bg-blue-600" aria-hidden /> */}
            <div className="leading-tight">
              <div className="text-sm font-bold">Agentlytics</div>
              <div className="text-xs text-blue-600">
                For Builders & Developers
              </div>
            </div>
          </div>

          <nav className="space-x-2 md:space-x-0 items-center gap-6 md:ml-32 text-xs md:text-sm text-blue-700 md:flex">
            <a className="hover:text-blue-900" href="#how-it-works">
              How it works
            </a>
            <a className="hover:text-blue-900" href="#qualification">
              Qualification
            </a>
            <a className="hover:text-blue-900" href="#booking">
              Booking
            </a>
            <a className="hover:text-blue-900" href="#dashboard">
              Dashboard
            </a>
            <a className="hover:text-blue-900" href="#proof">
              Proof
            </a>
          </nav>
        </div>
      </header>

      {/* Illustration Strip */}
      <section className="bg-blue-50 border-b border-blue-100">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
            <HeroIllustrationAnimated />
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-blue-50" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>
                🏗️ Agentlytics for Builders & Real Estate Developers
              </Badge>
              <Badge>Real-time intent detection</Badge>
              <Badge>In-chat bookings</Badge>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-blue-900 sm:text-5xl">
              Turn Property Browsers Into Booked Site Visits — Automatically
            </h1>

            <p className="mt-5 text-base leading-relaxed text-blue-700 sm:text-lg">
              Agentlytics is a proactive AI agent for builders and developers
              that engages high-intent visitors in real time, qualifies buyers
              by budget, property type, location, and timeline, and books site
              visits or calls directly inside chat — at scale.
            </p>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-blue-900">
                ⚡ Proof Hook
              </div>
              <p className="mt-1 text-sm text-blue-700">
                Builders using Agentlytics see{" "}
                <span className="font-semibold text-blue-900">
                  35–50% more qualified buyer inquiries
                </span>{" "}
                and faster site-visit completion.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button>Start Free — Engage Buyers Automatically</Button>
              <Button variant="secondary">
                Watch a Demo — See a Live Builder Flow
              </Button>
            </div>

            <p className="mt-3 text-xs text-blue-600">
              Your property AI live in 10 minutes · No credit card required
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Higher qualified inquiries" value="35–50%" />
              <Stat label="Visit completion uplift" value="2–3×" />
              <Stat label="Setup time" value="~10 min" />
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Live Buyer Signals</div>
                <span className="text-xs text-blue-600">Realtime</span>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  { t: "Pricing page dwell", d: "92s · High intent" },
                  { t: "Floor-plan scroll depth", d: "70% · 3BHK interest" },
                  { t: "Repeat project visits", d: "2 visits · 48h" },
                  { t: "Exit intent", d: "Detected · Trigger engagement" },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="rounded-2xl border border-blue-100 bg-blue-50 p-4"
                  >
                    <div className="text-sm font-semibold">{x.t}</div>
                    <div className="mt-1 text-xs text-blue-700">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4">
                <div className="text-xs font-semibold text-blue-600">
                  Example prompt
                </div>
                <div className="mt-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white">
                  “Looking at 3BHK options? I can help check availability or
                  book a site visit.”
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Card>
                <div className="text-sm font-semibold">Lead Scoring</div>
                <p className="mt-1 text-sm text-blue-700">
                  Scores intent from behavior + answers to prioritize sales
                  follow-up.
                </p>
              </Card>
              <Card>
                <div className="text-sm font-semibold">CRM Update</div>
                <p className="mt-1 text-sm text-blue-700">
                  Logs budget, unit type, timeline, and booking outcome
                  automatically.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why lose buyers */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" id="problem">
        <SectionHeader
          kicker="⚡ Why Builder Websites Lose Buyers"
          title="Most property websites are silent — and serious buyers leave unnoticed."
          subtitle="Forms wait. Callbacks arrive late. Agentlytics engages instantly — when buying intent peaks."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card>
            <div className="text-sm font-semibold">What buyers browse</div>
            <ul className="mt-3 space-y-2 text-sm text-blue-700">
              <li>• Floor plans</li>
              <li>• Pricing & availability</li>
              <li>• Location maps</li>
              <li>• Amenities</li>
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            <div className="text-sm font-semibold">The leakage pattern</div>
            <p className="mt-2 text-sm text-blue-700">
              Visitors explore high-value pages, hesitate, then exit without
              filling a form. Every unanswered visit becomes a lost buyer.
            </p>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-semibold">🏚️ Reality check</div>
              <p className="mt-1 text-sm text-blue-700">
                If your sales team only sees form-fills, you are blind to the
                majority of high-intent sessions.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-blue-100 bg-white" id="how-it-works">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            kicker="🧠 How Agentlytics Works for Builders"
            title="Detect → Engage → Qualify → Book → Follow Up"
            subtitle="Agentlytics reads buyer behavior in real time and starts the right conversation before interest fades."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="text-sm font-semibold">
                Signals detected automatically
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Pricing page dwell",
                  "Floor-plan scroll depth",
                  "Repeat project visits",
                  "Exit intent",
                  "Device & session context",
                ].map((s) => (
                  <div
                    key={s}
                    className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold">Example prompt</div>
              <div className="mt-4 rounded-2xl bg-blue-600 px-4 py-4 text-sm text-white">
                “Looking at 3BHK options? I can help check availability or book
                a site visit.”
              </div>
              <p className="mt-4 text-sm text-blue-700">
                The point is not “chat.” The point is timing: engage when intent
                is visible, not after the visitor leaves.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Qualification */}
      <section
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6"
        id="qualification"
      >
        <SectionHeader
          kicker="🏡 Smart Buyer Qualification"
          title="Beyond lead capture: qualify conversationally without interrogation."
          subtitle="Agentlytics collects high-signal details and routes only serious buyers to sales."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="text-sm font-semibold">Captured automatically</div>
            <ul className="mt-4 space-y-2 text-sm text-blue-700">
              <li>• Budget range (₹ / $ / AED)</li>
              <li>• Property type (2BHK, 3BHK, Villa, Commercial)</li>
              <li>• Purpose (Self-use / Investment)</li>
              <li>• Buying timeline (Immediate / 3–6 months / Later)</li>
              <li>• Preferred project / location</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-semibold">Result</div>
              <p className="mt-1 text-sm text-blue-700">
                Sales teams speak only to serious, ready buyers — with full
                context before the first call.
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold">Lead quality outcome</div>
            <p className="mt-2 text-sm text-blue-700">
              Stop wasting time on low-intent inquiries. Prioritize by budget +
              timeline + project interest.
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <div className="text-xs font-semibold text-blue-600">
                  Intent label
                </div>
                <div className="mt-1 text-sm font-semibold text-blue-900">
                  High Intent
                </div>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-4">
                <div className="text-xs font-semibold text-blue-600">
                  Routing
                </div>
                <div className="mt-1 text-sm font-semibold text-blue-900">
                  Sales alerted instantly
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Booking */}
      <section className="border-t border-blue-100 bg-white" id="booking">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            kicker="📅 In-Chat Site Visit & Call Booking"
            title="No WhatsApp chasing. No calendar links. Buyers pick a slot inside chat."
            subtitle="Time-zone aware scheduling for site visits or calls, with all details logged automatically."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="text-sm font-semibold">Prompt</div>
              <div className="mt-4 rounded-2xl bg-blue-600 px-4 py-4 text-sm text-white">
                “Would you like to book a site visit or speak to a sales
                advisor?”
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
                  Time-zone aware
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
                  Site visit / call
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
                  Auto-logging
                </div>
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold">Impact</div>
              <p className="mt-2 text-sm text-blue-700">
                In-chat booking reduces drop-offs and improves completion versus
                call-back flows.
              </p>
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-900">2–3×</div>
                <div className="mt-1 text-sm text-blue-700">
                  Higher visit completion rates vs call-back flows
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Multi-persona */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" id="journey">
        <SectionHeader
          kicker="🔄 One AI for the Full Buyer Journey"
          title="Multi-Persona AI: one brain, multiple roles."
          subtitle="No handoffs. No repeated questions. No lost context."
        />

        <div className="mt-10 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-0 border-b border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-slate-700 sm:grid-cols-2">
            <div>Stage</div>
            <div>What changes</div>
          </div>
          {[
            ["Visitor", "Proactive greet at peak intent"],
            ["Buyer", "Real-time answers on pricing & plans"],
            ["Qualified Lead", "Budget & timeline captured"],
            ["Site Visit", "Booking confirmed inside chat"],
            ["Post-Visit", "Smart follow-ups & nudges"],
            ["Support", "Documents, approvals, next steps"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="grid grid-cols-1 gap-0 border-b border-blue-100 p-4 text-sm sm:grid-cols-2"
            >
              <div className="font-semibold text-blue-900">{a}</div>
              <div className="mt-1 text-blue-700 sm:mt-0">{b}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
          <p className="text-sm text-slate-700">
            🔁 No handoffs. No repeated questions. No lost context.
          </p>
        </div>
      </section>

      {/* Real buyer flow */}
      <section className="border-t border-blue-100 bg-white" id="flow">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            kicker="🧠 Real Buyer Flow"
            title="A mid-funnel moment that converts hesitation into action."
            subtitle="Behavior triggers a prompt, qualification happens naturally, and booking is completed in-chat."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card>
              <div className="text-sm font-semibold">Visitor behavior</div>
              <ul className="mt-3 space-y-2 text-sm text-blue-700">
                <li>• Scrolls floor plans (70%)</li>
                <li>• Views pricing twice</li>
                <li>• Idle for 30s</li>
              </ul>
            </Card>

            <Card>
              <div className="text-sm font-semibold">Agentlytics prompt</div>
              <div className="mt-4 rounded-2xl bg-blue-600 px-4 py-4 text-sm text-white">
                “Interested in 3BHK units? I can share price range or book a
                site visit.”
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold">Behind the scenes</div>
              <ul className="mt-3 space-y-2 text-sm text-blue-700">
                <li>• Lead scored: High Intent</li>
                <li>• Sales alerted instantly</li>
                <li>• CRM updated with full context</li>
              </ul>
            </Card>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <Button variant="secondary">See this buyer flow live</Button>
            <Button>View a sample qualification chat</Button>
          </div>
        </div>
      </section>

      {/* Before vs After */}
      <section
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6"
        id="before-after"
      >
        <SectionHeader
          kicker="📊 Before vs After"
          title="Optimize sales effort — not just lead volume."
          subtitle="Agentlytics improves visit completion and increases the visit-to-closure ratio by filtering for intent."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="text-sm font-semibold">Before Agentlytics</div>
            <ul className="mt-4 space-y-2 text-sm text-blue-700">
              <li>• 120 inquiries</li>
              <li>• 40 follow-up calls</li>
              <li>• 12 site visits</li>
              <li>• High lead leakage</li>
            </ul>
          </Card>

          <Card>
            <div className="text-sm font-semibold">After Agentlytics</div>
            <ul className="mt-4 space-y-2 text-sm text-blue-700">
              <li>• 95 qualified buyers</li>
              <li>• 38 booked site visits</li>
              <li>• Higher visit-to-closure ratio</li>
              <li>• Clear demand by budget & project</li>
            </ul>
          </Card>
        </div>

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
          <p className="text-sm text-slate-700">
            Builders optimize sales effort, not just lead volume.
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <section className="border-t border-blue-100 bg-white" id="dashboard">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeader
            kicker="📊 Builder Dashboard"
            title="Operational visibility that sales leaders actually use."
            subtitle="Sales intelligence, not vanity metrics."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="text-sm font-semibold">What you see</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "High-intent buyer count",
                  "Budget-wise demand split",
                  "Project-wise interest",
                  "Booked vs completed visits",
                  "Drop-off reasons",
                ].map((s) => (
                  <div
                    key={s}
                    className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold">Executive takeaway</div>
              <p className="mt-2 text-sm text-blue-700">
                Know which projects attract buyers — and why. Use real buyer
                signals to refine inventory, messaging, and follow-ups.
              </p>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="text-sm font-semibold">Quote</div>
                <p className="mt-1 text-sm text-blue-700">
                  “Know which projects attract buyers — and why.”
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Proof */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" id="proof">
        <SectionHeader
          kicker="🏆 Proof & Trust"
          title="Built for real estate funnels where timing decides revenue."
          subtitle="Deployed across active builder projects with high-volume buyer conversations."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card>
            <div className="text-sm font-semibold">Used across</div>
            <ul className="mt-3 space-y-2 text-sm text-blue-700">
              <li>• 15+ active builder projects</li>
              <li>• 10,000+ buyer conversations monthly</li>
              <li>• Residential · Commercial · Township · Luxury</li>
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            <div className="text-sm font-semibold">What builders say</div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-slate-700">
                  “We stopped losing serious buyers who didn’t fill forms. Site
                  visits increased within weeks.”
                </p>
                <p className="mt-3 text-xs font-semibold text-blue-600">
                  — Director, Residential Developer
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-slate-700">
                  “Agentlytics qualifies budget before our sales team calls.
                  Huge time saver.”
                </p>
                <p className="mt-3 text-xs font-semibold text-blue-600">
                  — Sales Head, Real Estate Group
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
          <div className="text-sm font-semibold">
            🧩 What changes after Agentlytics goes live
          </div>
          <div className="mt-4 grid gap-3 text-sm text-blue-700 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              Sales speaks only to qualified buyers
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              Faster site visit completion
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              Demand visibility by budget & project
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              Less dependency on channel partners
            </div>
          </div>

          <p className="mt-5 text-sm font-semibold text-blue-900">
            Your website becomes a digital sales executive.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-blue-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="rounded-3xl border border-blue-100 bg-blue-600 px-6 py-10 text-white shadow-sm sm:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Stop Letting Buyers Leave Silently
              </h3>
              <p className="mt-3 text-base text-slate-200">
                Engage property buyers automatically, qualify serious intent,
                and book site visits — without increasing sales headcount.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-900 hover:bg-slate-100">
                  Start Free — For Builder Websites
                </button>
                <button className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15">
                  Book a Builder Demo
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-300">
                Your property AI live in 10 minutes · No credit card required
              </p>
            </div>
          </div>

          {/* SEO metadata (for dev reference) */}
          <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <div className="text-sm font-semibold text-blue-900">
              🧭 SEO Metadata (for implementation)
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <div>
                <span className="font-semibold">Meta Title:</span> Agentlytics
                for Builders & Developers | AI Lead Qualification for Real
                Estate
              </div>
              <div>
                <span className="font-semibold">Meta Description:</span>{" "}
                Agentlytics helps builders convert property website visitors
                into qualified buyers. Proactive AI engages, qualifies by budget
                & intent, and books site visits automatically.
              </div>
              <div>
                <span className="font-semibold">Meta Keywords:</span> AI for
                builders, real estate AI agent, property lead qualification,
                site visit booking AI, builder website chatbot
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-blue-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-center text-sm text-blue-600 sm:px-6 sm:flex-row sm:text-left">
          <div>
            © {new Date().getFullYear()} Agentlytics. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#top" className="hover:text-slate-700">
              Back to top
            </a>
            <a href="#proof" className="hover:text-slate-700">
              Proof
            </a>
            <a href="#booking" className="hover:text-slate-700">
              Booking
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
