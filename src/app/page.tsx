"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { IconType } from "react-icons";
import { FaCut, FaSpa, FaBroom, FaUserNinja } from "react-icons/fa";

/* === Swiper Imports (v10+ / v11+) === */
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";

/* === Swiper Styles === */
import "swiper/css";

/* === Interfaces === */
interface Category {
    _id: string;
    name: string;
    subServices: string[];
}

interface SalonRef {
    _id: string;
    name: string;
}

interface Service {
    _id: string;
    name: string;
    price: number;
    durationMinutes: number;
    salon?: SalonRef;
    category?: string | { _id: string };
    averageRating?: number;
    reviewCount?: number;
}

interface SearchParams {
    term?: string;
    categoryId?: string;
}

/* === Icons for Categories === */
const categoryIcons: Record<string, IconType> = {
    Hair: FaCut,
    Barber: FaUserNinja,
    Nail: FaSpa,
    Beauty: FaBroom,
};

/* =========================================================================
   1) Skeleton Components
   ========================================================================= */
function CategorySkeletonRow() {
    return (
        <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"
                />
            ))}
        </div>
    );
}

function ServiceSkeletonGrid() {
    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <li
                    key={i}
                    className="bg-white p-4 rounded-md shadow-sm animate-pulse flex flex-col gap-2"
                >
                    <div className="h-4 bg-gray-200 w-2/3 rounded" />
                    <div className="h-3 bg-gray-200 w-1/2 rounded" />
                    <div className="h-3 bg-gray-200 w-1/3 rounded" />
                </li>
            ))}
        </ul>
    );
}

/* =========================================================================
   2) Hero Slider
   ========================================================================= */
