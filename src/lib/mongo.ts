import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set in environment");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(uri!);
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
