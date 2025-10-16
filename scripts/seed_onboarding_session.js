// Seed an active onboarding session for testing exclusivity gating
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('test');
  const sessions = db.collection('onboardingSessions');

  const sessionId = process.env.SEED_SESSION_ID || 'sess-dev-1';
  const now = new Date();
  const fields = [
    { key: 'email', label: 'Email', required: true, type: 'email' },
    { key: 'firstName', label: 'First Name', required: true, type: 'text' },
    { key: 'lastName', label: 'Last Name', required: true, type: 'text' },
  ];

  const doc = {
    sessionId,
    adminId: 'default-admin',
    status: 'in_progress',
    stageIndex: 0,
    collectedData: {},
    requiredKeys: fields.map((f) => f.key),
    fields,
    createdAt: now,
    updatedAt: now,
  };

  await sessions.updateOne({ sessionId }, { $set: doc }, { upsert: true });
  console.log(`Seeded onboarding session for ${sessionId}`);
  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});