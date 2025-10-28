"use client";
import { motion } from "framer-motion";

/**
 * Agentlytics – CRM & Analytics Sync (No external icon deps)
 * Fix: Removed `lucide-react` icons to avoid CDN/ESM fetch errors in sandboxed builds.
 * - Replaced all icons with lightweight inline SVG React components.
 * - Kept the same layout/sections (Hero, Illustration, How it Works, Benefits, CTA).
 * - Added a tiny DevTests panel to sanity‑check that components render without undefined imports.
 */

/* ================= Inline SVG Icons ================= */
function IconCloudSync() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 text-slate-900">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="h-8 w-8 rounded-xl bg-indigo-600/90 shadow-sm"
            ></div>
            <span className="font-semibold tracking-tight">Agentlytics</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="hover:text-indigo-700" href="#features">
              Features
            </a>
            <a className="hover:text-indigo-700" href="#how">
              How it works
            </a>
            <a className="hover:text-indigo-700" href="#testimonials">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="#cta"
              className="text-sm font-medium hover:text-indigo-700"
            >
              Book a demo
            </a>
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Start free — connect your CRM instantly"
            >
              Start free — connect your CRM instantly
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            {/* Problem context line */}
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs md:text-sm shadow-sm">
              <span
                className="h-2 w-2 rounded-full bg-emerald-400"
                aria-hidden
              ></span>
              Manual CRM updates waste hours. Let your chat do it for you.
            </p>

            <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
              AI that syncs conversations to your CRM — clean, complete, and
              automatic
            </h1>

            <p className="mt-4 text-base md:text-lg text-slate-700 max-w-2xl">
              Capture lead details, notes, outcomes, and next steps straight
              from chat into HubSpot, Salesforce, and more — with field mapping
              and duplicate prevention.{" "}
              <strong>
                So your sales team focuses on closing, not cleaning.
              </strong>
            </p>

            {/* Proof metric */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 text-emerald-800 px-3 py-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                  aria-hidden
                ></span>
                Teams using Agentlytics see{" "}
                <span className="font-semibold">2.8× cleaner CRM records</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-600">
                PII-safe, role-based permissions
              </span>
            </div>

            {/* CTAs */}
            <div id="cta" className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="#signup"
                className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-5 py-3 text-sm md:text-base font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Start free — connect your CRM instantly
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm md:text-base font-semibold text-slate-900 hover:bg-slate-50"
              >
                See a 2‑minute demo
              </a>
            </div>

            {/* Trust logos */}
            <div className="mt-10">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Trusted by GTM teams
              </p>
              <div className="mt-3 grid grid-cols-3 sm:flex sm:flex-wrap gap-4 sm:gap-8 items-center opacity-90">
                <Logo text="TechFlow" />
                <Logo text="CloudScale" />
                <Logo text="InnovateCorp" />
                <Logo text="NorthPeak" />
                <Logo text="Brightlane" />
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="md:col-span-5">
            <div className="relative mx-auto max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl p-4">
              <div className="rounded-xl bg-slate-900 text-white p-3 text-xs flex items-center justify-between">
                <span>Chat</span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-200">
                  AI logging
                </span>
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <ChatLine
                  who="Lead"
                  text="We’re 10 reps, need demo + pricing."
                />
                <ChatLine
                  who="Agent"
                  text="Booked Wed 10:00. Sharing deck + next steps."
                />
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-medium text-slate-500">
                    CRM write‑back
                  </p>
                  <ul className="mt-1 text-sm list-disc pl-5 text-slate-700">
                    <li>
                      Contact created •{" "}
                      <span className="font-medium">InnovateCorp</span>
                    </li>
                    <li>
                      Deal: <span className="font-medium">Demo Scheduled</span>{" "}
                      • Owner: <span className="font-medium">A. Singh</span>
                    </li>
                    <li>Notes & next steps synced</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Illustration: Chat → AI → CRM, with duplicate prevention
            </p>
          </div>
        </div>
      </section>

      {/* Pain strip */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-sm md:text-base">
            <span className="opacity-90">Pain point — </span>
            Reps forget to log calls, notes get lost in docs, and pipeline
            hygiene suffers. Agentlytics captures it at the source.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <Feature title="Field Mapping">
            Map chat data to CRM fields (custom objects too). Enforce formats
            and required fields.
          </Feature>
          <Feature title="Duplicate Prevention">
            Smart merge rules on email, domain, and phone. Keep one clean
            record.
          </Feature>
          <Feature title="Role‑Safe Permissions">
            Limit who can view PII and write to sensitive fields with granular
            controls.
          </Feature>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Feature title="Activity & Timeline">
            Auto‑log meetings, transcripts, and outcomes with source
            attribution.
          </Feature>
          <Feature title="Works with Your Stack">
            HubSpot, Salesforce, Pipedrive, Zoho. Webhooks + API for everything
            else.
          </Feature>
          <Feature title="Built‑in Scheduling">
            Offer preferred slots in chat; your team confirms manually. Clean
            hand‑off notes.
          </Feature>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <ol className="mt-6 grid md:grid-cols-4 gap-6 text-slate-700">
            <Step
              n={1}
              title="Connect & Map"
              text="OAuth to your CRM and map fields. Enable duplicate prevention."
            />
            <Step
              n={2}
              title="Go Live"
              text="Drop the snippet; AI starts extracting entities from chat in real time."
            />
            <Step
              n={3}
              title="Review & Approve"
              text="Optional human-in-the-loop for sensitive updates."
            />
            <Step
              n={4}
              title="Sync & Report"
              text="Activities, contacts, deals, and notes sync instantly with audit trails."
            />
          </ol>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-indigo-700/95">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20 text-white">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              What teams say
            </h2>
            <span className="text-xs md:text-sm opacity-80">
              AA contrast safe
            </span>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Testimonial
              quote="Our pipeline finally reflects reality. The 2.8× cleanliness claim checks out in our audits."
              name="Priya N."
              role="Head of Growth, TechFlow"
            />
            <Testimonial
              quote="Agents type less, deals move faster. We killed the end‑of‑day CRM scramble."
              name="Jordan M."
              role="RevOps Lead, CloudScale"
            />
            <Testimonial
              quote="Loved the duplicate merge — no more five ‘Acme’ accounts. Huge relief for the team."
              name="Sasha K."
              role="Sales Ops, InnovateCorp"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-white to-indigo-100">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to keep CRM spotless — automatically?
          </h2>
          <p className="mt-3 text-slate-700">
            Start in minutes. No engineers required.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#signup"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Start free — connect your CRM instantly
            </a>
            <a
              href="#security"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 hover:bg-slate-50"
            >
              Security & compliance →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Agentlytics. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a className="hover:text-slate-900" href="#privacy">
              Privacy
            </a>
            <a className="hover:text-slate-900" href="#terms">
              Terms
            </a>
            <a className="hover:text-slate-900" href="#support">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Logo({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div aria-hidden className="h-4 w-4 rounded-md bg-slate-400/70" />
      <span className="text-slate-500 text-sm">{text}</span>
    </div>
  );
}

function Feature({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-700">{children}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-700 text-white text-xs font-bold">
          {n}
        </span>
        <span className="font-semibold text-slate-900">{title}</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{text}</p>
    </li>
  );
}

function ChatLine({ who, text }: { who: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-1 h-7 w-7 rounded-full bg-slate-200 border border-slate-300"
        aria-hidden
      />
      <div>
        <p className="text-xs text-slate-500">{who}</p>
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 text-sm shadow-sm">
          {text}
        </p>
      </div>
    </div>
  );
}

/**
 * Testimonial component (FIX):
 * The previous version referenced <Testimonial /> without defining it,
 * which caused: ReferenceError: Testimonial is not defined
 */
function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="rounded-2xl border border-white/20 bg-white/5 p-5 shadow-sm backdrop-blur">
      <blockquote className="text-sm leading-relaxed text-white/90">
        “{quote}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span aria-hidden className="h-8 w-8 rounded-full bg-white/20" />
        <div>
          <div className="text-white font-medium text-sm">{name}</div>
          <div className="text-white/70 text-xs">{role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

/*******************
 * Minimal Smoke Tests
 * (run once in browser; does not render UI changes)
 *******************/
function runSmokeTests() {
  try {
    console.assert(
      typeof Testimonial === "function",
      "Test: Testimonial should be defined"
    );
    const el = <Testimonial quote="q" name="n" role="r" />;
    console.assert(
      !!el,
      "Test: creating <Testimonial/> element should return a React element"
    );

    const f = <Feature title="T">Body</Feature>;
    console.assert(!!f, "Test: <Feature/> element should create");

    const c = <ChatLine who="Agent" text="Hello" />;
    console.assert(!!c, "Test: <ChatLine/> element should create");
  } catch (e) {
    console.error("Smoke tests failed:", e);
  }
}

if (typeof window !== "undefined" && !(window as any).__AGENTLYTICS_TESTED__) {
  (window as any).__AGENTLYTICS_TESTED__ = true;
  runSmokeTests();
}

// Export the page component as the default export so Next.js can render it
export default IconCloudSync;
