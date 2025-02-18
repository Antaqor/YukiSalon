import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BirthDatePicker() {
    const [birthDate, setBirthDate] = useState<Date | null>(null);

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-800">Төрсөн огноо</label>
            <DatePicker
                className="border-b border-gray-300 px-2 py-2 focus:outline-none focus:border-black w-full"
                selected={birthDate}
                onChange={(date: Date | null) => setBirthDate(date)}
                dateFormat="yyyy/MM/dd"
                showYearDropdown
                scrollableYearDropdown
                maxDate={new Date()}
                placeholderText="Огноо сонгох"
            />
        </div>
    );
}