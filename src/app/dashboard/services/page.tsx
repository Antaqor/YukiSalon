// app/dashboard/services/page.tsx (Tesla-Inspired Minimalist)
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import MinimalTabs from "@/app/components/MinimalTabs";

// Skeleton loader for services page
function ServicesSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded" />
            </div>
            <ul className="space-y-3">
                <li className="h-12 w-full bg-gray-200 rounded" />
                <li className="h-12 w-full bg-gray-200 rounded" />
                <li className="h-12 w-full bg-gray-200 rounded" />
            </ul>
        </div>
    );
}

interface ServiceData {
    _id: string;
    name: string;
    durationMinutes: number;
    price: number;
}

export default function ServicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [services, setServices] = useState<ServiceData[]>([]);
    const [error, setError] = useState("");
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                if (session?.user?.accessToken && session.user.role === "owner") {
                    const token = session.user.accessToken;

                    // Fetch the owner’s salon
                    const salonRes = await axios.get("http://localhost:5001/api/salons/my-salon", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const salonId = salonRes.data._id;

                    // Fetch services for that salon
                    const servRes = await axios.get<ServiceData[]>(
                        `http://localhost:5001/api/services/salon/${salonId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setServices(servRes.data);
                }
            } catch (err) {
                console.error("Error loading services:", err);
                setError("Failed to load services.");
            } finally {
                setLoadingData(false);
            }
        };

        if (session?.user?.accessToken && session.user.role === "owner") {
            fetchServices();
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

                {loadingData ? (
                    <ServicesSkeleton />
                ) : (
                    <section className="space-y-6">
                        <header className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-wide text-neutral-800">
                                Services
                            </h1>
                            <a
                                href="/dashboard/create-service"
                                className="bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-700 transition-colors"
                            >
                                + Add Service
                            </a>
                        </header>

                        {error && <p className="text-red-600">{error}</p>}

                        {services.length === 0 ? (
                            <p className="text-sm text-neutral-500">No services found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {services.map((svc) => (
                                    <li
                                        key={svc._id}
                                        className="border border-neutral-200 p-4 rounded bg-white hover:shadow-sm transition-shadow"
                                    >
                                        <div className="text-neutral-800 font-semibold">
                                            {svc.name}
                                        </div>
                                        <div className="text-sm text-neutral-600">
                                            {svc.durationMinutes} min — ${svc.price}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}