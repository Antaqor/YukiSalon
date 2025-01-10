import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    try {
        // Connect to the database
        await dbConnect();

        switch (method) {
            case 'GET':
                return handleGetRequest(req, res);

            case 'POST':
                return handlePostRequest(req, res);

            default:
                // Handle unsupported HTTP methods
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({
                    success: false,
                    message: `Method ${method} Not Allowed`,
                });
        }
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
        });
    }
}

// Function to handle GET requests
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch all users
        const users = await User.find({});
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error retrieving users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve users. Please try again later.',
        });
    }
}

// Function to handle POST requests
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { username, email, phoneNumber, password } = req.body;

        // Validate input
        if (!username || !email || !phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields (username, email, phoneNumber, password) are required.',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { phoneNumber }],
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with the given username, email, or phone number already exists.',
            });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            phoneNumber,
            password, // Assumes password hashing is handled in the User model or elsewhere
        });

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: 'User created successfully!',
            data: newUser,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create user. Please try again later.',
        });
    }
}