import React from "react";

/**
 * Use Case Page: Improve Demo Quality (Not Demo Volume)
 * Theme: Calendly-like Blue (primary action = blue)
 * Notes:
 * - Tailwind-only styling
 * - Anchor-based primary CTA (scroll to How It Works)
 * - Secondary CTA (Watch a Demo)
 * - No "Start Free" CTA
 *
 * Compatibility:
 * - Uses plain <a> tags (no next/link) to avoid sandbox/runtime crashes.
 */

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function currentYearSafe() {
  try {
    return new Date().getFullYear();
  } catch {
    return 2026;
  }
}

const Page = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl border border-slate-200 bg-slate-50" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Agentlytics</div>
              <div className="text-xs text-slate-500">Use Cases</div>
            </div>
          </a>

          <nav
            className="hidden items-center gap-6 md:flex"
            aria-label="Primary"
          >
            <a
              href="#how-it-works"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              How it works
            </a>
            <a
              href="#revenue-impact"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Revenue impact
            </a>
            <a
              href="#proof"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Proof
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#how-it-works"
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 md:inline-flex"
            >
              See How Demo Quality Improves
            </a>
            <a
              href="/book-demo"
              className="inline-flex rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Watch a Demo
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Soft blue glows */}
          <div className="absolute -top-28 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
          <div className="absolute -bottom-32 right-10 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-12 md:px-6 md:py-20">
          {/* Left: Copy */}
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Mid → Late funnel (post-lead, pre-close)
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Improve Demo Quality — Not Demo Volume
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Your sales team isn’t struggling because of low demand. They’re
              struggling because too many demos are booked before qualification
              happens.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                See How Low-Fit Demos Are Filtered
              </a>
              <a
                href="/book-demo"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Watch a Demo
              </a>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard label="Focus" value="Sales-ready demos" accent="blue" />
              <StatCard
                label="Method"
                value="Silent qualification"
                accent="blue"
              />
              <StatCard
                label="Outcome"
                value="Higher demo-to-close"
                accent="blue"
              />
            </div>
          </div>

          {/* Right: Snapshot Panel */}
          <div className="md:col-span-5">
            <LiveQualificationSnapshot />
          </div>
        </div>
      </section>

      {/* SECTION 2 — Reframe */}
      <section className="border-t border-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                More Demos Don’t Fix Pipeline Quality
              </h2>
              <p className="mt-3 text-slate-600">
                Activity can look healthy while revenue stays flat. Demo volume
                is easy to inflate. Deal quality is harder to protect.
              </p>
            </div>

            <div className="md:col-span-7">
              <ul className="space-y-3">
                <ListItem accent="blue">
                  SDR calendars look full — revenue doesn’t.
                </ListItem>
                <ListItem accent="blue">
                  Low-fit demos inflate activity metrics.
                </ListItem>
                <ListItem accent="blue">
                  Reps spend time educating buyers who will never close.
                </ListItem>
                <ListItem accent="blue">
                  Qualification happens after the demo is booked — too late.
                </ListItem>
              </ul>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-blue-50 p-6">
                <p className="text-base font-semibold text-slate-900">
                  The problem isn’t demo volume.
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  The problem is who gets through to sales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Why traditional fails */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              Why SDR-Led Qualification Breaks at Scale
            </h2>
            <p className="mt-3 text-slate-600">
              When qualification is a manual step, it becomes inconsistent,
              late, and expensive.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <CompareCard
              title="What happens today"
              items={[
                "Demo booked first, questions later",
                "SDRs qualify manually on the call",
                "Sales learns deal-breakers too late",
                "High no-show & low close rates",
              ]}
            />
            <CompareCard
              title="What revenue teams actually need"
              items={[
                "Qualification before booking",
                "Clear sales-ready signals",
                "Automatic routing",
                "Confidence that demos are worth the time",
              ]}
              highlight
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — How it works */}
      <section
        id="how-it-works"
        className="border-t border-slate-100 bg-slate-50"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              How Agentlytics Filters Low-Fit Demos Before They Hit Your
              Calendar
            </h2>
            <p className="mt-3 text-slate-600">
              This is not “more questions.” It’s earlier signal — captured in
              the same moment intent forms.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <NarrativeStep
              step="01"
              title="Detect buying intent"
              bullets={[
                "Pricing behavior",
                "Feature comparison",
                "Return visits",
                "Timeline cues",
              ]}
              accent="blue"
            />
            <NarrativeStep
              step="02"
              title="Understand deal context"
              bullets={[
                "Role & authority",
                "Company size",
                "Use case",
                "Budget signals",
              ]}
              accent="blue"
            />
            <NarrativeStep
              step="03"
              title="Qualify silently"
              bullets={[
                "No forms",
                "No SDR involvement",
                "No friction for the buyer",
              ]}
              accent="blue"
            />
            <NarrativeStep
              step="04"
              title="Route intelligently"
              bullets={[
                "Sales-ready → demo",
                "Mid-intent → education",
                "Low-fit → nurtured or filtered",
              ]}
              accent="blue"
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-base font-semibold text-slate-900">
              Every demo on the calendar has already earned its place.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Micro scenario */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                What This Looks Like in Practice
              </h2>
              <p className="mt-3 text-slate-600">
                A single routing decision prevents a low-probability deal from
                consuming high-cost sales time.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-blue-50 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Scenario
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    Sales-led routing
                  </div>
                </div>

                <p className="mt-4 text-slate-700">
                  A Head of RevOps explores pricing and enterprise features but
                  has a 6-month timeline and limited budget.
                </p>

                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Agentlytics decision
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Detects intent, but routes them to a comparison guide
                    instead of booking a demo — keeping sales focused on
                    near-term buyers.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <OutcomePill label="Fewer wasted demos" accent="blue" />
                  <OutcomePill label="Higher show-up rates" accent="blue" />
                  <OutcomePill label="Better close ratios" accent="blue" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Revenue Impact */}
      <section
        id="revenue-impact"
        className="border-t border-slate-100 bg-white"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              What Sales Teams Gain
            </h2>
            <p className="mt-3 text-slate-600">
              Demo quality improves when routing aligns buyer intent with sales
              capacity.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-6">
              <BenefitCard
                title="Efficiency and focus"
                items={[
                  "Fewer low-fit conversations",
                  "Better rep morale",
                  "More time for near-term deals",
                ]}
                accent="blue"
              />
            </div>
            <div className="md:col-span-6">
              <BenefitCard
                title="Revenue discipline"
                items={[
                  "Higher demo-to-close rate",
                  "Cleaner pipeline forecasts",
                  "Visibility into why leads were filtered",
                ]}
                accent="blue"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Proof */}
      <section id="proof" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">
              The Difference Quality Makes
            </h2>
            <p className="mt-3 text-slate-600">
              A smaller number of qualified demos can outperform a larger number
              of unqualified conversations.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <BeforeAfterCard
              title="Before Agentlytics"
              metrics={[
                "80 demos/month",
                "Low fit, long cycles",
                "Burned SDRs",
              ]}
            />
            <BeforeAfterCard
              title="After Agentlytics"
              metrics={[
                "42 qualified demos",
                "Higher close rate",
                "Faster revenue velocity",
              ]}
              highlight
            />
          </div>
        </div>
      </section>

      {/* SECTION 8 — CTA */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6">
          <div className="rounded-3xl border border-blue-200 bg-blue-600 p-8 text-white shadow-sm md:p-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Book Fewer Demos. Close More Deals.
                </h2>
                <p className="mt-3 text-white/90">
                  See how silent qualification improves demo quality without
                  adding friction to the buyer journey.
                </p>
                <p className="mt-4 text-sm text-white/80">
                  No credit card · Works with your existing booking flow · Live
                  in minutes
                </p>
              </div>
              <div className="md:col-span-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-white/90"
                  >
                    See How Demo Quality Improves
                  </a>
                  <a
                    href="/book-demo"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/15"
                  >
                    Watch a Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
          <div>© {currentYearSafe()} Agentlytics</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/use-cases" className="hover:text-slate-700">
              Use cases
            </a>
            <a href="/pricing" className="hover:text-slate-700">
              Pricing
            </a>
            <a href="/privacy" className="hover:text-slate-700">
              Privacy
            </a>
            <a href="/security" className="hover:text-slate-700">
              Security
            </a>
          </div>
        </div>
      </footer>

      {/* Inline tests (only run in test envs) */}
      {process.env.NODE_ENV === "test" ? <InlineTests /> : null}
    </main>
  );
};

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "blue";
}) {
  const dot = accent === "blue" ? "bg-blue-600" : "bg-slate-900";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={cx("h-1.5 w-1.5 rounded-full", dot)} />
        <div className="text-xs font-medium text-slate-500">{label}</div>
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ListItem({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: "blue";
}) {
  const bullet = accent === "blue" ? "bg-blue-600" : "bg-slate-900";
  return (
    <li className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={cx("mt-1 h-2 w-2 flex-none rounded-full", bullet)} />
      <span className="text-sm text-slate-700">{children}</span>
    </li>
  );
}

function CompareCard({
  title,
  items,
  highlight,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-3xl border p-6 shadow-sm",
        highlight
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-900",
      )}
    >
      <div
        className={cx(
          "text-sm font-semibold",
          highlight ? "text-white" : "text-slate-900",
        )}
      >
        {title}
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((x) => (
          <li key={x} className="flex gap-3">
            <span
              className={cx(
                "mt-1.5 h-2 w-2 flex-none rounded-full",
                highlight ? "bg-white" : "bg-blue-600",
              )}
            />
            <span
              className={cx(
                "text-sm",
                highlight ? "text-white/90" : "text-slate-700",
              )}
            >
              {x}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NarrativeStep({
  step,
  title,
  bullets,
  accent,
}: {
  step: string;
  title: string;
  bullets: string[];
  accent?: "blue";
}) {
  const dot = accent === "blue" ? "bg-blue-600" : "bg-slate-900";
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500">STEP {step}</div>
        <div className="text-xs font-medium text-slate-500">Narrative flow</div>
      </div>
      <div className="mt-3 text-lg font-semibold text-slate-900">{title}</div>
      <ul className="mt-4 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3">
            <span
              className={cx("mt-2 h-1.5 w-1.5 flex-none rounded-full", dot)}
            />
            <span className="text-sm text-slate-700">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OutcomePill({ label, accent }: { label: string; accent?: "blue" }) {
  const border = accent === "blue" ? "border-blue-200" : "border-slate-200";
  const text = accent === "blue" ? "text-blue-700" : "text-slate-900";
  return (
    <div
      className={cx(
        "rounded-2xl border bg-white px-4 py-3 text-center text-sm font-semibold",
        border,
        text,
      )}
    >
      {label}
    </div>
  );
}

function BenefitCard({
  title,
  items,
}: {
  title: string;
  items: string[];
  accent?: "blue";
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <ul className="mt-4 space-y-3">
        {items.map((x) => (
          <li key={x} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-blue-600" />
            <span className="text-sm text-slate-700">{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BeforeAfterCard({
  title,
  metrics,
  highlight,
}: {
  title: string;
  metrics: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-3xl border p-6 shadow-sm",
        highlight
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-900",
      )}
    >
      <div
        className={cx(
          "text-sm font-semibold",
          highlight ? "text-white" : "text-slate-900",
        )}
      >
        {title}
      </div>
      <div className="mt-6 space-y-3">
        {metrics.map((m) => (
          <div
            key={m}
            className={cx(
              "rounded-2xl border px-4 py-3 text-sm font-semibold",
              highlight
                ? "border-white/30 bg-white/10 text-white"
                : "border-slate-200 bg-slate-50 text-slate-900",
            )}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveQualificationSnapshot() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Live Qualification Snapshot
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Low-fit filtered out → sales-ready routed
          </div>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Real-time
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SnapshotRow
          title="Lead A"
          subtitle="Pricing dwell · Enterprise page"
          leftBadge="Mid-intent"
          rightBadge="Routed to guide"
        />
        <SnapshotRow
          title="Lead B"
          subtitle="Comparison loops · Return visit"
          leftBadge="Sales-ready"
          rightBadge="Demo booked"
          highlight
        />
        <SnapshotRow
          title="Lead C"
          subtitle="Student plan · Small team"
          leftBadge="Low-fit"
          rightBadge="Filtered / nurtured"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="text-xs font-semibold text-slate-500">What changes</div>
        <div className="mt-2 text-sm font-semibold text-slate-900">
          Demos become a scarce resource — protected by signal.
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <a
          href="#how-it-works"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          See How It Works
        </a>
        <a
          href="/book-demo"
          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Watch a Demo
        </a>
      </div>
    </div>
  );
}

function SnapshotRow({
  title,
  subtitle,
  leftBadge,
  rightBadge,
  highlight,
}: {
  title: string;
  subtitle: string;
  leftBadge: string;
  rightBadge: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-2xl border p-4",
        highlight
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-900",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div
            className={cx(
              "text-sm font-semibold",
              highlight ? "text-white" : "text-slate-900",
            )}
          >
            {title}
          </div>
          <div
            className={cx(
              "mt-1 text-xs",
              highlight ? "text-white/85" : "text-slate-500",
            )}
          >
            {subtitle}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              highlight
                ? "bg-white/15 text-white"
                : "border border-blue-200 bg-blue-50 text-blue-700",
            )}
          >
            {leftBadge}
          </span>
          <span
            className={cx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              highlight ? "bg-white text-blue-700" : "bg-blue-600 text-white",
            )}
          >
            {rightBadge}
          </span>
        </div>
      </div>
    </div>
  );
}

function InlineTests() {
  const assert = (condition: unknown, message: string) => {
    if (!condition) throw new Error(message);
  };

  // cx
  assert(cx("a", "b") === "a b", "cx should join class names");
  assert(
    cx("a", false, null, undefined, "b") === "a b",
    "cx should ignore falsy values",
  );
  assert(cx() === "", "cx should return empty string when no inputs");

  // year
  const y = currentYearSafe();
  assert(
    typeof y === "number" && y > 2000,
    "currentYearSafe should return a plausible year",
  );

  return null;
}

export default Page;
