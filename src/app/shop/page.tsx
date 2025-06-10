"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "../context/CartContext";

/* ── constants ─────────────────────────────────────── */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://www.vone.mn/api";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState("");

  /* ── fetch catalogue ─────────────────────────────── */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/products`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setStatus("Бараа татаж чадсангүй!");
      }
    };
    fetchProducts();
  }, []);

  /* ── render ──────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-white dark:bg-dark text-black dark:text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center tracking-wider uppercase">
          Дэлгүүр
        </h1>

        {status && <p className="text-red-500 mb-4 text-center">{status}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((p) => {
            const finalPrice = p.saleActive ? p.salePrice : p.price;

            return (
              <Link
                key={p._id}
                href={`/shop/${p._id}`}
                className="group relative rounded-lg overflow-hidden border border-gray-200 bg-white dark:bg-black
                           hover:shadow-lg hover:shadow-[#1D9BF0]/30 hover:-translate-y-1 hover:scale-[1.01]
                           transition-transform duration-300 flex flex-col"
              >
                {/* thumbnail */}
                {p.imageUrl ? (
                  <div className="relative w-full aspect-square overflow-hidden bg-white dark:bg-black">
                    <img
                      src={`https://www.vone.mn/${p.imageUrl}`}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:opacity-90 group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-[#222] flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* details */}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="text-lg font-semibold uppercase tracking-wide mb-1 line-clamp-1">
                    {p.name}
                  </h2>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {p.description}
                  </p>

                  {p.saleActive ? (
                    <div className="mt-auto space-y-1">
                      <p className="text-sm text-gray-500 line-through">
                        {p.price.toLocaleString("mn-MN")}₮
                      </p>
                      <p className="text-lg font-bold text-red-500">
                        {p.salePrice.toLocaleString("mn-MN")}₮
                      </p>
                    </div>
                  ) : (
                    <p className="mt-auto text-lg font-bold text-black dark:text-white">
                      {finalPrice.toLocaleString("mn-MN")}₮
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
