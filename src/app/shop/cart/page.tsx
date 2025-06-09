"use client";
import React from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
    const { items, removeItem, clearCart } = useCart();

    const total = items.reduce((sum, item) => {
        const price = item.product.saleActive ? item.product.salePrice : item.product.price;
        return sum + price * item.quantity;
    }, 0);

    if (items.length === 0) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Сагс хоосон байна.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-center">Таны сагс</h1>
                <ul className="space-y-4">
                    {items.map((item) => (
                        <li key={item.product._id} className="flex justify-between items-center border-b pb-2">
                            <div>
                                <p className="font-semibold">{item.product.name}</p>
                                <p className="text-sm text-gray-500">Тоо: {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <p>
                                    {(
                                        (item.product.saleActive ? item.product.salePrice : item.product.price) *
                                        item.quantity
                                    ).toLocaleString("mn-MN")}
                                    ₮
                                </p>
                                <button onClick={() => removeItem(item.product._id)} className="text-red-500">
                                    Устгах
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <p className="text-right font-bold">Нийт: {total.toLocaleString("mn-MN")}₮</p>
                <div className="flex justify-between">
                    <button onClick={clearCart} className="text-sm text-gray-600">
                        Сагсыг цэвэрлэх
                    </button>
                    <Link href="/shop/checkout" className="bg-[#1D9BF0] text-white px-4 py-2 rounded">
                        Төлбөр хийх
                    </Link>
                </div>
            </div>
        </main>
    );
}
