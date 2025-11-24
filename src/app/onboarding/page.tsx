export default function OnboardingPage() {
  return (
    <html>
      <head>
        <title>Onboarding Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 2rem; }
          .wrap { max-width: 960px; margin: 0 auto; }
          .row { display: flex; gap: 12px; }
          input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
          button { padding: 10px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #10b981; color: white; font-weight: 600; }
          .info { color: #6b7280; font-size: 14px; margin-top: 8px; }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <h1>Onboarding Assistant</h1>
          <p className="info">Paste your API key to load the onboarding-only widget.</p>
          <div className="row">
            <input id="apiKeyInput" placeholder="ak_................................................................." />
            <button id="loadBtn">Load Widget</button>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){
              function loadWidget(apiKey){
                var s = document.createElement('script');
                s.src = '/api/widget';
                s.setAttribute('data-api-key', apiKey);
                s.setAttribute('data-onboarding-only', 'true');
                s.setAttribute('data-chat-title', 'Onboarding Assistant');
                s.setAttribute('data-theme', 'green');
                s.setAttribute('data-auto-open-proactive', 'false');
                s.setAttribute('data-mirror-mode', 'false');
                document.body.appendChild(s);
              }
              var btn = document.getElementById('loadBtn');
              btn.addEventListener('click', function(){
                var val = (document.getElementById('apiKeyInput')||{}).value || '';
                if(!val){ alert('Please paste your API key'); return; }
                loadWidget(val);
              });
            })();
          `
        }} />
      </body>
    </html>
  );
}