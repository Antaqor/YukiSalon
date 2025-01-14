"use client";
// =========================================
// 1) MonthCalendar.tsx
// =========================================
import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export interface DayStatus {
    day: number;
    status: "past" | "fullyBooked" | "goingFast" | "available";
}

export interface MonthData {
    year: number; // e.g., 2025
    month: number; // 0 => 1-р сар
    days: DayStatus[];
}

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

    // Тухайн өдрийг 2025-01-06 (Даваа) гэж үзье
    const CURRENT_DATE = new Date(2025, 0, 6);
    const isCurrentMonth = year === 2025 && month === 0;
    const todayDay = isCurrentMonth ? 6 : null;

    const firstOfMonth = new Date(year, month, 1);
    const dayOfWeekOffset = firstOfMonth.getDay(); // Ням=0, Даваа=1, ...
    const totalDays = 31; // 1-р сар 31 хоног

    function isInPast(dayNum: number) {
        const checkDate = new Date(year, month, dayNum);
        return checkDate < CURRENT_DATE;
    }

    function getDayStatus(dayNum: number) {
        if (isInPast(dayNum)) return "past";
        const found = days.find((d) => d.day === dayNum);
        return found?.status || "available";
    }

    function renderDayCell(dayNum: number) {
        const status = getDayStatus(dayNum);
        const isSelected = dayNum === selectedDay;
        const isToday = dayNum === todayDay;

        let cellClasses =
            "border h-10 flex items-center justify-center text-sm transition-colors cursor-pointer";

        switch (status) {
            case "past":
                cellClasses += " bg-gray-50 text-gray-400 cursor-not-allowed";
                break;
            case "fullyBooked":
                cellClasses += " bg-gray-100 text-red-400 line-through cursor-not-allowed";
                break;
            case "goingFast":
                cellClasses += " hover:bg-blue-50";
                break;
            default:
                cellClasses += " hover:bg-blue-50"; // "available"
                break;
        }

        if (isSelected && status !== "past" && status !== "fullyBooked") {
            cellClasses += " bg-blue-600 text-white hover:bg-blue-600";
        }
        if (isToday && !isSelected && status !== "past" && status !== "fullyBooked") {
            cellClasses += " ring-2 ring-blue-400 ring-offset-2 ring-offset-white";
        }

        return (
            <div
                key={dayNum}
                className={cellClasses}
                onClick={() => {
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

    // Эхний хэдэн хоосон нүднүүд (жишээ нь 1 сар = 0..6 blank)
    const blankCells: React.ReactNode[] = [];
    for (let i = 0; i < dayOfWeekOffset; i++) {
        blankCells.push(<div key={`blank-${i}`} className="border h-10" />);
    }

    // Жинхэнэ өдрүүд
    const dayCells: React.ReactNode[] = [];
    for (let d = 1; d <= totalDays; d++) {
        dayCells.push(renderDayCell(d));
    }

    const cells = [...blankCells, ...dayCells];
    const monthName = firstOfMonth.toLocaleString("default", { month: "long" });

    return (
        <div className="max-w-sm mx-auto bg-white rounded-md shadow p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button className="p-2 hover:bg-gray-50 rounded">
                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="font-semibold text-base text-gray-800">
                    {monthName} {year}
                </h2>
                <button className="p-2 hover:bg-gray-50 rounded">
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-xs font-medium text-center text-gray-500 mb-2">
                <div>Ня</div>
                <div>Да</div>
                <div>Мя</div>
                <div>Лх</div>
                <div>Пү</div>
                <div>Ба</div>
                <div>Бя</div>
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 text-center">{cells}</div>

            {/* Footer Actions */}
            <div className="mt-4 flex items-center justify-between">
                <button className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100">
                    Болих
                </button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">
                    OK
                </button>
            </div>
        </div>
    );
}
