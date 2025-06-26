"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import FollowList from "../../components/FollowList";

export default function FollowersPage() {
  const params = useParams();
  const userId = params.id as string;
  return (
    <div className="min-h-screen bg-backgroundDark text-white">
      <div className="sticky top-0 z-10 bg-backgroundDark border-b border-white/10 flex">
        <Link
          href={`/profile/${userId}/followers`}
          className="flex-1 py-3 text-center font-semibold border-b-2 border-brand"
        >
          Followers
        </Link>
        <Link
          href={`/profile/${userId}/following`}
          className="flex-1 py-3 text-center hover:text-brand"
        >
          Following
        </Link>
      </div>
      <FollowList userId={userId} type="followers" />
    </div>
  );
}
