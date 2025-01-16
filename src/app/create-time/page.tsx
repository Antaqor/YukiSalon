"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import MonthCalendar, { MonthData, DayStatus } from "@/app/components/MonthCalendar";

/** Service interface */
interface Service {
    _id: string;
    name: string;
    durationMinutes: number;
}

/** Approved Stylist interface */
interface Stylist {
    _id: string;
    username: string; // or "name" if you prefer
}

/** Minimal salon response */
interface SalonResponse {
    _id: string;
    name: string;
}

/**
 * Add `duration` minutes to `startTime` in "HH:MM" format.
 */
function addMinutesToTime(startTime: string, duration: number): string {
    const [sh, sm] = startTime.split(":");
    const startH = parseInt(sh, 10);
    const startM = parseInt(sm, 10);

    const total = startH * 60 + startM + duration;
    const endH = Math.floor(total / 60);
    const endM = total % 60;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/**
 * CreateTimeBlockPage:
 * Owners can add custom time-blocks (date + startTime) for a chosen Service & optional Stylist.
 */
export default function CreateTimeBlockPage() {
    const { data: session } = useSession();

    const [services, setServices] = useState<Service[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);

    const [serviceId, setServiceId] = useState("");
    const [stylistId, setStylistId] = useState("");

    // MonthCalendar data
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Time fields
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("12:30");

    // UI / feedback states
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * 1) If user is NOT owner => immediately show error
     */
    useEffect(() => {
        if (session?.user?.role !== "owner") {
            setMessage("Only owners can create time blocks.");
        }
    }, [session]);

    /**
     * 2) Fetch data for the owner:
     *    - /api/salons/my-salon => get _id
     *    - /api/services/salon/:id => get services
     *    - /api/stylists/team => get approved stylists
     *    - Hard-code or fetch month data for the calendar
     */
    useEffect(() => {
        async function fetchOwnerData() {
            try {
                if (!session?.user?.accessToken) {
                    setMessage("Please log in with an owner account.");
                    return;
                }
                setMessage("");

                const token = session.user.accessToken;

                // 1) GET /api/salons/my-salon
                const salonRes = await axios.get<SalonResponse>(
                    "http://68.183.191.149/api/salons/my-salon",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const salonId = salonRes.data?._id;
                if (!salonId) {
                    setMessage("No salon found for this owner. Please create one first.");
                    return;
                }

                // 2) GET /api/services/salon/:id => to load the services
                const servRes = await axios.get<Service[]>(
                    `http://68.183.191.149/api/services/salon/${salonId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setServices(servRes.data);

                // 3) GET /api/stylists/team => only returns approved stylists
                const teamRes = await axios.get<Stylist[]>(
                    "http://68.183.191.149/api/stylists/team",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setStylists(teamRes.data);

                // 4) Hard-coded month data (example: Jan 2025)
                const januaryDays: DayStatus[] = [
                    { day: 3, status: "fullyBooked" },
                    { day: 6, status: "goingFast" },
                    { day: 7, status: "goingFast" },
                    { day: 10, status: "fullyBooked" },
                ];
                setMonthData({ year: 2025, month: 0, days: januaryDays });
            } catch (error) {
                console.error("Error (fetchOwnerData):", error);
                setMessage("Could not load your salon, services, or stylists.");
            }
        }

        if (session?.user?.role === "owner") {
            void fetchOwnerData();
        }
    }, [session]);

    /**
     * 3) Whenever serviceId or startTime changes, recalc endTime
     */
    useEffect(() => {
        const chosenService = services.find((s) => s._id === serviceId);
        if (chosenService) {
            setEndTime(addMinutesToTime(startTime, chosenService.durationMinutes));
        }
    }, [serviceId, startTime, services]);

    /**
     * 4) Handler for changing the startTime => recalc endTime if service known
     */
    function handleStartTimeChange(val: string) {
        setStartTime(val);
        const chosenService = services.find((s) => s._id === serviceId);
        if (chosenService) {
            setEndTime(addMinutesToTime(val, chosenService.durationMinutes));
        } else {
            setEndTime("12:30");
        }
    }

    /**
     * 5) Submit => POST /api/services/my-service/time-block
     */
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setMessage("");

        if (!session?.user?.accessToken) {
            setMessage("You must be logged in as owner to proceed.");
            return;
        }
        if (!serviceId) {
            setMessage("Please select a service.");
            return;
        }
        if (!monthData || selectedDay === null) {
            setMessage("Please select a day from the calendar.");
            return;
        }
        if (!startTime) {
            setMessage("Invalid start time.");
            return;
        }

        const dayStr = String(selectedDay).padStart(2, "0");
        const dateStr = `2025-01-${dayStr}`; // example year/month

        setIsSubmitting(true);
        try {
            const token = session.user.accessToken;
            const payload = {
                serviceId,
                stylistId: stylistId || null, // optional
                date: dateStr,
                times: [startTime],
            };

            const res = await axios.post(
                "http://68.183.191.149/api/services/my-service/time-block",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 201) {
                setMessage("Time block added successfully!");
                // reset form
                setServiceId("");
                setStylistId("");
                setSelectedDay(null);
                setStartTime("12:00");
                setEndTime("12:30");
            } else {
                setMessage("Error creating time block. Please try again.");
            }
        } catch (err) {
            console.error("TimeBlock POST error:", err);
            setMessage("Server error. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // 6) Render
    return (
        <div className="flex w-full min-h-screen bg-gray-50">
            <main className="flex-1 px-6 py-8">
                {message && (
                    <div className="mb-4 p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded">
                        {message}
                    </div>
                )}

                <div className="max-w-2xl bg-white border border-gray-200 rounded-md shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Service */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Үйлчилгээ
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                            >
                                <option value="">-- Үйлчилгээ сонгох --</option>
                                {services.map((srv) => (
                                    <option key={srv._id} value={srv._id}>
                                        {srv.name} ({srv.durationMinutes} мин)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stylist (optional) - showing "approved" stylists/team */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Стилист (Нэмэлт)
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                                value={stylistId}
                                onChange={(e) => setStylistId(e.target.value)}
                            >
                                <option value="">Стилист сонгоогүй</option>
                                {stylists.map((sty) => (
                                    <option key={sty._id} value={sty._id}>
                                        {sty.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Calendar */}
                        <div>
                            {monthData ? (
                                <MonthCalendar
                                    monthData={monthData}
                                    selectedDay={selectedDay}
                                    onSelectDay={setSelectedDay}
                                />
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Loading calendar data...
                                </p>
                            )}
                        </div>

                        {/* Start Time / End Time */}
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Эхлэх цаг
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Дуусах цаг
                                </label>
                                <input
                                    type="text"
                                    value={endTime}
                                    readOnly
                                    className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className={`bg-neutral-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-700"
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Цаг нэмэх"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
