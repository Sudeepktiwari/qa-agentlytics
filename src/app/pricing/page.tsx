"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Agentlytics Pricing Page (Base plans only)
 * - Free / Growth / Scale
 * - Visitors are TOTAL visitors (lifetime allocation per plan)
 * - Credits refresh monthly
 * - Credits explanation sits under ROI header for correct buyer psychology
 */

// -----------------------------
// Locked Pricing Configuration
// -----------------------------
const PRICING = {
  free: {
    name: "Free",
    price: "$0",
    cadence: "",
    totalVisitors: 20,
    creditsPerMonth: 500,
    websites: 1,
  },
  growth: {
    name: "Growth",
    price: "$49",
    cadence: "month",
    totalVisitors: 25_000,
    creditsPerMonth: 7_000,
    websites: 1,
  },
  scale: {
    name: "Scale",
    price: "$99",
    cadence: "month",
    totalVisitors: 100_000,
    creditsPerMonth: 16_000,
    websites: 3,
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
  | "Calculator";

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
    <div className={cn("text-base font-semibold", className)}>{children}</div>
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
  return <div className="rounded-2xl border bg-background">{children}</div>;
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
      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium"
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
      className={cn(
        "px-4 pb-4 text-sm text-muted-foreground",
        !isOpen && "hidden"
      )}
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
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {props.title}
      </h2>
      {props.subtitle ? (
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {props.subtitle}
        </p>
      ) : null}
    </div>
  );
}

