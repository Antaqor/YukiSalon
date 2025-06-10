"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Member {
  _id: string;
  username: string;
  subscriptionExpiresAt?: string;
}

const BACKEND_URL = "https://www.vone.mn/api";

export default function MembersDashboard() {
  // keep logout around so we can boot expired sessions
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    } else if (user.username !== "Antaqor") {
      router.push("/");
    }
  }, [user, router, loading]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users`);
        const data = await res.json();
        setMembers(data);
      } catch {
        setStatus("Алдаа!");
      }
    };
    fetchMembers();
  }, []);

  const extendMembership = async (memberId: string) => {
    try {
      if (!user?.accessToken) {
        setStatus("Нэвтрэх шаардлагатай.");
        router.push("/login");
        return;
      }

      setStatus("Updating...");
      const res = await fetch(
        `${BACKEND_URL}/users/${memberId}/subscription`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({}), // tweak payload if your API needs more
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMembers(prev =>
          prev.map(m =>
            m._id === memberId
              ? { ...m, subscriptionExpiresAt: data.subscriptionExpiresAt }
              : m
          )
        );
        setStatus("Шинэчлэгдлээ! Удахгүй newsfeed рүү шилжинэ...");
        setTimeout(() => router.push("/"), 1500);
      } else if (res.status === 401 || res.status === 403) {
        logout();
        setStatus("Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.");
        router.push("/login");
      } else {
        setStatus(data.error || "Алдаа!");
      }
    } catch {
      setStatus("Алдаа!");
    }
  };

  return (
    <main className="min-h-screen bg-black text-gray-100 p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Гишүүдийн Менежмент
        </h1>
        {status && <p className="text-center text-red-400">{status}</p>}

        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Expires</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id} className="border-t border-gray-700">
                <td className="p-2">{m.username}</td>
                <td className="p-2">
                  {m.subscriptionExpiresAt
                    ? new Date(m.subscriptionExpiresAt).toLocaleDateString()
                    : "None"}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => extendMembership(m._id)}
                    className="px-2 py-1 bg-blue-600 rounded text-white"
                  >
                    Extend 30d
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
