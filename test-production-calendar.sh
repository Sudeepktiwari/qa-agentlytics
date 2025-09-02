#!/bin/bash

echo "🔍 Testing production calendar API after environment variable fix..."

# Test the production API
echo "Testing: https://sample-chatbot-nine.vercel.app/api/calendar/availability"
response=$(curl -s -w "%{http_code}" "https://sample-chatbot-nine.vercel.app/api/calendar/availability?month=9&year=2025&bookingType=call")

http_code="${response: -3}"
body="${response%???}"

echo "Status Code: $http_code"

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS: Calendar API is working!"
    echo "Response contains calendar data"
elif [ "$http_code" = "503" ]; then
    echo "❌ STILL FAILING: Environment variable not set or deployment not updated"
    echo "Response: $body"
else
    echo "⚠️  UNEXPECTED: Status code $http_code"
    echo "Response: $body"
fi

echo ""
echo "📝 Next steps:"
echo "1. Set ENABLE_CALENDAR_WIDGET=true in Vercel environment variables"
echo "2. Redeploy the application"
echo "3. Test the widget calendar functionality"
