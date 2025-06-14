"use client";
import React, { useState } from "react";

interface BuyButtonProps {
    bookId: string;
    finalPrice: number;
}

export default function BuyButton({ bookId, finalPrice }: BuyButtonProps) {
    const [showPopup, setShowPopup] = useState(false);

    const handleBuy = () => {
        setShowPopup(true);
    };
    const handleClose = () => {
        setShowPopup(false);
    };

    return (
        <>
            <button
                onClick={handleBuy}
                className="bg-brandCyan text-black px-6 py-2 rounded
                   hover:opacity-90 hover:scale-[1.02]
                   transition focus:outline-none focus:ring-2 focus:ring-brandCyan"
            >
                Худалдаж авах
            </button>

            {showPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-sm text-black relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                        >
                            X
                        </button>
                        <h2 className="text-xl font-semibold mb-2">
                            Төлбөр хийх заавар
                        </h2>
                        <p className="text-sm text-gray-300 mb-4">
                            Та {finalPrice.toLocaleString("mn-MN")}₮‐ийг Голомт банк
                            <span className="text-yellow-400 font-bold"> 3005127815 </span>
                            руу шилжүүлнэ үү. Утга дээр имэйл хаягаа бичээрэй!
                        </p>
                        <p className="text-sm text-gray-400 mb-2">
                            Номын ID: <span className="font-bold">{bookId}</span>
                        </p>

                        <div className="mt-4 text-right">
                            <button
                                onClick={handleClose}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                ОК
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
