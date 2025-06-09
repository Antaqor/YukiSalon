"use client";
import React, { useEffect, useState, useRef, FormEvent } from "react";

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    saleActive: boolean;
    salePrice: number;
}

const BACKEND_URL = "https://www.vone.mn/api";

export default function ProductDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [status, setStatus] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [saleActive, setSaleActive] = useState(false);
    const [salePrice, setSalePrice] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const imageRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/products`);
                if (!res.ok) throw new Error("Failed to fetch products");
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error(err);
                setStatus("Бараа татаж чадсангүй!");
            }
        };
        fetchProducts();
    }, []);

    const handleCreateProduct = async (e: FormEvent) => {
        e.preventDefault();
        setStatus("");
        if (!name.trim()) {
            setStatus("Барааны нэр оруулна уу!");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price || "0");
            formData.append("saleActive", saleActive.toString());
            formData.append("salePrice", salePrice || "0");
            if (imageFile) formData.append("image", imageFile);
            const res = await fetch(`${BACKEND_URL}/products`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Create product failed");
            const newProduct = await res.json();
            setName("");
            setDescription("");
            setPrice("");
            setSaleActive(false);
            setSalePrice("");
            setImageFile(null);
            if (imageRef.current) imageRef.current.value = "";
            setProducts((prev) => [newProduct, ...prev]);
            setStatus("Бараа амжилттай нэмлээ!");
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа!");
        }
    };

    const handleUpdateProduct = async (id: string, updated: Partial<Product>) => {
        try {
            const res = await fetch(`${BACKEND_URL}/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            if (!res.ok) throw new Error("Update fail");
            const up = await res.json();
            setProducts((prev) => prev.map((p) => (p._id === id ? up : p)));
            setStatus("Шинэчлэгдлээ!");
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа!");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/products/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Delete fail");
            setProducts((prev) => prev.filter((p) => p._id !== id));
            setStatus("Устгагдлаа!");
        } catch (err) {
            console.error(err);
            setStatus("Алдаа гарлаа!");
        }
    };

    return (
        <main className="min-h-screen bg-black text-gray-100 px-4 py-8">
            <div className="max-w-5xl mx-auto space-y-10">
                <h1 className="text-3xl font-bold mb-2 text-center uppercase tracking-wider">
                    Барааны Админ Самбар
                </h1>
                {status && <p className="text-center text-red-400 mb-4">{status}</p>}

                <section className="bg-[#16181C] border border-gray-700 p-4 rounded space-y-4">
                    <h2 className="text-xl font-semibold">Бараа нэмэх</h2>
                    <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div>
                                <label className="block mb-1">Нэр</label>
                                <input
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Жишээ: T-Shirt"
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Тайлбар</label>
                                <textarea
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Барааны танилцуулга"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <label className="block mb-1">Үнэ (₮)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-800 p-2 rounded"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <label>Хямдрал?</label>
                                <input
                                    type="checkbox"
                                    checked={saleActive}
                                    onChange={(e) => setSaleActive(e.target.checked)}
                                />
                                <label>Sale Price:</label>
                                <input
                                    type="number"
                                    className="bg-gray-800 p-2 rounded w-24"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Зураг (optional)</label>
                                <input
                                    ref={imageRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                                    }}
                                    className="text-white"
                                />
                            </div>
                            <div>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded mt-2">
                                    Нэмэх
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Одоогийн бараанууд</h2>
                    <div className="space-y-3">
                        {products.map((p) => (
                            <ProductRow key={p._id} product={p} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

function ProductRow({ product, onUpdate, onDelete }: {
    product: Product;
    onUpdate: (id: string, updated: Partial<Product>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}) {
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price);
    const [saleActive, setSaleActive] = useState(product.saleActive);
    const [salePrice, setSalePrice] = useState(product.salePrice);
    return (
        <div className="bg-[#16181C] border border-gray-700 p-4 rounded flex flex-col md:flex-row gap-4 items-start">
            <div className="w-24 h-24 bg-[#222] flex-shrink-0 overflow-hidden">
                {product.imageUrl ? (
                    <img src={`https://www.vone.mn/${product.imageUrl}`} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <label className="text-sm text-gray-300">Нэр</label>
                    <input className="w-full bg-gray-800 p-1 rounded" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="col-span-1">
                    <label className="text-sm text-gray-300">Үнэ (₮)</label>
                    <input type="number" className="w-full bg-gray-800 p-1 rounded" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                    <label className="text-sm text-gray-300">Тайлбар</label>
                    <textarea className="w-full bg-gray-800 p-1 rounded" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                    <label className="text-sm text-gray-300">Хямдрал?</label>
                    <input type="checkbox" checked={saleActive} onChange={(e) => setSaleActive(e.target.checked)} />
                    <label className="text-sm text-gray-300">Sale Price:</label>
                    <input type="number" className="bg-gray-800 p-1 rounded w-20" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} />
                </div>
            </div>
            <div className="flex flex-col gap-2 justify-center">
                <button onClick={() => onUpdate(product._id, { name, description, price, saleActive, salePrice })} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500">
                    Шинэчлэх
                </button>
                <button onClick={() => onDelete(product._id)} className="px-3 py-1 bg-red-600 rounded hover:bg-red-500">
                    Устгах
                </button>
            </div>
        </div>
    );
}
