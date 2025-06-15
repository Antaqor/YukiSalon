"use client";

import { useRouter } from "next/navigation";
import PostInput from "../components/PostInput";

export default function NewPostPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-start justify-center p-4">
      <div className="w-full max-w-xl">
        <PostInput onPost={() => router.push("/")} />
      </div>
    </div>
  );
}
