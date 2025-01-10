import mongoose, { ConnectOptions } from 'mongoose';

// Ensure MONGODB_URI is defined as a string, else throw an error
const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env');
}

// Use `globalThis` to reference the augmented global property
const cached = global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });

async function dbConnect(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts: ConnectOptions = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            console.log('Successfully connected to MongoDB!');
            return mongooseInstance;
        }).catch((error) => {
            console.error('Failed to connect to MongoDB:', error);
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.conn = null; // Reset cached connection on error
        throw error;
    }

    return cached.conn;
}

export default dbConnect;