import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services - AI Chatbot Platform",
  description:
    "Comprehensive chatbot development and AI integration services for businesses",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Our Services
        </h1>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              1. Custom Chatbot Development
            </h2>
            <p className="text-gray-600 mb-4">
              We create tailored chatbot solutions that match your business
              needs and brand voice, ensuring seamless integration with your
              workflow. Our custom bots can handle complex conversations,
              integrate with your existing systems, and provide personalized
              experiences for your customers.
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Brand-aligned conversational design</li>
              <li>Multi-platform deployment</li>
              <li>Custom workflow integration</li>
              <li>Advanced natural language processing</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              2. AI Integration Services
            </h2>
            <p className="text-gray-600 mb-4">
              Seamlessly integrate advanced AI capabilities into your existing
              systems and platforms. We help businesses leverage the power of
              artificial intelligence without disrupting their current
              operations.
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>API integration and development</li>
              <li>Legacy system modernization</li>
              <li>Machine learning model deployment</li>
              <li>Real-time data processing</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              3. Voice Assistant Development
            </h2>
            <p className="text-gray-600 mb-4">
              Build sophisticated voice-enabled assistants for enhanced user
              experience across multiple channels. Our voice solutions provide
              natural, conversational interactions that feel human and
              intuitive.
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Multi-language voice support</li>
              <li>Real-time speech processing</li>
              <li>Custom voice personalities</li>
              <li>Cross-platform compatibility</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              4. Analytics and Reporting
            </h2>
            <p className="text-gray-600 mb-4">
              Comprehensive dashboards and detailed reports to track chatbot
              performance, user interactions, and ROI. Make data-driven
              decisions to optimize your conversational AI strategy.
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Real-time performance metrics</li>
              <li>User engagement analytics</li>
              <li>Conversation flow analysis</li>
              <li>Custom reporting dashboards</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              5. 24/7 Technical Support
            </h2>
            <p className="text-gray-600 mb-4">
              Round-the-clock technical support and maintenance to ensure your
              chatbot runs smoothly without interruption. Our dedicated support
              team is always ready to help you resolve any issues quickly.
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>24/7 monitoring and support</li>
              <li>Proactive maintenance</li>
              <li>Regular updates and improvements</li>
              <li>Emergency response team</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6">
            Contact our team today to discuss how our services can transform
            your customer experience.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us Today
          </a>
        </div>
      </div>
    </div>
  );
}
