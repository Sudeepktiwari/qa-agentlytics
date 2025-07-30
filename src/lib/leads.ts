import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

// Enhanced lead storage - create dedicated lead when email is captured
export async function createOrUpdateLead(
  adminId: string,
  email: string,
  sessionId: string,
  requirements: string | null,
  sourceUrl?: string,
  firstMessage?: string
) {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    // Check if lead already exists for this admin
    const existingLead = await leads.findOne({ adminId, email });

    if (existingLead) {
      // Update existing lead
      const updateData: {
        lastContact: Date;
        lastSessionId: string;
        conversationCount: number;
        requirements?: string;
        $push?: { sessionIds: string };
      } = {
        lastContact: new Date(),
        lastSessionId: sessionId,
        conversationCount: (existingLead.conversationCount || 0) + 1,
      };

      // Update requirements if we have new ones
      if (requirements && requirements !== "General inquiry") {
        updateData.requirements = requirements;
      }

      // Update the existing lead
      await leads.updateOne({ _id: existingLead._id }, { $set: updateData });

      // Add session to sessionIds array if not already present
      if (!existingLead.sessionIds?.includes(sessionId)) {
        await leads.updateOne(
          { _id: existingLead._id },
          { $addToSet: { sessionIds: sessionId } }
        );
      }

      console.log(`[LeadGen] Updated existing lead: ${email}`);
      return existingLead._id;
    } else {
      // Create new lead
      const newLead = {
        adminId,
        email,
        sessionId, // First session where lead was captured
        sessionIds: [sessionId], // Array of all sessions
        requirements: requirements || null,
        status: "new", // new, contacted, qualified, converted, lost
        source: sourceUrl || null,
        firstMessage: firstMessage || null,
        firstContact: new Date(),
        lastContact: new Date(),
        conversationCount: 1,
        tags: [], // For manual tagging
        notes: "", // For admin notes
        value: null, // Potential or actual deal value
        priority: "medium", // low, medium, high
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await leads.insertOne(newLead);
      console.log(
        `[LeadGen] Created new lead: ${email} with ID: ${result.insertedId}`
      );
      return result.insertedId;
    }
  } catch (error) {
    console.error("[LeadGen] Error creating/updating lead:", error);
    throw error;
  }
}

// Get enhanced lead analytics
export async function getLeadAnalytics(adminId: string) {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const analytics = await leads
      .aggregate([
        { $match: { adminId } },
        {
          $group: {
            _id: null,
            totalLeads: { $sum: 1 },
            newLeads: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
            qualifiedLeads: {
              $sum: { $cond: [{ $eq: ["$status", "qualified"] }, 1, 0] },
            },
            convertedLeads: {
              $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
            },
            totalValue: { $sum: { $ifNull: ["$value", 0] } },
            avgConversations: { $avg: "$conversationCount" },
            thisWeekLeads: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      "$firstContact",
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray();

    return (
      analytics[0] || {
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0,
        totalValue: 0,
        avgConversations: 0,
        thisWeekLeads: 0,
      }
    );
  } catch (error) {
    console.error("[LeadGen] Error getting analytics:", error);
    return null;
  }
}

// Update lead status and notes
export async function updateLeadStatus(
  adminId: string,
  leadId: string,
  status: string,
  notes?: string,
  value?: number,
  tags?: string[]
) {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const updateData: {
      status: string;
      updatedAt: Date;
      notes?: string;
      value?: number;
      tags?: string[];
    } = {
      status,
      updatedAt: new Date(),
    };

    if (notes !== undefined) updateData.notes = notes;
    if (value !== undefined) updateData.value = value;
    if (tags !== undefined) updateData.tags = tags;

    const result = await leads.updateOne(
      { _id: new ObjectId(leadId), adminId }, // Ensure admin can only update their leads
      { $set: updateData }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("[LeadGen] Error updating lead status:", error);
    return false;
  }
}
