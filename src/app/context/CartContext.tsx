"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

/* ── types ─────────────────────────────────────────── */
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
  addItem: (p: Product) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
}

/* ── context setup ─────────────────────────────────── */
const CartContext = createContext<CartState>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
});

/* ── provider ──────────────────────────────────────── */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* Auth & API */
  const { user, loggedIn } = useAuth();
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://www.vone.mn/api";

  /* ── initial load ────────────────────────────────── */
  useEffect(() => {
    const loadCart = async () => {
      if (loggedIn) {
        try {
          const res = await fetch(`${BACKEND_URL}/cart`, {
            headers: { Authorization: `Bearer ${user?.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setItems(
              data.items.map((i: any) => ({
                product: i.product,
                quantity: i.quantity,
              })),
            );
            return;
          }
        } catch {
          /* ignore */
        }
      }

      /* guest fallback */
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch {
          /* ignore bad JSON */
        }
      }
    };

    loadCart();
  }, [loggedIn]); // fires on mount + login/logout flip

  /* ── persist guest cart ──────────────────────────── */
  useEffect(() => {
    if (!loggedIn) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, loggedIn]);

  /* ── actions ─────────────────────────────────────── */
  const addItem = async (product: Product) => {
    if (loggedIn) {
      try {
        const res = await fetch(`${BACKEND_URL}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.accessToken}`,
          },
          body: JSON.stringify({ productId: product._id }),
        });
        if (res.ok) {
          const data = await res.json();
          setItems(
            data.items.map((i: any) => ({
              product: i.product,
              quantity: i.quantity,
            })),
          );
          return;
        }
      } catch {
        /* ignore */
      }
    }

    /* guest cart update */
    setItems((prev) => {
      const existing = prev.find((c) => c.product._id === product._id);
      if (existing) {
        return prev.map((c) =>
          c.product._id === product._id
            ? { ...c, quantity: c.quantity + 1 }
            : c,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = async (id: string) => {
    if (loggedIn) {
      try {
        const res = await fetch(`${BACKEND_URL}/cart/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setItems(
            data.items.map((i: any) => ({
              product: i.product,
              quantity: i.quantity,
            })),
          );
          return;
        }
      } catch {
        /* ignore */
      }
    }

    setItems((prev) => prev.filter((c) => c.product._id !== id));
  };

  const clearCart = async () => {
    if (loggedIn) {
      try {
        await fetch(`${BACKEND_URL}/cart`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.accessToken}` },
        });
      } catch {
        /* ignore */
      }
    }
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

/* ── hook ──────────────────────────────────────────── */
export function useCart() {
  return useContext(CartContext);
}
