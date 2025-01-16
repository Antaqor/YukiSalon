"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StylistUser {
    _id: string;
    username: string;
    email?: string;
    phoneNumber?: string;
    stylistStatus?: string;
    assignedSalon?: string;
}

export default function MyEmployeesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [team, setTeam] = useState<StylistUser[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // If user is not authenticated or not an owner => redirect
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
        if (status === "authenticated" && session?.user?.role !== "owner") {
            router.push("/login");
        }
    }, [status, session, router]);

    // Fetch the list of stylists (approved) from /api/stylists/team
    useEffect(() => {
        async function fetchTeam() {
            try {
                setLoading(true);
                setError("");

                if (session?.user?.accessToken && session.user.role === "owner") {
                    const token = session.user.accessToken;
                    // Use your production domain here:
                    const res = await axios.get<StylistUser[]>(
                        "http://68.183.191.149/api/stylists/team",
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setTeam(res.data);
                }
            } catch (err) {
                console.error("Error loading team stylists:", err);
                setError("Unable to load your stylists.");
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && session?.user?.role === "owner") {
            void fetchTeam();
        }
    }, [status, session]);

    // Fire a stylist => POST /api/stylists/fire
    async function handleFire(stylistId: string) {
        if (!session?.user?.accessToken) return;
        try {
            const token = session.user.accessToken;
            await axios.post(
                "http://68.183.191.149/api/stylists/fire",
                { stylistId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove from local list
            setTeam((prev) => prev.filter((st) => st._id !== stylistId));
        } catch (err) {
            console.error("Error firing stylist:", err);
            setError("Failed to fire stylist. Check console for details.");
        }
    }

    if (status === "loading") {
        return <p className="p-4">Loading session...</p>;
    }

    // Already redirecting if not an owner, so we can safely return null
    if (!session?.user || session.user.role !== "owner") {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Stylists (Approved)</h1>
            {loading && <p className="text-sm text-gray-500">Loading stylists...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && team.length === 0 ? (
                <p className="text-sm text-gray-500">
                    You currently have no *approved* stylists assigned.
                </p>
            ) : (
                <ul className="space-y-3">
                    {team.map((sty) => (
                        <li
                            key={sty._id}
                            className="p-4 border border-gray-200 rounded flex items-center justify-between"
                        >
                            <div className="text-sm">
                                <p className="font-medium">{sty.username}</p>
                                {sty.email && <p className="text-gray-500">{sty.email}</p>}
                                {sty.phoneNumber && <p className="text-gray-500">{sty.phoneNumber}</p>}
                            </div>
                            <button
                                onClick={() => handleFire(sty._id)}
                                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-500"
                            >
                                Fire
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
