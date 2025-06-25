import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join('server', '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI environment variable is not set.');
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log('✅  MongoDB connection successful');
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
  } finally {
    await client.close();
  }
}

main();
