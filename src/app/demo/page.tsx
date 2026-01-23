
import React from "react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Chatbot Demo</h1>
          <p className="text-xl opacity-90">
            Experience our intelligent conversation assistant in action.
          </p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">Key Features</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Intelligent Lead Qualification (BANT)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Context-Aware Responses
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Seamless Appointment Scheduling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Proactive Engagement
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Try it out!</h3>
              <p className="text-gray-600 text-sm">
                The chatbot widget should appear in the bottom right corner. 
                Try asking about pricing, features, or scheduling a demo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
