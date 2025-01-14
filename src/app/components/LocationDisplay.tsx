"use client";

import React, { useEffect, useState } from "react";

export default function LocationDisplay() {
    const [locationName, setLocationName] = useState("");
    const [locError, setLocError] = useState("");

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocError("Geolocation not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    if (!response.ok) {
                        throw new Error("Reverse geocoding error");
                    }
                    const data = await response.json();

                    if (data.error) {
                        setLocError("Could not get location name.");
                        return;
                    }

                    const address = data?.address;
                    if (address) {
                        // Example: only show road, house_number, neighbourhood
                        const placeName = [
                            address.house_number,
                            address.road,
                            address.neighbourhood || address.suburb,
                        ]
                            .filter(Boolean)
                            .join(", ");
                        setLocationName(placeName || data.display_name || "Unknown location");
                    } else {
                        setLocationName(data.display_name || "Unknown location");
                    }
                } catch (err) {
                    console.error("Reverse geocode fetch failed:", err);
                    setLocError("Could not fetch location name.");
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                setLocError("Could not get location coordinates.");
            }
        );
    }, []);

    if (locError) {
        return <span className="text-xs text-red-500">{locError}</span>;
    }

    if (locationName) {
        return <span className="text-xs text-gray-600">{locationName}</span>;
    }

    return <span className="text-xs text-gray-400">Locating...</span>;
}