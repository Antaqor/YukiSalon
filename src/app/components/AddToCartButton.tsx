"use client";
import React from "react";
import { Product } from "../context/CartContext";
import { useCart } from "../context/CartContext";

export default function AddToCartButton({ product }: { product: Product }) {
    const { addItem } = useCart();
    return (
        <button
            onClick={() => addItem(product)}
            className="bg-[#1D9BF0] text-white px-6 py-2 rounded hover:opacity-90 hover:scale-[1.02] transition focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
        >
            Сагсанд нэмэх
        </button>
    );
}
