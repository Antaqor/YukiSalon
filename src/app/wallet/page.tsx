"use client";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function WalletPage() {
  const { loggedIn } = useAuth();

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>You must log in to view your wallet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-xl">Balance: 0 VNT</p>
      </div>
    </div>
  );
}
