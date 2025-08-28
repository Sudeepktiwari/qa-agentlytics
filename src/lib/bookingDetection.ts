import { BookingDetectionResult } from '@/types/booking';

export function detectBookingIntent(message: string): BookingDetectionResult {
  const lowerMessage = message.toLowerCase();
  
  // Demo request patterns
  const demoPatterns = [
    /\b(demo|demonstration|show me|see.*demo|live demo)\b/i,
    /\b(walkthrough|tour|preview)\b/i,
    /\b(can.*see|want.*see|would.*like.*see).*how.*work/i,
    /\b(product.*demo|software.*demo)\b/i
  ];
  
  // Call request patterns
  const callPatterns = [
    /\b(call|phone|speak|talk|discuss)\b/i,
    /\b(schedule.*call|book.*call|phone.*call)\b/i,
    /\b(consultation|meeting|appointment)\b/i,
    /\b(sales.*call|discovery.*call)\b/i
  ];
  
  // Support request patterns
  const supportPatterns = [
    /\b(support|help|assistance|issue|problem)\b/i,
    /\b(contact.*support|need.*help|technical.*help)\b/i,
    /\b(troubleshoot|bug|error|not.*work)\b/i,
    /\b(customer.*service|technical.*support)\b/i
  ];

  // General booking/scheduling patterns
  const bookingPatterns = [
    /\b(schedule|book|arrange|set.*up)\b/i,
    /\b(meeting|appointment|session)\b/i,
    /\b(contact.*me|get.*touch|reach.*out)\b/i,
    /\b(when.*available|calendar|time.*slot)\b/i
  ];
  
  let requestType: BookingDetectionResult['requestType'] = 'consultation';
  let confidence = 0;
  
  // Check patterns and assign confidence scores
  if (demoPatterns.some(pattern => pattern.test(lowerMessage))) {
    requestType = 'demo';
    confidence = 0.85;
  } else if (callPatterns.some(pattern => pattern.test(lowerMessage))) {
    requestType = 'call';
    confidence = 0.8;
  } else if (supportPatterns.some(pattern => pattern.test(lowerMessage))) {
    requestType = 'support';
    confidence = 0.75;
  } else if (bookingPatterns.some(pattern => pattern.test(lowerMessage))) {
    requestType = 'consultation';
    confidence = 0.7;
  }
  
  // Boost confidence for explicit scheduling words
  if (/\b(schedule|book|arrange|appointment|meeting)\b/i.test(lowerMessage)) {
    confidence += 0.1;
  }
  
  // Extract timeframe preferences
  let preferredTimeframe;
  let urgency: 'low' | 'medium' | 'high' = 'low';
  
  if (/\b(today|asap|urgent|now|immediately)\b/i.test(lowerMessage)) {
    preferredTimeframe = 'today';
    urgency = 'high';
    confidence += 0.05;
  } else if (/\b(tomorrow|next.*day)\b/i.test(lowerMessage)) {
    preferredTimeframe = 'tomorrow';
    urgency = 'medium';
  } else if (/\b(this.*week|next.*week)\b/i.test(lowerMessage)) {
    preferredTimeframe = 'this_week';
    urgency = 'medium';
  }
  
  return {
    hasBookingRequest: confidence > 0.6,
    requestType,
    confidence,
    extractedInfo: {
      preferredTimeframe,
      urgency
    }
  };
}

export function generateBookingResponse(intent: BookingDetectionResult): {
  message: string;
  showCalendar: boolean;
  buttons: string[];
} {
  const { requestType, extractedInfo } = intent;
  
  let message = '';
  let buttons: string[] = [];
  
  switch (requestType) {
    case 'demo':
      message = "I'd love to show you a personalized demo of our solution! Let me help you schedule a time that works best for you.";
      buttons = ['Schedule Demo', 'More Info First', 'Different Time'];
      break;
      
    case 'call':
      message = "I'll connect you with one of our experts for a detailed discussion about your needs. When would be the best time for a call?";
      buttons = ['Schedule Call', 'Call Today', 'Email Instead'];
      break;
      
    case 'support':
      message = "I'll make sure you get the technical support you need. Let's schedule a time for our support team to assist you properly.";
      buttons = ['Schedule Support', 'Urgent Issue', 'Email Support'];
      break;
      
    default:
      message = "I'd be happy to arrange a consultation to discuss your specific needs and how we can help. When would be convenient for you?";
      buttons = ['Schedule Meeting', 'Learn More', 'Contact Sales'];
  }
  
  if (extractedInfo.urgency === 'high') {
    message += " I see this is urgent - I'll prioritize finding you the earliest available slot.";
  }
  
  return {
    message,
    showCalendar: true,
    buttons
  };
}

// Test function to validate our detection
export function testBookingDetection() {
  const testCases = [
    "I'd like to see a demo",
    "Can you schedule a call?",
    "I need technical support",
    "Book a meeting with sales",
    "Show me how this works",
    "I have an urgent issue",
    "When can we talk?",
    "Hello there", // Should not trigger
    "What's your pricing?" // Should not trigger
  ];
  
  console.log('🧪 Testing booking detection...');
  
  testCases.forEach(testCase => {
    const result = detectBookingIntent(testCase);
    console.log(`"${testCase}" -> ${result.hasBookingRequest ? 'BOOKING' : 'NO BOOKING'} (${result.requestType}, confidence: ${result.confidence.toFixed(2)})`);
  });
}
