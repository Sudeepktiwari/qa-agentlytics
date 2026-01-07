"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Agentlytics Pricing Page (Base plans only)
 * - Free / Growth / Scale
 * - Lead limit is TOTAL (lifetime allocation per plan)
 * - AI credits refresh monthly
 * - Features are NOT restricted by plan
 * - After lead limit: new lead contact details are masked until upgrade
 * - Customer-facing language avoids provider pricing/tokens
 */

// -----------------------------
// Locked Pricing Configuration
// -----------------------------
const PRICING = {
  free: {
    name: "Free",
    price: "$0",
    cadence: "",
    leadsTotal: 20,
    creditsPerMonth: 500,
  },
  growth: {
    name: "Growth",
    price: "$49",
    cadence: "month",
    leadsTotal: 25_000,
    creditsPerMonth: 7_000,
  },
  scale: {
    name: "Scale",
    price: "$99",
    cadence: "month",
    leadsTotal: 100_000,
    creditsPerMonth: 16_000,
  },
} as const;

type IconName =
  | "ArrowRight"
  | "Check"
  | "ChevronRight"
  | "Shield"
  | "Sparkles"
  | "Timer"
  | "Users"
  | "Bot"
  | "BarChart3"
  | "Brain"
  | "Calculator"
  | "Lock";

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<IconName, React.ReactNode> = {
    ArrowRight: (
      <>
        <path {...common} d="M5 12h12" />
        <path {...common} d="M13 6l6 6-6 6" />
      </>
    ),
    ChevronRight: <path {...common} d="M10 6l6 6-6 6" />,
    Check: <path {...common} d="M20 6L9 17l-5-5" />,
    Sparkles: (
      <>
        <path
          {...common}
          d="M12 2l1.2 3.6L17 7l-3.8 1.4L12 12l-1.2-3.6L7 7l3.8-1.4L12 2z"
        />
        <path
          {...common}
          d="M19 12l.7 2.1L22 15l-2.3.9L19 18l-.7-2.1L16 15l2.3-.9L19 12z"
        />
      </>
    ),
    Shield: (
      <path
        {...common}
        d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"
      />
    ),
    Timer: (
      <>
        <path {...common} d="M10 2h4" />
        <path {...common} d="M12 14l3-3" />
        <path {...common} d="M12 22a9 9 0 1 0-9-9 9 9 0 0 0 9 9z" />
      </>
    ),
    Users: (
      <>
        <path {...common} d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <path {...common} d="M16 3.1a4 4 0 0 1 0 7.8" />
        <path {...common} d="M12 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
        <path {...common} d="M20 21v-2a4 4 0 0 0-3-3.87" />
      </>
    ),
    Bot: (
      <>
        <path {...common} d="M12 2v3" />
        <path {...common} d="M7 7h10" />
        <path {...common} d="M6 7v8a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V7" />
        <path {...common} d="M9 12h.01" />
        <path {...common} d="M15 12h.01" />
        <path {...common} d="M9 16h6" />
      </>
    ),
    Brain: (
      <>
        <path
          {...common}
          d="M8 6a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3"
        />
        <path {...common} d="M8 8H7a3 3 0 0 0 0 6h1" />
        <path {...common} d="M16 10h1a3 3 0 0 1 0 6h-1" />
      </>
    ),
    BarChart3: (
      <>
        <path {...common} d="M3 3v18h18" />
        <path {...common} d="M7 16v-6" />
        <path {...common} d="M12 16V6" />
        <path {...common} d="M17 16v-9" />
      </>
    ),
    Calculator: (
      <>
        <path
          {...common}
          d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        />
        <path {...common} d="M8 6h8" />
        <path {...common} d="M8 11h2" />
        <path {...common} d="M12 11h2" />
        <path {...common} d="M16 11h0" />
        <path {...common} d="M8 15h2" />
        <path {...common} d="M12 15h2" />
        <path {...common} d="M8 19h8" />
      </>
    ),
    Lock: (
      <>
        <path {...common} d="M7 11V8a5 5 0 0 1 10 0v3" />
        <path {...common} d="M6 11h12v10H6z" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

// -----------------------------
// Minimal UI components (self-contained)
// -----------------------------
function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium transition border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006BFF]/30";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
  };
  const variants = {
    primary:
      "bg-[#006BFF] text-white border-[#006BFF] hover:bg-[#005CE6] hover:border-[#005CE6]",
    outline: "bg-white text-[#0B1F3B] border-[#D7E3F3] hover:bg-[#F5FAFF]",
    ghost:
      "bg-transparent text-[#0B1F3B] border-transparent hover:bg-[#F5FAFF]",
  };
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </button>
  );
}

