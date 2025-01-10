"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";

interface AppointmentResponse {
    message: string;
}

export default function AppointmentsPage() {
    const [serviceId, setServiceId] = useState<string>("");
    const [stylistId, setStylistId] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [startHour, setStartHour] = useState<number | "">("");
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const backendURL: string =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://152.42.243.146";

    const handleBookAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        if (!serviceId || !stylistId || !date || startHour === "") {
            setMessage("All fields are required.");
            return;
        }
        if (startHour < 0 || startHour > 23) {
            setMessage("Start hour must be between 0 and 23.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post<AppointmentResponse>(
                `${backendURL}/api/appointments`,
                {
                    serviceId,
                    stylistId,
                    date,
                    startHour,
                }
            );
            if (response.status === 201) {
                setMessage("Appointment booked successfully!");
                setServiceId("");
                setStylistId("");
                setDate("");
                setStartHour("");
            } else {
                setMessage("Could not book appointment. Please try again.");
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ error: string }>;
                setMessage(axiosError.response?.data.error || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }
            console.error("Error booking appointment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
            <form onSubmit={handleBookAppointment} className="space-y-4 max-w-md">
                <div>
                    <label htmlFor="serviceId" className="block mb-1 font-semibold">
                        Service ID
                    </label>
                    <input
                        id="serviceId"
                        type="text"
                        className="w-full border rounded p-2"
                        value={serviceId}
                        onChange={(e) => setServiceId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="stylistId" className="block mb-1 font-semibold">
                        Stylist ID
                    </label>
                    <input
                        id="stylistId"
                        type="text"
                        className="w-full border rounded p-2"
                        value={stylistId}
                        onChange={(e) => setStylistId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="date" className="block mb-1 font-semibold">
                        Date
                    </label>
                    <input
                        id="date"
                        type="date"
                        className="w-full border rounded p-2"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="startHour" className="block mb-1 font-semibold">
                        Start Hour
                    </label>
                    <input
                        id="startHour"
                        type="number"
                        className="w-full border rounded p-2"
                        placeholder="e.g., 9 for 9AM"
                        value={startHour}
                        onChange={(e) => {
                            const value = e.target.value;
                            setStartHour(value === "" ? "" : parseInt(value, 10));
                        }}
                        min={0}
                        max={23}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={`bg-blue-600 text-white px-4 py-2 rounded ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                    }`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Booking..." : "Book"}
                </button>
            </form>

            {message && (
                <p className="mt-4 text-center font-medium text-red-500">{message}</p>
            )}
        </div>
    );
}