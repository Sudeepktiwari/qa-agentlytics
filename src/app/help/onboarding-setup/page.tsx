export default function OnboardingSetupHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Onboarding Setup Guide
        </h1>
        <p className="text-gray-600 mb-8">
          This guide explains how to configure the onboarding-only assistant
          using your API documentation and cURL commands.
        </p>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. Enable Onboarding in the Admin Panel
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              1. Go to your admin dashboard at{" "}
              <span className="font-mono">/admin</span>.
            </p>
            <p>
              2. Open the{" "}
              <span className="font-semibold">Onboarding Settings</span>{" "}
              section.
            </p>
            <p>
              3. Turn on the <span className="font-semibold">Enabled</span>{" "}
              toggle to activate the onboarding flow for your account.
            </p>
          </div>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. Provide Documentation for Auto-Derived Specs
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            The platform can derive registration, authentication, and initial
            setup specs from your API docs. In the Onboarding Settings section
            you see three doc inputs:
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>
              <span className="font-semibold">Registration docs URL/file</span>{" "}
              for creating a user or account.
            </li>
            <li>
              <span className="font-semibold">Authentication docs URL/file</span>{" "}
              for logging in and obtaining a token or API key.
            </li>
            <li>
              <span className="font-semibold">Initial setup docs URL/file</span>{" "}
              for configuration endpoint or endpoints after registration.
            </li>
          </ul>
          <p className="text-sm text-gray-700 mt-3">
            For each area, you can paste a docs URL or upload a file. The
            system indexes those docs, extracts field names and headers, and
            builds a canonical request spec internally.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. Generate or Paste cURL Commands
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            Under Registration, Authentication, and Initial Setup you can either
            paste your own cURL command for each endpoint or use the Index Docs
            and Generate cURL buttons to have the system draft a canonical cURL
            from your docs.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            Internally, these cURL commands are parsed by the onboarding
            service to extract endpoint URL, method, headers, content type, and
            body keys. These specs drive calls in the registration,
            authentication, and initial setup functions in the onboarding
            service.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            4. Configure Initial Setup Fields
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            The bot prompts users for initial setup values after registration,
            such as workspace name, project ID, or keys.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            In the Onboarding Settings UI, Initial Fields and Initial Header
            Fields define what your external API expects. These map directly to
            the fields shown to the user in the onboarding widget and the
            payload assembled before calling your API.
          </p>
          <p className="text-sm text-gray-700">
            You can also mark fields as coming from the auth token or API key,
            so they are injected automatically instead of being asked again.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            5. Add Additional Steps
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            Additional steps let you chain post-setup actions such as creating a
            default workspace, configuring webhooks, or importing seed data.
          </p>
          <p className="text-sm text-gray-700">
            Each additional step has a name, optional fields to collect from the
            user, and either an endpoint with method or a step-specific cURL
            command. The widget uses these definitions to collect data and the
            onboarding service executes the call with your stored auth token or
            API key.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            6. Embed the Onboarding Widget
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            To use the onboarding-only assistant on any external page, embed the
            dedicated onboarding widget script.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100 mb-3">
            {`<script
  src="https://YOUR-DOMAIN.com/api/widget/onboarding"
  data-api-key="ak_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  data-chat-title="Onboarding Assistant"
  data-theme="green"
  data-size="large"
  data-position="bottom-right"
></script>`}
          </pre>
          <p className="text-xs text-gray-500 mb-2">
            Replace YOUR-DOMAIN.com and data-api-key with your deployment domain
            and admin API key.
          </p>
          <p className="text-sm text-gray-700">
            For internal testing, you can also visit the onboarding test page at
            the onboarding route, paste your API key, and load the widget from
            inside the product.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            7. Save and Test
          </h2>
          <p className="text-sm text-gray-700 mb-2">
            After configuring everything in the Onboarding Settings section:
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>Save your changes.</li>
            <li>
              Open your onboarding test page or embedded page and walk through
              the flow end to end.
            </li>
            <li>
              Check your external system to verify that registration, initial
              setup, and additional steps behave as expected.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
