export default function OnboardingFlowHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          How the Onboarding Bot Works
        </h1>
        <p className="text-gray-600 mb-8">
          This document explains the flow of the onboarding-only assistant from
          the front-end widget to the backend services and your external APIs.
        </p>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. High-Level Architecture
          </h2>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>
              Onboarding widget script served by the onboarding widget route. It
              renders a modal chat UI and drives the conversation.
            </li>
            <li>
              Onboarding chat API receives actions from the widget and routes
              them to the service layer.
            </li>
            <li>
              Onboarding service parses cURL commands, builds HTTP requests,
              injects authentication, and calls external APIs.
            </li>
            <li>
              Admin configuration and docs-to-cURL logic prepare the
              registration, authentication, and initial setup specs.
            </li>
          </ul>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. Client-Side State and Flow
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            The onboarding widget is a script that manages state in local
            storage and an in-memory object.
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>Step field holding the current phase of the flow.</li>
            <li>Registration fields for name, email, and password.</li>
            <li>
              Authentication token or API key returned from the auth endpoint.
            </li>
            <li>Initial setup field values collected from the user.</li>
            <li>
              Additional step definitions and per-step data collected during the
              flow.
            </li>
          </ul>
          <p className="text-sm text-gray-700 mt-3">
            The UI combines a message area, action buttons, and an input bar for
            free-text replies during collection phases.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. Registration Phase
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            When the widget launches, it starts with a registration card that
            collects name, email, and password through inputs or free text.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            On submit, the client sends a registration action with payload to
            the onboarding chat API. The backend calls the registration
            function, which parses the registration cURL command, builds the
            request, and calls the external registration API.
          </p>
          <p className="text-sm text-gray-700">
            If authentication is configured, the onboarding service also calls
            the authentication function to log in and extract a token or API
            key, which is returned to the widget for later steps.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            4. Initial Setup Phase
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            After registration, the widget renders an initial setup flow driven
            by the initial field definitions from the backend.
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>It pre-populates obvious values such as name and email.</li>
            <li>
              It asks for each missing field in sequence and saves the answers.
            </li>
          </ul>
          <p className="text-sm text-gray-700 mt-3">
            Once all fields are collected, the widget shows a summary and asks
            the user to confirm or edit. On confirm, the client posts an initial
            setup action. The onboarding service applies defaults and mappings,
            injects authentication, sends the request to the configured initial
            setup endpoint, and persists session data along with optional lead
            information.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            5. Additional Steps
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            Additional steps let you chain API calls after initial setup.
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>
              The widget stores all step definitions and tracks which step is
              active.
            </li>
            <li>
              For each step, it collects required fields, shows a confirmation
              summary, and then submits an additional step action.
            </li>
          </ul>
          <p className="text-sm text-gray-700 mt-3">
            The onboarding service parses the step-specific configuration,
            filters payload to allowed keys, injects authentication, calls the
            external API, and appends execution details to the stored onboarding
            session.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            6. Skip Paths and Recovery
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            The onboarding flow is resilient to skips and reloads.
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>
              Users can skip initial setup and the widget jumps directly to
              additional steps if they exist.
            </li>
            <li>
              If the browser reloads, local storage state is used to resume from
              the correct step.
            </li>
            <li>
              If an additional step fails, the user sees the error and can retry
              or edit inputs for that step.
            </li>
          </ul>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            7. Difference from the Main Chatbot
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            The onboarding-only bot focuses on activation rather than general
            conversation.
          </p>
          <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
            <li>
              It has no persona detection, sales prompts, or behavioral
              triggers.
            </li>
            <li>
              It does not answer knowledge base questions and uses only the
              configured onboarding endpoints.
            </li>
            <li>
              It follows a linear, guided flow designed to get a new user fully
              set up with minimal confusion.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
