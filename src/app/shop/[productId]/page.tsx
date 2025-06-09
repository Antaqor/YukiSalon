"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Product } from "../../context/CartContext";
import AddToCartButton from "../../components/AddToCartButton";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.productId as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [status, setStatus] = useState("");
    const BACKEND_URL = "https://www.vone.mn/api";

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/products/${productId}`);
                if (!res.ok) throw new Error("Failed to fetch product");
                const data = await res.json();
                setProduct(data);
            } catch (error) {
                console.error(error);
                setStatus("Бараа дуудахад алдаа гарлаа!");
            }
        };
        if (productId) fetchProduct();
    }, [productId]);

    if (!product) {
        return (
            <div className="min-h-screen bg-white text-black p-8">
                <p className="text-center text-red-500">{status || "Уншиж байна..."}</p>
            </div>
        );
    }

    const finalPrice = product.saleActive ? product.salePrice : product.price;

    return (
        <main className="min-h-screen bg-white text-black py-8 px-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/2 bg-[#16181C] rounded flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={`https://www.vone.mn/${product.imageUrl}`}
                            alt={product.name}
                            className="object-cover w-full h-auto hover:scale-[1.01] transition duration-300"
                        />
                    ) : (
                        <p className="text-gray-500 p-4">No image available</p>
                    )}
                </div>
                <div className="flex-1 flex flex-col space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold uppercase tracking-wide">{product.name}</h1>
                    </div>
                    <div className="text-sm text-black leading-relaxed">
                        <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider text-[#1D9BF0]">
                            Танилцуулга
                        </h2>
                        <p>{product.description}</p>
                    </div>
                    <div className="border-t border-gray-700 pt-4 space-y-2">
                        {product.saleActive ? (
                            <div>
                                <p className="text-md text-gray-500 line-through">
                                    {product.price.toLocaleString("mn-MN")}₮
                                </p>
                                <p className="text-2xl font-bold text-red-500">
                                    Хямдралтай: {product.salePrice.toLocaleString("mn-MN")}₮
                                </p>
                            </div>
                        ) : (
                            <p className="text-xl font-bold text-black">
                                Үнэ: {finalPrice.toLocaleString("mn-MN")}₮
                            </p>
                        )}
                        <div>
                            <AddToCartButton product={product} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
