import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set in environment");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient() {
  if (!client) {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      waitQueueTimeoutMS: 2000,
    } as const;
    client = new MongoClient(uri!, options);
    await client.connect();
  }
  return client;
}

export async function getDb() {
  if (!db) {
    const client = await getMongoClient();
    db = client.db("test"); // Use test database where your data is stored
  }
  return db;
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection("users");
}

export async function getAdminSettingsCollection() {
  const db = await getDb();
  return db.collection("admin_settings");
}

// Booking system collections
export async function getBookingsCollection() {
  const db = await getDb();
  return db.collection("bookings");
}

export async function getAdminAvailabilityCollection() {
  const db = await getDb();
  return db.collection("admin_availability");
}

export async function getBlockedDatesCollection() {
  const db = await getDb();
  return db.collection("blocked_dates");
}

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    await client.db().admin().ping();
    console.log('✅ MongoDB connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return false;
  }
}
