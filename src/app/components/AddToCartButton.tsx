"use client";

import React from "react";
import { Product, useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleClick = async () => {
    await addItem(product);       // drop in the item…
    router.push("/shop/cart");    // …then whisk the user to their cart
  };

  return (
    <button
      onClick={handleClick}
      className="bg-[#1D9BF0] text-white px-6 py-2 rounded
                 hover:opacity-90 hover:scale-[1.02] transition
                 focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]"
    >
      Сагсанд нэмэх
    </button>
  );
}
