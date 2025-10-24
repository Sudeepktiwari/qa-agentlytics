import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyAdminAccessFromCookie } from "@/lib/auth";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key, x-admin-id, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/admin/customer-intelligence
 * Get customer intelligence data from conversations and leads
 */
export async function GET(request: NextRequest) {
  try {
    console.log("📊 [CUSTOMER INTELLIGENCE] Getting customer intelligence data");
    
    // Verify admin access using cookies
    const adminVerification = await verifyAdminAccessFromCookie(request);
    if (!adminVerification.isValid || !adminVerification.adminId) {
      console.log("❌ Admin verification failed:", adminVerification.error);
      return NextResponse.json(
        { success: false, error: adminVerification.error || "Authentication failed" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const userEmail = searchParams.get("userEmail");
    const limit = parseInt(searchParams.get("limit") || "50");

    const db = await getDb();
    const conversationsCollection = db.collection("conversations");
    const leadsCollection = db.collection("leads");

    const query: Record<string, unknown> = {};
    
    // Build query based on parameters
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    if (userEmail) {
      query.userEmail = userEmail;
    }

    // If no specific filters, get recent conversations with user profiles
    if (!sessionId && !userEmail) {
      query.profileUpdated = true;
    }

    console.log("📊 [CUSTOMER INTELLIGENCE] Query:", query);

    // Get conversation data
    const conversations = await conversationsCollection
      .find(query)
      .sort({ lastActivity: -1 })
      .limit(limit)
      .toArray();

    // Get related leads data
    const leadQueries = conversations
      .filter(conv => conv.userEmail)
      .map(conv => ({ email: conv.userEmail }));
    
    const leads = leadQueries.length > 0 
      ? await leadsCollection.find({ $or: leadQueries }).toArray()
      : [];

    // Combine and enrich data
    const customerIntelligence = conversations.map(conversation => {
      const relatedLead = leads.find(lead => lead.email === conversation.userEmail);
      
      return {
        // Session Info
        sessionId: conversation.sessionId,
        lastActivity: conversation.lastActivity,
        pageUrl: conversation.pageUrl,
        
        // User Profile
        userEmail: conversation.userEmail,
        userName: conversation.userName,
        profileUpdated: conversation.profileUpdated,
        
        // Lead Info
        leadSource: conversation.leadSource,
        leadStatus: conversation.leadStatus,
        
        // Booking Info
        bookingIntent: conversation.bookingIntent,
        bookingConfirmed: conversation.bookingConfirmed,
        bookingType: conversation.bookingType,
        bookingDate: conversation.bookingDate,
        bookingTime: conversation.bookingTime,
        confirmationNumber: conversation.confirmationNumber,
        
        // Related Lead Data
        leadData: relatedLead ? {
          leadId: relatedLead._id,
          requirements: relatedLead.requirements,
          detectedIntent: relatedLead.pageContext?.detectedIntent,
          detectedVertical: relatedLead.pageContext?.detectedVertical,
          visitedPages: relatedLead.pageContext?.visitedPages,
          firstContact: relatedLead.firstContact,
          lastContact: relatedLead.lastContact,
          status: relatedLead.status,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations: customerIntelligence,
        totalConversations: conversations.length,
        totalLeads: leads.length,
        summary: {
          totalSessions: conversations.length,
          withEmail: conversations.filter(c => c.userEmail).length,
          bookingIntents: conversations.filter(c => c.bookingIntent).length,
          confirmedBookings: conversations.filter(c => c.bookingConfirmed).length,
        }
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("❌ [CUSTOMER INTELLIGENCE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get customer intelligence data",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
