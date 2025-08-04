// MongoDB queries to monitor SDR sales bot performance
// Run these queries in MongoDB Compass or your preferred MongoDB client

// 1. Check all SDR events captured
db.sdr_events.find().sort({ timestamp: -1 }).limit(20);

// 2. Count email captures by vertical
db.sdr_events.aggregate([
  { $match: { event_type: "email_captured" } },
  {
    $group: {
      _id: "$vertical_detected",
      count: { $sum: 1 },
    },
  },
  { $sort: { count: -1 } },
]);

// 3. SDR activation rate (emails that triggered sales mode)
db.sdr_events.aggregate([
  {
    $group: {
      _id: "$event_type",
      count: { $sum: 1 },
    },
  },
]);

// 4. Cross-page persistence tracking
db.sdr_events
  .find({ event_type: "cross_page_persistence" })
  .sort({ timestamp: -1 });

// 5. Vertical detection frequency
db.sdr_events.aggregate([
  { $match: { event_type: "vertical_detected" } },
  {
    $group: {
      _id: "$metadata.vertical",
      count: { $sum: 1 },
      pages: { $addToSet: "$metadata.page_url" },
    },
  },
  { $sort: { count: -1 } },
]);

// 6. Daily SDR performance summary
db.sdr_events.aggregate([
  {
    $group: {
      _id: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        event_type: "$event_type",
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.date": -1, "_id.event_type": 1 } },
]);

// 7. Check recent customer personas created
db.customer_personas.find().sort({ created_at: -1 }).limit(10);

// 8. Email-to-persona conversion rate
db.sdr_events.aggregate([
  { $match: { event_type: "email_captured" } },
  {
    $lookup: {
      from: "customer_personas",
      localField: "metadata.email",
      foreignField: "email",
      as: "persona",
    },
  },
  {
    $group: {
      _id: null,
      total_emails: { $sum: 1 },
      with_personas: {
        $sum: { $cond: [{ $gt: [{ $size: "$persona" }, 0] }, 1, 0] },
      },
    },
  },
  {
    $project: {
      total_emails: 1,
      with_personas: 1,
      conversion_rate: {
        $multiply: [{ $divide: ["$with_personas", "$total_emails"] }, 100],
      },
    },
  },
]);

// 9. Check chat sessions that became sales mode
db.chats.find({ bot_mode: "sales" }).sort({ created_at: -1 }).limit(10);

// 10. Vertical-specific performance metrics
db.sdr_events.aggregate([
  { $match: { vertical_detected: { $exists: true, $ne: null } } },
  {
    $group: {
      _id: "$vertical_detected",
      email_captures: {
        $sum: { $cond: [{ $eq: ["$event_type", "email_captured"] }, 1, 0] },
      },
      total_events: { $sum: 1 },
      unique_sessions: { $addToSet: "$session_id" },
    },
  },
  {
    $project: {
      vertical: "$_id",
      email_captures: 1,
      total_events: 1,
      unique_sessions: { $size: "$unique_sessions" },
      conversion_rate: {
        $multiply: [{ $divide: ["$email_captures", "$total_events"] }, 100],
      },
    },
  },
  { $sort: { conversion_rate: -1 } },
]);

/* 
SAMPLE QUERIES TO TEST SDR FUNCTIONALITY:

1. To verify email was captured and triggered SDR mode:
   - Look for event_type: "email_captured" 
   - Check corresponding chat session switched to bot_mode: "sales"

2. To see vertical detection working:
   - Visit pages with /consulting, /legal, etc. in URL
   - Look for event_type: "vertical_detected" with metadata.vertical

3. To track cross-page persistence:
   - Submit email on one page, navigate to another
   - Look for event_type: "cross_page_persistence"

4. Performance indicators:
   - High email_captured to vertical_detected ratio = good targeting
   - Multiple cross_page_persistence events = good retention
   - Short time between email_captured and follow-up events = aggressive timing working

Remember: The SDR mode persists across browser sessions via localStorage,
so test in incognito mode for clean testing or clear localStorage between tests.
*/
