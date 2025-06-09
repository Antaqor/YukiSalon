"use client";
import React, { useState } from "react";
import { useCart } from "../../context/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, clearCart } = useCart();
    const [message, setMessage] = useState("");

    const total = items.reduce((sum, item) => {
        const price = item.product.saleActive ? item.product.salePrice : item.product.price;
        return sum + price * item.quantity;
    }, 0);

    const handleCheckout = () => {
        setMessage("Төлбөрийн заавар имэйлээр илгээгдлээ.");
        clearCart();
    };

    if (items.length === 0) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white dark:bg-dark text-black dark:text-white">
                <p className="text-gray-600 dark:text-gray-300">Сагс хоосон байна.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-4 py-8 bg-white dark:bg-dark text-black dark:text-white">
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center mb-4">Төлбөр хийх</h1>
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li key={item.product._id} className="flex justify-between">
                            <span>{item.product.name} x {item.quantity}</span>
                            <span>
                                {(
                                    (item.product.saleActive ? item.product.salePrice : item.product.price) *
                                    item.quantity
                                ).toLocaleString("mn-MN")}
                                ₮
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="text-right font-bold">Нийт: {total.toLocaleString("mn-MN")}₮</p>
                {message && <p className="text-green-600 text-center">{message}</p>}
                <button onClick={handleCheckout} className="w-full bg-[#1D9BF0] text-white px-4 py-2 rounded">
                    Захиалах
                </button>
                <Link href="/shop/cart" className="block text-center text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Буцах
                </Link>
            </div>
        </main>
    );
}
