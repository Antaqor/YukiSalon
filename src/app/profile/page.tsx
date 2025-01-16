"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Salon {
    _id?: string;
    name: string;
    location: string;
    about?: string;
    logo?: string;
    coverImage?: string;
    phoneNumber?: string;
    lat?: number | null;
    lng?: number | null;
}

interface StylistUserResponse {
    assignedSalon: string | null;
    stylistStatus?: "pending" | "approved" | "rejected" | "fired" | null;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // For owners
    const [salon, setSalon] = useState<Salon>({
        name: "",
        location: "",
        about: "",
        logo: "",
        coverImage: "",
        phoneNumber: "",
        lat: null,
        lng: null,
    });

    // For stylists
    const [assignedSalon, setAssignedSalon] = useState<Salon | null>(null);
    const [stylistStatus, setStylistStatus] = useState<
        "pending" | "approved" | "rejected" | "fired" | null
    >(null);

    // 1) If session is loading => do nothing
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated" || !session?.user) {
            router.push("/login");
        }
        if (session?.user?.role === "user") {
            router.push("/login");
        }
    }, [status, session, router]);

    // 2) If role=owner => fetch or create the salon
    useEffect(() => {
        async function fetchMySalon() {
            try {
                setLoading(true);
                setMessage("");

                const token = session?.user?.accessToken;
                // Use production domain
                const res = await axios.get<Salon>(
                    "http://68.183.191.149/api/salons/my-salon",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSalon((prev) => ({
                    ...prev,
                    ...res.data,
                    phoneNumber: res.data.phoneNumber || "",
                }));
            } catch (err) {
                console.error("Error fetching salon:", err);
                setMessage("Could not load your salon data. If you haven't created one, fill out the form.");
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && session?.user?.role === "owner") {
            fetchMySalon();
        }
    }, [status, session]);

    // 3) If role=stylist => fetch assignedSalon & stylistStatus
    useEffect(() => {
        async function fetchStylistSalon() {
            try {
                setLoading(true);
                setMessage("");

                const token = session?.user?.accessToken;
                // Suppose /api/users/me returns { assignedSalon, stylistStatus }
                // If you haven't coded that, you need an endpoint or handle it differently.
                const userRes = await axios.get<StylistUserResponse>(
                    "http://68.183.191.149/api/users/me",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                setStylistStatus(userRes.data.stylistStatus || null);

                if (!userRes.data.assignedSalon) {
                    setMessage("No assigned salon yet. Please contact an owner or admin.");
                    return;
                }
                // If stylistStatus = "pending" => just show a message
                if (userRes.data.stylistStatus === "pending") {
                    setMessage("Your stylist status is pending approval by the salon owner.");
                    return;
                }
                if (userRes.data.stylistStatus === "rejected" || userRes.data.stylistStatus === "fired") {
                    setMessage("You have been rejected or fired by the salon owner.");
                    return;
                }
                // If status = "approved", fetch the salon doc
                const salonRes = await axios.get<Salon>(
                    `http://68.183.191.149/api/salons/${userRes.data.assignedSalon}`
                );
                setAssignedSalon(salonRes.data);
            } catch (err) {
                console.error("Error fetching stylist assigned salon:", err);
                setMessage("Could not load assigned salon data. Please contact your salon owner.");
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated" && session?.user?.role === "stylist") {
            fetchStylistSalon();
        }
    }, [status, session]);

    /** Owner: handle file upload for the salon logo. */
    function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
            if (typeof evt.target?.result === "string") {
                setSalon((prev) => ({ ...prev, logo: evt.target!.result as string }));
            }
        };
        reader.readAsDataURL(file);
    }

    /** Owner: handle input changes */
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setSalon((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    /** Owner: Submit or update the salon data */
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!session?.user?.accessToken) {
            setMessage("You must be logged in.");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const token = session.user.accessToken;
            const res = await axios.post(
                "http://68.183.191.149/api/salons/my-salon",
                {
                    name: salon.name.trim(),
                    location: salon.location.trim(),
                    about: salon.about?.trim() ?? "",
                    logo: salon.logo,
                    coverImage: salon.coverImage || "",
                    phoneNumber: salon.phoneNumber || "",
                    lat: salon.lat ?? null,
                    lng: salon.lng ?? null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.status === 200 || res.status === 201) {
                setMessage("Salon updated successfully!");
                setSalon((prev) => ({
                    ...prev,
                    _id: res.data?._id,
                }));
            } else {
                setMessage("Unable to save salon. Please try again.");
            }
        } catch (err) {
            console.error("Error updating salon:", err);
            setMessage("Error updating salon. Check console for details.");
        } finally {
            setLoading(false);
        }
    }

    // If session is loading => show spinner
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading session...</p>
            </div>
        );
    }

    // If user is not an owner or stylist => show nothing (already redirected)
    if (!session?.user || (session.user.role !== "owner" && session.user.role !== "stylist")) {
        return null;
    }

    // If user is a stylist => show assigned salon or pending message
    if (session.user.role === "stylist") {
        return (
            <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow-sm space-y-4">
                {message && (
                    <div className="p-2 rounded bg-red-50 text-red-600 border border-red-200 text-sm">
                        {message}
                    </div>
                )}
                <h1 className="text-xl font-bold text-neutral-800">Stylist Profile</h1>
                <p className="text-sm text-gray-600">
                    Hello, <strong>{session.user.username}</strong>! You are registered as a stylist.
                </p>
                {loading && <p className="text-gray-500 text-sm">Loading assigned salon...</p>}
                {/* If stylistStatus = "approved" => assignedSalon is loaded */}
                {assignedSalon && (
                    <div className="p-3 border rounded bg-white shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-700">
                            Assigned Salon: {assignedSalon.name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{assignedSalon.location}</p>
                        {assignedSalon.about && (
                            <p className="mt-2 text-sm text-gray-600">{assignedSalon.about}</p>
                        )}
                        {assignedSalon.logo && (
                            <img
                                src={assignedSalon.logo}
                                alt="Salon Logo"
                                className="h-16 w-16 object-cover rounded mt-2 border"
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }

    // If user is "owner", show the salon management form
    if (session.user.role === "owner") {
        return (
            <div className="max-w-3xl mx-auto p-4">
                {message && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                        {message}
                    </div>
                )}

                <h1 className="text-2xl font-bold mb-4">Manage Your Salon</h1>
                {loading && <p className="text-sm text-gray-500 mb-3">Loading...</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Salon Name</label>
                        <input
                            type="text"
                            name="name"
                            value={salon.name}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            required
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <input
                            type="text"
                            name="location"
                            value={salon.location}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            placeholder="e.g. Ulaanbaatar, District X..."
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            value={salon.phoneNumber}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            placeholder="+97691234567"
                        />
                    </div>

                    {/* About */}
                    <div>
                        <label className="block text-sm font-medium mb-1">About</label>
                        <textarea
                            name="about"
                            value={salon.about}
                            onChange={handleChange}
                            className="border p-2 w-full"
                            rows={3}
                            placeholder="A short description of your salon..."
                        />
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Salon Logo</label>
                        {salon.logo && (
                            <img
                                src={salon.logo}
                                alt="Salon Logo"
                                className="h-20 w-20 object-cover mb-2 border"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="block text-sm"
                        />
                    </div>

                    {/* lat / lng */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                name="lat"
                                value={salon.lat ?? ""}
                                onChange={(e) =>
                                    setSalon((prev) => ({
                                        ...prev,
                                        lat: e.target.value ? parseFloat(e.target.value) : null,
                                    }))
                                }
                                className="border p-2 w-full"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                name="lng"
                                value={salon.lng ?? ""}
                                onChange={(e) =>
                                    setSalon((prev) => ({
                                        ...prev,
                                        lng: e.target.value ? parseFloat(e.target.value) : null,
                                    }))
                                }
                                className="border p-2 w-full"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Salon"}
                    </button>
                </form>
            </div>
        );
    }

    return null; // fallback
}
