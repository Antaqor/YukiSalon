"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export interface DayStatus {
    day: number;
    status: "past" | "fullyBooked" | "goingFast" | "available";
}

export interface MonthData {
    year: number;   // e.g. 2025
    month: number;  // 0 => January
    days: DayStatus[];
}

interface MonthCalendarProps {
    monthData: MonthData;
    selectedDay: number | null;
    onSelectDay: (day: number) => void;
    /** Example props for displaying the service name & price. Adjust as needed. */
    serviceName?: string;
    servicePrice?: string | number;
}

export default function MonthCalendar({
                                          monthData,
                                          selectedDay,
                                          onSelectDay,
                                          serviceName = "Sample Service",
                                          servicePrice = "$99",
                                      }: MonthCalendarProps) {
    const { year, month, days } = monthData;
    const CURRENT_DATE = new Date(2025, 0, 6); // Example: 2025-01-06 as "today"
    const isCurrentMonth = year === 2025 && month === 0;
    const todayDay = isCurrentMonth ? 6 : null;

    // For simplicity, we assume 31 days for this example
    const firstOfMonth = new Date(year, month, 1);
    const dayOfWeekOffset = firstOfMonth.getDay(); // Sunday=0, Monday=1,...
    const totalDays = 31;

    /** Checks if the given day is in the past relative to CURRENT_DATE */
    function isInPast(dayNum: number) {
        return new Date(year, month, dayNum) < CURRENT_DATE;
    }

    /** Retrieves the status (past, fullyBooked, goingFast, or available) for a given day */
    function getDayStatus(dayNum: number) {
        if (isInPast(dayNum)) return "past";
        const found = days.find((d) => d.day === dayNum);
        return found?.status || "available";
    }

    /** Renders a single cell (day) in the calendar */
    function renderDayCell(dayNum: number) {
        const status = getDayStatus(dayNum);
        const isSelected = dayNum === selectedDay;
        const isToday = dayNum === todayDay;

        let cellClasses =
            // Base styles + mobile-friendly heights
            "border flex items-center justify-center text-sm transition-colors cursor-pointer h-12 sm:h-14";

        switch (status) {
            case "past":
                cellClasses += " bg-gray-50 text-gray-400 cursor-not-allowed";
                break;
            case "fullyBooked":
                cellClasses += " bg-gray-100 text-red-500 line-through cursor-not-allowed";
                break;
            case "goingFast":
                cellClasses += " hover:bg-blue-50";
                break;
            default: // "available"
                cellClasses += " hover:bg-blue-50";
                break;
        }

        // Highlight selected day (if not past or fully booked)
        if (isSelected && status !== "past" && status !== "fullyBooked") {
            cellClasses += " bg-blue-600 text-white hover:bg-blue-600";
        }

        // Highlight "today" if not selected/past/fullyBooked
        if (isToday && !isSelected && status !== "past" && status !== "fullyBooked") {
            cellClasses += " ring-2 ring-blue-400 ring-offset-2 ring-offset-white";
        }

        return (
            <div
                key={dayNum}
                className={cellClasses}
                onClick={() => {
                    // Ignore clicks on past or fullyBooked days
                    if (status === "past" || status === "fullyBooked") return;
                    onSelectDay(dayNum);
                }}
            >
                {dayNum}
                {status === "goingFast" && (
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full ml-1" />
                )}
            </div>
        );
    }

    // Create blank cells for padding at the start of the month
    const blankCells: React.ReactNode[] = [];
    for (let i = 0; i < dayOfWeekOffset; i++) {
        blankCells.push(
            <div key={`blank-${i}`} className="border h-12 sm:h-14" />
        );
    }

    // Create cells for each day of the month
    const dayCells: React.ReactNode[] = [];
    for (let d = 1; d <= totalDays; d++) {
        dayCells.push(renderDayCell(d));
    }

    // Combine blank cells + day cells
    const cells = [...blankCells, ...dayCells];

    // Display month name and year, e.g., "January 2025"
    const monthName = firstOfMonth.toLocaleString("default", { month: "long" });

    return (
        <div
            className="
        w-full
        bg-white
        shadow-2xl
        rounded-none
        sm:rounded-lg
        p-4
        sm:p-6
      "
            // ^ For mobile: cover full width, no side margin, standard padding
            //   For larger screens: subtle rounding, more padding.
        >
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button className="p-2 hover:bg-gray-50 rounded">
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>

                <h2 className="font-semibold text-base sm:text-lg text-gray-800">
                    {monthName} {year}
                </h2>

                <button className="p-2 hover:bg-gray-50 rounded">
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Service name and price (centered) */}
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">{serviceName}</h3>
                <p className="text-blue-600 font-medium">
                    {servicePrice}
                </p>
            </div>

            {/* Weekday labels */}
            <div className="grid grid-cols-7 text-xs font-medium text-center text-gray-500 mb-2">
                <div>Ня</div>
                <div>Да</div>
                <div>Мя</div>
                <div>Лх</div>
                <div>Пү</div>
                <div>Ба</div>
                <div>Бя</div>
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 text-center">{cells}</div>
        </div>
    );
}
