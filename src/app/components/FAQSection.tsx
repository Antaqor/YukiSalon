"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItemProps {
    question: string;
    answer: string;
    isActive: boolean;
    onClick: () => void;
}

const SingleFAQItem: React.FC<FAQItemProps> = ({
                                                   question,
                                                   answer,
                                                   isActive,
                                                   onClick,
                                               }) => {
    return (
        <div
            onClick={onClick}
            className="border-b border-gray-200 dark:border-black cursor-pointer py-4 hover:bg-gray-50 dark:hover:bg-black transition"
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">
                    {question}
                </h3>
                <motion.span
                    animate={{ rotate: isActive ? 45 : 0 }}
                    className="text-gray-500 dark:text-white text-xl"
                >
                    +
                </motion.span>
            </div>
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pt-3 text-sm md:text-base text-gray-700 dark:text-white"
                    >
                        {answer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const faqItems = [
        {
            question: "Нэг цэгийн шийдэл",
            answer:
                "Дотоодын бүх төрлийн бизнес, үйлчилгээ, байгууллагууд руу хэрэглэгчдийг шууд холбож, цаг хугацаа, нөөцийг хэмнэх экосистем бүрдүүлнэ.",
        },
        {
            question: "Контентийн чанар дэмжих",
            answer:
                "Чанартай, хэрэгцээтэй, сүүлийн үеийн мэдээллүүд, эерэг агуулгыг нэн тэргүүнд байршуулж, хэрэглэгчдэд бодит ашиг, мэдлэг, урам зориг өгөх пост контент дэмжих.",
        },
        {
            question: "Хувийн мэдээлэл, аюулгүй байдал",
            answer:
                "Хэрэглэгчийн өгөгдлийг найдвартай хамгаалж, AI шүүлтийг чангатган, хэрэглэгч өөрийнхөө дата эзэн байх зөв зохистой ашиглах тал дээр дэмжлэг үзүүлнэ.",
        },
        {
            question: "Бүтээлч харилцааг дэмжих",
            answer:
                "Бүтээлч санаачилга, эерэг хандлага, бүтээлч контент, үйлдлийг урамшуулах дэмжих систем.",
        },
        {
            question: "Бизнес, байгууллагын контент",
            answer:
                "Баталгаажсан брэнд, бизнесүүд бүтээгдэхүүн, үйлчилгээгээ сурталчлахдаа (Sponsored, Promoted) шошго ашиглаж, ёс зүйтэй маркетингийн дүрмийг баримтална.",
        },
        {
            question: "AI ба автомат дэмжлэг",
            answer:
                "Таны датаг хиймэл оюун (AI), машин сургалтын технологи, ашиглан үр бүтээмжэй цохицуулалт явуулах.",
        },
    ];

    const handleToggle = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="w-full bg-white dark:bg-black py-14 px-4">
            {/* Title & Subtitle */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto mb-10 text-center"
            >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    VONE SOCIAL
                </h2>
                <p className="text-gray-500 text-sm md:text-base">
                    Илүү дэлгэрэнгүй мэдээллийг доороос аваарай
                </p>
            </motion.div>

            {/* FAQ Items */}
            <div className="max-w-2xl mx-auto space-y-4">
                {faqItems.map((item, index) => (
                    <SingleFAQItem
                        key={index}
                        question={item.question}
                        answer={item.answer}
                        isActive={activeIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default FAQSection;
