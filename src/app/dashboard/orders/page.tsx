"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import MinimalTabs from "@/app/components/MinimalTabs";
import {
    CalendarIcon,
    ClockIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";

function OrdersSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <ul className="space-y-3">
                <li className="h-20 w-full bg-gray-200 rounded" />
                <li className="h-20 w-full bg-gray-200 rounded" />
                <li className="h-20 w-full bg-gray-200 rounded" />
            </ul>
        </div>
    );
}

interface UserData {
    username: string;
    phoneNumber?: string;
}

interface ServiceData {
    name: string;
}

interface AppointmentData {
    _id: string;
    date: string;            // e.g. "2025-01-15T00:00:00.000Z"
    startTime: string;       // e.g. "14:30"
    createdAt?: string;      // e.g. "2025-01-10T12:00:00.000Z"
    service?: ServiceData;
    user?: UserData;
    classification?: string; // We'll add this on the client side
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [error, setError] = useState("");
    const [loadingData, setLoadingData] = useState(true);

    // If user is not authenticated, redirect to login
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch & sort appointments by createdAt, then classify
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                if (session?.user?.accessToken && session.user.role === "owner") {
                    const token = session.user.accessToken;

                    // 1) Fetch appointments
                    const res = await axios.get<AppointmentData[]>(
                        "http://localhost:5001/api/appointments",
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    // 2) Sort: newest (most recently created) first
                    const sortedByCreatedAt = [...res.data].sort((a, b) => {
                        // If createdAt is missing, treat it like 0
                        const bCreated = b.createdAt
                            ? new Date(b.createdAt).getTime()
                            : 0;
                        const aCreated = a.createdAt
                            ? new Date(a.createdAt).getTime()
                            : 0;
                        return bCreated - aCreated;
                    });

                    // 3) Classify each appointment
                    const now = Date.now();
                    const MS_IN_24H = 24 * 60 * 60 * 1000;

                    const classified = sortedByCreatedAt.map((appt) => {
                        // Construct a Date for the scheduled time
                        const fullDate = new Date(appt.date);
                        const [hr, min] = appt.startTime.split(":").map(Number);
                        fullDate.setHours(hr, min, 0, 0);

                        // Compare scheduled time to now
                        const diff = fullDate.getTime() - now;

                        let classification = "upcoming";
                        if (diff < 0) {
                            classification = "past";
                        } else if (diff < MS_IN_24H) {
                            classification = "soon";
                        }

                        return { ...appt, classification };
                    });

                    setAppointments(classified);
                }
            } catch (err) {
                console.error("Error loading appointments:", err);
                setError("Захиалгын мэдээллийг ачаалж чадсангүй.");
            } finally {
                setLoadingData(false);
            }
        };

        if (session?.user?.accessToken && session.user.role === "owner") {
            fetchAppointments();
        }
    }, [session]);

    if (status === "loading") {
        return <p className="p-4 text-sm text-gray-700">Сессийн мэдээллийг ачаалж байна...</p>;
    }

    if (!session?.user || session.user.role !== "owner") {
        return (
            <p className="p-4 text-sm text-red-600">
                Энэ хуудсыг харах эрхгүй байна. Та эзэн байх шаардлагатай.
            </p>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
                <MinimalTabs />

                {loadingData ? (
                    <OrdersSkeleton />
                ) : (
                    <section className="space-y-6">
                        {error && <p className="text-red-600 mb-4">{error}</p>}

                        {appointments.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                Одоогоор цаг авсан захиалга алга байна.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {appointments.map((appt) => {
                                    // For display, let's show the date in "YYYY-MM-DD" format (or whatever you want).
                                    const displayDate = new Date(appt.date).toLocaleDateString("en-CA");

                                    return (
                                        <li
                                            key={appt._id}
                                            className="border border-neutral-200 p-4 rounded bg-white hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col gap-2 text-sm text-neutral-700">
                                                <p className="flex items-center gap-1">
                                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Огноо:</strong>{" "}
                                                    {displayDate}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <ClockIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Цаг:</strong>{" "}
                                                    {appt.startTime}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <ClipboardDocumentListIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Үйлчилгээ:</strong>{" "}
                                                    {appt.service?.name || "—"}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Хэрэглэгч:</strong>{" "}
                                                    {appt.user?.username || "—"}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Утас:</strong>{" "}
                                                    {appt.user?.phoneNumber || "—"}
                                                </p>

                                                {/* Show classification */}
                                                <p className="text-xs text-gray-500 italic">
                                                    Classification: {appt.classification}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
