import { NextRequest, NextResponse } from 'next/server';
import { getBookingsCollection } from '@/lib/mongo';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    const collection = await getBookingsCollection();
    
    // Get all bookings in the collection
    const bookings = await collection.find({}).limit(10).toArray();
    
    console.log(`📋 Found ${bookings.length} bookings in database`);
    
    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings: bookings.map(booking => ({
        _id: booking._id.toString(),
        email: booking.email,
        requestType: booking.requestType,
        status: booking.status,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        createdAt: booking.createdAt
      }))
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('❌ Error fetching bookings from database:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
