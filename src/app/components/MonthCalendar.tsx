"use client";

import React from "react";

/** Define day status */
export interface DayStatus {
    day: number;
    status: "past" | "fullyBooked" | "goingFast" | "available";
}

/** Define a month’s data */
export interface MonthData {
    year: number;   // e.g. 2025
    month: number;  // 0 => January, 1 => February, etc.
    days: DayStatus[];
}

/** Props for the MonthCalendar component */
interface MonthCalendarProps {
    monthData: MonthData;
    selectedDay: number | null;
    onSelectDay: (day: number) => void;
}

export default function MonthCalendar({
                                          monthData,
                                          selectedDay,
                                          onSelectDay,
                                      }: MonthCalendarProps) {
    const { year, month, days } = monthData;

    // Use today's real date
    const CURRENT_DATE = new Date();
    const isCurrentMonth =
        year === CURRENT_DATE.getFullYear() && month === CURRENT_DATE.getMonth();
    // If it's the current month, store today's date number, otherwise null
    const todayDay = isCurrentMonth ? CURRENT_DATE.getDate() : null;

    // Calculate first day of the given month and how many days it has
    const firstOfMonth = new Date(year, month, 1);
    const dayOfWeekOffset = firstOfMonth.getDay(); // Sunday=0, Monday=1, etc.
    // Simplified approach: get the last day of the month
    const lastOfMonth = new Date(year, month + 1, 0);
    const totalDays = lastOfMonth.getDate();

    /** Checks if a given day is in the past relative to CURRENT_DATE */
    function isInPast(dayNum: number) {
        const checkDate = new Date(year, month, dayNum);
        return checkDate < new Date(
            CURRENT_DATE.getFullYear(),
            CURRENT_DATE.getMonth(),
            CURRENT_DATE.getDate()
        );
    }

    /** Retrieves the status for a given day */
    function getDayStatus(dayNum: number) {
        if (isInPast(dayNum)) return "past";
        const found = days.find((d) => d.day === dayNum);
        return found?.status || "available";
    }

    /** Render a single day cell */
    function renderDayCell(dayNum: number) {
        const status = getDayStatus(dayNum);
        const isSelected = dayNum === selectedDay;
        const isToday = dayNum === todayDay;

        let cellClass = "border p-2 text-center cursor-pointer ";

        // Basic background/text for each status
        switch (status) {
            case "past":
                cellClass += "bg-gray-100 text-gray-400 cursor-not-allowed ";
                break;
            case "fullyBooked":
                cellClass += "bg-red-50 text-red-500 cursor-not-allowed ";
                break;
            case "goingFast":
                cellClass += "bg-yellow-50 hover:bg-yellow-100 ";
                break;
            case "available":
            default:
                cellClass += "hover:bg-blue-50 ";
                break;
        }

        // Highlight selected day (if clickable)
        if (isSelected && status !== "past" && status !== "fullyBooked") {
            cellClass += "bg-blue-500 text-white hover:bg-blue-500 ";
        }

        // Outline "today" if not selected/past/fullyBooked
        if (isToday && !isSelected && status !== "past" && status !== "fullyBooked") {
            cellClass += "border-2 border-blue-400 ";
        }

        return (
            <div
                key={dayNum}
                className={cellClass}
                onClick={() => {
                    if (status === "past" || status === "fullyBooked") return;
                    onSelectDay(dayNum);
                }}
            >
                {dayNum}
            </div>
        );
    }

    // Blank cells for offset (if the month doesn’t start on Sunday)
    const blankCells: React.ReactNode[] = [];
    for (let i = 0; i < dayOfWeekOffset; i++) {
        blankCells.push(<div key={`blank-${i}`} className="border p-2" />);
    }

    // Day cells for the month
    const dayCells: React.ReactNode[] = [];
    for (let d = 1; d <= totalDays; d++) {
        dayCells.push(renderDayCell(d));
    }

    const cells = [...blankCells, ...dayCells];

    // Display month name (English locale) and year
    const monthName = firstOfMonth.toLocaleString("default", { month: "long" });

    return (
        <div>
            {/* Header */}
            <h2 className="text-center font-semibold text-lg mb-2">
                {monthName} {year}
            </h2>

            {/* Weekday row (Sun - Sat) */}
            <div className="grid grid-cols-7 text-xs font-medium text-center mb-1">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
                {cells}
            </div>
        </div>
    );
}
