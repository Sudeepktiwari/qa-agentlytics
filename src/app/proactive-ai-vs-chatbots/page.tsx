"use client";
import React, { useState } from "react";
import DemoVideoModal from "../components/DemoVideoModal";

/**
 * Page: Why Reactive Chat Widgets Lose SaaS Leads — and Proactive AI Agents Don’t
 * Theme: Calendly-like blue (clean, spacious, high-contrast, subtle borders)
 * Requested changes:
 * - Top header contains video; hero copy starts BELOW video (so next section shifts down).
 * - Make page feel like a polished marketing page (not a doc): stronger layout, section styling, visuals.
 * - Highlight the section where the proactive AI agent starts.
 * - Remove Calendly positioning (we're comparing their reactive bot vs proactive agent; no need to explain Calendly).
 */

type ReactNode = React.ReactNode;

type ClassValue = string | false | null | undefined;
export function classNames(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Minimal self-tests (run only in test env) ---
function runSelfTests() {
  const t1 = classNames("a", false, null, undefined, "b");
  if (t1 !== "a b")
    throw new Error(`classNames test failed: expected "a b", got "${t1}"`);

  const t2 = classNames("", "x", "y");
  if (t2 !== "x y")
    throw new Error(`classNames test failed: expected "x y", got "${t2}"`);

  const t3 = classNames(undefined, null, false);
  if (t3 !== "")
    throw new Error(`classNames test failed: expected "", got "${t3}"`);
}

if (typeof window === "undefined" && process.env.NODE_ENV === "test") {
  runSelfTests();
}

const Container = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
    {children}
  </div>
);

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
    {children}
  </span>
);

const Divider = () => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
  </div>
);

