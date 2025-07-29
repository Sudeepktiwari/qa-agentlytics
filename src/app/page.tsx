"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to our AI-Powered
            <span className="text-blue-600"> Chatbot Platform</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            We provide intelligent conversational AI solutions for businesses of
            all sizes. Our platform offers real-time customer support, lead
            generation, and automated responses to help streamline your customer
            interactions.
          </p>
          <div className="space-x-4">
            <a
              href="/pricing"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Get Started Today
            </a>
            <a
              href="/services"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-blue-600 text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-2">Voice Integration</h3>
              <p className="text-gray-600">
                Advanced voice capabilities with natural speech recognition and
                synthesis
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">
                Multi-Language Support
              </h3>
              <p className="text-gray-600">
                Communicate with customers in their preferred language
                automatically
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Track customer engagement and chatbot performance with detailed
                insights
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-blue-600 text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Custom Integration</h3>
              <p className="text-gray-600">
                Seamlessly integrate with your existing systems and workflows
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Transform Your Customer Experience
              </h2>
              <p className="text-gray-600 mb-6">
                Whether you&apos;re a small startup or a large enterprise, our
                chatbot solutions can be customized to meet your specific needs
                and integrate seamlessly with your existing systems.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">
                    24/7 automated customer support
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">
                    Intelligent lead generation and qualification
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">
                    Reduced response times and improved satisfaction
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span className="text-gray-700">
                    Scalable solution that grows with your business
                  </span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join over 500 companies that have already transformed their
                customer experience with our AI chatbot platform.
              </p>
              <a
                href="/contact"
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Us Today
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your AI Journey Today
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Get personalized assistance and discover how our chatbot platform
            can revolutionize your customer interactions.
          </p>
          <div className="space-x-4">
            <a
              href="/pricing"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              View Pricing
            </a>
            <a
              href="/about"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Learn About Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
