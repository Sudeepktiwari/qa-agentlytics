// Alternative approach if Next.js Script component doesn't work with data attributes
// You can replace the Script component in layout.tsx with this:

/*
<script
  dangerouslySetInnerHTML={{
    __html: `
      document.addEventListener('DOMContentLoaded', function() {
        const script = document.createElement('script');
        script.src = 'https://sample-chatbot-nine.vercel.app/api/widget';
        script.setAttribute('data-api-key', 'ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345');
        script.setAttribute('data-voice-enabled', 'true');
        script.setAttribute('data-voice-gender', 'female');
        script.setAttribute('data-auto-open-proactive', 'true');
        document.head.appendChild(script);
      });
    `
  }}
/>
*/

// Or use this component approach:
"use client";
import { useEffect } from "react";

export default function ChatbotScript() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sample-chatbot-nine.vercel.app/api/widget";
    script.setAttribute(
      "data-api-key",
      "ak_b17dd57a2e0d78b5d3f1155e94167da890dda703409fe1e36e647c2e6cc8d345"
    );
    script.setAttribute("data-voice-enabled", "true");
    script.setAttribute("data-voice-gender", "female");
    script.setAttribute("data-auto-open-proactive", "true");

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[src*="/api/widget"]'
      );
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null;
}
