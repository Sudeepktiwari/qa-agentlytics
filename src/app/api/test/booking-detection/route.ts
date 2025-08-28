import { NextRequest, NextResponse } from 'next/server';
import { detectBookingIntent, generateBookingResponse, testBookingDetection } from '@/lib/bookingDetection';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    console.log('🧪 Running booking detection tests...');
    
    // Run automated tests
    testBookingDetection();
    
    return NextResponse.json({
      success: true,
      message: 'Booking detection tests completed - check console for results'
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('❌ Booking detection test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Booking detection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }
    
    console.log(`🔍 Testing message: "${message}"`);
    
    const intent = detectBookingIntent(message);
    
    let response = null;
    if (intent.hasBookingRequest) {
      response = generateBookingResponse(intent);
    }
    
    return NextResponse.json({
      success: true,
      message,
      intent,
      response
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('❌ Booking detection API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Booking detection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
