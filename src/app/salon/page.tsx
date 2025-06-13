"use client";
import React, { useEffect, useState } from "react";

const times = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

export default function SalonPage() {
  const [booked, setBooked] = useState<string[]>([]);

  // Load bookings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("yukiSalonBookings");
    if (stored) {
      try {
        setBooked(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const bookTime = (time: string) => {
    if (booked.includes(time)) return;
    const updated = [...booked, time];
    setBooked(updated);
    localStorage.setItem("yukiSalonBookings", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="w-full h-60 relative">
        <img
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1350&q=80"
          alt="Yuki Salon"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <h1 className="absolute bottom-4 left-4 text-3xl font-bold text-brandPink drop-shadow-md">
          Yuki Salon
        </h1>
      </div>

      <div className="max-w-md w-full p-4 space-y-4">
        <h2 className="text-2xl font-semibold text-center text-brandPink">
          Book your time
        </h2>
        <ul className="grid grid-cols-2 gap-4">
          {times.map((t) => (
            <li key={t}>
              <button
                onClick={() => bookTime(t)}
                disabled={booked.includes(t)}
                className={`w-full py-2 rounded text-sm font-medium transition-colors ${
                  booked.includes(t)
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-brandPink hover:bg-pink-600"
                }`}
              >
                {booked.includes(t) ? `Booked ${t}` : t}
              </button>
            </li>
          ))}
        </ul>
        {booked.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-brandPink">
              Your bookings
            </h3>
            <ul className="space-y-1 text-sm">
              {booked.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
