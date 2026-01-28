"use client";

import React, { useState } from "react";
import { Check, Copy, Info } from "lucide-react";

interface WidgetInstructionsSectionProps {
  apiKey: string;
}

const WidgetInstructionsSection: React.FC<WidgetInstructionsSectionProps> = ({
  apiKey,
}) => {
  const [copied, setCopied] = useState(false);

  const widgetScript = `<script 
  src="https://agentlytics.advancelytics.com/api/widget" 
  data-api-key="${apiKey || "YOUR_API_KEY"}" 
  data-voice-enabled="true" 
  data-voice-gender="female" 
  data-auto-open-proactive="true"> 
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

        <div className="grid md:grid-cols-2 gap-8">
          {/* How this works */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info size={18} className="text-blue-600" />
              How this works
            </h3>
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

          {/* After adding the script */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>✅</span> After adding the script
            </h3>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
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
                  Interact with the bot directly on those pages to test responses
                </li>
              </ul>
              <p className="text-xs text-emerald-700 mt-3 pt-3 border-t border-emerald-200/50">
                The bot will use the indexed content shown below to answer
                visitor queries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetInstructionsSection;
