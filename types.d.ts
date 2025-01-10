// global.d.ts
import mongoose from 'mongoose';

declare global {
    var _mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

// Make sure TypeScript treats this file as a module
export {};