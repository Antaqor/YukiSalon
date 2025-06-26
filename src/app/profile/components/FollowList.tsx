"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../lib/config";
import { getImageUrl } from "../../lib/getImageUrl";
import { FaCheckCircle } from "react-icons/fa";

interface UserItem {
  _id: string;
  username: string;
  profilePicture?: string;
  subscriptionExpiresAt?: string;
  location?: string;
}

interface Props {
  userId: string;
  type: "followers" | "following";
}

export default function FollowList({ userId, type }: Props) {
  const { user: viewer, login } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchList = async () => {
      try {
        const { data: owner } = await axios.get(`${BASE_URL}/api/auth/user/${userId}`);
        const ids: string[] = owner[type] || [];
        if (ids.length === 0) {
          setUsers([]);
        } else {
          const { data } = await axios.get(`${BASE_URL}/api/users/list?ids=${ids.join(",")}`);
          setUsers(data);
        }
      } catch (err: any) {
        console.error("Follow list error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to load list");
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [userId, type]);

  const handleFollow = async (targetId: string) => {
    if (!viewer?.accessToken) return;
    try {
      await axios.post(
        `${BASE_URL}/api/users/${targetId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
      );
      login({ ...viewer, following: [...(viewer.following || []), targetId] }, viewer.accessToken!);
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!viewer?.accessToken) return;
    try {
      await axios.post(
        `${BASE_URL}/api/users/${targetId}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${viewer.accessToken}` } }
      );
      login(
        { ...viewer, following: (viewer.following || []).filter((id) => id !== targetId) },
        viewer.accessToken!
      );
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      (u.location || "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="p-4 text-center">Loading...</div>
    );
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full px-3 py-2 rounded bg-[#1e1e1e] text-sm focus:outline-none"
        />
      </div>
      {filtered.map((u) => {
        const isVerified = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt) > new Date() : false;
        const isFollowing = viewer?.following?.includes(u._id);
        return (
          <div key={u._id} className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              {u.profilePicture ? (
                <Image src={getImageUrl(u.profilePicture)} alt="avatar" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-base truncate">{u.username}</p>
                  {isVerified && <FaCheckCircle className="text-yellow-400 w-3 h-3" />}
                </div>
                <p className="text-sm text-gray-400 truncate">@{u.username.toLowerCase()}</p>
                {u.location && (
                  <p className="text-sm text-gray-400 truncate">{u.location}</p>
                )}
              </div>
            </div>
            {viewer && viewer._id !== u._id && (
              isFollowing ? (
                <button onClick={() => handleUnfollow(u._id)} className="text-sm px-4 py-1 rounded border border-brand text-brand">
                  Following
                </button>
              ) : (
                <button onClick={() => handleFollow(u._id)} className="text-sm px-4 py-1 rounded border border-brand text-brand">
                  Follow
                </button>
              )
            )}
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="p-4 text-center text-gray-400">No users found.</div>
      )}
    </div>
  );
}
