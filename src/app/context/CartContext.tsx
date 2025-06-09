"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    saleActive: boolean;
    salePrice: number;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (p: Product) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartState>({
    items: [],
    addItem: () => {},
    removeItem: () => {},
    clearCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("cart");
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch {
                /* ignore */
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product: Product) => {
        setItems((prev) => {
            const existing = prev.find((c) => c.product._id === product._id);
            if (existing) {
                return prev.map((c) =>
                    c.product._id === product._id
                        ? { ...c, quantity: c.quantity + 1 }
                        : c
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((c) => c.product._id !== id));
    };

    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
