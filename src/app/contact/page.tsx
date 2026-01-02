import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - AI Chatbot Platform",
  description:
    "Get in touch with our team for support, sales inquiries, or partnership opportunities",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Contact Us
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Ready to get started or have questions about our services? Get in
          touch with our team for personalized assistance.
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Get In Touch
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <span className="text-blue-600 text-xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email Us</h3>
                    <p className="text-gray-600">
                      support@chatbot.com (General inquiries)
                    </p>
                    <p className="text-gray-600">
                      sales@chatbot.com (New projects)
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <span className="text-blue-600 text-xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Call Us</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600 text-sm">
                      Available during business hours
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <span className="text-blue-600 text-xl">🏢</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Visit Us</h3>
                    <p className="text-gray-600">123 Tech Street</p>
                    <p className="text-gray-600">San Francisco, CA 94105</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <span className="text-blue-600 text-xl">🕒</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Business Hours
                    </h3>
                    <p className="text-gray-600">Monday-Friday: 9AM-6PM PST</p>
                    <p className="text-gray-600">Saturday: 10AM-2PM PST</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                24/7 Support
              </h2>
              <p className="text-gray-600 mb-4">
                For urgent technical support, use our 24/7 live chat feature or
                submit a priority ticket through our support portal. We
                typically respond to all inquiries within 2-4 hours during
                business days.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start Live Chat
                </button>
                <button className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Submit Support Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Send us a Message
            </h2>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="demo">Request Demo</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  placeholder="Tell us about your project, requirements, or how we can help you..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  className="mr-2"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-700">
                  I would like to receive updates about new features and
                  promotions
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                How quickly can I get started?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Most customers can get their chatbot up and running within 24-48
                hours after providing their requirements and content.
              </p>

              <h3 className="font-semibold text-gray-800 mb-2">
                Do you offer custom integrations?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Yes, we provide custom API integrations with your existing CRM,
                helpdesk, e-commerce platform, and other business systems.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                What kind of support do you provide?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We offer 24/7 technical support, regular maintenance, training
                sessions, and dedicated account management for enterprise
                clients.
              </p>

              <h3 className="font-semibold text-gray-800 mb-2">
                Can I try before I buy?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely! We offer a 14-day free trial for our Professional
                plan and personalized demos for all potential customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
