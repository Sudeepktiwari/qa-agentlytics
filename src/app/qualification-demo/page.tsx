import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/**
 * Agentlytics Use Case Page
 * Recover Lost Demos from Pricing Page Drop-Off
 *
 * Theme:
 * - Accent: #10acac (teal)
 * - Calendly-esque: clean, airy, high-contrast typography
 */

const ACCENT = "#10acac";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ScrollTo({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <button
      onClick={() =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-950"
      type="button"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </div>
      <div className="mt-1 text-sm text-zinc-600">{label}</div>
    </div>
  );
}

function MiniPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
      {children}
    </span>
  );
}

function LiveQualificationSnapshot() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const content = useMemo(() => {
    if (step === 1)
      return {
        title: "Live Qualification Snapshot",
        subtitle: "Pricing visitor detected · silent qualification running",
        chips: [
          "Pricing dwell 2m 48s",
          "Plan comparison loop",
          "Security page visit",
        ],
        boxTitle: "Visitor Context",
        rows: [
          ["Role signal", "VP Engineering"],
          ["Company size", "200–500"],
          ["Primary concern", "Security / compliance"],
          ["Intent", "High"],
        ],
        cta: "Offer: Compliance-ready demo",
      };
    if (step === 2)
      return {
        title: "Action Routing",
        subtitle: "Right next step chosen — not every buyer needs a demo",
        chips: [
          "Intent score 82/100",
          "Authority present",
          "Timeline ≤ 90 days",
        ],
        boxTitle: "Recommended Next Action",
        rows: [
          ["Primary", "Book 15‑min fit demo"],
          ["Secondary", "Share ROI + Security brief"],
          ["Capture", "Work email + use case"],
          ["Sync", "CRM + Slack alert"],
        ],
        cta: "Result: Higher demo acceptance",
      };
    return {
      title: "Outcome",
      subtitle: "Same pricing page. Different buyer. Different outcome.",
      chips: ["Fewer low‑fit demos", "Shorter cycles", "Higher conversion"],
      boxTitle: "Conversion Lift",
      rows: [
        ["Pricing conversion", "+18%"],
        ["Qualified demos", "+27%"],
        ["Low‑fit demos", "−22%"],
        ["Time-to-contact", "−31%"],
      ],
      cta: "Visibility: why buyers hesitate",
    };
  }, [step]);

  return (
    <Card className="overflow-hidden rounded-3xl border-zinc-200 shadow-sm">
      <CardHeader className="space-y-2 bg-white">
        <CardTitle className="flex items-center justify-between text-base font-semibold text-zinc-950">
          {content.title}
          <Badge variant="secondary" className="rounded-full">
            Agentlytics · Live
          </Badge>
        </CardTitle>
        <p className="text-sm text-zinc-600">{content.subtitle}</p>
        <div className="flex flex-wrap gap-2">
          {content.chips.map((c) => (
            <MiniPill key={c}>{c}</MiniPill>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 bg-white">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="text-sm font-semibold text-zinc-950">
            {content.boxTitle}
          </div>
          <div className="mt-3 space-y-2">
            {content.rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-600">{k}</span>
                <span className="text-xs font-medium text-zinc-900">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-zinc-800">
            {content.cta}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cx(
                "h-8 w-8 rounded-full border border-zinc-200 text-sm",
                step === 1
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700",
              )}
              onClick={() => setStep(1)}
              aria-label="Step 1"
            >
              1
            </button>
            <button
              type="button"
              className={cx(
                "h-8 w-8 rounded-full border border-zinc-200 text-sm",
                step === 2
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700",
              )}
              onClick={() => setStep(2)}
              aria-label="Step 2"
            >
              2
            </button>
            <button
              type="button"
              className={cx(
                "h-8 w-8 rounded-full border border-zinc-200 text-sm",
                step === 3
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-700",
              )}
              onClick={() => setStep(3)}
              aria-label="Step 3"
            >
              3
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-700">
            Suggested visitor prompt
          </div>
          <div className="mt-2 rounded-2xl bg-zinc-950 p-3 text-sm text-white">
            <span className="opacity-80">👋 </span>
            Noticed you’re comparing Enterprise pricing and security. Want a
            quick 15‑min fit demo tailored to compliance + scale?
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="hidden md:block">
          <div className="text-sm font-semibold text-zinc-950">
            Recover lost demos from pricing-page drop-off
          </div>
          <div className="text-xs text-zinc-600">
            No credit card · Works with your existing pricing page · Live in 10
            minutes
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
          <ScrollTo id="how-it-works">
            <span className="hidden sm:inline">
              See How Pricing Visitors Convert
            </span>
            <span className="sm:hidden">See how it works</span>
          </ScrollTo>
          <Button
            className="rounded-full px-5"
            style={{ backgroundColor: ACCENT, color: "white" }}
          >
            Book a Demo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPageDropOffUseCase() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-white text-zinc-950">
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-10 md:pt-14">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl"
              style={{ backgroundColor: ACCENT }}
            />
            <div>
              <div className="text-sm font-semibold">Agentlytics</div>
              <div className="text-xs text-zinc-600">Use Case</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              Pricing-page drop-off
            </Badge>
            <Badge variant="outline" className="rounded-full">
              SaaS · High intent
            </Badge>
          </div>
        </div>

        {/* HERO */}
        <section className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Recover Lost Demos from{" "}
              <span style={{ color: ACCENT }}>Pricing Page Drop‑Off</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-zinc-700">
              Your highest‑intent visitors are leaving your pricing page without
              booking a demo — not because they’re unqualified, but because no
              one helps them decide.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <MiniPill>Detect pricing hesitation</MiniPill>
              <MiniPill>Qualify silently</MiniPill>
              <MiniPill>Route the right next step</MiniPill>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                className="rounded-full px-6"
                style={{ backgroundColor: ACCENT, color: "white" }}
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                See How Pricing Visitors Convert
              </Button>
              <Button variant="outline" className="rounded-full px-6">
                Book a Demo
              </Button>
            </div>

            <div className="mt-4 text-sm text-zinc-600">
              No credit card · Works with your existing pricing page ·{" "}
              <span className="font-medium text-zinc-900">
                Live in 10 minutes
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Stat value="+18%" label="pricing conversion" />
              <Stat value="+27%" label="qualified demos" />
              <Stat value="−22%" label="low‑fit demos" />
            </div>
          </div>

          <div className="md:sticky md:top-10">
            <LiveQualificationSnapshot />
          </div>
        </section>

        <Separator className="my-12" />

        {/* SECTION 2 — Reframe */}
        <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Pricing Page Drop‑Off Is a Decision Failure — Not a Traffic
              Problem
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              Pricing visitors are already evaluating fit. When your site can’t
              guide the decision, intent disappears before it ever becomes a
              demo.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="rounded-3xl border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    What happens today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-700">
                  <div>• Static pricing tables</div>
                  <div>• Same CTA for every visitor</div>
                  <div>• Forms feel premature</div>
                  <div>• Low‑fit demos drain SDR time</div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-zinc-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    What buyers actually need
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-700">
                  <div>• Contextual guidance</div>
                  <div>• Confidence before commitment</div>
                  <div>• Silent qualification</div>
                  <div>• The right next step (not always a demo)</div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5">
              <div className="text-sm text-zinc-700">
                <span className="font-semibold text-zinc-950">
                  Buyers don’t leave pricing pages because they lack intent.
                </span>{" "}
                They leave because no one helps them decide.
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* SECTION 3 — Why tools fail */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            Why Traditional Conversion Tools Break at the Pricing Page
          </h2>
          <p className="mt-3 max-w-3xl text-sm text-zinc-600">
            Pricing is where hesitation forms: risk, complexity, and
            justification. A generic chatbot or a calendar link can’t resolve
            decision friction.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Why forms & calendar links fail
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-700">
                <div className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  <span>They ask for commitment before confidence exists.</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  <span>They ignore buyer context (role, risk, use case).</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  <span>They treat every visitor as equally sales-ready.</span>
                </div>
                <div className="flex gap-2">
                  <span className="mt-0.5">•</span>
                  <span>They create low-fit demos that waste SDR cycles.</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  What decision support looks like
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4"
                    style={{ color: ACCENT }}
                  />
                  <span>Guide the decision with context-aware prompts.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4"
                    style={{ color: ACCENT }}
                  />
                  <span>Qualify silently, without interrupting the buyer.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4"
                    style={{ color: ACCENT }}
                  />
                  <span>
                    Route to the right next action (demo, content, capture).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4"
                    style={{ color: ACCENT }}
                  />
                  <span>
                    Reveal what caused hesitation so teams can fix pricing
                    friction.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* SECTION 4 — How it works */}
        <section id="how-it-works">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                How Agentlytics Converts Pricing Hesitation into Qualified Demos
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-zinc-600">
                This isn’t a chatbot script. It’s a decision engine that
                recognizes hesitation and turns it into the right next step.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full">
                No forms forced
              </Badge>
              <Badge variant="outline" className="rounded-full">
                No interruption
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Right action
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="h-4 w-4" style={{ color: ACCENT }} /> Detect
                  pricing intent
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-700">
                Tracks time-on-pricing, plan comparisons, and scroll hesitation
                to identify evaluation intent.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />{" "}
                  Understand context
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-700">
                Infers role, company size, use-case signals, and timeline
                indicators—without a form.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4" style={{ color: ACCENT }} />{" "}
                  Qualify silently
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-700">
                Qualifies in the background. No forced chat, no interruption, no
                friction.
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ArrowRight className="h-4 w-4" style={{ color: ACCENT }} />{" "}
                  Route next action
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-700">
                Demo for sales-ready, content for mid-intent, and capture for
                qualified follow-up.
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-medium text-zinc-900">
              Same pricing page. Different buyer. Different outcome.
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        {/* SECTION 5 — Micro scenario */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            What This Looks Like in Practice
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="rounded-3xl border-zinc-200 shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Micro scenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-700">
                <p>
                  A VP Engineering spends 3 minutes comparing Enterprise pricing
                  and security requirements. Agentlytics detects evaluation
                  intent, qualifies silently, and offers a demo framed around
                  compliance and scale — not generic sales.
                </p>
                <div className="rounded-2xl bg-zinc-950 p-3 text-white">
                  <div className="text-xs opacity-80">Agentlytics prompt</div>
                  <div className="mt-1 text-sm">
                    Want a compliance‑ready demo tailored to your security +
                    scale requirements?
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Outcome</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-700">
                <div>• Higher demo acceptance</div>
                <div>• Better demo quality</div>
                <div>• Shorter sales cycles</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* SECTION 6 — Revenue value */}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            What Revenue Teams Gain
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Conversion & pipeline quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-700">
                <div>• Higher pricing-page conversion</div>
                <div>• Fewer low-fit demos</div>
                <div>• Higher show-up rates</div>
                <div>• Better attribution of intent</div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  Sales efficiency & insight
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-zinc-700">
                <div>• SDR focus on real buyers</div>
                <div>• Faster time-to-contact</div>
                <div>• Visibility into why buyers hesitate</div>
                <div>• Clear next-step routing (demo vs content)</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* SECTION 7 — Final CTA */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Turn Pricing Page Traffic into Qualified Demos
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">
            Stop losing your highest‑intent visitors at the decision moment.
            Detect hesitation, qualify silently, and route the right next step.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              className="rounded-full px-6"
              style={{ backgroundColor: ACCENT, color: "white" }}
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See How Pricing Visitors Are Qualified
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              Book a Demo
            </Button>
          </div>
          <div className="mt-4 text-sm text-zinc-600">
            No credit card · Works with your existing pricing page · Live in 10
            minutes
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 flex flex-col gap-2 text-xs text-zinc-500">
          <div>
            SEO slug:{" "}
            <span className="font-medium text-zinc-700">
              /use-cases/pricing-page-dropoff
            </span>
          </div>
          <div>
            Primary keyword:{" "}
            <span className="font-medium text-zinc-700">
              pricing page drop-off
            </span>{" "}
            · Secondary: pricing page conversion, SaaS pricing page
            optimization, demo conversion from pricing, high-intent SaaS
            visitors, pricing page lead qualification
          </div>
        </div>
      </div>

      <StickyCTA />
    </div>
  );
}
