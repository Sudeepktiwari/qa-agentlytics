// Test script to create a test admin user
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

async function createTestUser() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    
    // Check if test user already exists
    const existingUser = await users.findOne({ email: 'admin@test.com' });
    if (existingUser) {
      console.log('✅ Test user already exists: admin@test.com');
      return;
    }
    
    // Create test user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const result = await users.insertOne({
      email: 'admin@test.com',
      password: hashedPassword,
      createdAt: new Date()
    });
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Password: admin123');
    console.log('🆔 Admin ID:', result.insertedId.toString());
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await client.close();
  }
}

createTestUser();
