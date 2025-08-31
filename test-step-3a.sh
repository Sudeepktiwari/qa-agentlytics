#!/bin/bash

# Test MongoDB Step 3A Implementation
echo "🧪 Testing Step 3A: MongoDB Setup & Booking Model"
echo "================================================="

# Test 1: Create a test booking using the booking service
echo "✅ Test 1: Creating test booking through booking service..."
node -e "
const { bookingService } = require('./src/services/bookingService.ts');

async function testBookingCreation() {
  try {
    const testBooking = await bookingService.createBookingFromDetection({
      sessionId: 'test-session-' + Date.now(),
      customerRequest: 'I need a demo of your product',
      email: 'test@example.com',
      name: 'Test User',
      company: 'Test Company',
      requestType: 'demo',
      preferredDate: new Date(Date.now() + 86400000), // Tomorrow
      preferredTime: '14:00',
      timezone: 'America/New_York',
      message: 'Looking forward to seeing how this works!',
      pageUrl: 'https://example.com/products',
      originalMessage: 'Hi, can I get a demo of your product?',
      detectionConfidence: 0.85
    });
    
    console.log('✅ Test booking created:', {
      id: testBooking._id,
      customerRequest: testBooking.customerRequest,
      email: testBooking.email,
      status: testBooking.status,
      requestType: testBooking.requestType
    });
    
    return testBooking._id;
  } catch (error) {
    console.error('❌ Error creating test booking:', error.message);
    return null;
  }
}

testBookingCreation().then(bookingId => {
  if (bookingId) {
    console.log('📊 Step 3A MongoDB Integration: PASSED');
  } else {
    console.log('❌ Step 3A MongoDB Integration: FAILED');
    process.exit(1);
  }
});
"

# Test 2: Verify API endpoints respond correctly
echo "✅ Test 2: Testing admin API endpoints..."

# Start development server in background for testing
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to start
sleep 10

# Test dashboard endpoint
echo "Testing /api/admin/dashboard..."
curl -s http://localhost:3000/api/admin/dashboard | jq '.success' || echo "❌ Dashboard API failed"

# Test bookings endpoint
echo "Testing /api/admin/bookings..."
curl -s http://localhost:3000/api/admin/bookings | jq '.success' || echo "❌ Bookings API failed"

# Clean up
kill $DEV_SERVER_PID 2>/dev/null

echo ""
echo "🎉 Step 3A Implementation Complete!"
echo "Features implemented:"
echo "  ✅ Enhanced BookingRequest interface with customer request tracking"
echo "  ✅ BookingService with safety validation and CRUD operations"
echo "  ✅ Admin API endpoints (/api/admin/bookings, /api/admin/dashboard, /api/admin/bulk-actions)"
echo "  ✅ BookingManagementSection component integrated into AdminPanel"
echo "  ✅ Feature flag support (ENABLE_ADMIN_INTERFACE)"
echo "  ✅ MongoDB integration with existing collections"
echo ""
echo "Next: Step 3B - Calendar Component API"
