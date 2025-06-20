"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { BASE_URL } from "../lib/config";

interface Member {
  _id: string;
  username: string;
  profilePicture?: string;
  rating?: number;
}


export default function TopActiveMembers() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get<Member[]>(`${BASE_URL}/api/users`);
        const sorted = res.data
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3);
        setMembers(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, [BASE_URL]);

  return (
    <div className="p-4 transition-shadow duration-200 hover:shadow-md">
      <h2 className="flex items-center font-semibold mb-3">
        <UserIcon className="w-5 h-5 mr-2 text-brandCyan" />
        Top Members
      </h2>
      <ul className="space-y-2 text-sm">
        {members.map((m) => (
          <li key={m._id} className="flex items-center gap-2">
            {m.profilePicture ? (
              <Image
                src={`${BASE_URL}${m.profilePicture}`}
                alt={m.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-brandCyan"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 border border-brandCyan" />
            )}
            <span className="truncate">{m.username}</span>
            <span className="ml-auto text-xs text-gray-500">{m.rating || 0}pt</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
