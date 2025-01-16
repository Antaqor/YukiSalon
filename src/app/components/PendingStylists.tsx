"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

/** Minimal type for a pending stylist */
interface PendingStylist {
    _id: string;
    username: string;
    email: string;
    phoneNumber: string;
    stylistStatus?: string;
}

export default function PendingStylists() {
    const { data: session } = useSession();
    const [pendingStylists, setPendingStylists] = useState<PendingStylist[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // On mount, fetch /api/stylists/pending
    useEffect(() => {
        async function fetchPending() {
            try {
                setLoading(true);
                setError("");

                if (!session?.user?.accessToken) {
                    setError("No token. Please log in as owner.");
                    return;
                }
                const token = session.user.accessToken;

                const res = await axios.get<PendingStylist[]>(
                    "http://68.183.191.149/api/stylists/pending",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setPendingStylists(res.data);
            } catch (err) {
                console.error("Error fetching pending stylists:", err);
                setError("Unable to load pending stylists.");
            } finally {
                setLoading(false);
            }
        }

        // Only fetch if user is an owner
        if (session?.user?.role === "owner") {
            void fetchPending();
        } else {
            setLoading(false);
        }
    }, [session]);

    // Approve a stylist
    async function approveStylist(stylistId: string) {
        try {
            if (!session?.user?.accessToken) return;
            const token = session.user.accessToken;
            await axios.post(
                "http://68.183.191.149/api/stylists/approve",
                { stylistId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Once approved, remove them from the local state array
            setPendingStylists((prev) => prev.filter((sty) => sty._id !== stylistId));
        } catch (err) {
            console.error("Error approving stylist:", err);
            setError("Failed to approve stylist.");
        }
    }

    // Reject a stylist
    async function rejectStylist(stylistId: string) {
        try {
            if (!session?.user?.accessToken) return;
            const token = session.user.accessToken;
            // Suppose you create a route: POST /api/stylists/reject
            // which sets stylistStatus="rejected" for that user
            await axios.post(
                "http://68.183.191.149/api/stylists/reject",
                { stylistId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Remove from local state
            setPendingStylists((prev) => prev.filter((sty) => sty._id !== stylistId));
        } catch (err) {
            console.error("Error rejecting stylist:", err);
            setError("Failed to reject stylist.");
        }
    }

    if (loading) {
        return <p className="text-sm text-gray-500">Loading pending stylists...</p>;
    }
    if (error) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    // If user is not owner or no pending stylists => show
    if (session?.user?.role !== "owner") {
        return null;
    }

    if (pendingStylists.length === 0) {
        return <p className="text-sm text-gray-500">No pending stylists.</p>;
    }

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Pending Stylists</h2>
            <ul className="space-y-2">
                {pendingStylists.map((sty) => (
                    <li
                        key={sty._id}
                        className="border p-3 rounded flex items-center justify-between"
                    >
                        <div className="text-sm">
                            <p className="font-medium">{sty.username}</p>
                            <p>{sty.email}</p>
                            <p>{sty.phoneNumber}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => approveStylist(sty._id)}
                                className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-500"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => rejectStylist(sty._id)}
                                className="bg-red-600 text-white text-sm px-3 py-1.5 rounded hover:bg-red-500"
                            >
                                Reject
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
