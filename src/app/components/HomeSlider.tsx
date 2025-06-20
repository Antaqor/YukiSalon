"use client";
import Image from "next/image";
export default function HomeSlider() {
  return (
    <div className="mb-6">
      <div className="h-60 md:h-72 flex items-center justify-center rounded-lg overflow-hidden bg-gray-900">
        <Image
          src="/vercel.svg"
          alt="Hero"
          width={500}
          height={240}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
