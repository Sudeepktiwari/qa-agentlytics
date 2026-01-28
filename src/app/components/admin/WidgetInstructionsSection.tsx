"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, Info, AlertTriangle, Palette } from "lucide-react";

interface WidgetConfig {
  voiceEnabled: boolean;
  voiceGender: string;
  autoOpenProactive: boolean;
}

interface WidgetInstructionsSectionProps {
  apiKey: string;
  widgetConfig: WidgetConfig;
}

const WidgetInstructionsSection: React.FC<WidgetInstructionsSectionProps> = ({
  apiKey,
  widgetConfig,
}) => {
  const [copied, setCopied] = useState(false);

  // Use a placeholder if apiKey is missing
  const displayKey = apiKey || "YOUR_API_KEY_HERE";

  const widgetScript = `<script 
  src="https://agentlytics.advancelytics.com/api/widget" 
  data-api-key="${displayKey}" 
  data-voice-enabled="${widgetConfig.voiceEnabled}" 
  data-voice-gender="${widgetConfig.voiceGender}" 
  data-auto-open-proactive="${widgetConfig.autoOpenProactive}"> 
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(widgetScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <span>🤖</span> Add Agentlytics Widget to Your Website
        </h2>

        {!apiKey && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <span className="font-bold">API Key Missing:</span> You haven't
              generated an API key yet. The code below uses a placeholder.
              Please go to the Configuration section to generate your unique API
              key.
            </div>
          </div>
        )}

        <p className="text-slate-500 mb-6">
          To activate the AI bot on your website, add the following script
          inside the{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-sm font-mono">
            &lt;body&gt;
          </code>{" "}
          section of your site.
        </p>

        {/* Code Snippet */}
        <div className="relative group mb-8">
          <div className="absolute top-2 right-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors border border-white/10 backdrop-blur-sm"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border border-slate-800 shadow-inner">
            <code>{widgetScript}</code>
          </pre>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* How this works */}
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              How this works
            </h3>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm h-full">
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                  This script enables the Agentlytics AI widget on your website
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                  The bot activates automatically based on visitor behavior
                </li>
                <li className="flex gap-3 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                  No additional configuration is required
                </li>
              </ul>
            </div>
          </div>

          {/* After adding the script */}
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>✅</span> After adding the script
            </h3>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 h-full shadow-sm">
              <p className="text-sm font-medium text-emerald-900 mb-3">
                Once the code is live on your website:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 text-sm text-emerald-800">
                  <span className="text-emerald-500">•</span>
                  Refresh this page if needed
                </li>
                <li className="flex gap-2 text-sm text-emerald-800">
                  <span className="text-emerald-500">•</span>
                  Open any URL listed in the Crawled Pages Library below
                </li>
                <li className="flex gap-2 text-sm text-emerald-800">
                  <span className="text-emerald-500">•</span>
                  Interact with the bot directly on those pages to test
                  responses
                </li>
              </ul>
              <p className="text-xs text-emerald-700 mt-3 pt-3 border-t border-emerald-200/50">
                The bot will use the indexed content shown below to answer
                visitor queries.
              </p>
            </div>
          </div>

          {/* Branding */}
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Palette size={18} className="text-purple-600" />
              Branding
            </h3>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 h-full flex flex-col justify-center shadow-sm">
              <p className="text-sm font-medium text-purple-900 mb-3">
                Match the AI agent’s color theme with your website branding.
              </p>
              <Link
                href="/admin?section=configuration"
                className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-800 hover:underline transition-colors"
              >
                → Customize Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetInstructionsSection;
