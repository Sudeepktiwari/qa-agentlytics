import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - AI Chatbot Platform",
  description:
    "Learn about our company, mission, and the team behind our AI chatbot platform",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          About Our Company
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Story
          </h2>
          <p className="text-gray-600 mb-4">
            We are a leading AI technology company specializing in
            conversational AI solutions and intelligent automation. Founded in
            2020 by a team of AI researchers and software engineers, we have
            successfully helped over 500 companies worldwide improve their
            customer engagement through intelligent chatbots and virtual
            assistants.
          </p>
          <p className="text-gray-600">
            What started as a small team working on natural language processing
            has grown into a comprehensive platform that serves businesses from
            startups to Fortune 500 companies. Our journey has been driven by
            the belief that AI should be accessible, beneficial, and easy to
            implement for organizations of all sizes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600 mb-4">
            Our mission is to make advanced AI technology accessible and
            beneficial for businesses of all sizes. We believe in transparent
            communication, innovative solutions, exceptional customer service,
            and ethical AI development.
          </p>
          <p className="text-gray-600">
            We strive to bridge the gap between complex AI technology and
            practical business applications, ensuring that every organization
            can harness the power of artificial intelligence to improve their
            customer relationships and operational efficiency.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Our Team
          </h2>
          <p className="text-gray-600 mb-6">
            Our team consists of experienced developers, AI specialists, UX
            designers, and customer success managers dedicated to delivering
            outstanding results. We combine technical expertise with deep
            understanding of business needs to create solutions that truly make
            a difference.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Engineering Team
              </h3>
              <p className="text-gray-600 text-sm">
                Our engineers specialize in machine learning, natural language
                processing, and scalable system architecture to ensure robust
                and reliable AI solutions.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Research Team
              </h3>
              <p className="text-gray-600 text-sm">
                Our AI researchers stay at the forefront of technological
                advancement, continuously improving our algorithms and exploring
                new possibilities.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">Design Team</h3>
              <p className="text-gray-600 text-sm">
                Our UX/UI designers focus on creating intuitive, engaging
                experiences that make AI interactions feel natural and
                human-friendly.
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Customer Success
              </h3>
              <p className="text-gray-600 text-sm">
                Our customer success team ensures every client achieves their
                goals, providing ongoing support, training, and strategic
                guidance.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🎯</span>
                Innovation
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We continuously push the boundaries of what&apos;s possible with
                AI, developing cutting-edge solutions that solve real-world
                problems.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🤝</span>
                Transparency
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We believe in open communication, clear pricing, and honest
                relationships with our clients and partners.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">⚖️</span>
                Ethical AI
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We are committed to developing AI that is fair, unbiased, and
                beneficial for society as a whole.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">🏆</span>
                Excellence
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We strive for excellence in everything we do, from code quality
                to customer service and beyond.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Awards & Recognition
          </h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-yellow-500 text-2xl mr-3">🏆</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Best AI Startup 2023
                </h3>
                <p className="text-gray-600 text-sm">TechCrunch Disrupt</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 text-2xl mr-3">🌟</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Top Customer Service Platform
                </h3>
                <p className="text-gray-600 text-sm">
                  Customer Service Excellence Awards 2023
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 text-2xl mr-3">🚀</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Innovation in AI Award
                </h3>
                <p className="text-gray-600 text-sm">
                  Silicon Valley Tech Awards 2022
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Join Our Journey
          </h3>
          <p className="text-gray-600 mb-6">
            Ready to transform your customer experience with intelligent AI
            solutions?
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
}
