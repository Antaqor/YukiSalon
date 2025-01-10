// File: /src/pages/api/testConnection.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect'; // Update the path if necessary

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        await dbConnect();
        res.status(200).json({ success: true, message: "Database connected successfully" });
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ success: false, message: "Failed to connect to database" });
    }
}