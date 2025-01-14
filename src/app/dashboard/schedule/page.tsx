// app/dashboard/schedule/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MinimalTabs from "@/app/components/MinimalTabs";

// Minimal skeleton for schedule
function ScheduleSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <h1 className="h-6 w-48 bg-gray-200 rounded mb-4" />
            <ul className="space-y-3">
                <li className="h-6 w-32 bg-gray-200 rounded" />
                <li className="h-16 w-full bg-gray-200 rounded" />
                <li className="h-16 w-full bg-gray-200 rounded" />
            </ul>
        </div>
    );
}

// Data shape for the blocks
interface TimeBlock {
    date: string;    // e.g. "2023-06-01T00:00:00.000Z"
    label: string;   // e.g. "Morning", "Afternoon", "Evening", or "Custom"
    times: string[]; // e.g. ["08:00 AM", "08:15 AM", ...]
}

interface StylistBlock {
    stylist: {
        _id: string;
        name: string;
    } | null;
    timeBlocks: TimeBlock[];
}

interface ServiceData {
    _id: string;
    name: string;
    durationMinutes: number;
    price: number;
    // We'll assume the backend returns `stylistTimeBlocks`
    stylistTimeBlocks: StylistBlock[];
}

export default function SchedulePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                if (session?.user?.accessToken && session.user.role === "owner") {
                    const token = session.user.accessToken;
                    // 1) Get the owner's salon
                    const salonRes = await axios.get("http://localhost:5001/api/salons/my-salon", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const salonId = salonRes.data._id;

                    // 2) Fetch all services with their stylistTimeBlocks
                    //    We assume the backend returns them in the response
                    const servRes = await axios.get<ServiceData[]>(
                        `http://localhost:5001/api/services/salon/${salonId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setServices(servRes.data);
                }
            } catch (err) {
                console.error("Error loading schedule:", err);
                setError("Failed to load schedule data.");
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.accessToken && session.user.role === "owner") {
            fetchSchedule();
        }
    }, [session]);

    if (status === "loading") {
        return <p>Loading session...</p>;
    }
    if (!session?.user || session.user.role !== "owner") {
        return <p>You must be an owner to view this page.</p>;
    }

    return (
        <div className="flex min-h-screen bg-neutral-100">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <MinimalTabs />

                {loading ? (
                    <ScheduleSkeleton />
                ) : (
                    <section className="space-y-6">
                        <header>
                            <h1 className="text-2xl font-bold tracking-wide text-neutral-800 mb-4">
                                Schedule Overview
                            </h1>
                            {error && <p className="text-red-600">{error}</p>}
                        </header>

                        {services.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                No services found or no time blocks. You can create
                            </p>
                        ) : (
                            services.map((svc) => (
                                <div
                                    key={svc._id}
                                    className="bg-white border border-neutral-200 p-4 rounded hover:shadow-sm transition-shadow"
                                >
                                    <h2 className="text-lg font-semibold text-neutral-800 mb-2">
                                        {svc.name} ({svc.durationMinutes} min, ${svc.price})
                                    </h2>

                                    {svc.stylistTimeBlocks.length === 0 ? (
                                        <p className="text-sm text-neutral-500">
                                            No time blocks for this service.
                                        </p>
                                    ) : (
                                        svc.stylistTimeBlocks.map((sb, idx) => {
                                            const stylistName = sb.stylist ? sb.stylist.name : "Unassigned";
                                            return (
                                                <div
                                                    key={idx}
                                                    className="mb-4 p-3 border border-neutral-100 rounded"
                                                >
                                                    <h3 className="font-medium text-neutral-700 mb-2">
                                                        Stylist: {stylistName}
                                                    </h3>
                                                    {sb.timeBlocks.length === 0 ? (
                                                        <p className="text-sm text-neutral-500">
                                                            No blocks for this stylist.
                                                        </p>
                                                    ) : (
                                                        sb.timeBlocks.map((tb, i) => (
                                                            <div key={i} className="mb-2 text-sm text-neutral-700">
                                                                <strong>
                                                                    {new Date(tb.date).toLocaleDateString()} - {tb.label}
                                                                </strong>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {tb.times.map((timeSlot, tIndex) => (
                                                                        <span
                                                                            key={tIndex}
                                                                            className="px-2 py-1 bg-neutral-100 text-neutral-800 rounded"
                                                                        >
                                      {timeSlot}
                                    </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            ))
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}