function Badge({
  children,
  variant = "secondary",
  className,
}: {
  children: React.ReactNode;
  variant?: "secondary" | "outline";
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  const variants = {
    secondary: "bg-[#EBF2FA] text-[#0B1F3B] border border-[#D7E3F3]",
    outline: "bg-white text-[#0B1F3B] border border-[#D7E3F3]",
  };
  return (
    <span className={cn(base, variants[variant], className)}>{children}</span>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#D7E3F3] bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 pb-6", className)}>{children}</div>;
}
function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-base font-semibold text-[#0B1F3B]", className)}>
      {children}
    </div>
  );
}

function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}

function AccordionItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#D7E3F3] bg-white">
      {children}
    </div>
  );
}

function AccordionTrigger({
  children,
  onClick,
  isOpen,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-[#0B1F3B]"
    >
      <span>{children}</span>
      <span className={cn("transition", isOpen ? "rotate-90" : "rotate-0")}>
        <Icon name="ChevronRight" className="h-4 w-4" />
      </span>
    </button>
  );
}

function AccordionContent({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <div
      className={cn("px-4 pb-4 text-sm text-slate-600", !isOpen && "hidden")}
    >
      {children}
    </div>
  );
}

// -----------------------------
// Page helpers
// -----------------------------
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SectionHeader(props: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {props.eyebrow ? (
        <div className="mb-3 flex items-center justify-center gap-2">
          <Badge variant="secondary">{props.eyebrow}</Badge>
        </div>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-[#0B1F3B] sm:text-3xl">
        {props.title}
      </h2>
      {props.subtitle ? (
        <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
          {props.subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Pill(props: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#D7E3F3] bg-white px-3 py-1 text-sm">
      <span className="text-slate-500">{props.icon}</span>
      <span className="font-medium text-[#0B1F3B]">{props.label}</span>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((b) => (
        <li key={b} className="flex gap-2">
          <Icon name="Check" className="mt-0.5 h-4 w-4 text-[#006BFF]" />
          <span className="text-slate-600">{b}</span>
        </li>
      ))}
    </ul>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatMoney(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function PriceCard(props: {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  badge?: string;
  cta: string;
  variant?: "default" | "highlight";
  details: { label: string; value: string; icon?: IconName }[];
  bullets: string[];
  footnote?: string;
}) {
  const highlight = props.variant === "highlight";
  return (
    <motion.div variants={item}>
      <Card
        className={cn(
          "relative h-full overflow-hidden",
          highlight && "border-[#9CC2FF] ring-1 ring-[#006BFF]/20"
        )}
      >
        {highlight ? (
          <div className="absolute inset-x-0 top-0 h-2 bg-[#006BFF]" />
        ) : null}
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>{props.name}</CardTitle>
                {props.badge ? (
                  <Badge variant="secondary">{props.badge}</Badge>
                ) : null}
              </div>
              <div className="mt-2 text-sm text-slate-600">{props.tagline}</div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="text-4xl font-semibold tracking-tight text-[#0B1F3B]">
              {props.price}
            </div>
            {props.cadence ? (
              <div className="pb-1 text-sm text-slate-600">
                /{props.cadence}
              </div>
            ) : null}
          </div>

          <Button
            className="w-full"
            variant={highlight ? "primary" : "outline"}
            onClick={() => scrollToId("compare")}
          >
            {props.cta} <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
          </Button>

          {props.footnote ? (
            <div className="text-xs text-slate-600">{props.footnote}</div>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {props.details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  {d.icon ? (
                    <Icon name={d.icon} className="h-4 w-4 text-[#0B1F3B]" />
                  ) : null}
                  <span className="text-slate-600">{d.label}</span>
                </div>
                <div className="text-sm font-medium text-[#0B1F3B]">
                  {d.value}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 text-sm font-medium text-[#0B1F3B]">
              Includes
            </div>
            <BulletList items={props.bullets} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// -----------------------------
// Minimal self-checks (lightweight “tests”)
// -----------------------------
function assertPricingInvariants() {
  console.assert(PRICING.free.leadsTotal > 0, "Free leadsTotal must be > 0");
  console.assert(
    PRICING.growth.leadsTotal > PRICING.free.leadsTotal,
    "Growth leads must exceed Free"
  );
  console.assert(
    PRICING.scale.leadsTotal > PRICING.growth.leadsTotal,
    "Scale leads must exceed Growth"
  );

  console.assert(
    PRICING.free.creditsPerMonth > 0,
    "Free creditsPerMonth must be > 0"
  );
  console.assert(
    PRICING.growth.creditsPerMonth > PRICING.free.creditsPerMonth,
    "Growth credits must exceed Free"
  );
  console.assert(
    PRICING.scale.creditsPerMonth > PRICING.growth.creditsPerMonth,
    "Scale credits must exceed Growth"
  );

  console.assert(
    PRICING.growth.price.startsWith("$"),
    "Growth price format should start with $"
  );
  console.assert(
    PRICING.scale.price.startsWith("$"),
    "Scale price format should start with $"
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = React.useState<string | null>("q_lead_def");

  // Run lightweight checks only in dev
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    assertPricingInvariants();
  }

  // ROI blocks (illustrative and conservative)
  const roi = useMemo(() => {
    const growth = {
      traffic: 25_000,
      engagementRate: 0.02,
      leadCaptureRate: 0.15,
      closedDeals: 1,
      dealValue: 500,
      planPrice: 49,
    };
    const scale = {
      traffic: 100_000,
      engagementRate: 0.02,
      leadCaptureRate: 0.15,
      closedDeals: 3,
      dealValue: 1000,
      planPrice: 99,
    };

    const compute = (x: typeof growth) => {
      const engaged = Math.round(x.traffic * x.engagementRate);
      const leads = Math.round(engaged * x.leadCaptureRate);
      const revenue = x.closedDeals * x.dealValue;
      const roiMultiple = revenue / x.planPrice;
      return { engaged, leads, revenue, roiMultiple };
    };

    return {
      growth: { ...growth, ...compute(growth) },
      scale: { ...scale, ...compute(scale) },
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5FAFF] via-white to-[#F7FAFF]">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-[#D7E3F3] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#D7E3F3] bg-white">
              <Icon name="Sparkles" className="h-4 w-4 text-[#006BFF]" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[#0B1F3B]">
                Agentlytics
              </div>
              <div className="text-xs text-slate-600">Pricing</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="ghost" onClick={() => scrollToId("plans")}>
              Plans
            </Button>
            <Button variant="ghost" onClick={() => scrollToId("roi")}>
              ROI
            </Button>
            <Button variant="ghost" onClick={() => scrollToId("credits")}>
              Credits
            </Button>
            <Button variant="outline" onClick={() => scrollToId("faq")}>
              FAQ
            </Button>
            <Button onClick={() => scrollToId("plans")}>
              Start Free <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="sm:hidden">
            <Button size="sm" onClick={() => scrollToId("plans")}>
              Start <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-[#D7E3F3] bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">Base Plans</Badge>
              <Badge variant="outline">Proactive AI</Badge>
              <Badge variant="outline">Leads + credits</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0B1F3B] sm:text-5xl">
              Pricing that matches outcomes
            </h1>

            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              All plans include the full Agentlytics experience. You only pay
              more when you capture more demand (lead capacity) and run more AI
              work (monthly credits).
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={() => scrollToId("plans")}>
                Start Free <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => scrollToId("compare")}>
                Compare Plans{" "}
                <Icon name="ChevronRight" className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Pill
                icon={<Icon name="Timer" className="h-4 w-4" />}
                label="Works on any website"
              />
              <Pill
                icon={<Icon name="Shield" className="h-4 w-4" />}
                label="Transparent limits"
              />
              <Pill
                icon={<Icon name="Users" className="h-4 w-4" />}
                label="Upgrade when you grow"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* PLANS */}
      <section
        className="mx-auto max-w-6xl px-4 pt-14 pb-14 sm:pt-20 sm:pb-24"
        id="plans"
      >
        <SectionHeader
          eyebrow="Plans"
          title="Same product power. Different lead capacity."
          subtitle="Lead limits are a total allocation (they do not reset monthly). Monthly AI credits refresh each billing cycle. When you reach your lead limit, new lead contact details are masked until you upgrade."
        />

        {/* Clarity strip */}
        <div className="mt-8 rounded-3xl border border-[#D7E3F3] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#D7E3F3] bg-[#F5FAFF] p-4">
              <div className="text-sm font-semibold text-[#0B1F3B]">
                Lead definition
              </div>
              <div className="mt-1 text-sm text-slate-600">
                A <span className="font-medium text-[#0B1F3B]">lead</span> is
                counted only when a visitor engages and shares contact details
                (email/phone).
              </div>
            </div>
            <div className="rounded-2xl border border-[#D7E3F3] bg-[#F5FAFF] p-4">
              <div className="text-sm font-semibold text-[#0B1F3B]">
                What happens at the limit
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Agentlytics still qualifies new leads and shows intent +
                summaries, but new contact details are masked until you upgrade.
              </div>
            </div>
            <div className="rounded-2xl border border-[#D7E3F3] bg-[#F5FAFF] p-4">
              <div className="text-sm font-semibold text-[#0B1F3B]">
                Deletion rule
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Deleting a visitor/lead does not reduce usage. Limits are based
                on unique leads captured.
              </div>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <PriceCard
            name="Free"
            price={PRICING.free.price}
            tagline="Launch fast and validate demand"
            cta="Start Free"
            details={[
              {
                label: "Leads",
                value: `${formatNumber(PRICING.free.leadsTotal)} total`,
                icon: "Users",
              },
              {
                label: "AI credits",
                value: `${formatNumber(PRICING.free.creditsPerMonth)} / month`,
                icon: "Brain",
              },
            ]}
            bullets={[
              "Proactive widget + smart greeting",
              "Behavior triggers (scroll, dwell, exit)",
              "AI qualification (intent + key questions)",
              "Lead summary (need, timeline, budget signal, use-case)",
              "Conversation transcript (PII redacted)",
              "Basic analytics view",
              "After limit: new lead contact details are masked",
            ]}
            footnote="No credit card required"
          />

          <PriceCard
            name="Growth"
            price={PRICING.growth.price}
            cadence={PRICING.growth.cadence}
            tagline="Convert traffic into qualified demand"
            badge="Most Popular"
            cta="Upgrade to Growth"
            variant="highlight"
            details={[
              {
                label: "Leads",
                value: `${formatNumber(PRICING.growth.leadsTotal)} total`,
                icon: "Users",
              },
              {
                label: "AI credits",
                value: `${formatNumber(
                  PRICING.growth.creditsPerMonth
                )} / month`,
                icon: "Brain",
              },
            ]}
            bullets={[
              "Proactive widget + smart greeting",
              "Behavior triggers (scroll, dwell, exit)",
              "AI qualification (intent + key questions)",
              "Lead summary (need, timeline, budget signal, use-case)",
              "Conversation transcript (PII redacted)",
              "Analytics dashboard",
              "After limit: new lead contact details are masked",
            ]}
            footnote="Optimized for ROI-driven growth teams"
          />

          <PriceCard
            name="Scale"
            price={PRICING.scale.price}
            cadence={PRICING.scale.cadence}
            tagline="Max ROI on high-volume traffic"
            cta="Go Scale"
            details={[
              {
                label: "Leads",
                value: `${formatNumber(PRICING.scale.leadsTotal)} total`,
                icon: "Users",
              },
              {
                label: "AI credits",
                value: `${formatNumber(PRICING.scale.creditsPerMonth)} / month`,
                icon: "Brain",
              },
            ]}
            bullets={[
              "Proactive widget + smart greeting",
              "Behavior triggers (scroll, dwell, exit)",
              "AI qualification (intent + key questions)",
              "Lead summary (need, timeline, budget signal, use-case)",
              "Conversation transcript (PII redacted)",
              "Advanced analytics",
              "After limit: new lead contact details are masked",
            ]}
            footnote="Built for teams optimizing cost vs conversion"
          />
        </motion.div>
      </section>

      {/* ROI */}
      <section
        className="mx-auto max-w-6xl px-4 pt-14 pb-14 sm:pt-20 sm:pb-20"
        id="roi"
      >
        <SectionHeader
          eyebrow="ROI"
          title="Conservative math that’s easy to believe"
          subtitle="Small conversion wins outweigh plan cost quickly. These examples assume modest engagement and lead capture."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>Growth example</CardTitle>
                <Badge variant="outline">${PRICING.growth.price}/mo plan</Badge>
              </div>
              <div className="text-sm text-slate-600">
                On {formatNumber(roi.growth.traffic)} site visitors, at{" "}
                {Math.round(roi.growth.engagementRate * 100)}% engagement and{" "}
                {Math.round(roi.growth.leadCaptureRate * 100)}% lead capture.
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
                  <div className="text-xs text-slate-600">Engaged visitors</div>
                  <div className="mt-1 text-lg font-semibold text-[#0B1F3B]">
                    {formatNumber(roi.growth.engaged)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
                  <div className="text-xs text-slate-600">Leads captured</div>
                  <div className="mt-1 text-lg font-semibold text-[#0B1F3B]">
                    {formatNumber(roi.growth.leads)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
                  <div className="text-xs text-slate-600">Revenue impact</div>
                  <div className="mt-1 text-lg font-semibold text-[#0B1F3B]">
                    {formatMoney(roi.growth.revenue)}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#D7E3F3] bg-white p-4">
                <div className="flex items-center gap-2">
                  <Icon name="Calculator" className="h-4 w-4 text-[#006BFF]" />
                  <div className="text-sm font-medium text-[#0B1F3B]">
                    Approx ROI multiple: ~{roi.growth.roiMultiple.toFixed(0)}x
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Example assumption: {roi.growth.closedDeals} closed deal(s) at{" "}
                  {formatMoney(roi.growth.dealValue)} each.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>Scale example</CardTitle>
                <Badge variant="outline">${PRICING.scale.price}/mo plan</Badge>
              </div>
              <div className="text-sm text-slate-600">
                On {formatNumber(roi.scale.traffic)} site visitors, at{" "}
                {Math.round(roi.scale.engagementRate * 100)}% engagement and{" "}
                {Math.round(roi.scale.leadCaptureRate * 100)}% lead capture.
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
                  <div className="text-xs text-slate-600">Engaged visitors</div>
                  <div className="mt-1 text-lg font-semibold text-[#0B1F3B]">
                    {formatNumber(roi.scale.engaged)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
                  <div className="text-xs text-slate-600">Leads captured</div>
                  <div className="mt-1 text-lg font-semibold text-[#0B1F3B]">
                    {formatNumber(roi.scale.leads)}
                  </div>
                </div>
                <div className="rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
                  <div className="text-xs text-slate-600">Revenue impact</div>
                  <div className="mt-1 text-lg font-semibold text-[#0B1F3B]">
                    {formatMoney(roi.scale.revenue)}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-[#D7E3F3] bg-white p-4">
                <div className="flex items-center gap-2">
                  <Icon name="Calculator" className="h-4 w-4 text-[#006BFF]" />
                  <div className="text-sm font-medium text-[#0B1F3B]">
                    Approx ROI multiple: ~{roi.scale.roiMultiple.toFixed(0)}x
                  </div>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Example assumption: {roi.scale.closedDeals} closed deal(s) at{" "}
                  {formatMoney(roi.scale.dealValue)} each.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credits explanation placed directly under ROI */}
        <div className="mt-10" id="credits">
          <SectionHeader
            eyebrow="Credits"
            title="What credits mean"
            subtitle="Credits measure AI effort (not infrastructure cost). This keeps pricing predictable and independent of underlying AI providers."
          />

          <div className="mt-8 rounded-3xl border border-[#D7E3F3] bg-white p-6 shadow-sm sm:p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D7E3F3]">
                    <th className="py-3 pr-4 font-semibold text-[#0B1F3B]">
                      AI activity
                    </th>
                    <th className="py-3 pr-4 font-semibold text-[#0B1F3B]">
                      What happens
                    </th>
                    <th className="py-3 font-semibold text-[#0B1F3B]">
                      Credits used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#D7E3F3]">
                    <td className="py-3 pr-4 text-[#0B1F3B]">
                      AI input processing
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      User message is analyzed and understood
                    </td>
                    <td className="py-3 text-slate-600">Low</td>
                  </tr>
                  <tr className="border-b border-[#D7E3F3]">
                    <td className="py-3 pr-4 text-[#0B1F3B]">
                      Cached AI processing
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      Previously processed context is reused
                    </td>
                    <td className="py-3 text-slate-600">Very low</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-[#0B1F3B]">
                      AI output generation
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      Agentlytics generates a response, summary, or
                      qualification
                    </td>
                    <td className="py-3 text-slate-600">Moderate</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4">
              <div className="flex items-center gap-2">
                <Icon name="Brain" className="h-4 w-4 text-[#006BFF]" />
                <div className="text-sm font-medium text-[#0B1F3B]">
                  Credits refresh monthly
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Lead limits are a total allocation for your plan. Credits
                refresh monthly so you can forecast usage reliably as you grow.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE COMPARISON */}
      <section
        className="mx-auto max-w-6xl px-4 pt-14 pb-14 sm:pt-20 sm:pb-20"
        id="compare"
      >
        <SectionHeader
          eyebrow="Comparison"
          title="What changes by plan"
          subtitle="Features are not restricted by plan. Plans only differ by total lead capacity and monthly AI credits."
        />

        <div className="mt-10 rounded-3xl border border-[#D7E3F3] bg-white p-4 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-[#D7E3F3] bg-[#F7FAFF] p-4 sm:grid-cols-4 sm:items-center">
            <div className="text-sm font-medium text-[#0B1F3B]">Item</div>
            <div className="text-sm text-slate-600">Free</div>
            <div className="text-sm text-slate-600">Growth</div>
            <div className="text-sm text-slate-600">Scale</div>
          </div>

          {[
            {
              label: "Proactive widget + triggers + qualification",
              free: "Included",
              growth: "Included",
              scale: "Included",
            },
            {
              label: "Lead summaries + transcripts (PII redacted)",
              free: "Included",
              growth: "Included",
              scale: "Included",
            },
            {
              label: "Analytics",
              free: "Included",
              growth: "Included",
              scale: "Included",
            },
            {
              label: "Total lead capacity",
              free: `${formatNumber(PRICING.free.leadsTotal)} total`,
              growth: `${formatNumber(PRICING.growth.leadsTotal)} total`,
              scale: `${formatNumber(PRICING.scale.leadsTotal)} total`,
            },
            {
              label: "Monthly AI credits",
              free: `${formatNumber(PRICING.free.creditsPerMonth)} / month`,
              growth: `${formatNumber(PRICING.growth.creditsPerMonth)} / month`,
              scale: `${formatNumber(PRICING.scale.creditsPerMonth)} / month`,
            },
            {
              label: "After lead limit",
              free: "New contact details masked",
              growth: "New contact details masked",
              scale: "New contact details masked",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border border-[#D7E3F3] bg-white p-4 sm:grid-cols-4 sm:items-center"
            >
              <div className="text-sm font-medium text-[#0B1F3B]">
                {row.label}
              </div>
              <div className="text-sm text-slate-600">{row.free}</div>
              <div className="text-sm text-slate-600">{row.growth}</div>
              <div className="text-sm text-slate-600">{row.scale}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        className="mx-auto max-w-6xl px-4 pt-14 pb-16 sm:pt-20 sm:pb-24"
        id="faq"
      >
        <SectionHeader
          eyebrow="FAQ"
          title="Questions that impact conversion"
          subtitle="Clear answers reduce friction and increase upgrades."
        />

        <div className="mt-10 rounded-3xl border border-[#D7E3F3] bg-white p-4 shadow-sm sm:p-8">
          <Accordion>
            <AccordionItem>
              <AccordionTrigger
                onClick={() =>
                  setOpenFaq(openFaq === "q_lead_def" ? null : "q_lead_def")
                }
                isOpen={openFaq === "q_lead_def"}
              >
                What counts as a lead?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q_lead_def"}>
                A lead is counted only when a visitor engages and shares contact
                details (email and/or phone). Passive traffic and chats without
                contact details do not count.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() =>
                  setOpenFaq(openFaq === "q_limit" ? null : "q_limit")
                }
                isOpen={openFaq === "q_limit"}
              >
                Do lead limits reset monthly?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q_limit"}>
                No. Lead limits are a total allocation for your plan. When you
                reach the limit, you upgrade to the next plan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() =>
                  setOpenFaq(openFaq === "q_mask" ? null : "q_mask")
                }
                isOpen={openFaq === "q_mask"}
              >
                What happens after I hit my lead limit?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q_mask"}>
                Agentlytics keeps qualifying new leads and showing intent +
                summaries, but new lead contact details (name, email, phone) are
                masked until you upgrade.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() =>
                  setOpenFaq(openFaq === "q_delete" ? null : "q_delete")
                }
                isOpen={openFaq === "q_delete"}
              >
                If I delete a visitor/lead, does it reduce my usage?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q_delete"}>
                No. Deleting a visitor/lead does not reduce usage. Limits are
                based on unique leads captured, not on records stored.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() =>
                  setOpenFaq(openFaq === "q_credits" ? null : "q_credits")
                }
                isOpen={openFaq === "q_credits"}
              >
                How do monthly AI credits work?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q_credits"}>
                Credits are consumed for AI work (understanding, summarizing,
                qualifying). Credits refresh monthly. If you run out, you can
                wait for renewal or upgrade for a higher monthly credit
                allowance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 rounded-3xl border border-[#D7E3F3] bg-white p-6 shadow-sm sm:flex-row">
          <div>
            <div className="text-base font-semibold text-[#0B1F3B]">
              Start Free. Upgrade when you hit the limit.
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Free includes {formatNumber(PRICING.free.leadsTotal)} total leads
              and {formatNumber(PRICING.free.creditsPerMonth)} credits/month.
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => scrollToId("plans")}>
              Start Free <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => scrollToId("roi")}>
              See ROI
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#D7E3F3] bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <div className="text-sm font-semibold text-[#0B1F3B]">
                Agentlytics
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Proactive AI pricing — Free, Growth, Scale.
              </div>
            </div>
            <div className="text-sm text-slate-600">
              © {new Date().getFullYear()} Agentlytics
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
