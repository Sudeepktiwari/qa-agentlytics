import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Plans - AI Chatbot Platform",
  description: "Flexible pricing plans for businesses of all sizes",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Flexible Pricing Plans
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Choose the perfect plan for your business needs
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Starter Plan
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$29</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Up to 1,000 conversations per month
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Basic analytics dashboard
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Email support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Standard integrations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                SSL security
              </li>
            </ul>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Perfect for small businesses getting started with chatbots
            </p>
          </div>

          {/* Professional Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Plan
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Up to 10,000 conversations per month
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced analytics and insights
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Voice features enabled
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Custom integrations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                API access
              </li>
            </ul>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Ideal for growing companies expanding their customer service
            </p>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Enterprise Plan
              </h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$299</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited conversations
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Custom AI models
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Dedicated account manager
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                White-label options
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Premium 24/7 support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                On-premise deployment
              </li>
            </ul>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Contact Sales
            </button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Designed for large organizations with complex requirements
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            All Plans Include
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-blue-600 text-3xl mb-2">🔧</div>
              <h4 className="font-semibold mb-2">Free Setup</h4>
              <p className="text-gray-600 text-sm">
                Complete onboarding and configuration included
              </p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-2">SSL Security</h4>
              <p className="text-gray-600 text-sm">
                Enterprise-grade security for all communications
              </p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-3xl mb-2">📱</div>
              <h4 className="font-semibold mb-2">Mobile Optimized</h4>
              <p className="text-gray-600 text-sm">
                Perfect experience on all devices
              </p>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">99.9% Uptime</h4>
              <p className="text-gray-600 text-sm">
                Reliable service with guaranteed availability
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 mb-6">
            We offer custom pricing for unique requirements and large-scale
            deployments.
          </p>
          <a
            href="/contact"
            className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
          >
            Contact Our Sales Team
          </a>
        </div>
      </div>
    </div>
  );
}
