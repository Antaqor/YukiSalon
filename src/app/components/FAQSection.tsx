"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqItems = [
        {
            question: "Бүрэн контентыг хэрхэн үзэх вэ?",
            answer: "Нэвтэрснээр бүх агуулгад хязгааргүй нэвтрэх эрхтэй болно. Мөн гишүүнчлэлд нэгдсэн тохиолдолд онцгой контентуудыг үзэх боломжтой."
        },
        {
            question: "Хэрэглэгчийн эрхүүд",
            answer: "Та нэвтэрснээр хүссэн контентоо хадгалах, жагсаалтад нэмэх, үнэлгээ өгөх болон хувийн тохиргоо хийх боломжтой."
        },
        {
            question: "Гишүүнчлэлийн тухай",
            answer: "Нэгдсэн гишүүн нь бүх төхөөрөмж дээрээс синхрончлогдсон профиль үүсгэх, premium контентыг үзэх эрхтэй болно."
        }
    ];

    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                    Түгээмэл асуултууд
                </h2>

                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className="border rounded-lg overflow-hidden shadow-sm"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800 font-medium">
                                        {item.question}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: activeIndex === index ? 45 : 0 }}
                                        className="text-gray-600 text-xl"
                                    >
                                        +
                                    </motion.span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-6 bg-white"
                                    >
                                        <p className="py-4 text-gray-600 leading-relaxed border-t">
                                            {item.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center space-y-6"
                >
                    <div className="text-gray-900 space-y-2">
                        <p className="text-xl font-medium">
                            Нэвтрээд контентыг бүрэн үзээрэй!
                        </p>
                        <p className="text-gray-600">
                            Бүртгэлтэй хэрэглэгчид илүү олон боломжтой
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button className="bg-gray-900 text-white px-6 py-2.5 rounded-md hover:bg-gray-800 transition-colors">
                            Нэвтрэх
                        </button>
                        <button className="border-2 border-gray-900 text-gray-900 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                            Бүртгүүлэх
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default FAQSection;