function Pill(props: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm">
      <span className="text-muted-foreground">{props.icon}</span>
      <span className="font-medium">{props.label}</span>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((b) => (
        <li key={b} className="flex gap-2">
          <Icon name="Check" className="mt-0.5 h-4 w-4" />
          <span className="text-muted-foreground">{b}</span>
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
              <div className="mt-2 text-sm text-muted-foreground">
                {props.tagline}
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="text-4xl font-semibold tracking-tight">
              {props.price}
            </div>
            {props.cadence ? (
              <div className="pb-1 text-sm text-muted-foreground">
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
            <div className="text-xs text-muted-foreground">
              {props.footnote}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {props.details.map((d) => (
              <div
                key={d.label}
                className="flex items-center justify-between rounded-2xl border bg-muted/20 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  {d.icon ? <Icon name={d.icon} className="h-4 w-4" /> : null}
                  <span className="text-muted-foreground">{d.label}</span>
                </div>
                <div className="text-sm font-medium">{d.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 text-sm font-medium">Includes</div>
            <BulletList items={props.bullets} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatCell(v: boolean | string) {
  if (typeof v === "string") return v;
  return v ? "✓" : "—";
}

// -----------------------------
// Minimal self-checks (lightweight “tests”)
// -----------------------------
function assertPricingInvariants() {
  console.assert(
    PRICING.free.totalVisitors > 0,
    "Free totalVisitors must be > 0"
  );
  console.assert(
    PRICING.growth.totalVisitors > PRICING.free.totalVisitors,
    "Growth visitors must exceed Free"
  );
  console.assert(
    PRICING.scale.totalVisitors > PRICING.growth.totalVisitors,
    "Scale visitors must exceed Growth"
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

  console.assert(PRICING.free.websites >= 1, "Websites must be >= 1");
  console.assert(
    PRICING.scale.websites >= PRICING.growth.websites,
    "Scale websites must be >= Growth websites"
  );

  // Price strings should be "$" prefixed
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
  const [openFaq, setOpenFaq] = React.useState<string | null>("q3");

  // Run lightweight checks only in dev
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    assertPricingInvariants();
  }

  // ROI blocks (illustrative, as confirmed)
  const roi = useMemo(() => {
    const growth = {
      visitors: PRICING.growth.totalVisitors,
      engagementRate: 0.02,
      qualifyRate: 0.1,
      conversions: 2,
      dealValue: 500,
      planPrice: 49,
    };
    const scale = {
      visitors: PRICING.scale.totalVisitors,
      engagementRate: 0.02,
      qualifyRate: 0.1,
      conversions: 5,
      dealValue: 1000,
      planPrice: 99,
    };

    const compute = (x: {
      visitors: number;
      engagementRate: number;
      qualifyRate: number;
      conversions: number;
      dealValue: number;
      planPrice: number;
    }) => {
      const conversations = Math.round(x.visitors * x.engagementRate);
      const leads = Math.round(conversations * x.qualifyRate);
      const revenue = x.conversions * x.dealValue;
      const roiMultiple = revenue / x.planPrice;
      return { conversations, leads, revenue, roiMultiple };
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
              <Icon name="Sparkles" className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Agentlytics</div>
              <div className="text-xs text-muted-foreground">Pricing</div>
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
              <Badge variant="outline">Engaged visitors + credits</Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Simple pricing that scales with traffic
            </h1>

            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Agentlytics pricing is based on{" "}
              <span className="font-medium">engaged visitors</span> and{" "}
              <span className="font-medium">AI credits</span>. Only visitors who
              interact with the widget are counted. Advanced AI actions consume
              credits.
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

      {/* PRICING CARDS */}
      <section
        className="mx-auto max-w-6xl px-4 pt-14 pb-14 sm:pt-20 sm:pb-20"
        id="plans"
      >
        <SectionHeader
          eyebrow="Plans"
          title="Free, Growth, and Scale"
          subtitle="Locked, clean pricing. Choose based on engaged visitors (total allocation) and how much AI reasoning you want to run."
        />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3"
        >
          <PriceCard
            name={PRICING.free.name}
            price={PRICING.free.price}
            tagline="Launch fast and validate demand"
            cta="Start Free"
            details={[
              {
                label: "Engaged visitors",
                value: formatNumber(PRICING.free.totalVisitors),
                icon: "Users",
              },
              {
                label: "AI credits",
                value: `${formatNumber(PRICING.free.creditsPerMonth)} / month`,
                icon: "Brain",
              },
            ]}
            bullets={[
              "Proactive widget + greeting",
              "Basic intent capture",
              "Lead capture form",
              "Conversation history",
              "Basic analytics view",
            ]}
            footnote="No credit card required"
          />

          <PriceCard
            name={PRICING.growth.name}
            price={PRICING.growth.price}
            cadence={PRICING.growth.cadence}
            tagline="Convert traffic into qualified demand"
            badge="Most Popular"
            cta="Upgrade to Growth"
            variant="highlight"
            details={[
              {
                label: "Engaged visitors",
                value: formatNumber(PRICING.growth.totalVisitors),
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
              "Behavior triggers (scroll/dwell/exit)",
              "AI-powered qualification",
              "Lead summaries (intent + key details)",
              "Analytics dashboard",
            ]}
            footnote="Optimized for ROI-driven growth teams"
          />

          <PriceCard
            name={PRICING.scale.name}
            price={PRICING.scale.price}
            cadence={PRICING.scale.cadence}
            tagline="Max ROI on high-volume traffic"
            cta="Go Scale"
            details={[
              {
                label: "Engaged visitors",
                value: formatNumber(PRICING.scale.totalVisitors),
                icon: "Users",
              },
              {
                label: "AI credits",
                value: `${formatNumber(PRICING.scale.creditsPerMonth)} / month`,
                icon: "Brain",
              },
            ]}
            bullets={[
              "Advanced qualification flows",
              "Higher throughput limits",
              "Advanced analytics",
              "Priority processing",
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
          title="See what one extra lead pays for"
          subtitle="Conservative examples to help you estimate impact—results vary by industry and traffic quality."
        />

        {/* AI Usage / Credits (Customer-facing, provider-agnostic) */}
        <div
          id="credits"
          className="mt-6 rounded-3xl border bg-background p-6 shadow-sm sm:p-8"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                How AI credits are used
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                A simple, predictable meter for AI effort (not provider
                pricing).
              </div>
            </div>
            <Badge variant="outline">Simple &amp; Predictable</Badge>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">AI activity</th>
                  <th className="py-2 pr-4">What happens</th>
                  <th className="py-2">Credits used</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-3 pr-4 font-medium">AI input processing</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    User message is analyzed and understood
                  </td>
                  <td className="py-3">Low</td>
                </tr>
                <tr className="border-t">
                  <td className="py-3 pr-4 font-medium">
                    Cached AI processing
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    Previously processed context is reused
                  </td>
                  <td className="py-3">Very low</td>
                </tr>
                <tr className="border-t">
                  <td className="py-3 pr-4 font-medium">
                    AI output generation
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    AI generates a response, summary, or qualification
                  </td>
                  <td className="py-3">Moderate</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Credits represent AI effort, not infrastructure cost. Credits
            refresh monthly; total visitors do not.
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Growth ROI Example</CardTitle>
              <div className="mt-2 text-sm text-muted-foreground">
                25,000 site visitors • 2% engagement • 10% qualification • $500
                deal value
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {formatNumber(PRICING.growth.totalVisitors)} visitors × 2% ={" "}
                <span className="font-medium text-foreground">
                  {formatNumber(roi.growth.conversations)}
                </span>{" "}
                conversations
              </p>
              <p>
                {formatNumber(roi.growth.conversations)} × 10% ={" "}
                <span className="font-medium text-foreground">
                  {formatNumber(roi.growth.leads)}
                </span>{" "}
                qualified leads
              </p>
              <p>
                2 conversions × $500 ={" "}
                <span className="font-medium text-foreground">
                  {formatMoney(roi.growth.revenue)}
                </span>{" "}
                revenue
              </p>
              <div className="mt-3 rounded-2xl border bg-muted/20 p-4 text-sm">
                <div className="font-semibold text-foreground">
                  $49 plan {"→"} ~{roi.growth.roiMultiple.toFixed(0)}
                  {"×"} ROI
                </div>
                <div className="mt-1 text-muted-foreground">
                  Examples only. Actual results depend on traffic quality,
                  offer, and conversion funnel.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scale ROI Example</CardTitle>
              <div className="mt-2 text-sm text-muted-foreground">
                100,000 site visitors • 2% engagement • 10% qualification •
                $1,000 deal value
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {formatNumber(PRICING.scale.totalVisitors)} visitors × 2% ={" "}
                <span className="font-medium text-foreground">
                  {formatNumber(roi.scale.conversations)}
                </span>{" "}
                conversations
              </p>
              <p>
                {formatNumber(roi.scale.conversations)} × 10% ={" "}
                <span className="font-medium text-foreground">
                  {formatNumber(roi.scale.leads)}
                </span>{" "}
                qualified leads
              </p>
              <p>
                5 conversions × $1,000 ={" "}
                <span className="font-medium text-foreground">
                  {formatMoney(roi.scale.revenue)}
                </span>{" "}
                revenue
              </p>
              <div className="mt-3 rounded-2xl border bg-muted/20 p-4 text-sm">
                <div className="font-semibold text-foreground">
                  $99 plan {"→"} ~{roi.scale.roiMultiple.toFixed(0)}
                  {"×"} ROI
                </div>
                <div className="mt-1 text-muted-foreground">
                  Examples only. Actual results depend on traffic quality,
                  offer, and conversion funnel.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => scrollToId("plans")}>
            Back to plans <Icon name="ChevronRight" className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* FEATURE COMPARISON */}
      <section
        className="mx-auto max-w-6xl px-4 pt-14 pb-14 sm:pt-20 sm:pb-20"
        id="compare"
      >
        <SectionHeader
          eyebrow="Comparison"
          title="What’s included in each plan"
          subtitle="Base Agentlytics only (no human handover, no agent mode, no coaching, no 9-metric analytics)."
        />

        <div className="mt-10 rounded-3xl border bg-background p-4 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-muted/20 p-4 sm:grid-cols-4 sm:items-center">
            <div className="text-sm font-medium">Feature</div>
            <div className="text-sm text-muted-foreground">Free</div>
            <div className="text-sm text-muted-foreground">Growth</div>
            <div className="text-sm text-muted-foreground">Scale</div>
          </div>

          {[
            { f: "Proactive widget + greeting", a: true, b: true, c: true },
            {
              f: "Behavior triggers (scroll/dwell/exit)",
              a: false,
              b: true,
              c: true,
            },
            { f: "AI qualification", a: "Basic", b: true, c: true },
            { f: "Custom questions", a: false, b: true, c: true },
            { f: "Lead summaries", a: false, b: true, c: true },
            { f: "Analytics dashboard", a: "Basic", b: true, c: "Advanced" },
            { f: "Multiple websites", a: false, b: false, c: true },
            { f: "Priority processing", a: false, b: false, c: true },
          ].map((row) => (
            <div
              key={row.f}
              className="mt-3 grid grid-cols-1 gap-3 rounded-2xl border bg-background p-4 sm:grid-cols-4 sm:items-center"
            >
              <div className="text-sm font-medium">{row.f}</div>
              <div className="text-sm text-muted-foreground">
                {formatCell(row.a)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCell(row.b)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCell(row.c)}
              </div>
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

        <div className="mt-10 rounded-3xl border bg-background p-4 shadow-sm sm:p-8">
          <Accordion>
            <AccordionItem>
              <AccordionTrigger
                onClick={() => setOpenFaq(openFaq === "q3" ? null : "q3")}
                isOpen={openFaq === "q3"}
              >
                How do AI credits work?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q3"}>
                Credits are consumed only for advanced AI reasoning (intent,
                qualification, summaries). Credits refresh monthly. If credits
                run low, you can fall back to Lite mode until they renew.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() => setOpenFaq(openFaq === "q6" ? null : "q6")}
                isOpen={openFaq === "q6"}
              >
                If I delete a visitor/lead, does it reduce my engaged visitor
                usage?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q6"}>
                No. Deleting a visitor/lead does not change your plan usage.
                Engaged visitor limits are based on unique engaged visitors
                processed, not on records stored. Deletions only affect your
                dashboard history.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() => setOpenFaq(openFaq === "q1" ? null : "q1")}
                isOpen={openFaq === "q1"}
              >
                Do engaged visitors reset?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q1"}>
                No. Engaged visitors are a lifetime allocation for your plan.
                When you reach the limit, you upgrade to the next plan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() => setOpenFaq(openFaq === "q2" ? null : "q2")}
                isOpen={openFaq === "q2"}
              >
                What happens if I exceed my engaged visitor limit?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q2"}>
                You upgrade to the next plan for higher engaged visitor
                capacity. This keeps limits aligned with your growth.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() => setOpenFaq(openFaq === "q4" ? null : "q4")}
                isOpen={openFaq === "q4"}
              >
                Does this pricing include human handover or 9-metric coaching?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q4"}>
                No. This page covers base Agentlytics only. Human handover and
                coaching are separate modules and will be priced separately.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem>
              <AccordionTrigger
                onClick={() => setOpenFaq(openFaq === "q5" ? null : "q5")}
                isOpen={openFaq === "q5"}
              >
                Can I upgrade anytime?
              </AccordionTrigger>
              <AccordionContent isOpen={openFaq === "q5"}>
                Yes. You can upgrade whenever your traffic grows. Upgrading
                ensures you don’t hit capacity limits.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-4 rounded-3xl border bg-background p-6 shadow-sm sm:flex-row">
          <div>
            <div className="text-base font-semibold">
              Start Free. Upgrade when you reach the limit.
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Free includes {formatNumber(PRICING.free.totalVisitors)} engaged
              visitors and {formatNumber(PRICING.free.creditsPerMonth)}{" "}
              credits/month.
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

      <footer className="border-t bg-background/80">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <div className="text-sm font-semibold">Agentlytics</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Proactive AI pricing — Free, Growth, Scale.
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Agentlytics
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
