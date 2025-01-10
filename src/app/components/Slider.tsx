// components/Slider.tsx

"use client"; // Ensure this component is rendered on the client side

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // Correct import path for v10

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";

interface SliderProps {
    images: string[]; // Array of image URLs
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    return (
        <div className="w-full max-w-4xl mx-auto"> {/* Center the slider and set a max width */}
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop
                className="rounded-lg overflow-hidden"
            >
                {images.map((src, index) => (
                    <SwiperSlide key={index}>
                        {/* Using Next.js Image for optimization */}
                        <Image
                            src={src}
                            alt={`Slide ${index + 1}`}
                            width={1200} // Adjust based on your design
                            height={600} // Adjust based on your design
                            className="object-cover w-full h-full"
                            priority={index === 0} // Preload the first image
                        />
                        {/* If not using Next.js Image, use img tag:
            <img src={src} alt={`Slide ${index + 1}`} className="object-cover w-full h-full" />
            */}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Slider;