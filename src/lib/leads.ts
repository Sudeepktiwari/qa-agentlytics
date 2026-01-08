import { getDb } from "@/lib/mongo";
import { ObjectId } from "mongodb";

// Check if admin has reached lead limit
export async function checkLeadLimit(adminId: string): Promise<{
  limitReached: boolean;
  currentLeads: number;
  limit: number;
  plan: string;
}> {
  try {
    const db = await getDb();

    // Read from subscriptions only
    const subsLatest = await db
      .collection("subscriptions")
      .find({ adminId })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()
      .then((arr) => arr[0]);

    const planId = subsLatest?.planKey || "free";
    const limit = subsLatest?.limits?.leadTotalLimit || 0;
    const currentLeads = subsLatest?.usage?.leadsUsed || 0;

    return {
      limitReached: currentLeads >= limit,
      currentLeads,
      limit,
      plan: planId,
    };
  } catch (error) {
    console.error("[LeadGen] Error checking lead limit:", error);
    // Fail safe: assume limit not reached to avoid blocking legitimate users on error
    return { limitReached: false, currentLeads: 0, limit: 100, plan: "error" };
  }
}

// Enhanced lead storage - create dedicated lead when email is captured
export async function createOrUpdateLead(
  adminId: string,
  email: string,
  sessionId: string,
  requirements: string | null,
  sourceUrl?: string,
  firstMessage?: string,
  pageContext?: {
    pageContent?: string;
    detectedIntent?: string;
    detectedVertical?: string;
    proactiveQuestions?: string[];
    userResponses?: string[];
    visitedPages?: string[];
  }
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
        pageContext?: any;
        lastDetectedIntent?: string;
        lastDetectedVertical?: string;
      } = {
        lastContact: new Date(),
        lastSessionId: sessionId,
        conversationCount: (existingLead.conversationCount || 0) + 1,
      };

      // Update requirements if we have new ones
      if (requirements && requirements !== "General inquiry") {
        updateData.requirements = requirements;
      }

      // Update page context and insights
      if (pageContext) {
        updateData.pageContext = pageContext;
        updateData.lastDetectedIntent = pageContext.detectedIntent;
        updateData.lastDetectedVertical = pageContext.detectedVertical;
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
      const { limitReached } = await checkLeadLimit(adminId);

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

        // Enhanced context data
        pageContext: pageContext || null,
        detectedIntent: pageContext?.detectedIntent || null,
        detectedVertical: pageContext?.detectedVertical || null,
        lastDetectedIntent: pageContext?.detectedIntent || null,
        lastDetectedVertical: pageContext?.detectedVertical || null,
        proactiveQuestions: pageContext?.proactiveQuestions || [],
        userResponses: pageContext?.userResponses || [],
        visitedPages: pageContext?.visitedPages || [],

        firstContact: new Date(),
        lastContact: new Date(),
        conversationCount: 1,
        tags: [], // For manual tagging
        notes: "", // For admin notes
        value: null, // Potential or actual deal value
        priority: "medium", // low, medium, high
        createdAt: new Date(),
        updatedAt: new Date(),
        visibilityRestricted: limitReached,
      };

      const result = await leads.insertOne(newLead);
      console.log(
        `[LeadGen] Created new lead: ${email} with ID: ${result.insertedId}`
      );

      try {
        const subsLatest = await db
          .collection("subscriptions")
          .find({ adminId })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray()
          .then((arr) => arr[0]);
        if (subsLatest?._id) {
          await db.collection("subscriptions").updateOne(
            { _id: subsLatest._id },
            {
              $inc: { "usage.leadsUsed": 1 },
              $setOnInsert: { createdAt: new Date() },
            }
          );
        } else {
          await db.collection("subscriptions").insertOne({
            adminId,
            status: "active",
            createdAt: new Date(),
            usage: { leadsUsed: 1 },
          });
        }
      } catch (incErr) {
        console.error(
          "[LeadGen] Failed to increment leadsUsed in subscriptions",
          incErr
        );
      }
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
  status?: string,
  notes?: string,
  value?: number,
  tags?: string[]
) {
  try {
    const db = await getDb();
    const leads = db.collection("leads");

    const updateData: {
      status?: string;
      updatedAt: Date;
      notes?: string;
      value?: number;
      tags?: string[];
    } = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updateData.status = status;
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
