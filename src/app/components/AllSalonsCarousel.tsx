"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";

/* -------------------------------------------
   1) Types & Interfaces
------------------------------------------- */
interface Salon {
    _id: string;
    name: string;
    location: string;
    logo?: string;
    coverImage?: string;
    categoryName?: string;
}

interface AllSalonsCarouselProps {
    salons: Salon[];
    loading: boolean;
    error: string;
}

/* -------------------------------------------
   2) Skeleton & Loading States
------------------------------------------- */
function SalonSkeletonGrid() {
    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <li
                    key={i}
                    className="bg-white p-4 rounded-md shadow-sm animate-pulse flex flex-col gap-2"
                >
                    <div className="h-20 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 w-2/3 rounded" />
                    <div className="h-3 bg-gray-200 w-1/2 rounded" />
                    <div className="h-3 bg-gray-200 w-1/3 rounded" />
                </li>
            ))}
        </ul>
    );
}

/* -------------------------------------------
   3) All Salons Carousel
------------------------------------------- */
export default function AllSalonsCarousel({
                                              salons,
                                              loading,
                                              error,
                                          }: AllSalonsCarouselProps) {
    // 1) Loading => Skeleton Grid
    if (loading && !error) {
        return <SalonSkeletonGrid />;
    }

    // 2) Error => Display a message
    if (error) {
        return (
            <p className="text-red-600 mb-6 px-4 text-center text-sm sm:text-base font-medium">
                {error}
            </p>
        );
    }

    // 3) No salons => Display a message
    if (!loading && !error && salons.length === 0) {
        return (
            <p className="text-gray-500 text-center mt-6">
                Ямар нэг салон олдсонгүй.
            </p>
        );
    }

    // 4) Render the carousel if we have salons
    if (!loading && !error && salons.length > 0) {
        return (
            <section className="px-4 mb-6">
                <h2 className="text-sm sm:text-base font-semibold mb-4">
                    Бүх салонууд
                </h2>
                <Swiper
                    modules={[Mousewheel]}
                    slidesPerView={1.2}
                    spaceBetween={16}
                    speed={700}
                    mousewheel={{ forceToAxis: true }}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        768: { slidesPerView: 2.5 },
                        1024: { slidesPerView: 3.2 },
                        1280: { slidesPerView: 3.5 },
                    }}
                    pagination={false}
                    navigation={false}
                >
                    {salons.map((salon) => {
                        const firstLetter = salon.name.trim().charAt(0).toUpperCase();

                        // Build the link to go to the salon details page
                        const href = `/salons/${salon._id}`;

                        return (
                            <SwiperSlide key={salon._id}>
                                <Link
                                    href={href}
                                    className="block bg-white p-4 rounded-md shadow-sm border transition hover:shadow-lg"
                                >
                                    {/* Cover Image or Fallback */}
                                    {salon.coverImage ? (
                                        <img
                                            src={salon.coverImage}
                                            alt={salon.name}
                                            className="w-full h-32 object-cover mb-3 bg-gray-200 rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-32 mb-3 bg-gray-200 rounded" />
                                    )}

                                    {/* Logo or First Letter */}
                                    <div className="flex items-center gap-3 mb-2">
                                        {salon.logo ? (
                                            <img
                                                src={salon.logo}
                                                alt={`${salon.name} Logo`}
                                                className="h-12 w-12 object-cover bg-gray-200 rounded"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 text-gray-800 flex items-center justify-center rounded font-bold text-lg">
                                                {firstLetter}
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                                                {salon.name}
                                            </h3>
                                            {salon.categoryName && (
                                                <p className="text-xs text-gray-500 italic">
                                                    {salon.categoryName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location or other info */}
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Байршил: {salon.location || "Мэдээлэл байхгүй"}
                                    </p>
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </section>
        );
    }

    // 5) If none of the above, return null
    return null;
}
