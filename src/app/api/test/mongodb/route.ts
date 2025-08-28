import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/mongo';

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
    console.log('🧪 Testing MongoDB connection...');
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection successful',
        timestamp: new Date().toISOString()
      }, { headers: corsHeaders });
    } else {
      return NextResponse.json({
        success: false,
        message: 'MongoDB connection failed'
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }
  } catch (error) {
    console.error('❌ MongoDB test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'MongoDB test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
