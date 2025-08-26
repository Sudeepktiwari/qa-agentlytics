#!/bin/bash

# Safe reset and re-apply strategy

echo "🔄 Resetting to working commit..."
git reset --hard 5e2c9d73170a8f44e5dd2ceca0950b603bee27b7

echo "📝 Backing up AI enhancement documentation..."
cp AI_CONTEXTUAL_QUESTIONS_ENHANCEMENT.md AI_CONTEXTUAL_QUESTIONS_ENHANCEMENT.md.backup

echo "✅ Reset complete. Next steps:"
echo "1. Test widget injection to confirm it works"
echo "2. Re-apply only the AI contextual questions enhancement"
echo "3. Test after each change"

echo ""
echo "To test widget injection after reset, use this script:"
echo "(function() {"
echo "  const s = document.createElement('script');"
echo "  s.src = 'https://sample-chatbot-nine.vercel.app/api/widget';"
echo "  s.setAttribute('data-api-key', 'ak_e9c3475fd9b9371577ab09f5a0a7fcd1c635ef055b7e66374ed424162d80c9ac');"
echo "  s.setAttribute('data-theme', 'blue');"
echo "  document.head.appendChild(s);"
echo "})();"
