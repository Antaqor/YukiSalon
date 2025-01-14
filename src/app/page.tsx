"use client";

import React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import Sidebar from "@/app/components/Sidebar";

// Example top-level stats data
const statsData = [
    {
        label: "Product Revenue",
        value: "₮4,300,000",
        change: "+8%",
        subValue: "+₮1,245 Revenue",
        changeColor: "text-green-500",
    },
    {
        label: "Total Deals",
        value: "1,625",
        change: "-5%",
        subValue: "+842 Deals",
        changeColor: "text-red-500",
    },
    {
        label: "Created Tickets",
        value: "3,452",
        change: "+16%",
        subValue: "+1,023 Tickets",
        changeColor: "text-green-500",
    },
    {
        label: "Average Reply",
        value: "8:02",
        change: "+4%",
        subValue: "+0:40 Faster",
        changeColor: "text-green-500",
    },
];

// Sample data for the chart
const sampleData = [
    { date: "2023-12-25", amount: 10000 },
    { date: "2023-12-26", amount: 2000 },
    { date: "2023-12-27", amount: 4000 },
    { date: "2023-12-28", amount: 3500 },
    { date: "2023-12-29", amount: 5000 },
    { date: "2023-12-30", amount: 4500 },
    { date: "2023-12-31", amount: 20000 },
];

export default function Dashboard() {
    const categories = sampleData.map((d) => d.date);
    const seriesData = sampleData.map((d) => d.amount);

    const options: ApexOptions = {
        chart: {
            type: "line",
            toolbar: { show: false },
            dropShadow: {
                enabled: true,
                top: 5,
                left: 0,
                blur: 4,
                opacity: 0.1,
            },
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        markers: {
            size: 4,
            hover: {
                size: 6,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.1,
                opacityTo: 0.3,
                stops: [0, 90, 100],
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories,
            labels: {
                rotate: -45,
            },
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val} ₮`,
            },
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: (val) => `${val} ₮`,
            },
        },
    };

    const series = [
        {
            name: "Өдрийн орлого",
            data: seriesData,
        },
    ];

    return (
        <div className="flex w-full min-h-screen">
            {/* Fixed-width sidebar */}
            <div className="w-64 bg-white shadow">
                <Sidebar />
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 bg-gray-100">
                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {statsData.map((stat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded shadow">
                            <div className="text-sm text-gray-500">{stat.label}</div>
                            <div className="flex items-center justify-between mt-1">
                                <div className="text-2xl font-semibold text-gray-800">
                                    {stat.value}
                                </div>
                                <div className={`text-sm font-medium ${stat.changeColor}`}>
                                    {stat.change}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{stat.subValue}</div>
                        </div>
                    ))}
                </div>

                {/* Date Range + Filter row (just a placeholder) */}
                <div className="flex flex-wrap justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Total Revenue</h2>
                    <div className="flex items-center gap-3">
                        <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-200">
                            21 Oct - 21 Nov
                        </button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-200">
                            Daily
                        </button>
                        <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Line Chart Card */}
                <div className="bg-white p-4 rounded shadow w-full">
                    <Chart options={options} series={series} type="line" height={320} />
                </div>
            </div>
        </div>
    );
}
