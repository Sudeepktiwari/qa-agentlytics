// Open browser console and check API responses
// Every chat response now includes botMode information

// Example API response structure:
{
  "answer": "How can I help you today?",
  "botMode": "lead_generation",  // or "sales"
  "userEmail": null  // or "user@email.com" when in sales mode
}

// You can also check the chatbot state in React DevTools:
// Look for currentBotMode and currentUserEmail state variables
