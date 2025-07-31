// MongoDB queries to analyze bot mode usage

// 1. Check recent chat sessions with mode information
db.chat_sessions.find().sort({ timestamp: -1 }).limit(10);

// 2. Find sessions that switched from lead to sales mode
db.chat_sessions.find({
  "messages.botMode": { $in: ["lead_generation", "sales"] },
});

// 3. Count mode distribution
db.chat_sessions.aggregate([
  { $unwind: "$messages" },
  { $match: { "messages.botMode": { $exists: true } } },
  {
    $group: {
      _id: "$messages.botMode",
      count: { $sum: 1 },
    },
  },
]);

// 4. Find lead-to-sales conversion points
db.chat_sessions.find({
  messages: {
    $elemMatch: {
      botMode: "sales",
      userEmail: { $ne: null },
    },
  },
});
