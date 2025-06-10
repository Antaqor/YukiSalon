'use client';
import { useAuth } from '../context/AuthContext';

export default function WalletBalance({ label = 'Wallet:' }: { label?: string }) {
  const { user } = useAuth();
  return <div className="p-4 font-semibold">{label} {user?.vntBalance ?? 0} VNT</div>;
}
