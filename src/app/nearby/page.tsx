"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";

/** Adjust if your backend returns different fields */
interface Salon {
    _id: string;
    name: string;
    location: string; // a text field, if stored in DB
    coordinates?: {
        type: string;
        coordinates: number[]; // [lng, lat]
    };
}

export default function NearbySalonsPage() {
    const [salons, setSalons] = useState<Salon[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasLocation, setHasLocation] = useState(false);

    // For debugging
    const [debugLog, setDebugLog] = useState<string>("");

    // We store user’s lat/lng
    const [currentLat, setCurrentLat] = useState<number | null>(null);
    const [currentLng, setCurrentLng] = useState<number | null>(null);

    // We'll store the "location name" from reverse geocoding
    const [locationName, setLocationName] = useState("");

    // 3) Reverse geocode lat/lng to get a "display_name" from OpenStreetMap
    const fetchLocationName = useCallback(async (lat: number, lng: number) => {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
            const res = await fetch(url);
            if (!res.ok) {
                console.error("Reverse geocode error:", res.statusText);
                return;
            }
            const data = await res.json();
            if (data && data.display_name) {
                setLocationName(data.display_name);
            } else {
                setLocationName("Unknown location");
            }
        } catch (err) {
            console.error("Error reverse geocoding:", err);
            setLocationName("Unknown location");
        }
    }, []);

    // Main function to request user location & fetch salons
    const requestUserLocation = useCallback(async () => {
        setLoading(true);
        setError("");
        setDebugLog("");

        if (!("geolocation" in navigator)) {
            setError("Geolocation is not available in this browser.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setHasLocation(true);
                setCurrentLat(lat);
                setCurrentLng(lng);

                // 1) Reverse geocode lat/lng to get location name
                await fetchLocationName(lat, lng);

                // 2) Fetch nearby salons
                try {
                    const res = await axios.get<Salon[]>("http://152.42.243.146/api/salons/nearby", {
                        params: { lat, lng },
                    });
                    setSalons(res.data);

                    if (res.data.length === 0) {
                        setDebugLog(
                            "No salons returned from /nearby. Possibly none have lat/lng or the 2dsphere index is missing."
                        );
                    } else {
                        setDebugLog(`Fetched ${res.data.length} salons from /nearby route.`);
                    }
                } catch (err) {
                    let errMsg = "Failed to load nearby salons.";
                    if (axios.isAxiosError(err)) {
                        const axiosErr = err as AxiosError<{ error: string }>;
                        errMsg += ` (Server says: ${
                            axiosErr.response?.data?.error || axiosErr.message
                        })`;
                    }
                    setError(errMsg);
                    setDebugLog(`Axios error: ${JSON.stringify(err, null, 2)}`);
                } finally {
                    setLoading(false);
                }
            },
            (geoErr) => {
                console.error("Geolocation error:", geoErr);
                setError("Could not get your location. Please allow location access.");
                setDebugLog(`Geo error: ${geoErr.message}`);
                setLoading(false);
            }
        );
    }, [fetchLocationName]);

    useEffect(() => {
        // run once on mount
        requestUserLocation();
    }, [requestUserLocation]);

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Nearby Salons</h1>

            {loading && <p className="text-gray-500">Loading salons near you...</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* If user refused or we had an error, let them click a button to retry */}
            {!loading && !hasLocation && !error && (
                <button
                    onClick={requestUserLocation}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Allow Location
                </button>
            )}

            {/* Show user’s current lat/lng + name for clarity */}
            {hasLocation && (
                <div className="mb-4 text-sm text-gray-600">
                    <p>
                        <strong>Your Coordinates:</strong>{" "}
                        {currentLat && currentLng
                            ? `${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`
                            : "N/A"}
                    </p>
                    <p>
                        <strong>Your Location Name:</strong>{" "}
                        {locationName ? locationName : "Fetching name..."}
                    </p>
                </div>
            )}

            {/* If we have location, but no salons and no error, presumably no salons found */}
            {!loading && hasLocation && salons.length === 0 && !error && (
                <p className="text-gray-500">
                    No salons found near your location. Possibly none have lat/lng or the
                    2dsphere index is missing.
                </p>
            )}

            {/* Display the returned salons */}
            {salons.length > 0 && (
                <ul className="space-y-4 mt-4">
                    {salons.map((salon) => (
                        <li key={salon._id} className="border p-4 rounded bg-white shadow-sm">
                            <h2 className="text-lg font-bold">{salon.name}</h2>
                            {/* If your DB has a text address in salon.location, we show that */}
                            <p className="text-sm text-gray-600">{salon.location}</p>
                        </li>
                    ))}
                </ul>
            )}

            {/* For debugging */}
            {debugLog && (
                <div className="mt-6 p-3 bg-gray-100 text-xs text-gray-700 rounded">
                    <pre>{debugLog}</pre>
                </div>
            )}
        </div>
    );
}