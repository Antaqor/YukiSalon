"use client";

import React from "react";

interface BookingStepsProps {
    currentStep: number;
    // e.g. 1 for Service, 2 for Time, 3 for Payment, 4 for Confirm
}

export default function BookingSteps({ currentStep }: BookingStepsProps) {
    const steps = ["Service", "Time", "Payment", "Confirm"];

    return (
        <div className="mb-6 flex items-center justify-between">
            {steps.map((label, idx) => {
                const stepNumber = idx + 1;
                const isActive = stepNumber === currentStep;

                return (
                    <div key={label} className="flex items-center">
                        {/* Step icon container */}
                        <div
                            className={`
                w-10 h-10 flex items-center justify-center
                border-2 
                ${isActive ?
                                // Active Step Styling
                                "bg-black text-lime-300 border-lime-300 shadow-[0_0_10px_rgba(0,255,0,0.7)]" :
                                // Inactive Step Styling
                                "bg-black text-gray-400 border-gray-600"
                            }
                // Square shape (remove rounding)
                // Or change to 'rounded-md' or 'rounded-lg' for soft corners
                rounded-none
              `}
                        >
                            <span className="font-bold text-lg">{stepNumber}</span>
                        </div>
                        {/* Step Label */}
                        <span
                            className={`
                ml-3 text-sm font-semibold
                ${isActive ? "text-lime-300" : "text-gray-300"}
              `}
                        >
              {label}
            </span>
                        {/* Connector line - show unless it’s the last step */}
                        {stepNumber < steps.length && (
                            <div
                                className="
                  w-10 h-px mx-4
                  bg-gradient-to-r from-gray-600 via-lime-500 to-gray-600
                  shadow-[0_0_6px_rgba(0,255,0,0.8)]
                "
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
