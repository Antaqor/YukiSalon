"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Member {
  _id: string;
  username: string;
  phoneNumber: string;
  birthday?: { year: number };
  hasTransferred?: boolean;
  vntBalance?: number;
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

  const updateVnt = (id: string, amount: number) => {
    setMembers(prev => prev.map(m => (m._id === id ? { ...m, vntBalance: amount } : m)));
  };

  return (
    <main className="min-h-screen bg-white text-black p-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Гишүүдийн Менежмент
        </h1>
        {status && <p className="text-center text-red-400">{status}</p>}

        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Age</th>
              <th className="p-2">Expires</th>
              <th className="p-2">VNT</th>
              <th className="p-2">Transferred</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <MemberRow key={m._id} member={m} onExtend={extendMembership} onVntChange={updateVnt} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function MemberRow({
  member,
  onExtend,
  onVntChange,
}: {
  member: Member;
  onExtend: (id: string) => void;
  onVntChange: (id: string, amount: number) => void;
}) {
  const { user } = useAuth();
  const [vnt, setVnt] = useState(member.vntBalance ?? 0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const saveVnt = async () => {
    if (!user?.accessToken) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/users/${member._id}/vnt`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({ amount: vnt }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      onVntChange(member._id, vnt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const deleteUser = async () => {
    if (!user?.accessToken) return;
    if (!confirm("Delete this user?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/${member._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      window.location.reload();
    } catch (err) {
      alert((err as any).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-t border-gray-700">
      <td className="p-2">{member.username}</td>
      <td className="p-2">{member.phoneNumber}</td>
      <td className="p-2">
        {member.birthday?.year ? new Date().getFullYear() - member.birthday.year : "-"}
      </td>
      <td className="p-2">
        {member.subscriptionExpiresAt
          ? new Date(member.subscriptionExpiresAt).toLocaleDateString()
          : "None"}
      </td>
      <td className="p-2">
        <input
          type="number"
          value={vnt}
          onChange={(e) => setVnt(Number(e.target.value))}
          className="w-20 bg-gray-800 p-1 rounded"
        />
        <button
          onClick={saveVnt}
          className="ml-1 px-2 py-1 bg-green-600 rounded"
          disabled={saving}
        >
          {saving ? "..." : "Save"}
        </button>
        {error && <span className="text-red-400 ml-2">{error}</span>}
      </td>
      <td className="p-2">{member.hasTransferred ? "✅" : ""}</td>
      <td className="p-2 space-x-2">
        <button
          onClick={() => onExtend(member._id)}
          className="px-2 py-1 bg-blue-600 rounded text-white"
        >
          Extend 30d
        </button>
        <button
          onClick={deleteUser}
          disabled={deleting}
          className="px-2 py-1 bg-red-600 rounded text-white"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}
