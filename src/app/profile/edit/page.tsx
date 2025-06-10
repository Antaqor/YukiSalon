"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      setProfilePreview(user.profilePicture ? `https://www.vone.mn${user.profilePicture}` : null);
      setCoverPreview(user.coverImage ? `https://www.vone.mn${user.coverImage}` : null);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.accessToken) return;
    const formData = new FormData();
    if (profileFile) formData.append("profilePicture", profileFile);
    if (coverFile) formData.append("coverImage", coverFile);
    try {
      const res = await fetch("https://www.vone.mn/api/users/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.accessToken}` },
        body: formData,
      });
      if (res.ok) {
        setStatus("Updated!");
        router.push("/profile");
      } else {
        const data = await res.json();
        setStatus(data.error || "Error");
      }
    } catch {
      setStatus("Error");
    }
  };

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-xl font-bold mb-4">Edit Profile</h1>
      {status && <p className="mb-2 text-red-500">{status}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Profile Picture</label>
          {profilePreview && (
            <img src={profilePreview} alt="Profile preview" className="w-24 h-24 object-cover rounded-full mb-2" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setProfileFile(file);
              if (file) {
                setProfilePreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>
        <div>
          <label className="block mb-1">Cover Image</label>
          {coverPreview && (
            <img src={coverPreview} alt="Cover preview" className="w-full h-40 object-cover rounded mb-2" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setCoverFile(file);
              if (file) {
                setCoverPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </form>
    </main>
  );
}
