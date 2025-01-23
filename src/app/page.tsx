"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import "swiper/css";

/* -------------------------------------------
   1) Interfaces
------------------------------------------- */
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
interface Salon {
    _id: string;
    name: string;
    location: string;
    logo?: string;
    coverImage?: string;
    categoryName?: string;
}
interface SearchParams {
    term?: string;
    categoryId?: string;
}

/* -------------------------------------------
   2) Skeleton / Loading
------------------------------------------- */
function CategorySkeletonRow() {
    return (
        <div className="flex flex-wrap justify-center gap-4 mb-6">
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
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-6">
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

/* -------------------------------------------
   3) Hero Section
------------------------------------------- */
function HeroImage() {
    return (
        <section className="relative w-full h-[500px] sm:h-[750px] overflow-hidden bg-black p-0 m-0">
            <img
                src="https://dsifg2gm0y83d.cloudfront.net/bundles/assets/images/refresh_hero.0fa0a3d07b8945c9b73e.png"
                alt="Hero"
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
        </section>
    );
}

/* -------------------------------------------
   4) Categories Carousel
------------------------------------------- */
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
        <section className="mt-6 mb-6 px-4">
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
                    return (
                        <SwiperSlide key={cat._id}>
                            <button
                                onClick={() =>
                                    setSelectedCategoryId(isSelected ? null : cat._id)
                                }
                                className={`
                  w-full h-14 flex items-center justify-center px-4 py-2 
                  rounded-md border font-medium transition-colors
                  text-sm sm:text-sm
                  ${
                                    isSelected
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }
                `}
                            >
                                <span>{cat.name}</span>
                            </button>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}

/* -------------------------------------------
   5) All Services Carousel
------------------------------------------- */
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
            <section className="px-4 mb-6">
                <h2 className="text-sm sm:text-sm font-semibold mb-4">Бүх үйлчилгээ</h2>
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
                                            ? ` (${svc.reviewCount} сэтгэгдэл)`
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

/* -------------------------------------------
   6) Import and Use AllSalonsCarousel
------------------------------------------- */
import AllSalonsCarousel from "../app/components/AllSalonsCarousel";

/* -------------------------------------------
   7) HomePage Component
------------------------------------------- */
const BASE_URL = "https://backend.foru.mn";

export default function HomePage() {
    // States for categories/services
    const [categories, setCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
        null
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // States for salons
    const [salons, setSalons] = useState<Salon[]>([]);
    const [salonsLoading, setSalonsLoading] = useState(true);
    const [salonsError, setSalonsError] = useState("");

    // 1) Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError("");
                const catRes = await axios.get<Category[]>(`${BASE_URL}/api/categories`);
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

                const res = await axios.get<Service[]>(`${BASE_URL}/api/search`, {
                    params,
                });
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

    // 3) Fetch Salons (For the "AllSalonsCarousel")
    useEffect(() => {
        const fetchSalons = async () => {
            try {
                setSalonsLoading(true);
                setSalonsError("");
                const res = await axios.get<Salon[]>(`${BASE_URL}/api/salons`);
                setSalons(res.data);
            } catch (err) {
                console.error("Error fetching salons:", err);
                setSalonsError("Салоны мэдээлэл ачаалж чадсангүй.");
            } finally {
                setSalonsLoading(false);
            }
        };
        fetchSalons();
    }, []);

    return (
        <main
            className="
        w-full font-sans bg-white p-0 m-0
        pb-[80px] /* Enough bottom padding for BottomNav */
      "
        >
            {/* Hero Image */}
            <HeroImage />

            {/* Search Bar Section */}
            <div className="px-4 mt-6">
                <label
                    htmlFor="serviceSearch"
                    className="block mb-2 text-m sm:text-sm font-semibold text-gray-700"
                >
                    Хайлт
                </label>
                <input
                    id="serviceSearch"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Жишээ: 'үс', 'сахал'..."
                    className="
            w-full
            rounded
            border border-gray-300
            py-3 px-4
            text-sm sm:text-base
            focus:outline-none focus:border-gray-700
            transition-colors
          "
                />
            </div>

            {/* Categories Carousel */}
            <CategoriesCarousel
                categories={categories}
                loading={loading}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
            />

            {/* Error Messages for Services */}
            {error && (
                <p className="text-red-600 mb-6 px-4 text-center text-sm sm:text-base font-medium">
                    {error}
                </p>
            )}

            {/* All Services Carousel */}
            <AllServicesCarousel services={services} loading={loading} error={error} />

            {/* All Salons Carousel */}
            <AllSalonsCarousel
                salons={salons}
                loading={salonsLoading}
                error={salonsError}
            />
        </main>
    );
}
