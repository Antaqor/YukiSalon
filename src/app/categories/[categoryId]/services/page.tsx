// =====================================================================
// 2) CATEGORY SERVICES PAGE (app/categories/[categoryId]/services/page.tsx)
//    - Lists services under the chosen category
//    - When user clicks a service, they can see details / book time slots
// =====================================================================
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Service {
    _id: string;
    name: string;
    price: number;
    durationMinutes: number;
    salon?: {
        _id: string;
        name: string;
    };
}

export default function CategoryServicesPage() {
    const params = useParams() as { categoryId?: string };
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params.categoryId) return;
        (async () => {
            try {
                const res = await axios.get(
                    `http://68.183.191.149/api/categories/${params.categoryId}/services`
                );
                setServices(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load category services.");
            } finally {
                setLoading(false);
            }
        })();
    }, [params.categoryId]);

    if (loading) return <p className="p-4">Loading services...</p>;
    if (error) return <p className="p-4 text-red-600">{error}</p>;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Services in this Category</h1>
            {services.length === 0 && <p>No services found in this category.</p>}
            <ul className="space-y-4">
                {services.map((svc) => (
                    <li
                        key={svc._id}
                        className="border p-4 rounded flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{svc.name}</p>
                            <p className="text-gray-600">
                                ${svc.price} - {svc.durationMinutes} min
                            </p>
                            {svc.salon && (
                                <p className="text-sm text-gray-400">
                                    Available at <strong>{svc.salon.name}</strong>
                                </p>
                            )}
                        </div>
                        {/* Link to the service detail page to see time blocks */}
                        <Link
                            href={`/services/${svc._id}`}
                            className="bg-black text-white px-4 py-2 rounded"
                        >
                            Book
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}