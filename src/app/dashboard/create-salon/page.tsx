// ===========================================
// FRONTEND - create-salon/page.tsx (Updated)
// ===========================================
"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CreateSalonResponse {
    _id?: string;
    name?: string;
    location?: string;
    logo?: string;
    error?: string;
}

interface ErrorResponse {
    error: string;
}

export default function NewSalonPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Basic fields
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    // Store the uploaded logo image (base64 or file URL)
    const [logo, setLogo] = useState("");

    const [message, setMessage] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    if (status === "loading") return <p>Loading session...</p>;
    if (!session?.user) {
        return <p>Please log in as owner to create a salon.</p>;
    }

    // =============== 1) Geolocation ===============
    const handleGetLocation = () => {
        setMessage("");
        setFetchingLocation(true);

        if (!("geolocation" in navigator)) {
            setMessage("Geolocation not supported by this browser.");
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLat(pos.coords.latitude.toString());
                setLng(pos.coords.longitude.toString());
                setFetchingLocation(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setMessage("Could not get your location. Please allow location access.");
                setFetchingLocation(false);
            }
        );
    };

    // =============== 2) File input -> base64 ===============
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                setLogo(reader.result.toString()); // store base64 data
            }
        };
        reader.readAsDataURL(file);
    };

    // =============== 3) Submit form ===============
    const handleCreateSalon = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");

        if (!name.trim()) {
            setMessage("Please enter a salon name.");
            return;
        }

        const parsedLat = lat ? parseFloat(lat) : undefined;
        const parsedLng = lng ? parseFloat(lng) : undefined;

        try {
            const response = await axios.post<CreateSalonResponse>(
                "http://localhost:5001/api/salons/my-salon",
                {
                    name,
                    location,
                    lat: parsedLat,
                    lng: parsedLng,
                    // important: send the logo
                    logo,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setMessage("Salon created/updated successfully!");
                setTimeout(() => {
                    router.push("/");
                }, 2000);
            } else {
                setMessage("Failed to create/update salon. Please try again.");
            }
        } catch (error) {
            console.error("Error creating salon:", error);
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                setMessage(axiosError.response?.data.error || "Server error.");
            } else {
                setMessage("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-6 bg-white p-4 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Create or Update Salon</h1>
            {message && <p className="text-red-600 mb-2">{message}</p>}

            <form onSubmit={handleCreateSalon} className="space-y-4">
                {/* Salon Name */}
                <div>
                    <label htmlFor="salonName" className="block font-semibold mb-1">
                        Salon Name
                    </label>
                    <input
                        id="salonName"
                        type="text"
                        className="border p-2 w-full rounded"
                        placeholder="e.g. My Awesome Salon"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Address */}
                <div>
                    <label htmlFor="salonLocation" className="block font-semibold mb-1">
                        Address (Optional)
                    </label>
                    <input
                        id="salonLocation"
                        type="text"
                        className="border p-2 w-full rounded"
                        placeholder="e.g. 123 Main Street"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                {/* Lat/Lng */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block font-semibold mb-1">Latitude</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded"
                            placeholder="e.g. 47.915"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-semibold mb-1">Longitude</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded"
                            placeholder="e.g. 106.917"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                        />
                    </div>
                </div>

                {/* Geolocation Button */}
                <div>
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors mr-2"
                        disabled={fetchingLocation}
                    >
                        {fetchingLocation ? "Getting Location..." : "Use My Current Location"}
                    </button>
                </div>

                {/* Logo File Upload */}
                <div>
                    <label className="block font-semibold mb-1">Upload Salon Logo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block"
                    />
                    {/* Preview the logo if available */}
                    {logo && (
                        <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Preview:</p>
                            <img
                                src={logo}
                                alt="Salon Logo Preview"
                                className="h-20 w-20 object-cover rounded-full border mt-1"
                            />
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Save Salon
                </button>
            </form>
        </div>
    );
}