const Button = ({
  children,
  href,
  variant = "primary",
  onClick,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  onClick?: (e: React.MouseEvent) => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className={classNames(
      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
      variant === "primary"
        ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
        : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
    )}
  >
    {children}
  </a>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
    <div className="text-xs font-medium text-slate-500">{label}</div>
    <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
  </div>
);

const Card = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-3">
      {icon ? (
        <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div className="mt-2 text-sm leading-6 text-slate-700">{children}</div>
      </div>
    </div>
  </div>
);

const Step = ({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
        {n}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <div className="mt-2 text-sm leading-6 text-slate-700">{children}</div>
      </div>
    </div>
  </div>
);

const ComparisonTable = () => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
      <div className="p-4">Reactive Chat Widget</div>
      <div className="p-4">Proactive AI Agent (Agentlytics)</div>
    </div>

    {[
      ["Waits for typing", "Acts on behavior"],
      ["Misses silent intent", "Detects hesitation"],
      ["No proactive message", "Timed engagement"],
      ["No lead captured", "Lead captured automatically"],
      ["No qualification", "BANT qualification in real time"],
      ["Lost demo", "Demo booked"],
    ].map(([l, r], idx) => (
      <div
        key={idx}
        className={classNames(
          "grid grid-cols-2",
          idx !== 5 ? "border-b border-slate-200" : "",
        )}
      >
        <div className="p-4 text-sm text-slate-700">{l}</div>
        <div className="p-4 text-sm text-slate-700">{r}</div>
      </div>
    ))}
  </div>
);

const VideoHeader = () => (
  <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-blue-50/70 via-white to-white">
    <Container>
      <div className="py-8 sm:py-10">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">
              Agentlytics
            </div>
          </a>

          <div className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <a href="#comparison" className="hover:text-slate-900">
              Side-by-side
            </a>
            <a href="#agent" className="hover:text-slate-900">
              Proactive agent
            </a>
            <a href="#cta" className="hover:text-slate-900">
              See it live
            </a>
          </div>
        </div>

        {/* Video container (replace contents with embed) */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-white">
            <iframe
              className="h-full w-full"
              src="https://www.youtube-nocookie.com/embed/CBcpBr-0XsI?si=8be1c_-iVjnobqqh&loop=1&playlist=CBcpBr-0XsI&rel=0&controls=0&modestbranding=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </Container>

    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
    <div className="pointer-events-none absolute -left-16 -bottom-20 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl" />
  </div>
);

export default function ReactiveChatVsProactiveAgentPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <DemoVideoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
      {/* Video header */}
      <VideoHeader />

      {/* HERO (starts after video) */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2">
                <Chip>Conversion-assist explainer</Chip>
                <Chip>Reactive vs proactive</Chip>
                <Chip>Strategic restraint</Chip>
              </div>

              <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Why Reactive Chat Widgets Lose SaaS Leads — and Proactive AI
                Agents Don’t
              </h1>

              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-700 sm:text-lg">
                High-intent visitors don’t disappear because your product isn’t
                good.
                <br />
                They disappear because{" "}
                <span className="font-semibold text-slate-900">
                  nothing reacts while they’re deciding
                </span>
                .
              </p>

              <p className="mt-4 max-w-2xl text-pretty text-sm leading-6 text-slate-600">
                This page shows — clearly and factually — what happens when a{" "}
                <span className="font-semibold text-slate-900">
                  reactive chat widget
                </span>{" "}
                is used, and how the outcome changes when a{" "}
                <span className="font-semibold text-slate-900">
                  proactive AI agent
                </span>{" "}
                operates instead.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button href="#agent">Jump to proactive AI agent</Button>
                <Button variant="secondary" href="#comparison">
                  View side-by-side
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  What this page is (and isn’t)
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• A visual + written explainer to support the video</li>
                  <li>• A precise comparison of system behavior</li>
                  <li>• Not a feature dump or over-promotional landing page</li>
                </ul>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <Stat label="Intent" value="Mostly silent" />
                  <Stat label="Problem" value="No action" />
                  <Stat label="Fix" value="Decision timing" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* Reactive behavior */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="sticky top-6">
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  What Reactive Chat Widgets Actually Do
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-base">
                  Reactive chat widgets are designed for{" "}
                  <span className="font-semibold text-slate-900">
                    explicit interaction
                  </span>
                  .
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  If the visitor doesn’t type, click, or submit — the system
                  stays idle.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card
                  title="They respond only when…"
                  icon={<span className="text-lg">⌨️</span>}
                >
                  <ul className="list-disc space-y-2 pl-5">
                    <li>A visitor types a question</li>
                    <li>A help prompt is clicked</li>
                    <li>A message is submitted</li>
                  </ul>
                </Card>

                <Card
                  title="If none of that happens…"
                  icon={<span className="text-lg">🕳️</span>}
                >
                  <p>
                    The system remains idle.
                    <span className="mt-3 block font-semibold text-slate-900">
                      No message. No engagement. No lead.
                    </span>
                  </p>
                  <p className="mt-2">
                    The visitor leaves — without ever entering your funnel.
                  </p>
                </Card>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Why intent is missed (even with strong traffic)
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold text-slate-900">
                      Silent intent looks like…
                    </div>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                      <li>Pricing page dwell time</li>
                      <li>Repeated plan comparisons</li>
                      <li>Back-and-forth navigation</li>
                      <li>Exit hesitation</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold text-slate-900">
                      Reactive systems do…
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      They wait for a question that rarely comes. By the time
                      intent becomes explicit, it’s usually already gone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* Highlighted proactive section */}
      <section id="agent" className="relative py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
        <Container>
          <div className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">
            <div className="flex flex-col gap-8 p-6 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    Highlighted section
                  </div>
                  <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    The Shift: From Waiting for Input to Acting on Signals
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
                    Agentlytics does not wait for a visitor to initiate a
                    conversation. It continuously evaluates
                    <span className="font-semibold text-slate-900">
                      {" "}
                      decision-stage behavior
                    </span>{" "}
                    and intervenes
                    <span className="font-semibold text-slate-900">
                      {" "}
                      before intent degrades
                    </span>
                    .
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Engagement is triggered by measured behavioral thresholds,
                    not prompts or guesswork.
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    <span className="font-medium text-slate-900">
                      Unlike reactive chat widgets that wait for user input,
                      proactive AI agents initiate engagement based on real-time
                      behavioral intent.
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button href="#cta">See it live</Button>
                  <Button variant="secondary" href="#comparison">
                    Compare outcomes
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Step n={1} title="Intent signals are detected automatically">
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Time spent on pricing</li>
                    <li>Repeated comparison paths</li>
                    <li>Hesitation loops</li>
                    <li>Exit movement</li>
                  </ul>
                  <p className="mt-2">
                    No forms. No visible tracking friction.
                  </p>
                </Step>

                <Step n={2} title="Engagement is triggered at the right moment">
                  <p>
                    Agentlytics engages only when
                    <span className="font-semibold text-slate-900">
                      {" "}
                      intent crosses a defined threshold
                    </span>
                    .
                  </p>
                  <p className="mt-2">
                    The interaction begins
                    <span className="font-semibold text-slate-900">
                      {" "}
                      before the visitor exits
                    </span>
                    , not after.
                  </p>
                </Step>

                <Step n={3} title="Lead capture happens inline">
                  <p>
                    When engagement starts, lead context is captured
                    automatically and session history is preserved.
                  </p>
                  <p className="mt-2">
                    The interaction itself functions as the capture layer.
                  </p>
                </Step>

                <Step n={4} title="Qualification runs in real time (BANT)">
                  <p>Leads are qualified during the interaction across:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li>
                      <span className="font-semibold text-slate-900">Need</span>
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">
                        Authority
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">
                        Timeline
                      </span>
                    </li>
                    <li>
                      <span className="font-semibold text-slate-900">
                        Budget confidence
                      </span>
                    </li>
                  </ul>
                  <p className="mt-2">
                    No manual scoring. No SDR interpretation.
                  </p>
                </Step>

                <Step n={5} title="Sales-level guidance is activated">
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Relevant features are surfaced</li>
                    <li>Objections are addressed</li>
                    <li>Plan alignment is clarified</li>
                  </ul>
                  <p className="mt-2">
                    All actions occur within the same flow.
                  </p>
                </Step>

                <Step n={6} title="The visitor schedules a demo or sales call">
                  <p>
                    Once qualification and guidance are complete, the visitor is
                    directed to schedule a demo or speak with sales based on
                    readiness and fit.
                  </p>
                  <p className="mt-2">
                    Scheduling occurs at the decision moment — not as a separate
                    follow-up step.
                  </p>
                </Step>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm lg:col-span-2">
                  <div className="text-sm font-semibold text-slate-900">
                    Outcome
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                    Same website. Same visitor. Different system behavior.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The only variable is
                    <span className="font-semibold text-slate-900">
                      {" "}
                      when the system decides to act
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-blue-200/35 blur-3xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl" />
          </div>
        </Container>
      </section>

      <Divider />

      {/* Comparison */}
      <section id="comparison" className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Side-by-Side Reality
            </h2>
          </div>

          <div className="mt-8">
            <ComparisonTable />
          </div>
        </Container>
      </section>

      <Divider />

      {/* Revenue section */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Why This Matters for Revenue
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-base">
                Most lost demos are not rejected. They simply{" "}
                <span className="font-semibold text-slate-900">
                  never happen
                </span>
                .
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                They disappear between engagement and action, evaluation and
                commitment, interest and booking.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card
                  title="Where the leak happens"
                  icon={<span className="text-lg">🧩</span>}
                >
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Engagement → action</li>
                    <li>Evaluation → commitment</li>
                    <li>Interest → booking</li>
                  </ul>
                </Card>
                <Card
                  title="What Agentlytics closes"
                  icon={<span className="text-lg">🔒</span>}
                >
                  <p>
                    The decision gap is addressed through behavioral signal
                    detection and time-based engagement triggers.
                  </p>
                  <p className="mt-2">
                    This process enables qualified engagement before the visitor
                    exits.
                  </p>
                </Card>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Built for teams who already have traffic
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700 sm:text-base">
                  Agentlytics is designed for revenue teams who already have
                  visitors, already have interest, and want{" "}
                  <span className="font-semibold text-slate-900">
                    better demos — not more leads
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Divider />

      {/* Soft CTA */}
      <section id="cta" className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="rounded-[28px] border border-blue-100 bg-blue-50 p-6 shadow-sm sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Soft CTA
                  </div>
                  <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    See How This Works on a Live Website
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-700 sm:text-base">
                    Explore how proactive intent detection changes demo outcomes
                    — without changing your traffic or funnel.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button href="/how-it-works">See how it works</Button>
                  <Button
                    variant="secondary"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDemoModalOpen(true);
                    }}
                  >
                    Watch a demo
                  </Button>
                </div>
              </div>

              <p className="mt-6 text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  Footer Disclaimer:
                </span>{" "}
                Illustrative example. No affiliation with any third-party brand.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
                A
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Advancelytics
                </div>
                <div className="text-xs text-slate-500">
                  Proactive AI agent for decision-stage capture
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <a
                className="text-slate-600 hover:text-slate-900"
                href="/privacy"
              >
                Privacy
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="/terms">
                Terms
              </a>
              <a
                className="text-slate-600 hover:text-slate-900"
                href="/contact"
              >
                Contact
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
