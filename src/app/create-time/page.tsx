"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import MonthCalendar, { MonthData, DayStatus } from "@/app/components/MonthCalendar";

/**
 * Interface definitions
 */
interface Service {
    _id: string;
    name: string;
    durationMinutes: number; // Үргэлжлэх хугацаа
}
interface Stylist {
    _id: string;
    name: string;
}
interface SalonResponse {
    _id: string;
    name: string;
}

/**
 * Utility: add `duration` minutes to `startTime`
 * @param startTime - e.g. "09:00"
 * @param duration - e.g. 30
 * @returns new time string, e.g. "09:30"
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

export default function CreateTimeBlockPage() {
    const { data: session } = useSession();

    const [services, setServices] = useState<Service[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);

    const [serviceId, setServiceId] = useState("");
    const [stylistId, setStylistId] = useState("");

    // Month calendar data
    const [monthData, setMonthData] = useState<MonthData | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Time fields
    const [startTime, setStartTime] = useState("12:00");
    const [endTime, setEndTime] = useState("12:30");

    // UI states
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Fetch data for the owner (salon, services, stylists)
     */
    useEffect(() => {
        const fetchOwnerData = async () => {
            try {
                setMessage("");

                if (!session?.user?.accessToken) {
                    setMessage("Та нэвтэрч ороод дахин оролдоно уу.");
                    return;
                }
                const token = session.user.accessToken;

                // 1) Fetch the owner's salon
                const salonRes = await axios.get<SalonResponse>(
                    "http://68.183.191.149/api/salons/my-salon",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const salonId = salonRes.data._id;

                // 2) Fetch services from that salon
                const servRes = await axios.get<Service[]>(
                    `http://68.183.191.149/api/services/salon/${salonId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setServices(servRes.data);

                // 3) Fetch stylists for that salon
                const styRes = await axios.get<Stylist[]>(
                    `http://68.183.191.149/api/stylists/salon/${salonId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStylists(styRes.data);

                // 4) Simulate retrieving month data (Jan 2025) - example only
                const januaryDays: DayStatus[] = [
                    { day: 3, status: "fullyBooked" },
                    { day: 6, status: "goingFast" },
                    { day: 7, status: "goingFast" },
                    { day: 10, status: "fullyBooked" },
                ];
                const january2025: MonthData = {
                    year: 2025,
                    month: 0,
                    days: januaryDays,
                };
                setMonthData(january2025);
            } catch (error) {
                console.error("Алдаа (fetchOwnerData):", error);
                setMessage("Өгөгдөл ачаалж чадсангүй.");
            }
        };

        fetchOwnerData();
    }, [session]);

    /**
     * Whenever serviceId or startTime changes, recalc endTime
     */
    useEffect(() => {
        const chosenService = services.find((s) => s._id === serviceId);
        if (chosenService) {
            const newEnd = addMinutesToTime(startTime, chosenService.durationMinutes);
            setEndTime(newEnd);
        }
    }, [serviceId, startTime, services]);

    /**
     * Handler for changing the startTime (recalculate endTime)
     */
    const handleStartTimeChange = (val: string) => {
        setStartTime(val);
        const chosenService = services.find((s) => s._id === serviceId);
        if (chosenService) {
            const newEnd = addMinutesToTime(val, chosenService.durationMinutes);
            setEndTime(newEnd);
        } else {
            setEndTime("12:30");
        }
    };

    /**
     * Submit a single time-block for the selected date
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        // Basic checks
        if (!session?.user?.accessToken) {
            setMessage("Нэвтэрч орсны дараа оролдоно уу.");
            return;
        }
        if (!serviceId) {
            setMessage("Үйлчилгээ сонгоно уу.");
            return;
        }
        if (!monthData || selectedDay === null) {
            setMessage("Календараас өдөр сонгоно уу.");
            return;
        }
        if (!startTime) {
            setMessage("Эхлэх цаг буруу байна.");
            return;
        }

        // Build date as "YYYY-MM-DD" for January 2025
        const dayStr = String(selectedDay).padStart(2, "0");
        const dateStr = `2025-01-${dayStr}`;

        setIsSubmitting(true);
        try {
            const token = session.user.accessToken;

            const payload = {
                serviceId,
                stylistId: stylistId || null,
                date: dateStr,
                times: [startTime], // Send only the startTime
            };

            const res = await axios.post(
                "http://68.183.191.149/api/services/my-service/time-block",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 201) {
                setMessage("Нэг удаагийн цагийн блок амжилттай нэмлээ!");
                // reset form
                setServiceId("");
                setStylistId("");
                setSelectedDay(null);
                setStartTime("12:00");
                setEndTime("12:30");
            } else {
                setMessage("Цагийн блок үүсгэх үед алдаа гарлаа.");
            }
        } catch (err) {
            console.error("TimeBlock POST алдаа:", err);
            setMessage("Сервер алдаа гарлаа.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-gray-50">
            <div className="flex-1 px-6 py-8">

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
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                required
                            >
                                <option value="">-- Үйлчилгээ сонгох --</option>
                                {services.map((srv) => (
                                    <option key={srv._id} value={srv._id}>
                                        {srv.name} ({srv.durationMinutes} мин)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stylist (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Стилист (Нэмэлт)
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                                value={stylistId}
                                onChange={(e) => setStylistId(e.target.value)}
                            >
                                <option value="">Стилист сонгоогүй</option>
                                {stylists.map((sty) => (
                                    <option key={sty._id} value={sty._id}>
                                        {sty.name}
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
                                    Календарын дата ачаалж байна...
                                </p>
                            )}
                        </div>

                        {/* Start Time / End Time (display only) */}
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Эхлэх цаг
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Дуусах цаг (урьдчилсан)
                                </label>
                                <input
                                    type="text"
                                    value={endTime}
                                    readOnly
                                    className="w-full border border-gray-300 bg-gray-50 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className={`bg-neutral-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors ${
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-neutral-700"
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Нэмэж байна..." : "Блок үүсгэх"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
