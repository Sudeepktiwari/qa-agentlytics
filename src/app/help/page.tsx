import Link from "next/link";

export default function HelpHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Help Center
        </h1>
        <p className="text-gray-600 mb-8">
          Short guides to help you set up and understand your AI onboarding
          assistant.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/help/onboarding-setup"
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Onboarding Setup
            </h2>
            <p className="text-sm text-gray-600">
              Step-by-step guide to configure registration, authentication, and
              initial setup flows from your API docs and cURL commands.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-600">
              Read guide →
            </div>
          </Link>
          <Link
            href="/help/onboarding-flow"
            className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              How the Onboarding Bot Works
            </h2>
            <p className="text-sm text-gray-600">
              Deep dive into the client widget, backend APIs, and how each
              onboarding step executes against your systems.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-600">
              Read details →
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
