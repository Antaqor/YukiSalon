import { useEffect, useState } from "react";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export default function useCurrentLocation() {
    const [coords, setCoords] = useState<Coordinates | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
            },
            (err) => {
                console.error("Geolocation error", err);
            }
        );
    }, []);

    return coords;
}
