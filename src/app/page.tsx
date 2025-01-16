"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ====== Additional Imports from First Snippet ======
import {
    CalendarIcon,
    ClockIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    PhoneIcon,
} from "@heroicons/react/24/outline";

// ====== Swiper (Categories/Services) ======
import { Swiper, SwiperSlide } from "swiper/react";
import {  Mousewheel } from "swiper/modules";
import "swiper/css";

// ====== Icons for Categories ======
import { IconType } from "react-icons";
import { FaCut, FaSpa, FaBroom, FaUserNinja } from "react-icons/fa";

/* =========================================================================
   (A) First Snippet: "OrdersPage" Code
   ========================================================================= */

function OrdersSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="h-6 w-48 bg-gray-200 rounded" />
            <ul className="space-y-3">
                <li className="h-20 w-full bg-gray-200 rounded" />
                <li className="h-20 w-full bg-gray-200 rounded" />
                <li className="h-20 w-full bg-gray-200 rounded" />
            </ul>
        </div>
    );
}

interface UserData {
    username: string;
    phoneNumber?: string;
}

interface ServiceData {
    name: string;
}

interface AppointmentData {
    _id: string;
    date: string;            // e.g. "2025-01-15T00:00:00.000Z"
    startTime: string;       // e.g. "14:30"
    createdAt?: string;      // e.g. "2025-01-10T12:00:00.000Z"
    service?: ServiceData;
    user?: UserData;
    classification?: string; // We'll add this on the client side
}

/**
 * Renders the “owner/appointments” view.
 */
function OwnerAppointments() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [appointments, setAppointments] = useState<AppointmentData[]>([]);
    const [error, setError] = useState("");
    const [loadingData, setLoadingData] = useState(true);

    // If user is not authenticated, redirect to login
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Fetch & sort appointments by createdAt, then classify
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                if (session?.user?.accessToken && session.user.role === "owner") {
                    const token = session.user.accessToken;

                    // 1) Fetch appointments
                    const res = await axios.get<AppointmentData[]>(
                        "http://68.183.191.149/api/appointments",
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    // 2) Sort: newest (most recently created) first
                    const sortedByCreatedAt = [...res.data].sort((a, b) => {
                        const bCreated = b.createdAt
                            ? new Date(b.createdAt).getTime()
                            : 0;
                        const aCreated = a.createdAt
                            ? new Date(a.createdAt).getTime()
                            : 0;
                        return bCreated - aCreated;
                    });

                    // 3) Classify each appointment
                    const now = Date.now();
                    const MS_IN_24H = 24 * 60 * 60 * 1000;

                    const classified = sortedByCreatedAt.map((appt) => {
                        // Construct a Date for the scheduled time
                        const fullDate = new Date(appt.date);
                        const [hr, min] = appt.startTime.split(":").map(Number);
                        fullDate.setHours(hr, min, 0, 0);

                        // Compare scheduled time to now
                        const diff = fullDate.getTime() - now;

                        let classification = "upcoming";
                        if (diff < 0) {
                            classification = "past";
                        } else if (diff < MS_IN_24H) {
                            classification = "soon";
                        }

                        return { ...appt, classification };
                    });

                    setAppointments(classified);
                }
            } catch (err) {
                console.error("Error loading appointments:", err);
                setError("Захиалгын мэдээллийг ачаалж чадсангүй.");
            } finally {
                setLoadingData(false);
            }
        };

        if (session?.user?.accessToken && session.user.role === "owner") {
            fetchAppointments();
        }
    }, [session]);

    if (status === "loading") {
        return <p className="p-4 text-sm text-gray-700">Сессийн мэдээллийг ачаалж байна...</p>;
    }

    if (!session?.user || session.user.role !== "owner") {
        return (
            <p className="p-4 text-sm text-red-600">
                Энэ хуудсыг харах эрхгүй байна. Та эзэн байх шаардлагатай.
            </p>
        );
    }

    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
                {loadingData ? (
                    <OrdersSkeleton />
                ) : (
                    <section className="space-y-6">
                        {error && <p className="text-red-600 mb-4">{error}</p>}

                        {appointments.length === 0 ? (
                            <p className="text-sm text-neutral-500">
                                Одоогоор цаг авсан захиалга алга байна.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {appointments.map((appt) => {
                                    const displayDate = new Date(appt.date).toLocaleDateString("en-CA");

                                    return (
                                        <li
                                            key={appt._id}
                                            className="border border-neutral-200 p-4 rounded bg-white hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col gap-2 text-sm text-neutral-700">
                                                <p className="flex items-center gap-1">
                                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Огноо:</strong>{" "}
                                                    {displayDate}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <ClockIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Цаг:</strong>{" "}
                                                    {appt.startTime}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <ClipboardDocumentListIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Үйлчилгээ:</strong>{" "}
                                                    {appt.service?.name || "—"}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <UserIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Хэрэглэгч:</strong>{" "}
                                                    {appt.user?.username || "—"}
                                                </p>
                                                <p className="flex items-center gap-1">
                                                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                                                    <strong className="text-neutral-800">Утас:</strong>{" "}
                                                    {appt.user?.phoneNumber || "—"}
                                                </p>
                                                <p className="text-xs text-gray-500 italic">
                                                    Classification: {appt.classification}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

/* =========================================================================
   (B) Second Snippet: "HomePage" Code
   ========================================================================= */

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

const categoryIcons: Record<string, IconType> = {
    Hair: FaCut,
    Barber: FaUserNinja,
    Nail: FaSpa,
    Beauty: FaBroom,
};

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

function HomePage() {
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
                    "http://68.183.191.149/api/categories"
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
                    "http://68.183.191.149/api/search",
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
            {/* 1) Search Bar */}
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

            {/* 2) Categories Carousel */}
            <CategoriesCarousel
                categories={categories}
                loading={loading}
                selectedCategoryId={selectedCategoryId}
                setSelectedCategoryId={setSelectedCategoryId}
            />

            {/* 3) Error Messages */}
            {error && (
                <p className="text-red-600 mb-8 text-center text-sm sm:text-base font-medium">
                    {error}
                </p>
            )}

            {/* 4) Featured Services Carousel */}
            <ServicesCarousel services={services} loading={loading} error={error} />

            {/* 5) All Services Carousel */}
            <AllServicesCarousel services={services} loading={loading} error={error} />
        </main>
    );
}

/* =========================================================================
   (C) The Blended Page: Conditionally Render
   ========================================================================= */

export default function BlendedPage() {
    const { data: session } = useSession();

    // If authenticated user is "owner", show the Orders page; otherwise show the Homepage
    if (session?.user?.role === "owner") {
        return <OwnerAppointments />;
    }

    // For guests or other roles => show the homepage
    return <HomePage />;
}