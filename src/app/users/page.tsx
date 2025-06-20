"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { BASE_URL } from "../lib/config";

interface User {
    _id: string;
    username: string;
    profilePicture?: string;
    rating?: number;
    location?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/users`);
                setUsers(res.data);
            } catch (err: any) {
                console.error("Fetch users error:", err.response?.data || err.message);
                setError(err.response?.data?.error || "Хэрэглэгчдийн жагсаалт уншиж чадсангүй.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="p-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gray-700 mb-3" />
                        <div className="h-4 w-3/4 bg-gray-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }
    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-white text-black p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Гишүүд</h1>
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
                {users.map((user) => (
                    <Link key={user._id} href={`/profile/${user._id}`}>
                        <motion.div
                            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center shadow-sm"
                            whileHover={{ scale: 1.05, y: -4 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                        {user.profilePicture ? (
                            <Image
                                src={`${BASE_URL}${user.profilePicture}`}
                                alt={user.username}
                                width={80}
                                height={80}
                                className="w-20 h-20 rounded-full object-cover mb-3"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 mb-3" />
                        )}
                        <p className="font-semibold text-gray-800">{user.username}</p>
                        {user.location && (
                            <p className="text-xs text-gray-500 mt-1">{user.location}</p>
                        )}
                        {user.rating && (
                            <p className="text-xs text-gray-500 mt-1">★ {user.rating}</p>
                        )}
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