function HeroSlider() {
    const slides = [
        { id: 1, text: "Banner / Slide 1", bg: "bg-gray-300" },
        { id: 2, text: "Banner / Slide 2", bg: "bg-gray-400" },
        { id: 3, text: "Banner / Slide 3", bg: "bg-gray-500" },
    ];

    return (
        <section className="mb-8">
            <Swiper
                modules={[Autoplay, Mousewheel]}
                slidesPerView={1.1}
                spaceBetween={16}
                loop={true}
                speed={1000}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                mousewheel={{ forceToAxis: true }}
                pagination={false}
                navigation={false}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div
                            className={`relative h-48 sm:h-64 md:h-72 flex items-center justify-center ${slide.bg} rounded-md`}
                        >
                            {/*
                Text:
                - mobile: text-base (16px)
                - sm: text-lg (18px)
                - md: text-xl (20px)
              */}
                            <p className="text-base sm:text-lg md:text-xl font-semibold text-black">
                                {slide.text}
                            </p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

/* =========================================================================
   3) CategoriesCarousel
   ========================================================================= */
interface CategoriesCarouselProps {
    categories: Category[];
    loading: boolean;
    selectedCategoryId: string | null;
    setSelectedCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
}

function CategoriesCarousel({
                                categories,
                                loading,
                                selectedCategoryId,
                                setSelectedCategoryId,
                            }: CategoriesCarouselProps) {
    if (loading) {
        return <CategorySkeletonRow />;
    }

    if (!loading && categories.length === 0) {
        return (
            <p className="text-gray-500 text-center mb-8">
                Ямар нэг категори олдсонгүй.
            </p>
        );
    }

    return (
        <section className="mb-8">
            <Swiper
                modules={[Mousewheel]}
                slidesPerView={2.2}
                spaceBetween={12}
                mousewheel={{ forceToAxis: true }}
                speed={600}
                breakpoints={{
                    480: { slidesPerView: 2.5 },
                    640: { slidesPerView: 3.2 },
                    768: { slidesPerView: 3.5 },
                    1024: { slidesPerView: 4.2 },
                }}
                pagination={false}
                navigation={false}
            >
                {categories.map((cat) => {
                    const isSelected = selectedCategoryId === cat._id;
                    const Icon = categoryIcons[cat.name] || null;

                    return (
                        <SwiperSlide key={cat._id}>
                            <button
                                onClick={() =>
                                    setSelectedCategoryId(isSelected ? null : cat._id)
                                }
                                className={`
                  w-full h-14 flex items-center justify-center px-4 py-2 
                  rounded-md border font-medium transition-colors
                  text-sm sm:text-base
                  ${
                                    isSelected
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }
                `}
                            >
                                {Icon && <Icon className="mr-1 text-base" />}
                                <span>{cat.name}</span>
                            </button>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}

/* =========================================================================
   4) Featured Services Carousel
   ========================================================================= */
interface ServicesCarouselProps {
    services: Service[];
    loading: boolean;
    error: string;
}

function ServicesCarousel({ services, loading, error }: ServicesCarouselProps) {
    // Show nothing if loading, error, or empty
    if (loading || error || services.length === 0) return null;

    return (
        <section className="mb-8">
            {/*
        Title:
        - mobile: text-xl (20px)
        - sm: text-2xl (24px)
      */}
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                Онцлох үйлчилгээ
            </h2>
            <Swiper
                modules={[Mousewheel]}
                slidesPerView={1.2}
                spaceBetween={16}
                speed={700}
                mousewheel={{ forceToAxis: true }}
                breakpoints={{
                    640: { slidesPerView: 1.5 },
                    768: { slidesPerView: 2.2 },
                    1024: { slidesPerView: 2.8 },
                }}
                pagination={false}
                navigation={false}
            >
                {services.map((svc) => {
                    const salonId = svc.salon?._id;
                    const targetHref = salonId ? `/salons/${salonId}` : "#";

                    return (
                        <SwiperSlide key={svc._id}>
                            <Link
                                href={targetHref}
                                className="block bg-white rounded-md shadow-sm border p-4 hover:shadow-md transition"
                            >
                                {/*
                  Service Title:
                  - mobile: text-sm (14px)
                  - sm: text-base (16px)
                */}
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                                    {svc.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                    {svc.salon ? svc.salon.name : "No salon"}
                                </p>
                                <p className="text-sm sm:text-base text-gray-700">
                                    Үнэ: {svc.price.toLocaleString()}₮
                                </p>
                                <p className="text-sm sm:text-base text-gray-700">
                                    Үргэлжлэх хугацаа: {svc.durationMinutes} мин
                                </p>
                                <div className="mt-1 text-xs sm:text-sm text-yellow-700">
                                    Үнэлгээ:{" "}
                                    {svc.averageRating && svc.averageRating > 0
                                        ? `${svc.averageRating.toFixed(1)} ★`
                                        : "N/A"}
                                    {svc.reviewCount && svc.reviewCount > 0
                                        ? ` (${svc.reviewCount} сэтгэгдэл${
                                            svc.reviewCount > 1 ? "" : ""
                                        })`
                                        : ""}
                                </div>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}

/* =========================================================================
   5) All Services Carousel
   ========================================================================= */
interface AllServicesCarouselProps {
    services: Service[];
    loading: boolean;
    error: string;
}

function AllServicesCarousel({
                                 services,
                                 loading,
                                 error,
                             }: AllServicesCarouselProps) {
    if (loading && !error) {
        return <ServiceSkeletonGrid />;
    }

    if (!loading && !error && services.length === 0) {
        return (
            <p className="text-gray-500 text-center mt-6">
                Ямар нэг үйлчилгээ олдсонгүй.
            </p>
        );
    }

    if (!loading && !error && services.length > 0) {
        return (
            <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                    Бүх үйлчилгээ
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
                    {services.map((svc) => {
                        const salonId = svc.salon?._id;
                        const targetHref = salonId ? `/salons/${salonId}` : "#";

                        return (
                            <SwiperSlide key={svc._id}>
                                <Link
                                    href={targetHref}
                                    className="block bg-white p-4 rounded-md shadow-sm border transition hover:shadow-lg"
                                >
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                                        {svc.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                        {svc.salon ? svc.salon.name : "No salon"}
                                    </p>
                                    <p className="text-sm sm:text-base text-gray-700">
                                        Үнэ: {svc.price.toLocaleString()}₮
                                    </p>
                                    <p className="text-sm sm:text-base text-gray-700">
                                        Үргэлжлэх хугацаа: {svc.durationMinutes} мин
                                    </p>
                                    <div className="mt-1 text-xs sm:text-sm text-yellow-700">
                                        Үнэлгээ:{" "}
                                        {svc.averageRating && svc.averageRating > 0
                                            ? `${svc.averageRating.toFixed(1)} ★`
                                            : "N/A"}
                                        {svc.reviewCount && svc.reviewCount > 0
                                            ? ` (${svc.reviewCount} сэтгэгдэл${
                                                svc.reviewCount > 1 ? "" : ""
                                            })`
                                            : ""}
                                    </div>
                                </Link>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </section>
        );
    }

    return null;
}

/* =========================================================================
   6) Main HomePage Component
   ========================================================================= */
export default function HomePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // 1) Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");
                const catRes = await axios.get<Category[]>(
                    "http://152.42.243.146/api/categories"
                );
                const sorted = catRes.data.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(sorted);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Категори ачаалж чадсангүй.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // 2) Fetch / Search Services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError("");

                const params: SearchParams = {};
                if (searchTerm) params.term = searchTerm;
                if (selectedCategoryId) params.categoryId = selectedCategoryId;

                const res = await axios.get<Service[]>(
                    "http://152.42.243.146/api/search",
                    { params }
                );
                setServices(res.data);
            } catch (err) {
                console.error("Error searching services:", err);
                setError("Үйлчилгээ хайлт амжилтгүй.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [searchTerm, selectedCategoryId]);

    return (
        <main className="max-w-6xl mx-auto px-4 py-10 font-sans bg-white">
            {/* 1) Hero Slider */}
            <HeroSlider />

            {/* 2) Search Bar */}
            <div className="max-w-lg mx-auto mb-8">
                <label
                    htmlFor="serviceSearch"
                    className="block mb-2 text-sm sm:text-base font-semibold text-gray-700"
                >
                    Хайлт
                </label>
                <input
                    id="serviceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Жишээ: 'үс', 'сахал'..."
                    className="w-full rounded border border-gray-300 py-3 px-4 text-sm sm:text-base focus:outline-none focus:border-gray-700 transition-colors"
                />
            </div>

            {/* 3) Categories Carousel */}
            <CategoriesCarousel
                categories={categories}
                loading={loading}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
            />

            {/* 4) Error Messages */}
            {error && (
                <p className="text-red-600 mb-8 text-center text-sm sm:text-base font-medium">
                    {error}
                </p>
            )}

            {/* 5) Featured Services Carousel */}
            <ServicesCarousel services={services} loading={loading} error={error} />

            {/* 6) All Services Carousel */}
            <AllServicesCarousel services={services} loading={loading} error={error} />
        </main>
    );
}
